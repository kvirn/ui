---
'@kvirn-ui/react': minor
'@kvirn-ui/i18n': minor
'@kvirn-ui/theme': minor
---

Add `DatePicker`: a "Choose date" button next to a typed date (DateInput, or one `masks.date()` field) that opens a modal Dialog with the Calendar. It is controlled only: pass the field's date as an ISO `value` and write the chosen day back in `onValueChange`. Choosing a day closes the dialog, returns focus to the trigger and announces "{date} selected" on the page. New parts `DatePicker.Root`, `.Trigger`, `.Popup`, `.Title` and `.Calendar`, the hook `useDatePicker`, and the bridge functions `dateInputValueToIsoDate`, `isoDateToDateInputValue`, `maskedDateToIsoDate` and `isoDateToMaskedDate`. New messages `datePicker.trigger` and `datePicker.title` in all six locales (`se` is English until a native speaker writes it). The theme adds `kv-date-picker-popup`, `kv-date-picker-trigger` and `kv-date-picker-row`; no new tokens. There is no `defaultOpen` (removed before release): a DatePicker is mounted closed; only a controlled `open` can open it from outside.
