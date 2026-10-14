# 0111 Soft transitions

Status: in progress · Owner: maintainer request ("sensible transitions on buttons, accordions, toasts etc., all respect reduced motion")

## Problem

Motion is patchy. Button, switch, dialog, tooltip and toast fade-in already move; accordion, disclosure, tabs, checkbox, radio, menu, listbox and popups change state instantly. DESIGN.md and the `theme-css` skill said "nothing animates" for accordion and "the popup has no animation" for menu.

## Options weighed

1. **Opacity, colour and small rotation only, CSS only** (chosen). Uses the three existing duration tokens and `--kv-easing-standard`. No new token, no JS, no new colour pair.
2. Height animation on panels (`interpolate-size`, `::details-content`). Rejected: panels use `hidden`, so it needs JS or an exit animation, and it reflows (1.4.10 risk).
3. Exit animations for popups and toasts. Rejected: needs the hook to delay unmount or `allow-discrete` on the top layer, which changes focus timing. Entry only.

## Design

Every new rule sits inside the existing gate, unchanged:

```css
@media (prefers-reduced-motion: no-preference) {
  :where(:root:not([data-kv-motion='reduce'])) { … }
}
```

so the OS setting and the app's `data-kv-motion="reduce"` both stop it. Nothing needs a `reduce` repeat because these rules never run there.

| Part                                                   | Motion                                                                                       | Duration |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------- |
| Disclosure / accordion chevron                         | skipped: the icon swaps `chevron-up`/`chevron-down`, so CSS cannot rotate it                 | –        |
| Disclosure / accordion panel                           | fades in when it stops being `hidden`                                                        | medium   |
| Tabs: tab                                              | colour and bar (text-decoration/box-shadow) transition                                       | fast     |
| Tabs: panel                                            | fades in on selection                                                                        | medium   |
| Checkbox, radio                                        | background, border, colour; the tick/dot fades in                                            | fast     |
| Switch                                                 | already moves: leave                                                                         | –        |
| Menu popup, listbox popup, autocomplete popup, popover | fades in on `:popover-open`, same keyframes as tooltip. Opacity only: placement never moves  | fast     |
| Menu items, listbox option                             | background-color, color                                                                      | fast     |
| Toast item                                             | fade-in exists: leave (a translate broke the Keyboard story's focus step, so it was dropped) | –        |
| Button                                                 | already transitions: leave                                                                   | –        |

Out of scope: exit animations, height animation, loading indicators, new tokens.

## Accessibility contract

- WCAG 2.3.3 / 2.2.2: nothing runs under `prefers-reduced-motion: reduce` or `data-kv-motion="reduce"`; nothing loops; every duration ≤ `--kv-duration-slow` (240ms); no flashing.
- 1.4.10 / 2.4.11: motion never moves a focused element out of view and never changes layout size (opacity and colour only).
- Focus rings (`outline`) are never transitioned. Border and colour changes between system colours in forced colours are a short fade, which breaks no criterion.
- State stays readable without motion: chevron shape, `aria-expanded`, `aria-selected` are unchanged.

## Tasks

- [x] 1. `packages/theme/theme.css`: add the rules above in the owning sections, inside the gate. No new `@media` block outside the pattern at `theme.css:892`.
- [x] 2. `DESIGN.md`: Motion section (list the parts that move), accordion bullet (~line 425: drop "nothing animates"), menu comment at `theme.css:8124`.
- [x] 3. `.claude/skills/theme-css/SKILL.md:79`: "Placement is never animated; popups fade in, entry only".
- [x] 4. Gates: `vp check`, `theme:check`, `i18n:check` and the four Storybook projects green (stories wait for the fade with `expectAnimationsSettled()`).
- [x] 5. `accessibility-reviewer`: APPROVE.

## Decisions taken

- Entry-only popups and toasts (option 3 rejected).
- `DESIGN.md:425` "nothing animates" reversed at the maintainer's request in this change.
- Disclosure and accordion chevron is skipped: the icon swaps `chevron-up`/`chevron-down`, so CSS cannot rotate it. The panel fades in. Menu trigger chevron has no open rotation either.
- One gated block at the end of `theme.css` holds the new rules (shared `kv-soft-fade-in` keyframes). No table-row hover rule exists, so none was added.
- `.kv-popover-popup` had no default look (the browser's black 2px border showed). Added the `DESIGN.md` Overlays spec (level 3, `xl` radius, `--kv-space-4` padding, 24rem max, forced-colours border). A fix, not part of the motion work.
