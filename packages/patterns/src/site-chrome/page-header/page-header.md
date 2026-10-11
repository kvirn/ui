# Page header

> **Draft** (Plan 0103). A pattern in the private `@kvirn-ui/patterns`. The accessibility contract is [page-header.a11y.md](page-header.a11y.md).

The top of a page's `main`: a full-width `surface` band with the breadcrumb, the page's `h1`, a lead and a few facts. Put it first in `PageFrame.Main` (or in a `main` with `bleed`).

- Parts: `PageHeader.Root` (a `<div>` with a `Container`, no landmark), `PageHeader.Title` (the `h1`, `display` size), `PageHeader.Lead` (`<p class="kv-lead">`, at most 60ch) and `PageHeader.Facts` (a `DefinitionList.Root` with `kv-page-header-facts`).
- The breadcrumb is the shipped `Breadcrumb`, written as a child before the title. Leave it out when it would be one item.
- Facts: write `DefinitionList.Row`s. They wrap in a row from 40rem and stack below. A `code` in a description is set in the mono font.
- Text is children. The pattern has no strings and no presentation props. Parts are also flat exports (`PageHeaderRoot`, `PageHeaderTitle`, …).

```tsx
import { PageHeader } from '@kvirn-ui/patterns'
import { Breadcrumb, DefinitionList } from '@kvirn-ui/react'

;<PageHeader.Root>
  <Breadcrumb.Root>…</Breadcrumb.Root>
  <PageHeader.Title>Tabs</PageHeader.Title>
  <PageHeader.Lead>Switch between related panels without leaving the page.</PageHeader.Lead>
  <PageHeader.Facts>
    <DefinitionList.Row>
      <DefinitionList.Term>Package</DefinitionList.Term>
      <DefinitionList.Description>
        <code>@kvirn-ui/react</code>
      </DefinitionList.Description>
    </DefinitionList.Row>
  </PageHeader.Facts>
</PageHeader.Root>
```

## Accessibility

See the contract: [page-header.a11y.md](page-header.a11y.md).
