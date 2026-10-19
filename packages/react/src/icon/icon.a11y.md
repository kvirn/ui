# Accessibility contract: Icon

- **APG pattern:** none. An SVG graphic, decorative or `role="img"` ([SVG-AAM](https://www.w3.org/TR/svg-aam-1.0/), [WAI images tutorial](https://www.w3.org/WAI/tutorials/images/)).
- **Deviations:** none
- **Native elements used:** `<svg>`. Icon is never interactive.
- **Status:** alpha candidate. Accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `icon.test.tsx` and `svg-icon.test.tsx` next to this file, and the icon-only rows in `button.test.tsx`. `icon.stories.tsx` in `apps/storybook/src/components/icon/`.

An icon is decorative by default: text next to it already says what it means, so it's hidden from assistive technology. With a `label`, it's an image with that name. Icons come from the app's registry (`KvirnProvider icons`), from a drawing or component reference (`icon`, with no registration; a registered `name` wins over it), or from `as` (your own component) and children for one-offs. Every route is hidden unless there is a `label`, and Icon's `aria-hidden` replaces a library's own. An icon drawn from icon data also carries `focusable="false"` when decorative. With `as`, the component gets the props as plain props, and Icon's `aria-hidden`, `role` and `aria-label` win over any of the same name: it must spread them on its `<svg>` and take a `ref`. Icon's own options (`size`, `label`) do not reach it under their own names. **Allowed elements:** none to list: `as` is a component that draws an `<svg>`.

## Roles, states, properties

| Part | Element / role                | ARIA                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icon | `<svg>`, no role              | `aria-hidden="true"`                                 | Default: decorative. `class="kv-icon kv-icon--size-20"`, `width` and `height` in rem                                                                                                                                                                                                                                                                                                                                          |
|      | `<svg>` → `img`, with `label` | `role="img"`, `aria-label={label}`, no `aria-hidden` | A library's own `aria-hidden` (Heroicons, Lucide) is removed. `aria-label`, `aria-hidden` and `role` can't be passed directly: `label` sets them. `tabIndex`, `onClick`, `aria-labelledby` and `aria-describedby` are type errors too, because an icon takes no focus, press or description: put them on the control around it (`icon.test.tsx › tabIndex, onClick, aria-labelledby and aria-describedby are not Icon props`) |
|      | unregistered `name` + `icon`  | as the `icon`                                        | Draws the `icon` with no warning (`icon.test.tsx › an unregistered name with an icon renders the icon without a warning`). A registered entry under the name keeps the `icon`'s RTL flip (`› a plain registered component under a name keeps the mirroring of the icon it replaces`)                                                                                                                                          |
|      | unknown `name`, no `icon`     | `aria-hidden="true"`, empty                          | Sized like the icon, so nothing moves. A dev warning names the missing icon. With a `label` it is still `role="img"` with that name, so a screen-reader user keeps the name and the warning flags the bug                                                                                                                                                                                                                     |
|      | `data-mirror-in-rtl`          | none                                                 | State for CSS: whether the icon flips in right-to-left text                                                                                                                                                                                                                                                                                                                                                                   |

`useIcon` gives the same `iconProps`, and the component for a name, for your own `<svg>`.

### SvgIcon (`@kvirn-ui/icons/react`)

The standalone component for apps without KvirnUI. It has no hooks or context and takes `icon` (icon data), `size` and `title`, plus SVG props. Its roles:

- Decorative (no name): `aria-hidden="true"`, `focusable="false"`, no `role`. This is the default.
- `aria-label`, `aria-labelledby` or a non-empty `title`: `role="img"`, named, no `aria-hidden`. `title` is a `<title>` child; `aria-labelledby` names by id.
- An empty string for any of the three: an empty name is no name, so the icon stays decorative.

No keyboard stops: Tab and Shift+Tab never reach an `<svg>` (`focusable="false"`). WCAG 1.1.1 Non-text Content (A), 4.1.2 Name, Role, Value (A).

## Keyboard

This component has no focusable parts and handles no keys.

| Key       | Context | Action                                                 | Test                                                          |
| --------- | ------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Tab       | Icon    | Never stops on an icon: no `tabindex`, never focusable | `icon.test.tsx › keyboard › Tab never stops on an icon`       |
| Shift+Tab | Icon    | Never stops on an icon when moving backwards           | `icon.test.tsx › keyboard › Shift+Tab never stops on an icon` |

An icon that does something belongs inside a `Button` or `Link`, which is the focusable element.

## Focus management

- Initial focus: not moved.
- Trap: no.
- Restore to: not applicable.
- Never obscured by: Icon renders no overlay.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Icon has no strings of its own. A `label` comes from your own translations, or for a library icon that stands alone from `useIconLabel(name)`: the `icons.<name>` message, overridable per provider and per instance (`messages` argument). It returns `undefined` for an icon without a label key, which stays decorative. A label is never applied silently: `Icon` does not read it by itself (`use-icon-label.test.tsx`).

### Read aloud

Approximated by `@kvirn-ui/testing`'s `readAloud` (English); not NVDA or JAWS output. AT `pending`.

| State or action                   | Expected phrase(s) as read aloud | Live region politeness | Test                                                                                     |
| --------------------------------- | -------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| Decorative                        | nothing                          | none                   | `svg-icon.test.tsx › a decorative icon is not read aloud`                                |
| `aria-label="Add"`                | `image, Add`                     | none                   | `svg-icon.test.tsx › an icon with an aria-label is read as an image with that name`      |
| `aria-labelledby` a label element | `image, Add`                     | none                   | `svg-icon.test.tsx › an icon with an aria-labelledby is read as an image with that name` |
| `title="Add"`                     | `image, Add`                     | none                   | `svg-icon.test.tsx › an icon with a title is read as an image with that name`            |
| Empty `aria-label`                | nothing                          | none                   | `svg-icon.test.tsx › an empty name stays decorative and is not read aloud`               |

## Consumer responsibilities

- Give an icon that carries meaning on its own a `label` (1.1.1 Non-text Content, A): a status icon with no text beside it, say. Give it a `label` only when no text next to it says the same thing: an icon with a label next to the same text is read twice. A decorative icon needs none.
- Name an icon-only `Button` with an `aria-label` (or `aria-labelledby`) from your translations, and keep the icon decorative. In development, Button warns when it has no name. Use icon-only buttons only for universally known actions: close, search, menu, copy (copy always with a Tooltip). For anything else, prefer visible text.
- A `variant` (`primary`, `secondary`, `accent`, `muted`, `info`, `success`, `warning`, `danger`) only decorates and never replaces words, and never changes the name, role or state. Give a meaningful or status icon at least `'20'`, and `'24'` with `kv-icon--stroke-1`. Forced colours drop the variant.
- Never convey status by an icon's colour alone: the status icons differ in shape, and status always comes with text (1.4.1 Use of Color, A).
- Give a meaningful icon (one with a `label`) at least 3:1 contrast against its background (1.4.11 Non-text Contrast, AA). `currentColor` follows the text colour, which already has at least 4.5:1 contrast in the default theme, and every variant is measured at 3:1 or more on canvas, surface and surface-raised in all four themes (`iconVariantPairs`).
- Set `mirrorInRtl` only on directional icons (arrows, chevrons), never on a tick, a logo or anything with text in it.
- Register or pass components that forward their ref and spread SVG props onto one `<svg>`. An icon from `@kvirn-ui/icons` is plain data and needs nothing.

## Visual / modes

- Focus indicator: not applicable. Icon is never focusable.
- Target size: not applicable. An icon-only button's target is the Button's: the default theme makes an icon-only button square and larger than the 24 by 24 pixel minimum (2.5.8 Target Size (Minimum), AA).
- Forced colours: icons draw in the text colour (`currentColor`), which follows the system colour. The default theme turns an explicit `fill`, `stroke` or `color` on `.kv-icon` (set by your own CSS) into `currentColor` in forced-colours mode, so a hard-coded colour can't vanish. Colours on child shapes are kept, so forced-colours contrast for a multi-colour, meaningful SVG is the consumer's job. Icon has no `fill` or `stroke` option: a one-off SVG sets `fill="currentColor"` on its own shapes, or it draws black in forced colours.
- Reduced motion: icons do not move. The one exception is the `spinner` icon with the consumer-added class `kv-animate-spinner`: it crawls only under `prefers-reduced-motion: no-preference`, and the app owns the 2.2.2 Pause, Stop, Hide control (the stop CSS is on the Theming page, "Moving indicators and WCAG 2.2.2").
- Text resize and reflow: icon sizes are in rem (`width` and `height`, plus a `kv-icon--size-<px>` class), so they scale with browser zoom and the user's root font size, not with the surrounding text. 1.4.4 Resize Text (AA) holds because text resizes and icons aren't text. The largest icon is 6rem, so no horizontal scrolling is expected at 320 CSS px, which the `storybook-reflow` sweep runs every story at 320 CSS px and fails on horizontal overflow (1.4.10 Reflow, AA). An automated test checks that the default size, 20, is 1.25rem.

## WCAG SCs covered

- 1.1.1 Non-text Content (A): decorative icons are hidden, meaningful ones have a `label`.
- 1.3.1 Info and Relationships (A): an icon adds no structure.
- 1.4.1 Use of Color (A): the status icons differ in shape.
- 1.4.4 Resize Text (AA), 1.4.10 Reflow (AA): rem sizes, at most 6rem.
- 1.4.11 Non-text Contrast (AA): the adopter's job, with the text colour by default.
- 4.1.2 Name, Role, Value (A): `role="img"` with a name, or hidden. Button warns in development about an unnamed icon-only button.

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | icon.stories.tsx, every story, 4 themes                                                                       |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | icon.test.tsx › an unregistered name with an icon renders the icon without a warning; expectNoA11yViolations  |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | icon.test.tsx › keyboard › Tab never stops on an icon                                                         |
| Focus order and management                                                 | n/a         | n/a         | n/a     | nothing focusable: the component never takes or moves focus                                                   |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | pass        | n/a         | pass    | the four sweep projects (`storybook-forced-colors`, `-reduced-motion`, `-reflow`, `-text-spacing`), run in CI |
| **Core (required for beta)**                                               |             |             |         |                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                               |

## Known issues

- Whether `var()` works in the `fill` and `stroke` attributes of your own shapes is up to the browser, not Icon. No test covers it.
- react-icons applies its own `size` after Icon's `width` and `height`. Size react-icons on the element.
