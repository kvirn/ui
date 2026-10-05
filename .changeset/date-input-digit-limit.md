---
'@kvirn-ui/react': patch
---

DateInput boxes stop at their own number of digits (two for day and month, four for year): a typed key past it is refused. A paste is never cut, and there is still no native `maxlength`.
