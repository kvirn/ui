---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

Add `DateRangePicker`: one "Choose dates" button after a From and a To date (two `masks.date()` fields, or two DateInputs) that opens a modal Dialog with the range Calendar, two months side by side from 64rem and one below. The first press sets the start, the second the end: the dialog closes at once, both fields are written once through `onValueChange({ start, end })`, focus returns to the trigger and "{start} to {end} selected" is announced on the page after the dialog has closed. A day that can't be the end starts a new range. Escape and Close drop the half-chosen range and leave both fields as they were. It is controlled only (`value` is `{ start, end }` ISO strings, `''` for an empty end) and never starts open (no `defaultOpen`). New parts `DateRangePicker.Root`, `.Trigger`, `.Popup`, `.Title` and `.Calendar`, the hook `useDateRangePicker`, and the limits `minimumDays`, `maximumDays` and `allowUnavailableInRange` of the range Calendar. New messages `dateRangePicker.trigger` and `dateRangePicker.title` in all six locales (`se` is English until a native speaker writes it). The theme adds `kv-date-range-row` and `kv-date-range-picker-popup`; no new tokens.
