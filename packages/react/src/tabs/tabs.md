# Tabs

> **Draft** (Plan 0048). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [tabs.a11y.md](tabs.a11y.md), the design spec is [docs/design/tabs.md](../../../../docs/design/tabs.md), and the decisions are in Plan 0048.

Tabs show one panel of content at a time, with a list of tabs to switch between them. Use them for parallel views of one thing on one page: the details, the documents and the history of a case. For links to other pages, use [Navigation](../navigation/navigation.md) with `kv-navigation--horizontal`: a tab never navigates and never changes the URL. For content that everyone should read in one go, use headings and sections instead.

- Renders a `<div class="kv-tabs">` with a `<div role="tablist">`, a `<button role="tab">` for each tab and a `<div role="tabpanel">` for each panel. **Name the list** with `aria-label` or `aria-labelledby` when a page has more than one.
- **One of `value` and `defaultValue` is required**, and the types say so. There is no "first tab" fallback: the tabs register after the server render, and the server markup must already say which tab is selected. A value that no tab has leaves no Tab stop and no panel shown, so a dev warning fires.
- **One Tab stop.** The tab list is one Tab stop, at the selected tab. The arrow keys, Home and End move between the tabs and wrap, and flip in right-to-left text (Down and Up when `orientation="vertical"`). Tab then reaches the selected panel, which has `tabindex="0"`, from any tab, selected or not. Every key is in the Keyboard section.
- **Automatic or manual activation.** `activationMode="automatic"` (the default) selects the tab that gets focus, which is right when the panels show at once. `activationMode="manual"` only moves focus, and Enter or Space selects: use it when showing a panel is slow.
- **A disabled tab stays focusable** with `aria-disabled="true"`, so keyboard and screen reader users can find it. It is never selected, and a click, Enter or Space does nothing, so focus and selection can differ.
- **Every panel is rendered**, and the ones that aren't selected are `hidden`, so every `aria-controls` and `aria-labelledby` resolves. A heavy panel renders its children only while `isSelected` is true.
- **A panel has `tabindex="0"` by default**, so keyboard users can reach a panel of text and scroll it. A panel that starts with a focusable element passes `tabIndex={-1}`, and Tab goes straight to that element (an APG deviation, recorded in the contract).
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported it is styled: quiet tabs in the text colour, the selected one in weight 600 with a straight 4px `primary` bar at its edge, a hairline along the list, tabs 44px high (32px inside `kv-compact` from 64rem) and a focus ring on a tab and on the panel. The list wraps and never scrolls sideways. A vertical set is a row of the list and the panel, and stacks below 40rem.

## API

### Parts

| Part       | Renders                             | Props                                                                                                                                         |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Tabs.Root  | `<div class="kv-tabs">`             | `value` or `defaultValue` (one is required), `onValueChange`, `activationMode`, `orientation`, and every `<div>` prop                         |
| Tabs.List  | `<div role="tablist">`              | every `<div>` prop except `role` and `aria-orientation`. Name it with `aria-label` or `aria-labelledby`                                       |
| Tabs.Tab   | `<button type="button" role="tab">` | `value` (required), `disabled`, `onClick`, and every `<button>` prop except `id`, `type`, `role` and the ARIA state                           |
| Tabs.Panel | `<div role="tabpanel">`             | `value` (required), and every `<div>` prop except `id`, `role`, `aria-labelledby` and `hidden`. A `tabIndex` you pass wins over the default 0 |

Each part is also exported on its own (`TabsRoot`, `TabsList`, `TabsTab`, `TabsPanel`), and the hook is `useTabs`. Every part takes `ref`, `className` and any handler: they merge with its own, and a class joins `kv-tabs-*`.

### What each part sets

| Part       | Attributes and class                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tabs.Root  | `class="kv-tabs"`, `data-orientation` (`horizontal` or `vertical`)                                                                                                                         |
| Tabs.List  | `class="kv-tabs-list"`, `role="tablist"`, `aria-orientation="vertical"` only when vertical: horizontal is the default of the role                                                          |
| Tabs.Tab   | `class="kv-tabs-tab"`, `id`, `type="button"`, `role="tab"`, `tabindex`, `aria-selected`, `aria-controls`, and while it applies `aria-disabled="true"`, `data-selected` and `data-disabled` |
| Tabs.Panel | `class="kv-tabs-panel"`, `id`, `role="tabpanel"`, `tabindex="0"`, `aria-labelledby`, `hidden` while it isn't selected, and `data-selected` while it is                                     |

The theme styles `[aria-selected='true']`, `[aria-disabled='true']` and `[data-orientation='vertical']`. `data-selected` and `data-disabled` are the same state for your own CSS.

### Values, ids and the Tab stop

- A tab and its panel are tied by `value`. Their ids come from the root's own id (`useId()`) and the value, each character outside letters, digits and `-` escaped as `_<hex code point>_`, so any value is safe, including one with spaces, and the ids are right on the first server render. They are never an index.
- The one Tab stop (`tabindex="0"`) is the selected tab, or the tab that has focus while focus is in the list, so Tab from a tab that isn't selected leaves the list for the panel. The others are `-1`.

### `onValueChange`

`onValueChange(value, { reason, event })` reports a selection the user made. It never fires for a disabled tab or for the tab that is already selected. With `value` set (controlled) it only reports: you change `value` yourself, and a change you refuse leaves the selection where it was while focus still moves.

| `reason`         | When                                                                   | `event`       |
| ---------------- | ---------------------------------------------------------------------- | ------------- |
| `'press'`        | A click, or Enter or Space on a focused tab (manual activation)        | the click     |
| `'arrow-key'`    | An arrow key moved to the tab and selected it (automatic activation)   | the key press |
| `'home-end-key'` | Home or End moved to the first or last tab and selected it (automatic) | the key press |

### Strings

Tabs have no strings of their own and announce nothing. Every name is yours, from your translations: the list's, each tab's and, through it, each panel's.

### Your own element

The parts render fixed elements. To build your own, use `useTabs()` and spread `rootProps`, `listProps`, `getTabProps(value)` and `getPanelProps(value)` (see Hook below). Leave the `id`, `role` and `tabIndex` to the hook: they hold the tab-to-panel link and the single Tab stop.

### Development warnings

Keyed `tabs-*`, English, for the developer only: a `Tabs.List`, `Tab` or `Panel` outside a `Tabs.Root` (`tabs-<part>-outside-root`), a `value` or `defaultValue` that no tab has (`tabs-value-without-tab:<value>`) and a tab with no panel, or a panel with no tab (`tabs-unpaired:<value>`).

## Component

```tsx
import { Tabs } from '@kvirn-ui/react'

;<Tabs.Root defaultValue="uppgifter">
  <Tabs.List aria-label="Ärendet">
    <Tabs.Tab value="uppgifter">Uppgifter</Tabs.Tab>
    <Tabs.Tab value="handlingar">Handlingar</Tabs.Tab>
    <Tabs.Tab value="historik" disabled>
      Historik
    </Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="uppgifter">…</Tabs.Panel>
  <Tabs.Panel value="handlingar" tabIndex={-1}>
    <a href="/beslut">Läs beslutet</a>
  </Tabs.Panel>
  <Tabs.Panel value="historik">…</Tabs.Panel>
</Tabs.Root>
```

Controlled, with a reason for the change:

```tsx
const [tab, setTab] = useState('uppgifter')

;<Tabs.Root value={tab} onValueChange={(value, { reason }) => setTab(value)}>
  …
</Tabs.Root>
```

Pitfalls: give every tab a panel and every panel a tab, with the same `value`: the dev warnings say which one is missing. Don't unmount the panels that aren't selected, because the tab's `aria-controls` would point at nothing: render lazy children through `isSelected`. Keep the labels short, since a long one wraps inside its tab. Don't put a close button or a menu inside a tab, and don't use tabs to navigate: a nested interactive control breaks the tab's name and role, and a link to another page is `Navigation`. Use `activationMode="manual"` only when showing a panel is slow. Pass `tabIndex={-1}` to a panel that starts with a focusable element, so Tab goes straight to it. A page with two sets of tabs names each list differently.

## Hook

```tsx
import { useTabs } from '@kvirn-ui/react'

function CaseTabs() {
  const tabs = useTabs({ defaultValue: 'uppgifter', activationMode: 'automatic' })
  return (
    <div {...tabs.rootProps}>
      <div {...tabs.listProps} aria-label="Ärendet">
        <button {...tabs.getTabProps('uppgifter')}>Uppgifter</button>
        <button {...tabs.getTabProps('historik', { disabled: true })}>Historik</button>
      </div>
      <div {...tabs.getPanelProps('uppgifter')}>…</div>
      <div {...tabs.getPanelProps('historik')}>…</div>
    </div>
  )
}
```

`useTabs({ value, defaultValue, onValueChange, activationMode, orientation })` returns `value`, `rootProps`, `listProps`, `getTabProps(value, { disabled, onClick })`, `getPanelProps(value)`, `orientation` and `activationMode`. One of `value` and `defaultValue` is required. Spread each prop object on its own element, and merge your own props with `mergeProps(yourProps, tabs.getTabProps(value))`. `listProps` holds the key handler, `getTabProps` the tab's ref (it registers the element, and is the same function for the same value, so React doesn't re-register it each render) and `getPanelProps` the panel's. Pass `onClick` through `getTabProps`, so a disabled tab never calls it. A panel's default `tabindex="0"` is overridden by a `tabIndex` after the spread.
