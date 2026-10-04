---
'@kvirn-ui/react': patch
---

Fixes from the accessibility reviews of 2026-10-04:

- `Table.ScrollRegion` without `table` measures its own sticky head, so a focused control is never hidden under it (2.4.11). A region with no caption and no other name warns, and no longer points `aria-labelledby` at a missing id.
- FileUpload no longer moves focus back to an item when the user has clicked elsewhere and a progress update renders (3.2.1).
- Icon looks names and sizes up with `Object.hasOwn`, so a name such as `constructor` renders the placeholder and warns.
