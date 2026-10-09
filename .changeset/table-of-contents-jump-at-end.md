---
'@kvirn-ui/core': patch
'@kvirn-ui/react': patch
---

TableOfContents: at the end of a page, a heading that sits exactly on the `offset` line is the current one (a jump put it there), instead of always the last heading. Give `offset` the value where a jump lands a heading (`scroll-padding-top` plus `scroll-margin-top`).
