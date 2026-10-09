# Accessibility contract: Pagination

- **APG pattern:** none. A labelled `<nav>` around a list of links is plain HTML; the current page is marked with `aria-current="page"` as in GOV.UK and Designsystemet.
- **Deviations:** none. Pages are URLs, so each is a link and none is a button: Back, sharing and opening in a new tab work.
- **Native elements used:** `<nav>` (the `navigation` landmark), `<ul>` and `<li>`. The links are [Link](../link/link.a11y.md): native `<a href>`, rendered by the registered router link.
- **Status:** alpha candidate (Plan 0062). Gates pending, accessibility-reviewer `pending`. Manual AT is `pending`.
- **Tests:** `pagination.test.tsx` next to this file. `pagination.stories.tsx` in `apps/storybook/src/components/pagination/`, where `theme.css` is loaded and the targets and the current page's shape are proved. The narrow layout (below 40rem) is a manual check, `pending`, plus Plan 0051's sweep: a 320px column in a wide preview can't trigger the media query. Design brief: `docs/design/municipality-reference-site.md` (B17) and `DESIGN.md`, Breadcrumb and pagination.

Pagination lets a resident move through a long list. It adds no `tabindex`, no key handling and no live announcement: the links are the focusable parts and own the keys. Which numbers and gaps to show is the consumer's.

## Roles, states, properties

| Part                  | Element / role              | ARIA                                                                                            | Notes                                                                                                                                                                                                                                                                                                                    |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Pagination.Root`     | `<nav>` → `navigation`      | `aria-label` from `label` or `pagination.label`                                                 | `class="kv-pagination"`. Named, and distinct from the main navigation and the breadcrumb                                                                                                                                                                                                                                 |
| `Pagination.List`     | `<ul>` → `list`             | `role="list"`                                                                                   | The count of items is announced. The explicit `role="list"` keeps the list announced in Safari/VoiceOver, which drops it from a list with `list-style: none` (1.3.1)                                                                                                                                                     |
| `Pagination.Item`     | `<li>` → `listitem`         | none                                                                                            | Holds one link, the gap or the status                                                                                                                                                                                                                                                                                    |
| `Pagination.Link`     | `<a href>` → `link`         | `aria-label` `Page N` (none with your own `children`); `aria-current="page"` on the current one | A page: shows the number, named `Page 2`. `current` adds `aria-current`, which a screen reader announces itself, so the name does not repeat it. The visible number is in the name (2.5.3). Your own `children` replace the number and the `aria-label`, so the visible text is the name. It stays a link and a Tab stop |
| `Pagination.Previous` | `<a href>` → `link`         | none                                                                                            | Visible words `Previous page`, `rel="prev"`. An arrow drawn by the theme is CSS content with an empty alternative                                                                                                                                                                                                        |
| `Pagination.Next`     | `<a href>` → `link`         | none                                                                                            | Visible words `Next page`, `rel="next"`                                                                                                                                                                                                                                                                                  |
| `Pagination.Ellipsis` | `<span>`                    | none                                                                                            | The text `…` for a gap in the numbers. Not a link, not focusable                                                                                                                                                                                                                                                         |
| `Pagination.Status`   | `<span>`                    | none                                                                                            | Text such as `Page 2 of 9`. Shown with Previous, Next and the current page below 40rem, where the other numbers are hidden. Without it a narrow screen has no total (warning `pagination-status-missing`)                                                                                                                |
| Parts                 | `as` on the link parts only | none                                                                                            | The link parts are `Link.Root` wrappers with the same props, `ref` and `as` (`as="a"` bypasses the router). `Root`, `List`, `Item`, `Ellipsis` and `Status` have no `as`: the landmark and the list are fixed by the contract                                                                                            |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Native tab order. No key is intercepted, and the arrow keys do nothing.

| Key       | Context               | Action                                                                                            | Test                                                                                                                          |
| --------- | --------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Tab       | before / on the pages | Moves to the next link in order, the current page included. The ellipsis and status are not stops | `pagination.test.tsx › Pagination keyboard › Tab moves through every link in order, and the ellipsis and status are no stops` |
| Tab       | on the current page   | The current page is a link, so it is a Tab stop                                                   | `pagination.test.tsx › Pagination keyboard › the current page is a link and a Tab stop`                                       |
| Shift+Tab | on a link             | Moves to the previous link                                                                        | `pagination.test.tsx › Pagination keyboard › Shift+Tab moves to the previous link`                                            |
| Enter     | on a link             | Follows it: a router link navigates without a page load, and focus stays on the link              | `pagination.test.tsx › Pagination keyboard › Enter follows a link through the registered router link, without a page load`    |
| Space     | on a link             | Not handled (a link: the page scrolls natively)                                                   | `pagination.test.tsx › Pagination keyboard › Space is not handled`                                                            |

## Focus management

- Initial focus: not moved. Focus is never moved by the component. After a client-side navigation the consumer's route handling moves focus to the new content (`useRouteFocus`, 2.4.3).
- Trap: no. Restore to: not applicable.
- A link shows the token focus ring (`:focus-visible`), through `Link`.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Pagination announces nothing itself. A page change is announced by the page's own heading and route announcement. Strings: `pagination.label`, `previous`, `next`, `status` (`{page}`, `{total}`) and `page` (`{page}`). Page numbers go through the locale's number format.

## Consumer responsibilities

- **Every page is a URL** (a query or a path), so Back, a bookmark and "open in new tab" work. No `onClick` that pages without changing the address.
- **Mark exactly one page `current`,** and give the page links consecutive numbers in order. Keep the first and last page and the pages next to the current one, with `Pagination.Ellipsis` for each gap.
- **Previous and Next are omitted** (not disabled) on the first and last page: a disabled link is not a thing.
- **Render `Pagination.Status` as well** so the narrow layout has its text: it is hidden by the theme from 40rem.
- **Language.** A custom `children` or `messages` string is your own: set `lang` if it differs from the page (3.1.2). Changing a visible label also changes its name (2.5.3). A page link with your own `children` has no `aria-label`: the text you write is the name, so it must contain the visible name: an icon-only or `aria-hidden`-only child leaves the link unnamed.
- **The look.** 44px targets (24px at minimum, 2.5.8), a current page that is a shape and `aria-current` and never colour alone (1.4.1), the wrap at 320px (1.4.10): the theme does it, and a custom theme must keep them.

## WCAG SCs covered

1.3.1 (a landmark and a list), 1.4.1 (the current page is a filled shape and a weight, not colour), 1.4.10 (wraps, and below 40rem only Previous, the current page, status and Next), 2.4.3, 2.4.4 (link purpose: `Page 2`), 2.4.8, 2.5.3 (the visible number in the name), 2.5.8 (target size), 4.1.2 (name, role, value). Designed and tested to meet WCAG 2.2 AA.

## Message keys

`pagination.label`, `pagination.previous`, `pagination.next`, `pagination.status`, `pagination.page` (all six locales; fi, nb and nn are drafts for native review, se is English placeholders).
