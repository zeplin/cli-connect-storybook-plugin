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
    format: "old" | "new";
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

function createStoryHyperlink(
    baseUrl: string,
    params: StoryHyperlinkParams,
    options: StoryHyperlinkOptions = { format: "old" }
): string {
    let url: string;

    // Trailing slash is required if the Storybook is hosted under a path but if
    // BaseUrl just points to the iframe.html inside Storybook, trailing slash should not exist
    const trailingSlash = !baseUrl.endsWith("iframe.html");

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

        // Docs hyperlinks somehow cause error if iframe is accessed directly
        // To workaround this /story/ is enforced even if a docs page exist
        const viewMode = params.hasDocsPage && !baseUrl.endsWith("iframe.html")
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