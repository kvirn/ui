# Accordion

> **Draft** (Plan 0058). This page moves to the docs site once `apps/docs` has a page for it. The accessibility contract is [accordion.a11y.md](accordion.a11y.md).

An Accordion is a list of questions or sections, each a heading with a button that reveals one panel (APG Accordion). It is a list of [Disclosures](../disclosure/disclosure.md) with headings: use it for a FAQ. Items are independent, so more than one can be open.

- Five parts: `Accordion.Root` (`<div>`), `Accordion.Item` (`<div>`, owns one disclosure's state), `Accordion.Heading` (`<h1>` to `<h6>` by the required `level`), `Accordion.Trigger` (`<button>`) and `Accordion.Panel` (`<div>`, `hidden` while closed). Each is also exported on its own (`AccordionRoot`, …), and the hook is `useAccordion`, used with one `useDisclosure()` per item.
- **Pick the heading level for the page's outline.** It is required: Accordion can't know where it sits.
- **Every trigger is a Tab stop.** The arrow keys, Home and End are not handled (APG makes them optional): Plan 0058.
- **`region` on a panel is opt-in.** APG advises landmarks for about six panels or fewer.
- The theme draws hairlines between items, the trigger as a full-width row, and a chevron at the inline end. Without it the parts carry `kv-accordion`, `kv-accordion-item`, `kv-accordion-heading`, `kv-accordion-trigger`, `kv-accordion-panel` and `data-open`.

## API

```tsx
import { Accordion } from '@kvirn-ui/react'

;<Accordion.Root>
  <Accordion.Item>
    <Accordion.Heading level={3}>
      <Accordion.Trigger>Hur ansöker jag?</Accordion.Trigger>
    </Accordion.Heading>
    <Accordion.Panel>Du ansöker på Mina sidor.</Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

| Part                | Props                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Accordion.Root`    | `hiddenUntilFound` (the default for every item). `as="ul"` or `"ol"` makes it a list                                                      |
| `Accordion.Item`    | `open`, `defaultOpen`, `onOpenChange`, `disabled`, `focusableWhenDisabled`, `hiddenUntilFound`, as `Disclosure.Root`. `as="li"` in a list |
| `Accordion.Heading` | `level` (1 to 6, required)                                                                                                                |
| `Accordion.Trigger` | As `Disclosure.Trigger`                                                                                                                   |
| `Accordion.Panel`   | As `Disclosure.Panel`, and `region` (default `false`): `role="region"` named by the trigger                                               |

`Accordion.Root` takes `as` (`div`, `ul`, `ol`) and `Accordion.Item` takes `as` (`div`, `li`). A tag outside the list is a type error and, from JS, warns once in development and renders a `<div>`. Every part's `className`, `style`, handlers and refs merge with its own.
