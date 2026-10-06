# ButtonGroup

> **Draft** (Plan 0035). This page moves to the docs site once `apps/docs` has a content system. The accessibility contract is [button-group.a11y.md](button-group.a11y.md), and the design spec is [docs/design/rich-text-editor.md](../../../../docs/design/rich-text-editor.md) (§6.5.2).

A row of related [Button](../button/button.md)s: the footer of a [Card](../card/card.md), the actions of a form, or a group in a [Toolbar](../toolbar/toolbar.md). **For a row that should be one Tab stop with the arrow keys, use a Toolbar.** Here every button is its own Tab stop, in DOM order.

- Renders one `<div class="kv-button-group">`, flat: there is no `.Root`. Your `className` joins the class. In a Toolbar it is `Toolbar.Group`, the same component under the toolbar's name.
- **With a name it is a `role="group"`.** Give it `aria-label` from your translations, or `aria-labelledby` that points at visible text, and a screen reader says where the buttons belong as focus enters the group.
- **Without a name it is a plain `<div>`.** An unnamed Card footer adds no empty group to the accessibility tree. A group is worth naming when the buttons need a context their own labels don't give.
- **A group in a Toolbar must have a name.** A development warning says so.
- **`layout="attached"` joins the buttons into one strip,** like a segmented control: they touch, share borders and only the outer corners are rounded (flipped in right-to-left text). A pressed `Toggle` is the filled segment. Default `layout="spaced"`. It changes the look only: the role, the name and the Tab stops are the same.
- It holds no state and handles no keys.
- With `@kvirn-ui/theme/theme.css` imported, the group is a row that wraps, with 12px between buttons, and stacks at full width below 40rem. An attached group never stacks or wraps, and a button may wrap its own label. In a Toolbar it never stacks, and has 4px between buttons and a hairline before it from 40rem. Put the one primary button first: it is the main next step, and comes first in focus order.

## API

### Parts

| Part        | Renders                     | Props                                                                                          |
| ----------- | --------------------------- | ---------------------------------------------------------------------------------------------- |
| ButtonGroup | `<div>` (flat, one element) | `layout` (`'spaced'` default, or `'attached'`), `render`, and every `<div>` prop except `role` |

### What it sets on the `<div>`

| Attribute or class | Value                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `class`            | `kv-button-group`, and `kv-button-group--attached` for `layout="attached"`. Your `className` joins it |
| `role`             | `group`, only when `aria-label` or `aria-labelledby` is set                                           |

### Strings

ButtonGroup has no strings of its own: the name is yours.

### `render`

`render` takes an element or a function `(groupProps, state)`, where `state` is `{ isNamed, layout }`. Spread the props in the function form: they hold the class and, with a name, the role.

### Development warnings

Keyed `button-group-*`, English, for the developer only: a group in a Toolbar with no name (`button-group-in-toolbar-without-name`).

## Component

```tsx
import { Button, ButtonGroup } from '@kvirn-ui/react'

;<ButtonGroup aria-label="Ärendet">
  <Button className="kv-button--primary">Skicka</Button>
  <Button>Spara utkast</Button>
</ButtonGroup>
```

A Card footer needs no name:

```tsx
<Card.Footer>
  <ButtonGroup>
    <Button className="kv-button--primary">Ansök</Button>
    <Button>Läs mer</Button>
  </ButtonGroup>
</Card.Footer>
```

A joined strip, as in a segmented control:

```tsx
<ButtonGroup aria-label="Textstil" layout="attached">
  <Toggle>Fet</Toggle>
  <Toggle>Kursiv</Toggle>
</ButtonGroup>
```

A name should say what the buttons are, not "Grupp". With several groups on a page, each name differs. If the group has a heading above it, point `aria-labelledby` at it instead of repeating the words.

## Hook

```tsx
import { useButtonGroup } from '@kvirn-ui/react'

function Actions() {
  const group = useButtonGroup({ isNamed: true })
  return (
    <div {...group.groupProps} aria-label="Ärendet">
      …
    </div>
  )
}
```

`useButtonGroup({ isNamed, layout })` returns `groupProps`: the class (with the attached modifier for `layout: 'attached'`), and `role="group"` when `isNamed` is `true`. Pass `isNamed` when you also set `aria-label` or `aria-labelledby`.
