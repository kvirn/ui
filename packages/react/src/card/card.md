# Card

> **Draft** (Plan 0007). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [card.a11y.md](card.a11y.md), and the design spec is [docs/design/card.md](../../../../docs/design/card.md).

A plain container for one thing on the page: an image, a heading, some text and a couple of actions, for a service, a news item or a case (ADR-0020). Card is elevation level 2, and it is always `surface-raised`. A region of the page, such as a sidebar, is a [Section](../section/section.md) (ADR-0044).

- Four parts, each one `<div>`: `Card.Root`, `Card.Header`, `Card.Body` and `Card.Footer` (also exported as `CardRoot`, `CardHeader`, `CardBody` and `CardFooter`). Header and Footer are never `<header>` or `<footer>`, which would become page landmarks.
- No role, no ARIA, no text and no behaviour. Children are whatever you pass, with their own semantics and focus order.
- `render` changes the element: `<article>`, `<section aria-labelledby>`, `<aside aria-labelledby>` or `<li>`.
- Headless: no CSS. Each part renders its stable class: `kv-card`, `kv-card-header`, `kv-card-body` and `kv-card-footer`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, it's styled, and you choose with modifier classes: `kv-card--radius-md`, `kv-card--padding-sm`, `kv-card--dividers` and so on.

## Component

```tsx
import { Button, Card, Link } from '@kvirn-ui/react'

// A card without parts: the Root pads itself. A sidebar text block is a Section, not a Card.
<Card.Root render={<article />} className="kv-prose">
  <h2>Sophämtning</h2>
  <p>Matavfall och restavfall töms varannan vecka.</p>
</Card.Root>

// Image, heading, text and actions.
<Card.Root>
  <Card.Header className="kv-card-header--padding-none">
    <img src="/sophamtning.jpg" alt="" />
  </Card.Header>
  <Card.Body className="kv-prose">
    <h2>Sophämtning vid Storgatan 12</h2>
    <p>Matavfall och restavfall töms varannan vecka.</p>
  </Card.Body>
  <Card.Footer className="kv-button-group">
    <Button className="kv-button--primary">Beställ extra tömning</Button>
    <Button>Pausa hämtningen</Button>
  </Card.Footer>
</Card.Root>

// A list of cards: each card is a list item, with one link, in its heading.
<ul role="list">
  <Card.Root render={<li />}>
    <Card.Body className="kv-prose">
      <h3>
        <Link href="/nyheter/atervinning">Nya öppettider på återvinningscentralen</Link>
      </h3>
      <p>Från 1 november har återvinningscentralen öppet till kl. 19 på vardagar.</p>
    </Card.Body>
  </Card.Root>
</ul>
```

Your part:

- **The heading** goes at the top of `Card.Body` (or the Root), at the level your page outline needs. A Header is for media, or for a title row that needs a divider.
- **Images** that only decorate get `alt=""`. That's most card images, when the heading names the topic.
- **One link per card**, in the heading, with text that makes sense on its own. No "Read more", and no second link on the image. Navigation is a Link, actions are Buttons, and there's one primary action per view.
- **Lists.** A list of cards is a `<ul role="list">` with each card rendered as `<li>` (`render={<li />}`), so screen readers announce "list, 3 items". The default theme draws no marker on a card, and Safari (VoiceOver) drops the list semantics of a list without visible markers unless it has `role="list"` (1.3.1). jsx-a11y's `no-redundant-roles` rule flags it as redundant: in Safari it isn't.
- **Landmarks** only for a region a user would want to jump to: `<section aria-labelledby>` or `<aside aria-labelledby>`. Never make every card in a list a landmark.
- **Parts are direct children** of the Root. A wrapper between them breaks the default theme's padding, and an empty part still has padding: don't render it.

### Classes for the default theme

Without a modifier class, a card gets the default: `surface-raised`, the `lg` radius and `md` padding, with no dividers.

| Class                                               | On     | Sets                                   |
| --------------------------------------------------- | ------ | -------------------------------------- |
| `kv-card--radius-lg`, `-md`, `-none`                | Root   | the radius: `md` for a card in a card  |
| `kv-card--padding-none`, `-sm`, `-md`, `-lg`        | Root   | every part's padding                   |
| `kv-card-header--padding-none`, `-sm`, `-md`, `-lg` | Header | its own padding, overriding the Root's |
| `kv-card-body--padding-none`, `-sm`, `-md`, `-lg`   | Body   | its own padding, overriding the Root's |
| `kv-card-footer--padding-none`, `-sm`, `-md`, `-lg` | Footer | its own padding, overriding the Root's |
| `kv-card--dividers`                                 | Root   | a border-subtle line between parts     |

`md` padding is 24px, and 16px below `40rem` and in compact density (`kv-compact`). All four steps are allowed on a part, but mixed steps misalign the parts' edges, so per-part values are normally `none`, for full-bleed media. A site can change the default for every card with `--kv-card-padding-default` and `--kv-card-radius-default` (`@kvirn-ui/theme` README, Site-wide defaults), and then `kv-card--padding-md` and `kv-card--radius-lg` take one card back to the theme's step. Prose stops at a card: put `kv-prose` on `Card.Body` (or the Root of a card without parts) to style the text inside.

### Section, Card or a surface token: when to use which

| You're building                                                                                                   | Use                                                                                                      | Why                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| A region of the page next to or between other content: a sidebar, a filter section, a band of related content     | `Section`. It's `surface`, square, with no visible edge                                                  | It's part of the page's layout, not a thing on the page (elevation level 1)                              |
| A region that should look like the page again inside a `surface` region: the work area next to a staff sidebar    | `Section` with `kv-section--canvas`                                                                      | It goes back to the page colour without drawing a box (level 0)                                          |
| One self-contained thing people read, compare or act on as a unit: a service, a news item, a case, a contact card | `Card`. It's `surface-raised`, with a hairline edge and rounded corners                                  | The edge and the corners say "these belong together" (level 2)                                           |
| Several of those things                                                                                           | Cards in a list (`<ul>`, each card `render={<li />}`), on the page or on a Section                       | One thing per card. A Section around them is optional                                                    |
| A background inside your own component: a table header row, a code block, a read-only field                       | The token in your CSS, `var(--kv-color-surface)`, with the `text` tokens on it                           | It isn't a region or a thing, so it isn't a container. The `text` tokens keep `theme:check`'s pairs true |
| One thing with several independent actions: a user with Edit and Delete, a settings block                         | `Section`. A Card has one primary destination, and here the controls are the reason the container exists | If you can't name one destination, it isn't a card                                                       |
| A form section or a group of fields                                                                               | Neither. A heading or a `<fieldset>` with a legend, on the page or in a Section                          | A card would make "Account" look like an entity and add a level of hierarchy                             |
| A status message: an error, a warning, a confirmation                                                             | Neither. A notification, with a `-subtle` background, a bar, an icon and a heading                       | Status is never shown by a surface colour alone (1.4.1)                                                  |

Rules that go with it: a Card on a Section keeps its default look. Don't put a Section inside a Card (a region inside a thing turns the ladder upside down). Nest Sections only to switch between `surface` and `canvas`.

**When unsure, use the simpler container.** A Card is for one identifiable thing, not a box with a border, a background or padding. Before using Card, ask in order:

1. Can you name the thing it represents (a product, a person, an article, a case, a search result)? If not, use a Section or plain HTML.
2. Does the content represent exactly one thing? If not, use a Section.
3. Is there one primary destination or action? If the controls are the reason the container exists, use a Section.
4. Is it a form section, a field group, a toolbar, a button group or a layout wrapper? Never a Card.
5. Don't nest Cards unless the inner one is a thing in its own right. Don't use Cards to create visual hierarchy.

These are guidance in the docs. They don't change what Card does: a clickable whole card, and a choice of border, shadow or flat, stay out of scope (ADR-0020, DESIGN.md: a card is never interactive and has no shadow).

### `render`

```tsx
<Card.Root render={<article />}>…</Card.Root>
<Card.Root render={(rootProps) => <li {...rootProps} className="nyhet" />}>…</Card.Root>
```

An element keeps its own props, and the part's are merged in: class names join, styles merge and refs merge (ADR-0015). A `className` prop and a `render` element's own `className` join the part's class instead of replacing it, so the theme keeps styling the card. The function form gets the props, with a callback ref that fits any element, and an empty state object. Spread them, and keep `className`: it holds the part's class and your own.

## Hook

```tsx
import { useCard } from '@kvirn-ui/react'

function ContactCard() {
  const card = useCard()
  const headingId = useId()
  return (
    <section {...card.rootProps} aria-labelledby={headingId}>
      <div {...card.bodyProps}>
        <h2 id={headingId}>Kontakta oss</h2>
      </div>
    </section>
  )
}
```

`useCard()` returns `rootProps`, `headerProps`, `bodyProps` and `footerProps`, which hold only the part's `className`. Add a modifier class with `mergeProps`, which joins class names: `mergeProps(card.rootProps, { className: 'kv-card--radius-md' })`.
