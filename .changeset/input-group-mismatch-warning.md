---
'@kvirn-ui/react': patch
---

`InputGroup.Root` warns once in development when its own `invalid` or `disabled` disagrees with the input inside it (`input-group-invalid-mismatch`, `input-group-disabled-mismatch`). The Root only draws the box, so set `aria-invalid` and `disabled` on the input too, or put the group in a Field. Documented in the InputGroup page and contract.
