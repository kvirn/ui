# Accessibility

## Baseline

- **Target:** WCAG 2.2 AA for every component and block (ADR-0004). The default theme also meets 2.4.13 Focus Appearance and 2.5.5 Target Size (Enhanced), and the high-contrast theme meets 1.4.6.
- **Patterns:** WAI-ARIA APG. Any deviation needs an ADR.
- **Legal mapping:** EN 301 549. See [compliance.md](compliance.md).
- **Procedure, checklist and contract template:** `.claude/skills/accessibility/`. These are plain Markdown and written for humans too.
- **Definition of done:** the quality gates in [AGENTS.md](../AGENTS.md#quality-gates).

## WCAG 2.2 additions and what we do about them

| SC                              | What we do                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------- |
| 2.4.11 Focus Not Obscured       | Floating layers never cover focus. Scroll-padding helpers handle sticky headers   |
| 2.4.13 Focus Appearance (AAA)   | Default ring of at least 2px at 3:1 contrast, enforced by `theme:check`           |
| 2.5.7 Dragging Movements        | Every drag has a single-pointer alternative                                       |
| 2.5.8 Target Size (Min)         | Default theme uses at least 24×24px. A dev warning fires when a target is smaller |
| 3.2.6 Consistent Help           | Help slot in header and footer blocks                                             |
| 3.3.7 Redundant Entry           | The form wizard carries answers forward                                           |
| 3.3.8 Accessible Authentication | Paste and autofill allowed, correct `autocomplete`, no cognitive tests            |

## Assistive technology matrix

These tiers are set by ADR-0004. **Core** rows must pass before a component reaches `beta`. **Release** rows are tested before 1.0, and before every minor release after it, for all changed components. Results go in `<name>.a11y.md` and are published on the docs site.

| AT                                     | Browser         | OS              | Tier    |
| -------------------------------------- | --------------- | --------------- | ------- |
| NVDA                                   | Firefox         | Windows         | Core    |
| VoiceOver                              | Safari          | macOS, iOS      | Core    |
| TalkBack                               | Chrome          | Android         | Core    |
| Windows Contrast Themes                | Edge            | Windows         | Core    |
| Keyboard only, 400% zoom, 320px reflow | all             | all             | Core    |
| JAWS                                   | Chrome          | Windows         | Release |
| NVDA                                   | Chrome          | Windows         | Release |
| Narrator                               | Edge            | Windows         | Release |
| Dragon / Voice Control                 | Chrome / Safari | Windows / macOS | Release |

## User testing

- At least twice a year, test with disabled users recruited through Nordic disability organisations, and pay them.
- Blocks get plain-language review: _klarspråk_ in Sweden, _selkokieli_ in Finland.
