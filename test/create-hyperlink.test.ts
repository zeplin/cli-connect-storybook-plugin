import { createStoryHyperlink } from "../src/util/create-hyperlink";

const BASE_URL = "http://localhost:9009";
const BASE_URL_WITH_TRAILING_SLASH = "http://localhost:9009/";
const BASE_URL_PATH = "http://localhost:9009/hello";
const BASE_URL_PATH_WITH_TRAILING_SLASH = "http://localhost:9009/hello/";

const STORY_ID = "something-kind--story-hello-there";
const SELECTED_KIND = "something/kind";
const SELECTED_STORY = "story/hello*there!";

const EXPECTED_V5_HYPERLINK = "http://localhost:9009/?path=/story/something-kind--story-hello-there";
const EXPECTED_V5_DOCS_HYPERLINK = "http://localhost:9009/?path=/docs/something-kind--story-hello-there";
const EXPECTED_V5_HYPERLINK_ONLY_KIND = "http://localhost:9009/?path=/story/something-kind--*";
const EXPECTED_V4_HYPERLINK_KIND = "http://localhost:9009/?selectedKind=something%2Fkind";
const EXPECTED_V4_HYPERLINK_KIND_STORY = "http://localhost:9009/?selectedKind=something%2Fkind&selectedStory=story%2Fhello%2Athere%21";

const EXPECTED_V5_HYPERLINK_PATH = "http://localhost:9009/hello/?path=/story/something-kind--story-hello-there";
const EXPECTED_V5_DOCS_HYPERLINK_PATH = "http://localhost:9009/hello/?path=/docs/something-kind--story-hello-there";
const EXPECTED_V4_HYPERLINK_PATH_KIND = "http://localhost:9009/hello/?selectedKind=something%2Fkind";
const EXPECTED_V4_HYPERLINK_PATH_KIND_STORY = "http://localhost:9009/hello/?selectedKind=something%2Fkind&selectedStory=story%2Fhello%2Athere%21";

describe("createStoryHyperlink", () => {
    let baseUrl = BASE_URL;

    it("returns Storybook v5+ hyperlink if storyId is provided", () => {
        const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID });

        expect(hyperlink).toBe(EXPECTED_V5_HYPERLINK);
    });

    it("returns Storybook v5+ docs hyperlink if storyId is provided and has docs page", () => {
        const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID, hasDocsPage: true });

        expect(hyperlink).toBe(EXPECTED_V5_DOCS_HYPERLINK);
    });

    it("returns Storybook v5+ hyperlink if both selectedKind and selectedStory is provided", () => {
        const hyperlink = createStoryHyperlink(
            baseUrl,
            { selectedKind: SELECTED_KIND, selectedStory: SELECTED_STORY },
            { format: "new" }
        );

        expect(hyperlink).toBe(EXPECTED_V5_HYPERLINK);
    });

    it("returns Storybook v5+ hyperlink if only selectedKind is provided", () => {
        const hyperlink = createStoryHyperlink(
            baseUrl,
            { selectedKind: SELECTED_KIND },
            { format: "new" }
        );

        expect(hyperlink).toBe(EXPECTED_V5_HYPERLINK_ONLY_KIND);
    });

    it("returns Storybook v4 hyperlink if only selectedKind is provided", () => {
        const hyperlink = createStoryHyperlink(baseUrl, { selectedKind: SELECTED_KIND });

        expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_KIND);
    });

    it("returns Storybook v4 hyperlink if both selectedKind and selectedStory is provided", () => {
        const hyperlink = createStoryHyperlink(baseUrl, {
            selectedKind: SELECTED_KIND,
            selectedStory: SELECTED_STORY
        });

        expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_KIND_STORY);
    });

    describe("when baseUrl has trailing slash", () => {
        beforeAll(() => {
            baseUrl = BASE_URL_WITH_TRAILING_SLASH;
        });

        it("returns Storybook v5+ hyperlink if storyId is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID });

            expect(hyperlink).toBe(EXPECTED_V5_HYPERLINK);
        });

        it("returns Storybook v5+ docs hyperlink if storyId is provided and has docs page", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID, hasDocsPage: true });

            expect(hyperlink).toBe(EXPECTED_V5_DOCS_HYPERLINK);
        });

        it("returns Storybook v4 hyperlink if only selectedKind is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { selectedKind: SELECTED_KIND });

            expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_KIND);
        });

        it("returns Storybook v4 hyperlink if both selectedKind and selectedStory is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, {
                selectedKind: SELECTED_KIND,
                selectedStory: SELECTED_STORY
            });

            expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_KIND_STORY);
        });
    });

    describe("when baseUrl has path", () => {
        beforeAll(() => {
            baseUrl = BASE_URL_PATH;
        });

        it("returns Storybook v5+ hyperlink if storyId is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID });

            expect(hyperlink).toBe(EXPECTED_V5_HYPERLINK_PATH);
        });

        it("returns Storybook v5+ docs hyperlink if storyId is provided and has docs page", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID, hasDocsPage: true });

            expect(hyperlink).toBe(EXPECTED_V5_DOCS_HYPERLINK_PATH);
        });

        it("returns Storybook v4 hyperlink if only selectedKind is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { selectedKind: SELECTED_KIND });

            expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_PATH_KIND);
        });

        it("returns Storybook v4 hyperlink if both selectedKind and selectedStory is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, {
                selectedKind: SELECTED_KIND,
                selectedStory: SELECTED_STORY
            });

            expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_PATH_KIND_STORY);
        });
    });

    describe("when baseUrl has path with trailing slash", () => {
        beforeAll(() => {
            baseUrl = BASE_URL_PATH_WITH_TRAILING_SLASH;
        });

        it("returns Storybook v5+ hyperlink if storyId is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID });

            expect(hyperlink).toBe(EXPECTED_V5_HYPERLINK_PATH);
        });

        it("returns Storybook v5+ docs hyperlink if storyId is provided and has docs page", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { storyId: STORY_ID, hasDocsPage: true });

            expect(hyperlink).toBe(EXPECTED_V5_DOCS_HYPERLINK_PATH);
        });

        it("returns Storybook v4 hyperlink if only selectedKind is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, { selectedKind: SELECTED_KIND });

            expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_PATH_KIND);
        });

        it("returns Storybook v4 hyperlink if both selectedKind and selectedStory is provided", () => {
            const hyperlink = createStoryHyperlink(baseUrl, {
                selectedKind: SELECTED_KIND,
                selectedStory: SELECTED_STORY
            });

            expect(hyperlink).toBe(EXPECTED_V4_HYPERLINK_PATH_KIND_STORY);
        });
    });
});