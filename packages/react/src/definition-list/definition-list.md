# DefinitionList

> **Draft** (Plan 0063). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [definition-list.a11y.md](definition-list.a11y.md).

Rows of a term, a description and an optional action, as one native description list: the answers on a check-your-answers page, a contact card, a case card, an event. It is read-only. A description the user can edit is a Field, and the row's action is a link to where it is changed.

- Six parts: `DefinitionList.Root` (`<dl>`), `.Row` (`<div>`), `.Term` (`<dt>`), `.Description` (`<dd>`), `.Actions` (`<dd>`) and `.Change` (`<a>`). Also exported as `DefinitionListRoot`, `DefinitionListRow`, `DefinitionListTerm`, `DefinitionListDescription`, `DefinitionListActions` and `DefinitionListChange`.
- No role, no ARIA on the list and no state. The `<dl>` with `<div>` rows is the native structure, so a screen reader says "term" and "definition" and keeps a term with its descriptions.
- The Change link's text is `definitionList.change` ("Ändra"), and its accessible name is that word plus the row's term, "Ändra Namn", so it is clear out of context (2.4.4) and starts with the visible text (2.5.3). The link's id and the term's id are wired by the Row.
- Headless: no CSS. Every part renders its class (`kv-definition-list`, `kv-definition-list-row`, `-term`, `-description`, `-actions`, and `kv-link kv-definition-list-change`), and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the rows have `border-subtle` lines and stack below `40rem`.

## Component

```tsx
import { DefinitionList } from '@kvirn-ui/react'

;<DefinitionList.Root>
  <DefinitionList.Row>
    <DefinitionList.Term>Namn</DefinitionList.Term>
    <DefinitionList.Description>Anna Svensson</DefinitionList.Description>
    <DefinitionList.Actions>
      <DefinitionList.Change href="/ansokan/steg-1" />
    </DefinitionList.Actions>
  </DefinitionList.Row>
  <DefinitionList.Row>
    <DefinitionList.Term>Telefon</DefinitionList.Term>
    <DefinitionList.Description>Ej angivet</DefinitionList.Description>
  </DefinitionList.Row>
</DefinitionList.Root>
```

| Part                         | Renders                                         | Props                                                                                        |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `DefinitionList.Root`        | `<dl class="kv-definition-list">`               | `ref`, any `<dl>` attribute                                                                  |
| `DefinitionList.Row`         | `<div class="kv-definition-list-row">`          | `ref`                                                                                        |
| `DefinitionList.Term`        | `<dt class="kv-definition-list-term">`          | `ref`. Its `id` comes from the Row                                                           |
| `DefinitionList.Description` | `<dd class="kv-definition-list-description">`   | `ref`                                                                                        |
| `DefinitionList.Actions`     | `<dd class="kv-definition-list-actions">`       | `ref`. Holds one or more links                                                               |
| `DefinitionList.Change`      | `<a class="kv-link kv-definition-list-change">` | `href`, `messages` (`{ change }`), `children` (replace the text), `ref`, any `<a>` attribute |

Your part:

- **Give every row a Term.** The Change link's name is built from it. Outside a Row, Change warns once in development (`definition-list-change-outside-row`).
- **Say what is missing** ("Ej angivet") rather than leaving an empty description.
- **A Change link goes to the step where the answer is edited,** by URL, so Back and sharing work. Don't use `history.back()`.
- **No `as`.** The `<dl>`, `<div>`, `<dt>` and `<dd>` are the structure (1.3.1), and Change is an `<a href>`. For a router link, use `useDefinitionList().getChangeProps` with your own link.
- **Don't put form controls in a row.** To show a description and let it be edited in place, use a Field.

## Hook

```tsx
import { useDefinitionList } from '@kvirn-ui/react'

function Answer({ label, value, href }: { label: string; value: string; href: string }) {
  const list = useDefinitionList()
  const termId = useId()
  const changeId = useId()
  return (
    <div {...list.rowProps}>
      <dt {...list.termProps} id={termId}>
        {label}
      </dt>
      <dd {...list.descriptionProps}>{value}</dd>
      <dd {...list.actionsProps}>
        <a {...list.getChangeProps({ id: changeId, termId })} href={href}>
          {list.changeLabel}
        </a>
      </dd>
    </div>
  )
}
```

`useDefinitionList({ messages })` returns `rootProps`, `rowProps`, `termProps`, `descriptionProps` and `actionsProps` (only the part's class), `changeLabel` (the message `definitionList.change`) and `getChangeProps({ id, termId })`, which sets the class, the link's `id` and `aria-labelledby="{id} {termId}"`.
