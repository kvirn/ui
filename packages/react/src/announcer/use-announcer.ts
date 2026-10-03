import type { Announcer, AnnounceOptions } from '@kvirn-ui/core'
import { useContext, useMemo } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { AnnouncerContext } from './announcer-context.ts'

export interface UseAnnouncerResult {
  /**
   * Says `message` in the shared live region. Pass text already resolved from i18n. Returns
   * `true` when it was accepted, and `false` when it was dropped: blank, throttled by `key`, or
   * there is no provider. `key` throttles per key, such as a field's id (default 3000 ms).
   */
  announce: (message: string, options?: AnnounceOptions) => boolean
}

const announceNothing = () => false
const withoutProvider: UseAnnouncerResult = Object.freeze({ announce: announceNothing })

const getAnnounce = (announcer: Announcer): UseAnnouncerResult => ({
  announce: announcer.actions.announce,
})

/** Internal. The one development warning for a missing provider, shared by every caller. */
export function warnAnnouncerMissing(): void {
  warnOnce(
    'announcer-without-provider',
    'useAnnouncer() was used outside a <KvirnProvider>, so announcements are dropped and screen reader users get nothing. Wrap the app in <KvirnProvider>: it renders the live regions.',
  )
}

/**
 * Internal. `useAnnouncer` without the warning, for a component that announces only sometimes
 * (a masked Input): it warns with `warnAnnouncerMissing` when it actually has something to say.
 */
export function useQuietAnnouncer(): UseAnnouncerResult & { isAvailable: boolean } {
  const announcer = useContext(AnnouncerContext)
  return useMemo(
    () => ({
      ...(announcer === null ? withoutProvider : getAnnounce(announcer)),
      isAvailable: announcer !== null,
    }),
    [announcer],
  )
}

/**
 * Announces changes to screen reader users (4.1.3) through the live regions the outermost
 * `KvirnProvider` renders. Call `announce` from an event handler or an effect, never during
 * render. Without a provider it does nothing and warns in development.
 */
export function useAnnouncer(): UseAnnouncerResult {
  const { isAvailable, announce } = useQuietAnnouncer()
  if (!isAvailable) {
    warnAnnouncerMissing()
  }
  return useMemo(() => ({ announce }), [announce])
}
