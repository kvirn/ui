---
'@kvirn-ui/core': patch
'@kvirn-ui/react': patch
---

TableOfContents: a link is current as soon as its section is on screen. The current heading is the last one in the top 20% of the viewport below `offset`, or the first visible heading before that, instead of nothing until a heading scrolls up to `offset`. `getActiveHeading` takes an optional `viewportHeight` for this; left out, it behaves as before.
