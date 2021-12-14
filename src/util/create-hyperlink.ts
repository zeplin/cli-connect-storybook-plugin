import urlJoin from "proper-url-join";

interface StoryHyperlinkParams {
    storyId: string;
    selectedKind: string;
    selectedStory: string;
    hasDocsPage?: boolean;
}

interface StoryHyperlinkOptions {
    format?: "old" | "new";
    useDocsPage?: boolean;
}

function toLegacyQuery({ selectedKind, selectedStory }: StoryHyperlinkParams): { [k:string]: string } {
    return { selectedKind, selectedStory };
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
    { format = "new", useDocsPage = false }: StoryHyperlinkOptions = { }
): string {
    const trailingSlash = shouldUseTrailingSlash(baseUrl);

    if (format === "old") {
        return urlJoin(
            baseUrl,
            {
                trailingSlash,
                query: toLegacyQuery(params)
            }
        );
    }

    // Docs hyperlinks somehow cause error if iframe.html is accessed directly
    // To workaround this /story/ is enforced even if a docs page exist
    const viewMode = params.hasDocsPage && useDocsPage && !baseUrl.endsWith("iframe.html")
        ? "docs"
        : "story";

    return urlJoin(baseUrl, {
        trailingSlash,
        query: { path: `/${viewMode}/${params.storyId}` },
        queryOptions: { encode: false }
    });
}

export {
    createStoryHyperlink
};
