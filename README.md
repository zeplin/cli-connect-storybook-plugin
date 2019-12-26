# Zeplin CLI Connected Components - Storybook Plugin

This plugin generates links to connect Zeplin components with  Storybook. The plugin requires a running Storybook server to retrieve information about the stories. The implementation is inspired by [chromatic-cli](https://github.com/chromaui/chromatic-cli).

## Usage

Install this package along with @zeplin/cli npm package

```
npm install -g @zeplin/cli @zeplin/cli-connect-storybook-plugin
```

Add the plugin configuratin into your components configuration file. There are 3 alternative ways to connect with Storybook:

### Load the stories from a working remote Storybook server

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

### Start a local Storybook server using a npm script on your package.json

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

### Start a local Storybook server using a custom command

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

**All scenarios will create Storybook links by using `url` parameter.**

## Connecting components with stories

### Automatic matching

The following rules applies to match components with stories.

- If the framework is React, Storybook contains the file path information of the component. the plugin will try to find the story with the same file path given in components config files.
- If stories has their `component` field set (either using CSF or storiesOf API), plugin will try to find the story by comparing `component` name on the story with the file name (without extension) of the code component.
- Or else, the plugin will just try to find a story with a display name matching with the file name (without extension) of the code component.

If any match is found, links are created for each story name that the matching story has.

### Manual matching

If automatic matching does not work for you, you can manually create links using components configuration file. Set `storybook` field for each component you want to connect.

```json
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
```