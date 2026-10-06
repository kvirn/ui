# Route focus

> **Draft** (Plan 0055). The accessibility contract is [route-focus.a11y.md](route-focus.a11y.md).

After a client-side navigation a keyboard or screen reader user lands on the new page's title, not on a stale focus position (WCAG 2.4.3, 4.1.3). `useRouteFocus` is a hook only: call it once in the layout, give it the router's location as `key`, and it focuses the page's `h1`.

- It does nothing on the first load, on a hash-only change, when the user is typing in a field, when no target exists (a development warning says so), and on Back or Forward while `history.scrollRestoration` is `'auto'`.
- `tabindex="-1"` is added to the heading just before focus and removed on blur, so it adds no Tab stop.
- `announce` also says "Navigated to {title}" in the shared live region. It is off by default. The text is the `routeFocus.navigated` message.
- The ring shows under `:focus-visible`, as on any element. Keep `scroll-padding-top` above a sticky header.

## Options

```ts
useRouteFocus({
  key, // string: pathname plus search, never the hash
  containerRef, // where to look for the target; the document when absent
  selector: 'h1',
  announce: false,
  messages, // Partial<KvirnMessages['routeFocus']>
})
```

## Next.js (App Router)

Next.js has its own route announcer, so leave `announce` off. Put the hook in a client wrapper in the root layout.

```tsx
'use client'
import { useRouteFocus } from '@kvirn-ui/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRef } from 'react'

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: search === '' ? pathname : `${pathname}?${search}`, containerRef: mainRef })
  return <main ref={mainRef}>{children}</main>
}
```

## TanStack Router

TanStack Router has no announcer: turn `announce` on, and set `scrollRestoration` on the router so Back and Forward keep the browser's behaviour.

```tsx
import { useRouteFocus } from '@kvirn-ui/react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { useRef } from 'react'

function Root() {
  const key = useRouterState({
    select: (state) => state.location.pathname + state.location.searchStr,
  })
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key, containerRef: mainRef, announce: true })
  return (
    <main ref={mainRef}>
      <Outlet />
    </main>
  )
}
```

Set `document.title` before the key changes, or the announcement reads the old title.

## Without a router library

```tsx
function useLocationKey() {
  const [key, setKey] = useState(() => location.pathname + location.search)
  useEffect(() => {
    const update = () => setKey(location.pathname + location.search)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  return [key, setKey] as const
}
```

Call `history.pushState(...)` and then `setKey(location.pathname + location.search)` on a link click.
