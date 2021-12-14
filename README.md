# Zeplin CLI Storybook Plugin

[Zeplin CLI](https://github.com/zeplin/cli) plugin to generate Storybook links for Zeplin components, inspired by [chromatic-cli](https://github.com/chromaui/chromatic-cli).

## Contents

* [Installation](#installation)
* [Usage](#usage)
  + [Remote Storybook instance](#remote-storybook-instance)
  + [Local Storybook instance](#local-storybook-instance)
    - [npm script](#npm-script)
    - [Custom command](#custom-command)
  + [Matching components with stories](#matching-components-with-stories)
  + [URL format for manual matching](#url-format-for-manual-matching)
  + [Use manual matching without connecting a working Storybook](#use-manual-matching-without-connecting-a-working-storybook)
  + [Fast fail on Storybook errors](#fast-fail-on-storybook-errors)
  + [Generate DocsPage hyperlinks](#generate-docspage-hyperlinks)
  + [Ignore SSL certificate errors](#ignore-ssl-certificate-errors)
  + [Using Basic Authentication](#using-basic-authentication)
* [About Connected Components](#about-connected-components)

## Installation

Install the plugin using npm.

```sh
npm install -g @zeplin/cli-connect-storybook-plugin
```

## Usage

Since Zeplin CLI Storybook Plugin requires a running Storybook instance to collect information about stories, configure the plugin in your components configuration file (`.zeplin/components.json`) to point to an instance.

### Remote Storybook instance

Provide the URL of a remote Storybook instance.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "<protocol>://<hostname>:<port>", // Defaults to http://localhost:6006
        }
    }],
    ...
}
```

### Local Storybook instance

Zeplin CLI Storybook Plugin can also start a local Storybook instance to collect information about stories. You can either provide an npm script or a custom command to start a Storybook instance.

#### npm script

Provide the name of the npm script to start a Storybook instance.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:<port>", // Defaults to http://localhost:6006
            "startScript": "<name of the npm script>"
        }
    }],
    ...
}
```

#### Custom command

Provide a custom command to run to start a Storybook instance.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:<port>", // Defaults to http://localhost:6006
            "command": "<the command to start storybook server>"
        }
    }],
    ...
}
```

☝️ _For all alternatives, the generated hyperlinks in Zeplin will be based on the `url` property you define._

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:<port>", // Defaults to http://localhost:6006
            "startScript": "<the command to start storybook server>",
            "targetUrl": "<protocol>://<hostname>:<port>"
        }
    }],
    ...
}
```
☝️ _You can use optional `targetUrl` parameter to generate the hyperlinks to a remote Storybook_

Once the Storybook instance is configured, run CLI `connect` command.

```sh
zeplin connect
```

### Matching components with stories

Zeplin CLI Storybook Plugin automatically attempts to match components with stories following these rules:

- For React, resolve component stories by matching the file path in the components configuration file.
- If `component` property of stories are set (either using CSF or `storiesOf` API), resolve component stories by matching `component` property of the stories with component file names, e.g. `Avatar.jsx` and `Avatar`.
- Resolve stories by matching story display names (e.g. `Design System/Avatar` and `Avatar`) with component file names (e.g. `Avatar.jsx` and `Avatar`).

It's also possible to match components with stories manually. Set the `storybook` property components (within the configuration file, `.zeplin/components.json`) for each component you want to manually match and provide the story kind and name(s).

```jsonc
{
    ...
    "components": [
        {
            "path": "Avatar.jsx",
            "zeplinNames": [
                "avatar loaded",
                "avatar loading"
            ],
            "storybook": {
                "kind": "Design System/Avatar",
                "stories": [
                    "large",
                    "medium",
                    "small"
                ]
            }
        }
    ]
    ...
}
```

### URL format for manual matching

Manually defined component stories will generate hyperlinks using new hyperlinks (for Storybook v5+). In order to generate old style hyperlinks (for Storybook v4) use the following configuration. Next major release will remove to support of old style hyperlinks.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:6006",
            "startScript": "storybook",
            "format": "old"
        }
    }],
    ...
}
```

### Use manual matching without connecting a working Storybook

Use `fetchStories` flag to disable connecting and fetching stories from the given URL, so that you can utilize manual configuration to create Storybook hyperlinks. It is recommended to set it false if the plugin cannot match components using the rules mentioned above.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "https://storybook.example.com",
            "fetchStories": false,
            "format": "new"
        }
    }],
    ...
}
```

### Fast fail on Storybook errors

Set `failFastOnErrors` parameter to true to abort on any internal errors happened in Storybook. By default, the plugin will try to fetch whatever story it can retrieve from Storybook even if it reports any errors.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:6006",
            "startScript": "storybook",
            "failFastOnErrors": true
        }
    }],
    ...
}
```

### Generate DocsPage hyperlinks

You can use `useDocsPage` parameter to generate DocsPage hyperlinks if you use [@storybook/addon-docs](https://github.com/storybookjs/storybook/tree/master/addons/docs) in your Storybook instance.

```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:6006",
            "startScript": "storybook",
            "useDocsPage": true
        }
    }],
    ...
}
```

### Ignore SSL certificate errors

In case you would need to ignore SSL certificate errors:
```jsonc
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "https://storybook.example.com",
            "ignoreSSLErrors": true
        }
    }],
    ...
}
```

## About Connected Components

[Connected Components](https://blog.zeplin.io/introducing-connected-components-components-in-design-and-code-in-harmony-aa894ed5bd95) in Zeplin lets you access components in your codebase directly on designs in Zeplin, with links to Storybook, GitHub and any other source of documentation based on your workflow. 🧩

[Zeplin CLI](https://github.com/zeplin/cli) uses plugins like this one to analyze component source code and publishes a high-level overview to be displayed in Zeplin.
