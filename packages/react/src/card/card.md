# Card

> **Draft** (Plan 0007). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [card.a11y.md](card.a11y.md), and the design spec is [docs/design/card.md](../../../../docs/design/card.md).

A plain container for content on a surface: a text block in a sidebar, or an image, a heading, some text and a couple of actions (ADR-0020).

- Four parts, each one `<div>`: `Card.Root`, `Card.Header`, `Card.Body` and `Card.Footer` (also exported as `CardRoot`, `CardHeader`, `CardBody` and `CardFooter`). Header and Footer are never `<header>` or `<footer>`, which would become page landmarks.
- No role, no ARIA, no text and no behaviour. Children are whatever you pass, with their own semantics and focus order.
- `render` changes the element: `<article>`, `<section aria-labelledby>`, `<aside aria-labelledby>` or `<li>`.
- Headless: no CSS. It renders `data-kv="card"`, `"card-header"`, `"card-body"` and `"card-footer"`. With `@kvirn-ui/theme/theme.css` imported, it's styled, and you choose with plain attributes: `data-surface`, `data-radius`, `data-padding` and `data-dividers`.

## Component

```tsx
import { Button, Card, Link } from '@kvirn-ui/react'

// A text block: the Root pads itself when it has no parts.
<Card.Root render={<aside aria-labelledby="kontakt" />} data-surface="surface" data-kv-prose="">
  <h2 id="kontakt">Kontakta oss</h2>
  <p>Ring kundcenter på 0123-45 67 89.</p>
</Card.Root>

// Image, heading, text and actions.
<Card.Root>
  <Card.Header data-padding="none">
    <img src="/sophamtning.jpg" alt="" />
  </Card.Header>
  <Card.Body data-kv-prose="">
    <h2>Sophämtning vid Storgatan 12</h2>
    <p>Matavfall och restavfall töms varannan vecka.</p>
  </Card.Body>
  <Card.Footer data-kv-button-group="">
    <Button data-variant="primary">Beställ extra tömning</Button>
    <Button>Pausa hämtningen</Button>
  </Card.Footer>
</Card.Root>

// A list of cards: each card is a list item, with one link, in its heading.
<ul role="list">
  <Card.Root render={<li />}>
    <Card.Body data-kv-prose="">
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

### Attributes for the default theme

| Attribute       | On                | Values (default first)                |
| --------------- | ----------------- | ------------------------------------- |
| `data-surface`  | Root              | `surface-raised`, `surface`, `canvas` |
| `data-radius`   | Root              | `lg`, `md` (a card in a card), `none` |
| `data-padding`  | Root, or one part | `md`, `none`, `sm`, `lg`              |
| `data-dividers` | Root              | present or absent                     |

`md` padding is 24px, and 16px below `40rem` and in compact density. All four steps are allowed on a part, but mixed steps misalign the parts' edges, so per-part values are normally `none`, for full-bleed media. Prose stops at a card: put `data-kv-prose` on `Card.Body` (or the Root of a card without parts) to style the text inside.

### `render`

```tsx
<Card.Root render={<article />}>…</Card.Root>
<Card.Root render={(rootProps) => <li {...rootProps} className="nyhet" />}>…</Card.Root>
```

An element keeps its own props, and the part's are merged in: class names join, styles merge and refs merge (ADR-0015). A `data-kv` prop or a `render` element's own `data-kv` never replaces the part name, so the theme keeps styling the card. The function form gets the props, with a callback ref that fits any element, and an empty state object. Spread them, and don't override `data-kv`.

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

`useCard()` returns `rootProps`, `headerProps`, `bodyProps` and `footerProps`, which hold only the part names.
