# ADR-0016: Button and Link API details

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (proposed by component-engineer during Plan 0003)
- **Tags:** api, a11y

## Context

Plan 0003 fixes the Button and Link contracts, but leaves some API details to the implementation:

1. How `useButton` blocks a consumer's click handler while disabled, when the consumer spreads `buttonProps` on their own `<button>`.
2. Which values `Link`'s `current` accepts, and whether a raw `aria-current` prop is also allowed.
3. How the hook form of Link gives the consumer the new-tab notice text.
4. How the dev warning for a `target="_blank"` link without a notice detects the notice.
5. How the dev warnings for a wrong element (`<Button render>` that isn't a `<button>`, a registered link component that doesn't render an `<a>`) detect it.

## Decision drivers

- `aria-disabled` without blocking activation is a known defect (accessibility skill, common mistakes)
- No ambiguous props (architecture: API conventions)
- Every string can be overridden (ADR-0007), in the hook form too
- Behaviour visible at the call site, no DOM querying by selector

## Decision

1. **`useButton({ onClick })`.** The hook takes the activation handler as an option and doesn't call it while disabled. Its own click handler calls `event.preventDefault()` while disabled, which also blocks form submission and implicit submission through a focusable disabled submit button. Blocking happens on `click`, which Enter and Space both produce on a native `<button>`, so no key handling is needed. `Button` passes its `onClick` prop to the hook, chained with the `onClick` of a `render` element, which it takes out of the element first. Otherwise `mergeProps` would chain the element's handler after the blocking one, and it would run while disabled (found in review, see ADR-0015). In the function form, the consumer must not override `buttonProps.onClick`. **`ButtonProps` omits `aria-disabled`**, like `LinkProps` omits `aria-current`: `disabled` with `focusableWhenDisabled` is the only way to set it, so it always comes with blocked activation.
2. **`current?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean`.** `true` gives `aria-current="true"`, and `false` or absent sets nothing. `LinkProps` omits `aria-current`, so `current` is the only way to set it and there is one prop for one concept. `target` and `rel` on a `render` element go through `useLink` too, taken out of the element like Button's `onClick`, so `render={<a target="_blank" />}` still gets `noopener noreferrer` and the missing-notice warning. The element's own values win over the Link's props (ADR-0015).
3. **`useLink` returns `newTabNotice: string`**, resolved through `useMessages('link', messages)`, alongside `linkProps`, `isCurrent`, `isFocusVisible` and `opensInNewTab`. The consumer renders it inside the link.
4. **`Link.NewTabNotice` registers itself with its Link through context** in an effect. The Link checks the count in its own effect, which runs after its children's. The warning fires once per link text. A notice written some other way still triggers it (listed in `link.a11y.md` known issues).
5. **After commit, the part checks its own element's `tagName`** through its ref. A missing element means the component didn't forward the ref, which ADR-0005 already requires.

`LinkNewTabNotice` is also a named export, because React Server Components can't dot into a client module (`Link.NewTabNotice` fails there). This follows the architecture's "both forms are exported" rule.

## Accessibility impact

- 4.1.2 and 2.1.1: a focusable disabled button is exposed as disabled (`aria-disabled`) and can't be activated by pointer, Enter, Space or implicit form submission.
- 3.2.5 (G201): developers are warned about a new-tab link without a notice.
- 4.1.2: `aria-current` values are typed, so an invalid token can't be passed.

## Consequences

- Positive: the hook form is as safe as the component. The notice is overridable at every ADR-0007 level, including the hook.
- Negative / trade-offs: a handler merged on top of `buttonProps` with `mergeProps`, or an override of `buttonProps.onClick` in the `render` function form, is not blocked. `button.a11y.md` documents that the handler goes to the Button, the `render` element or `useButton({ onClick })`.
- Follow-ups: Toggle reuses `useButton` (Plan 0003 non-goal). Revisit making `Link.NewTabNotice` required by type (plan open question).

## Validation

`button.test.tsx › focusable when disabled`, `button.test.tsx › handlers on a render element (ADR-0016)`, `button.test.tsx › useButton`, `link.test.tsx › target and rel on a render element go through useLink`, `link.test.tsx › current`, `link.test.tsx › new-tab notice`, `link.test.tsx › router link`, and the e2e rows in `button.e2e.ts` and `link.e2e.ts`.

## References

- Plan 0003, ADR-0005, ADR-0007, [APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [WAI-ARIA `aria-current`](https://www.w3.org/TR/wai-aria-1.2/#aria-current), [WCAG G201](https://www.w3.org/WAI/WCAG22/Techniques/general/G201)
