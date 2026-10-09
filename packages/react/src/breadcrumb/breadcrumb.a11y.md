# Accessibility contract: Breadcrumb

- **APG pattern:** [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/): a `<nav>` named by a label around an ordered list of links.
- **Deviations:** the current page is the last item as text (`<span aria-current="page">`), not a link to the page you are on. The APG example puts `aria-current` on a link; the span still exposes the current item, and a link to the same page offers nothing to follow. Not a keyboard deviation: the current page is simply not a Tab stop.
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ol>` and `<li>`. The links are [Link](../link/link.a11y.md): native `<a href>`, rendered by the registered router link.
- **Status:** alpha candidate (Plan 0062). Gates pending, accessibility-reviewer `pending`. Manual AT is `pending`.
- **Tests:** `breadcrumb.test.tsx` next to this file. `breadcrumb.stories.tsx` in `apps/storybook/src/components/breadcrumb/`, where `theme.css` is loaded and the wrapping, separators and targets are proved. Design brief: `docs/design/municipality-reference-site.md` (B4) and `DESIGN.md`, Breadcrumb and pagination.

A breadcrumb tells a resident where they are and gives a way up. It adds no `tabindex`, no key handling, no state and no announcement: the links are the focusable parts and own the keys.

## Roles, states, properties

| Part                 | Element / role                    | ARIA                                            | Notes                                                                                                                                                                     |
| -------------------- | --------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Breadcrumb.Root`    | `<nav>` → `navigation`            | `aria-label` from `label` or `breadcrumb.label` | `class="kv-breadcrumb"`. Named, so a screen reader user finds it in the landmarks list. Place it before `<main>`, not in it. `aria-labelledby` also names it              |
| `Breadcrumb.List`    | `<ol>` → `list`                   | `role="list"`                                   | Ordered: the sequence is the meaning. The explicit `role="list"` keeps the list announced in Safari/VoiceOver, which drops it from a list with `list-style: none` (1.3.1) |
| `Breadcrumb.Item`    | `<li>` → `listitem`               | none                                            | Holds a `Breadcrumb.Link`, or the last item's `Breadcrumb.Current`                                                                                                        |
| `Breadcrumb.Link`    | `<a href>` → `link`               | none                                            | A thin wrapper over `Link.Root`: the registered router link, the same props and `ref`                                                                                     |
| `Breadcrumb.Current` | `<span>`                          | `aria-current="page"`                           | The page you are on: text, the last item, never a link. One `aria-current` per trail                                                                                      |
| Separators           | CSS generated content, `::before` | none                                            | Empty alternative text, so never read. Mirrored in RTL. Not in the markup                                                                                                 |
| Parts                | `as` on `Breadcrumb.Link` only    | none                                            | `Link.Root`'s `as`: `as="a"` bypasses the router. `Root`, `List`, `Item` and `Current` have no `as`: the landmark and the list are fixed by the contract                  |

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
- A link shows the token focus ring (`:focus-visible`), through `Link`.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

The landmark name is the only string: `breadcrumb.label` (en `You are here`, sv `Du är här`, fi `Olet tässä`). Override it with `label`, `messages` or a provider. The current page's `aria-current="page"` is read with its text.

## Consumer responsibilities

- **List every level from the home page to the current page's parent,** each a link, then the current page as `Breadcrumb.Current`. It never collapses into "…": a hidden level is a hidden way out (2.4.8). The default theme wraps it.
- **Do not link the current page,** and mark no other item `aria-current`.
- **Link text is the page's title:** "Start", not "Home link" or "Click here" (2.4.4).
- **Name two navigations differently** when a page has another `<nav>`: this one is named `You are here`, so the other is not.
- **Language.** A custom `label` is your own string: set `lang` if it differs from the page (3.1.2).
- **The look.** Targets of at least 24px (2.5.8), a separator that is not the only cue, the wrap at 320px (1.4.10): the theme does it, and a custom theme must keep them.

## WCAG SCs covered

1.3.1 (structure: a landmark, an ordered list, the current page), 1.4.1 (the current page is text in a heavier weight plus `aria-current`, not colour), 1.4.10 (wraps at 320px), 2.4.4 (link purpose), 2.4.5 (a second way to locate a page), 2.4.8 (location), 2.5.8 (target size), 4.1.2 (name, role, value). Designed and tested to meet WCAG 2.2 AA.

## Message keys

`breadcrumb.label` (all six locales; fi, nb and nn are drafts for native review, se is an English placeholder).
