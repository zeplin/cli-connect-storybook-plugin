import urlJoin from "proper-url-join";
import { toId } from "@storybook/csf";

interface ParamsWithStoryId {
    storyId: string;
    hasDocsPage?: boolean;
}

interface ParamsWithKindAndStory {
    selectedKind: string;
    selectedStory?: string;
}

interface StoryHyperlinkOptions {
    format?: "old" | "new";
    useDocsPage?: boolean;
}

type StoryHyperlinkParams = ParamsWithStoryId | ParamsWithKindAndStory;

function isParamsWithKindAndStory(params: StoryHyperlinkParams): params is ParamsWithKindAndStory {
    return "selectedKind" in params;
}

function toStoryId(params: ParamsWithKindAndStory): string {
    const { selectedKind, selectedStory } = params;
    if (selectedStory) {
        return toId(selectedKind, selectedStory);
    }

    return toId(selectedKind, "placeholder").replace("placeholder", "*");
}

function toLegacyQuery(params: ParamsWithKindAndStory): { [key: string]: string } {
    const { selectedKind, selectedStory } = params;

    return selectedStory ? { selectedKind, selectedStory } : { selectedKind };
}

function shouldUseTrailingSlash(url: string): boolean {
    try {
        const path = new URL(url).pathname;

        // Trailing slash is required if the Storybook is hosted under a path but if
        // BaseUrl just points to the iframe.html or index.html, trailing slash should not exist
        return !(/\.\w+$/.test(path));
    } catch (e) {
        return false;
    }
}

function createStoryHyperlink(
    baseUrl: string,
    params: StoryHyperlinkParams,
    options: StoryHyperlinkOptions = { format: "old", useDocsPage: false }
): string {
    let url: string;

    const trailingSlash = shouldUseTrailingSlash(baseUrl);

    if (isParamsWithKindAndStory(params) && options.format === "new") {
        url = urlJoin(baseUrl, {
            trailingSlash,
            query: { path: `/story/${toStoryId(params)}` },
            queryOptions: { encode: false }
        });
    } else if (isParamsWithKindAndStory(params)) {
        url = urlJoin(baseUrl, {
            trailingSlash,
            query: toLegacyQuery(params)
        });
    } else {
        const { storyId } = params;

        // Docs hyperlinks somehow cause error if iframe.html is accessed directly
        // To workaround this /story/ is enforced even if a docs page exist
        const viewMode = params.hasDocsPage && options.useDocsPage && !baseUrl.endsWith("iframe.html")
            ? "docs"
            : "story";

        url = urlJoin(baseUrl, {
            trailingSlash,
            query: { path: `/${viewMode}/${storyId}` },
            queryOptions: { encode: false }
        });
    }

    return url;
}

export {
    StoryHyperlinkParams,
    StoryHyperlinkOptions,
    createStoryHyperlink
};