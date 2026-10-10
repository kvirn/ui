# Tag and TagGroup

> **Draft** (Plan 0075). This page moves to the docs site once `apps/docs` has a page for it. The accessibility contract is [tag.a11y.md](tag.a11y.md). The design is `docs/design/tag-and-filters.md`.

A short fact in words, such as an applied filter: `År: 2025`. It is either static text or one removable button, the whole chip.

- `Tag.Root` is an `<li>`. Put a `Tag.Label` (static text) or a `Tag.Remove` (the button) in it.
- `Tag.Remove` is one `<button type="button">` named `Remove {label}` by `tag.remove`. The name contains the visible text (2.5.3). Pass `label` when `children` is not a string.
- `TagGroup.Root` holds a `TagGroup.Label`, a `TagGroup.List` (a `<ul role="list">`, not rendered while it has no tag), a `TagGroup.Empty` text and a `TagGroup.ClearAll` button (its default text `filters.clearAll` is for filter groups: pass your own children elsewhere). `useTagGroup()` is the same logic for your own markup.
- KvirnUI holds no tag state. Remove the tag in `onRemove`, in the same event, so focus can move after the render: to the next remove button, else the previous, else the group's label (or `focusFallback`). It never lands on `body`.
- Enter and Space remove a tag. Delete and Backspace do nothing: APG has no chip pattern, and a stray key must not remove anything. Use Clear all for bulk removal.
- `Tag.Remove` must be inside a `TagGroup.Root`. A group needs a `TagGroup.Label` or a `focusFallback`, and a `focusFallback` must return a focusable element, or the label is used. A removal the consumer refuses moves nothing and says nothing.
- A removal is announced (`tag.removed`, polite). Set `announceRemoval={false}` when you say one combined message, because the live region keeps only the last.
- A locked value is a static tag, never a disabled button. A selectable filter is a Checkbox, not a tag. Badge stays a static status and is never put in a tag group.
- Headless: no CSS. With `@kvirn-ui/theme/theme.css` imported, `kv-tag` and `kv-tag-remove` draw the chip, 44px high (32px in `kv-compact`), with a cross drawn in borders that forced colours keep.

## Component

```tsx
import { Tag, TagGroup } from '@kvirn-ui/react'

;<TagGroup.Root>
  <TagGroup.Label>Valda filter</TagGroup.Label>
  <TagGroup.List>
    {filters.map((filter) => (
      <Tag.Root key={filter}>
        <Tag.Remove onRemove={() => removeFilter(filter)}>{filter}</Tag.Remove>
      </Tag.Root>
    ))}
  </TagGroup.List>
  <TagGroup.Empty>Inga filter valda</TagGroup.Empty>
  <TagGroup.ClearAll onClear={clearFilters} />
</TagGroup.Root>
```

## Hook

```tsx
import { useTagGroup } from '@kvirn-ui/react'

const group = useTagGroup({ announceRemoval: false })
<span id={group.labelId} ref={group.labelRef}>Valda filter</span>
<ul role="list" ref={group.listRef} aria-labelledby={group.labelId}>…</ul>
// In each remove button's onClick: group.prepareRemoval(event.currentTarget, 'År: 2025'), then change your state.
// Mark the button with data-kv-tag-remove so the group finds it.
```

## Recipe: filter a list

1. **Filters are form values.** Checkboxes in a `CheckboxGroup` under a legend, one `<form aria-labelledby>` with the heading `filters.heading`. A long facet (over about ten options) is a Combobox `multiple`, one-of-many is a RadioGroup. Keep the filters in the URL (GET), so Back, sharing and no JavaScript work, and add a `filters.apply` submit after the last option for the no-JS case.
2. **No Apply button with JavaScript.** The results change in place and focus does not move (3.2.2). Pagination goes back to page 1 on any change.
3. **Applied filters are tags** between the filters and the results: a `TagGroup` labelled `filters.applied`, tag text `filters.appliedValue` (`År: 2025`), and Clear all.
4. **One combined announcement** per change, polite, after the results settle: `filters.resultCount` for a tick, `filters.removedResultCount` for a removal, `filters.clearedResultCount` for Clear all. Set `announceRemoval={false}` on the group so the removal message is not replaced by, or does not replace, the count. The visible count heading says the same.
5. **Dead ends.** No results: `filters.noResults` and `filters.noResultsHint`, with the applied row and Clear all still in view. Loading over a second: a visible `filters.loading` and `aria-busy="true"` on the results list. A failed update: an inline `Alert` with `filters.loadFailed` and `filters.retry`, the filters and old results kept.
6. **Layout.** Reading order is Tab order: filters, applied row, sort, results, pagination. Below 64rem a Disclosure would hold the filters, open from 64rem: Disclosure has no such option yet, so lay the filters out in the page (the story does) and open this as a decision.

The `Filter a list` story in Components/Content/Tag is the working example, including the announcements.

## Accessibility

See the contract: [tag.a11y.md](tag.a11y.md).
