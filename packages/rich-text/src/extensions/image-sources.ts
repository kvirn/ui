/**
 * The origins an image may come from (Plan 0036). The default is the page's own origin, plus
 * relative addresses, so a resident's text never loads an image from a third-party server: every
 * reader's browser would fetch it from there (GDPR, and hard rule 7 for the library itself).
 */
export interface ImageSourceOptions {
  /**
   * Origins images may come from, such as `https://bilder.example.se`. The page's own origin and
   * relative addresses are always allowed. `'*'` allows any `http` or `https` address.
   */
  sources?: readonly string[] | undefined
  /** Allow `data:image/…` addresses. Default `false`: they are large and unreviewable. */
  allowBase64?: boolean | undefined
  /** The address relative ones resolve against. Default: the page's own. */
  baseUrl?: string | undefined
}

/**
 * Whether an image address may be used: `https` or `http` from the page's origin or an allowed
 * origin, or a relative address. Anything else (`javascript:`, `blob:`, `file:`, `data:` without
 * `allowBase64`, an unlisted origin, or something that isn't an address) is refused.
 *
 * Reads `location` when called, never at import time (SSR-safe).
 */
export function isAllowedImageSource(
  source: string | null | undefined,
  { sources = [], allowBase64 = false, baseUrl }: ImageSourceOptions = {},
): boolean {
  const trimmed = source?.trim() ?? ''
  if (trimmed === '') {
    return false
  }
  const base = baseUrl ?? (typeof location === 'undefined' ? 'http://localhost/' : location.href)
  let url: URL
  let baseOrigin: string
  try {
    url = new URL(trimmed, base)
    baseOrigin = new URL(base).origin
  } catch {
    return false
  }
  if (url.protocol === 'data:') {
    return allowBase64 && /^data:image\//i.test(trimmed)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return false
  }
  if (url.origin === baseOrigin || sources.includes('*')) {
    return true
  }
  return sources.some((origin) => {
    try {
      return new URL(origin).origin === url.origin
    } catch {
      return false
    }
  })
}
