const warnedKeys = new Set<string>()

/**
 * `true` unless the build is a production build. Where nothing replaced `NODE_ENV` and
 * `process` doesn't exist (for example Vitest browser mode), reading it throws a
 * ReferenceError, which means this is not a bundled production build.
 */
function isDevelopmentBuild(): boolean {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return true
  }
}

/**
 * Logs a developer-facing warning once per key, and never in production. Console text for
 * developers only: never shown to or announced for users. The same tiny helper as
 * `@kvirn-ui/react`'s `warnOnce`, duplicated here because `core` takes no dependency on React
 * (rule 3): a DOM-walking helper such as `collectText` still needs to warn.
 */
export function warnOnce(key: string, message: string): void {
  if (!isDevelopmentBuild() || warnedKeys.has(key)) {
    return
  }
  warnedKeys.add(key)
  console.warn(`[KvirnUI] ${message}`)
}

/** Tests only: forget which warnings were already logged. */
export function resetDevWarnings(): void {
  warnedKeys.clear()
}
