# Prose

> **Draft** (Plan 0023). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [prose.a11y.md](prose.a11y.md).

Text set for reading: the `kv-prose` class as a component. It renders a `<div>`.

- One part: `Prose` (also exported as `ProseRoot`; `Prose.Root` still works but is deprecated), one `<div class="kv-prose">`.
- No role, no ARIA, no text and no strings. The headings, paragraphs, lists, links and tables inside keep their own semantics.
- `as` changes the element: `div` (default), `article` or `section`.
- Headless: no CSS. The part renders its stable class `kv-prose`, and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the text is styled. Add `kv-prose--large` for the larger size. The theme also has `kv-prose--small` (14px, for notes and metadata only), `kv-prose--xl`, `kv-prose--2xl` and `kv-prose--full` (no measure), and the colour roles `--kv-prose-color-*` to recolour one part of a block.
- The rest of the type roles come with it: body (`kv-prose--large` for body-large), `p.kv-lead` for the lead paragraph, body-small for captions, and code, numeric and label styles for the elements that use them. Write plain `<h1>` to `<h6>` inside Prose: it styles them with the type roles `heading-1` to `heading-6`, so it needs no Heading. `h4` to `h6` stay at 16px (essential content is never smaller) and differ by weight and tracking, in every prose size, so stop at `h3` in resident-facing text where you can. Use [Heading](../heading/heading.md) where you need a look apart from the level, such as a `display` title, in or out of Prose.
- **In a Field or Fieldset it is the description** ([Field](../field/field.md), [Fieldset](../fieldset/fieldset.md)), shown above the control: a `<Prose>` inside a `Field` or `Fieldset` registers its id, so it is in the control's (or group's) `aria-describedby`, in DOM order, before the error. There is no opt-out. The description is its text content, so keep it to plain text and a few short paragraphs: a heading, list or link inside loses its structure for a screen-reader user. A Prose that isn't a description goes outside the Field. What helps while typing, such as a format or an example, is a `Field.HelpText` under the control, not a Prose. Outside a Field or Fieldset a Prose has no id and no behaviour.
- **`kv-inset` and `kv-steps`** (theme classes, no component): `<div class="kv-inset"><p><strong>Viktigt:</strong> …</p></div>` sets a paragraph or two apart with a fill and a bar, and `<ol class="kv-steps">` makes a numbered list of process steps (each step a heading plus text) with large native numbers. Neither adds a role or is announced; start an inset with a word that says why it is set apart. An inset is for what must not be missed; a lost-rights deadline is an `Alert.Warning`, a quotation a `blockquote`. `kv-steps` is content, not the Stepper's "Step 2 of 5". The contract has the alt-text table and the video and audio guidance (native `<video controls>` with captions, self-hosted, never autoplay or an iframe): [prose.a11y.md](prose.a11y.md).
- A Prose is not a container with a surface. For a region of the page, use [Section](../section/section.md), and put Prose inside it.

## Component

```tsx
import { Prose } from '@kvirn-ui/react'

;<Prose>
  <h2>Kontakta oss</h2>
  <p>Vi svarar vardagar 9–16.</p>
</Prose>
```

## Hook

```tsx
import { useProse } from '@kvirn-ui/react'

const prose = useProse()
<article {...prose.rootProps}>…</article>
```

## Accessibility

See the contract: [prose.a11y.md](prose.a11y.md).
