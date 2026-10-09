import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { vi } from 'vite-plus/test'
import type { ReactNode } from 'react'

/** Server-renders `app` into a container in the page, as the browser would have parsed it. */
export function serverRender(app: ReactNode) {
  const container = document.createElement('div')
  container.innerHTML = renderToString(app)
  document.body.append(container)
  return container
}

/** Hydrates `container` and records what React reports. */
export function hydrate(container: Element, app: ReactNode) {
  const recoverableErrors: unknown[] = []
  const consoleError = vi.spyOn(console, 'error')
  const root = hydrateRoot(container, app, {
    onRecoverableError: (error) => {
      recoverableErrors.push(error)
    },
  })
  return { root, recoverableErrors, consoleError }
}

/** The inline scripts of server HTML don't run on `innerHTML`: run them as the parser would. */
export function runInlineScripts(container: Element) {
  for (const original of container.querySelectorAll('script')) {
    const script = document.createElement('script')
    script.textContent = original.textContent
    document.head.append(script)
    script.remove()
  }
}
