# Accessibility contract: KvirnProvider

- **APG pattern:** none. The provider renders no element and has no interaction of its own. The theme switcher used in its stories is consumer markup made of native radio groups ([APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), native `<input type="radio">`).
- **Deviations:** none
- **Native elements used:** none rendered by the provider. The story fixture uses `<fieldset>`, `<legend>`, `<label>` and `<input type="radio">`. `KvirnThemeScript` renders one `<script>`.
- **Status:** alpha. Gates 1–6 pass (accessibility-reviewer APPROVE, 2026-09-30). Manual AT is `pending`.

The provider's contract is about what it guarantees for other components (Plan 0002):

- `lang` and `dir` are available as `useLocale().localeProps` wherever the locale changes (3.1.2). The provider renders no element, so the consumer spreads `localeProps` on the element that starts a section in another language, and sets `<html lang dir>` for the page language itself (3.1.1).
- Every visible and announced component string comes from `messages`, resolved as instance `messages`, then the nearest provider and its ancestors, then built-in `en` (ADR-0007, hard rule 4). An empty or whitespace-only override falls through to the next level, so an accessible name is never empty (4.1.2).
- The theme follows `prefers-color-scheme` and `prefers-contrast` until the user chooses, and never overrides `forced-colors` (1.4.3, 1.4.6, 1.4.11).
- A theme change moves no focus and announces nothing. The switcher's own control state is the feedback.

## Roles, states, properties

| Part                            | Element / role                            | ARIA                                     | Notes                                                                                                 |
| ------------------------------- | ----------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| KvirnProvider                   | none (context only)                       | none                                     | Writes `data-kv-color-scheme` and `data-kv-contrast` (resolved values) on `<html>`. Not exposed to AT |
| `localeProps`                   | consumer's element                        | `lang`, `dir` attributes                 | `lang` is the BCP 47 locale. `dir` comes from the locale, or the `dir` prop                           |
| KvirnThemeScript                | `<script nonce>`                          | none                                     | Blocking, before first paint. Not exposed to AT                                                       |
| Theme switcher (fixture)        | `<fieldset>` → `group`, `<legend>` → name | none added                               | One group per axis: colour scheme, contrast                                                           |
| Theme switcher option (fixture) | `<input type="radio">` in a `<label>`     | native `checked`                         | Name from the wrapping `<label>`. 24 × 24 CSS px (2.5.8)                                              |
| Resolved theme text (fixture)   | `<p>`                                     | none. Deliberately **not** a live region | Shows the resolved values. Not `<output>` or `role=status`, so a change is not announced              |

## Keyboard

The provider adds no key handling. These rows prove it leaves native radio-group behaviour intact in the theme-switcher fixture.

| Key                    | Context        | Action                                                                                          | Test                                                                                          |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Tab                    | Page           | Focus moves to the checked radio of the colour-scheme group                                     | `kvirn-provider.e2e.ts › Tab moves focus to the checked radio of the colour-scheme group`     |
| Tab / Shift+Tab        | Radio group    | Moves to the next / previous group. One Tab stop per group                                      | `kvirn-provider.e2e.ts › Tab moves to the next group: one Tab stop per radio group`           |
| ArrowUp / ArrowLeft    | Radio group    | Checks and focuses the previous option (native; RTL handling is the browser's, not tested here) | `kvirn-provider.e2e.ts › ArrowUp / ArrowLeft select the previous option and keep focus on it` |
| ArrowDown / ArrowRight | Radio group    | Checks and focuses the next option, wrapping from last to first                                 | `kvirn-provider.e2e.ts › ArrowDown / ArrowRight select the next option and wrap around`       |
| Arrow keys             | Contrast group | Changes contrast only; the colour-scheme group is untouched                                     | `kvirn-provider.e2e.ts › Arrow keys change the contrast group independently`                  |
| Enter / Space          | Radio          | Native: Space checks the focused radio if unchecked. Enter is not handled                       | Native behaviour, not asserted                                                                |
| Escape, Home / End     | –              | Not handled                                                                                     | –                                                                                             |

Also covered in Vitest browser mode: `use-theme.test.tsx › arrow keys change the radio group; focus stays and nothing is announced`.

## Focus management

- Initial focus: not moved. The provider never touches focus.
- Trap: no.
- Restore to: not applicable.
- A theme change keeps focus on the radio that caused it (`kvirn-provider.e2e.ts › a theme change moves no focus and announces nothing`).
- Never obscured by: the provider renders nothing.

## Announcements

| Event                     | Message key (i18n) | Politeness                                                                                      |
| ------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| Theme change              | none               | None, by design. The checked radio is the feedback. No `status`, `alert` or `aria-live` present |
| Locale or messages change | none               | None. Components re-render with the new strings                                                 |

The provider will host the shared Announcer later (own roadmap item, a non-goal of Plan 0002).

### Message keys

The provider has no strings of its own. It resolves every component's keys. Plan 0002 adds the first key to the catalog so resolution is tested against real types:

| Key                 | Used by (owner)  | en                     |
| ------------------- | ---------------- | ---------------------- |
| `link.newTabNotice` | Link (Plan 0003) | `(opens in a new tab)` |

## Consumer responsibilities

- Set `<html lang dir>` to the root provider's locale and direction (3.1.1). The provider can't: it renders no element, and a server layout can't spread `localeProps` on `<html>`.
- Spread `useLocale().localeProps` on the element that starts a section in another language, so `lang` matches the strings (3.1.2). Nested providers inherit everything they don't set.
- Pass a catalog (`messages={sv}`) for a non-English locale. Otherwise English strings render under a non-English `lang`, with a dev warning per key.
- A nested provider that changes the language must pass that language's catalog too (`<KvirnProvider locale="fi-FI" messages={fi}>`). Otherwise its strings stay in the parent's language while `lang` says otherwise. A dev warning names both locales.
- When overriding a message that forms an accessible name, keep it consistent with the visible label (2.5.3 Label in Name, ADR-0007).
- Build the theme switcher from native controls with visible labels (for example radio groups in a `<fieldset>` with a `<legend>`), and don't make the resolved-theme text a live region.
- Render `KvirnThemeScript` with the response's CSP `nonce` in the server-rendered `<head>`, and put `suppressHydrationWarning` on `<html>`. With a custom storage adapter, render the `data-kv-color-scheme` and `data-kv-contrast` attributes on the server instead.
- Set `timeZone` explicitly for server rendering, so dates don't differ between server and client.

## Visual / modes

- Focus indicator: the provider renders nothing. The fixture relies on the browser's native radio focus ring. The default theme restyles rings in `@kvirn-ui/theme`.
- Target size: fixture radios are 24 × 24 CSS px, in labels at least 28px tall (2.5.8).
- forced-colors behaviour: the provider keeps writing the resolved attributes. `@kvirn-ui/theme` must let the OS palette win and never override `forced-colors: active` (ADR-0006). The e2e suite passes in the `chromium-forced-colors` project.
- reduced-motion behaviour: no motion. A theme change is instant. Passes in `chromium-reduced-motion`.
- Reflow: no horizontal scrolling at 320 CSS px for the Swedish, theme-switcher, nested-locale and RTL stories (`reflow-320` project, 1.4.10).

## WCAG SCs covered

- 1.4.3 Contrast (Minimum), 1.4.6 Contrast (Enhanced), 1.4.11 Non-text Contrast: OS preferences are honoured by default, and high contrast is user-selectable. Contrast values themselves are `@kvirn-ui/theme`'s (`theme:check`).
- 1.4.10 Reflow: e2e `reflow-320`.
- 3.1.1 Language of Page: consumer responsibility (`<html lang dir>`), documented in the usage doc's setup.
- 3.1.2 Language of Parts: `localeProps`, and the dev warning for a nested language change without a catalog (`kvirn-provider.test.tsx › nesting`, e2e `the nested locale section has its own lang`).
- 3.2.2 On Input: selecting a theme changes presentation only. No context change, no focus move.
- 4.1.2 Name, Role, Value: empty overrides fall through, so names are never empty (`kvirn-provider.test.tsx › an empty override falls through to the next level and warns once`).
- 4.1.3 Status Messages: not applicable. A theme change is deliberately not announced.

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

- **`se` (Northern Sámi) is a placeholder.** `link.newTabNotice` uses the English text, marked `TODO(native-review)`, until a native speaker provides it. Sámi users get English for this string under `lang="se"`.
- **WebKit not run locally.** The `webkit` and `mobile-safari` Playwright projects need system libraries that aren't installed on the development machine. CI runs them.
- **`TODO(legal-verify)`:** storing an explicitly chosen theme preference in `localStorage` is assumed to fall under the ePrivacy Art. 5(3) "strictly necessary" exemption (ADR-0006). Not yet verified.
