# Plan 0049: TableOfContents

- **Status:** Accepted (the maintainer accepted the plan, 2026-10-05). The visual spec needs the maintainer's approval before any `theme.css` work
- **Owner:** orchestrator → ux-designer → component-engineer → accessibility-reviewer
- **Created:** 2026-10-05 · **Target:** M2
- **Related:** [0047](0047-navigation-t3c-and-horizontal.md) (the item and trail rules), [0048](0048-tabs.md), [design spec](../design/table-of-contents.md), `docs/design/docs-site.md`, `keyboard`, `accessibility`, `api-conventions`, `testing`, `storybook-docs`, `theme-css` skills

## Goal

A reader of a long page sees which section they are in and jumps to another with a plain link. A screen-reader user gets a named landmark and one `aria-current="location"`.

## Non-goals

- A DOM-scanning hook that finds the headings itself (it renders nothing before hydration).
- Sticky layout (placement and stickiness are the consumer's CSS), smooth scroll, moving focus or announcing when the active heading changes.
- A scroll container other than the page.
- A visible title part: the consumer renders the heading and passes `aria-labelledby`.
- Docs-site adoption (a follow-up; `docs/design/docs-site.md:456` then goes stale).

## Background

The repo has no TOC, scroll-spy or `IntersectionObserver`. The only material is a static "On this page" in `docs/design/docs-site.md` (a `<nav aria-labelledby>` with an `h2` and `h2` links, "nothing is sticky", hash links rely on native behaviour, no smooth scroll); the docs site does not build it. Prose, Heading and Section add no ids or anchors, and docs pages hand-write ids.

Core may not touch `window` or `document` (lint `no-restricted-globals`, lifted only in `core/src/env/**`), so observers live in `packages/react` and core holds only pure maths. SSR-safe observers go through `useEnv()` (`packages/react/src/provider/use-env.ts:16`, `undefined` on the server and during hydration); templates are `table/use-scroll-overflow.ts:14`, `table/table.tsx:330-349` and `popup/use-popup.ts:250-300` (a passive scroll listener with an rAF throttle). `Link` supports `current="location"` (`link/use-link.ts:8`) and the theme styles any non-false `[aria-current]` on a navigation link, so the Navigation look already fits.

## Design

### API sketch

```tsx
<h2 id="contents-title">På den här sidan</h2>
<TableOfContents.Root
  aria-labelledby="contents-title"
  offset={64}
  items={[
    { id: 'avgift', label: 'Avgift', level: 2 },
    { id: 'avgift-bostad', label: 'Bostäder', level: 3 },
    { id: 'ansok', label: 'Så ansöker du', level: 2 },
  ]}
/>
```

- Parts: `TableOfContents.Root` `<nav class="kv-table-of-contents">`, `.List` `<ul class="kv-table-of-contents-list">`, `.Item` `<li class="kv-table-of-contents-item">`, `.Link` `<a class="kv-link" href="#id">`. `.Link` uses `useFocusVisible`, not `useLink` (which would resolve the unrelated `link` messages), and never `Link.Root`, so a registered router link is never used.
- With `items` and no children, Root renders the whole nested tree from those parts. A function child `({ tree, activeId }) => ReactNode` replaces it (`<TableOfContents.Link item={node.item} />`). Empty `items` renders nothing: no empty landmark.
- `useTableOfContents({ items, offset = 0, labelledBy, messages })` returns `{ rootProps, tree, activeId, getLinkProps(item) }`.
- Name: `aria-label` from `useMessages('tableOfContents', messages)`. `aria-labelledby` (a prop or `labelledBy`) replaces it, never both. A visible heading is preferred (`navigation.a11y.md:66`).
- Types: `TableOfContentsItem { id, label, level }`, `TableOfContentsNode`, `UseTableOfContentsOptions`, `UseTableOfContentsResult`, the part prop types, `TableOfContentsState { activeId }`. A namespace object with flat exports, as `Navigation`.

### Core (pure, `packages/core/src/table-of-contents/`, exported from `index.ts`, tests first)

- `getTableOfContentsTree(items)`: a stack by `level`. The parent is the nearest earlier item with a smaller level, a skipped level nests one step, a first or shallower item is a root, empty gives `[]`.
- `getActiveHeading({ headings: { id, top }[], offset, isAtEnd? })`: the last heading in document order with `top <= offset + 1`, else `undefined`. `isAtEnd` returns the last heading.

### Observer (`use-table-of-contents.ts`, react only)

- `useEnv()` is `undefined` (server, hydration) or `env.window` has no `IntersectionObserver`: the list renders and nothing is current.
- Otherwise one effect, keyed by `env`, the joined ids (never the array identity) and `offset`. Resolve each id with `getElementById`; a missing one warns and is skipped.
- Observe with `rootMargin: -<offset>px 0 0 0` and `threshold: [0, 1]`. One passive `scroll` listener only wakes the same recompute, so `isAtEnd` is seen on a short last section (IntersectionObserver does not fire for the last pixels of scrolling). Every wake-up schedules one `requestAnimationFrame` that reads `getBoundingClientRect().top` of rendered headings only (`getClientRects().length > 0`: a `display: none` heading reads 0 and would look "above"), reads `isAtEnd` from `scrollingElement`, calls core, and sets state only when the id changed.
- One synchronous recompute after set-up covers an initial hash (the browser has already scrolled). Cleanup: `disconnect()`, remove the listener, `cancelAnimationFrame`.
- `offset` must equal `scroll-padding-top` on `html` (C43, which also keeps focus out from under a sticky header), or a clicked heading lands below the line and the previous one stays current. The docs say so, and that `<base href>` breaks `#id` links.
- **Why a plain hash link:** it works unhydrated and in SSR. The browser scrolls with the page's `scroll-padding-top` and `prefers-reduced-motion` and moves the sequential focus starting point, so the next Tab continues after the heading. No router coupling, no focus movement or context change (3.2.1).

### Accessibility contract (draft, `table-of-contents.a11y.md`)

APG: none. Native focus strategy: each link is its own Tab stop in DOM order, Enter follows the hash, arrows, Home and End are not handled. One `aria-current="location"`; the trail is visual only; nothing is live; focus never moves when the active heading changes. Consumer rules: unique heading ids, `offset` equal to `scroll-padding-top`, items in DOM order and memoized, a visible title with `aria-labelledby`, one contents per page. Message key `tableOfContents.label`.

| Key               | Context               | Action                                                                                   | Test (`table-of-contents.e2e.ts ›`)                                 |
| ----------------- | --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Tab               | before or in the list | Next link, nested ones in DOM order                                                      | `Tab moves through the links in DOM order, nested ones included`    |
| Shift+Tab         | on a link             | Previous link, then out                                                                  | `Shift+Tab moves back through the links, then out of the contents`  |
| Enter             | on a link             | Follows the hash natively: the page scrolls and the next Tab continues after the heading | `Enter scrolls to the heading, and the next Tab continues after it` |
| Arrows, Home, End | on a link             | Not handled                                                                              | `Arrow keys, Home and End are not handled`                          |

- Roles and ARIA: `<nav>` landmark with a unique name, `aria-current="location"` as state.
- WCAG SCs: 1.3.1, 1.4.1, 1.4.10, 1.4.11, 2.4.1, 2.4.3, 2.4.4, 2.4.11, 2.5.8, 3.2.1, 4.1.2.

### i18n strings

New namespace `tableOfContents: { label: TextMessage }`, appended at the end of `KvirnMessages` in `packages/i18n/src/types.ts` and added to the six catalogs in `packages/i18n/src/locales/`. The key is listed under "Message keys" in the a11y.md.

| Key                     | en           | sv               | fi            | nb             | nn            | se                         |
| ----------------------- | ------------ | ---------------- | ------------- | -------------- | ------------- | -------------------------- |
| `tableOfContents.label` | On this page | På den här sidan | Tällä sivulla | På denne siden | På denne sida | On this page (placeholder) |

`se` uses the English placeholder like the other `se` strings (update the header comment in `se.ts`; native review `pending`). The proposed texts are mine and need a native review.

### Theming surface

Parts `kv-table-of-contents`, `-list`, `-item`. `aria-current="location"` is non-false, so the Navigation selectors match. The T3 trail is the same `:has()` rule with `.kv-table-of-contents-*` added to the §8 selector lists (this waits for Plan 0047). A new §8b and a header-list line. `.kv-table-of-contents` goes in both not-prose lists (`theme.css:1467`, `:1486-1493` and the comment at :1305) and in `theme-css/SKILL.md:122`, because a contents nav sits inside `kv-prose` on the docs site. No `data-trail`, no new pair.

### Dev warnings

`table-of-contents-missing-heading:<id>` (effect, once per id) and `table-of-contents-<part>-outside-root` (List, Item, Link). A row each in `dev-warnings.mdx`, the skill reference and `table-of-contents.md`.

## Tasks

- [ ] `ux-designer`: `docs/design/table-of-contents.md` (Q-C1: solid or quiet fill for an item that changes while scrolling; indent at 320px; the title; forced colours). The maintainer approves it (one round with Plans 0047 and 0048)
- [ ] Failing tests first: core (`getTableOfContentsTree`, `getActiveHeading`), `table-of-contents.test.tsx` (axe, real scrolling), `table-of-contents.e2e.ts`
- [ ] `packages/core/src/table-of-contents/` and the `index.ts` export
- [ ] `packages/react/src/table-of-contents/`: `use-table-of-contents.ts`, `table-of-contents.tsx`, context, `table-of-contents.md`, `table-of-contents.a11y.md`; exports; `naming.test.tsx`; `tooling/component-naming/component-naming.test.ts`
- [ ] i18n: the type and the six catalogs; `vp run i18n:check`
- [ ] `theme.css` §8b (after Plan 0047 lands), the not-prose lists, the header list; `theme:check`
- [ ] Storybook `components/table-of-contents/`: `.stories.tsx`, `.fixture.tsx`, `.e2e.ts`; `dev-warnings.mdx`
- [ ] Skills and docs: `key-tables.md` (a native-links row), `api-conventions/SKILL.md`, `dev-warnings.md`, `theme-css/SKILL.md:122`, `DESIGN.md` (Components)
- [ ] Changeset `.changeset/table-of-contents.md` (core, i18n, react, theme minor; says adopters' full custom catalogs must add the namespace), roadmap row (a new TableOfContents row after NavigationMenu, M2), `docs/plans/README.md`, `docs/design/README.md`
- [ ] Orchestrator: the gates, then `accessibility-reviewer`

## Decisions

- **The lists carry `role="list"`** (accessibility review): `list-style: none` drops the list role in Safari/VoiceOver (1.3.1), as in Breadcrumb.
- **Named `TableOfContents`,** not `Toc`: `architecture.md` bans abbreviated names. "TOC" is the maintainer's shorthand.
- **Scroll-spy with an `items` prop** (the maintainer's choice over a static list and over a DOM-scanning hook). The docs-site spec wants everything server-rendered, so the links render from `items` and the observer is progressive enhancement.
- **Plain `<a href="#id">`,** not a router link and not a click handler (see the observer section).
- **IntersectionObserver plus one passive scroll wake-up,** so a last section shorter than the space below the line still becomes current. Pure maths in core, DOM in react (rule 3).
- **`aria-current="location"`,** not `page`: the link targets a place in the current page.
- **No focus movement and no announcement on a change.** The active item is state, not an event.
- **A new `KvirnMessages` namespace** breaks adopters' full custom catalogs at the type level (a 0.x minor, said in the changeset; approved with this plan).
- **The 1px tolerance** in `getActiveHeading` absorbs sub-pixel layout.

## Risks & open questions

- IntersectionObserver is not fired for the last pixels of scrolling; the scroll wake-up covers it. WebKit and mobile-safari behaviour is CI-only and `pending` here.
- C's solid fill is louder on something that moves while the user scrolls (Q-C1 in the spec). The "mistaken for keyboard focus" usability test is `pending`, as for Navigation.
- A heading hidden with `display: none` is skipped; a missing heading warns once.
- Stale `docs/design/docs-site.md:456` once the docs site adopts it.

## Testing strategy

Rule 13: no CSS values.

- Core: tree (flat to nested, a skipped level, a first item deeper, descending levels, empty, order kept) and active (none above the line, the 1px tolerance, `offset`, the last heading wins, `isAtEnd`, empty).
- `table-of-contents.test.tsx` (real browser, real scrolling with `expect.poll`, sv and en, axe): a named landmark; `aria-labelledby` replaces the label; nested lists from `level`; plain `href="#id"` and a registered router link never used; nothing current before the first scroll; `aria-current="location"` on exactly one link; `offset` honoured; a `display: none` heading skipped; a missing heading warns once; empty `items` render nothing; `renderToString` gives the full list and no `aria-current`; the function child and `render`; unmount calls `disconnect` (one `vi.spyOn` with call-through).
- `table-of-contents.e2e.ts`: the four rows, plus `scrolling makes the heading's link current`, `a clicked link becomes current` and `no focus movement and no live region on change`.
- Stories (`Components/TableOfContents`; heading ids unique per story, because Docs renders every story inline in one document; Controls do not reach an iframe): Default (an article taller than the screen), Keyboard, Levels (h2 to h4 and a skipped level), StickyOffset (a 64px header with `scroll-padding-top`), LabelledByHeading, CustomRender, CompactDensity, LongFinnishText (320px), RTL, ForcedColors.

## Rollout

`.changeset/table-of-contents.md`: `@kvirn-ui/core`, `@kvirn-ui/i18n`, `@kvirn-ui/react` and `@kvirn-ui/theme` minor. The i18n type change is called out.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT, the usability test and the `se` review may be `pending`)
- [ ] accessibility-reviewer APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
