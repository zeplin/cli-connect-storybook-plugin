import {
    ConnectPlugin, ComponentConfig, ComponentData, PluginContext, Link, LinkType
} from "@zeplin/cli";
import { dedent } from "ts-dedent";
import path from "path";
import urljoin from "url-join";
import { loadStoriesFromURL, Story } from "./storybook/stories";
import { startApp, checkResponse } from "./storybook/start-app";

const IFRAME_PATH = "iframe.html";

const checkStorybook = async (url: string, { errorMessage }: { errorMessage: string }): Promise<void> => {
    if (!(await checkResponse(url))) {
        throw new Error(dedent`
            No Storybook server responding at ${url}
            ${errorMessage}
        `);
    }
    console.log(`Detected Storybook at ${url}`);
};

export default class implements ConnectPlugin {
    stories: Story[] = [];
    storybookVersion?: string;
    targetUrl = "";

    async init(pluginContext: PluginContext): Promise<void> {
        const url = pluginContext.config?.url as string;

        if (!url) {
            throw new Error(`No Storybook URL is given, please set url parameter on Storybook plugin configuration.`);
        } else {
            const startScript = pluginContext.config?.startScript as string;
            const command = pluginContext.config?.command as string;

            const sourceUrl = url.endsWith(IFRAME_PATH) ? url : urljoin(url, IFRAME_PATH);

            this.targetUrl = url.endsWith(IFRAME_PATH)
                ? url.substring(0, url.lastIndexOf(IFRAME_PATH))
                : url;

            if (!startScript && !command) {
                await checkStorybook(sourceUrl, { errorMessage: "Make sure you've started it and it is accessible." });
                this.stories = await loadStoriesFromURL(sourceUrl);
            } else {
                const sbProcess = await startApp({
                    args: ["--ci"],
                    scriptName: startScript,
                    commandName: command,
                    url: sourceUrl,
                    inheritStdio: false
                });

                await checkStorybook(sourceUrl, {
                    errorMessage:
                        "Make sure url parameter targets the instance started by startScript or command."
                });

                this.stories = await loadStoriesFromURL(sourceUrl);

                sbProcess?.kill();
            }
        }

        if (this.storiesLoaded()) {
            console.log(`Loaded ${this.stories.length} stories from Storybook.`);
        }
    }

    process(componentConfig: ComponentConfig): Promise<ComponentData> {
        const links: Link[] = [];

        if (this.storiesLoaded()) {
            const matchedStory = this.stories.find(story => {
                const {
                    displayName: storyDisplayName,
                    componentName,
                    filePath
                } = story;

                const componentFileName = path.basename(componentConfig.path, path.extname(componentConfig.path));

                return componentConfig.path === filePath ||
                    componentName === componentFileName ||
                    storyDisplayName === componentFileName;
            });

            if (matchedStory) {
                links.push(this.createLink(matchedStory.kind, matchedStory.name));
            }
        }

        const sbManualConf = componentConfig.storybook;
        if (sbManualConf && sbManualConf.kind) {
            if (sbManualConf.stories && sbManualConf.stories.length > 0) {
                sbManualConf.stories.forEach(s => {
                    links.push(this.createLink(sbManualConf.kind, s));
                });
            } else {
                links.push(this.createLink(sbManualConf.kind));
            }
        }
        return Promise.resolve({ links });
    }

    supports(x: ComponentConfig): boolean {
        return this.storiesLoaded() || !!x.storybook;
    }

    private storiesLoaded(): boolean {
        return this.stories.length > 0;
    }

    private createLink(kind: string, name?: string): Link {
        const urlEncodedKind = encodeURIComponent(kind);

        let preparedUrl;
        if (name) {
            const urlEncodedName = encodeURIComponent(name);
            preparedUrl = urljoin(this.targetUrl, `?selectedKind=${urlEncodedKind}&selectedStory=${urlEncodedName}`);
        } else {
            preparedUrl = urljoin(this.targetUrl, `?selectedKind=${urlEncodedKind}`);
        }

        return { type: LinkType.storybook, url: preparedUrl };
    }
}
