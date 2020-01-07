# Zeplin CLI Storybook Plugin

[Zeplin CLI](https://github.com/zeplin/cli) plugin to generate Storybook links for Zeplin components, inspired by [chromatic-cli](https://github.com/chromaui/chromatic-cli).

## Installation

Install the plugin using npm.

```sh
npm install -g @zeplin/cli-connect-storybook-plugin
```

## Usage

Since Zeplin CLI Storybook Plugin requires a running Storybook instance to collect information about stories, configure the plugin in your components configuration file (`.zeplin/components.json`) to point to an instance.

### Remote Storybook instance

Provide the URL of a remote Storybook instance.

```json
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "<protocol>://<hostname>:<port>",
        }
    }],
    ...
}
```

### Local Storybook instance

Zeplin CLI Storybook Plugin can also start a local Storybook instance to collect information about stories. You can either provide an npm script or a custom command to start a Storybook instance.

#### npm script

Provide the name of the npm script to start a Storybook instance.

```json
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:<port>",
            "startScript": "<name of the npm script>",
        }
    }],
    ...
}
```

#### Custom command

Provide a custom command to run to start a Storybook instance.

```json
{
    ...
    "plugins" : [{
        "name": "@zeplin/cli-connect-storybook-plugin",
        "config": {
            "url": "http://localhost:<port>",
            "command": "<the command to start storybook server>",
        }
    }],
    ...
}
```

☝️ _For all alternatives, the URL in Zeplin will be based on the `url` property you define._

Once the Storybook instance is configured, run CLI `connect` command.

```sh
zeplin connect
```

## Matching components with stories

Zeplin CLI Storybook Plugin automatically attempts to match components with stories following these rules:

- For React, resolve component stories by matching the file path in the components configuration file.
- If `component` property of stories are set (either using CSF or `storiesOf` API), resolve component stories by matching `component` property of the stories with component file names, e.g. `Avatar.jsx` and `Avatar`.
- Resolve stories by matching story display names (e.g. `Design System/Avatar` and `Avatar`) with component file names (e.g. `Avatar.jsx` and `Avatar`).

It's also possible to match components with stories manually. Set the `storybook` property components (within the configuration file, `.zeplin/components.json`) for each component you want to manually match and provide the story kind and name(s).

```json
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

## About Connected Components

[Connected Components](https://blog.zeplin.io/introducing-connected-components-components-in-design-and-code-in-harmony-aa894ed5bd95) in Zeplin lets you access components in your codebase directly on designs in Zeplin, with links to Storybook, GitHub and any other source of documentation based on your workflow. 🧩

[Zeplin CLI](https://github.com/zeplin/cli) uses plugins like this one to analyze component source code and publishes a high-level overview to be displayed in Zeplin.
