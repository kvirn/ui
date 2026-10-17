# Plan 0122: QuickExit

- **Status:** Built; accessibility-reviewer APPROVE (round 4). Open: manual AT matrix, usability test of the label, native review of fi/nb/nn
- **Owner:** lead → component-engineer
- **Created:** 2026-10-15 · **Target:** alpha
- **Related:** [quick-exit design spec](../quick-exit.md), `docs/design/municipality-reference-site.md:64` ("Exit this page" deferred from v1), GOV.UK "Exit this page"

## Goal

A person reading sensitive content (how to report domestic violence, abuse support, health) can leave the page in one action, by button or by pressing Shift three times, and land on a neutral site the consumer chose. Going Back does not return to the page.

## Non-goals

- Clearing the browser's history, cache or other tabs: a web page cannot do that. The docs say so in one plain sentence.
- Choosing the destination: the consumer passes `href`; the library names no URL (hard rule 7).
- Closing the tab (`window.close` is blocked for tabs the script did not open).
- Detecting the user's danger, session wipe or server-side logic (consumer's job).

## Background

- GOV.UK Design System "Exit this page": a warning button, `Shift` ×3, a screen-reader announcement per press, replaces the page with a neutral site. No APG pattern exists, so the native `<a href>` is the base.
- WCAG: 2.1.1 Keyboard, 2.1.4 Character Key Shortcuts (Shift is a modifier, not a character key, but we keep it disableable), 2.4.11 Focus Not Obscured (if sticky), 2.5.8 Target Size, 3.2.5 Change on Request (navigation only on activation), 4.1.3 Status Messages.
- Reference component for shape: `packages/react/src/copy-button` (`useMessages('copyButton', messages)`, `use-copy-button.ts:68`); `kbd` for the smallest layout (`packages/react/src/kbd/`).

## Design

### API sketch

```tsx
;<QuickExit.Root shortcut messages={{ label: 'Leave the site' }}>
  <QuickExit.Link href="https://www.smhi.se" /> {/* children override the visible label */}
  <QuickExit.Hint /> {/* visible shortcut hint; renders nothing when shortcut is off */}
</QuickExit.Root>

const { rootProps, linkProps, hintProps } = useQuickExit({
  href,
  shortcut: true,
  navigate,
  messages,
})
```

- Three parts, each one native element: `Root` is the `<div>` row (the sticky, full-width wrapper placed as a direct child of `<body>`; owns `data-state`), `Link` is the `<a>`, `Hint` the `<p>`. The hook owns the key listener and the live region; `href` is an option of the hook and a prop of `Link`.
- `href` (required): `http(s)` only. A dev warning for anything else, and nothing navigates.
- `shortcut` (default `true`): Shift ×3. `false` removes the listener.
- On activation (press, Ctrl/Cmd/middle click or Shift ×3), in the same tick: `display:none !important` on `<html>` (`body[hidden]` loses to author `display:flex`), empty `document.title`, then `navigate(href)`. `rel="noreferrer"` and `referrerpolicy="no-referrer"` on the anchor. Nothing is stored.
- `navigate(href)` (default `window.location.replace`): so tests, routers and SSR frameworks can substitute; a spy is how the tests prove the exit.
- `messages`: per instance; provider-level via `useMessages('quickExit', messages)`.
- JS off: a normal link. `as` on `Link` only where a router link is needed.
- State: `data-state="idle|armed|leaving"` (armed = one or two Shifts counted).

### Core

`packages/core/src/quick-exit/`: `createShiftSequence({ count: 3, windowMs: 5000 })`, a pure machine. `press(now)` and `reset()` take timestamps, so there are no timers or DOM in core. Any other key resets it. Held-down repeat (`repeat: true`) is ignored, not counted.

### Accessibility contract (draft)

| Key / action                    | Result                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Tab / Shift+Tab                 | Focus the link (a sensible early stop in the page's focus order)                   |
| Enter                           | Activates: replaces the page with `href`                                           |
| Space                           | No effect (it is a link, not a button)                                             |
| Shift ×3 (released, within 5 s) | Same as Enter, from anywhere on the page, when `shortcut` is on                    |
| Shift ×1 or ×2 (released alone) | Announces "Press Shift 2 more times" (politely), arms; any other key or 5 s resets |
| Shift held (repeat)             | Not counted                                                                        |

- Roles / ARIA: native link, no role override (it navigates).
- Focus management: none moved. The page is replaced, so there is nothing to restore.
- Announcements: one polite status message on Shift presses 1 and 2 (WCAG 4.1.3), via the shared live region used by CopyButton; none on timeout, reset or exit (the page is gone).
- Placement: a sticky row as a direct child of `<body>`, Tab stop 2 after the skip link; sticky only at viewport height ≥ 30rem (2.4.11, `scroll-padding`); 44px tall, full width below 40rem.
- NVDA uses Shift to pause speech, so the shortcut can fire by accident. Accepted (default on, `shortcut={false}` opts out); the docs and `quick-exit.a11y.md` say so.
- Shortcut vs AT: the listener is on `document` and works in text fields too; a Shift counts only on release, alone: no other key, pointer press or Alt/Ctrl/Meta while it was held, so capitals, Shift+Tab and layout-switch chords never count. Sticky Keys users get the same sequence from the keys they press.
- WCAG SCs: 2.1.1, 2.1.4, 2.4.7, 2.4.11, 2.5.8, 3.2.5, 4.1.3.

### i18n strings (keys; wording from the spec)

| Key                           | en                                                    | sv                                                                                                                           |
| ----------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `quickExit.label`             | Leave this page                                       | Lämna sidan <!-- kv-lang-ok: national hide-a-page phrases are the subject -->                                                |
| `quickExit.shortcutRemaining` | Press Shift {remaining} more times to leave this page | Tryck på Skift {remaining} gånger till för att lämna sidan <!-- kv-lang-ok: national hide-a-page phrases are the subject --> |
| `quickExit.hint`              | Or press Shift 3 times.                               | Eller tryck på Skift 3 gånger. <!-- kv-lang-ok: national hide-a-page phrases are the subject -->                             |

fi ("Poistu sivulta"), nb and nn in the same change (`i18n:check`); fi, nb, nn need native-speaker review. The hint uses each locale's own key name. <!-- kv-lang-ok: the Finnish label is the subject -->

### Theming surface

`kv-quick-exit` (+ `--` options from the spec), `data-state`. The default theme is opt-in; the headless packages ship no CSS.

## Tasks

- [x] ux-designer spec `docs/design/quick-exit.md` (needs its README row's plan column set to 0122; lead)
- [x] Core `quick-exit` sequence machine + node tests (component-engineer)
- [x] React hook + `QuickExit.Root`/`Link`, messages, index exports (component-engineer)
- [x] i18n, 5 locales (component-engineer; fi/nb/nn native review pending)
- [x] `theme.css` §7e rules from the spec, no new tokens; `theme:check` green (component-engineer; min height is a literal 2.75rem so `kv-compact` never shrinks it)
- [x] DESIGN.md: the filled-link exception under Links, next to the service link (component-engineer)
- [x] Review round 1 fixes: keyup counting, hide, fields, a11y.md format, Read aloud tests (component-engineer)
- [x] Visible hint: spec amendment, `quickExit.hint`, `QuickExit.Hint`, CSS (ux-designer, component-engineer)
- [x] `keyboard` skill + `key-tables.md`: QuickExit row and the default-on deviation (lead)
- [x] Docs-site page `apps/docs/components/quick-exit-page.tsx` + 5 examples (docs-writer); the page must be re-checked once the contract blockers and the hint land
- [x] Stories: every state, RTL, forced colours, `Keyboard` story, `a11yContract` (component-engineer)
- [x] Browser tests: one named test per contract row, axe in every state (component-engineer)
- [x] `quick-exit.a11y.md`, `quick-exit.md`, docs page, `keyboard` skill row for Shift ×3 (component-engineer)
- [x] Gates, then accessibility-reviewer rounds 1–4, APPROVE (lead)
- [ ] Pending, not agent work: the manual AT matrix (NVDA/JAWS browse mode, Shift pause, wording), usability test of the label, native review of fi/nb/nn
- [x] Roadmap line; update the "Out of v1" note in `municipality-reference-site.md` only if the reference site adopts it (lead)

## Decisions

- **Home:** `@kvirn-ui/react` with a pure `core` machine, not `patterns` (maintainer, 2026-10-15). Reason: the shortcut needs behaviour.
- **Shortcut:** on by default, Shift ×3, with `shortcut={false}` (maintainer, 2026-10-15). An a11y trade-off recorded here and in the `keyboard` skill.
- **Native `<a href>`**, not `<button>`: it navigates; works without JS; no `role="button"` override.
- **`navigate` option** instead of hard-wiring `location`: `location.replace` cannot be spied on in browser mode.
- **No new dependency.**
- **No preload or preconnect in the library** (lead, 2026-10-16): the page is hidden before navigating, so a slow destination shows a blank tab, not the sensitive page; contacting another site from a sensitive page is a third-party network call (hard rule 7) and a trace on the network. Docs recommend a same-origin destination or the service's own session-ending endpoint, and name `<link rel="preconnect">` as the consumer's own, informed choice. An opt-in prop stays possible if the maintainer wants it.
- **Preload guide (docs only, maintainer asked 2026-10-16):** a ranked "Make the exit fast" block: a light same-origin destination, `rel=prefetch` / Speculation Rules / a service worker for a same-origin neutral page, `preconnect` for a cross-origin one with the traffic warning. The library still does nothing itself; this reverses "don't recommend prerendering" for same-origin pages only.
- **Session end:** the recipe is a linkable Card on the docs page with a live QuickExit example using `/api/quick-exit` (docs only, no API change).
- **Review round 1 (CHANGES REQUIRED), fixes:** a Shift counts on keyup only when no other key or pointer press happened while it was held (so Shift+Tab, capitals and Shift+click never count nor announce); the exit hides the page with `display:none !important` on `<html>`, since `body[hidden]` loses to author `display:flex`; the shortcut works in text fields too (per spec; the field exemption from my first brief is removed); relative `href` is resolved, http(s) only; no announcement without a valid destination.
- **`QuickExit.Hint` is a part the consumer places** (lead), so the consumer owns the markup. It renders nothing with `shortcut={false}`; the Link is `aria-describedby` it only while it is mounted; a dev warning fires once when the shortcut is on and no Hint is mounted. The hint stays visible after the first Shift.
- **Visible hint** `quickExit.hint` (maintainer, 2026-10-16), replacing "announcement only": the keyboard skill (rule 7) requires a visible or described hint for a document-wide shortcut; `aria-keyshortcuts` cannot express a triple press. Default-on stays (maintainer): the deviation from "opt-in" is recorded in the `keyboard` skill and `key-tables.md`.
- **Window 5 s** (spec, GOV.UK), not 1 s: a 1 s gap is too tight for tremor or slow input. `windowMs` stays overridable (lead, corrects the first draft of this plan).
- **Wiring:** `Link` registers its `href` with `Root` through an effect, so the shortcut is live one render after mount. `navigate`, `shortcut` and `messages` are `Root` props. An invalid href renders the anchor with no `href` and a dev warning (engineer).
- **Pointer:** click, Ctrl/Cmd-click and middle click are `preventDefault`ed and exit in the same tab (engineer, follows spec §3).
- **`shortcutRemaining`** uses `format.plural`; fi, nb, nn carry a "draft, native review" header. The Link is `aria-describedby` the Hint (visible text) while a Hint is mounted; there is no count display.
- **Label:** "Leave this page" / "Lämna sidan" (maintainer). Not user-tested yet. <!-- kv-lang-ok: national hide-a-page phrases are the subject -->
- **Look:** flat `secondary` fill link, a named exception to "links look like links" in DESIGN.md (maintainer). No new tokens; hover is an underline.
- **Tab stop 2**, after the skip link (maintainer).
- **Shortcut default on** despite the NVDA risk (maintainer, informed).
- **Count display:** announcement only, no three-dot visual (lead, smaller surface).
- **Docs:** include a short recipe for the consumer's own endpoint that clears the session, then redirects (lead).

## Risks & open questions

- Does `display:none` on `<html>` before navigate suffice for a slow destination? It hides at once and nothing is left to read; not yet seen with a throttled `navigate`.
- NVDA/JAWS browse mode may pass backwards quick navigation (Shift+H…) as a lone Shift: documented, AT check pending.
- The Calendar type error (`calendar.api.ts` was missing the `announceChoice` row) is fixed 2026-10-17; the dev-warnings table now has the three `quick-exit-*` rows.
- Referrer is removed by the anchor policy; the docs say what the consumer still controls (`Referrer-Policy` header).
- Earlier history entries (the search that led here) remain. The docs say so; they never claim "no trace" (hard rule 8 spirit).
- Usability testing of the label and the manual AT check are `pending`; agents never claim them.

## Testing strategy

Core: node tests for the sequence (window, reset, repeat, other key). Components: browser tests with real key events for Tab/Enter/Space and the Shift sequence, the announcement, text fields (the shortcut works there; capitals and chords don't count); `navigate` spy for the exit. Axe in each story state in every theme.

## Rollout

Alpha, no Changeset (off until alpha). Docs page and `Keyboard` story ship with it.

## Done when

- [ ] All quality gates in AGENTS.md pass (manual AT may be `pending`)
- [ ] Plan tasks ticked, `docs/roadmap.md` updated, accessibility-reviewer APPROVE
