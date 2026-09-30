# Architecture

## Packages

```
apps/docs          Next.js (App Router, MDX) → kvirn-ui.com
apps/storybook     Storybook (Vite builder)
packages/core      @kvirn-ui/core     state machines, focus/keyboard utilities
packages/react     @kvirn-ui/react    hooks + compound components
packages/i18n      @kvirn-ui/i18n     message catalogs
packages/theme     @kvirn-ui/theme    tokens, default theme, Tailwind preset
packages/blocks    @kvirn-ui/blocks   styled copy-in patterns (Tailwind Plus equivalent)
packages/testing   @kvirn-ui/testing  a11y test helpers (dev only)
tooling/           shared tsconfig + vite presets
```

Dependencies only point downward: `blocks → theme, react → core, i18n (types + the built-in `en` catalog)`. `core` depends only on `@tanstack/store`, which is wrapped in `core/src/store/`. `react` depends only on React, `core` and `i18n` (ADR-0003).

- **core:** one store (`createComponentStore`, which wraps `@tanstack/store`) with typed actions per component, plus utilities for roving tabindex, typeahead, focus trap and restore, dismiss, scroll lock, `inert`, the announcer and IDs. It reaches the DOM only through an injected `Env`, which keeps it SSR-safe and unit-testable (ADR-0003).
- **react:** binds to core stores via `useSyncExternalStore` (`useStoreSelector`). React 19 or later, RSC-aware (`"use client"` where needed), SSR and hydration safe. Composition works via the `render` prop (see API conventions).
- **blocks:** public-sector patterns such as the site header, footer, accessibility statement, feedback form, consent banner, form wizard and error summary. Distributed as a package and via a copy-in CLI.

## API conventions

### Naming

- **No abbreviations or single letters.** Write `disclosure`, `event`, `index`, `element`, `option`. Never `d`, `e`, `i`, `el`, `opt`, `ctx` or `btn`. This applies to library code, examples, tests and docs.
- **Name a hook's result after the component:** `const disclosure = useDisclosure()` and `const countrySelect = useSelect()`. When there are several, name them after their role, for example `const shippingAddressSelect = useSelect()`.
- **Name prop objects after the part they go on:** `triggerProps`, `panelProps`, `labelProps`, `inputProps`, `descriptionProps`, `errorMessageProps` and `listboxProps`. Never a generic `props` or `attributes`.
- **Items in a collection use a function named after the part:** `getOptionProps(option)` and `getTabProps(tab)`. Use this form only when the props depend on an argument.
- **State is read-only and descriptive:** `isOpen`, `isDisabled`, `highlightedOption`, `selectedOptions`.
- **Actions are verbs:** `open()`, `close()`, `toggle()`, `select(option)`, `clearSelection()`. Don't expose generic setters like `setOpen` or `setState`.

### Props

- **Mirror HTML where HTML has the concept:** `disabled`, `required`, `name`, `value`, `form`.
- **Controlled / uncontrolled pairs are named after the value:** `open` / `defaultOpen` / `onOpenChange`, `checked` / `defaultChecked` / `onCheckedChange`, `value` / `defaultValue` / `onValueChange`.
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
- **Composing your own handlers uses `mergeProps(ownProps, disclosure.triggerProps)`.** It chains event handlers, merges `className` and `style`, and merges refs. It also warns on conflicting `id`s.
- **Change the element with the `render` prop**, not `asChild`. `render={<a href="/help" />}` or `render={(partProps, state) => <MyButton {...partProps} />}`. This keeps the swap explicit and typed.

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

### Shared part vocabulary

The same names are used across all components:

| Part                                   | Meaning                                                             |
| -------------------------------------- | ------------------------------------------------------------------- |
| `Root`                                 | State owner, which renders a wrapper only if the semantics need one |
| `Trigger`                              | Element that opens, closes or toggles                               |
| `Panel`                                | Inline revealed content (Disclosure, Accordion, Tabs)               |
| `Popup`                                | Floating content (Popover, Menu, Select, Tooltip, Dialog)           |
| `Backdrop`, `Portal`, `Close`          | Overlay plumbing                                                    |
| `Label`, `Description`, `ErrorMessage` | Field text, wired automatically to the control                      |
| `Item`, `Option`, `Tab`                | Collection members                                                  |
| `Indicator`                            | Visual state marker, `aria-hidden`                                  |

Both forms are exported: `Disclosure.Trigger` and the named export `DisclosureTrigger`, which tree-shakes well and is friendly to RSC.

## Styling contract

Headless packages ship zero CSS. State is exposed only as attributes:

| Attribute                                                                 | Values                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `data-state`                                                              | `open`/`closed`, `checked`/`unchecked`/`indeterminate`, `active`/`inactive` |
| `data-disabled`, `data-invalid`, `data-focus-visible`, `data-highlighted` | present / absent                                                            |
| `data-orientation`                                                        | `horizontal` / `vertical`                                                   |
| `data-placement`                                                          | `top`, `bottom`, …                                                          |

**Tokens** (`@kvirn-ui/theme`) are CSS custom properties with the `--kv-` prefix in three tiers: primitive (`--kv-blue-600`), semantic (`--kv-color-accent`, `--kv-focus-ring-width`) and component (`--kv-dialog-radius`). A municipality rebrands by overriding the semantic tokens. `theme:check` enforces 4.5:1 contrast for text and 3:1 for UI and focus.

**Default theme** comes in light, dark and high-contrast variants. Under `forced-colors` it uses system colours (and never relies on background alone). Motion only runs under `prefers-reduced-motion: no-preference`. Focus rings are restyled, never removed. Targets are at least 24px, and 44px in touch-first blocks.

## Internationalisation

- Required locales: `sv`, `fi`, `nb`, `nn`, `se` (Northern Sámi, reviewed by a native speaker) and `en` (the fallback). Finland is bilingual and Norway uses both written standards, so all are first-class.
- No hard-coded visible or announced strings, and none that can't be replaced. Typed catalogs come through `<KvirnProvider messages>`, which is deep-merged over the parent provider and ultimately over built-in `en`. Any key can be overridden per instance with the component's `messages` prop, and visible text parts also take children (ADR-0007). Missing keys fail the type check and `i18n:check`.
- Formatting uses `Intl.*` only, with no ICU runtime. `dir` comes from context, and arrow keys flip in RTL. Calendars start the week on Monday and show ISO week numbers.
- Language links set `lang` / `hreflang` (3.1.2).

## Support

- Browsers: the last 2 versions of evergreen browsers, Safari 17 or later, and iOS and Android system browsers.
- Node 22 LTS or later for SSR. No polyfills are shipped.
