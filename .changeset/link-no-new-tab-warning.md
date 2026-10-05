---
'@kvirn-ui/react': patch
---

`Link` no longer warns in development when a `target="_blank"` link has no `Link.NewTabNotice`, and the notice is still not a type error. A link that opens a new window or tab must say so (WCAG 3.2.5, G201): the Link docs now say it, and nothing checks it. The built-in icons are listed in the Icon docs with whether each mirrors in right-to-left text.
