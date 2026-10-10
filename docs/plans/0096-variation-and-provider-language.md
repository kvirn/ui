# Plan 0096: One rule for variation, and language only from the provider

- **Status:** Approved
- **Owner:** lead
- **Created:** 2026-10-10 · **Target:** before `beta`
- **Related:** `docs/architecture.md` (Styling contract), `api-conventions`, `theme-css`, `forms`, Plan 0093 (`as`)

## Goal

A component varies only by a modifier class, and takes language and direction only from `KvirnProvider`. Presentation props that make a component decide its own gap, markers or layout go; the consumer adds a class instead.

## Non-goals

- New tokens or new theme styles. Modifier classes that already exist in `theme.css` stay as they are.
- Behaviour props (`placement`, `offset`, `padding` for positioning, `rows`, `virtualize`): they don't style anything.
- A change to state attributes (`data-state`, `data-orientation` as state).

## Background

`docs/architecture.md` already says variants are modifier classes the consumer adds and `data-*` is state only. The code drifted: 201 selector lines in `theme.css` use `.kv-<part>--<option>`, `data-*` is used for 9 (orientation, icon size). Several hooks still take presentation props and turn them into those same classes, so the prop is a second way to write a class. Language has the same drift: a handful of components and `core` helpers take `lang`, `dir` or `locale`.

## Design

### The rule (goes into AGENTS.md, architecture.md, api-conventions, theme-css)

1. **Look is a class.** A part varies by `kv-<part>--<option>`, added by the consumer or, for the three props below, by the component. The default option adds no class. A choice is never a `data-*` attribute and never an inline `style`.
2. **Three presentation props only: `variant`, `size`, `orientation`.** Each is a typed union and does one thing: picks that class. `orientation` also sets `aria-orientation` and `data-orientation` where it changes keys (tabs, toolbar, menu), as state.
3. **Everything else is a consumer class.** Gap, spacing, marker, layout, columns, width, colour, padding, alignment: no prop, no `style` prop. If the theme needs a choice, it ships `kv-<part>--<option>` and the docs list it.
4. **`data-*` is state**, set by the component, never a choice.
5. **Language and direction come from the provider.** No `lang`, `dir` or `locale` prop or option on a component, hook or `core` helper that renders or announces. Exceptions are forced `dir="ltr"` for inherently LTR values (codes, phones, masks) and DOM-derived direction in positioning code.

### Which option for variation: class

| Option                  | Verdict                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kv-<part>--<option>`   | **Chosen.** Already 201 selector lines, no JS, works in server components, tree-shakes nothing, rebrandable, a consumer can add their own next to it. |
| `data-variant=...`      | Rejected. Looks like state, so a consumer can't tell a choice from a condition. Zero uses today.                                                      |
| Inline `style` / tokens | Rejected. Bypasses the cascade layer and the theme's contrast checks.                                                                                 |

### Inventory: presentation props to remove

| Where                                                        | Prop                                     | Becomes                                                 |
| ------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------- |
| `stack/use-stack.ts:5`                                       | `gap`                                    | `kv-stack--gap-{2,4,8}` (default `6`)                   |
| `columns/use-columns.ts:8`                                   | `gap`, `minColumnWidth`                  | `kv-columns--gap-*`, `kv-columns--min-{sm,lg}`          |
| `list/list.tsx:16`                                           | `marker`, `gap`                          | `kv-list--bullet`, `kv-list--decimal`, `kv-list--gap-*` |
| `button-group/use-button-group.ts:15`                        | `layout`                                 | `kv-button-group--attached`                             |
| `sidebar-layout/use-sidebar-layout.ts:5`                     | `sidebarWidth`                           | `kv-sidebar-layout--sidebar-sm`                         |
| `icon/use-icon.ts:69-71`, `icon-registry.ts`, `IconDefaults` | `color`, `fill`, `stroke`, `strokeWidth` | CSS on the icon's class (`currentColor`)                |

Kept as props: `Heading.size`, `Container.size`, `Icon.size`, `Alert.variant`, `Badge.variant`, `Toast` variant, `Tabs`/`Toolbar` orientation.

### Inventory: language and direction

| Where                                                       | Today                   | Becomes                                                                                                              |
| ----------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `provider/kvirn-provider.tsx:58`                            | `dir` prop              | kept: the provider is the one place direction is set                                                                 |
| `date-input/use-date-input.ts:44`, `date-input.tsx:48`      | `order`                 | locale order only                                                                                                    |
| `read-aloud/use-read-aloud.ts:97`                           | `lang`                  | closest `[lang]`, then provider locale (already the fallback)                                                        |
| `patterns/page-frame/page-frame.tsx:15`                     | `locale`                | wrap in `KvirnProvider` at the call site; update 5 stories                                                           |
| `server/get-locale-props.ts:10`, `server/get-messages.ts:8` | `dir`, `locale` options | `getLocaleProps(locale)` derives `dir`; `getMessages(locale)` keeps its argument: there is no provider on the server |
| `core/table/locale-sort.ts:24`                              | `locale` argument       | React `Table` passes the provider's; the core function keeps its argument (core is pure)                             |
| `listbox/use-listbox.ts:88`                                 | `itemToLang`            | kept: WCAG 3.1.2 needs per-item language for mixed-language options                                                  |

`core` options named `locale` or `direction` stay: `core` has no provider, and React fills them from `useLocale()`.

## Tasks

- [x] Rule text in AGENTS.md (hard rule 14), `docs/architecture.md` Styling contract, `api-conventions`, `theme-css`
- [x] Per component in the inventory: failing test (prop gone, class from consumer renders the same), then code, `*.a11y.md`, `*.md`
- [x] Stories and docs examples: gap/marker/layout passed as `className`
- [x] `theme.css`: confirm each removed option has its modifier class; add only what is missing (maintainer approves a new class name)
- [ ] A repo check in `tooling/` that fails on a presentation prop name (`gap`, `marker`, `layout`, `columns`, `align`, `justify`, `width`, `padding`, `margin`, `color`, `lang`, `dir`) in a public Options or Props interface, with an allowlist
- [x] Changeset (breaking: `feat(react)!`), one per package
- [x] `accessibility-reviewer` on the diff

## Decisions

- Class, not data attribute, for choices: see the table above. A rule change; approved with this plan.
- `variant`, `size`, `orientation` remain props, as the maintainer listed them.
- Field and Fieldset `marker` stays: it is the visible "(optional)" text, content with an accessible-name effect, not style. Only list markers go.
- Icon loses `color`, `fill`, `stroke` and `strokeWidth`, and `IconDefaults.strokeWidth`. `size` stays. Colour is `currentColor` and CSS. Done: also omitted from `IconProps`'s SVG attributes; `IconComponentProps` and `IconPartProps` no longer list them. Callers colour a wrapper of their own (`style={{ color }}`).
- `KvirnProvider dir` stays as the one place direction is overridden. No component, hook or `core` helper that renders takes `dir` or `lang`.
- `Listbox.itemToLang` stays: it marks content in another language (WCAG 3.1.2), not the UI language.

- Language options removed (implementation): `DateInput.order`/`useDateInput({ order })`, `useReadAloud({ lang })` and `ReadAloud.Root lang`, `PageFrame.Root locale`, `getLocaleProps(locale, dir?)`. A different date order is written as `DateInput.Day`/`.Month`/`.Year` children. ReadAloud's `ignoreBoundaryLanguage` option in `collect-range-text.ts` is removed with it. `PageFrame.Root` no longer nests a `KvirnProvider` or sets `lang`: stories wrap it in `<KvirnProvider locale="en" messages={en}>` and the Storybook toolbar sets `lang`; the `sv`/`en` catalog behaviour moved to the wrapper.

- Layout props removed (implementation): `Stack gap`, `Columns minColumnWidth` and `gap`, `List marker` and `gap`, `ButtonGroup layout`, `SidebarLayout.Root sidebarWidth`, with `StackGap`, `ColumnsGap`, `ColumnsMinColumnWidth`, `ListMarker`, `ListGap`, `ButtonGroupLayout`, `SidebarLayoutSidebarWidth`, `UseStackOptions`, `UseColumnsOptions`, `UseSidebarLayoutOptions` and `ListOwnProps`. `useStack()`, `useColumns()` and `useSidebarLayout()` take no options; `useButtonGroup({ isNamed })` keeps only `isNamed`. `List.Root` always has `role="list"` and no longer warns for a decimal `ul`. Every class a removed prop used exists in `theme.css`.
- `Toolbar.Group` always adds `kv-button-group--attached` next to the consumer's class, so toolbars look as before (rich-text uses it). The `layout="spaced"` opt-out and the `SpacedGroups` story are gone; if a spaced toolbar group is wanted, `Toolbar.Group` should stop adding the class and callers add it.

## Risks & open questions

1. **List semantics.** `List` gives `role="list"` only when `marker` is not set (Safari/VoiceOver drops list semantics from `list-style: none`). Without the prop it needs `role="list"` always.
2. **Breaking.** Every call site in apps/docs, storybook and patterns changes. One PR per package, in order: react, patterns, apps.
3. **`DateInput.order`** and **`ReadAloud.lang`** have no caller outside docs tables; confirm nothing else relies on them when removing.
