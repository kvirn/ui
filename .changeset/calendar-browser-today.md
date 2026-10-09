---
'@kvirn-ui/react': patch
---

Calendar without a provider `timeZone` now moves "today" to the browser's date after mount; the first paint stays the UTC date so server and hydrated HTML agree.
