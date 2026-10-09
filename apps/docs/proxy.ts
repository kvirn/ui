import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Opt-in (DOCS_CSP_NONCE=1): a nonce needs dynamic rendering, so the default build stays static.
// It exists to prove KvirnThemeScript and hydration under a real header CSP.
const enabled = process.env.DOCS_CSP_NONCE === '1'

export function proxy(request: NextRequest) {
  if (!enabled) return NextResponse.next()

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', policy)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', policy)
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }],
    },
  ],
}
