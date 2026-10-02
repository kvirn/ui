# Panel

> **Draft** (Plan 0018). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [panel.a11y.md](panel.a11y.md), and the design spec is [docs/design/panel.md](../../../../docs/design/panel.md).

A plain container for a region of the page, such as a sidebar or a band of content. It renders a `<div>`. To make it a landmark, render it as a `<section>`, `<aside>` or `<nav>` with a name.

- One part: `Panel` (also `Panel.Root` and `PanelRoot`), one `<div class="kv-panel">`. No Header, Body or Footer, no title and no behaviour.
- No role, no ARIA, no text and no strings. Children are whatever you pass, with their own semantics and focus order.
- `render` changes the element: `<aside aria-labelledby>`, `<section aria-labelledby>`, `<nav aria-labelledby>` or `<li>`.
- Headless: no CSS. The part renders its stable class `kv-panel`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, it's styled, and you choose with modifier classes: `kv-panel--canvas` and `kv-panel--padding-sm`.
- Panel is elevation level 1 (a region of the page). A [Card](../card/card.md) is level 2 (an object on the page). This `Panel` is not the `Panel` part of `Disclosure` or `Tabs`, which belongs to those components.

## Component

```tsx
import { Link, Panel } from '@kvirn-ui/react'

// A sidebar: a named complementary landmark.
<Panel render={<aside aria-labelledby="kontakt" />} className="kv-panel--padding-lg kv-prose">
  <h2 id="kontakt">Kontakta oss</h2>
  <p>Vi svarar vardagar 9–16.</p>
  <p><Link href="/kontakt">Mejla kundcenter</Link></p>
</Panel>

// A band of related content: no landmark, a visual region only.
<Panel>
  <h2>Nyheter</h2>
  …
</Panel>

// A region that looks like the page again, inside a surface frame.
<Panel className="kv-panel--canvas">…</Panel>
```

Your part:

- **A heading** at the top, at the level your page outline needs. Panel can't know it.
- **A landmark is your choice, and it must be named.** The default `<div>` is not one. A `<section>` without `aria-labelledby` or `aria-label` is `generic`, not a region. Keep landmarks few.
- **DOM order is reading and focus order.** A sidebar beside the main content comes after it in the DOM. Never reorder with `order` or grid placement against the DOM.
- **Don't render an empty Panel.** It still has padding and a surface.
- **No `overflow` on the Panel.** A sidebar that scrolls on its own goes in a named `kv-scroll-region` with `tabindex="0"`.

### Classes for the default theme

Without a modifier class, a panel is `surface`, square, with `md` padding and no visible edge.

| Class                                         | On   | Sets                                            |
| --------------------------------------------- | ---- | ----------------------------------------------- |
| `kv-panel--surface`, `kv-panel--canvas`       | Root | the background: `surface` (default) or `canvas` |
| `kv-panel--padding-none`, `-sm`, `-md`, `-lg` | Root | the padding: `md` is the default                |

`md` padding is 24px, and 16px below `40rem` and in compact density (`kv-compact`). `none` is for a frame whose children pad themselves, and for full-bleed media: a focusable child flush to the viewport edge would have its focus ring cut off by the screen. The panel never centres its content or limits its width: put a reading column inside it (`max-inline-size: 45rem`, or `kv-prose`).

- **The edge.** A panel has a 1px `transparent` border, which is `CanvasText` in forced colours. It draws no hairline, so a region doesn't look like an object. To mark the one edge that meets the content, colour it yourself: `border-inline-end-color: var(--kv-color-border-subtle)`.
- **Prose.** A panel is not a prose boundary. `kv-prose` on a panel makes its content prose, which is fine for a sidebar, and the panel keeps its full width (its `max-inline-size: 100%` wins over prose's `70ch`). For a 70ch reading column in a full-width band, put `kv-prose` on an element inside. A panel inside prose gets prose's block margins and its content stays prose.
- **A Card on a Panel** keeps its default look.

### Panel, Card or a surface token: when to use which

| You're building                                                                                                   | Use                                                                                                    | Why                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| A region of the page next to or between other content: a sidebar, a filter panel, a band of related content       | `Panel`. It's `surface`, square, with no visible edge                                                  | It's part of the page's layout, not a thing on the page (elevation level 1)                              |
| A region that should look like the page again inside a `surface` region: the work area next to a staff sidebar    | `Panel` with `kv-panel--canvas`                                                                        | It goes back to the page colour without drawing a box (level 0)                                          |
| One self-contained thing people read, compare or act on as a unit: a service, a news item, a case, a contact card | `Card`. It's `surface-raised`, with a hairline edge and rounded corners                                | The edge and the corners say "these belong together" (level 2)                                           |
| Several of those things                                                                                           | Cards in a list (`<ul>`, each card `render={<li />}`), on the page or on a Panel                       | One thing per card. A Panel around them is optional                                                      |
| A background inside your own component: a table header row, a code block, a read-only field                       | The token in your CSS, `var(--kv-color-surface)`, with the `text` tokens on it                         | It isn't a region or a thing, so it isn't a container. The `text` tokens keep `theme:check`'s pairs true |
| One thing with several independent actions: a user with Edit and Delete, a settings block                         | `Panel`. A Card has one primary destination, and here the controls are the reason the container exists | If you can't name one destination, it isn't a card                                                       |
| A form section or a group of fields                                                                               | Neither. A heading or a `<fieldset>` with a legend, on the page or in a Panel                          | A card would make "Account" look like an entity and add a level of hierarchy                             |
| A status message: an error, a warning, a confirmation                                                             | Neither. A notification, with a `-subtle` background, a bar, an icon and a heading                     | Status is never shown by a surface colour alone (1.4.1)                                                  |

Rules that go with it: a Card on a Panel keeps its default look. Don't put a Panel inside a Card (a region inside a thing turns the ladder upside down). Nest Panels only to switch between `surface` and `canvas`.

**When unsure, use the simpler container.** A Card is for one identifiable thing, not a box with a border, a background or padding. Before using Card, ask in order:

1. Can you name the thing it represents (a product, a person, an article, a case, a search result)? If not, use a Panel or plain HTML.
2. Does the content represent exactly one thing? If not, use a Panel.
3. Is there one primary destination or action? If the controls are the reason the container exists, use a Panel.
4. Is it a form section, a field group, a toolbar, a button group or a layout wrapper? Never a Card.
5. Don't nest Cards unless the inner one is a thing in its own right. Don't use Cards to create visual hierarchy.

These are guidance in the docs. They don't change what Card does: a clickable whole card, and a choice of border, shadow or flat, stay out of scope (ADR-0020, DESIGN.md: a card is never interactive and has no shadow).

### `render`

```tsx
<Panel render={<aside aria-labelledby="kontakt" />}>…</Panel>
<Panel render={(panelProps) => <li {...panelProps} className={[panelProps.className, 'nyhet'].join(' ')} />}>…</Panel>
```

An element keeps its own props, and the part's are merged in: class names join, styles merge and refs merge (ADR-0015). A `className` prop and a `render` element's own `className` join `kv-panel` instead of replacing it, so the theme keeps styling the panel. The function form gets the props, with a callback ref that fits any element, and an empty state object. Spread them, and keep `className`: it holds the part's class and your own.

## Hook

```tsx
import { usePanel } from '@kvirn-ui/react'

function CaseNavigation() {
  const panel = usePanel()
  return (
    <nav {...panel.rootProps} aria-label="Ärenden">
      …
    </nav>
  )
}
```

`usePanel()` returns `rootProps`, which holds only `className: 'kv-panel'`. Add a modifier class with `mergeProps`, which joins class names: `mergeProps(panel.rootProps, { className: 'kv-panel--canvas' })`.
