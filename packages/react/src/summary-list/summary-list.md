# SummaryList

> **Draft** (Plan 0063). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [summary-list.a11y.md](summary-list.a11y.md).

Rows of a label, a value and an optional action, as one native description list: the answers on a check-your-answers page, a contact card, a case card, an event. It is read-only. A value the user can edit is a Field, and the row's action is a link to where it is changed.

- Six parts: `SummaryList.Root` (`<dl>`), `.Row` (`<div>`), `.Key` (`<dt>`), `.Value` (`<dd>`), `.Actions` (`<dd>`) and `.Change` (`<a>`). Also exported as `SummaryListRoot`, `SummaryListRow`, `SummaryListKey`, `SummaryListValue`, `SummaryListActions` and `SummaryListChange`.
- No role, no ARIA on the list and no state. The `<dl>` with `<div>` rows is the native structure, so a screen reader says "term" and "definition" and keeps a key with its values.
- The Change link's text is `summaryList.change` ("Ändra"), and its accessible name is that word plus the row's key, "Ändra Namn", so it is clear out of context (2.4.4) and starts with the visible text (2.5.3). The link's id and the key's id are wired by the Row.
- Headless: no CSS. Every part renders its class (`kv-summary-list`, `kv-summary-list-row`, `-key`, `-value`, `-actions`, and `kv-link kv-summary-list-change`), and your `className` joins it. With `@kvirn-ui/theme/theme.css` imported, the rows have `border-subtle` lines and stack below `40rem`.

## Component

```tsx
import { SummaryList } from '@kvirn-ui/react'

;<SummaryList.Root>
  <SummaryList.Row>
    <SummaryList.Key>Namn</SummaryList.Key>
    <SummaryList.Value>Anna Svensson</SummaryList.Value>
    <SummaryList.Actions>
      <SummaryList.Change href="/ansokan/steg-1" />
    </SummaryList.Actions>
  </SummaryList.Row>
  <SummaryList.Row>
    <SummaryList.Key>Telefon</SummaryList.Key>
    <SummaryList.Value>Ej angivet</SummaryList.Value>
  </SummaryList.Row>
</SummaryList.Root>
```

| Part                  | Renders                                      | Props                                                                                        |
| --------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `SummaryList.Root`    | `<dl class="kv-summary-list">`               | `ref`, any `<dl>` attribute                                                                  |
| `SummaryList.Row`     | `<div class="kv-summary-list-row">`          | `ref`                                                                                        |
| `SummaryList.Key`     | `<dt class="kv-summary-list-key">`           | `ref`. Its `id` comes from the Row                                                           |
| `SummaryList.Value`   | `<dd class="kv-summary-list-value">`         | `ref`                                                                                        |
| `SummaryList.Actions` | `<dd class="kv-summary-list-actions">`       | `ref`. Holds one or more links                                                               |
| `SummaryList.Change`  | `<a class="kv-link kv-summary-list-change">` | `href`, `messages` (`{ change }`), `children` (replace the text), `ref`, any `<a>` attribute |

Your part:

- **Give every row a Key.** The Change link's name is built from it. Outside a Row, Change warns once in development (`summary-list-change-outside-row`).
- **Say what is missing** ("Ej angivet") rather than leaving an empty value.
- **A Change link goes to the step where the answer is edited,** by URL, so Back and sharing work. Don't use `history.back()`.
- **No `as`.** The `<dl>`, `<div>`, `<dt>` and `<dd>` are the structure (1.3.1), and Change is an `<a href>`. For a router link, use `useSummaryList().getChangeProps` with your own link.
- **Don't put form controls in a row.** To show a value and let it be edited in place, use a Field.

## Hook

```tsx
import { useSummaryList } from '@kvirn-ui/react'

function Answer({ label, value, href }: { label: string; value: string; href: string }) {
  const list = useSummaryList()
  const keyId = useId()
  const changeId = useId()
  return (
    <div {...list.rowProps}>
      <dt {...list.keyProps} id={keyId}>
        {label}
      </dt>
      <dd {...list.valueProps}>{value}</dd>
      <dd {...list.actionsProps}>
        <a {...list.getChangeProps({ id: changeId, keyId })} href={href}>
          {list.changeLabel}
        </a>
      </dd>
    </div>
  )
}
```

`useSummaryList({ messages })` returns `rootProps`, `rowProps`, `keyProps`, `valueProps` and `actionsProps` (only the part's class), `changeLabel` (the message `summaryList.change`) and `getChangeProps({ id, keyId })`, which sets the class, the link's `id` and `aria-labelledby="{id} {keyId}"`.
