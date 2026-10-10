# Stepper

> **Draft** (Plan 0083). This page moves to the docs site. The accessibility contract is [stepper.a11y.md](stepper.a11y.md) and the design spec is [docs/design/stepper.md](../../../../docs/design/stepper.md).

Stepper says where the user is in a multi-page form, in one line of text: "Step 2 of 5: Your vehicle". It is a **position, not navigation**: no list, no links, no live region, not a Tab stop.

Put it directly after the page heading, as its own element. Never inside the `h1`, a `label` or a `legend`: its text would join that name (a development warning says so). The Stepper adds no focus move and no announcement: the new page is carried by focus (`useRouteFocus` moves it to the heading), and the Stepper is the next thing a screen reader reads.

```tsx
import { Heading, Stack, Stepper } from '@kvirn-ui/react'

;<Stack className="kv-stack--gap-2">
  <Heading as="h1">Vilket fordon gäller ansökan?</Heading>
  <Stepper current={2} total={5} name="Fordonet" />
</Stack>
```

- A step is a **section**, which may span pages, so the total does not change when an answer adds a page. If sections can't be counted reliably, leave the Stepper out. Never "Step 3 of ?".
- Leave it out of a start page, a confirmation, an exit page and a one-page form.
- Going back is a Back link, and a Change link on the check-answers page. Keep the answers (3.3.7).
- With a label or legend as the heading, put the Stepper after the `h1`, or inside the fieldset after the legend, before the description and the control.

## Wording

`name` is short and in plain words: "Your vehicle", "Check and send". The text wraps and hyphenates, so a long name is never cut. Each locale owns its word order: Finnish writes "Vaihe 2/5: Ajoneuvosi".

## API

| Prop       | Type               | Meaning                                            |
| ---------- | ------------------ | -------------------------------------------------- |
| `current`  | `number`           | The step: a positive whole number, at most `total` |
| `total`    | `number`           | How many steps: a positive whole number            |
| `name`     | `string`           | The section's name, added after the position       |
| `messages` | `Partial<stepper>` | Per-instance `status` and `statusWithName`         |
| `as`       | `'p'` \| `'div'`   | Change the element. `'p'` by default               |

No `children`: the text is the message (`stepper.status`, `stepper.statusWithName`, per provider and per instance). `useStepper({ current, total, name, messages })` returns `text`, `element` (`'p'`) and `rootProps` (`kv-stepper` and a ref) for your own markup. Use `text` in `<title>` if you like.

Theme: `kv-stepper` is body text in `text`, with no margin, so the layout owns the rhythm.
