# ADR-0015: `mergeProps` and `render` merge semantics

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Maintainer (proposed by component-engineer during Plan 0003)
- **Tags:** api, architecture

## Context

`docs/architecture.md#locality-of-behaviour` says `mergeProps(ownProps, disclosure.triggerProps)` "chains event handlers, merges `className` and `style`, and merges refs. It also warns on conflicting `id`s", and that `render` takes an element or a function. Plan 0003 lands both as shared infrastructure, with Button and Link as the first users. The architecture text leaves open:

1. The order chained handlers run in.
2. Whether an `undefined` value overrides a defined one.
3. With `render={<MyButton className="x" />}`, whether the element's own props or the part's props win.
4. How refs are merged, given React 19 callback-ref cleanups.

Prior art differs. React Aria's `mergeProps` calls handlers in argument order and lets later props win. Base UI calls the rightmost handler first and lets it cancel the rest.

## Decision drivers

- Predictable from the call site (locality of behaviour)
- Generic: nothing component-specific inside `mergeProps` (Plan 0003)
- Activation blocking for a disabled control must not depend on handler order

## Options considered

### Option A: argument order, later wins, `undefined` never overrides

- ✅ Reads left to right. Matches React Aria, which many adopters know
- ✅ `mergeProps({ type: 'submit' }, { type: undefined })` keeps `'submit'`, so optional hook props never erase consumer values
- ❌ A consumer handler merged before a part's handler runs even when the part would block the event

### Option B: rightmost first, with a cancel mechanism (Base UI)

- ✅ The consumer can stop the part's handler
- ❌ A hidden protocol (`preventBaseUIHandler`) that you can't see at the call site

## Decision

We will use Option A:

- Event handlers (`on[A-Z]…`) are chained and called in argument order, with the same arguments.
- `className`s are joined with a space. `style`s are shallow-merged, the later object winning per property.
- Refs are merged into one callback ref. On detach, each ref's own React 19 cleanup runs if it returned one; otherwise it is set to `null`.
- Any other prop: the later defined value wins. `undefined` never overrides.
- Two different `id`s give a dev warning, and the later wins.
- `render={<Element />}` clones the element with `mergeProps(partProps, element.props)`: the element's own plain props win and handlers chain. `render={(partProps, state) => …}` leaves spreading to the consumer.

Because handler order can't block anything, a part never relies on it for correctness. Hooks that must block activation take the consumer's handler as an option instead (`useButton({ onClick })`, ADR-0016).

Parts attach their own internal ref next to the consumer's with an internal `useMergedRef` hook, outside `mergeProps`, so the ref is stable across renders and the React Compiler's `refs` lint rule is satisfied.

## Accessibility impact

Merging alone can't block activation: `preventDefault` in one chained handler doesn't stop the next. With `render={<MyButton onClick={save} />}` on a focusable disabled Button, a plain `mergeProps(partProps, element.props)` would chain `save` after the Button's blocking handler, so `save` would run on click, Enter and Space (a 2.1.1 / 4.1.2 defect found in review).

So a part takes any prop it must control out of the `render` element before merging, and routes it through its hook. Button takes the element's `onClick` into `useButton({ onClick })`, and Link takes `target` and `rel` into `useLink` (ADR-0016). The element's own value still wins over the part's prop, as above. Merging your own `onClick` on top of `buttonProps`, or overriding `buttonProps.onClick` in the function form, is documented as unsupported (`button.a11y.md`).

## Consequences

- Positive: one rule for every part. `mergeProps` is public, so consumers compose with the same semantics.
- Negative / trade-offs: an element passed to `render` can override a part's plain props, for example `render={<button type="submit" />}`. That is explicit at the call site and intended. Props a part must control are the exception: they're taken out and routed through the hook, with the internal `takeRenderElementProps` helper.
- Follow-ups: `docs/architecture.md` states the order and the `undefined` rule.

## Validation

`packages/react/src/merge-props/merge-props.test.ts` (order, `undefined`, class names, styles, refs and cleanup, ids, type inference), the `render` tests in `button.test.tsx` and `link.test.tsx`, `button.test.tsx › handlers on a render element (ADR-0016)` and `link.test.tsx › target and rel on a render element go through useLink`.

## References

- React Aria [`mergeProps`](https://react-spectrum.adobe.com/react-aria/mergeProps.html), Base UI [`mergeProps`](https://base-ui.com/react/utils/merge-props), [React 19 ref cleanup](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)
