# Plan 0101: Docs search finds page content

- **Status:** Done
- **Owner:** lead → component-engineer
- **Created:** 2026-10-11 · **Target:** docs site
- **Related:** `apps/docs/app/search/page.tsx`, `packages/patterns/src/site-chrome/site-search/`

## Goal

A reader who types a word from a page's props, attributes, accessibility notes or keyboard keys
(`aria-expanded`, `arrow keys`, `placement`) finds the page that documents it, best match first.

## Non-goals

- No as-you-type dropdown, no client-side JS, no third-party service (hard rule 7).
- No change to `SiteSearch` or its contract. The header field does not keep the query (the results
  heading already states it); revisit with the dropdown.
- Example code and `docs/*.md` are not indexed.

## Background

Today `search()` in `app/search/page.tsx` matches every word as a substring of `label` + `summary`
only (about 70 pages). The page is dynamic (`searchParams`), so it can read the content on the server.
Sources per component page (scout, 2026-10-11):

- `content/<slug>.api.ts`: `PropRow.description`, `AttributeRow.meaning` and `values`, `ApiHook.intro`
  (types in `components/api-block.tsx:20-56`). Export names vary, so walk every exported string.
- `packages/react/src/<slug>/<slug>.a11y.md` via `readContract(slug)` (`lib/contract.ts:41`):
  `accessibility`, `keyboard`, `announcements`.
- Page list and summaries: `components/site-sections.ts` (`allPages()` in the search page).

## Design

New `apps/docs/lib/search-index.ts`, server only, no new dependency:

```ts
export interface SearchEntry { href: string; label: string; summary?: string; body: string }
export interface SearchHit { entry: SearchEntry; excerpt?: string }
export function buildSearchIndex(pages: readonly { href; label; summary? }[]): readonly SearchEntry[]
export function searchEntries(entries: readonly SearchEntry[], query: string): readonly SearchHit[]
```

- `body` for `/components/<slug>`: the strings of `content/<slug>.api.ts` and of its contract, joined.
  A page with neither has `body: ''`. A missing file is not an error; a throwing parse is.
- Matching: lower-case, strip diacritics (NFD), split on whitespace; every word must occur in
  `label + summary + body`. A query with spaces also matches its joined form (`tool tip` finds `Tooltip`).
- Ranking (stable, ties keep site order): label equals the query, label starts with a word, label
  contains it, summary contains it, body only.
- `excerpt` only when the match is in `body` alone: about 120 characters around the first hit.
- Built once per server process (module-scope memo). The search page imports both functions and drops
  its own `search()`; it renders `excerpt` after the summary.

## Contract (requirements, each proved by a named test)

| # | Requirement | Layer |
| - | ----------- | ----- |
| 1 | A word only in a page's body finds that page and returns an excerpt containing it | node |
| 2 | A label match ranks before a summary match, which ranks before a body-only match | node |
| 3 | Case and diacritics are ignored (`ÅTERSTÄLL` finds `återställ`) | node |
| 4 | `tool tip` finds Tooltip | node |
| 5 | An empty or whitespace query returns no hits | node |
| 6 | Every component page with an `.api.ts` gets a non-empty `body` | node |
| 7 | The results markup is unchanged (heading, count, list of links), so axe stays green | existing |

## Accessibility

The results page keeps its structure: `h1`, `h2` with the count, a list of links. The excerpt is plain
text in the `<p>` after the link. No live region (a full page load). WCAG 2.4.5, 3.2.2.

## Tasks

- [x] `lib/search-index.ts` and `lib/search-index.test.ts` (node project), tests first
- [x] `app/search/page.tsx` uses it; the local `search()` is gone; `allPages()` stays in the page
- [x] `vp check`, `vp test run` on the changed files; run `/search?q=aria-expanded` in dev
- [x] `docs/roadmap.md`: no docs-search row exists, nothing to update
