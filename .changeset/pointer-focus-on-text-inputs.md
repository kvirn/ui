---
'@kvirn-ui/react': patch
'@kvirn-ui/theme': minor
---

Text inputs show focus from a click as a 2px edge in the new `border-focus` colour token (1px `Highlight` in forced colours) (`primary-600` in light, a step darker than the ring), and keep the 2px focus ring for keyboard focus. Before, a click in an Input, InputGroup, OneTimeCode, Combobox or Autocomplete also drew the ring. The hooks now track whether the last interaction was a pointer or a key, and text-entry parts get `data-focused` while they have focus. `colorTokenNames` gains `border-focus`: a theme copy needs a value for it in every theme.
