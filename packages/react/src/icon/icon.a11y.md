# Accessibility contract: Icon

- **APG pattern:** none. An SVG graphic, decorative or `role="img"` ([SVG-AAM](https://www.w3.org/TR/svg-aam-1.0/), [WAI images tutorial](https://www.w3.org/WAI/tutorials/images/)).
- **Deviations:** none
- **Native elements used:** `<svg>`. Icon is never interactive.
- **Status:** alpha candidate (Plan 0009). Manual AT is `pending`.
- **Tests:** `icon.test.tsx` next to this file, and the icon-only rows in `button.test.tsx`. `icon.stories.tsx` and `icon.e2e.ts` in `apps/storybook/src/components/icon/`.

An icon is decorative by default: text next to it already says what it means, so it's hidden from assistive technology. With a `label`, it's an image with that name. Icons come from the built-in set, from the app's registry (`KvirnProvider icons`, ADR-0024), or from `render` and children for one-offs.

## Roles, states, properties

| Part | Element / role                    | ARIA                                                 | Notes                                                                                                                                            |
| ---- | --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Icon | `<svg>`, no role                  | `aria-hidden="true"`                                 | Default: decorative. `class="kv-icon"`                                                                                                           |
|      | `<svg>` → `img`, with `label`     | `role="img"`, `aria-label={label}`, no `aria-hidden` | A library's own `aria-hidden` (Heroicons, Lucide) is removed. `aria-label`, `aria-hidden` and `role` can't be passed directly: `label` sets them |
|      | unknown `name`                    | `aria-hidden="true"`, empty                          | Sized like the icon, so nothing moves. A dev warning names the missing icon                                                                      |
|      | `data-size`, `data-mirror-in-rtl` | none                                                 | State for CSS: the size step, and whether the icon flips in right-to-left text                                                                   |

`useIcon` gives the same `iconProps`, and the component for a name, for your own `<svg>`.

## Keyboard

| Key | Context | Action                                                 | Test                                                 |
| --- | ------- | ------------------------------------------------------ | ---------------------------------------------------- |
| Tab | Icon    | Never stops on an icon: no `tabindex`, never focusable | `icon.test.tsx › accessibility › is never focusable` |

Icon handles no keys. An icon that does something belongs inside a `Button` or `Link`, which is the focusable element.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Icon renders no overlay.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Icon has no strings. A `label` comes from your own translations (ADR-0007).

## Consumer responsibilities

- Give an icon a `label` only when no text next to it says the same thing. An icon with a label next to the same text is read twice.
- Name an icon-only `Button` with an `aria-label` (or `aria-labelledby`) from your translations, and keep the icon decorative. In development, Button warns when it has no name (`button.test.tsx › icon-only button name`). Use icon-only buttons only for universally known actions: close, search, menu (DESIGN.md). Until Tooltip exists (M2), prefer visible text.
- Never convey status by an icon's colour alone: the status icons differ in shape, and status always comes with text (1.4.1).
- Give a meaningful icon (one with a `label`) 3:1 contrast against its background (1.4.11). `currentColor` follows the text colour, which already meets 4.5:1 in the default theme.
- Set `mirrorInRtl` only on directional icons (arrows, chevrons), never on a tick, a logo or anything with text in it.
- Register icons that forward their ref and spread SVG props onto one `<svg>`.

## Visual / modes

- Focus indicator: not applicable. Icon is never focusable.
- Target size: not applicable. An icon-only button's target is the Button's: the default theme makes `kv-button--icon-only` square and at least `--kv-button-min-block-size` (2.5.8).
- forced-colors behaviour: icons draw in `currentColor`, which follows the system colour. The default theme turns an explicit `fill`, `stroke` or `color` on `.kv-icon` into `currentColor` in forced-colours mode, so a hard-coded colour can't vanish. Test: `icon.e2e.ts` in `chromium-forced-colors`.
- reduced-motion behaviour: no motion.
- Text resize and reflow: the size steps are `em`, so icons grow with text (1.4.4) and reflow at 320px (1.4.10). Test: `icon.test.tsx › attributes › the md size is 20px next to 16px text and grows with the text`.

## WCAG SCs covered

- 1.1.1 Non-text Content: decorative icons are hidden, meaningful ones have a `label`.
- 1.3.1 Info and Relationships: no structure from icons.
- 1.4.1 Use of Color: status icons differ in shape (built-in set, design spec).
- 1.4.4 Resize Text, 1.4.10 Reflow: `em` sizes.
- 1.4.11 Non-text Contrast: consumer, with `currentColor` by default.
- 4.1.2 Name, Role, Value: `role="img"` with a name, or hidden. Button's dev warning for an unnamed icon-only button.

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |

## Known issues

- `var()` in SVG presentation attributes is verified in Chromium and Firefox, not yet in WebKit (Plan 0009, open question 4).
- With Tabler icons, `stroke` sets the stroke width (Tabler's own prop), not the colour. Use `color`.
- react-icons applies its own `size` after Icon's `width` and `height`. Size react-icons on the element.
