# @kvirn-ui/core

The framework-agnostic state machines behind `@kvirn-ui/react`. It has no React and touches no DOM at import time.

Most adopters never import it: use `@kvirn-ui/react`, which re-exports what you need (`masks`, `checks`, `MaskResult` and the file upload types).

## Public API

These are safe to use and follow semver:

- `masks` and `checks`: the input masks and the value checks. React re-exports both.
- `createAnnouncer`: the live-region announcer, for code that isn't a React component.
- The types that the React package re-exports or that its public props use (`MaskResult`, `FileUploadContext`, `FileUploadFailure`, `FileUploadRejection` and similar).

## Not a stable API

Everything else serves `@kvirn-ui/react` and can change in any release, without a major version. That includes `createMask` (write a mask as a plain definition and pass it to `Input`, which resolves it), `createComponentStore`, the theme store helpers (`createThemeStore`, `resolveTheme`, `resolveThemeOptions`, `findInvalidThemeOptions`, `isSameThemeConfiguration`), `resolveMessageNamespace`, `getLanguage`, `matchesText`, `startsWithText` and the `default*` constants.

Marking them `@internal` in the types is a separate breaking change.
