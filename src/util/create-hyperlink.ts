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

    if (isParamsWithKindAndStory(params) && options.format === "new") {
        url = urlJoin(baseUrl, {
            trailingSlash: true,
            query: { path: `/story/${toStoryId(params)}` },
            queryOptions: { encode: false }
        });
    } else if (isParamsWithKindAndStory(params)) {
        url = urlJoin(baseUrl, {
            trailingSlash: true,
            query: toLegacyQuery(params)
        });
    } else {
        const { storyId } = params;

        const viewMode = params.hasDocsPage ? "docs" : "story";

        url = urlJoin(baseUrl, {
            trailingSlash: true,
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