---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

New `Stepper` and `useStepper`: where the user is in a multi-page form as one line of text, "Step 2 of 5: Your vehicle", in a `<p class="kv-stepper">`. It is a position, not navigation: no list, no links, no live region, not a Tab stop. Put it directly after the page heading, never inside a heading, label or legend (a development warning says so). New messages `stepper.status` and `stepper.statusWithName` in all six locales (se is an English placeholder), and `kv-stepper` in `theme.css`.
