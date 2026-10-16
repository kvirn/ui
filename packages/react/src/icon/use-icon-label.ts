import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useMessages } from '../provider/use-messages.ts'

type IconMessages = KvirnMessages['icons']

type CamelToKebab<Name extends string> = Name extends `${infer Head}${infer Tail}`
  ? `${Head extends Lowercase<Head> ? Head : `-${Lowercase<Head>}`}${CamelToKebab<Tail>}`
  : Name

/** The library icons that have a label: the kebab-case names of the `icons` messages. */
export type IconLabelName = CamelToKebab<Extract<keyof IconMessages, string>>

/**
 * The localized label of a library icon that stands alone, for `<Icon label>`. Messages come from
 * `messages`, then the provider, then built-in English. An icon without a label key, because text
 * beside it always names it, returns `undefined` and stays decorative. Never pass it for an icon
 * next to the same words (contract: icon.a11y.md).
 *
 * @example
 * <Icon name="city-hall" size="24" label={useIconLabel('city-hall')} />
 */
export function useIconLabel(
  name: IconLabelName,
  instanceMessages?: Partial<IconMessages>,
): string | undefined {
  const iconMessages = useMessages('icons', instanceMessages)
  const key = name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
  return Object.hasOwn(iconMessages, key)
    ? String(iconMessages[key as keyof IconMessages])
    : undefined
}
