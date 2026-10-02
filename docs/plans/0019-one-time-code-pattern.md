# Plan 0019: OneTimeCode pattern

- **Status:** Done (gates green and accessibility-reviewer APPROVE on 2026-10-02; the manual AT matrix is pending)
- **Owner:** Maintainer / component-engineer
- **Created:** 2026-10-02 · **Target:** M1
- **Related:** ADR-0045 (Proposed), ADR-0033, ADR-0032, Plan 0014. Design spec: [docs/design/one-time-code.md](../design/one-time-code.md) (to be updated)

## Goal

Adopters shape a one-time code with a pattern, `****-****` or `***-***-***` or `AA-9999`, instead of a length. The boxes follow the pattern, with a dash drawn between groups, over the same single native input.

## Non-goals

- One input per box, auto-advance, auto-submit (ADR-0033).
- Separators other than `-`, other symbols, escapes, optional characters.
- Changing `masks.pattern()` or any other mask.
- A component that renders the cells from the pattern by itself (ADR-0045, follow-up).
- Resend links, countdowns and timeouts (M4 blocks).

## Background

- No APG pattern. The control stays a native `<input>`.
- WCAG: 1.3.1, 1.4.10, 1.4.11, 1.4.12, 3.2.2, 3.3.1, 3.3.2, 3.3.8, 4.1.3.
- The pattern engine (`packages/core/src/mask/pattern-engine.ts`) already handles literals lazily, a typed literal accepted once, and pasted separators dropped. It has `9`, `a` and `*` (Unicode letters) and no `A` or `&`.

## Design

### API sketch

```tsx
<Field.Root>
  <Field.Label>Code from the email</Field.Label>
  <Field.Description>The code has 8 characters in two groups of 4.</Field.Description>
  <OneTimeCode.Root
    pattern="&&&&-&&&&"
    onComplete={(value, unmaskedValue) => verify(unmaskedValue)}
  >
    <OneTimeCode.Input name="code" />
    {[...'&&&&-&&&&'].map((_, index) => (
      <OneTimeCode.Slot key={index} index={index} />
    ))}
  </OneTimeCode.Root>
</Field.Root>
```

Core: `masks.oneTimeCode({ pattern })` (ASCII tokens, `A` and `&` upper-case, throws `RangeError` on an invalid pattern). `OneTimeCodeMaskOptions` loses `length` and `characters`, and the `OneTimeCodeCharacters` type goes from core and react.

Hook: `useOneTimeCode({ pattern = '999999', value, defaultValue, onValueChange, onComplete, disabled, announceRejections, messages })`. Result: `slots` (one per pattern position: `{ kind: 'character' | 'separator', character, isFilled, isActive, caret, isSelected }`), `getSlotProps(index)`, `pattern`, `characterCount` (replaces `length`), `value`, `isComplete`, `isReady`, `isInvalid`, `isDisabled`. `onComplete(value, unmaskedValue)`.

### Accessibility contract (draft)

| Part  | Element             | ARIA                 | Class                                                               |
| ----- | ------------------- | -------------------- | ------------------------------------------------------------------- |
| Root  | `<div>`             | none                 | `kv-one-time-code` (`data-character-count`, `data-separator-count`) |
| Input | `<input type=text>` | from the Field       | `kv-one-time-code-input`                                            |
| Slot  | `<span>`            | `aria-hidden="true"` | `kv-one-time-code-slot` (character) · `kv-one-time-code-separator`  |

- Keyboard: unchanged, native text input. Backspace and Delete cross the dash like any character. Arrow keys step over it in one press.
- Focus: never moved. Separators are never focusable.
- Announcements: a refused character, throttled, names the allowed class (`mask.*`, existing strings). Nothing for the separator being inserted.
- Consumer responsibilities: the label, and a hint with the length and the groups.

### i18n strings

None new. The theme fixture strings in the stories gain a pattern-aware hint (story-local).

## Steps

1. **Design delta** (ux-designer): update `docs/design/one-time-code.md` for separators (look, size, spacing, caret at a separator, forced colours and fallback), the box and pattern limits, the row-width and fallback rules without `--grouped`, and the story list.
2. **Core** (component-engineer) — written, gates pending: `A` and `&`, ASCII tokens, `masks.oneTimeCode({ pattern })`, pattern validation, tests first.
3. **React** (component-engineer) — written, gates pending: the hook, `OneTimeCode.Slot` for separators, `onComplete` arguments, input attributes per pattern, tests first, `one-time-code.a11y.md` and `one-time-code.md`.
4. **Theme and stories** (component-engineer, after step 1) — written, gates pending: the Root renders `data-character-count` and `data-separator-count` (react test first), `theme.css` reads them (no `--grouped`, no `:nth-child(of)`; separator cell, thresholds `(2.5c + 1.25s - 0.5)rem`, dotted zero, fallback width counting the dash), `theme-css.test.ts`, stories (`TwoGroups`, `ThreeGroups`, `LetterPrefix`, digits, invalid, compact, `RTL`, forced colours, `Keyboard`), fixture hints from the pattern, e2e (the two separator rows, the dash layout, 320px fallback, limits, forced colours), `DESIGN.md` (Text inputs and Theming) and `docs/architecture.md` (state attributes). The pattern limits (4 to 10 characters, at most 2 dashes) are tested in `theme-css.test.ts` and e2e.
5. **Record**: update ADR-0033's status line to point at ADR-0045, the changeset (`.changeset/one-time-code.md`, `input-masks.md` if it names `length`), docs, plan status.

### Open fixes found by the Stop hook (2026-10-02)

Found while the Checkbox/Radio/NativeSelect session ran its gates. The session didn't touch these files (ADR-0043), so they're recorded here for whoever owns this plan:

- [ ] `packages/core/src/mask/masks.ts:263`: `assertOneTimeCodePattern` reads `source.length` with `source` undefined, because `masks.oneTimeCode` (line 298) is called without a `pattern` (for example with `{ length }` from `useOneTimeCode`, `use-one-time-code.ts:237`). Fix the call or keep the `length` option working next to `pattern`. Failing: `masks.test.ts` (1), `one-time-code.test.tsx` (70), `one-time-code.stories.tsx` (40, in all four theme projects)
- [ ] `packages/core/src/mask/masks.test.ts` fails the format check. Run `vp check --fix packages/core/src/mask/masks.test.ts` (this one path only)
- [ ] Re-run `vp check` and `vp test run` on the changed files until the Stop hook passes

## Verification

- `vp check` and `vp test run` on the changed files, 0 axe violations in every story state.
- `vp run e2e one-time-code.e2e.ts`: Chromium, forced-colors, reduced-motion, 320px.
- `vp run theme:check` (no new pair expected), `vp run i18n:check`.
- accessibility-reviewer returns APPROVE. The manual AT matrix stays `pending`.

## Notes

- Storybook only: the Actions panel's `action` serialized the React event in `onValueChange`'s second argument on every keystroke, so typing lagged. The stories now use `logChange` (value and reason only), as the choice stories do. The component itself is unchanged.
