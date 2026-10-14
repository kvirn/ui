# Accessibility contract: Breadcrumb

- **APG pattern:** [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/): a `<nav>` named by a label around an ordered list of links.
- **Deviations:** none. The current page is the last item as text (`<span aria-current="page">`), not a link to the page you are on. The APG makes `aria-current` optional when the current item is not a link; here it is set, so the current item is still exposed, and a link to the same page offers nothing to follow. The current page is simply not a Tab stop.
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ol>` and `<li>`. The links are [Link](../link/link.a11y.md): native `<a href>`, rendered by the registered router link.
- **Status:** alpha candidate. Gates green, accessibility-reviewer APPROVE after fixes (2026-10-06); the review of `variant` and `separator` is pending. Manual AT is `pending`.
- **Tests:** `breadcrumb.test.tsx` next to this file. `breadcrumb.stories.tsx` in `apps/storybook/src/components/breadcrumb/`, where `theme.css` is loaded and the wrapping, separators and targets are proved. Design brief: `docs/design/municipality-reference-site.md` (B4) and `DESIGN.md`, Breadcrumb and pagination.

A breadcrumb tells a resident where they are and gives a way up. It adds no `tabindex`, no key handling, no state and no announcement: the links are the focusable parts and own the keys.

## Roles, states, properties

| Part                 | Element / role                           | ARIA                                            | Notes                                                                                                                                                                                                |
| -------------------- | ---------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb.Root`    | `<nav>` → `navigation`                   | `aria-label` from `label` or `breadcrumb.label` | `class="kv-breadcrumb"`. Named, so a screen reader user finds it in the landmarks list. Place it before `<main>`, not in it                                                                          |
| `Breadcrumb.List`    | `<ol>` → `list`                          | `role="list"`                                   | Ordered: the sequence is the meaning. The explicit `role="list"` keeps the list announced in Safari/VoiceOver, which drops it from a list with `list-style: none` (1.3.1 Info and Relationships, A)  |
| `Breadcrumb.Item`    | `<li>` → `listitem`                      | none                                            | Holds a `Breadcrumb.Link`, or the last item's `Breadcrumb.Current`                                                                                                                                   |
| `Breadcrumb.Link`    | `<a href>` → `link`                      | none                                            | A thin wrapper over `Link.Root`: the registered router link, the same props and `ref`                                                                                                                |
| `Breadcrumb.Current` | `<span>`                                 | `aria-current="page"`                           | The page you are on: text, the last item, never a link. One `aria-current` per trail                                                                                                                 |
| Separators           | CSS generated content, `::before`        | none                                            | Empty alternative text, so never read. The chevron mirrors in RTL. Not in the markup. `variant="slash"` adds `kv-breadcrumb--slash` to the root and swaps the character                              |
| Custom separator     | `<span class="kv-breadcrumb-separator">` | `aria-hidden="true"`                            | From `Breadcrumb.Root`'s `separator`, in every item; the theme hides the first one. Replaces the generated one. Decoration only: never interactive or focusable, and never in the accessibility tree |
| Parts                | `as` on `Breadcrumb.Link` only           | none                                            | `Link.Root`'s `as`: `as="a"` bypasses the router. `Root`, `List`, `Item` and `Current` have no `as`: the landmark and the list are fixed by the contract                                             |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Native tab order. No key is intercepted, and the arrow keys do nothing.

| Key       | Context               | Action                                                                                             | Test                                                                                                                       |
| --------- | --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Tab       | before / on the trail | Moves to the next link, in order. The current page is not a stop, so the next Tab leaves the trail | `breadcrumb.test.tsx › Breadcrumb keyboard › Tab moves through the links in order and the current page is not a stop`      |
| Shift+Tab | on a link             | Moves to the previous link                                                                         | `breadcrumb.test.tsx › Breadcrumb keyboard › Shift+Tab moves to the previous link`                                         |
| Enter     | on a link             | Follows it: a router link navigates without a page load, and focus stays on the link               | `breadcrumb.test.tsx › Breadcrumb keyboard › Enter follows a link through the registered router link, without a page load` |
| Space     | on a link             | Not handled (a link: the page scrolls natively)                                                    | `breadcrumb.test.tsx › Breadcrumb keyboard › Space is not handled`                                                         |

## Focus management

- Initial focus: not moved. Focus is never moved by the component.
- Trap: no. Restore to: not applicable.
- A link shows the focus ring (`:focus-visible`), through `Link`.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

The landmark name is the only string: `breadcrumb.label` (en `You are here`, sv `Du är här` (You are here), fi `Olet tässä` (You are here)). Override it with `label`, `messages` or a provider. The current page's `aria-current="page"` is read with its text.

## Consumer responsibilities

- **List every level from the home page to the current page's parent,** each a link, then the current page as `Breadcrumb.Current`. It never collapses into "…": a hidden level is a hidden way out (2.4.8 Location, AAA, beyond the AA bar). The default theme wraps it.
- **Do not link the current page,** and mark no other item `aria-current`.
- **Link text is the page's title:** "Start", not "Home link" or "Click here" (2.4.4 Link Purpose (In Context), A).
- **Put it in the same place on every page that has one.** The trail is repeated on many pages, and people look for it in the same spot.
- **Breadcrumb supports, but doesn't satisfy, 2.4.5 Multiple Ways (AA).** The site needs search or a site map as well.
- **Name two navigations differently** when a page has another `<nav>`: this one is named `You are here`, so the other is not.
- **Language.** A custom `label` is your own string: put it in a nested `KvirnProvider` with `useLocale().localeProps` on your own element if it differs from the page (3.1.2 Language of Parts, AA).
- **A custom `separator` is decorative.** It is `aria-hidden`; if it needs a name, it is not a separator. Never put anything interactive or focusable in it (`aria-hidden` over focusable content is a mistake). The built-in `chevron-forward` mirrors itself in RTL; a registered or own icon needs `mirrorInRtl`. It is never the only cue between levels: the items are separate list items (1.4.1 Use of Color, A).
- **Keep the look in a custom theme.** See Visual / modes.

## Visual / modes

- Focus indicator: a link shows the focus ring (`:focus-visible`), through `Link`.
- Target size: at least 24 by 24 pixels (2.5.8 Target Size (Minimum), AA).
- Separators: the first item's separator is hidden (it is rendered in every item). A separator is never the only cue between levels, because the items are separate list items (1.4.1 Use of Color, A).
- Reflow: the trail wraps at 320 pixels wide (1.4.10 Reflow, AA), proved in the stories.
- Forced colours and reduced motion: not yet checked by an automated test.

A custom theme must keep these.

## WCAG SCs covered

1.1.1 Non-text Content (A): the separator is decoration, never read. 1.3.1 Info and Relationships (A): a landmark, an ordered list, the current page. 1.4.1 Use of Color (A): the current page is text in a heavier weight plus `aria-current`, not colour. 1.4.10 Reflow (AA): wraps at 320 pixels wide. 1.4.11 Non-text Contrast (AA): a custom separator is decoration, so it has no contrast need. 2.4.4 Link Purpose (In Context) (A): the link text is the page's title. 2.5.8 Target Size (Minimum) (AA). 3.1.2 Language of Parts (AA): a custom `label` in another language is marked by the consumer. 4.1.2 Name, Role, Value (A). 2.4.8 Location (AAA, beyond the AA bar): the trail shows where the page sits. Designed and tested to meet WCAG 2.2 AA.

## AT test record

| AT + browser + OS                        | Agent check | Human check | Result  | Notes |
| ---------------------------------------- | ----------- | ----------- | ------- | ----- |
| **Core (required for beta)**             |             |             |         |       |
| Windows Contrast Themes + Edge           | pending     | pending     | pending |       |
| Keyboard only / 400% zoom / 320px reflow | pending     | pending     | pending |       |
| VoiceOver + Safari + macOS               | pending     | pending     | pending |       |
| VoiceOver + Safari + iOS                 | pending     | pending     | pending |       |
| TalkBack + Chrome + Android              | pending     | pending     | pending |       |
| NVDA + Chrome + Windows                  | pending     | pending     | pending |       |
| NVDA + Firefox + Windows                 | pending     | pending     | pending |       |
| Narrator + Edge + Windows                | pending     | pending     | pending |       |
| **Release (before 1.0 and each minor)**  |             |             |         |       |
| JAWS + Chrome + Windows                  | pending     | pending     | pending |       |
| Dragon / Voice Control                   | pending     | pending     | pending |       |

## Message keys

`breadcrumb.label` (all five locales; fi, nb and nn are drafts for native review).
