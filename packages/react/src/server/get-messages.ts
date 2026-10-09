import { createMessageFormat, resolveMessageNamespace } from '@kvirn-ui/core'
import type { ResolvedMessages } from '@kvirn-ui/core'
import type { KvirnMessages, PartialMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'

export interface GetMessagesOptions {
  /** BCP 47 locale for number and date helpers in the messages. Default `'en'`. */
  locale?: string | undefined
  /** A catalog such as `sv`; keys it lacks fall back to built-in `en`. */
  messages?: PartialMessages | undefined
  /** The same zone as `<KvirnProvider timeZone>`. Default `'UTC'`. */
  timeZone?: string | undefined
}

/** The server version of `useMessages`: one namespace from a catalog, in a Server Component. */
export function getMessages<Namespace extends keyof KvirnMessages>(
  namespace: Namespace,
  { locale = 'en', messages, timeZone }: GetMessagesOptions = {},
): ResolvedMessages<KvirnMessages[Namespace]> {
  return resolveMessageNamespace({
    namespace,
    fallback: en[namespace],
    overrides: [messages?.[namespace]],
    format: createMessageFormat({ locale, timeZone: timeZone ?? 'UTC' }),
  })
}
