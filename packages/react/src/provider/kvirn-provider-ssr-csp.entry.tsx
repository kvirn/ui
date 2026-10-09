import { hydrateRoot } from 'react-dom/client'
import { CspApp } from './kvirn-provider-ssr-csp.app.tsx'

export interface CspHydrationReport {
  themeScriptNonce: { attribute: string | null; property: string }
  recoverableErrors: string[]
  consoleErrors: string[]
  pageErrors: string[]
  hydrated: boolean
}

// The page's client entry. Under a header CSP the `nonce` attribute reads back empty, so the nonce
// comes from a <meta>, as the docs app reads `x-nonce`.
// Read before hydrating: once hydrated, the client render drops the theme script from the DOM.
const themeScript = document.querySelector<HTMLScriptElement>('#root script')!
const report: CspHydrationReport = {
  themeScriptNonce: { attribute: themeScript.getAttribute('nonce'), property: themeScript.nonce },
  recoverableErrors: [],
  consoleErrors: [],
  pageErrors: [],
  hydrated: false,
}
Object.assign(window, { cspHydrationReport: report })

const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  report.consoleErrors.push(args.map(String).join(' '))
  originalConsoleError(...args)
}
window.addEventListener('error', (event) => report.pageErrors.push(event.message))

const nonce = document.querySelector('meta[name="csp-nonce"]')!.getAttribute('content')!
hydrateRoot(document.getElementById('root')!, <CspApp nonce={nonce} />, {
  onRecoverableError: (error) => report.recoverableErrors.push(String(error)),
})
report.hydrated = true
