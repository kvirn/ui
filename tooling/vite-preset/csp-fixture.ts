import type { Plugin } from 'vite-plus'

/**
 * Test-only: serves an HTML page with a real `Content-Security-Policy` response header. A test
 * POSTs `{ nonce, html }` to `/__csp-fixture` and loads `GET /__csp-fixture?nonce=…` in an iframe.
 */
export function cspFixturePlugin(): Plugin {
  const pages = new Map<string, string>()
  return {
    name: 'kvirn-csp-fixture',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__csp-fixture', (request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost')
        if (request.method === 'POST') {
          let body = ''
          request.on('data', (chunk) => (body += chunk))
          request.on('end', () => {
            const { nonce, html } = JSON.parse(body) as { nonce: string; html: string }
            pages.set(nonce, html)
            response.statusCode = 204
            response.end()
          })
          return
        }
        const nonce = url.searchParams.get('nonce') ?? ''
        const html = pages.get(nonce)
        if (html === undefined) {
          response.statusCode = 404
          response.end()
          return
        }
        response.setHeader(
          'Content-Security-Policy',
          `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'self'`,
        )
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(html)
      })
    },
  }
}
