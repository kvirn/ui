# Site search

The site's search: a `<search>` landmark around a GET form, with a `Field`, a `TextInput` and a `Button` joined into one strip by an attached `ButtonGroup`. Put it in the Site header's `Masthead`, or on the results page.

- One part: `SiteSearch`. `action` (required) is the search page, `label` (required) the field's name, and the children the button's word. `name` (default `q`) and `defaultValue` reach the field.
- The label is visually hidden: the button's word is the visible cue, and the button never shows an icon alone (2.5.3).
- The field and the button keep their own look. On the primary Site header the strip is one white pill with a decorative magnifier, a solid `primary` button inside it, and an `on-primary` focus ring round the whole pill.
- To build the same strip yourself, see [InputGroup › Search](?path=/story/components-forms-inputgroup--search).

```tsx
import { SiteSearch } from '@kvirn-ui/patterns'

;<SiteSearch action="/search" label="Search the site">
  Search
</SiteSearch>
```

## Accessibility

See the contract: [site-search.a11y.md](site-search.a11y.md).
