import { createStoryHyperlink } from "../src/util/create-hyperlink";

const BASE_URL = "http://localhost:9009";
const BASE_URL_WITH_TRAILING_SLASH = "http://localhost:9009/";
const BASE_URL_WITH_IFRAME = "http://localhost:9009/iframe.html";
const BASE_URL_PATH = "http://localhost:9009/hello";
const BASE_URL_PATH_WITH_TRAILING_SLASH = "http://localhost:9009/hello/";

const STORY_ID = "something-kind--story-hello-there";
const SELECTED_KIND = "something/kind";
const SELECTED_STORY = "story/hello*there!";

describe("createStoryHyperlink", () => {
    describe.each(
        [BASE_URL, BASE_URL_WITH_TRAILING_SLASH, BASE_URL_PATH, BASE_URL_PATH_WITH_TRAILING_SLASH, BASE_URL_WITH_IFRAME]
    )(
        "with base url %s",
        (baseUrl: string) => {
            it("returns Storybook v5+ hyperlink if storyId is provided", () => {
                const hyperlink = createStoryHyperlink(
                    baseUrl,
                    { storyId: STORY_ID, selectedStory: SELECTED_STORY, selectedKind: SELECTED_KIND }
                );

                expect(hyperlink).toMatchSnapshot();
            });

            it("returns Storybook v5+ docs hyperlink if storyId is provided and has docs page", () => {
                const hyperlink = createStoryHyperlink(
                    baseUrl,
                    {
                        storyId: STORY_ID,
                        selectedKind: SELECTED_KIND,
                        selectedStory: SELECTED_STORY,
                        hasDocsPage: true
                    },
                    { useDocsPage: true }
                );

                expect(hyperlink).toMatchSnapshot();
            });

            it("returns Storybook v5+ docs hyperlink if storyId is provided and has docs page but useDocsPage is falsy", () => {
                const hyperlink = createStoryHyperlink(
                    baseUrl,
                    {
                        storyId: STORY_ID,
                        selectedKind: SELECTED_KIND,
                        selectedStory: SELECTED_STORY,
                        hasDocsPage: true
                    }
                );

                const hyperlink2 = createStoryHyperlink(
                    baseUrl,
                    {
                        storyId: STORY_ID,
                        selectedKind: SELECTED_KIND,
                        selectedStory: SELECTED_STORY,
                        hasDocsPage: true
                    },
                    { useDocsPage: false }
                );

                expect(hyperlink).toMatchSnapshot();
                expect(hyperlink2).toMatchSnapshot();
            });

            it("returns Storybook v4 hyperlink if format is old", () => {
                const hyperlink = createStoryHyperlink(
                    baseUrl,
                    {
                        storyId: STORY_ID,
                        selectedKind: SELECTED_KIND,
                        selectedStory: SELECTED_STORY,
                        hasDocsPage: false
                    },
                    {
                        format: "old"
                    });

                expect(hyperlink).toMatchSnapshot();
            });
        }
    );
});
