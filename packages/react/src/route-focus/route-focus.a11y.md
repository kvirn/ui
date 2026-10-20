# Accessibility contract: Route focus (`useRouteFocus`)

- **APG pattern:** none. It is not a widget. It applies the W3C technique of moving focus to the new page title on a single-page navigation (WCAG technique G110 is the redirect-based alternative; [technique ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) covers the optional status message).
- **Deviations:** none.
- **Native elements used:** the consumer's own `<h1>`, made temporarily focusable with `tabindex="-1"`.
- **Tests:** `use-route-focus.test.tsx` next to this file. `route-focus.stories.tsx` in `apps/storybook/src/components/route-focus/`.

A client-side navigation does not reload the page, so focus stays on the clicked link (which may be gone) and a screen reader says nothing (2.4.3 Focus Order, level A; 4.1.3 Status Messages, level AA). `useRouteFocus` moves focus to the new page's title once per navigation. It is a hook only: it renders nothing and returns nothing to spread.

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
- Back or Forward under `'auto'`: the browser restores scroll position only, not focus, so focus stays on `body`. The skip is kept on purpose: a restored scroll position is the reading position the user expects, and a focus jump to the title would scroll it away. With `announce` on, the navigation is still announced (`use-route-focus.test.tsx › route focus: with a real history › Back under automatic scroll restoration moves no focus, but still announces when announce is on`). It needs the AT run.
- Trap: no. Restore to: not applicable. The next Tab continues from the title.
- Never obscured by: the title scrolls into view (`preventScroll: false`). Pair it with `scroll-padding-top` for a sticky header (2.4.11 Focus Not Obscured (Minimum), level AA).
- The ring shows under `:focus-visible` only (the maintainer's decision). The browser does not show it on a pointer-initiated `focus()`. The default theme draws it with a rule that your own CSS can override.

## Announcements

The focused `h1` is read by the screen reader. `announce` is off by default, so Next.js's own route announcer is not doubled.

| Event                                                           | Message key (i18n)     | Politeness       |
| --------------------------------------------------------------- | ---------------------- | ---------------- |
| after the move, with `announce`                                 | `routeFocus.navigated` | polite (default) |
| Back or Forward that moved no focus (`'auto'`), with `announce` | `routeFocus.navigated` | polite (default) |

`{title}` is `document.title`, or the heading's text when the title is empty. Tests: `announce › on: says the navigated message with the document title`, `› on without a document title: uses the heading text`, `› off by default: nothing is said in the live region`, `› the message can be overridden per instance`.

### Read aloud

| State or action                               | Expected phrase(s) as read aloud    | Live region politeness | Test                                                                                                                                                             |
| --------------------------------------------- | ----------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Back or Forward under `'auto'`, `announce` on | `Navigated to {title}`, focus stays | polite                 | `use-route-focus.test.tsx › route focus: with a real history › Back under automatic scroll restoration reads the navigated message as polite and moves no focus` |

## Consumer responsibilities

- **Pass a stable key.** Path plus search from your router, never the hash. Call the hook once, in the layout that holds the page.
- **Render one `<h1>` per page inside the container.** Without it the hook warns and moves nothing.
- **Keep `scroll-padding-top`** above a sticky header so the focused title is not covered (2.4.11 Focus Not Obscured (Minimum), level AA).
- **Scroll restoration is the router's.** Under `'manual'` the hook also moves focus on Back and Forward.
- **Next.js already announces routes.** Leave `announce` off there. With a router that has no announcer of its own, turn `announce` on, or a screen reader user hears nothing about the new page after Back or Forward.
- **Give every route a `document.title` that names the page, and set it before the key changes** (2.4.2 Page Titled (A)). The hook neither sets nor checks it.

## Visual / modes

- Focus indicator: the default theme draws its focus ring on the focused `h1`, and uses the system's highlight colour in forced colours (Windows contrast themes). The hook ships no CSS and sets no data attribute.
- forced-colors behaviour, reduced-motion and reflow: the hook adds no style, so nothing changes. It never animates scroll.

## WCAG SCs covered

- 2.4.3 Focus Order (A): focus lands on the title and Tab continues from it (`keyboard › Tab after a navigation continues after the title`).
- 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured (Minimum) (AA): the title is focused and scrolled in. The ring is the default theme's.
- 3.2.1 On Focus (A): no move on the first load, a hash change or while typing (`route focus: when it moves › typing in a text field skips the move`).
- 4.1.3 Status Messages (AA): the optional `announce` through the Announcer.
- Axe: no violations with the title focused (`accessibility › no axe violations with the title focused`).

## AT test record

| AT + browser + OS                                                          | Agent check | Human check | Result  | Notes                                                                                                                         |
| -------------------------------------------------------------------------- | ----------- | ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Automated (re-runnable tests)**                                          |             |             |         |                                                                                                                               |
| axe, WCAG 2.2 A and AA, every story, 4 themes                              | pass        | n/a         | pass    | route-focus.stories.tsx, every story, 4 themes (apps/storybook/src/components/focus/)                                         |
| Markup and ARIA (roles, names, ids, states)                                | pass        | n/a         | pass    | use-route-focus.test.tsx › first load does not move focus or touch the title; expectNoA11yViolations                          |
| Keyboard contract rows (Vitest browser)                                    | pass        | n/a         | pass    | 3 rows, each names a test (use-route-focus.test.tsx › keyboard › Tab after a navigation continues after the title)            |
| Focus order and management                                                 | pass        | n/a         | pass    | use-route-focus.test.tsx asserts focus (toHaveFocus); first rule: keyboard › Tab after a navigation continues after the title |
| Display modes (forced colours, 320px reflow, text spacing, reduced motion) | n/a         | n/a         | n/a     | draws nothing itself; the focus ring on the focused h1 is the theme's general focus rule                                      |
| **Core (required for beta)**                                               |             |             |         |                                                                                                                               |
| NVDA + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                               |
| VoiceOver + Safari + iOS                                                   | pending     | pending     | pending |                                                                                                                               |
| **Release (before 1.0 and each minor)**                                    |             |             |         |                                                                                                                               |
| JAWS + Chrome + Windows                                                    | pending     | pending     | pending |                                                                                                                               |
| TalkBack + Chrome + Android                                                | pending     | pending     | pending |                                                                                                                               |
| VoiceOver + Safari + macOS                                                 | pending     | pending     | pending |                                                                                                                               |
| **Component-specific**                                                     |             |             |         |                                                                                                                               |
| Next.js announcer doubled or not                                           | pending     | pending     | pending |                                                                                                                               |

## Known issues

- **Back and Forward under `scrollRestoration: 'auto'` move no focus.** After Back or Forward under `scrollRestoration: 'auto'`, focus is not moved and stays on `body`, to keep the restored reading position. With `announce` off and no router announcer, a screen reader user hears nothing about the new page.
