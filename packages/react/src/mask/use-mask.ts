import type { Mask, MaskAttributes } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useContext, useId, useMemo, useRef } from 'react'
import type {
  ChangeEvent,
  ChangeEventHandler,
  CompositionEvent,
  CompositionEventHandler,
  FocusEventHandler,
  RefCallback,
} from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { FieldContext } from '../field/field-context.ts'
import type { InputChangeDetails } from '../input/use-input.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'

export interface UseMaskOptions {
  /** A preset from `masks`, such as `masks.digits()`, or your own: `masks.pattern()` or `masks.regexp()`. */
  mask: Mask
  /**
   * Called with the masked value on every change, with `{ reason: 'input', event }` and the mask
   * details: `unmaskedValue`, `isComplete`, `isWithinRange` (number masks) and `rejected`. It
   * only reports: the value lives in your form state, or in the native input.
   */
  onValueChange?: ((value: string, details: InputChangeDetails) => void) | undefined
  /**
   * Announce, politely and at most once every few seconds per field, when the mask drops
   * characters (4.1.3). Default `true`. Turn it off when you show your own message. Needs a
   * `KvirnProvider`: without one nothing is announced.
   */
  announceRejections?: boolean | undefined
  /** Per-instance message overrides for the rejection announcements. */
  messages?: Partial<KvirnMessages['mask']> | undefined
}

/**
 * Spread on the `<input>`. The attributes are the preset's suggestions: put your own props after
 * these in `mergeProps(mask.inputProps, ownProps)`, so yours win. The handlers chain.
 */
export interface MaskInputPartProps {
  inputMode?: NonNullable<MaskAttributes['inputMode']>
  autoCapitalize?: NonNullable<MaskAttributes['autoCapitalize']>
  spellCheck?: boolean
  /** `ltr` for identifiers, which stay left to right in a right-to-left page. */
  dir?: NonNullable<MaskAttributes['dir']>
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLInputElement>
  onCompositionStart: CompositionEventHandler<HTMLInputElement>
  onCompositionEnd: CompositionEventHandler<HTMLInputElement>
  /** Tracks the value before each edit, to tell what the user inserted. */
  ref: RefCallback<HTMLInputElement>
}

export interface UseMaskResult {
  inputProps: MaskInputPartProps
  /** Formats a stored (unmasked) value for display, in the provider's locale. */
  format: (unmaskedValue: string) => string
  /** Strips the literals from a formatted value, in the provider's locale. */
  unmask: (value: string) => string
}

/** Internal. `mask` may be `undefined` so `Input` can call the hook without a mask. */
export interface UseMaskInternalOptions extends Omit<UseMaskOptions, 'mask'> {
  mask: Mask | undefined
}

/**
 * Autofill and password managers send an `input` event without an inputType, or with
 * `insertReplacementText`: the whole value counts as inserted, not a diff against the old one.
 */
function readInputType(event: ChangeEvent<HTMLInputElement>): string | undefined {
  const nativeEvent: Event = event.nativeEvent
  return 'inputType' in nativeEvent && typeof nativeEvent.inputType === 'string'
    ? nativeEvent.inputType
    : undefined
}

function isComposingEvent(event: ChangeEvent<HTMLInputElement>): boolean {
  const nativeEvent: Event = event.nativeEvent
  return 'isComposing' in nativeEvent && nativeEvent.isComposing === true
}

/** Internal. The implementation behind `useMask`, which also accepts no mask. */
export function useMaskedInput({
  mask,
  onValueChange,
  announceRejections = true,
  messages,
}: UseMaskInternalOptions): UseMaskResult {
  const field = useContext(FieldContext)
  const generatedId = useId()
  const throttleKey = field?.controlProps.id ?? generatedId
  const { locale } = useLocale()
  const maskMessages = useMessages('mask', messages)
  // Quiet: only a rejection that can't be announced warns, so a mask with no rejections or with
  // `announceRejections={false}` doesn't make noise without a provider.
  const { announce, isAvailable } = useQuietAnnouncer()
  const localizedMask = useMemo(() => mask?.withLocale(locale), [mask, locale])

  /** The value before the edit in progress. Without it the whole value counts as inserted. */
  const previousValue = useRef<string | undefined>(undefined)
  const isComposing = useRef(false)

  const hasMask = mask !== undefined
  const ref = useCallback<RefCallback<HTMLInputElement>>(
    (element) => {
      // No mask, nothing to track: an unmasked Input pays nothing for the hook.
      if (element === null || !hasMask) {
        return undefined
      }
      previousValue.current = element.value
      // React's onBeforeInput is the legacy `textInput` event, which doesn't fire for deletions.
      const rememberValue = (event: InputEvent) => {
        if (!isComposing.current && !event.isComposing) {
          previousValue.current = element.value
        }
      }
      element.addEventListener('beforeinput', rememberValue)
      return () => {
        element.removeEventListener('beforeinput', rememberValue)
      }
    },
    [hasMask],
  )

  const handleChange = useCallback(
    (
      event: ChangeEvent<HTMLInputElement> | CompositionEvent<HTMLInputElement>,
      inputType: string | undefined,
    ) => {
      if (localizedMask === undefined) {
        return
      }
      const element = event.currentTarget
      const isAutofill = inputType === undefined || inputType === 'insertReplacementText'
      const before = isAutofill ? undefined : previousValue.current
      const result = localizedMask.apply({
        value: element.value,
        selectionStart: element.selectionStart,
        selectionEnd: element.selectionEnd,
        ...(before === undefined ? {} : { previousValue: before }),
        ...(inputType === undefined ? {} : { inputType }),
      })

      // Write back only when the mask changed the value: plain typing keeps the undo history.
      if (result.isChanged) {
        element.value = result.value
        // An email input has no selection API: the browser keeps the caret at the end.
        if (element.selectionStart !== null) {
          element.setSelectionRange(result.selectionStart, result.selectionEnd)
        }
      }
      previousValue.current = element.value

      if (announceRejections && result.rejected.length > 0) {
        // Say why a character was refused before saying the field is full.
        const reported = result.rejected.find((rejection) => rejection.reason !== 'length')
        const message =
          reported === undefined || reported.reason === 'length'
            ? maskMessages.maximumLength({ length: result.unmaskedValue.length })
            : maskMessages.characterNotAllowed({ allowed: reported.reason })
        if (isAvailable) {
          announce(message, { key: throttleKey })
        } else {
          warnAnnouncerMissing()
        }
      }

      onValueChange?.(result.value, {
        reason: 'input',
        event,
        unmaskedValue: result.unmaskedValue,
        isComplete: result.isComplete,
        ...(result.isWithinRange === undefined ? {} : { isWithinRange: result.isWithinRange }),
        rejected: result.rejected,
      })
    },
    [
      localizedMask,
      announceRejections,
      maskMessages,
      announce,
      isAvailable,
      throttleKey,
      onValueChange,
    ],
  )

  const inputProps = useMemo<MaskInputPartProps>(
    () => ({
      ...(localizedMask?.attributes.inputMode === undefined
        ? {}
        : { inputMode: localizedMask.attributes.inputMode }),
      ...(localizedMask?.attributes.autoCapitalize === undefined
        ? {}
        : { autoCapitalize: localizedMask.attributes.autoCapitalize }),
      ...(localizedMask?.attributes.spellCheck === undefined
        ? {}
        : { spellCheck: localizedMask.attributes.spellCheck }),
      ...(localizedMask?.attributes.dir === undefined ? {} : { dir: localizedMask.attributes.dir }),
      ref,
      onFocus: (event) => {
        previousValue.current = event.currentTarget.value
      },
      onCompositionStart: (event) => {
        // The value before the composition is what the composed text is compared with.
        previousValue.current = event.currentTarget.value
        isComposing.current = true
      },
      onCompositionEnd: (event) => {
        isComposing.current = false
        handleChange(event, 'insertCompositionText')
      },
      onChange: (event) => {
        if (localizedMask === undefined) {
          return
        }
        if (isComposing.current || isComposingEvent(event)) {
          // Never rewrite mid-composition (5.5). A controlled field still has to follow the raw
          // value, or React would put the old one back and break the composition.
          onValueChange?.(event.currentTarget.value, { reason: 'input', event })
          return
        }
        handleChange(event, readInputType(event))
      },
    }),
    [localizedMask, ref, handleChange, onValueChange],
  )

  return {
    inputProps,
    format: (unmaskedValue) => localizedMask?.format(unmaskedValue) ?? unmaskedValue,
    unmask: (value) => localizedMask?.unmask(value) ?? value,
  }
}

/**
 * Shapes what the user types into your own `<input>` with a mask: drops characters
 * that don't fit, inserts separators as the user types past them, and never rewrites during an
 * IME composition. The input stays native, so paste, autofill and undo keep working. Rejected
 * characters are announced (4.1.3), and the value is never clamped or corrected.
 *
 * The hook holds no value. Spread `inputProps` after your form library's props, and put the
 * format in a visible hint (3.3.2).
 *
 * @example
 * const caseNumber = useMask({ mask: masks.pattern('aa-9999'), onValueChange: setValue })
 * <input {...mergeProps(caseNumber.inputProps, { name: 'caseNumber' })} />
 */
export function useMask(options: UseMaskOptions): UseMaskResult {
  return useMaskedInput(options)
}
