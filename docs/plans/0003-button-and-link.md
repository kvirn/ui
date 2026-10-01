# Plan 0003: Button and Link

- **Status:** Done (alpha. Manual AT and Sámi review pending before beta)
- **Owner:** Maintainer
- **Created:** 2026-09-30 · **Target:** M0 proof / M1
- **Related:** ADR-0005, ADR-0007, ADR-0015, ADR-0016, Plan 0002

## Goal

Buttons that never submit forms by accident and can stay discoverable when disabled, and links that work with the app's router while telling users about the current page and new tabs.

## Non-goals

- Toggle (`aria-pressed`). That comes next, on the same hook.
- A pending/loading button. It needs the Announcer.
- Detecting the current page automatically from the router.

## Background

- APG Button pattern. A link is a native `<a href>`, and no APG widget is needed.
- WCAG: 2.1.1, 2.4.4, 2.4.7, 2.5.8, 3.2.5 (G201: warn before opening a new window), 3.1.2, 4.1.2.
- Prior art: Base UI `Button`, React Aria `Link` and `Button`, GOV.UK button/link guidance.

## Design

### API sketch

```tsx
const button = useButton({ disabled, focusableWhenDisabled: true })
<button {...button.buttonProps}>Skicka</button>

<Button onClick={save}>Spara</Button>                      // type="button" by default
<Button type="submit">Skicka ansökan</Button>
<Button disabled focusableWhenDisabled>Skicka</Button>     // aria-disabled, activation blocked
<Button render={<MyStyledButton />}>…</Button>             // must still render a <button>

<Link href="/ansok" current="page">Ansök</Link>            // registered router Link (ADR-0005)
<Link href="https://digg.se" target="_blank">
  Digg <Link.NewTabNotice />                               // "(öppnas i en ny flik)" from i18n
</Link>
<Link href="https://digg.se" target="_blank" messages={{ newTabNotice: '(nytt fönster)' }}>
  Digg <Link.NewTabNotice />                               // instance override (ADR-0007)
</Link>
<Link.NewTabNotice>(extern länk)</Link.NewTabNotice>       // children win over every message
<Link href="/fi" hrefLang="fi" lang="fi">Suomeksi</Link>
<Link render={<a />} href="/file.pdf" download>…</Link>   // opt out of the router
```

`Link` has **no** `disabled` prop, by type: disabled links aren't a thing.

### Accessibility contract (draft)

| Part              | Element                               | ARIA / attributes                                                                                                                  |
| ----------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Button            | `<button>`                            | `type="button"` default. `disabled`, or `aria-disabled="true"` when `focusableWhenDisabled`. `data-disabled`, `data-focus-visible` |
| Link              | `<a href>` (via registered component) | `aria-current` from `current`. `rel="noopener noreferrer"` added with `target="_blank"`. `data-current`, `data-focus-visible`      |
| Link.NewTabNotice | `<span>`                              | Translated text. The consumer decides whether to hide it visually. Dev warning when `target="_blank"` has no notice                |

| Key   | Context      | Action                                                             |
| ----- | ------------ | ------------------------------------------------------------------ |
| Tab   | Button, Link | Focus. A disabled button is skipped unless `focusableWhenDisabled` |
| Enter | Button       | Activate. Blocked when disabled                                    |
| Space | Button       | Activate on key up. Blocked when disabled                          |
| Enter | Link         | Follow the link                                                    |
| Space | Link         | Not handled (native: scroll)                                       |

- Focus: no focus management. A focusable disabled button keeps focus after an activation attempt.
- A Button whose `render` resolves to a non-`<button>` element triggers a dev warning. Use Link for navigation.

### i18n strings

| Key                 | en                   | sv                    | fi                           | nb                   | nn                       | se                  |
| ------------------- | -------------------- | --------------------- | ---------------------------- | -------------------- | ------------------------ | ------------------- |
| `link.newTabNotice` | (opens in a new tab) | (öppnas i en ny flik) | (avautuu uuteen välilehteen) | (åpnes i en ny fane) | (blir opna i ei ny fane) | TODO(native-review) |

Overridable via `<Link messages>`, provider `messages`, or `Link.NewTabNotice` children (ADR-0007). Tests cover all three.

### Theming surface

`data-disabled`, `data-focus-visible`, `data-current`. No tokens of its own.

## Tasks

- [x] `button.a11y.md` and `link.a11y.md` from the contract template
- [x] Failing tests: Vitest + axe, Playwright rows above
- [x] `core`: none expected (stateless). Revisit for Toggle
- [x] `react`: `useButton`, `Button`, `useLink`, `Link`, `Link.NewTabNotice`, `mergeProps` (first user). Also internal `renderPart` (`render` prop), `useFocusVisible` and `useMergedRef` (ADR-0015, ADR-0016)
- [ ] i18n string in all 6 locales, Sámi reviewed by a native speaker. The key exists in all 6 locales (Plan 0002). `se` is still an English placeholder, `TODO(native-review)`: not reviewed. **Blocks `beta`** (3.1.2: English text under `lang="se"`)
- [x] Stories: default, disabled, focusable-disabled, submit in a form, current page, new tab, router link (mock), RTL, forced-colors. Also new-tab notice overrides and other language. The smoke story and its e2e are deleted
- [x] accessibility-reviewer APPROVE (second round, after the render-element fix)
- [x] Roadmap: add Link, set status. Changeset

## Risks & open questions

- Should `Link.NewTabNotice` be required (a type error without it) instead of a dev warning? Start with the warning.
- `mergeProps` lands here as shared infrastructure. Keep it generic.

## Done when

- [x] All quality gates in AGENTS.md pass (manual AT `pending`, Sámi native review open)
- [x] Plan tasks ticked, `docs/roadmap.md` updated
