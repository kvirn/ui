# Heading

> **Draft** (Plan 0023). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [heading.a11y.md](heading.a11y.md).

A heading with its element as a required `as` prop, and its look as an optional one. `<Heading as="h2">` renders an `<h2>`, and `<Heading as="h3" size="heading-2">` an `<h3>` that looks like heading-2.

- One part: `Heading`, also `useHeading({ level, size })`. It renders `<h1>` to `<h6>` with the classes `kv-heading` and `kv-heading--<size>`, and no role, ARIA, text or strings.
- `as` (`h1` to `h6`) is required, because Heading can't know where it sits in the page's outline. Choose it for the outline: one `h1` per page, and no skipped levels.
- `size` is the look, apart from the level: `display` or `heading-1` to `heading-6`, the type roles of the same names (Foundation / Typography). Each level looks like the role of its number (`as="h4"` is `heading-4`) unless you say otherwise. `heading-4` to `heading-6` stay at 16px and differ by weight and tracking, so resident-facing text stops at `h3` where it can.
- Attributes and the `ref` reach the element, so `id` for `aria-labelledby` works as usual.
- `as` takes only `h1` to `h6`, as a string, so it works from a Server Component. For a `<legend>` or another element, use `useHeading` with your own element.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-heading` and its size modifier style the heading in [Prose](../prose/prose.md) and outside it. Margins come from Prose or from you.

## Component

```tsx
import { Heading, Prose, Section } from '@kvirn-ui/react'

;<Section as="aside" aria-labelledby="kontakt">
  <Prose>
    <Heading as="h2" id="kontakt">
      Kontakta oss
    </Heading>
    <p>Vi svarar vardagar 9–16.</p>
  </Prose>
</Section>

// The page title as display, and a card's title as an h3 set as heading-2.
<Heading as="h1" size="display">Välkommen till Kvirnby</Heading>
<Heading as="h3" size="heading-2">Sophämtning</Heading>

// All six levels have a look of their own: h4 is heading-4, h5 is heading-5 and h6 is heading-6.
<Heading as="h4">Öppettider</Heading>
```

## Hook

```tsx
import { useHeading } from '@kvirn-ui/react'

const heading = useHeading({ level: 3, size: 'heading-2' })
<h3 {...heading.rootProps}>Sophämtning</h3>

// A fieldset's legend that looks like a heading: your element, the hook's classes.
const legend = useHeading({ level: 2 })
<legend {...legend.rootProps}>Kontaktuppgifter</legend>
```

## Accessibility

See the contract: [heading.a11y.md](heading.a11y.md).
