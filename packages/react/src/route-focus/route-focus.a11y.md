# Accessibility contract: Route focus (`useRouteFocus`)

- **APG pattern:** none. It is not a widget. It applies the technique of moving focus to the new page title on a single-page navigation (G110 is the redirect-based alternative; [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) for the optional status message).
- **Deviations:** none.
- **Native elements used:** the consumer's own `<h1>`, made temporarily focusable with `tabindex="-1"`.
- **Status:** in progress (Plan 0055). Gates pending, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `use-route-focus.test.tsx` next to this file. `route-focus.stories.tsx` in `apps/storybook/src/components/route-focus/`.

A client-side navigation does not reload the page, so focus stays on the clicked link (which may be gone) and a screen reader says nothing (2.4.3, 4.1.3). `useRouteFocus` moves focus to the new page's title once per navigation. It is a hook only: it renders nothing and returns nothing to spread.

## Roles, states, properties

| Part      | Element / role                    | ARIA | Notes                                                                                                                                                                                                 |
| --------- | --------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The title | the consumer's `<h1>` → `heading` | none | `tabindex="-1"` is added just before focus when the element has no `tabindex`, and removed on `blur`. An element that already has a `tabindex` keeps it. The heading level and role are never changed |
| the hook  | none                              | none | No `aria-live` of its own. With `announce` on, the text goes through the shared Announcer                                                                                                             |

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

Focus is moved programmatically, once per navigation, to a heading made temporarily focusable, then native tab order continues from it. The hook adds no Tab stop, handles no keys and never intercepts one.

| Key       | Context             | Action                                                                  | Test                                                                                                        |
| --------- | ------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tab       | after a navigation  | Continues after the focused `h1`, into the page's first stop            | `use-route-focus.test.tsx › keyboard › Tab after a navigation continues after the title`                    |
| Shift+Tab | after a navigation  | Goes back to the stop before the `h1` (the header), not to the old link | `use-route-focus.test.tsx › keyboard › Shift+Tab after a navigation goes back to the stop before the title` |
| Enter     | on the focused `h1` | Not handled (not a control)                                             | `use-route-focus.test.tsx › keyboard › the title is not a control and handles no keys`                      |

## Focus management

- Initial focus: not moved on the first load.
- Moves to the `h1` (or `selector`) inside `containerRef` (the document when absent) when `key` changes. `key` is the pathname plus the search, never the hash, so a hash-only change does nothing (`route focus: with a real history › a hash-only change is skipped, and focus stays on the link`).
- Skipped: the first load, an unchanged key, Back or Forward while `history.scrollRestoration` is `'auto'` (the browser restores scroll, not focus; see below), a text field or textarea having focus (the user is typing), and a missing target (a development warning `route-focus-target-missing`, nothing else).
- A fragment link (a skip link, a table of contents) fires `popstate` too but leaves the key alone, so it never marks the next navigation as a Back or Forward: the hook compares the address recorded at `popstate` with the location when the key changes, never with the key itself, so a basePath or a re-encoded search in the key cannot defeat it (`route focus: with a real history › a hash link, then a pushed path, still focuses the title`, `› a hash link, then a pushed path, still announces`).
- **Open for the maintainer to re-confirm:** the Back/Forward skip rests on one premise, that under `'auto'` the browser restores scroll position only. It does not restore focus, so after Back the focus is on `body`, and a screen reader user gets no title. The behaviour is kept (a restored scroll position is the reading position the user expects, and a focus jump to the title would scroll it away); it needs a decision and the AT run.
- Trap: no. Restore to: not applicable. The next Tab continues from the title.
- Never obscured by: the title scrolls into view (`preventScroll: false`). Pair it with `scroll-padding-top` for a sticky header (2.4.11).
- The ring shows under `:focus-visible` only (the maintainer's decision, spec `docs/design/docs-site-components.md` §9.1). The browser does not show it on a pointer-initiated `focus()`. The theme draws it with the zero-specificity `:where([tabindex='-1']:focus-visible)` rule.

## Announcements

The focused `h1` is read by the screen reader. `announce` is off by default, so Next.js's own route announcer is not doubled.

| Event                           | Message key (i18n)     | Politeness       |
| ------------------------------- | ---------------------- | ---------------- |
| after the move, with `announce` | `routeFocus.navigated` | polite (default) |

`{title}` is `document.title`, or the heading's text when the title is empty. Tests: `announce › on: says the navigated message with the document title`, `› on without a document title: uses the heading text`, `› off by default: nothing is said in the live region`, `› the message can be overridden per instance`.

## Consumer responsibilities

- **Pass a stable key.** Path plus search from your router, never the hash. Call the hook once, in the layout that holds the page.
- **Render one `<h1>` per page inside the container.** Without it the hook warns and moves nothing.
- **Update `document.title` before the key changes** if you use `announce`, or the old title is read.
- **Keep `scroll-padding-top`** above a sticky header so the focused title is not covered (2.4.11).
- **Scroll restoration is the router's.** Under `'manual'` the hook also moves focus on Back and Forward.
- **Next.js already announces routes.** Leave `announce` off there. TanStack Router has no announcer: turn it on.

## Visual / modes

- Focus indicator: the theme's token ring (`:where([tabindex='-1']:focus-visible)`) on the focused `h1`, with `Highlight` in forced colours. The hook ships no CSS and sets no data attribute.
- forced-colors behaviour, reduced-motion and reflow: the hook adds no style, so nothing changes. It never animates scroll.

## WCAG SCs covered

- 2.4.3 Focus Order: focus lands on the title and Tab continues from it (`keyboard › Tab after a navigation continues after the title`).
- 2.4.2 Page Titled, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured: the title is focused and scrolled in. The ring is the theme's.
- 3.2.1 On Focus: no move on the first load, a hash change or while typing (`route focus: when it moves › typing in a text field skips the move`).
- 4.1.3 Status Messages: the optional `announce` through the Announcer.
- Axe: no violations with the title focused (`accessibility › no axe violations with the title focused`).

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta)**             |         |        |        |       |
| NVDA + Firefox + Windows                 | pending |        |        |       |
| VoiceOver + Safari + macOS               | pending |        |        |       |
| VoiceOver + Safari + iOS                 | pending |        |        |       |
| TalkBack + Chrome + Android              | pending |        |        |       |
| Windows Contrast Themes + Edge           | pending |        |        |       |
| Keyboard only / 400% zoom / 320px reflow | pending |        |        |       |
| **Release (before 1.0 and each minor)**  |         |        |        |       |
| JAWS + Chrome + Windows                  | pending |        |        |       |
| NVDA + Chrome + Windows                  | pending |        |        |       |
| Narrator + Edge + Windows                | pending |        |        |       |
| Dragon / Voice Control                   | pending |        |        |       |
| Next.js announcer doubled or not         | pending |        |        |       |
