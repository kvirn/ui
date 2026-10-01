# Accessibility contract: Link

- **APG pattern:** none needed. A link is a native `<a href>` ([APG Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) only covers non-native links, which Link never renders).
- **Deviations:** none
- **Native elements used:** `<a href>`, rendered by the app's registered router link component (ADR-0005), or by a native `<a>` when none is registered or `render={<a />}` is given. `<span>` for the new-tab notice.
- **Status:** alpha candidate (Plan 0003). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.

Link navigates. An action is a Button. Link has no `disabled` prop, by type: a disabled link isn't a thing, so remove the link or render plain text instead.

## Roles, states, properties

| Part              | Element / role                         | ARIA                              | Notes                                                                                                                              |
| ----------------- | -------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Link              | `<a href>` → `link`                    | `aria-current` from `current`     | `current`: `'page'`, `'step'`, `'location'`, `'date'`, `'time'` or `true`. `false` or absent sets nothing. `data-current` when set |
|                   | `target="_blank"`                      | none                              | `rel="noopener noreferrer"` is added to the consumer's own `rel` tokens, also when `target` and `rel` are on a `render` element    |
|                   | keyboard focus                         | none                              | `data-focus-visible` while the link matches `:focus-visible`                                                                       |
|                   | another language                       | `lang`, `hrefLang` passed through | `<Link href="/fi" hrefLang="fi" lang="fi">Suomeksi</Link>` (3.1.2)                                                                 |
| Link.NewTabNotice | `<span>`, part of the link's name      | none                              | Text from `link.newTabNotice`. The consumer decides whether to hide it visually. Also exported as `LinkNewTabNotice`               |
|                   | `target="_blank"` without a notice     | –                                 | Dev warning, naming the link's text                                                                                                |
|                   | link component doesn't render an `<a>` | –                                 | Dev warning (ADR-0005): the registered component must forward its ref and render an `<a>`                                          |

`useLink` gives the same `linkProps` and the resolved `newTabNotice` text for your own `<a>` or router link.

## Keyboard

| Key   | Context                   | Action                                                                           | Test                                                            |
| ----- | ------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Tab   | Link                      | Moves focus to the link                                                          | `link.e2e.ts › Tab moves focus to the link`                     |
| Enter | Link                      | Follows the link                                                                 | `link.e2e.ts › Enter follows the link`                          |
| Enter | Router link               | Follows the link through the registered router, without a page load              | `link.e2e.ts › Enter follows a router link without a page load` |
| Enter | Link with `target=_blank` | Opens the link in a new tab. The link's name already said it would (3.2.5, G201) | `link.e2e.ts › Enter opens a new-tab link in a new tab`         |
| Space | Link                      | Not handled (native: scrolls the page). Doesn't follow the link. Focus stays     | `link.e2e.ts › Space does not follow the link`                  |

Escape, arrow keys and Home / End are not handled.

## Focus management

- Initial focus: not moved. Link never moves focus.
- Trap: no.
- Restore to: not applicable. Where focus goes after a client-side navigation is the router's or the app's job (for example, to the new page's `h1`).
- Never obscured by: Link renders no overlay.

## Announcements

| Event | Message key (i18n) | Politeness |
| ----- | ------------------ | ---------- |
| none  | none               | –          |

Link announces nothing. The new-tab notice is part of the link's accessible name, not a live region.

### Message keys

| Key                 | Part              | en                     | sv                      |
| ------------------- | ----------------- | ---------------------- | ----------------------- |
| `link.newTabNotice` | Link.NewTabNotice | `(opens in a new tab)` | `(öppnas i en ny flik)` |

Resolution (ADR-0007), first match wins: `Link.NewTabNotice` children, then `<Link messages>` (or `useLink({ messages })`), then the nearest provider's `messages` and its ancestors, then built-in `en`. An empty or whitespace-only value falls through to the next level, with a dev warning. Tests: `link.test.tsx › new-tab notice`.

## Consumer responsibilities

- Give every link text that says where it goes, in context (2.4.4). No "click here".
- Put `<Link.NewTabNotice />` inside every `target="_blank"` link, or better, don't open new tabs (3.2.5, G201). With `useLink`, render `link.newTabNotice` inside the link yourself.
- If you hide the notice visually, hide it with a visually-hidden technique, not `display: none` or `aria-hidden`, so it stays in the name. Consider showing it: sighted users benefit too.
- Set `current="page"` on the link to the current page, for example in navigation. Link doesn't detect it from the router.
- For a link in another language, set `lang` (the text's language) and `hrefLang` (the target's language) (3.1.2).
- Register a router link component that forwards its ref and renders an `<a>` (ADR-0005). Use `render={<a />}` for downloads and other links the router mustn't handle.
- When overriding `newTabNotice`, keep it true to what happens (3.2.5) and consistent with any visible text (2.5.3).
- Style `[data-current]` and `[data-focus-visible]` (or `:focus-visible`). Don't show the current page by colour alone (1.4.1).

## Visual / modes

- Focus indicator: headless. The browser's native ring by default. The default theme restyles it to at least 2px at 3:1 (2.4.7, 2.4.13).
- Target size: inline links in a sentence are exempt from 2.5.8. The default theme gives standalone links at least 24 × 24 CSS px.
- forced-colors behaviour: a native `<a href>`, so the system's `LinkText` applies. The current page must not be shown by background alone in the default theme. The e2e suite passes in `chromium-forced-colors`.
- reduced-motion behaviour: no motion. Passes in `chromium-reduced-motion`.
- Reflow: no horizontal scrolling at 320 CSS px (`reflow-320`, 1.4.10).

## WCAG SCs covered

- 2.1.1 Keyboard: native `<a href>`, Enter (e2e rows above).
- 2.4.4 Link Purpose (In Context): consumer text, plus the new-tab notice in the name.
- 2.4.7 Focus Visible: `data-focus-visible`.
- 3.1.2 Language of Parts: `lang` and `hrefLang` passed through (`link.test.tsx › passes lang and hrefLang through`).
- 3.2.5 Change on Request (G201): translated new-tab notice, and a dev warning when it's missing.
- 4.1.2 Name, Role, Value: role `link`, `aria-current` (`link.test.tsx`, e2e a11y tree).

## AT test record

| AT + browser + OS                        | Date    | Tester | Result | Notes |
| ---------------------------------------- | ------- | ------ | ------ | ----- |
| **Core (required for beta, ADR-0004)**   |         |        |        |       |
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

## Known issues

- **`se` (Northern Sámi) is a placeholder. Blocks `beta`.** `link.newTabNotice` uses the English text, marked `TODO(native-review)`, until a native speaker provides it. Sámi users get English for this string under `lang="se"`, which fails 3.1.2 Language of Parts for that string. Link can't reach `beta` until the Sámi text is native-reviewed.
- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
- **The missing-notice warning only sees `Link.NewTabNotice`.** A link that says "new tab" some other way still gets the dev warning.
