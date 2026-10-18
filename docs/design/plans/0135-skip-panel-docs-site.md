# Plan 0135: SkipPanel on the docs site, a help link, `mod`, and a shortcuts setting

- **Status:** Done (agents)
- **Owner:** lead → component-engineer
- **Created:** 2026-10-18 · **Target:** alpha
- **Related:** Plan 0132 (SkipPanel, committed 87899be3); `docs/design/accessibility-settings-page.md`; `keyboard` skill rule 7

## Goal

The docs site uses SkipPanel instead of its two SkipLinks. The panel offers Skip to main content and site navigation, a Search row (Ctrl+K, Command+K on Apple) and a link to a card on the accessibility settings page, where a visitor can turn the site's keyboard shortcuts off if they clash with a screen reader or other software.

## Non-goals

- A library-level, persisted shortcuts preference (maintainer: docs site only).
- New tokens. The card reuses the settings page's existing Card, Switch and Prose.
- A `ux-designer` spec: one more card in an existing page, built from existing parts (decision below).

## Design

### Library changes (packages/core, packages/react, packages/i18n)

- **`mod` on a chord.** `Shortcut` gains `mod?: boolean`: Command on Apple, Ctrl elsewhere. `matchShortcut`, `toAriaKeyShortcuts` (`Meta+K` / `Control+K`) and `shortcutKeys` take `{ apple }` and resolve it. A chord with `mod` and an explicit `ctrl` or `meta` is a dev warning. It stays a pure core helper, with no DOM at module scope. React passes the platform it already detects. No hydration mismatch: the key caps resolve after mount, as today.
- **`SkipPanel.HelpLink`**, a part (maintainer, 2026-10-18): `<SkipPanel.HelpLink href="/accessibility-settings#shortcuts">Keyboard help and settings</SkipPanel.HelpLink>`.
  - It is an `<a>`, with `as` for a router link, like `Link`.
  - It's an Item of the roving set: reached by the arrows, never a Tab stop of its own. It goes last, in its own Item, outside both groups or inside the shortcuts group, as the consumer places it.
  - Default text is the message `skipPanel.helpLink` ("Keyboard help and settings"); children and the `messages` prop replace it.
  - It does not focus a same-page target, so it uses no `useSkipLink` logic and follows the link natively.
  - It's rendered even when `shortcutsEnabled` is false, so the user can turn shortcuts back on.

### Docs-site changes (apps/docs)

- **Setting.** A small hook `useShortcutsSetting` stores `kvirn-ui:docs-shortcuts` in localStorage (`'on'` default, `'off'`), with a store a `useSyncExternalStore` reads (SSR-safe: `'on'` on the server). A change in one tab reaches the others through the `storage` event.
- **Site shell.** Replace the two SkipLinks (`site-shell.tsx:152-153`) with one `SkipPanel`:
  - Links: Main content (`#main`) and Site navigation (`#site-navigation`).
  - Shortcuts group: Search, `{ key: 'k', mod: true }`, which focuses the search input (the existing `useSearchShortcut` logic moves into the row's `onClick`).
  - `reopenShortcut` `{ key: 'k', alt: true, shift: true }`. Hint and HelpLink to `/accessibility-settings#shortcuts`.
  - `shortcutsEnabled` from the setting. The site's own Ctrl/Cmd+K listener is removed: one binding, in SkipPanel.
  - The search input loses its own `aria-keyshortcuts` (the effect is removed): the Search row carries it while the setting is on.
- **Accessibility settings page.** A new "Keyboard shortcuts" card in the existing Keyboard section (`id="shortcuts"` anchor): a Switch "Keyboard shortcuts on this site" with Prose that says what the shortcuts are and why to turn them off, and that other software may use the same keys. The anchor works with JS off (the Switch is the only part that needs JS).
- **Messages** in `apps/docs/messages/en.ts` only (the site is English, per the file). Remove the `skipLinks.navigation` key if nothing else uses it.
- **Docs pages:** SkipPanel's page documents `mod` and `HelpLink`; the settings page spec (`docs/design/accessibility-settings-page.md`) is updated for the card and the SkipPanel.

### Accessibility contract (delta to Plan 0132)

| Key                              | Context               | Behaviour                                                                                             |
| -------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| ArrowDown / ArrowUp / Home / End | on the HelpLink       | Same as any item: it is the last item                                                                 |
| Enter                            | HelpLink              | Follows the link (native)                                                                             |
| a `mod` chord                    | not editable, enabled | Command+K on Apple, Ctrl+K elsewhere; AltGr, Alt, Shift and the other platform's modifier don't match |
| Tab                              | HelpLink              | Not a Tab stop (roving), except before hydration                                                      |

- Roles / ARIA: the HelpLink is a plain link in the roving set; `aria-keyshortcuts` of a `mod` chord is `Meta+K` or `Control+K`.
- WCAG SCs: 2.1.4 (an off switch on the site, linked from the panel), 2.4.1, 3.2.3 (the panel and the link are on every page in the same place), 3.2.6 (a consistent way to the help), 4.1.2.

### i18n strings

`skipPanel.helpLink` = "Keyboard help and settings", in all 5 locales (fi, nb, nn drafts for native review).

## Tasks

1. [x] Core `mod` and tests; React `SkipPanel.HelpLink` (hook and part), `skipPanel.helpLink` in 5 locales, a test per delta row, `skip-panel.a11y.md` and `.md` — component-engineer A
2. [x] Stories: a `WithHelpLink` story and a `mod` row in `WithShortcuts` (`skip-panel.fixture.tsx`) — component-engineer A (after 1)
3. [x] Docs site: `useShortcutsSetting`, site shell SkipPanel, settings card with Switch, messages, remove the old Ctrl/Cmd+K effect and the SkipLinks — component-engineer B (after 1)
4. [x] Docs: SkipPanel page (`mod`, `HelpLink`), `accessibility-settings-page.md` — docs-writer (after 3)
5. [x] Gates (lead), accessibility-reviewer on the delta (CHANGES REQUIRED: all findings fixed, no third review per the maintainer), then commit

## Decisions

- **HelpLink is a part, not a Root prop** (maintainer, 2026-10-18), configurable text through children, `messages` and the provider.
- **Storage blocked** (reviewer, blocking): `useShortcutsSetting` keeps a module-level in-memory value when localStorage throws, so the switch still works until reload.
- **Ctrl/Cmd+K in the search input** is now an editable target, so SkipPanel doesn't handle it and the browser's own Ctrl+K runs. The old listener selected the input's text there. Accepted.
- **Non-Latin layouts:** a `mod` chord falls back to `event.code` when `key` isn't an ASCII letter (Cyrillic or Greek Ctrl+K still reaches search), with the Dvorak guard of the Alt fallback.
- **`mod: true` on the chord type** (maintainer, 2026-10-18), so the site's one binding gives the right key caps, `aria-keyshortcuts` and match on every platform.
- **The setting lives in the docs site only** (maintainer, 2026-10-18). The library keeps persistence out; `shortcutsEnabled` is the hook.
- **No `ux-designer` spec** (lead): the card is a Switch and Prose in an existing settings page section, with no new pattern, token or layout.
- **The HelpLink stays rendered when shortcuts are off**, or the user couldn't turn them back on.
- **The site's own Ctrl/Cmd+K code goes**: two bindings for one key would clash and break the off switch.

- **`mod` platform is a parameter:** `matchShortcut(event, shortcut, { apple } = { apple: false })` and `toAriaKeyShortcuts(shortcut, { apple } = { apple: false })`, so existing callers keep working; `shortcutKeys` already took `{ apple }`. Dev warning `skip-panel-mod-shortcut:<chord>` (row in `dev-warnings.mdx`).
- **Theme:** `theme.css` gets the `.kv-skip-panel__help-link` rules (the link shares the skip link and shortcut row rules, six selectors, no new token). The WithHelpLink story asserts `expectShown(helpLink)`.
- **i18n:** `skipPanel.helpLink` translated in sv, fi, nb, nn; fi, nb, nn are drafts for native review.

## Risks & open questions

- Real-AT checks stay `pending` (as in Plan 0132). Whether Ctrl/Cmd+K clashes with a screen reader or browser is what the new card is for.
- The settings page isn't a real consumer of persisted preferences yet: a docs-only key is acceptable; a library preference is a later plan if wanted.

## Testing strategy

Core: node tests for `mod` (Apple and not). React: one named test per delta row, the HelpLink part, no duplicate facts. Docs site: no tests (`apps/docs` has none); the SkipPanel stories prove the HelpLink and `mod` in Storybook.

## Done when

- [ ] Scoped gates pass, `accessibility-reviewer` APPROVE on the delta
- [ ] Plan ticked, `docs/roadmap.md` line, committed
