---
'@kvirn-ui/react': patch
---

TableOfContents and Navigation lists now carry `role="list"`, so Safari with VoiceOver still announces them as lists when the theme removes the list markers. A disabled `Menu.Item` no longer runs the `onClick` of its `render` element. An `Accordion.Heading`, `Accordion.Trigger` or `Accordion.Panel` outside an `Accordion.Item` now warns in development with the Accordion name instead of Disclosure's.
