---
'@kvirn-ui/react': minor
---

Button, Link and Link.NewTabNotice render a stable part attribute, `data-kv="button"`, `data-kv="link"` and `data-kv="link-new-tab-notice"`, for `@kvirn-ui/theme/theme.css` and your own CSS. `useButton` and `useLink` include it in `buttonProps` and `linkProps`. Consumer attributes such as `data-variant="primary"` pass through to the element. Still no CSS.
