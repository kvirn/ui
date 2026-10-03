---
name: api-conventions
description: How a KvirnUI hook, part and compound component is built in code - the hook and part pair, the render prop, mergeProps, hooks that gate handlers, messages and useMessages, the Register registries (router links, icons), developer warnings and the 'use client' entry. Use when you add or change a component's API or implementation, or review one. The naming and prop rules themselves live in docs/architecture.md, API conventions.
when_to_use: new component, new part, render prop, mergeProps, disabled button onClick, useMessages, messages prop, new string, dev warning, warnOnce, Register, linkComponent, defineIcons, displayName, compound alias, use client, ref merging, review of a component's API
---

# API conventions (author side)

The user-visible rules are in `docs/architecture.md`, API conventions: naming, props, types, locality of behaviour, the shared part vocabulary, the styling contract and internationalisation. Read them first. This skill is what an author needs on top: how the pieces are wired, and which helpers to use.

Load it with `accessibility` (what the component must expose) and `testing` (how to test it).

## A component is a hook plus parts

- **The hook holds the behaviour.** `useX(options)` returns one prop object per part (`triggerProps`), `getXProps(argument)` where props depend on an argument, state (`isOpen`, `isDisabled`) and ids. It spreads onto the consumer's elements.
- **Each part component is the hook plus `renderPart`.** It calls the hook, then renders exactly one element.
- **Part props carry the part's class** (`className: 'kv-button'`) and `data-*` state. The class is typed as a literal, so a wrong spread fails the type check.
- **Types:** export `UseXOptions`, `UseXResult`, `XPartProps` (the hook's prop object) and `XProps` (the component's). A part's `render` receives `(partProps, state)`, where `state` is a small typed object (`ButtonState`).
- **Components take `ref` as a normal prop** (`ComponentPropsWithRef<'button'>`, React 19). A part that needs its own ref merges it with the consumer's through `useMergedRef(consumerRef, ownRef)` (internal, in `merge-props/`). It is stable while the refs are, so React does not detach and re-attach it each render.
- **Subscribe to a core store with `useStoreSelector(store, selector)`** (internal, `useSyncExternalStore`). Consumers never call `setState`. Don't use `@tanstack/react-store`.
- **Internal hooks are not exported:** `useStoreSelector`, `useMessages`, `useEnv`, `useLinkComponent`.

## Parts, `render` and aliases

- **`renderPart({ render, defaultElement, partProps, state })`** (internal, `render/render-part.ts`) renders every part.
  - No `render`: `createElement(defaultElement, partProps)`.
  - Element form, `render={<a href="/help" />}`: the element is cloned with `mergeProps(partProps, element.props)`. Its own plain props win and handlers chain.
  - Function form, `render={(partProps, state) => <El {...partProps} />}`: the consumer spreads the props. Keep `className` when you do.
- **A part that needs a specific element** (`<button>`, `<a>`, `<fieldset>`) checks `ref.current.tagName` in an effect after commit and warns when `render` produced something else. See the warnings reference.
- **Namespaces** are written `X.Root` and `X.Part`. Build one with `Object.assign(Root, { … })` or a frozen object. Every part also has a named export (`CardHeader`) for tree-shaking and RSC, which cannot dot into a client module.
- **An alias is the same component,** not a wrapper: `Field.Prose` is `Prose`, `Combobox.Option` reuses Listbox's. The alias shares the source's display name.
- **Display names today:** the root of a callable-root compound is the flat name (`Field`, `Fieldset`, `Link`). `Label`, `ErrorMessage`, `Legend` and `Prose` are exported flat as well as aliased (`Field.Label`). Namespace parts are `X.Part` (`FileUpload.Trigger`). "Show code" prints the display name.

## `mergeProps(...propObjects)`

Public. Merges left to right, for one element:

- Handlers (`on[A-Z]`): chained in argument order, with the same arguments.
- `className`: joined with a space. `style`: shallow-merged, later wins per property.
- `ref`: merged into one callback ref. Each React 19 cleanup runs, otherwise the ref is set to `null`.
- Any other prop: the later defined value wins. `undefined` never overrides.
- Two different `id`s: the later wins, and it warns in development (a label or `aria-describedby` now points at nothing).

Put the consumer's props first and the hook's last when the hook must win (`mergeProps(otherProps, button.buttonProps)`). Put the consumer's last when theirs should win (`mergeProps(mask.inputProps, ownProps)`).

## Hooks that gate a handler

Merging can't stop an activation. A part that must control a prop takes it out of the `render` element and routes it through its hook.

- **Helper:** `takeRenderElementProps(render, ['onClick'])` returns `{ render, takenProps }`. The element comes back with those props set to `undefined`, so `mergeProps` can't pass them through.
- **Button:** `useButton({ onClick })` never calls `onClick` while `disabled`, and its click handler calls `preventDefault()` then, which also blocks form submission and reset. Blocking is on `click`, which Enter and Space produce, so there is no key handling. `Button` merges its own `onClick` with the `render` element's and passes the result to the hook.
- **Unsupported:** merging your own `onClick` over `buttonProps`, and overriding `buttonProps.onClick`. In the function form, keep `buttonProps.onClick`.
- **`ButtonProps` omits `aria-disabled`.** It is set only by `disabled` with `focusableWhenDisabled`. `LinkProps` omits `aria-current`: use `current`.
- **Link:** `target` and `rel` on a `render` element go through `useLink` (it adds `noopener noreferrer` for `_blank` and keeps the consumer's own `rel` tokens, once each). The element's own values win.
  - `current` is `'page' | 'step' | 'location' | 'date' | 'time' | boolean`. `true` gives `aria-current="true"`. `false` or absent gives none.
  - `useLink` returns `linkProps`, `isCurrent`, `isFocusVisible`, `opensInNewTab` and `newTabNotice` (from `useMessages('link', messages)`).
  - `Link.NewTabNotice` registers itself with the Link through context in an effect. The Link counts registrations in its own effect, which runs after its children's, and warns once per link text when a `_blank` link has none. `LinkNewTabNotice` is also a named export.

## Messages

Rules for the catalog and locales are in `docs/architecture.md`, Internationalisation. The author side:

- **Every component with strings calls `useMessages(namespace, props.messages)`** (internal) and exposes `messages?: Partial<KvirnMessages['namespace']>`.
- **Resolution, first match wins:** children of a visible text part, the instance `messages`, the nearest provider and its ancestors, built-in `en`. A resolved layer is not pre-merged, so an empty one falls through.
- **An empty or whitespace override** (string, or a function's result) warns in development and falls through. An accessible name is never empty. Empty, whitespace-only or boolean children fall through to the message too.
- **A key resolved from `en` while the locale is not `en`** warns once in development.
- **Text keys are `TextMessage`** (`string | () => string`). A key with parameters is a function `(values, format)`. `useMessages` returns text as `string` and parameterised keys as `(values) => string`, with the locale's formatter bound.
- **Messages are plain strings, never JSX.** Changing a visible label is the adopter's job for WCAG 2.5.3.
- **No hard-coded visible or announced text,** including `aria-label`. Developer warnings are not user text (below).
- **List the component's message keys** in its `<name>.a11y.md`.

## Registries (`Register`)

An app declares types once, and every component picks them up.

```ts
declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
    icons: typeof icons
  }
}
```

- **Router links:** `<KvirnProvider linkComponent={NextLink}>` registers the router's link. `Link` always renders a native `<a href>` through it. `LinkProps` derives from the registered component, and falls back to `<a>` props without augmentation. The per-instance `render` prop overrides. The registered component must forward its ref and render an `<a>`, otherwise a development warning fires. KvirnUI adds `aria-current`, `rel` for new tabs and the new-tab notice. It has no router dependency.
- **Icons:** `defineIcons(entries)` returns its argument typed and frozen. `<KvirnProvider icons iconDefaults>` registers them. Nested providers merge `icons` by name and `iconDefaults` by field. `Register['icons']` adds names to `IconName`. The icon rules are in the `Icon` docs.
- **The next registry follows the same shape:** an interface in `provider/register.ts`, a conditional type that falls back to the plain default, a provider prop.

## Developer warnings

- **Use `warnOnce(key, message)`** from `dev/dev-warning.ts`. It logs `[KvirnUI] <message>` to `console.warn`, once per key, and never in production.
- **Detect production with the literal `process.env.NODE_ENV`,** so the consumer's bundler replaces it. Where `process` does not exist (Vitest browser mode), the ReferenceError counts as development.
- **Warnings are for the developer.** English, not in the catalogs, never shown to or announced for users.
- **A message says** what is wrong, why it matters (with the WCAG criterion), and what to do instead.
- **Key by what is wrong, plus the identifying text** when one page can hit it several times (`link-new-tab-without-notice:<link text>`).
- **Check in an effect after commit,** from the DOM or a registration count. Never during render.
- **A development warning never replaces a rule.** If the rule must hold, make it a type error or a throw (the OneTimeCode `pattern` throws a `RangeError`, also in production).
- Warnings that exist today are listed in [references/dev-warnings.md](references/dev-warnings.md).

## `'use client'`

Every export of `@kvirn-ui/react` is client code. The directive is a JS banner in the `pack` config of `packages/react/vite.config.ts`, and it sits at the top of `src/index.ts`, because bundling drops module-level directives. Component files start with `'use client'` too. `KvirnThemeScript` has no directive of its own: it is a plain function that renders a script tag, so a server layout can render it. A server-only export would need its own entry. Passing a component such as `NextLink` to `KvirnProvider` needs a client wrapper.

## Maintainer preferences

- Compound parts read as plain JSX, for example `<Field required><Label>…</Label></Field>`. The maintainer asked for this form.
- Pending: Plan 0028 / 0029 changes these rules once it lands.
