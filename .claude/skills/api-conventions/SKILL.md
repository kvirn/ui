---
name: api-conventions
description: How a KvirnUI hook, part and compound component is built in code - the hook and part pair, the `as` prop, mergeProps, hooks that gate handlers, messages and useMessages, the Register registries (router links, icons), developer warnings and the 'use client' entry. Use when you add or change a component's API or implementation, or review one. The naming and prop rules themselves live in docs/architecture.md, API conventions.
when_to_use: new component, new part, as prop, mergeProps, disabled button onClick, useMessages, messages prop, new string, dev warning, warnOnce, Register, linkComponent, defineIcons, displayName, compound alias, use client, ref merging, review of a component's API
---

# API conventions (author side)

The user-visible rules are in `docs/architecture.md`, API conventions: naming, props, types, locality of behaviour, the shared part vocabulary, the styling contract and internationalisation. Read them first. This skill is what an author needs on top: how the pieces are wired, and which helpers to use.

Load it with `accessibility` (what the component must expose) and `testing` (how to test it).

## A component is a hook plus parts

- **The hook holds the behaviour.** `useX(options)` returns one prop object per part (`triggerProps`), `getXProps(argument)` where props depend on an argument, state (`isOpen`, `isDisabled`) and ids. It spreads onto the consumer's elements.
- **Each part component is the hook plus `renderPart`.** It calls the hook, then renders exactly one element.
- **Part props carry the part's class** (`className: 'kv-button'`) and `data-*` state. The class is typed as a literal, so a wrong spread fails the type check.
- **Variation is a class, language is the provider's** (AGENTS.md rule 14). The only presentation options are `variant`, `size` and `orientation`, each a union that only picks `kv-<part>--<option>` (the default adds none; `orientation` also sets `aria-orientation` and `data-orientation` where it changes keys). A gap, marker, layout or width is never an option: the consumer adds the class. No option named `lang`, `dir` or `locale` on anything that renders: read `useLocale()`.
- **Types:** export `UseXOptions`, `UseXResult`, `XPartProps` (the hook's prop object) and `XProps` (the component's). A part's element is chosen with `as` or not at all (see "Parts and `as`").
- **Components take `ref` as a normal prop** (`ComponentPropsWithRef<'button'>`, React 19). A part that needs its own ref merges it with the consumer's through `useMergedRef(consumerRef, ownRef)` (internal, in `merge-props/`). It is stable while the refs are, so React does not detach and re-attach it each render.
- **Subscribe to a core store with `useStoreSelector(store, selector)`** (internal, `useSyncExternalStore`). Consumers never call `setState`. Don't use `@tanstack/react-store`.
- **Internal hooks are not exported** from the public entry: `useStoreSelector`, `useMessages`, `useEnv`, `useLinkComponent`. The one exception is for Kvirn's own packages: `@kvirn-ui/react/internal` (`src/internal.ts`) exports `useMessages`, the Field's context and `useDescriptionPart`, `useFocusVisible` and a few helpers to `@kvirn-ui/rich-text` (Plan 0036). It is unstable, documented as for Kvirn packages only, and `internal.test.tsx` proves the public entry never re-exports any of it. Add to it only when a Kvirn package needs the piece.
- **A native input control shares `useFieldControl`** (`field/use-field-control.ts`, internal, Plan 0098): the Field's wiring, `data-disabled`, `data-focused`, `data-focus-visible` and the focus handlers, with `FieldControlOptions<TDetails>` (`disabled`, `onValueChange`) and `FieldControlState` (`isInvalid`, `isRequired`, `isDisabled`, `isFocused`, `isFocusVisible`) as the shared option and result types. `useTextInput`, `useTextarea`, `useNumberInput` and `usePhoneInput` extend them and add only their own part props. A new native input control calls it rather than restating the wiring. Each keeps its own hook and part (never a merged `useInput`). Masked controls also extend `MaskBehaviourOptions` (`announceRejections`, `messages`) and `MaskedInputPartProps` from `mask/use-mask.ts`.

## Parts and `as`

There is no `render` prop (Plan 0093). A part's element is a plain `as` prop, a string or a component, because an element prop made in a Server Component arrives as a `React.lazy` wrapper and the part silently renders its default element: a hydration mismatch.

- **`renderPart({ as, defaultElement, partProps })`** (internal, `render/render-part.ts`) is `createElement(as ?? defaultElement, partProps)` and nothing more.
- **Tag parts** (`Alert.Title`, `Section`, `Heading`): `as?: <union of allowed tags>`, typed with `AsTag<Tags, DefaultTag, OwnProps>` (`render/as-prop.ts`). It is a union per tag, so the element's own attributes type-check, and `ref` is `Ref<HTMLElement>`. The part keeps `const tags = [...] as const` and renders `renderPart({ as: resolveAsTag({ part: 'Alert.Title', as, allowedTags: tags }), defaultElement: 'h2', partProps })`. A tag outside the list warns once (`as-not-allowed:<part>:<tag>`) and renders the default. List the tags and why in the part's `*.a11y.md` under "Allowed elements": a list change is an accessibility trade-off.
- **Component parts** (`Link.Root`, `Tooltip.Trigger`, `Toolbar.Item`): `as?: ElementType`, typed `AsComponent<Component, OwnProps>` (`as?: Component` plus `OwnProps & Omit<ComponentPropsWithRef<Component>, keyof OwnProps>`), generic over the part: `function X<Component extends ElementType = 'button'>(props: AsComponent<Component, XOwnProps>)`. Props are plain JSX props forwarded to the target: `<Tooltip.Trigger as={Button} aria-label="Close">`. The part merges `mergeProps(consumerProps, hookProps)`: handlers chain, `className` joins, `ref` merges. The target must accept `ref` and spread the rest on its DOM node. Keep the tag and focusability dev warnings.
- **No `as`** is the default (Button, Toggle, Tabs, Menu items, form controls, `Alert.Close`): the part is one native element. For another element, call the hook and spread its prop object (`useButton()`, `useHeading()`).
- **Heading** takes `as: 'h1' | … | 'h6'` (required) instead of a level. `useHeading` keeps `level`.
- **Server Components:** `as="p"` works, and so does `as={ClientComponent}` (a client reference). `as={ServerComponent}` or an inline function throws at render. `next/link` is a plain server wrapper on the server, not a client reference, so `as={NextLink}` and `linkComponent={NextLink}` both need a client module. Never accept a function or an element prop for a part's markup.
- **A part that needs a specific element** (`<button>`, `<a>`, `<fieldset>`) checks `ref.current.tagName` in an effect after commit and warns when `as` produced something else. See the warnings reference.

`useFocus` is a hook with no markup of its own: it returns `scopeProps` (ref and `onKeyDown`) for the consumer's element, and `FocusScope` (flat, one element) is the same hook plus one element with `as` (Plans 0085, 0093).

## Naming: namespaces, single elements and aliases

An adopter can tell from a name alone how a component is built. Five rules:

1. **A component with two or more public parts is a namespace.** It is written `X.Root` + `X.Part` in docs, stories, fixtures and display names (`Card.Root`, `Field.Root`, `Link.Root`, `SidebarLayout.Root`). Docs never show a callable root (`<Field>`).
2. **A component that is one element is flat,** with no `.Root`: `Button`, `Toggle`, `ButtonGroup`, `Heading`, `Kbd`, `SkipLink`, `VisuallyHidden`, `Icon`, `TextInput`, `NumberInput`, `Checkbox`, `Switch`, `Prose`, `Section`, `Container`, `Stack` and `Columns`. A leftover `.Root` on one (`Prose.Root`, `Section.Root`) is a `@deprecated` alias.
3. **A component that is a structural part of another is aliased onto the parent.** Structural means the parent's contract registers it, names it or lays it out: a Field's label, help text and error, a group's legend, a Combobox's popup and options, a RadioGroup's radios. Controls placed inside a Field (TextInput, NumberInput, Checkbox, Listbox, Combobox, FileUpload, OneTimeCode) are content, not parts, and get no alias.
4. **Every exported component has a display name, and it is the name an adopter writes:** `Field.Prose`, not `Prose`; `Combobox.Option`, not `Listbox.Option`. An alias that is a different name for a shared component is a **thin typed wrapper** with its own `displayName`: a function component that renders the shared one with all its props, ref included, so context is read the same way. A generic part (`ListboxOption<TItem>`) is a generic wrapper (`<ListboxOption<TItem> {...props} />`) so `TItem` still flows through. "Show code" prints the display name.
5. **Every part also has a flat named export** (`FieldRoot`, `CardHeader`, `ComboboxOption`) from `index.ts`, and it is the same component as the namespace part. In a React Server Component, import the flat part exports instead, because a server component can't dot into a client module. Docs and stories show the namespace form. The flat part exports are not deprecated.

`packages/react/src/naming.test.tsx` enforces the display names, the flat exports and the deprecated allowlist over `index.ts`. `tooling/component-naming` fails when a story, MDX page or package guide opens a deprecated or flat form in JSX.

**Alias sets:**

| Namespace       | Parts                                                          |
| --------------- | -------------------------------------------------------------- |
| `Field`         | `Root`, `Label`, `Prose`, `HelpText`, `ErrorMessage`           |
| `Fieldset`      | `Root`, `Legend`, `Prose`, `HelpText`, `ErrorMessage`          |
| `CheckboxGroup` | `Root`, `Legend`, `Prose`, `HelpText`, `ErrorMessage`          |
| `RadioGroup`    | `Root`, `Radio`, `Legend`, `Prose`, `HelpText`, `ErrorMessage` |
| `InputGroup`    | `Root`, `Addon`, `Input`                                       |
| `DateInput`     | `Root`, `Day`, `Month`, `Year`                                 |
| `Link`          | `Root`, `NewTabNotice`, `Icon`                                 |
| `Toolbar`       | `Root`, `Button`, `Toggle`, `Item`, `Group`                    |

`Toolbar` is a namespace object (it has no callable root). Its `Button` and `Toggle` are Button and Toggle wrapped to join the toolbar, `Item` makes any focusable control one through `as`, and `Group` is a thin typed wrapper over `ButtonGroup` (Plan 0035). `Toggle` and `ButtonGroup` are single elements, so they are flat.

`Navigation` is a namespace of its own parts, not aliases and not callable: `Root` (`<nav>`, named by `label`), `List` and `Item` (Plan 0043). A nested `Navigation.List` inside an `Item` is the second level. `Link.Icon` is the decorative `aria-hidden` slot for the service link's icon; the service look itself is a class (`kv-link--service`), not a prop. Orientation is a class too, `kv-navigation--horizontal` on the root (Plan 0047), never a prop: links are plain Tab stops, so it changes no keys (Tabs and Toolbar take `orientation` because it changes theirs). A group you collapse is rendered with `hidden`, never unmounted. Exactly one link per navigation has `aria-current` (`page` when the page is listed, otherwise `true` on the deepest item shown), and `Root` warns once per name when two do (`navigation-multiple-current:<name>`).

`TableOfContents` is a namespace of its own parts, not aliases and not callable: `Root` (`<nav>`, named by `tableOfContents.label` or by `aria-labelledby`, never both), `List`, `Item` and `Link` (Plan 0049). `Root` takes the page's `items` (`TableOfContentsEntry`: `{ id, label, level }`) and draws the nested list from them, or calls a function child with `{ tree, activeId }`. Its `Link` is a plain `<a href="#id">` with `useFocusVisible` and never `Link.Root`, so a registered router link is never used. The core type is `TableOfContentsEntry` and not `TableOfContentsItem`, because the part `TableOfContents.Item` has that name (as `FileUploadEntry`). The current heading is found in the browser by `useTableOfContents` (an `IntersectionObserver` and one passive scroll wake-up, keyed by the ids, never the array), with the pure maths in core (`getTableOfContentsTree`, `getActiveHeading`).

`Tabs` is a namespace of its own parts, not aliases and not callable: `Root`, `List`, `Tab` and `Panel` (Plan 0048), a frozen object like `Navigation`. A `Tab` and a `Panel` are tied by their `value`, and `useTabs` takes one of `value` and `defaultValue` by its types. `Tab` is a `<button>` with `aria-disabled` (never native `disabled`), gated by the hook the way `useButton` gates a click, and a `Panel` is always rendered with `hidden`, so every `aria-controls` resolves. The roving tabindex is the Tabs' own registry (a ref `Map`, no state): `getRovingTarget` is the shared part, and Menu, the third user, reads its items from the DOM, so no registry is shared with `Toolbar`.

`Menu` is a namespace of its own parts, not aliases and not callable (Plan 0070): `Root` (no element), `Trigger`, `Popup`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `GroupLabel` and `Separator`, a frozen object like `Popover`, each also exported flat (`MenuItem`) with a display name such as `Menu.Item`. `Menu.RadioGroup` is not `RadioGroup`: the display name says so. `useMenu` is built on `usePopup`, `useDismissableLayer` and `useFocusReturn`, not on `usePopover`. Items are `<button role="menuitem*">` found in the DOM at key time, and a disabled one stays focusable with `aria-disabled`.

`Breadcrumb` (`Root`, `List`, `Item`, `Link`, `Current`) and `Pagination` (`Root`, `List`, `Item`, `Link`, `Previous`, `Next`, `Ellipsis`, `Status`) are namespaces of their own parts, not aliases and not callable (Plan 0062). Their `Root` is a `<nav>` named by `breadcrumb.label` or `pagination.label` (or `label`), and their link parts are thin typed wrappers over `Link.Root`, so a registered router link is used. The current breadcrumb is a `<span aria-current="page">` and not a link; the current page of a pagination stays a link with `aria-current="page"`. The render-state type is `PaginationPartState`, because `PaginationState` is TanStack Table's.

`Disclosure` and `Accordion` are namespaces of their own parts, not callable (Plan 0058). `Disclosure`: `Root` (no element), `Trigger` (`<button>` plus a decorative chevron `Icon`) and `Panel`. `Accordion`: `Root`, `Item` (a `div` around a `Disclosure.Root`, one state per item), `Heading` (`level` required, never defaulted) and `Trigger` and `Panel`, which are `Disclosure.Trigger` and `Disclosure.Panel` with the accordion's class added and their own display names. `hidden="until-found"` is opt-in (`hiddenUntilFound`): React renders `hidden` as a boolean attribute, so the hook writes the value in an effect and the server markup says plain `hidden`.

`Tooltip` is a namespace of its own parts, not aliases: `Root`, `Trigger`, `Popup`, `Name` and `Shortcut` (Plan 0037). Its `Trigger` makes any focusable control the anchor through `as` (`Toolbar.Toggle`, `Button`, `Toolbar.Item`), and joins its `aria-describedby` with yours.

`Prose` is the description and `HelpText` the help text (Plans 0029 and 0041, renamed from `Hint`): `Fieldset.HelpText`, `CheckboxGroup.HelpText` and `RadioGroup.HelpText` are thin typed wrappers over `Field.HelpText` with their own display names. `Combobox` and `Autocomplete` offer the Listbox popup parts (`Popup`, `List`, `Option`, `Group`, `GroupLabel`, `Empty`) under their own names, and Autocomplete also wraps Combobox's `Control`, `Input`, `Toggle` and `Clear`.

**Callables stay callable.** `Field`, `Fieldset` and `Link` are `Object.assign(Root, parts)`, so `<Field>` still works and is the same function as `Field.Root`. A JSDoc `@deprecated` can't target `<Field>` without also hitting `Field.Root`, and a plain object would break adopters. Docs, stories and the naming test treat the callable form as banned, and the callable root is named after its Root (`Field.Root`).

**Deprecated, not removed** (until 1.0, with a codemod note in the PR description): the bare `Label`, `ErrorMessage` and `Legend` exports, `Prose.Root` and `Section.Root` (type the assigned object so the `Root` property carries the `@deprecated`), and the core type `FileUploadItem` (now `FileUploadEntry`, because the React component `FileUploadItem` has the same name). Add a new alias in the same PR as its wrapper, its flat export, its docs and its row in `naming.test.tsx`.

- **Namespaces** are built with `Object.assign(Root, { … })` or a frozen object (`as const`).
- **`displayName` is set on every function component** (`FieldLabel.displayName = 'Field.Label'`).

## Patterns (`@kvirn-ui/patterns`)

A pattern wraps shipped components into a feature (Plan 0095, D9). It is a compound component, and the content is children, as literal JSX:

- **`X.Root` plus named parts** (`SiteHeader.Topbar`, `.Brand`, `.Search`, `.Menu`; `MainMenu.Topic`). A namespace like any other: a frozen object, a display name on every part, a flat export for each (`SiteHeaderBrand`).
- **Never `{ label, href }` objects or arrays in props:** no `items`, `topics`, `links`, `languages`, `brand`, `navigation`. A prop whose type is visible text or an array is wrong. The text is a child (`<SiteHeader.Brand href="/">Kvirnby kommun</SiteHeader.Brand>`), and a topic with sub-pages is the part `MainMenu.Topic`, not a flag.
- **A part is one native element or one library component,** takes `className` and the rest of the element's props (`mergeProps`), and `as` only where a link or a component is swapped (a router link).
- **Props are for behaviour and state:** `current`, `defaultOpen`, `action`, `name`, `messages`. DOM order is children order: no `position` or `order` prop.
- **The pattern owns what the adopter would get wrong:** open state, Escape, focus after close and close on a link click, held in context with a `data-*` attribute as the state hook.
- **A pattern holds no text** (Plan 0095, D10). Visible text is a child; a landmark or control name is a `label` (or `aria-label`) prop forwarded to the shipped part. The only strings from `@kvirn-ui/i18n` are those a shipped part already owns (alert close, copy and read-aloud feedback): a pattern adds no key.
- **Few tests.** A pattern composes tested components, so a test proves only behaviour the pattern adds. A `.a11y.md` row for composed behaviour names the shipped component's test.
- **The `fixtures` export is assets only** (images, marks). Stories write the composition as literal JSX.

## `mergeProps(...propObjects)`

Public. Merges left to right, for one element:

- Handlers (`on[A-Z]`): chained in argument order, with the same arguments.
- `className`: joined with a space. `style`: shallow-merged, later wins per property.
- `ref`: merged into one callback ref. Each React 19 cleanup runs, otherwise the ref is set to `null`.
- Any other prop: the later defined value wins. `undefined` never overrides.
- Two different `id`s: the later wins, and it warns in development (a label or `aria-describedby` now points at nothing).

Put the consumer's props first and the hook's last when the hook must win (`mergeProps(otherProps, button.buttonProps)`). Put the consumer's last when theirs should win (`mergeProps(mask.inputProps, ownProps)`).

## Hooks that gate a handler

Merging can't stop an activation. A part that must control a prop takes it as its own prop and routes it through its hook.

- **Button:** `useButton({ onClick })` never calls `onClick` while `disabled`, and its click handler calls `preventDefault()` then, which also blocks form submission and reset. Blocking is on `click`, which Enter and Space produce, so there is no key handling. `onClick` is the part's own prop, so a disabled part blocks it.
- **Unsupported:** merging your own `onClick` over `buttonProps`, and overriding `buttonProps.onClick`. In the function form, keep `buttonProps.onClick`.
- **`ButtonProps` omits `aria-disabled`.** It is set only by `disabled` with `focusableWhenDisabled`. `LinkProps` omits `aria-current`: use `current`.
- **Link:** `target` and `rel` go through `useLink` (it adds `noopener noreferrer` for `_blank` and keeps the consumer's own `rel` tokens, once each).
  - `current` is `'page' | 'step' | 'location' | 'date' | 'time' | boolean`. `true` gives `aria-current="true"`. `false` or absent gives none.
  - `useLink` returns `linkProps`, `isCurrent`, `isFocusVisible`, `opensInNewTab` and `newTabNotice` (from `useMessages('link', messages)`).
  - `Link.NewTabNotice` reads the Link's `messages` through context. A `_blank` link with no notice gets no type error and no dev warning (maintainer, 2026-10-05): the docs say a link that opens a new tab must say so. `LinkNewTabNotice` is also a named export.

## Messages

Rules for the catalog and locales are in `docs/architecture.md`, Internationalisation. The author side:

- **Every component with strings calls `useMessages(namespace, props.messages)`** (internal) and exposes `messages?: Partial<KvirnMessages['namespace']>`.
- **Resolution, first match wins:** children of a visible text part, the instance `messages`, the nearest provider and its ancestors, built-in `en`. A resolved layer is not pre-merged, so an empty one falls through.
- **An empty or whitespace override** (string, or a function's result) warns in development and falls through. An accessible name is never empty. Empty, whitespace-only or boolean children fall through to the message too.
- **A key resolved from `en` while the locale is not `en`** warns once in development.
- **Text keys are `TextMessage`** (`string | () => string`). A key with parameters is a function `(values, format)`. `useMessages` returns text as `string` and parameterised keys as `(values) => string`, with the locale's formatter bound.
- **A number, date or list outside a message comes from `useFormat()`** (public, Plan 0046): the same formatter, so a value reads the same everywhere. Never `new Intl.NumberFormat(locale)` with the locale read by hand in a component, a fixture or an example. `format.date` takes an instant (`Date` or milliseconds, in the provider's `timeZone`) or a calendar date (`'YYYY-MM-DD'`, shown in UTC and never moved). A server component can't call a hook: use `createMessageFormat({ locale, timeZone })` from `@kvirn-ui/core`.
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

- **Router links:** `<KvirnProvider linkComponent={NextLink}>` registers the router's link. `Link` always renders a native `<a href>` through it. `LinkProps` derives from the registered component, and falls back to `<a>` props without augmentation. A part's `as` overrides it per instance. The registered component must forward its ref and render an `<a>`, otherwise a development warning fires. KvirnUI adds `aria-current`, `rel` for new tabs and the new-tab notice. It has no router dependency.
- **Icons:** `defineIcons(entries)` returns its argument typed and frozen. `<KvirnProvider icons iconDefaults>` registers them. Nested providers merge `icons` by name and `iconDefaults` by field. `Register['icons']` adds names to `IconName`. The icon rules are in the `Icon` docs.
- **The next registry follows the same shape:** an interface in `provider/register.ts`, a conditional type that falls back to the plain default, a provider prop.

## Developer warnings

- **Use `warnOnce(key, message)`** from `dev/dev-warning.ts`. It logs `[KvirnUI] <message>` to `console.warn`, once per key, and never in production.
- **Detect production with the literal `process.env.NODE_ENV`,** so the consumer's bundler replaces it. Where `process` does not exist (Vitest browser mode), the ReferenceError counts as development.
- **Warnings are for the developer.** English, not in the catalogs, never shown to or announced for users.
- **A message says** what is wrong, why it matters (with the WCAG criterion), and what to do instead.
- **Key by what is wrong, plus the identifying text** when one page can hit it several times (`navigation-duplicate-name:<name>`).
- **Check in an effect after commit,** from the DOM or a registration count. Never during render. The exceptions read only props, so they also warn in server rendering: `as-not-allowed` (`resolveAsTag`) and the provider's prop checks (`date-without-time-zone`, a bad `weekStart`).
- **A development warning never replaces a rule.** If the rule must hold, make it a type error or a throw (the OneTimeCode `pattern` throws a `RangeError`, also in production).
- Warnings that exist today are listed in [references/dev-warnings.md](references/dev-warnings.md).

## `'use client'`

Every export of `@kvirn-ui/react` is client code. The directive is a JS banner in the `pack` config of `packages/react/vite.config.ts`, and it sits at the top of `src/index.ts`, because bundling drops module-level directives. Component files start with `'use client'` too. The server-safe exports live in `@kvirn-ui/react/server` (`src/server.ts`, `src/server/`): a server `KvirnThemeScript`, `getLocaleProps`, `getMessages` and `createMessageFormat`. It is a second `pack` config without the banner, and its graph is `@kvirn-ui/core`, `@kvirn-ui/i18n` and React types only: never import a file that carries `'use client'`. `tooling/react-server-entry` builds the package and proves neither it nor its chunks carry the directive. `KvirnThemeScript` is rendered by the server entry in a Server Component and by the client entry in a client component. Passing `messages`, `linkComponent` (`NextLink`), `icons`, `theme.storage` or `env` to `KvirnProvider` needs a client wrapper (`AppKvirnProvider`, see `kvirn-provider.md`).

## Maintainer preferences

- Compound parts read as namespaced JSX, for example `<Field.Root required><Field.Label>…</Field.Label></Field.Root>`. Flat names are for single elements (`<Button>`, `<Prose>`).
