---
'@kvirn-ui/theme': minor
---

Buttons now have gentle depth in the standard light and dark themes: a soft shadow that lifts on hover, and a 1px edge tinted darker at the bottom in light and lighter at the top in dark. The shadow goes when the button is pressed, and on keyboard focus, so the focus ring sits on the plain page. Disabled buttons, the high-contrast themes and forced colours stay flat. New tokens: `--kv-shadow-button`, `--kv-shadow-button-hover`, `--kv-button-edge-shade` and `--kv-button-edge-highlight`. To keep today's flat button, set both shadows to `none` and both edge tokens to `0%`. `checkThemeCss()` now also requires the two edge tokens in every theme (a colour and a percentage, equal in the OS fallback), and measures every tinted edge at 3:1 on `canvas`, `surface` and `surface-raised` (96 more pairs). A copy of `theme.css` without the new tokens is reported until you add them.
