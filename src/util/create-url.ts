import urlJoin from "proper-url-join";

interface ParamsWithStoryId {
    storyId: string;
}

interface ParamsWithKindAndStory {
    selectedKind: string;
    selectedStory?: string;
}

type StorybookLinkParams = ParamsWithStoryId | ParamsWithKindAndStory;

function isV5(params: StorybookLinkParams): params is ParamsWithStoryId {
    return "storyId" in params;
}

function createStorybookUrl(baseUrl: string, params: StorybookLinkParams): string {
    let url: string;

    if (isV5(params)) {
        const { storyId } = params;

        url = urlJoin(baseUrl, {
            trailingSlash: true,
            query: { path: `/story/${storyId}` },
            queryOptions: { encode: false }
        });
    } else {
        const { selectedKind, selectedStory } = params;

        if (selectedStory) {
            url = urlJoin(baseUrl, {
                trailingSlash: true,
                query: { selectedKind, selectedStory },
                queryOptions: { encode: true }
            });
        } else {
            url = urlJoin(baseUrl, {
                trailingSlash: true,
                query: { selectedKind },
                queryOptions: { encode: true }
            });
        }
    }

    return url;
}

export {
    StorybookLinkParams,
    createStorybookUrl
};