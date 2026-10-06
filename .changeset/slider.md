---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

New: Slider, a native `<input type="range">` for an approximate value (a search radius, a volume), wired to `Field` like the other controls. `Slider` and `useSlider` take `value` or `defaultValue`, `min` (0), `max` (100), `step` (1), `name`, `disabled`, `onValueChange(value, { reason: 'input', event })` and `valueText`. `aria-valuetext` is always set: `valueText(value)`, or the number formatted in the provider's locale, so give it the unit (`15 km`). The browser supplies the keys (arrows, Home, End, PageUp, PageDown) and the drag. An explicit `aria-labelledby` opts the Slider out of its Field, so a `NumberInput` can own the Field's label and error beside it. Dev warnings: no accessible name, `min >= max`, and a value outside the range.

`@kvirn-ui/theme` styles `kv-slider`: a plain track and a `primary` thumb with no fill, a 44px thumb hit box on a coarse pointer, and forced-colours rules.
