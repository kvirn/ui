---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

New `Calendar` and `useCalendar`: a month as a `table role="grid"` for choosing one date, with one Tab stop on a roving day and the date keys (arrows across months, Home and End by the week start, PageUp and PageDown, Shift for a year). Parts: `Calendar.Root`, `.Heading`, `.PreviousMonth`, `.NextMonth`, the optional `.PreviousYear` and `.NextYear`, `.RangeHint` and `.Grid` (or your own markup from `weeks` and `getDayProps`). It takes `value`, `minimum`, `maximum`, `isDateUnavailable` (days stay focusable and say why in their name), `weekStart` and `weekNumbers` (ISO weeks, Monday start only). Month names, weekdays and the full date come from `Intl` in the provider's locale; the new month and a chosen day are announced politely. New `calendar.*` messages in all six locales (`se` is English until a native speaker writes them), and `kv-calendar*` in `theme.css` (day cells are 40px below 40rem, 36px with week numbers).
