---
name: linting
description: Systematically resolves ESLint, TypeScript, and Prettier errors across the codebase while preserving application logic.
---

# Linting & Type Error Resolution Guide

Activate this skill when the user asks you to fix lint errors, TypeScript compilation errors, or when a CI/CD pipeline fails due to code quality checks.

## Core Philosophy

1. **Understand Before Fixing**: Do not blindly delete code or suppress warnings. Understand *why* the linter is complaining before applying a fix.
2. **No Indiscriminate Suppression**: Only use `// eslint-disable-next-line` or `@ts-expect-error` as an absolute last resort when you can prove the linter is wrong and the code is structurally sound.
3. **Preserve Logic**: Lint fixes should **never** alter the business logic or runtime behavior of the application unless the lint error explicitly points to a runtime bug.

## Resolution Strategies by Error Type

### 1. Unused Variables & Imports (`@typescript-eslint/no-unused-vars`)
- **Imports**: Simply remove the unused import statement.
- **Variables**: Remove the variable declaration if it's completely unused.
- **Destructuring**: If a variable is pulled from an object but never used, remove it from the destructuring assignment. (e.g., `const { used, unused } = data;` -> `const { used } = data;`)
- **Function Parameters**: If a parameter is required by a callback signature (e.g., in a `map` or event handler) but not used in the function body, prefix it with an underscore: `(_event, index) => ...`.

### 2. Broken Imports or Missing Modules
*Context: Often occurs after massive file movements (like architecture refactoring).*
- **Verify Path**: Use your `grep_search` or `list_dir` tools to find exactly where the module is currently located.
- **Alias Usage**: 
  - If importing a file from a different domain/module, use the `@/` alias (e.g., `@/components/layout/site-header`).
  - If importing a file within the same directory or child directory, use relative paths (e.g., `./components/my-component`).
- **File Extensions**: Omit `.tsx` and `.ts` extensions in import statements.

### 3. Missing Dependencies in React Hooks (`react-hooks/exhaustive-deps`)
- **Add Dependencies**: Add the missing variables/functions to the dependency array.
- **Stabilize Functions**: If adding a function to the dependency array causes infinite loops, wrap that function definition in `useCallback`.
- **Stabilize Objects/Arrays**: If adding an object/array causes infinite loops, wrap its creation in `useMemo`.
- **Intentional Omissions**: If a dependency is intentionally omitted to prevent re-triggering an effect (e.g., an initialization effect that should only run once), use `// eslint-disable-next-line react-hooks/exhaustive-deps` and briefly document why.

### 4. Implicit 'any' Types (`@typescript-eslint/no-explicit-any`)
- **Be Specific**: Replace `any` with the actual type interface.
- **Look Around**: If you don't know the type, look at the component props or the function return type that generates the data. 
- **Use `unknown`**: If the type truly cannot be known ahead of time, use `unknown` and implement type narrowing/checking.

### 5. Missing Prop Types or Interfaces
- Ensure every React component has a defined interface for its props.
- Do not use inline prop typing for complex objects; define an `interface` above the component.

### 6. Accessibility (a11y) Warnings (e.g., `jsx-a11y/alt-text`)
- **Images**: Always add descriptive `alt` text to `<img>` tags, or `alt=""` if it's purely decorative.
- **Buttons/Anchors**: Ensure all interactive elements have semantic meaning and accessible text. Use `aria-label` if an element only contains an icon.

## Workflow

1. Request the specific error output from the user if not provided.
2. If multiple errors exist, tackle them file-by-file.
3. Use the `view_file` tool to inspect the surrounding context of the error.
4. Use the `replace_file_content` or `multi_replace_file_content` tools to surgically apply fixes.
5. Provide a summary of what was fixed and why.
