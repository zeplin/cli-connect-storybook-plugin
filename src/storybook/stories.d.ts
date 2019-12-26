export interface Story {
  storyId: string;
  kind: string;
  name: string;
  displayName: string;
  componentName: string;
  filePath: string;
}

export function loadStoriesFromURL(url: string, { verbose }?: { verbose: boolean }): Promise<Story[]>;