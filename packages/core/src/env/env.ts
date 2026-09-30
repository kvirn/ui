/**
 * Everything `core` knows about the host page. Components receive it instead of
 * reading globals, so they stay SSR-safe, testable and work inside iframes (ADR-0003).
 */
export interface Env {
  readonly window: Window & typeof globalThis
  readonly document: Document
}

/**
 * The page's own window and document, or `undefined` during server rendering.
 * Resolved on call, never at module scope.
 */
export function getDefaultEnv(): Env | undefined {
  const hostWindow = globalThis.window as (Window & typeof globalThis) | undefined
  if (hostWindow === undefined) {
    return undefined
  }
  return { window: hostWindow, document: hostWindow.document }
}
