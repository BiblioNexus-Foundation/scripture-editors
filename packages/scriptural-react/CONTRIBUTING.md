# Contributing to @scriptural/react

Thank you for your interest in contributing to @scriptural/react! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Contributing to @scriptural/react](#contributing-to-scripturalreact)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
    - [Using Nx Console](#using-nx-console)
  - [Project Structure](#project-structure)
  - [Making Changes](#making-changes)
    - [Nx Generators](#nx-generators)
    - [Coding Standards](#coding-standards)
    - [Plugin Development](#plugin-development)
    - [Commit Guidelines](#commit-guidelines)
  - [Testing](#testing)
  - [Documentation](#documentation)
  - [Submitting Changes](#submitting-changes)
  - [Release Process](#release-process)
  - [Questions?](#questions)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/scripture-editors.git
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/bible-technology/scripture-editors.git
   ```
4. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. Install pnpm if you haven't already:

   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the package:

   ```bash
   nx build scriptural-react
   ```

4. Run tests:

   ```bash
   nx test scriptural-react
   ```

5. Run linting:

   ```bash
   nx lint scriptural-react
   ```

6. Serve the package in watch mode:
   ```bash
   nx serve scriptural-react
   ```

### Using Nx Console

We recommend installing the Nx Console extension for your IDE:

- [VS Code Nx Console](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)
- [WebStorm Nx Console](https://plugins.jetbrains.com/plugin/21060-nx-console)

This provides a UI for running Nx commands and helps with project generation.

## Project Structure

```
scripture-editors/
├── packages/
│   ├── scriptural-react/        # This package
│   │   ├── src/
│   │   │   ├── context/        # React context providers
│   │   │   ├── plugins/        # Editor plugins
│   │   │   ├── styles/         # CSS styles
│   │   │   ├── utils/          # Utility functions
│   │   │   └── index.ts        # Main entry point
│   │   ├── project.json        # Nx project configuration
│   │   └── package.json        # Package configuration
│   └── ... other packages
├── nx.json                      # Nx workspace configuration
└── pnpm-workspace.yaml         # pnpm workspace configuration
```

## Making Changes

### Nx Generators

Use Nx generators to create new components, plugins, or other features:

```bash
# Create a new plugin
nx generate @nx/react:library --name=my-plugin --directory=plugins

# Create a new component
nx generate @nx/react:component --name=MyComponent --project=scriptural-react
```

### Coding Standards

- Follow TypeScript best practices
- Use functional components and hooks
- Follow the existing code style
- Add JSDoc comments for public APIs
- Keep components focused and composable

### Plugin Development

When creating new plugins:

1. Use Nx generators to create the plugin structure
2. Include types, components, and hooks
3. Export the plugin from `index.ts`
4. Add documentation
5. Add tests

Example plugin structure:

```
src/plugins/MyPlugin/
├── types.ts
├── useMyPlugin.ts
├── MyPluginComponent.tsx
├── index.tsx
└── README.md
```

### Commit Guidelines

Follow conventional commits specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:

```bash
git commit -m "feat(scriptural-react): add chapter navigation plugin"
```

## Testing

1. Write tests for new features:

   ```typescript
   describe("MyPlugin", () => {
     it("should handle user interaction", () => {
       // Test code
     });
   });
   ```

2. Run tests:

   ```bash
   nx test scriptural-react
   ```

3. Run tests in watch mode:

   ```bash
   nx test scriptural-react --watch
   ```

4. Check test coverage:
   ```bash
   nx test scriptural-react --coverage
   ```

## Documentation

1. Update relevant documentation:

   - README.md for high-level changes
   - API.md for API changes
   - GUIDES.md for new features or patterns

2. Include code examples:

   ````typescript
   /**
    * Creates a new plugin instance
    * @param options - Plugin configuration options
    * @returns Plugin instance
    * @example
    * ```tsx
    * const plugin = createPlugin({
    *   // options
    * });
    * ```
    */
   ````

3. Add inline documentation:
   ```typescript
   interface PluginOptions {
     /** The trigger key for the plugin */
     trigger: string;
     /** Optional callback when plugin is activated */
     onActivate?: () => void;
   }
   ```

## Submitting Changes

1. Update your branch with upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Ensure all tests pass:

   ```bash
   nx affected:test
   nx affected:lint
   ```

3. Push your changes:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request:

   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes
   - Update documentation
   - Ensure all Nx checks pass

5. Respond to review feedback:
   - Address all comments
   - Make requested changes
   - Keep the PR updated with upstream changes

## Release Process

1. Version bumps follow semver:

   - MAJOR: Breaking changes
   - MINOR: New features
   - PATCH: Bug fixes

2. Update CHANGELOG.md:

   ```markdown
   ## [1.1.0] - 2024-01-20

   ### Added

   - New chapter navigation plugin

   ### Fixed

   - Issue with toolbar positioning
   ```

3. Create a release PR:
   - Update version in package.json
   - Update CHANGELOG.md
   - Update documentation if needed
   - Run `nx affected:build` to ensure all dependent packages build correctly

## Questions?

If you have questions:

1. Check existing issues and documentation
2. Create a new issue with the "question" label
3. Join our community discussions

Thank you for contributing to @scriptural/react!
