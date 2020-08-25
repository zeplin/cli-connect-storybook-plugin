import {
    ConnectPlugin, ComponentConfig, ComponentData, PluginContext, Link, LinkType
} from "@zeplin/cli";
import { dedent } from "ts-dedent";
import path from "path";
import urlJoin from "proper-url-join";
// eslint-disable-next-line import/default
import updateNotifier from "update-notifier";
import { loadStoriesFromURL, Story } from "./storybook/stories";
import { startApp, checkResponse } from "./storybook/start-app";
import { createStoryHyperlink, StoryHyperlinkParams, StoryHyperlinkOptions } from "./util/create-hyperlink";
import { name, version } from "../package.json";

const IFRAME_PATH = "iframe.html";

const DEFAULT_SOURCE_URL = "http://localhost:6006";

interface StorybookPluginConfig {
    url?: string;
    targetUrl?: string;
    startScript?: string;
    command?: string;
    format?: "old" | "new";
    useDocsPage?: boolean;
    failFastOnErrors?: boolean;
    ignoreSSLErrors?: boolean;
}

interface StorybookComponentConfig {
    kind: string;
    stories: string[];
}

updateNotifier({
    pkg: {
        name,
        version
    },
    updateCheckInterval: 0,
    shouldNotifyInNpmScript: true
}).notify();

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
    sourceUrl = "";
    config: StorybookPluginConfig = {};
    useDocsPage?: boolean;

    async init(pluginContext: PluginContext): Promise<void> {
        this.config = pluginContext.config as unknown as StorybookPluginConfig || {};

        const {
            url = DEFAULT_SOURCE_URL,
            targetUrl,
            startScript,
            command,
            useDocsPage,
            failFastOnErrors,
            ignoreSSLErrors
        } = this.config;

        this.sourceUrl = url.endsWith(IFRAME_PATH) ? url : urlJoin(url, IFRAME_PATH);
        this.targetUrl = targetUrl || url;
        this.useDocsPage = useDocsPage;

        if (!url && !startScript && !command) {
            throw new Error(`Missing Storybook configuration. `);
        } else if (!startScript && !command) {
            await checkStorybook(this.sourceUrl, { errorMessage: "Make sure you've started it and it is accessible." });
            this.stories = await loadStoriesFromURL(this.sourceUrl, { ignoreSSLErrors, failFastOnErrors });
        } else {
            const sbProcess = await startApp({
                args: ["--ci"],
                scriptName: startScript,
                commandName: command,
                url: this.sourceUrl,
                inheritStdio: false
            });

            await checkStorybook(this.sourceUrl, {
                errorMessage:
                    "Make sure url parameter targets the instance started by startScript or command."
            });

            try {
                this.stories = await loadStoriesFromURL(this.sourceUrl, { ignoreSSLErrors, failFastOnErrors });
            } finally {
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
            this.stories.filter(story => {
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
            }).forEach(matchedStory => {
                const { storyId, hasDocsPage } = matchedStory;
                links.push(this.createLink(
                    { storyId, hasDocsPage },
                    { useDocsPage: this.useDocsPage }
                ));
            });
        }

        const { kind: selectedKind, stories } = componentConfig.storybook as StorybookComponentConfig || {};
        const { format = "old" } = this.config;

        if (selectedKind) {
            if (stories && stories.length > 0) {
                stories.forEach(selectedStory => {
                    links.push(
                        this.createLink({ selectedKind, selectedStory }, { format })
                    );
                });
            } else {
                links.push(this.createLink({ selectedKind }, { format }));
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

    private createLink(params: StoryHyperlinkParams, options?: StoryHyperlinkOptions): Link {
        return {
            type: LinkType.storybook,
            url: createStoryHyperlink(this.targetUrl, params, options)
        };
    }
}