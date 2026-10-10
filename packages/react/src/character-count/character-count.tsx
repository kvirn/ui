'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { ReactElement } from 'react'
import { Icon } from '../icon/icon.tsx'
import { mergeProps } from '../merge-props/merge-props.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useCharacterCount } from './use-character-count.ts'

const characterCountTags = ['p', 'div', 'span'] as const

interface CharacterCountOwnProps {
  /** The count writes its own text. */
  children?: never
  /** The text the count is about: the value of your box. */
  value: string
  /** The most characters the text may have. At least 1. */
  limit: number
  /**
   * Counts a text your own way, such as the way your server does, so both agree. Default: the
   * characters the user sees (grapheme clusters, so `å` and an emoji are one each, and a line
   * break is one).
   */
  countCharacters?: ((value: string) => number) | undefined
  /** A share of the limit from `0` to `1`, from which the count is announced. Default `0.8`. */
  announceFrom?: number | undefined
  /**
   * How long typing must pause before the count is announced, in milliseconds. Default 500.
   * Crossing the limit is announced at once.
   */
  announcementDebounceMilliseconds?: number | undefined
  /**
   * Whether a change to the text may be announced. Default `true`. Pass whether your box has focus
   * to announce only what the user types, so a text set from code (a restored draft) is silent.
   */
  announceChanges?: boolean | undefined
  /** Per-instance message overrides: `limit`, `remaining` and `over`. */
  messages?: Partial<KvirnMessages['characterCount']> | undefined
}

/** `as` is `p` (default), `div` or `span`. It is plain help text, never a heading. */
export type CharacterCountProps = AsTag<
  (typeof characterCountTags)[number],
  'p',
  CharacterCountOwnProps
>

/**
 * How much room is left in a box with a limit: "Du har 120 tecken kvar." It is a help text
 * (`<p class="kv-field-help-text kv-character-count">`) that goes directly under the control. In a
 * Field it describes the control, so a screen reader reads it on focus, and it is announced
 * through the Announcer from 80% of the limit when typing pauses, and when the limit is crossed.
 * Over the limit is a warning, not an error: it never cuts the text, and your form decides on
 * submit (contract: textarea.a11y.md). `Textarea` renders one for `characterCount`.
 *
 * Outside a Field, give the count an `id` and list it in your control's `aria-describedby`, or a
 * screen reader will not read it with the box. Inside a Field it is listed for you.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Beskriv din situation</Field.Label>
 *   <TextInput value={value} onValueChange={setValue} />
 *   <CharacterCount value={value} limit={1000} />
 * </Field.Root>
 */
export function CharacterCount({
  value,
  limit,
  countCharacters,
  announceFrom,
  announcementDebounceMilliseconds,
  announceChanges,
  messages,
  id,
  as,
  ref,
  ...otherProps
}: CharacterCountProps): ReactElement {
  const characterCount = useCharacterCount({
    value,
    limit,
    countCharacters,
    announceFrom,
    announcementDebounceMilliseconds,
    announceChanges,
    messages,
    id,
    ref,
  })
  return renderPart({
    as: resolveAsTag({ part: 'CharacterCount', as, allowedTags: characterCountTags }),
    defaultElement: 'p',
    partProps: {
      ...mergeProps(otherProps, characterCount.countProps),
      children: (
        <>
          {characterCount.isOver ? <Icon name="warning" size="20" /> : null}
          {characterCount.text}
        </>
      ),
    },
  })
}
CharacterCount.displayName = 'CharacterCount'
