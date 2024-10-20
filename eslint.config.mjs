import nx from "@nx/eslint-plugin";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    ignores: [
      "**/pnpm-lock.yaml",
      "**/build",
      "**/coverage",
      "**/dist",
      "**/tmp",
      "out-tsc",
      "**/node_modules",
      ".idea",
      "**/.project",
      "**/.classpath",
      "**/.c9/",
      "**/*.launch",
      "**/.settings/",
      "**/*.sublime-workspace",
      ".vscode/*",
      "!.vscode/settings.json",
      "!.vscode/tasks.json",
      "!.vscode/launch.json",
      "!.vscode/extensions.json",
      ".sass-cache",
      "connect.lock",
      "libpeerconnection.log",
      "**/npm-debug.log",
      "**/yarn-error.log",
      "**/testem.log",
      "typings",
      "**/.DS_Store",
      "**/Thumbs.db",
      ".nx/cache",
      ".nx/workspace-data",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?js$"],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [...tsEslint.configs.recommended],
    rules: {},
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    // Override or add rules here
    rules: {},
  },
);
