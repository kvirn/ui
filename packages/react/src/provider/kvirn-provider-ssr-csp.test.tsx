import { colorSchemeAttribute, contrastAttribute, themeStorageKey } from '@kvirn-ui/core'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, test } from 'vite-plus/test'
import { CspApp } from './kvirn-provider-ssr-csp.app.tsx'
import type { CspHydrationReport } from './kvirn-provider-ssr-csp.entry.tsx'

// A test-only Vite middleware (tooling/vite-preset/csp-fixture.ts) serves the server-rendered app
// with a real CSP response header and a nonce; an iframe loads and hydrates it. Chromium empties a
// script's `nonce` attribute only for a header CSP, never a <meta> one, so only this reaches that path.

let frame: HTMLIFrameElement | undefined

afterEach(() => {
  frame?.remove()
  localStorage.clear()
})

test('under a header CSP with a nonce the theme script runs and hydration is clean', async () => {
  localStorage.setItem(themeStorageKey, JSON.stringify({ colorScheme: 'dark', contrast: 'more' }))
  const nonce = 'r4nd0mHeaderNonce'
  const html = `<!doctype html><html lang="sv"><head>
<meta charset="utf-8"><meta name="csp-nonce" content="${nonce}"></head>
<body><div id="root">${renderToString(<CspApp nonce={nonce} />)}</div>
<script>document.documentElement.setAttribute('data-unnonced', 'ran')</script>
<script type="module" nonce="${nonce}" src="/packages/react/src/provider/kvirn-provider-ssr-csp.entry.tsx"></script>
</body></html>`
  await fetch('/__csp-fixture', { method: 'POST', body: JSON.stringify({ nonce, html }) })

  const element = document.createElement('iframe')
  element.src = `/__csp-fixture?nonce=${nonce}`
  const loaded = new Promise((resolve) => element.addEventListener('load', resolve, { once: true }))
  document.body.append(element)
  frame = element
  await loaded
  const frameWindow = element.contentWindow as Window & { cspHydrationReport?: CspHydrationReport }
  const frameDocument = element.contentDocument!
  const frameRoot = frameDocument.documentElement

  await expect.poll(() => frameWindow.cspHydrationReport?.hydrated).toBe(true)
  await expect
    .poll(() => frameDocument.querySelector<HTMLInputElement>('input[value="dark"]')?.checked)
    .toBe(true)

  // The same script without the nonce is blocked, so the policy is in force.
  expect(frameRoot.hasAttribute('data-unnonced')).toBe(false)
  expect(frameRoot.getAttribute(colorSchemeAttribute)).toBe('dark')
  expect(frameRoot.getAttribute(contrastAttribute)).toBe('more')
  expect(frameWindow.cspHydrationReport).toEqual({
    themeScriptNonce: { attribute: '', property: nonce },
    recoverableErrors: [],
    consoleErrors: [],
    pageErrors: [],
    hydrated: true,
  })
})
