import { createContext, useContext, useMemo, useState } from 'react'
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react'
import type { RegisteredLinkComponent } from '../provider/register.ts'

// Test and story fixture: a minimal client-side router, standing in for Next.js or
// TanStack Router. It changes a pathname in state instead of loading a page.

interface MockRouter {
  pathname: string
  navigate: (href: string) => void
}

const MockRouterContext = createContext<MockRouter | null>(null)

export function MockRouterProvider({
  initialPathname,
  children,
}: {
  initialPathname: string
  children: ReactNode
}) {
  const [pathname, setPathname] = useState(initialPathname)
  const router = useMemo(() => ({ pathname, navigate: setPathname }), [pathname])
  return <MockRouterContext.Provider value={router}>{children}</MockRouterContext.Provider>
}

/** The current pathname of the nearest mock router. */
export function useMockPathname(): string | undefined {
  return useContext(MockRouterContext)?.pathname
}

const isModifiedClick = (event: MouseEvent) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

/**
 * Like a framework's Link: forwards its ref, renders an `<a href>`, and handles plain
 * same-tab clicks itself. `data-router-link` shows that it rendered.
 */
export function MockRouterLink({
  children,
  href,
  onClick,
  ref,
  ...anchorProps
}: ComponentPropsWithRef<'a'>) {
  const router = useContext(MockRouterContext)
  return (
    <a
      {...anchorProps}
      href={href}
      ref={ref}
      data-router-link=""
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          router === null ||
          href === undefined ||
          isModifiedClick(event) ||
          (anchorProps.target !== undefined && anchorProps.target !== '_self')
        ) {
          return
        }
        event.preventDefault()
        router.navigate(href)
      }}
    >
      {children}
    </a>
  )
}

/** A component that ignores its ref and renders a `<span>`: what a registered link must not do. */
export function BrokenLinkComponent({ children }: ComponentPropsWithRef<'a'>) {
  return <span>{children}</span>
}

/**
 * Inside the library's own type program nothing augments `Register`, so the registered
 * type is `'a'`. An app's augmentation (`linkComponent: typeof NextLink`) makes its router
 * link assignable. The fixtures stand in for that augmentation here, and only here.
 */
export const mockRouterLinkComponent = MockRouterLink as unknown as RegisteredLinkComponent
export const brokenLinkComponent = BrokenLinkComponent as unknown as RegisteredLinkComponent
