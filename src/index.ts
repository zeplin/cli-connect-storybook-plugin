import {
    ConnectPlugin, ComponentConfig, ComponentData, PluginContext, Link, LinkType
} from "@zeplin/cli";
import { dedent } from "ts-dedent";
import path from "path";
import urlJoin from "proper-url-join";
import { loadStoriesFromURL, Story } from "./storybook/stories";
import { startApp, checkResponse } from "./storybook/start-app";
import { createStorybookUrl, StorybookLinkParams } from "./util/create-url";

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

const isPathsEqual = (path1: string, path2: string): boolean =>
    path.normalize(path1) === path.normalize(path2);

const getComponentNameFromFilePath = (filePath: string): string => {
    let componentName = null;

    const filename = path.basename(filePath, path.extname(filePath));
    if (filename === "index") {
        const parts = path.dirname(filePath).split(path.sep);
        componentName = parts[parts.length - 1];
    } else {
        componentName = filename;
    }

    return componentName.charAt(0)
        .toUpperCase()
        .concat(componentName.slice(1))
        .replace(/-([a-z])/, (_, match) => match.toUpperCase());
};

export default class implements ConnectPlugin {
    stories: Story[] = [];
    targetUrl = "";

    async init(pluginContext: PluginContext): Promise<void> {
        const url = pluginContext.config?.url as string;

        if (!url) {
            throw new Error(`No Storybook URL is given, please set url parameter on Storybook plugin configuration.`);
        } else {
            const startScript = pluginContext.config?.startScript as string;
            const command = pluginContext.config?.command as string;

            const sourceUrl = url.endsWith(IFRAME_PATH) ? url : urlJoin(url, IFRAME_PATH);

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
                    component,
                    filePath: storyFilePath
                } = story;

                const componentNameFromFilePath = getComponentNameFromFilePath(componentConfig.path);

                return isPathsEqual(componentConfig.path, component.filePath) ||
                    isPathsEqual(componentConfig.path, storyFilePath) ||
                    component.name === componentNameFromFilePath ||
                    storyDisplayName === componentNameFromFilePath;
            });

            if (matchedStory) {
                const { storyId, hasDocsPage } = matchedStory;
                links.push(this.createLink({ storyId, hasDocsPage }));
            }
        }

        const { kind: selectedKind, stories } = componentConfig.storybook || {};
        if (selectedKind) {
            if (stories && stories.length > 0) {
                stories.forEach(selectedStory => {
                    links.push(this.createLink({ selectedKind, selectedStory }));
                });
            } else {
                links.push(this.createLink({ selectedKind }));
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

    private createLink(params: StorybookLinkParams): Link {
        return {
            type: LinkType.storybook,
            url: createStorybookUrl(this.targetUrl, params)
        };
    }
}