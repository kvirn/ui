# Plan 0062: Breadcrumb and Pagination

- **Status:** Approved
- **Owner:** component-engineer (agent)
- **Created:** 2026-10-06 · **Target:** M3 (alpha candidate)
- **Related:** [0053](0053-docs-as-municipality-site.md) (blocks B4 and B17), [0043](0043-navigation-and-service-link.md) (the reference: labelled `<nav>`, list, Link), `docs/design/municipality-reference-site.md` §4 and §7, APG [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

## Goal

A resident sees where they are on the site and can go up a level (Breadcrumb), and can move through a long list page by page (Pagination), by keyboard, by screen reader and without colour. Both render real links through the app's registered router link, so they work with Next.js and TanStack Router.

## Non-goals

- A page-range helper (which numbers and gaps to show): the adopter computes them. A core helper can follow if three adopters ask.
- A collapsing breadcrumb ("…"): a hidden level is a hidden way out (spec §4). It wraps instead.
- Buttons and client-side paging state: pagination is URLs, so Back and sharing work.
- Search results count announcements (M4 search block). Docs pages (a later step, `apps/docs` is untouched).

## Background

APG Breadcrumb: a `<nav>` with a name, an ordered list of links, `aria-current="page"` on the current page's link. The spec's variant: the current page is the last item, plain text with `aria-current="page"`, never a link to the page you are on. Pagination has no APG pattern: a labelled `<nav>` with a list of links, the current one marked `aria-current="page"` (GOV.UK, Designsystemet). WCAG: 1.3.1, 1.4.1, 1.4.10, 2.4.4, 2.4.8, 2.5.3, 2.5.8, 4.1.2.

## Design

### API sketch

```tsx
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item><Breadcrumb.Link href="/">Start</Breadcrumb.Link></Breadcrumb.Item>
    <Breadcrumb.Item><Breadcrumb.Link href="/barn">Barn och utbildning</Breadcrumb.Link></Breadcrumb.Item>
    <Breadcrumb.Item><Breadcrumb.Current>Förskola</Breadcrumb.Current></Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>

<Pagination.Root>
  <Pagination.List>
    <Pagination.Item><Pagination.Previous href="?sida=1" /></Pagination.Item>
    <Pagination.Item><Pagination.Link page={1} href="?sida=1" /></Pagination.Item>
    <Pagination.Item><Pagination.Link page={2} href="?sida=2" current /></Pagination.Item>
    <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
    <Pagination.Item><Pagination.Link page={9} href="?sida=9" /></Pagination.Item>
    <Pagination.Item><Pagination.Status page={2} total={9} /></Pagination.Item>
    <Pagination.Item><Pagination.Next href="?sida=3" /></Pagination.Item>
  </Pagination.List>
</Pagination.Root>
```

`useBreadcrumb({ label, messages })` returns `rootProps`, `listProps`, `itemProps`, `currentProps`, `label`. `usePagination({ label, messages })` returns `rootProps`, `listProps`, `itemProps`, `ellipsisProps`, `statusProps`, `label`, `previousLabel`, `nextLabel`, `getPageLabel(page, isCurrent)`, `getStatus(page, total)`. Both namespaces are frozen objects, not callable. `Link`-based parts (`Breadcrumb.Link`, `Pagination.Link`, `Previous`, `Next`) are thin typed wrappers over `Link.Root` (router-aware, `ref`, `render`), with their own display names.

### Accessibility contract (draft)

Full contracts: `packages/react/src/breadcrumb/breadcrumb.a11y.md` and `packages/react/src/pagination/pagination.a11y.md`. Focus strategy: native. Selection follows focus: n/a. Arrows wrap: n/a. Shortcuts: none.

| Key       | Context     | Action                                              |
| --------- | ----------- | --------------------------------------------------- |
| Tab       | before / on | Moves to the next link; the current page is no stop |
| Shift+Tab | on a link   | Moves to the previous link                          |
| Enter     | on a link   | Follows it (native)                                 |
| Space     | on a link   | Not handled (native)                                |

- Roles / ARIA: `<nav aria-label>` (landmark, named), `<ol>` (breadcrumb: the order is the meaning) or `<ul>` (pagination) of `<li>`; current page `aria-current="page"` (Breadcrumb: the last item's `<span>`; Pagination: the page's link, which stays a link). Separators and arrows are CSS generated content with empty alternative text, never read.
- Focus management: none moved. Ellipsis and Status are not focusable.
- Announcements: none live. Page links are named `Page 2` (`pagination.page`) and the current one `Page 2, current page` (`pagination.currentPage`): the visible digit is in the name (2.5.3).
- WCAG SCs: 1.3.1, 1.4.1 (current page is a filled shape plus `aria-current`, not colour), 1.4.10 (wraps), 2.4.4, 2.4.8, 2.5.3, 2.5.8 (44px targets), 4.1.2.

### i18n strings

| Key                      | en                        | sv                        | fi                         |
| ------------------------ | ------------------------- | ------------------------- | -------------------------- |
| `breadcrumb.label`       | You are here              | Du är här                 | Olet tässä                 |
| `pagination.label`       | Pages                     | Sidor                     | Sivut                      |
| `pagination.previous`    | Previous page             | Föregående sida           | Edellinen sivu             |
| `pagination.next`        | Next page                 | Nästa sida                | Seuraava sivu              |
| `pagination.status`      | Page {page} of {total}    | Sida {page} av {total}    | Sivu {page}/{total}        |
| `pagination.page`        | Page {page}               | Sida {page}               | Sivu {page}                |
| `pagination.currentPage` | Page {page}, current page | Sida {page}, aktuell sida | Sivu {page}, nykyinen sivu |

nb: `Du er her`, `Sider`, `Forrige side`, `Neste side`, `Side {page} av {total}`, `Side {page}`, `Side {page}, gjeldende side`. nn: `Du er her`, `Sider`, `Førre side`, `Neste side`, `Side {page} av {total}`, `Side {page}`, `Side {page}, noverande side`. se: English placeholders (a native speaker still has to write them); fi, nb and nn are drafts for native review. Numbers go through `format.number`.

### Theming surface

Classes: `kv-breadcrumb`, `-list`, `-item`, `-link`, `-current`; `kv-pagination`, `-list`, `-item`, `-link` (page), `-previous`, `-next`, `-ellipsis`, `-status`. State is `aria-current`. No new tokens or colour pairs (see DESIGN.md "Breadcrumb and pagination", marked for maintainer review). Breadcrumb: a wrapping row, separator drawn with `::before` and mirrored in RTL, 24px minimum targets via the link's own padding. Pagination: a wrapping row of 44px targets, the current page a solid `primary` fill (the Navigation current look); below 40rem only Previous, the current page, Status and Next show (the other page links and ellipsis leave the accessibility tree with `display: none`). Forced colours: a `LinkText` bar replaces the fill.

## Tasks

- [x] Plan, README row
- [x] Tests first: `breadcrumb.test.tsx`, `pagination.test.tsx`, naming rows
- [x] Contracts `breadcrumb.a11y.md`, `pagination.a11y.md`
- [x] Hooks `use-breadcrumb.ts`, `use-pagination.ts`, components, exports in `index.ts`
- [x] i18n: `breadcrumb`, `pagination` in `types.ts` and all six locales
- [x] Theme classes in `theme.css` (section 8c), not-prose lists, forced colours
- [x] Stories (every state, RTL, forced colours, 320px, Keyboard, `a11yContract`)
- [x] Package guides `breadcrumb.md`, `pagination.md`; DESIGN.md proposal; class contract line
- [x] Changeset; roadmap row
- [ ] AT matrix run (stays `pending`); accessibility-reviewer (pending)

## Decisions

- **Labels follow the approved spec** (`You are here`, `Pages`), not the bare `Breadcrumb` and `Pagination`: a landmark name says what it is for, and the spec has the wording in sv and fi.
- **The current breadcrumb is a `<span aria-current="page">`** (`Breadcrumb.Current`), not a link to itself (spec §4). APG puts `aria-current` on a link; a page you are on offers no useful link, and the span still exposes the current item.
- **`Pagination.Link` keeps `aria-current="page"` on a link** (it is a URL, so reload and copy still work), named by `pagination.currentPage`.
- **Page links get `aria-label`** from messages (`Page 2`): a bare "2" is no name for a link in a links list (2.4.4). The visible digit stays inside the name (2.5.3). A `children` override replaces the digit and the `aria-label` too: the visible text is the name (review fix, 2.5.3).
- **Ellipsis is visible text with no `aria-hidden`:** hiding it would leave an empty list item to a screen reader. It is a `<span>` inside an `Item`.
- **Narrow layout is CSS, not a prop:** the status item and the page items are told apart with `:has()` on their part class, as the Navigation trail is. The page links hide with `display: none`, so they also leave the Tab order below 40rem.
- **No page-range helper in `core`** (scope): the adopter lists the pages. Recorded as a possible follow-up.
- **No dev warnings** are added: the nav name has a default, so a nameless landmark can't happen without an explicit empty override, which `useMessages` already warns about.
- **Story strings follow the locale toolbar through a `KvirnProvider` decorator** (`withLocale` in each story folder's fixture), because the preview sets the locale but no catalog.
- **`PaginationPartState`, not `PaginationState`,** is the render-state type: `PaginationState` is TanStack Table's and already exported. The api-conventions skill says so.
- **A separator is `content` with an empty alternative** (`'›' / ''`), mirrored with `:dir(rtl)`: AT never reads it and no markup is added.
- **fi, nb, nn are drafts, se is an English placeholder**: noted in each locale header.

## Risks & open questions

- `content: … / ''` (alternative text for generated content) is Baseline 2023; older engines show the separator and may read it. A fallback to a border-drawn chevron is possible if the support range needs it.
- `:dir(rtl)` is used, as elsewhere in the theme (listbox, icon).
- The narrow pagination layout follows the viewport (`40rem` media query), so a 320px column in the Storybook preview cannot show it. It is a manual check and Plan 0051's sweep.

## Testing strategy

Component tests in Chromium (roles, names, `aria-current`, list structure, messages in six locales, router link registration, keyboard rows, `render`, ref, className, axe). Stories prove the look (320px, RTL, forced colours, 44px targets, no overflow).

## Rollout

Minor changeset: `@kvirn-ui/react`, `@kvirn-ui/i18n`, `@kvirn-ui/theme`.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated

## Review fixes (a11y review)

- `Pagination.Link` with own `children` sets no default `aria-label` (2.5.3). `Pagination.List` and `Breadcrumb.List` carry `role="list"`. Narrow layout text corrected to include the current page.
