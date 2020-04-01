import { createStorybookUrl } from "../src/util/create-url";

const BASE_URL = "http://localhost:9009";
const BASE_URL_WITH_TRAILING_SLASH = "http://localhost:9009/";
const BASE_URL_PATH = "http://localhost:9009/hello";
const BASE_URL_PATH_WITH_TRAILING_SLASH = "http://localhost:9009/hello/";

const STORY_ID = "kind--story";
const SELECTED_KIND = "something/kind";
const SELECTED_STORY = "story/hello*there!";

const EXPECTED_V5_URL = "http://localhost:9009/?path=/story/kind--story";
const EXPECTED_V4_URL_KIND = "http://localhost:9009/?selectedKind=something%2Fkind";
const EXPECTED_V4_URL_KIND_STORY = "http://localhost:9009/?selectedKind=something%2Fkind&selectedStory=story%2Fhello%2Athere%21";

const EXPECTED_V5_URL_PATH = "http://localhost:9009/hello/?path=/story/kind--story";
const EXPECTED_V4_URL_PATH_KIND = "http://localhost:9009/hello/?selectedKind=something%2Fkind";
const EXPECTED_V4_URL_PATH_KIND_STORY = "http://localhost:9009/hello/?selectedKind=something%2Fkind&selectedStory=story%2Fhello%2Athere%21";

describe("createStorybookUrl", () => {
    let baseUrl = BASE_URL;

    it("returns Storybook v5+ URL if storyId is provided", () => {
        const url = createStorybookUrl(baseUrl, { storyId: STORY_ID });

        expect(url).toBe(EXPECTED_V5_URL);
    });

    it("returns Storybook v4 URL if only selectedKind is provided", () => {
        const url = createStorybookUrl(baseUrl, { selectedKind: SELECTED_KIND });

        expect(url).toBe(EXPECTED_V4_URL_KIND);
    });

    it("returns Storybook v4 URL if both selectedKind and selectedStory is provided", () => {
        const url = createStorybookUrl(baseUrl, {
            selectedKind: SELECTED_KIND,
            selectedStory: SELECTED_STORY
        });

        expect(url).toBe(EXPECTED_V4_URL_KIND_STORY);
    });

    describe("when baseUrl has trailing slash", () => {
        beforeAll(() => {
            baseUrl = BASE_URL_WITH_TRAILING_SLASH;
        });

        it("returns Storybook v5+ URL if storyId is provided", () => {
            const url = createStorybookUrl(baseUrl, { storyId: STORY_ID });

            expect(url).toBe(EXPECTED_V5_URL);
        });

        it("returns Storybook v4 URL if only selectedKind is provided", () => {
            const url = createStorybookUrl(baseUrl, { selectedKind: SELECTED_KIND });

            expect(url).toBe(EXPECTED_V4_URL_KIND);
        });

        it("returns Storybook v4 URL if both selectedKind and selectedStory is provided", () => {
            const url = createStorybookUrl(baseUrl, {
                selectedKind: SELECTED_KIND,
                selectedStory: SELECTED_STORY
            });

            expect(url).toBe(EXPECTED_V4_URL_KIND_STORY);
        });
    });

    describe("when baseUrl has path", () => {
        beforeAll(() => {
            baseUrl = BASE_URL_PATH;
        });

        it("returns Storybook v5+ URL if storyId is provided", () => {
            const url = createStorybookUrl(baseUrl, { storyId: STORY_ID });

            expect(url).toBe(EXPECTED_V5_URL_PATH);
        });

        it("returns Storybook v4 URL if only selectedKind is provided", () => {
            const url = createStorybookUrl(baseUrl, { selectedKind: SELECTED_KIND });

            expect(url).toBe(EXPECTED_V4_URL_PATH_KIND);
        });

        it("returns Storybook v4 URL if both selectedKind and selectedStory is provided", () => {
            const url = createStorybookUrl(baseUrl, {
                selectedKind: SELECTED_KIND,
                selectedStory: SELECTED_STORY
            });

            expect(url).toBe(EXPECTED_V4_URL_PATH_KIND_STORY);
        });
    });

    describe("when baseUrl has path with trailing slash", () => {
        beforeAll(() => {
            baseUrl = BASE_URL_PATH_WITH_TRAILING_SLASH;
        });

        it("returns Storybook v5+ URL if storyId is provided", () => {
            const url = createStorybookUrl(baseUrl, { storyId: STORY_ID });

            expect(url).toBe(EXPECTED_V5_URL_PATH);
        });

        it("returns Storybook v4 URL if only selectedKind is provided", () => {
            const url = createStorybookUrl(baseUrl, { selectedKind: SELECTED_KIND });

            expect(url).toBe(EXPECTED_V4_URL_PATH_KIND);
        });

        it("returns Storybook v4 URL if both selectedKind and selectedStory is provided", () => {
            const url = createStorybookUrl(baseUrl, {
                selectedKind: SELECTED_KIND,
                selectedStory: SELECTED_STORY
            });

            expect(url).toBe(EXPECTED_V4_URL_PATH_KIND_STORY);
        });
    });
});