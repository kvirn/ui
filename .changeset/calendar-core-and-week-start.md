---
'@kvirn-ui/core': minor
'@kvirn-ui/react': minor
---

New date math and calendar state in `@kvirn-ui/core`, for the coming Calendar and DatePicker: Gregorian `YYYY-MM-DD` functions for years 1 to 9999 with no `Date` arithmetic and no dependency (`addDays`, `addMonths`, `addYears`, `getIsoWeek`, `getMonthWeeks`, `startOfWeek`, `clampIsoDate` and more), `getCalendarKeyTarget` (the arrow, Home, End and Page keys, RTL-aware, clamped to a range), and `createCalendar`. `<KvirnProvider weekStart>` (`1` Monday to `7` Sunday) is new: it defaults to the locale's first day when the locale names a region (`en-US` is Sunday), and to Monday otherwise (bare `en` is Monday). `useDateSettings()` now returns `{ timeZone, weekStart }`, and `resolveWeekStart` is exported from core.
