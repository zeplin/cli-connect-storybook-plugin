# Zeplin CLI Storybook Plugin

[Zeplin CLI](https://github.com/zeplin/cli) plugin to generate Storybook links for Zeplin components. The implementation is inspired by [chromatic-cli](https://github.com/chromaui/chromatic-cli).

## Installation

Install the plugin using npm.

```sh
npm install -g @zeplin/cli-connect-storybook-plugin
```

## Usage

The plugin requires a running Storybook server to retrieve information about the stories, configure the plugin in your components configuration file.

There are 3 alternative ways to connect with Storybook:

- Load the stories from a working remote Storybook server.

    .zeplin/components.json
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

- Start a local Storybook server using a npm script on your package.json

    .zeplin/components.json
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

- Start a local Storybook server using a custom command

    .zeplin/components.json
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
**All scenarios will create Storybook links by using `url` parameter as a base URL.**

Run CLI `connect` command using the plugin.

```sh
zeplin connect
```

### Automatic matching

The following rules applies to automatically match components with stories.

- If the framework is React, the plugin will resolve component stories by matching file path given in the components configuration file.
- If `component` field of stories are set (either using CSF or storiesOf API), plugin will resolve component stories by matching `component` name of the stories with component file names (e.g. `Avatar.jsx` is `Avatar`).
- If none of the above works, the plugin will resolve stories by matching story display names (e.g. `Design System/Avatar` is `Avatar`) with component file names (e.g. `Avatar.jsx` is `Avatar`).

If any match is found, links are created for each story name that the matching story has.

### Manual matching

If automatic matching does not work for you, you can manually create links using components configuration file. Set `storybook` field for each component you want to connect.

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
