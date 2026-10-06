---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

Add `Switch` and `useSwitch`: a native `<input type="checkbox" role="switch">` for a setting that takes effect at once, in a `Field.Root`. It has no `required` (a required Field warns, `switch-required`) and no strings of its own, and Enter does not toggle it, only Space. Put `marker="none"` on the `Field.Label` next to the switch, so the label shows no "(optional)". The theme styles it as `kv-switch`, a pill track with a thumb and a tick that shows the state without colour.
