---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
'@kvirn-ui/rich-text': patch
---

`ButtonGroup` and `useButtonGroup` take `layout: 'spaced' | 'attached'` (Plan 0065). `attached` adds `kv-button-group--attached` and joins the buttons into one strip, like a segmented control: they touch, share borders and only the outer corners are rounded. Default `spaced`, unchanged. It changes the look only: no new role, key, ARIA or string. `Toolbar.Group` is attached by default, and `layout="spaced"` opts out.

- React: the type `ButtonGroupLayout`; `ButtonGroupProps` gets `layout`, and `ButtonGroupState` is `{ isNamed, layout }`.
- Theme: `.kv-button-group--attached` (no gap, shared borders, logical outer radii, a hovered, pressed or focused button raised so its ring is never clipped), and the hairline between toolbar groups is kept.
- The `@kvirn-ui/rich-text` toolbar uses `Toolbar.Group`, so its groups now look like joined strips. There is no API change there.
