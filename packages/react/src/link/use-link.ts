import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMemo } from 'react'
import type { FocusEventHandler } from 'react'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { useMessages } from '../provider/use-messages.ts'

/** `aria-current` values. `false` sets nothing. */
export type LinkCurrent = 'page' | 'step' | 'location' | 'date' | 'time' | boolean

export interface UseLinkOptions {
  /** Marks the link as the current item in a set, as `aria-current`. Link doesn't detect it. */
  current?: LinkCurrent | undefined
  /** Mirrors HTML `target`. `'_blank'` adds `rel="noopener noreferrer"`. */
  target?: string | undefined
  /** Your own `rel` tokens, kept. */
  rel?: string | undefined
  /** Per-instance message overrides (ADR-0007). */
  messages?: Partial<KvirnMessages['link']> | undefined
}

/** Spread on an `<a href>` or your router's link. */
export interface LinkPartProps {
  /** The stable part name, for `@kvirn-ui/theme` and your own CSS: `[data-kv='link']`. */
  'data-kv': 'link'
  target?: string
  rel?: string
  'aria-current'?: Exclude<LinkCurrent, boolean> | 'true'
  'data-current'?: ''
  'data-focus-visible'?: ''
  onFocus: FocusEventHandler<HTMLElement>
  onBlur: FocusEventHandler<HTMLElement>
}

export interface UseLinkResult {
  linkProps: LinkPartProps
  isCurrent: boolean
  /** `true` while the link has keyboard (`:focus-visible`) focus. */
  isFocusVisible: boolean
  /** `true` for `target="_blank"`: render `newTabNotice` inside the link. */
  opensInNewTab: boolean
  /** The resolved `link.newTabNotice` text, for example `(öppnas i en ny flik)`. */
  newTabNotice: string
}

const newTabRelTokens = ['noopener', 'noreferrer']

/** Adds `noopener noreferrer` to the consumer's own `rel` tokens, once each. */
function relForNewTab(rel: string | undefined): string {
  const tokens = (rel ?? '').split(/\s+/).filter((token) => token !== '')
  const lowerCaseTokens = new Set(tokens.map((token) => token.toLowerCase()))
  return [...tokens, ...newTabRelTokens.filter((token) => !lowerCaseTokens.has(token))].join(' ')
}

/**
 * A link's behaviour for your own `<a href>` or router link (contract: link.a11y.md).
 *
 * @example
 * const link = useLink({ target: '_blank' })
 * <a href="https://www.digg.se/" {...link.linkProps}>
 *   Digg <span>{link.newTabNotice}</span>
 * </a>
 */
export function useLink({ current, target, rel, messages }: UseLinkOptions = {}): UseLinkResult {
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const linkMessages = useMessages('link', messages)
  const opensInNewTab = target === '_blank'
  const isCurrent = current !== undefined && current !== false
  const ariaCurrent = current === true ? 'true' : current === false ? undefined : current

  const linkProps = useMemo<LinkPartProps>(() => {
    const resolvedRel = opensInNewTab ? relForNewTab(rel) : rel
    return {
      'data-kv': 'link',
      ...(target === undefined ? {} : { target }),
      ...(resolvedRel === undefined ? {} : { rel: resolvedRel }),
      ...(ariaCurrent === undefined ? {} : { 'aria-current': ariaCurrent }),
      ...(isCurrent ? { 'data-current': '' } : {}),
      ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
      ...focusVisibleProps,
    }
  }, [target, rel, opensInNewTab, ariaCurrent, isCurrent, isFocusVisible, focusVisibleProps])

  return {
    linkProps,
    isCurrent,
    isFocusVisible,
    opensInNewTab,
    newTabNotice: linkMessages.newTabNotice,
  }
}
