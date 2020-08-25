// Original file: https://github.com/chromaui/chromatic-cli/blob/6ed2142/bin/storybook/extract.js

function getComponentName(_component) {
  const component = _component || {};
  if (component.__docgenInfo && component.__docgenInfo.displayName) {
    return component.__docgenInfo.displayName;
  }

  return component.name || "";
}

function specFromStory(
  {
    id,
    kind,
    name,
    parameters: {
      component = {},
      framework,
      fileName,
      docs
    } = {}
  },
  componentPathMap = {}
) {
  const componentName = getComponentName(component);
  return {
    storyId: id,
    name,
    kind,
    displayName: kind.split(/\||\/|\./).slice(-1)[0].trim(),
    component: {
      name: componentName,
      filePath: componentPathMap[componentName] || ""
    },
    filePath: typeof fileName === "string" ? fileName : "",
    hasDocsPage: !!docs && !docs.disable
  };
}

export const extract = global => {
  const {
    __STORYBOOK_CLIENT_API__,
    STORYBOOK_ENV,
    STORYBOOK_REACT_CLASSES
  } = global;

  if (!__STORYBOOK_CLIENT_API__) {
    throw new Error(
      `Zeplin CLI requires Storybook version at least 3.4. Please update your Storybook!`
    );
  }

  const componentPathMap = {};
  if (STORYBOOK_ENV === "react" && STORYBOOK_REACT_CLASSES) {
    Object.values(STORYBOOK_REACT_CLASSES).forEach(src =>
      componentPathMap[src.docgenInfo.displayName] = src.path
    );
  }

  // eslint-disable-next-line no-underscore-dangle
  const storyStore = __STORYBOOK_CLIENT_API__._storyStore;

  // Storybook 5+ API
  if (storyStore.extract) {
    return Object.values(storyStore.extract({ includeDocsOnly: true }))
      .map(s => specFromStory(s, componentPathMap));
  }

  // Storybook 4- API
  return __STORYBOOK_CLIENT_API__
    .getStorybook()
    .map(({ kind, stories }) =>
      stories.map(({ name }) =>
        specFromStory({
          kind,
          name,
          parameters:
            storyStore.getStoryAndParameters &&
            storyStore.getStoryAndParameters(kind, name).parameters,
        }, componentPathMap)
      )
    )
    .reduce((a, b) => [...a, ...b], []); // flatten
};
