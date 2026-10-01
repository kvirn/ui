---
'@kvirn-ui/theme': patch
---

Fix the button label sitting a pixel above the centre, and compact buttons being 36px instead of 32px. The control size now sets a button's height, the vertical padding is 4px (it shows only when a long label wraps), and the line box is rounded to whole pixels. `--kv-button-line-height` must be unitless.
