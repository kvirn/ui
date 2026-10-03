---
'@kvirn-ui/react': minor
---

Add Button and Link (Plan 0003), and `mergeProps`.

- `Button` and `useButton`: a native `<button>` with `type="button"` by default. `disabled` plus `focusableWhenDisabled` keeps it in the Tab order with `aria-disabled="true"` while click, Enter, Space and form submission stay blocked, for the Button's `onClick` and for a `render` element's own `onClick`. `aria-disabled` isn't a prop: it comes only from `disabled` with `focusableWhenDisabled`. Pass the handler as `onClick` (or `useButton({ onClick })`). In the `render` function form, don't override `buttonProps.onClick`. `data-disabled` and `data-focus-visible` for styling. `render` changes the element, which must stay a `<button>`.
- `Link`, `Link.NewTabNotice` (also `LinkNewTabNotice`) and `useLink`: a native `<a href>` rendered by the registered router link. `current` sets `aria-current`, `target="_blank"` adds `rel="noopener noreferrer"` (also when `target` is on a `render` element), and the new-tab notice comes from `link.newTabNotice`, overridable by children, `messages` or the provider. No `disabled` prop. `data-current` and `data-focus-visible` for styling.
- `mergeProps`: merges prop objects for one element. Handlers chain in argument order, `className` and `style` merge, refs merge, and `undefined` never overrides.
- Dev warnings: a Button that doesn't render a `<button>`, a Link whose component doesn't render an `<a>` with its ref, and a `target="_blank"` link without a notice.
