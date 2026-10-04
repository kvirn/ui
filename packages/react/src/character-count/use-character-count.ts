import { announcementDebounceMilliseconds, getCharacterCount } from '@kvirn-ui/core'
import type { CharacterCountResult } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useContext, useEffect, useId, useMemo, useRef } from 'react'
import type { Ref, RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { useDescriptionPart } from '../field/use-description-part.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseCharacterCountOptions {
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
   * Whether a change to the text may be announced. Default `true`. Pass whether the box has focus
   * to announce only what the user types: a text set from code (a restored draft) is then silent.
   * `Textarea` does so.
   */
  announceChanges?: boolean | undefined
  /** Per-instance message overrides. */
  messages?: Partial<KvirnMessages['characterCount']> | undefined
  /**
   * The count's id when it is not in a Field (also directly in a Fieldset): list it in your
   * control's `aria-describedby`. Inside a Field the Field gives the id, so the control lists it.
   * Default: a generated one.
   */
  id?: string | undefined
  /** The element's ref. Pass it here: the hook also needs the element. */
  ref?: Ref<HTMLParagraphElement> | undefined
}

/** Spread on the `<p>`. */
export interface CharacterCountPartProps extends FieldStateAttributes {
  /** The help text's class and the count's own: `.kv-field-help-text .kv-character-count`. */
  className: 'kv-field-help-text kv-character-count'
  /** Inside a Field, the Field's id for this description. Otherwise `id`, or a generated one. */
  id: string
  /** Over the limit. The theme adds weight and an icon, so it never rests on colour alone. */
  'data-over'?: ''
  /** From the announce threshold, and over the limit. */
  'data-near'?: ''
  ref: RefCallback<HTMLParagraphElement>
}

export interface UseCharacterCountResult {
  countProps: CharacterCountPartProps
  /** The maths: `length`, `remaining`, `excess`, `isOver`, `isNear` and `isEmpty`. */
  count: CharacterCountResult
  /** What the count says now, from the messages: the limit, how many remain, or how many are over. */
  text: string
  isOver: boolean
}

/**
 * A character count's props and text for your own element (contract: textarea.a11y.md). Inside a
 * Field it registers as one of the control's descriptions, in DOM order, so a screen reader reads
 * it when the control gets focus. It is not a live region: it announces through the shared
 * Announcer, politely, from 80% of the limit when typing pauses, and at once when the text
 * crosses the limit. It never cuts or refuses the text.
 *
 * @example
 * const count = useCharacterCount({ value, limit: 500 })
 * <p {...count.countProps}>{count.text}</p>
 */
export function useCharacterCount({
  value,
  limit,
  countCharacters,
  announceFrom,
  announcementDebounceMilliseconds: debounceOption,
  announceChanges = true,
  messages,
  id,
  ref,
}: UseCharacterCountOptions): UseCharacterCountResult {
  const characterMessages = useMessages('characterCount', messages)
  const { announce, isAvailable } = useQuietAnnouncer()
  // Only a Field's control is described by a count. A Fieldset around the box is no host for it
  // (its description is the group's), so outside a Field the count keeps its own `id`.
  const field = useContext(FieldContext)
  const description = useDescriptionPart<HTMLParagraphElement>(ref, field !== null)
  const ownId = useId()

  const count = useMemo(
    () => getCharacterCount({ value, limit, countCharacters, announceFrom }),
    [value, limit, countCharacters, announceFrom],
  )
  let text: string
  if (count.isEmpty) {
    text = characterMessages.limit({ limit: count.limit })
  } else if (count.isOver) {
    text = characterMessages.over({ count: count.excess })
  } else {
    text = characterMessages.remaining({ count: count.remaining })
  }

  useEffect(() => {
    if (!Number.isFinite(limit) || limit < 1) {
      warnOnce(
        'character-count-invalid-limit',
        `A character count got limit={${String(limit)}}. It needs a whole number of at least 1, or it says every text is over the limit. Pass the limit the form allows.`,
      )
    }
  }, [limit])

  // The announcing effect reads the newest text and announcer without restarting its timer.
  const latest = useRef({ text, value, announce, isAvailable, announceChanges })
  useEffect(() => {
    latest.current = { text, value, announce, isAvailable, announceChanges }
  })
  const previousLength = useRef<number | undefined>(undefined)
  const lastAnnounced = useRef('')
  const { length } = count
  useEffect(() => {
    const previous = previousLength.current
    previousLength.current = length
    // The first render says nothing: a screen reader reads the count when the box gets focus.
    if (previous === undefined || previous === length) {
      return undefined
    }
    const { announce: when } = getCharacterCount({
      value: latest.current.value,
      limit,
      // The length is known: don't segment the text again.
      countCharacters: () => length,
      announceFrom,
      previousLength: previous,
    })
    if (when === 'none') {
      lastAnnounced.current = ''
      return undefined
    }
    const say = () => {
      const newest = latest.current
      // A change made while the user is not working in the box (a text set from code) is silent.
      if (!newest.announceChanges || newest.text === lastAnnounced.current) {
        return
      }
      if (!newest.isAvailable) {
        warnAnnouncerMissing()
        return
      }
      lastAnnounced.current = newest.text
      newest.announce(newest.text)
    }
    if (when === 'now') {
      say()
      return undefined
    }
    // Typing on restarts the pause: the effect's cleanup clears it.
    const timer = setTimeout(say, debounceOption ?? announcementDebounceMilliseconds)
    return () => {
      clearTimeout(timer)
    }
  }, [length, limit, announceFrom, debounceOption])

  const countProps: CharacterCountPartProps = {
    // The host's state attributes first, then the part's own: never the host's `kv-prose` class.
    ...description.partProps,
    className: 'kv-field-help-text kv-character-count',
    id: description.partProps.id ?? id ?? ownId,
    ...(count.isOver ? { 'data-over': '' as const } : {}),
    ...(count.isNear ? { 'data-near': '' as const } : {}),
    ref: description.ref,
  }

  return { countProps, count, text, isOver: count.isOver }
}
