# Architecture

## Packages

```
apps/docs          Next.js (App Router, MDX) → kvirn-ui.com
apps/storybook     Storybook (Vite builder): every story and e2e spec (src/components/<name>/)
packages/core      @kvirn-ui/core     state machines, focus/keyboard utilities
packages/react     @kvirn-ui/react    hooks + compound components
packages/i18n      @kvirn-ui/i18n     message catalogs
packages/theme     @kvirn-ui/theme    theme.css: role scales, semantic tokens, component styles
packages/testing   @kvirn-ui/testing  a11y test helpers (dev only)
tooling/           repo checks (commit messages, keyboard docs, Foundation docs, raw colours), shared tsconfig + vite presets
```

Dependencies only point downward: `react → core, i18n (types + the built-in `en` catalog)`. Blocks (M4, see the roadmap) will be a package above `theme` and `react`. `core` depends only on `@tanstack/store`, `@tanstack/virtual-core` and `@tanstack/table-core`, each wrapped in one directory: `core/src/store/`, `core/src/virtual/` and `core/src/table/`. A lint rule enforces this, subpaths included. `react` depends only on React (a peer), `core` and `i18n`. Other locales are imported explicitly from `@kvirn-ui/i18n` and passed as `messages`. Only `@kvirn-ui/react` ships as an adapter: the core stays agnostic, but other frameworks are a non-goal.

- **core:** state, transitions and interaction logic, with no React and no `window`, `document`, `navigator`, storage or `matchMedia` outside `core/src/env/`. One store (`createComponentStore`, which wraps `@tanstack/store`) with typed actions per component (`open()`, `select(option)`), and consumers never call `setState`. Utilities for roving tabindex, typeahead, focus trap and restore, dismiss, scroll lock, `inert`, the announcer and IDs. It reaches the DOM only through an injected `Env`, which keeps it SSR-safe and unit-testable. `@tanstack/store` is imported only in `core/src/store/`, and pinned exactly in the pnpm catalog, so an upgrade is deliberate and goes through the full gates.
- **react:** binds to core stores with `useSyncExternalStore`, through the internal `useStoreSelector(store, selector)` (there is no `@tanstack/react-store`). React 19 or later, SSR and hydration safe. Every export is client code: the whole `@kvirn-ui/react` entry is marked `'use client'`, by a banner in the pack config and at the top of `src/index.ts`, because bundling drops directives. `KvirnThemeScript` is a client component that server layouts can still render. A future server-only export needs a separate entry. Composition works via the `render` prop (see API conventions).
- **Table and virtualization:** `@tanstack/table-core` and `@tanstack/virtual-core` are runtime dependencies of `@kvirn-ui/core`, pinned exactly (`@kvirn-ui/react` adds none), and you only pay for them when you render a Table or turn on `virtualize`. `virtual-core` is imported only in `core/src/virtual/` and `table-core` only in `core/src/table/`; everything else uses core's wrappers (`createListVirtualizer`, `createTable`, `createLocaleSortFn`). `@kvirn-ui/core` and `@kvirn-ui/react` re-export the tested table features (sorting, selection, expansion, pagination, filtering, global filtering, column visibility, row models, `createColumnHelper`, `tableFeatures`, types), and what is not re-exported is not supported. A TanStack Table major release therefore forces a KvirnUI major, and consumers cannot pass their own instance.
- **blocks (planned, M4):** public-sector patterns such as the site header, footer, accessibility statement, feedback form, consent banner, form wizard and error summary (built on `Notification.Danger`). They are not built yet. Planned as a package and via a copy-in CLI.

## API conventions

### Naming

- **No abbreviations or single letters.** Write `disclosure`, `event`, `index`, `element`, `option`. Never `d`, `e`, `i`, `el`, `opt`, `ctx` or `btn`. This applies to library code, examples, tests and docs.
- **Name a hook's result after the component:** `const disclosure = useDisclosure()` and `const countrySelect = useSelect()`. When there are several, name them after their role, for example `const shippingAddressSelect = useSelect()`.
- **Name prop objects after the part they go on:** `triggerProps`, `panelProps`, `labelProps`, `inputProps`, `descriptionProps`, `errorMessageProps` and `listboxProps`. Never a generic `props` or `attributes`.
- **Items in a collection use a function named after the part:** `getOptionProps(option)` and `getTabProps(tab)`. Use this form only when the props depend on an argument.
- **State is read-only and descriptive:** `isOpen`, `isDisabled`, `highlightedOption`, `selectedOptions`.
- **Actions are verbs:** `open()`, `close()`, `toggle()`, `select(option)`, `clearSelection()`. Don't expose generic setters like `setOpen` or `setState`.
- **Namespace compound parts, flat single elements.** A component with parts is written `Field.Root` + `Field.Label`, a single element is written flat (`Button`, `Prose`), and a part of another component is aliased onto its parent (`Field.Prose`, `Combobox.Option`). In a React Server Component, import the flat part exports (`FieldRoot`, `FieldLabel`, …) instead, because a server component can't dot into a client module. Docs and stories show the namespace form. The rules, the alias sets and the deprecated names are in the `api-conventions` skill.

### Props

- **Mirror HTML where HTML has the concept:** `disabled`, `required`, `name`, `value`, `form`.
- **Controlled / uncontrolled pairs are named after the value:** `open` / `defaultOpen` / `onOpenChange`, `checked` / `defaultChecked` / `onCheckedChange`, `value` / `defaultValue` / `onValueChange`.
- **Form controls hold no form state.** Values, checked state and validity belong to the implementor's form logic: TanStack Form, React Hook Form, or a plain `<form>` and `FormData`. A control reports changes up (`onValueChange`, `onCheckedChange`, native events) and renders what it's given (`value`, `checked`, `invalid`). Without those props, the native element keeps its own value, uncontrolled, and the component adds no React state. Native props, events, `name` and `ref` always pass through to the native element, so a form library's spreads and `register()` refs work. There's no built-in validation, touched or dirty tracking.
- **Change callbacks receive `(nextValue, details)`.** `details.reason` is a typed union, for example `'trigger-press' | 'escape-key' | 'outside-press'`.
- **No ambiguous props.** A prop like `open` is not overloaded to mean different things in different components. A prop like `variant` or `type` isn't used without a typed union. There are no boolean pairs that contradict each other.

### Types

- **Hooks:** `UseDisclosureOptions` and `UseDisclosureResult`.
- **Parts:** `DisclosureRootProps`, `DisclosureTriggerProps` and `DisclosurePanelProps`.
- **Unions:** `DisclosureChangeReason`.
- All of these are exported and documented. There's no `any`, and generics are inferred from data (`items`, `value`).

### Locality of behaviour

Behaviour is visible where the element is rendered. You can see what a button does by looking at the JSX that renders it.

- **The hook spreads prop objects directly onto your elements.** There's no hidden DOM querying, no wiring by global ID or selector, and no module side effects.
- **Each part renders exactly one element.**
- **Composing your own handlers uses `mergeProps(ownProps, disclosure.triggerProps)`** (public API). Handlers (`on[A-Z]`) chain in argument order with the same arguments. `className` joins with a space. `style` shallow-merges, the later one winning. Refs merge into one callback ref. Any other prop: the later defined value wins, and `undefined` never overrides. Two different `id`s warn in development, and the later one wins.
- **Merging cannot block activation.** A handler that a disabled part must block goes to the hook as an option instead, for example `useButton({ onClick })`, which doesn't call it while the button is disabled. Merging your own `onClick` over `buttonProps`, or overriding `buttonProps.onClick`, is unsupported. A part that must control a prop (a Button's `onClick`, a Link's `target` and `rel`) takes it off a `render` element first and routes it through its hook.
- **Change the element with the `render` prop**, not `asChild`. `render={<a href="/help" />}` or `render={(partProps, state) => <MyButton {...partProps} />}`. An element keeps its own plain props and gets the part's props merged in (`mergeProps(partProps, element.props)`: the element's plain props win and handlers chain). The function form leaves the spreading to you. This keeps the swap explicit and typed.

```tsx
// Hook: full control, behaviour at the call site
function FaqItem({ question, answer }: FaqItemProps) {
  const disclosure = useDisclosure({ defaultOpen: false })

  return (
    <div className="faq-item">
      <button {...disclosure.triggerProps} className="faq-trigger">
        {question}
      </button>
      <div {...disclosure.panelProps} className="faq-panel">
        {answer}
      </div>
    </div>
  )
}

// Compound components: the same behaviour with less wiring, built on the hook
;<Disclosure.Root defaultOpen={false} onOpenChange={(isOpen, details) => logReason(details.reason)}>
  <Disclosure.Trigger className="faq-trigger">{question}</Disclosure.Trigger>
  <Disclosure.Panel className="faq-panel">{answer}</Disclosure.Panel>
</Disclosure.Root>
```

### Registered types

An app registers its router's link component and its icons once, and Link props and icon names are typed from them everywhere:

```ts
declare module '@kvirn-ui/react' {
  interface Register {
    linkComponent: typeof NextLink
    icons: typeof icons
  }
}
```

Without the augmentation, `LinkProps` falls back to `<a>` props and `IconName` is the built-in set. A registered link component must forward its ref and render an `<a>` (a dev warning fires otherwise), and a Link always renders a native `<a href>`.

### Shared part vocabulary

The same names are used across all components:

| Part                                   | Meaning                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Root`                                 | State owner, which renders a wrapper only if the semantics need one                              |
| `Trigger`                              | Element that opens, closes or toggles                                                            |
| `Panel`                                | Inline revealed content (Disclosure, Accordion, Tabs)                                            |
| `Popup`                                | Floating content (Popover, Menu, Select, Tooltip, Dialog)                                        |
| `Backdrop`, `Portal`, `Close`          | Overlay plumbing                                                                                 |
| `Label`, `ErrorMessage`                | Field text (`Field.Label`), wired automatically to the control. The description is `Field.Prose` |
| `Item`, `Option`, `Tab`                | Collection members                                                                               |
| `Indicator`                            | Visual state marker, `aria-hidden`                                                               |
| `Info`, `Success`, `Warning`, `Danger` | A ready-made Root for one status: its class, its icon and its status word (Notification)         |

Both forms are exported: `Disclosure.Trigger` and the named export `DisclosureTrigger`, which tree-shakes well and is friendly to RSC.

## Styling contract

Headless packages ship zero CSS. Classes style, and `data-*` attributes are state.

**Parts are classes.** Every part renders its own stable class, `kv-<part>`: `kv-button`, `kv-link`, `kv-link-new-tab-notice`, `kv-card`, `kv-card-header`, `kv-card-body`, `kv-card-footer`, … Hooks put it in their part props as `className` (`buttonProps.className: 'kv-button'`). A consumer's `className`, on the component or on a `render` element, joins it through `mergeProps` and never replaces it, so the theme keeps styling the part. In the `render` function form, keep `className` when you spread the part props. Naming: `kv-<name>` is a context the consumer sets on a container, `kv-<part>` is a part, and `kv-<part>--<option>` is a consumer choice. Variants never change the element.

**Variants and options are modifier classes** the consumer adds, never props of the headless component: `kv-<part>--<option>`, for example `<Button className="kv-button--primary">` or `<Section className="kv-section--canvas">`. Context the consumer sets on a container is a class too: `kv-compact`, `kv-nav`, `kv-button-group`, `kv-prose`.

**State is `data-*`,** set by the components and never by the consumer:

| Attribute                                                                    | Values                                                                                                                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-state`                                                                 | `open`/`closed`, `checked`/`unchecked`/`indeterminate`, `active`/`inactive`                                                                |
| `data-disabled`, `data-invalid`, `data-focus-visible`, `data-highlighted`    | present / absent                                                                                                                           |
| `data-current`                                                               | present / absent                                                                                                                           |
| `data-filled`, `data-active`, `data-selected`, `data-complete`, `data-ready` | present / absent (OneTimeCode: a box holds a character, has the caret, is inside the selection; every box is filled; the hook has started) |
| `data-character-count`, `data-separator-count`                               | a number (OneTimeCode root: the character symbols and the `-` of its pattern, always rendered, for the theme's row width and its fallback) |
| `data-caret`                                                                 | `before` / `after` (OneTimeCode: on the active box, which side of its character the caret is)                                              |
| `data-orientation`                                                           | `horizontal` / `vertical`                                                                                                                  |
| `data-placement`                                                             | `top`, `bottom`, …                                                                                                                         |

The theme state on `<html>`, `data-kv-color-scheme` and `data-kv-contrast`, is state too: `KvirnProvider` and `KvirnThemeScript` set it.

The part classes, the modifier classes and the state attributes are part of the public API (semver, changesets). The default theme selects on them, so importing `@kvirn-ui/theme/theme.css` styles every component and removing the import unstyles them again. `KvirnProvider` never loads CSS, and the docs site and Storybook import `theme.css` the way an adopter does.

**Tokens** (`@kvirn-ui/theme/theme.css`, hand-written, the source of truth) are CSS custom properties with the `--kv-` prefix in two tiers: a palette of role scales named by role, never by hue (`--kv-primary-500`, `--kv-neutral-50`; also `secondary`, `accent`, `danger`, `success`, `warning`), and semantic tokens that point at the steps per theme (`--kv-color-primary`, `--kv-focus-ring-width`). A municipality rebrands by overriding one scale on `:root` (the eleven `--kv-primary-*` steps), and all four themes follow; or by pointing a single semantic token at another step. Scales can only be overridden on `:root`: a wrapper override doesn't reach the semantic tokens declared there. `theme:check` reads `theme.css`, resolves `var()` per theme (including the OS fallbacks) and enforces 4.5:1 contrast for text and 3:1 for UI and focus on the pairs in `packages/theme/src/contrast-requirements.ts`. `checkThemeCss()` runs the same check on an adopter's copy. The palette block is the only place for raw colours, and a lint test (`tooling/raw-colours`) fails on a raw colour anywhere else in the theme or in app CSS.

**Default theme** is one hand-written file, `packages/theme/theme.css`: no generator, no `tokens.css`. Everything is inside `@layer kv`, so unlayered consumer CSS or a later layer wins. Four themes (light, dark and a high-contrast variant of each) are selected by `data-kv-color-scheme` and `data-kv-contrast` on `<html>`, with `prefers-color-scheme` and `prefers-contrast` fallbacks when the attributes are absent, and a `color-scheme` per theme. The themes remap only semantic tokens, and non-colour tokens are identical in every theme. The OS-fallback blocks repeat their theme, and a test keeps them equal. Under `forced-colors` it uses system colours for every semantic token (and never relies on background alone); `forced-colors: active` always wins over a preference. It sets `forced-color-adjust: none` only where a part names `Highlight` colours itself. Motion only runs under `prefers-reduced-motion: no-preference`. Focus rings are restyled, never removed. Targets are at least 24px, and 44px in touch-first blocks.

## Internationalisation

- Required locales: `sv`, `fi`, `nb`, `nn`, `se` (Northern Sámi, reviewed by a native speaker) and `en` (the fallback). Finland is bilingual and Norway uses both written standards, so all are first-class.
- No hard-coded visible or announced strings, and none that can't be replaced. Typed catalogs come through `<KvirnProvider messages>`, which is deep-merged over the parent provider and ultimately over built-in `en`. Any key can be overridden per instance with the component's `messages` prop, and visible text parts also take children. Missing keys fail the type check and `i18n:check`.
- **Catalogs** are typed objects namespaced per component (`namespace.key`, depth fixed). A key without parameters is a string, or a `TextMessage` (a string or a `() => string`, called during render; shipped catalogs use strings, and `i18n:check` requires non-empty ones). A key with parameters is a function `(values, format)`, where `format` has `plural`, `number`, `date` and `list`, built on `Intl`. `plural` uses `forms.zero` for exactly 0 if given, otherwise the `Intl.PluralRules` category, falling back to `other`. `i18n:check` also compares the parameter counts of function keys across locales.
- **Resolution, first match wins:** the children of a visible text part, then the component's or hook's `messages` prop, then the nearest provider and its ancestors (deep-merged), then built-in `en` (with a dev warning if the locale isn't `en`). `en` is always present, so no component renders an empty name without a provider. `defineMessages(base, overrides)` builds adjusted catalogs, and external i18n plugs in through function values.
- **Messages are plain strings, never JSX.** A new locale is a full `KvirnMessages` (`satisfies`), and partial locales are discouraged. An empty or whitespace override warns in development and falls through, so there is never an empty accessible name. Changing a label is the adopter's job for 2.5.3 (label in name). Each `<name>.a11y.md` lists its message keys.
- Formatting uses `Intl.*` only, with no ICU runtime. `dir` comes from context, and arrow keys flip in RTL. Calendars start the week on Monday and show ISO 8601 week numbers. It's fixed, not a setting: it's the convention in every country we serve.
- Language links set `lang` / `hreflang` (3.1.2).

## Support

- Browsers: the last 2 versions of evergreen browsers, Safari 17 or later, and iOS and Android system browsers.
- Node 22 LTS or later for SSR. No polyfills are shipped.
