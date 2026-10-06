# Plan 0055: Route focus (`useRouteFocus`)

- **Status:** In progress (hook, tests, story, docs done; docs-site adoption, gates and review pending)
- **Owner:** orchestrator → component-engineer → accessibility-reviewer
- **Created:** 2026-10-06 · **Target:** M1
- **Related:** [design spec](../design/docs-site-components.md) §5 G4 and §9 decision 1, [0054](0054-skip-link-and-visually-hidden.md), [0053](0053-docs-as-municipality-site.md), `keyboard`, `accessibility`, `api-conventions`, `testing`, `storybook-docs`, `theme-css` skills

## Goal

After a client-side navigation a keyboard or screen-reader user lands on the new page's title, not on a stale focus position or at the top of the old document, and hears what the page is.

## Non-goals

- Doing the navigation, owning a router, or wrapping a framework's `Link`.
- Focusing on the first load, on a hash change, or on Back and Forward where the browser restores the scroll and focus.
- Smooth scroll, a loading state, or a page transition.
- Replacing Next.js's own route announcer.

## Background

A single-page navigation does not reload, so focus stays on the clicked link (which may be gone) and a screen reader hears nothing (2.4.3, 4.1.3). Next.js ships a route announcer (a visually hidden `role="alert"` reading the `<title>` or `h1`); TanStack Router ships none. The docs have an interim effect in `apps/docs/components/site-shell.tsx` (`mainRef…querySelector('h1')?.focus()`), the `h1`'s `tabIndex={-1}` and no ring rule. `Link` (`packages/react/src/link`) and the Announcer (`packages/react/src/announcer`, `useAnnouncer`, `useQuietAnnouncer`) exist. `useEnv()` (`packages/react/src/provider/use-env.ts`) is the SSR-safe door to `document`.

## Design

### API sketch

```tsx
// one hook, called once in the layout; the key is the router's location
function Shell({ children }) {
  const pathname = usePathname() // Next.js
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: pathname, containerRef: mainRef })
  return <main ref={mainRef}>{children}</main>
}
```

- `useRouteFocus({ key, containerRef, selector = 'h1', announce = false, messages })` returns nothing (no props to spread). It is a hook only, no component (the target is the consumer's own `h1`). Export `UseRouteFocusOptions`.
- After the first render it remembers `key`. When `key` changes (compared in an effect), it finds `selector` inside `containerRef.current` (or `document` when absent), adds `tabindex="-1"` if missing, calls `focus({ preventScroll: false })`, and removes the attribute on `blur`. It does nothing on mount, when only the hash changed (the `key` is the pathname plus search, never the hash), when no target exists (dev warning `route-focus-target-missing`), or when focus is already inside the container on a target the user is typing in (`document.activeElement` is a text field).
- Back and Forward: a `popstate` since the last render skips the move, so the browser's restored scroll wins. Scroll restoration is the router's; the hook reads `history.scrollRestoration` and skips only when it is `'auto'` and the entry is a pop.
- All DOM access goes through `useEnv()` (`undefined` on the server and in hydration): no effect runs there. No core machine; `packages/core` unchanged.

### Accessibility contract (draft, `route-focus.a11y.md`)

APG: none. WCAG technique: "Moving focus to the new page title on a single-page navigation" (G110 alternative, ARIA22 for status). Focus strategy: programmatic, once per navigation, to a heading made temporarily focusable. The hook adds no Tab stop (`tabindex="-1"` is not in the tab order) and handles no keys.

| Key       | Context             | Action                                                                  | Test (`use-route-focus.test.tsx ›`)                                   |
| --------- | ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Tab       | after a navigation  | Continues after the focused `h1`, into the page's first stop            | `Tab after a navigation continues after the title`                    |
| Shift+Tab | after a navigation  | Goes back to the stop before the `h1` (the header), not to the old link | `Shift+Tab after a navigation goes back to the stop before the title` |
| Enter     | on the focused `h1` | Not handled (not a control)                                             | `the title is not a control and handles no keys`                      |

- Roles and ARIA: none added; the `h1` keeps `heading` level 1. `tabindex="-1"` only while focused. No `aria-live` of its own.
- Focus management: moves to the `h1` after a path change only (not the first load, a hash change, Back or Forward on `'auto'` restoration, a missing target). The ring shows under `:focus-visible` only (maintainer, spec §9.1): no outline rule on `[tabindex="-1"]:focus`. If the user is typing in a field, the move is skipped.
- Announcements: the focused `h1` is read by the screen reader. Whether the Announcer also reads the title is the open question below; default is none, so Next.js's announcer is not doubled.
- WCAG SCs: 2.4.3, 2.4.2, 2.4.7, 2.4.11, 3.2.1, 4.1.3.

### i18n strings

None by default: the hook renders no text. Only if the announce question resolves to "yes, opt-in" does it add a namespace `routeFocus: { navigated: TextMessage }` (a template with `{title}`), then six locales:

| Key (only if `announce`) | en                   | sv                         | fi                       | nb                        | nn                      | se                                 |
| ------------------------ | -------------------- | -------------------------- | ------------------------ | ------------------------- | ----------------------- | ---------------------------------- |
| `routeFocus.navigated`   | Navigated to {title} | Du har kommit till {title} | Siirryit sivulle {title} | Du har kommet til {title} | Du har kome til {title} | Navigated to {title} (placeholder) |

Native review `pending`; `se` is the English placeholder.

### Theming surface

None: no class, no `data-*`. `theme.css` already gives `:focus-visible` the token ring on any focusable element; the plan adds a `theme.css` line only if a `[tabindex="-1"]` outline reset exists (then removed, with the maintainer's approval at review) and a sentence in `theme-css/SKILL.md`. No new token, no new colour pair.

## Tasks

- [x] Failing tests first: `use-route-focus.test.tsx` (every row, first render does nothing, `key` change focuses the `h1`, hash-only does nothing, `popstate` skip, a typing field skips, `tabindex` removed on blur, missing target warns, server render runs no effect, axe)
- [x] `packages/react/src/route-focus/`: `use-route-focus.ts`, `route-focus.md`, `route-focus.a11y.md`; export in `index.ts`; `naming.test.tsx`
- [x] Decide and (if yes) implement the Announcer question; i18n type and six catalogs; `vp run i18n:check`
- [x] Storybook `components/route-focus/`: a Default fixture with two fake routes and a link, Keyboard, HashChange, RTL; `parameters.a11yContract`; dev warning in `dev-warnings.mdx`
- [x] Documentation task, recipes in `route-focus.md` and the Docs page:
  - Next.js (App Router): `usePathname()` plus `useSearchParams()` joined as the key, in the root layout's client wrapper; note Next's own route announcer and that `announce` stays off
  - TanStack Router: `useRouterState({ select: (state) => state.location.pathname + state.location.search })` in the root route component, `announce` on (it has no announcer), set `scrollRestoration` on the router
  - A framework-free `popstate` example, and the `scroll-padding-top` pairing from Plan 0049
- [x] Docs site adoption (`apps/docs`): replace the shell's own effect with `useRouteFocus`, keep the `h1` `tabIndex` removal, delete any outline reset
- [x] Docs: `key-tables.md` (a "programmatic focus" row), `api-conventions/SKILL.md`, `dev-warnings.md`, `DESIGN.md` (Components)
- [x] Changeset `.changeset/route-focus.md` (react minor; i18n minor only if announce ships), roadmap row, `docs/plans/README.md`
- [ ] Orchestrator: the gates, then `accessibility-reviewer`; AT matrix `pending` (NVDA, JAWS, VoiceOver, TalkBack, Next announcer doubled or not)

## Decisions

- **A hook, not a component:** the target is the consumer's own `h1`; a part would only add a wrapper. The key comes from the consumer, so the library couples to no router (hard rule 6: no dependency).
- **Key is a string the consumer builds** (path plus search, never the hash): that rule makes "hash change does nothing" a property of the input, not a heuristic.
- **Focus the `h1`,** not `main` or a wrapper (the interim docs effect, GOV.UK): the title is the shortest accurate announcement and sets the sequential start point.
- **Ring under `:focus-visible` only:** maintainer decision, spec §9.1. Browsers do not show it on a pointer-initiated `focus()` after a click, which is right.
- **Skip while typing or on a restored Back:** a surprise focus move is a 3.2.1 risk.
- **Announce is off by default** and ships (maintainer): `routeFocus.navigated` in all six locales, a type-level addition to `KvirnMessages` (Q2 approved, recorded in the changeset). The title is `document.title`, else the heading's text.
- **Implementation:** the hook keeps the previous key in a ref (the first effect only records it, which also covers StrictMode and the hydration pass where `useEnv()` is `undefined`). A `popstate` listener marks the next key change as a pop. A text field check reuses `textEntrySelector` from `use-focus-visible.ts` (now exported). `tabindex` is removed on blur only when the hook added it. A missing announcer warns with the shared `announcer-without-provider` warning.
- **Not done here:** the docs site adoption (apps/docs), the `api-conventions` and `DESIGN.md` mentions, the `docs/plans/README.md` status, and the reviewer. The ring needs no `theme.css` change: no `[tabindex="-1"]` outline reset exists in the theme.
- **Docs site adoption done:** `useRouteFocus({ key: pathname, containerRef: mainRef })` in `site-shell.tsx` (pathname only: the docs have no search params, and `useSearchParams` would need a Suspense boundary); the shell effect and the h1 `tabIndex={-1}` are gone.

## Risks & open questions

- Question (maintainer): should `useRouteFocus` offer `announce` that tells the Announcer "Navigated to {title}"? Proposed: opt-in, off by default, so Next.js's announcer is not doubled, and on in the TanStack recipe. The alternative is no message and a recipe that points to the router's own. Needs the maintainer's call; it adds an i18n namespace.
- Detecting Back or Forward without a router: `popstate` is reliable in the browser but not in every router's `replace`. Proposed: document it, and test with a real `history.back()`.
- Screen readers differ on a focused `h1` with `tabindex="-1"`; AT `pending`.
- A `document.title` update lagging the key (Next.js sets it after render): the announcer reads it late; the recipe notes the order.

## Testing strategy

Rule 13: no CSS. Behaviour in the real browser with a small router fixture (a `history.pushState` link and a `key` prop): focus lands on the `h1`, `activeElement` and Tab order asserted, `popstate` through `history.back()`. SSR: `renderToString` runs no effect. Next.js and TanStack recipes are documented and type-checked in docs snippets, not run in CI.

## Rollout

`.changeset/route-focus.md`: `@kvirn-ui/react` minor (and `@kvirn-ui/i18n` if `announce` ships).

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] The docs shell's interim effect and the outline reset are gone
- [ ] accessibility-reviewer APPROVE
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
