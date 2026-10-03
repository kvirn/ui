import { getLanguage, resolveMessageNamespace } from '@kvirn-ui/core'
import type { MessageResolutionIssue, ResolvedMessages } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { useContext } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { KvirnConfigContext } from './provider-context.ts'

const builtInMessages: KvirnMessages = en

/**
 * Internal. Resolves one namespace: instance `messages`, then the nearest provider and its
 * ancestors, then built-in `en`. Text parts add their children on top.
 *
 * @example const linkMessages = useMessages('link', props.messages)
 */
export function useMessages<Namespace extends keyof KvirnMessages>(
  namespace: Namespace,
  instanceMessages?: Partial<KvirnMessages[Namespace]>,
): ResolvedMessages<KvirnMessages[Namespace]> {
  const { locale, messageLayers, format } = useContext(KvirnConfigContext)

  const reportIssue = ({ type, key }: MessageResolutionIssue) => {
    const path = `${namespace}.${key}`
    if (type === 'empty-override') {
      warnOnce(
        `empty-override:${path}`,
        `Message "${path}" is empty in an override, so it falls through to the next level. An empty string would leave an empty accessible name.`,
      )
    } else if (getLanguage(locale) !== 'en') {
      warnOnce(
        `fallback:${path}`,
        `Message "${path}" has no translation for locale "${locale}", so the built-in English text is used. Pass a catalog, for example <KvirnProvider messages={sv}>.`,
      )
    }
  }

  return resolveMessageNamespace({
    namespace,
    fallback: builtInMessages[namespace],
    overrides: [instanceMessages, ...messageLayers.map((layer) => layer[namespace])],
    format,
    reportIssue,
  })
}
