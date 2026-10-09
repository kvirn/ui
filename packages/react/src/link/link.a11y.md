# Accessibility contract: Link

- **APG pattern:** none needed. A link is a native `<a href>` ([APG Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) only covers non-native links, which Link never renders).
- **Deviations:** none
- **Native elements used:** `<a href>`, rendered by the app's registered router link component, or by a native `<a>` when none is registered or `as="a"` is given. `<span>` for the new-tab notice. **Allowed elements:** `Link.Root` takes `as` as a component or a tag that renders an `<a href>` and forwards its ref; `Link.NewTabNotice` `span` (default), `em` or `small`; `Link.Icon` `span` (default) or `i`. Another tag on the last two warns once (`as-not-allowed`) and falls back to `span`.
- **Status:** alpha candidate (Plan 0003). Gates 1–5 pass, accessibility-reviewer pending. Manual AT is `pending`.
- **Tests:** `link.test.tsx` next to this file. `link.stories.tsx` in `apps/storybook/src/components/link/`.

Link navigates. An action is a Button. Link has no `disabled` prop, by type: a disabled link isn't a thing, so remove the link or render plain text instead.

## Roles, states, properties

| Part              | Element / role                         | ARIA                              | Notes                                                                                                                                                                     |
| ----------------- | -------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link.Root         | `<a href>` → `link`                    | `aria-current` from `current`     | `current`: `'page'`, `'step'`, `'location'`, `'date'`, `'time'` or `true`. `false` or absent sets nothing. `data-current` when set                                        |
|                   | `target="_blank"`                      | none                              | `rel="noopener noreferrer"` is added to the consumer's own `rel` tokens, also with `as="a"` or an `as` component                                                          |
|                   | keyboard focus                         | none                              | `data-focus-visible` while the link matches `:focus-visible`                                                                                                              |
|                   | another language                       | `lang`, `hrefLang` passed through | `<Link.Root href="/fi" hrefLang="fi" lang="fi">Suomeksi</Link.Root>` (3.1.2)                                                                                              |
| Link.Icon         | `<span>`, decorative                   | `aria-hidden="true"`              | `class="kv-link-icon"`. Always hidden: `aria-hidden` can't be turned off, so the icon is never part of the link's name (2.5.3). Put it first. Also exported as `LinkIcon` |
| Link.NewTabNotice | `<span>`, part of the link's name      | none                              | Text from `link.newTabNotice`. The consumer decides whether to hide it visually. Also exported as `LinkNewTabNotice`                                                      |
|                   | `target="_blank"` without a notice     | –                                 | Nothing: no type error and no dev warning (maintainer, 2026-10-05). Adding the notice is the consumer's responsibility                                                    |
|                   | link component doesn't render an `<a>` | –                                 | Dev warning: the registered component must forward its ref and render an `<a>`                                                                                            |

The service link is `className="kv-link--service"` on a Link: a look and not a role, so the element, the role and the keys are the same as any link. It has no disabled state, because a link has none (an unavailable e-service is text, not a dimmed link).

`useLink` gives the same `linkProps` and the resolved `newTabNotice` text for your own `<a>` or router link.

## Keyboard

- **Focus strategy:** native
- **Selection follows focus:** n/a
- **Arrows wrap:** n/a
- **Shortcuts:** none

A native `<a href>`: one Tab stop, in DOM order, with no `tabindex`. Enter is native.

| Key       | Context                   | Action                                                                           | Test                                                                                               |
| --------- | ------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Tab       | Link                      | Moves focus to the link                                                          | `link.test.tsx › keyboard › Tab moves focus to the link`                                           |
| Shift+Tab | Link                      | Moves focus to the previous focusable element, and off the link                  | `link.test.tsx › keyboard › Shift+Tab moves focus off the link`                                    |
| Enter     | Link                      | Follows the link                                                                 | `link.test.tsx › rendering › Enter activates the link; Space does not`                             |
| Enter     | Router link               | Follows the link through the registered router, without a page load              | `link.test.tsx › router link › Enter follows a router link without a page load`                    |
| Enter     | Link with `target=_blank` | Opens the link in a new tab. The link's name already said it would (3.2.5, G201) | `link.test.tsx › keyboard › Enter on a new-tab link does not intercept the browser’s own handling` |
| Space     | Link                      | Not handled (native: scrolls the page). Doesn't follow the link. Focus stays     | `link.test.tsx › rendering › Enter activates the link; Space does not`                             |

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

Resolution, first match wins: `Link.NewTabNotice` children, then `<Link.Root messages>` (or `useLink({ messages })`), then the nearest provider's `messages` and its ancestors, then built-in `en`. An empty or whitespace-only value falls through to the next level, with a dev warning. Tests: `link.test.tsx › new-tab notice`.

## Consumer responsibilities

- Give every link text that says where it goes, in context (2.4.4). No "click here".
- A link that opens a new window or tab must say so: put `<Link.NewTabNotice />` inside every `target="_blank"` link, or better, don't open new tabs (3.2.5, G201). Link does not check this: there is no type error and no dev warning. With `useLink`, render `link.newTabNotice` inside the link yourself.
- If you hide the notice visually, hide it with a visually-hidden technique, not `display: none` or `aria-hidden`, so it stays in the name. Consider showing it: sighted users benefit too.
- Set `current="page"` on the link to the current page, for example in navigation. Link doesn't detect it from the router.
- For a link in another language, set `lang` (the text's language) and `hrefLang` (the target's language) (3.1.2).
- Register a router link component that forwards its ref and renders an `<a>`. Use `as="a"` for downloads and other links the router mustn't handle.
- When overriding `newTabNotice`, keep it true to what happens (3.2.5) and consistent with any visible text (2.5.3).
- Style `[data-current]` and `[data-focus-visible]` (or `:focus-visible`). Don't show the current page by colour alone (1.4.1).

## Visual / modes

- Focus indicator: headless. The browser's native ring by default. The default theme restyles it to at least 2px at 3:1 (2.4.7, 2.4.13).
- Target size: inline links in a sentence are exempt from 2.5.8. The default theme gives standalone links at least 24 × 24 CSS px, and the service link and a [Navigation](../navigation/navigation.a11y.md) item are `control-min-block-size` high (44px, 32px compact). Test: `link.stories.tsx › Service` (play) asserts the 24px threshold for the service link, and `navigation.stories.tsx › CompactDensity` for a navigation item.
- forced-colors behaviour: a native `<a href>`, so the system's `LinkText` applies. The service link keeps a 1px `LinkText` edge, and its icon block is not filled: it has a `LinkText` divider, so the boundary survives (1.4.11). A link with `current` is heavier (weight 600) in the default theme, so it is never shown by colour alone (1.4.1). How the current page looks in a list of links, in forced colours too, is [Navigation](../navigation/navigation.a11y.md)'s contract (a fill and weight 600, and a straight bar in forced colours). A link in running text is 3:1 against the body text (`theme:check`) and underlined on hover; the contrast themes, forced colours and a link in grey or red text (a caption, `small`, help text, an error message) keep the underline at rest (1.4.1, `link.stories.tsx › In running text`).
- reduced-motion behaviour: no motion.
- Reflow: no horizontal scrolling at 320 CSS px (`reflow-320`, 1.4.10).

## WCAG SCs covered

- 2.1.1 Keyboard: native `<a href>`, Enter (Keyboard rows above).
- 2.4.4 Link Purpose (In Context): consumer text, plus the new-tab notice in the name.
- 2.4.7 Focus Visible: `data-focus-visible`.
- 3.1.2 Language of Parts: `lang` and `hrefLang` passed through (`link.test.tsx › passes lang and hrefLang through`).
- 3.2.5 Change on Request (G201): translated new-tab notice. Using it is the consumer's job: Link doesn't warn when it's missing.
- 4.1.2 Name, Role, Value: role `link`, `aria-current` (`link.test.tsx`).

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

## Known issues

- **`se` (Northern Sámi) shows English** for `link.newTabNotice`. Sámi users get English for this string under `lang="se"`, which fails 3.1.2 Language of Parts for that string.
- **WebKit is not automated.** Keyboard rows run in Vitest browser mode on Chromium. A WebKit run is not automated, and the manual AT matrix is `pending`.
- **A `target="_blank"` link with no notice is not flagged.** Neither a type error nor a dev warning catches it (maintainer decision 2026-10-05, Plan 0045), so review it by hand.
