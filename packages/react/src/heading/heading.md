# Heading

> **Draft** (Plan 0023). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [heading.a11y.md](heading.a11y.md).

A heading with its level as a required prop, and its look as an optional one. `<Heading level={2}>` renders an `<h2>`, and `<Heading level={3} size="heading-2">` an `<h3>` that looks like heading-2.

- One part: `Heading`, also `useHeading({ level, size })`. It renders `<h1>` to `<h6>` with the classes `kv-heading` and `kv-heading--<size>`, and no role, ARIA, text or strings.
- `level` is required, because Heading can't know where it sits in the page's outline. Choose it for the outline: one `h1` per page, and no skipped levels.
- `size` is the look, apart from the level: `display` or `heading-1` to `heading-6`, the type roles of the same names (Foundation / Typography). Each level looks like the role of its number (`level={4}` is `heading-4`) unless you say otherwise. `heading-4` to `heading-6` stay at 16px and differ by weight and tracking, so resident-facing text stops at `h3` where it can.
- Attributes and the `ref` reach the element, so `id` for `aria-labelledby` works as usual.
- `render` changes the element. Its own semantics apply.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-heading` and its size modifier style the heading in [Prose](../prose/prose.md) and outside it. Margins come from Prose or from you.

## Component

```tsx
import { Heading, Prose, Section } from '@kvirn-ui/react'

;<Section render={<aside aria-labelledby="kontakt" />}>
  <Prose>
    <Heading level={2} id="kontakt">
      Kontakta oss
    </Heading>
    <p>Vi svarar vardagar 9–16.</p>
  </Prose>
</Section>

// The page title as display, and a card's title as an h3 set as heading-2.
<Heading level={1} size="display">Välkommen till Kvirnby</Heading>
<Heading level={3} size="heading-2">Sophämtning</Heading>

// All six levels have a look of their own: h4 is heading-4, h5 is heading-5 and h6 is heading-6.
<Heading level={4}>Öppettider</Heading>
```

## Hook

```tsx
import { useHeading } from '@kvirn-ui/react'

const heading = useHeading({ level: 3, size: 'heading-2' })
<h3 {...heading.rootProps}>Sophämtning</h3>
```

## Accessibility

See the contract: [heading.a11y.md](heading.a11y.md).
