# Card

> **Draft** (Plan 0007). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [card.a11y.md](card.a11y.md), and the design spec is [docs/design/card.md](../../../../docs/design/card.md).

A plain container for one thing on the page: an image, a heading, some text and a couple of actions, for a service, a news item or a case. Card is elevation level 2, and it is always `surface-raised`. A region of the page, such as a sidebar, is a [Section](../section/section.md).

- Four parts, each one `<div>`: `Card.Root`, `Card.Header`, `Card.Body` and `Card.Footer` (also exported as `CardRoot`, `CardHeader`, `CardBody` and `CardFooter`). Header and Footer are never `<header>` or `<footer>`, which would become page landmarks.
- No role, no ARIA, no text and no behaviour. Children are whatever you pass, with their own semantics and focus order.
- `Card.Root` takes `as`: `div` (default), `li`, `article`, `figure` or `section`. Header, Body and Footer are always a `<div>`.
- Headless: no CSS. Each part renders its stable class: `kv-card`, `kv-card-header`, `kv-card-body` and `kv-card-footer`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, it's styled, and you choose with modifier classes: `kv-card--radius-md`, `kv-card--padding-sm`, `kv-card--dividers` and so on.

## Component

```tsx
import { Button, Card, Link } from '@kvirn-ui/react'

// A card without parts: the Root pads itself. A sidebar text block is a Section, not a Card.
<Card.Root as="article" className="kv-prose">
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
  <Card.Root as="li">
    <Card.Body className="kv-prose">
      <h3>
        <Link.Root href="/nyheter/atervinning">Nya öppettider på återvinningscentralen</Link.Root>
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
- **Lists.** A list of cards is a `<ul role="list">` with each card rendered as `<li>` (`as="li"`), so screen readers announce "list, 3 items". The default theme draws no marker on a card, and Safari (VoiceOver) drops the list semantics of a list without visible markers unless it has `role="list"` (1.3.1). The repository's lint allows `role="list"` on a `ul` (`no-redundant-roles` is relaxed for that pair only): in Safari it isn't redundant.
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

### `as`

```tsx
<Card.Root as="article">…</Card.Root>
<Card.Root as="li" className="nyhet">…</Card.Root>
```

`as` is a string, so it works from a Server Component. A tag outside the list is a type error and, from JS, warns once in development and renders a `<div>`. A `className` prop joins the part's class instead of replacing it, so the theme keeps styling the card. For any other element, use `useCard`.

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
