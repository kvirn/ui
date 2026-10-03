---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Heading and Prose (Plan 0023).

- `Heading` and `useHeading({ level, size })`: `<Heading level={2}>` renders an `<h2>`. `level` (1 to 6) is required, so the page's outline is always a decision. `size` (`display`, `heading-1`, `heading-2`, `heading-3`, the type roles) is the look apart from the level, and levels 1 to 3 default to their own. It adds the classes `kv-heading` and `kv-heading--<size>`, no role or ARIA, and passes attributes and the ref through. `render` changes the element, and the function form gets `state.level` and `state.size`. Types: `HeadingProps`, `HeadingLevel`, `HeadingSize`, `HeadingState`, `HeadingElementProps`, `HeadingPartProps`, `UseHeadingOptions`, `UseHeadingResult`.
- `@kvirn-ui/theme`: `kv-heading` and `kv-heading--display|heading-1|heading-2|heading-3`, in prose and outside it.
- `Prose` (also `Prose.Root` and `ProseRoot`) and `useProse()`: one `<div class="kv-prose">` that `@kvirn-ui/theme` styles for reading. A `className` and a `render` element's class join it. Types: `ProseRootProps`, `ProseState`, `ProseElementProps`, `ProsePartProps`, `UseProseResult`. No strings, no CSS.
