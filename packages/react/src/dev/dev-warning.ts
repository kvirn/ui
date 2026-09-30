const warnedKeys = new Set<string>()

/**
 * `true` unless the build is a production build. Where nothing replaced `NODE_ENV` and
 * `process` doesn't exist (for example Vitest browser mode), reading it throws a
 * ReferenceError, which means this is not a bundled production build.
 */
export function isDevelopmentBuild(readNodeEnv: () => string | undefined): boolean {
  try {
    return readNodeEnv() !== 'production'
  } catch {
    return true
  }
}

// Kept as the literal `process.env.NODE_ENV`, so the consumer's bundler replaces it.
const isDevelopment = () => isDevelopmentBuild(() => process.env.NODE_ENV)

/**
 * Logs a developer-facing warning once per key, and never in production. Console text for
 * developers only: never shown to or announced for users, so it is not in the catalogs.
 */
export function warnOnce(key: string, message: string): void {
  if (!isDevelopment() || warnedKeys.has(key)) {
    return
  }
  warnedKeys.add(key)
  console.warn(`[KvirnUI] ${message}`)
}

/** Tests only: forget which warnings were already logged. */
export function resetDevWarnings(): void {
  warnedKeys.clear()
}
