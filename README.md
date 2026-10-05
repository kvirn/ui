# KvirnUI

**Headless, accessible React components for public services in the Nordics and the EU.**

A typed headless core with thin React bindings, built the TanStack way: behaviour, state, focus management and ARIA come from KvirnUI, markup and styling come from you. A spiritual successor to Headless UI, for municipalities and public-sector teams in Sweden, Finland, Norway and the rest of the EU. Every component targets **WCAG 2.2 AA** as a floor, not a goal.

→ [ui.kvirn.com](https://ui.kvirn.com)

> Status: pre-alpha. APIs will change. See [docs/roadmap.md](docs/roadmap.md).

## Why KvirnUI

- **Accessible by default.** WCAG 2.2 AA, EN 301 549 and the EAA are the baseline. Every component ships with a documented accessibility contract, automated axe checks and a manual screen reader test record.
- **Headless, with you in control.** Hooks for full control, thin components for convenience.
- **Easy to theme.** State is exposed through `data-*` attributes and design tokens are CSS custom properties, so Tailwind, CSS Modules or plain CSS all work. An optional default theme passes contrast checks in light, dark and forced-colors modes.
- **Built for Nordic public services.** Swedish, Finnish, Norwegian (Bokmål and Nynorsk), Northern Sámi and English strings ship as standard.
- **Compliance you can hand to procurement.** Each release comes with a per-component conformance report, an SBOM and no telemetry. Licensed MIT.

## Packages

| Package               | Purpose                                                                       |
| --------------------- | ----------------------------------------------------------------------------- |
| `@kvirn-ui/core`      | Framework-agnostic state machines, focus and keyboard logic (TypeScript)      |
| `@kvirn-ui/react`     | Headless React hooks and components                                           |
| `@kvirn-ui/rich-text` | Rich text editor on Tiptap (peer dependencies)                                |
| `@kvirn-ui/i18n`      | Locale strings for sv, fi, nb, nn, se and en                                  |
| `@kvirn-ui/theme`     | Optional default theme: one readable `theme.css` you import, override or copy |
| `@kvirn-ui/testing`   | a11y test helpers for Vitest                                                  |
| `@kvirn-ui/blocks`    | Planned: copy-in styled patterns for public-sector UIs                        |

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
vp run test          # Vitest: core, components in a real browser (keyboard, axe) and every story
```

Project docs: [docs/](docs/README.md). Rules for humans and agents: [AGENTS.md](AGENTS.md). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © KvirnUI contributors
