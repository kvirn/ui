# KvirnUI

**Headless, accessible React components, built for public services in the Nordics and the EU.**

KvirnUI is a spiritual successor to Headless UI and Tailwind Plus, built on the TanStack way of working: a typed headless core, and you own the markup. Every component targets **WCAG 2.2 AA** as a floor, not a goal. The aim is to be the best-in-class accessible component library for municipalities and public-sector teams in Sweden, Finland, Norway and the rest of the EU.

→ [kvirn-ui.com](https://kvirn-ui.com)

> Status: pre-alpha. APIs will change. See [docs/roadmap.md](docs/roadmap.md).

## Why KvirnUI

- **Accessible by default.** WCAG 2.2 AA, EN 301 549 and the EAA are the baseline. Every component ships with a documented accessibility contract, automated axe checks and a manual screen reader test record.
- **Headless, with you in control.** Behaviour, state, focus management and ARIA come from us. Markup and styling come from you. Hooks for full control and thin components for convenience.
- **Easy to theme.** State is exposed through `data-*` attributes and design tokens are CSS custom properties. Use Tailwind, CSS Modules or plain CSS. An optional default theme passes contrast checks in light, dark and forced-colors modes.
- **Built for Nordic public services.** Swedish, Finnish, Norwegian (Bokmål and Nynorsk), Northern Sámi and English strings ship as standard. Blocks cover real public-sector patterns such as e-service forms, accessibility statements and consent.
- **Compliance you can hand to procurement.** Each release comes with a per-component conformance report, an SBOM and no telemetry. Licensed MIT.

## Packages

| Package             | Purpose                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `@kvirn-ui/core`    | Framework-agnostic state machines, focus and keyboard logic (TypeScript)     |
| `@kvirn-ui/react`   | Headless React hooks and components                                          |
| `@kvirn-ui/i18n`    | Locale strings for sv, fi, nb, nn, se and en                                 |
| `@kvirn-ui/theme`   | Optional tokens, default theme and Tailwind preset                           |
| `@kvirn-ui/blocks`  | Copy-in styled patterns for public-sector UIs (the Tailwind Plus equivalent) |
| `@kvirn-ui/testing` | a11y test helpers for Vitest and Playwright                                  |

## Quick look

```tsx
import { Disclosure } from '@kvirn-ui/react'

export function Faq() {
  return (
    <Disclosure.Root>
      <Disclosure.Trigger className="faq-trigger">Hur ansöker jag?</Disclosure.Trigger>
      <Disclosure.Panel className="faq-panel data-[state=closed]:hidden">
        Ansök via e-tjänsten …
      </Disclosure.Panel>
    </Disclosure.Root>
  )
}
```

Or use the hook directly:

```tsx
const disclosure = useDisclosure()
<button {...disclosure.getTriggerProps()}>…</button>
<div {...disclosure.getPanelProps()}>…</div>
```

## Development

Requires Node 22+, pnpm 10+ and [Vite+](https://viteplus.dev) (`vp`).

```sh
pnpm install
vp run storybook     # component workbench (apps/storybook)
vp run docs          # docs site (apps/docs, Next.js)
vp check             # format + lint + typecheck
vp test run          # unit + a11y (Vitest + axe)
vp run e2e           # Playwright keyboard/AT flows
```

Project docs: [docs/](docs/README.md). Workflow and rules for humans and agents: [AGENTS.md](AGENTS.md). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © KvirnUI contributors
