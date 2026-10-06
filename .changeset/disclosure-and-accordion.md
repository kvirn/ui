---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
---

`Disclosure` and `Accordion` (Plan 0058, APG Disclosure and Accordion). No new strings, so `@kvirn-ui/i18n` is unchanged.

- `Disclosure` is a namespace: `Root` (no element; `open`, `defaultOpen`, `onOpenChange` with the reason `trigger-press` or `find-in-page`, `disabled`, `focusableWhenDisabled`, `hiddenUntilFound`), `Trigger` (a native `<button>` with `aria-expanded` and `aria-controls`, and a decorative chevron at the inline end that points down while closed and up while open) and `Panel` (`hidden` while closed, always rendered). Escape is not handled (APG does not require it), and opening never moves focus. `hiddenUntilFound` makes a closed panel `hidden="until-found"` so find-in-page and `#fragment` links reveal it; it is off by default. A panel that is shown from a breakpoint without JavaScript is not supported (use `NavigationMenu` when it exists, or your own CSS). The hook is `useDisclosure`, with the flat exports `DisclosureRoot`, `DisclosureTrigger` and `DisclosurePanel`.
- `Accordion` is a namespace: `Root`, `Item` (owns one disclosure's state), `Heading` (`level` required, `h1` to `h6`), `Trigger` and `Panel` (`region` opt-in). Items are independent, and every trigger is a Tab stop: APG's optional arrow keys, Home and End are not adopted. `useAccordion` returns the classes, and `useDisclosure` is the behaviour. Flat exports `AccordionRoot`, `AccordionItem`, `AccordionHeading`, `AccordionTrigger` and `AccordionPanel`.
- Theme: `kv-disclosure-trigger`, `kv-disclosure-panel`, `kv-disclosure-icon`, `kv-accordion`, `kv-accordion-item`, `kv-accordion-heading`, `kv-accordion-trigger` and `kv-accordion-panel`, with `data-open`. Quiet text trigger with an underline on hover, hairlines between accordion items, the focus ring, `CanvasText` and `Highlight` in forced colours. No new token or colour pair.
