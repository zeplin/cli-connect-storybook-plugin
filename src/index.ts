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
import { createStoryHyperlink } from "./util/create-hyperlink";
import { name, version } from "../package.json";
import { getLogger, setLogger } from "./util/logger";
import { toId } from "@storybook/csf";

const IFRAME_PATH = "iframe.html";

const DEFAULT_SOURCE_URL = "http://localhost:6006";

interface StorybookPluginConfig {
    url?: string;
    fetchStories?: boolean;
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
    getLogger().info(`Detected Storybook at ${url}`);
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

type StorySummary = Pick<Story, "storyId" | "kind" | "name" | "hasDocsPage">

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
            fetchStories = true,
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

        setLogger(pluginContext.logger);
        const logger = getLogger();

        if (!fetchStories) {
            logger.info("Fetching stories from Storybook instance is disabled.");
            return;
        }

        if (!startScript && !command) {
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
            } catch (e) {
                logger.debug(e.stack);
                logger.info("Could not load stories from Storybook.");

                if (failFastOnErrors) {
                    logger.debug("Fast fail is enabled. Aborting…");
                    throw new Error("Could not load stories from Storybook.");
                }
            } finally {
                sbProcess?.kill();
            }
        }

        if (this.storiesLoaded()) {
            logger.info(`Loaded ${this.stories.length} stories from Storybook.`);
        }
    }

    private getStoriesFromStorybook(componentFilePath: string): StorySummary[] {
        const componentNameFromFilePath = getComponentNameFromFilePath(componentFilePath);
        return this.stories.filter(story => {
            const {
                displayName: storyDisplayName,
                component,
                filePath: storyFilePath
            } = story;
            return isPathsEqual(componentFilePath, component.filePath) ||
                isPathsEqual(componentFilePath, storyFilePath) ||
                component.name === componentNameFromFilePath ||
                storyDisplayName === componentNameFromFilePath;
        });
    }

    private getStoriesFromComponentConfig({
        kind,
        stories
    }: StorybookComponentConfig): StorySummary[] {
        if (!kind) {
            return [];
        }
        if (!stories) {
            return this.stories.filter(story => story.kind === kind);
        }
        if (this.storiesLoaded()) {
            return stories.reduce(
                (acc, storyName) => {
                    const foundStory = this.stories.find(story => story.kind === kind && story.name === storyName);
                    if (foundStory) {
                        acc.push(foundStory);
                    }
                    return acc;
                },
                [] as StorySummary[]
            );
        }
        return stories.map(storyName => ({
            storyId: toId(kind, storyName),
            kind,
            name: storyName,
            hasDocsPage: this.useDocsPage || false
        }));
    }

    process(componentConfig: ComponentConfig): Promise<ComponentData> {
        const selectedStories: StorySummary[] = [];

        if (this.storiesLoaded()) {
            selectedStories.push(...this.getStoriesFromStorybook(componentConfig.path));
        }

        const storybookConfig = componentConfig.storybook as StorybookComponentConfig || {};

        selectedStories.push(...this.getStoriesFromComponentConfig(storybookConfig));

        const links = selectedStories.map(story => this.createLink(story));
        return Promise.resolve({ links });
    }

    supports(x: ComponentConfig): boolean {
        return this.storiesLoaded() || !!x.storybook;
    }

    private storiesLoaded(): boolean {
        return this.stories.length > 0;
    }

    private createLink({ storyId, name: storyName, kind, hasDocsPage }: StorySummary): Link {
        return {
            type: LinkType.storybook,
            url: createStoryHyperlink(
                this.targetUrl,
                {
                    storyId,
                    selectedStory: storyName,
                    selectedKind: kind,
                    hasDocsPage
                },
                {
                    format: this.config.format,
                    useDocsPage: this.useDocsPage
                }
            )
        };
    }
}
