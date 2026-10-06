# @kvirn-ui/react

Headless, accessible React hooks and components for the Nordic and EU public sector. You own the markup: each component is a `useX` hook plus `X.Root`, `X.Trigger` and friends, and state is exposed as `data-*` attributes.

```sh
pnpm add @kvirn-ui/react
```

```tsx
import { Button, KvirnProvider } from '@kvirn-ui/react'
import '@kvirn-ui/theme/theme.css' // optional default styles
```

Ships ESM and CommonJS with types for both. Needs React 19 or later. Designed and tested to meet WCAG 2.2 AA.
