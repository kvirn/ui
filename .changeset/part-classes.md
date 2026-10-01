---
'@kvirn-ui/react': minor
---

Button, Link and Link.NewTabNotice render a stable part class, `kv-button`, `kv-link` and `kv-link-new-tab-notice`, for `@kvirn-ui/theme/theme.css` and your own CSS. `useButton` and `useLink` include it as `className` in `buttonProps` and `linkProps` (`ButtonPartProps` and `LinkPartProps`). Your own `className`, on the component or on a `render` element, joins the part's class instead of replacing it, so add a variant with a class: `<Button className="kv-button--primary">`. State stays in `data-*` attributes. Still no CSS.
