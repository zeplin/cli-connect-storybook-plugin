module.exports = {
    env: {
        node: true,
        jest: true
    },
    extends: [
        "@zeplin/eslint-config/node",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    plugins: ["@typescript-eslint"],
    settings: {
        "import/resolver": {
            typescript: {
                directory: "./tsconfig.json"
            },
        }
    },
    rules: {
        "capitalized-comments": "error",
        "arrow-body-style": ["error", "as-needed"],
        "no-process-exit": "off",
        "no-process-env": "off",
        "@typescript-eslint/no-explicit-any": ["error", { "ignoreRestArgs": true }],
        "class-methods-use-this": "off"
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                // https://github.com/typescript-eslint/typescript-eslint/issues/342#issuecomment-484739065
                'no-undef': 'off',
            },
        },
    ]
}
