# Plan 0132: SkipPanel (a skip panel with keyboard shortcuts)

- **Status:** Done (agents)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-17 · **Target:** alpha
- **Related:** spec `docs/design/skip-panel.md`; `packages/react/src/skip-link/` (single SkipLink, unchanged); Kbd; Plan 0122 (QuickExit); `keyboard` skill rule 7

## Goal

On the first Tab, a keyboard user sees a card listing where they can skip to and which shortcuts the site offers, and can run each one from the card or by its chord. It is modelled on amazon.se's skip panel.

## Non-goals

- A user-facing remap UI or persisting the off switch: the consumer owns those (e.g. the accessibility settings page).
- Default chords: the library ships none.
- Changing `SkipLink`: it stays the single-link primitive.

## Background

- No APG pattern. The basis is WCAG techniques G1 (skip link) and C7 (hidden until focused), the same as SkipLink (`skip-link.a11y.md`).
- The accessibility-reviewer pre-assessment and the ux-designer spec agreed on these, and they are adopted: no dialog, menu or landmark role; groups named by visible text; no headings; no arrows; no live region.
- QuickExit precedent: a pure core helper (`core/src/quick-exit/shift-sequence.ts`) plus a React hook that binds `document` keydown.

## Design

### API sketch

```tsx
<SkipPanel.Root
  reopenShortcut={{ key: 'k', alt: true, shift: true }}
  shortcutsEnabled={settings.shortcuts}
>
  <SkipPanel.Group>
    <SkipPanel.Label /> {/* default: messages skipPanel.skipToLabel */}
    <SkipPanel.List>
      <SkipPanel.Item>
        <SkipPanel.Link href="#main" />
      </SkipPanel.Item>{' '}
      {/* default text skipPanel.mainContent */}
      <SkipPanel.Item>
        <SkipPanel.Link href="#nav">Site navigation</SkipPanel.Link>
      </SkipPanel.Item>
    </SkipPanel.List>
  </SkipPanel.Group>
  <SkipPanel.Group>
    <SkipPanel.Label>Keyboard shortcuts</SkipPanel.Label>
    <SkipPanel.List>
      <SkipPanel.Item>
        <SkipPanel.Shortcut shortcut={{ key: 's', alt: true, shift: true }} onClick={focusSearch}>
          Search
        </SkipPanel.Shortcut>
      </SkipPanel.Item>
      <SkipPanel.Item>
        <SkipPanel.Shortcut
          as={RouterLink}
          href="/cases"
          shortcut={{ key: 'm', alt: true, shift: true }}
        >
          My cases
        </SkipPanel.Shortcut>
      </SkipPanel.Item>
    </SkipPanel.List>
  </SkipPanel.Group>
  <SkipPanel.Hint />{' '}
  {/* "Press {keys} to open this list again." Rendered only with a reopenShortcut */}
</SkipPanel.Root>
```

- Parts: `Root` div; `Group` div `role="group"` + `aria-labelledby` → `Label` (span); `List` `ul role="list"`; `Item` li; `Link` a (reuses `useSkipLink` focus logic); `Shortcut` button by default, `as` for a link or router link, rendering its children and then a nested `Kbd` combination; `Hint` p.
- Hooks: `useSkipPanel(options)` (root, reopen and Escape state, the chord binding) plus a part hook per part, per `api-conventions`. Export `UseSkipPanelOptions`, `UseSkipPanelResult` and `SkipPanelPartProps`.
- Core `packages/core/src/shortcut/`, pure, with no DOM at module scope:
  - `Shortcut = { key: string; alt?; shift?; ctrl?; meta? }`
  - `matchShortcut(event, shortcut)`:
    - takes `key`, `code`, the modifier flags, `altGraph` and `editable` from a plain object;
    - rejects editable targets, AltGraph, and Ctrl or Meta unless the chord asks for them;
    - matches a letter by `key`, and by `code` (`Key<X>`) when Alt is held, because macOS Option rewrites `key`.
  - `toAriaKeyShortcuts(shortcut)` gives `"Alt+Shift+S"`.
  - `shortcutKeys(shortcut, { apple })` gives the ordered message keys for the key caps.
  - Dev warning (`warnOnce`) for a single-character chord with no modifier, and for Ctrl+Alt (AltGr).

### Accessibility contract (draft)

Focus strategy: roving tabindex, so the panel is one Tab stop (the first Link, again after focus leaves). Selection follows focus: n/a. Arrows wrap: no. Shortcuts: consumer-supplied chords, bound page-wide while Root is mounted and `shortcutsEnabled`. There are no defaults.

| Key                 | Context                                                 | Behaviour                                                                                                                              |
| ------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Tab                 | page load                                               | Focuses the first Link; the card appears (`:focus-within`, no JS needed)                                                               |
| Tab                 | any item                                                | Leaves the panel for the page's next stop; the card hides                                                                              |
| ArrowDown / ArrowUp | on an item inside Root                                  | Next / previous item across all groups, in DOM order; no wrap; `preventDefault` only when handled                                      |
| Home / End          | on an item inside Root                                  | First / last item                                                                                                                      |
| ArrowDown / ArrowUp | collapsed card                                          | Still move; the focused item shows alone                                                                                               |
| arrows, Home, End   | outside Root                                            | Not handled                                                                                                                            |
| (roving tabindex)   | focus leaves Root                                       | The first Link is the Tab stop again                                                                                                   |
| Shift+Tab           | first item                                              | Leaves the document (native); the card hides                                                                                           |
| Shift+Tab           | any later item                                          | Leaves the document backwards (native); the card hides                                                                                 |
| Enter               | Link                                                    | Focuses the target (`tabindex=-1` until blur), as SkipLink                                                                             |
| Enter               | Shortcut (button)                                       | Runs its action                                                                                                                        |
| Enter               | Shortcut (link)                                         | Follows the link                                                                                                                       |
| Space               | Shortcut (button)                                       | Runs its action (native button)                                                                                                        |
| Space               | Link                                                    | Not handled (native)                                                                                                                   |
| Escape              | floating, reached by Tab                                | Sets `data-collapsed` on Root. Only the focused item stays visible; focus doesn't move. Resets when focus leaves Root (1.4.13)         |
| Escape              | opened by `reopenShortcut`                              | Closes; focus returns to the element focused before, or to the first Link's target if that element is gone (never `body`)              |
| `reopenShortcut`    | anywhere except editable, enabled                       | Stores the focused element and focuses the first Link; the card shows                                                                  |
| a Shortcut's chord  | anywhere except editable, enabled                       | Activates that row (`element.click()`), so the chord, the button and the link do the same thing; the browser's own action is prevented |
| any chord           | editable target, AltGr, extra Ctrl or Meta, or disabled | Not handled; the event is untouched                                                                                                    |

- Roles / ARIA:
  - The groups are `role="group"` named by their visible Label. No headings, landmark, dialog or menu.
  - A Shortcut's accessible name is its text followed by the Kbd text ("Search Alt + Shift + S"). There's no `aria-label` (2.5.3).
  - `aria-keyshortcuts` goes on each Shortcut. It's removed with the key caps when the shortcuts are disabled.
- Focus management:
  - Hidden by clipping (C7), never `display:none`.
  - Floating: it hides on focusout, so it never covers the next focused element (2.4.11), and it stacks above sticky headers.
- Announcements: none. The focus moves announce.
- WCAG SCs: 1.3.1, 1.4.10, 1.4.13, 2.1.1, 2.1.2, 2.1.4, 2.4.1, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.2.1, 3.2.3, 4.1.2.

### i18n strings

New `skipPanel.*` namespace in all 5 locales, distinct from the docs app's own `skipPanel.navigation` (`apps/docs/components/site-shell.tsx:153`). Check for a key clash first.

| Key                                             | en                                    |
| ----------------------------------------------- | ------------------------------------- |
| `skipPanel.skipToLabel`                         | Skip to                               |
| `skipPanel.mainContent`                         | Main content                          |
| `skipPanel.shortcutsLabel`                      | Keyboard shortcuts                    |
| `skipPanel.reopenHint`                          | Press {keys} to open this list again. |
| `keys.shift` / `keys.alt` / `keys.option`       | Shift / Alt / Option                  |
| `keys.control` / `keys.command` / `keys.joiner` | Ctrl / Command / +                    |

A native speaker's review of the key-cap names is pending (not an agent claim).

### Theming surface

- Classes: `kv-skip-panel` and part classes per `theme-css`. `kv-skip-panel` joins the not-prose list.
- State: `data-collapsed`, `data-reopened`.
- No new tokens; floating uses the existing popup elevation (spec §6). There's a DESIGN.md entry under "Skip link" (approved).

## Tasks

1. [x] Core `shortcut/` helper and node tests (match, rejections, aria string, key order on Apple and non-Apple) — component-engineer A
2. [x] React `skip-panel/`: hooks, parts, `skip-panel.test.tsx` (every contract row, read aloud, axe), `skip-panel.a11y.md`, `skip-panel.md`, exports in `index.ts` — A
3. [x] i18n: `skipPanel.*` and `keys.*` in sv fi nb nn en — A
4. [x] `theme.css`: rename to `kv-skip-panel`, remove `--inline`, floating, collapsed, forced colours, RTL, not-prose list; DESIGN.md entry (in-flow → SkipLink) — component-engineer B (rework 2026-10-18)
5. [x] Stories `apps/storybook/src/components/skip-panel/` per spec §10 on the `MunicipalityPage` frame, with plays proving the visible state (review blocking 2) — B
6. [x] Gates (lead), then accessibility-reviewer: APPROVE (round 3, 2026-10-18)
7. [x] Docs-site page `apps/docs` renamed to skip-panel; floating examples contained by `.docs-skip-panel-example` (`contain: layout`) in docs.css — docs-writer; roadmap line done

## Decisions

- **A new component, not an extension of SkipLink:** SkipLink's contract says "Shortcuts: none", and the single link stays the right choice for e-service flows (spec §1).
- **Floating only (renamed SkipPanel, the inline variant removed):** maintainer, 2026-10-18; a skip link in the page flow is `SkipLink`. Earlier, 2026-10-17: Floating needs the Escape collapse and hide-on-focusout rows (1.4.13, 2.4.11). This is an a11y trade-off the maintainer approved, recorded in the `accessibility` skill when the work lands.
- **Shortcut rows are Tab stops (button/link plus key caps), and the chord activates the same row:** maintainer, 2026-10-17. The cost is extra Tab stops before the header (2.4.1): the docs recommend keeping it to 5 or fewer, and spec §1 says when to use the single SkipLink instead.
- **One Tab stop, with arrow keys between items** (maintainer, 2026-10-18; APG practice deviation, recorded in the `keyboard` skill). This reverses the 2026-10-17 "no arrows" decision: tabbing through every shortcut row before the header on every page is worse. Up/Down/Home/End, no wrap, and the stop resets to the first link on leave. `skipPanel.arrowHint` is shown in the Hint and is the first link's `aria-describedby` (no live region: focus already speaks). A link to the site's accessibility statement keyboard section is a recommended consumer Item.
- **No composite role** (reviewer advice, 2026-10-18). `toolbar`, `menu` and `listbox` would announce a widget this isn't, drop the group and list structure, and can force NVDA into focus mode. The two named groups of real lists stay, and the first link's description tells users about the arrows.
- **Show/Hide is not a row:** it can't be a control inside the panel it hides. The reopen chord is shown in the Hint.
- **The library binds, with a pure core matcher and no registry:** the guards (editable, AltGr, Ctrl and Meta) are written once and tested. The `keyboard` skill rule 7 holds: opt-in, because there are no default chords and `shortcutsEnabled` turns them off.
- **Alt+/ is never suggested:** there's no `/` key on Nordic layouts. The docs give Alt/Option+Shift+letter examples, with Windows' layout-switch and Firefox's accesskey caveats.
- **QuickExit comes first in the Tab order when both are on a page** (safety).
- **Floating is fixed only from 40rem wide and 36rem high.** Below either, the card sits at the top of the document so page scroll reaches every item (1.4.10). Popup look: level 3, `--kv-shadow-popup`, `radius-xl`. No fade, so the focus ring isn't delayed (spec §6). Confirm 36rem in the story.
- **Stacking: a literal z-index in `kv-skip-panel`, no layer token.** It follows theme.css's local literals, and a site overrides the class to sit above its sticky header. The spec's `--kv-layer-skip-panel` would be a token change; it wasn't approved, so it's deferred (lead, 2026-10-17).
- **Below 40rem the card covers QuickExit's row while focus is in the card:** accepted. QuickExit is never the focused element then (2.4.11), and Shift+Tab reaches it and hides the card.
- **`skipPanel.actionsLabel` ("Quick links")** is added for the second group's Label when `shortcutsEnabled` is false, because "Keyboard shortcuts" would then be wrong.
- **`SkipPanelContext` is not exported** (only the `SkipPanelContextValue` type): a custom Root isn't supported, and the parts' `as` and part hooks cover custom markup. It also keeps the naming and server-entry checks green (whole-tree run, 2026-10-18).
- **Stories kept simple** (maintainer, 2026-10-18). Each story renders one standalone adopter function from `skip-panel.fixture.tsx`, and `showSource` shows that function, so "Show code" is real SkipPanel markup with no play or wrapper. The main example has no controls. No preview frame: the card is fixed to the top of the window as on a real site (maintainer: a containing frame isn't realistic). Plays skipped in docs mode so the Docs page doesn't scroll. The MunicipalityPage frame in spec §10 is superseded.
- **Spec and reviewer differed on Shortcut rows** (spec: Tab stops; reviewer: static text): the maintainer chose Tab stops.
- **`skipPanel.actionsLabel` ("Quick links"):** the second group's Label text when `shortcutsEnabled` is false. `Label` takes `kind="shortcuts"` (default `skip`) to pick the default text; children replace it.
- **Hint also needs `shortcutsEnabled`:** a disabled reopen chord is not advertised.
- **Link reuses `useSkipLink`** for its onClick and missing-target warning; the Escape fallback has its own small `focusTarget` copy in `use-skip-panel.ts`, since SkipLink's files were out of scope (extract later).
- **Apple detection** is in the React hook (`userAgentData.platform` or `navigator.platform`), not in core; core takes `{ apple }`.
- **Chord guards:** editable means a text-type input, textarea, select, contenteditable or a textbox, searchbox or combobox role; `event.repeat` is ignored; a handled chord calls `preventDefault`.
- **Escape on a reopened card** closes it.
- **Joiner:** key caps are joined with `keys.joiner` ("+") without spaces, so the name reads "Search Alt+Shift+S".

- **Hint has no `info` icon:** the spec's decorative icon is not in the Hint markup, so the theme draws none.
- **36rem confirmed:** WithShortcuts (5 stops, both labels, the hint) measures 321px (20rem) at the 40rem width, so 576px has ample room.
- **Shortcut underline:** the row is underlined on hover only (link look), and the underline also runs under the key caps, since text decoration propagates to flex items.

- **One Tab stop with arrow keys (APG practice deviation, maintainer, 2026-10-18):** like Amazon; reverses "No arrow keys" above. Roving tabindex by attribute from the Root (`getRovingTarget`, vertical, no wrap); the first Link is described by `SkipPanel.Hint`'s arrow sentence (`skipPanel.arrowHint`), with a dev warning (`skip-panel-hint-missing`) when no Hint is mounted. The `keyboard` skill must record the deviation.

## Risks & open questions

- Docs page: `.docs-skip-panel-example` (`contain: layout`) keeps the card's z-index inside the example. Check by hand that a sticky site header never covers the focused row (2.4.11, docs only). Opt-in sweeps (text-spacing 1.4.12, forced-colors) cover Button only; extending `sweepExclude` to SkipPanel is a follow-up.
- Whether Alt+Shift+letter reaches the page under NVDA and JAWS (browse and focus mode), Firefox, and Windows with two input layouts. Manual AT matrix: `pending`.
- How screen readers read the group names and the nested Kbd. Manual AT matrix: `pending`.
- Browse mode reads the whole panel at the top of every page (C7). Documented as a known issue.

## Testing strategy

- Core: node, every match and rejection case.
- React: browser mode with real key events: every row above, plus the chord in an input, AltGr, extra Ctrl or Meta, and disabled. Each row is tested once.
- Stories: axe in every theme. Rule 13: no computed-style assertions; the hidden and shown states are proved by `:focus-within` reachability and 2.4.11, not by CSS text.

## Rollout

New export from `@kvirn-ui/react`. Changesets are off until alpha.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` status updated
