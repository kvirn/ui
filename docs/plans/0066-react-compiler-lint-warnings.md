# Plan 0066: Clear the React Compiler lint warnings

- **Status:** Draft
- **Owner:** component-engineer, orchestrated by lead
- **Created:** 2026-10-06 · **Target:** next patch
- **Related:** AGENTS.md rules 1, 10, 12 · `api-conventions` skill · no design spec (no visible change)

## Goal

`vp check` reports 0 warnings from the `react(*)` and `react-hooks(*)` rules, with no change to any component's behaviour, API or accessibility contract. Where a warning is a false positive of the linter and the code is right, the plan records that and leaves the code alone.

## Non-goals

- No new behaviour, API, prop, string or `data-*` attribute. No changeset (no public API change).
- No lint-disable comments and no rule turned off or downgraded: that weakens a gate (rule 1). A rule changes only with the maintainer's approval.
- No refactor beyond the warning's own site.

## Background

29 warnings remain after the mechanical clean-up (`typescript`, `vitest` rules). The 27 here come from the React Compiler lint rules, which flag patterns that opt a component out of automatic memoisation. KvirnUI doesn't run the compiler, so none is a bug today. Two `exhaustive-deps` warnings in `rich-text` are deliberate (the dependency is keyed on `serializedProp` so typing doesn't reset the caret, and `levelsKey`/`labelsKey` keep a memo stable). They need a different fix than "add the dependency".

### Sites

| Rule                          | Where                                                                                                                                                                                      | Likely cause                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `refs` (render)               | `date-input/date-input.tsx:124`, `listbox/use-list-virtualization.ts:161`, `tooltip/use-tooltip.ts:161`, `file-upload/use-file-upload.ts:369`, `rich-text-editor/rich-text-editor.tsx:292` | a ref (or a hook's returned `ref`) is read or passed during render               |
| `refs` (render)               | `checkbox-group/checkbox-group.test.tsx:396-399`                                                                                                                                           | test component reads a ref in render                                             |
| `globals`, `immutability`     | `number-input/number-input.test.tsx:717,828-830`, `mask/use-mask.test.tsx:91,152`                                                                                                          | test components assign to a variable outside the component to capture a value    |
| `immutability`                | `rich-text-editor/use-rich-text-editor.ts:442`                                                                                                                                             | assigns `keymap.onFocusToolbar` etc. on an object created outside render         |
| `set-state-in-effect`         | `rich-text-editor/use-rich-text-editor.ts:371`, `file-upload/file-upload.tsx:714`, one more (find with `vp check`)                                                                         | sync `setState` inside an effect                                                 |
| `preserve-manual-memoization` | `listbox/listbox.tsx:546`                                                                                                                                                                  | `useMemo` deps (`registerPart`, `optionId`) don't match what the compiler infers |
| `exhaustive-deps`             | `rich-text-editor/use-rich-text-editor.ts:375`, `rich-text-editor/block-format.tsx:136` (3 warnings)                                                                                       | deliberate key-based dependencies                                                |

## Design

### Approach

Per site, in this order, and stop at the first that applies:

1. **Test components** (`*.test.tsx`): capture through a callback or `vi.fn()` passed as a prop, or read the ref in an effect, instead of assigning an outer variable or reading `ref.current` in render. The asserted behaviour stays identical.
2. **Real fix, same behaviour:** read the ref in an effect or event handler; derive state during render instead of syncing it in an effect (for the `file-upload` preview, an effect that creates and revokes an object URL is an external-resource sync, so the aim is to avoid the sync `setState`, not the effect; check whether a ref-held URL read at render is enough); set handlers on the keymap in a `useEffect` that owns the keymap instead of mutating in a `useMemo`; match `listbox` memo deps to the values it uses.
3. **False positive** (the code is right and any rewrite adds risk): leave the warning, and list the site under "Left in place" in this plan with the reason. Don't add a suppression.

Each fix must keep the public hook result and the DOM unchanged.

### Accessibility contract

Unchanged. No key, role, ARIA state, focus rule or announcement moves. `accessibility-reviewer` checks the diff for exactly that, once, at the end. The risky sites are the ones that touch focus or announcements: `use-rich-text-editor.ts` (toolbar focus, announcements), `file-upload` (focus after remove, announcements) and `listbox` (active descendant).

## Tasks

- [ ] Tests (checkbox-group, number-input, use-mask): remove the outer assignments and render-time ref reads. `vp test run` on each file.
- [ ] `listbox.tsx:546` memo deps. `vp test run` on `packages/react/src/listbox`.
- [ ] `date-input`, `tooltip`, `use-list-virtualization`, `use-file-upload`: the render-time ref sites. Re-run each component's test file.
- [ ] `file-upload.tsx:714` preview URL without a sync `setState` in the effect.
- [ ] `rich-text-editor` (hook, component, block-format): keymap handlers, the `serializedProp` effect, the memo keys. Re-run `packages/rich-text`.
- [ ] List every site left as a false positive under "Left in place" below, with the reason.
- [ ] Gates on the main thread: `vp check` (whole tree, expect 0 `react*` warnings or only the listed ones), `vp run test`, `vp run i18n:check`, `vp run theme:check`.
- [ ] `accessibility-reviewer` on the diff.

## Decisions

- Options weighed: (a) turn the React Compiler rules off, (b) add `// oxlint-disable` comments, (c) fix or record each site. **Chosen: (c).** (a) and (b) weaken a gate and need the maintainer.
- Order: tests first (lowest risk), then the hooks that touch focus last, each with its own test run.
- Sites where a fix changes memo identity or caret/focus timing are left in place rather than forced.

## Left in place

_Filled in during implementation: site, rule, reason._

## Risks & open questions

- Several warnings may be unfixable without a behaviour change (`serializedProp` keyed effect, `levelsKey`/`labelsKey`). The plan accepts leaving them, recorded above.
- Is a clean `vp check` (0 warnings) a requirement, or may a few documented false positives stay? **Needs the maintainer.**
- Spread over 5 packages' worth of hooks: one PR, or one per package? Rule 10 and "one concern per PR" suggest one PR, since the concern is the same.
