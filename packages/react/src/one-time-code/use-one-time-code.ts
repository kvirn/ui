import { masks } from '@kvirn-ui/core'
import type { Mask } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  ChangeEventHandler,
  CompositionEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  ReactEventHandler,
  RefCallback,
} from 'react'
import { FieldContext } from '../field/field-context.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import type { InputChangeDetails } from '../input/use-input.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useMask } from '../mask/use-mask.ts'

/** What a code may contain. Digits by default. */
export type OneTimeCodeCharacters = 'digits' | 'lettersAndDigits'

export interface UseOneTimeCodeOptions {
  /** How many characters the code has: one slot each. Default `6`. The theme draws 4 to 8. */
  length?: number | undefined
  /** `'digits'` (default) or `'lettersAndDigits'`. */
  characters?: OneTimeCodeCharacters | undefined
  /** Controlled: the value from your state. Pass `onValueChange` with it. */
  value?: string | undefined
  /** Uncontrolled: the native input keeps the value, and a form submit sends it. */
  defaultValue?: string | undefined
  /**
   * Called with the masked value on every change, with `{ reason: 'input', event }` and the mask
   * details: `unmaskedValue`, `isComplete` and `rejected`. It only reports (ADR-0029, item 0).
   */
  onValueChange?: ((value: string, details: InputChangeDetails) => void) | undefined
  /**
   * Called with the code when a change leaves it complete and different from before: typing the
   * last character, a paste, an autofill. It never submits and never moves focus (3.2.2). Say in
   * the hint that the code is checked as soon as it's entered, and keep a submit button.
   */
  onComplete?: ((value: string) => void) | undefined
  /** Native `disabled`. A disabled Field disables the input too. */
  disabled?: boolean | undefined
  /** Announce, politely and throttled, when the mask drops a character (4.1.3). Default `true`. */
  announceRejections?: boolean | undefined
  /** Per-instance message overrides for the rejection announcements (ADR-0007). */
  messages?: Partial<KvirnMessages['mask']> | undefined
}

/** One drawn character, the state of its box. */
export interface OneTimeCodeSlotState {
  /** The character, or `''` when the slot is empty. */
  character: string
  isFilled: boolean
  /** The input has focus, nothing is selected, and the caret is at this slot. At most one. */
  isActive: boolean
  /**
   * On the active slot: `'before'` when the caret is before this slot's position (in an empty
   * slot, where the next character goes), `'after'` on the last slot when the code is complete
   * and the caret is after its last character.
   */
  caret: 'before' | 'after' | undefined
  /** The input has focus and its selection covers this slot's character. */
  isSelected: boolean
}

/** Spread on the row: a `<div>` that holds the input and the slots. */
export interface OneTimeCodeRootPartProps {
  /** The part's class: `.kv-one-time-code`. Add your own with `mergeProps`: class names join. */
  className: 'kv-one-time-code'
  /** Every slot is filled. The theme draws nothing for it: complete isn't correct. */
  'data-complete'?: ''
  'data-invalid'?: ''
  'data-disabled'?: ''
  /** The hook is running and has read the input's value. The theme draws the slots only then. */
  'data-ready'?: ''
}

/** Spread on the one `<input>`. */
export interface OneTimeCodeInputPartProps {
  /** From the Field: the control's id, and the ids of its hint and error. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  /** The part's class: `.kv-one-time-code-input`. */
  className: 'kv-one-time-code-input'
  type: 'text'
  autoComplete: 'one-time-code'
  spellCheck: false
  autoCorrect: 'off'
  /** `numeric` for digits. Letters and digits set `autoCapitalize` instead. */
  inputMode?: 'numeric'
  autoCapitalize?: 'characters'
  /** A code stays left to right in a right-to-left page. */
  dir: 'ltr'
  value?: string
  defaultValue?: string
  'data-disabled'?: ''
  'data-invalid'?: ''
  'data-required'?: ''
  'data-focus-visible'?: ''
  ref: RefCallback<HTMLInputElement>
  onChange: ChangeEventHandler<HTMLInputElement>
  onFocus: FocusEventHandler<HTMLInputElement>
  onBlur: FocusEventHandler<HTMLInputElement>
  onSelect: ReactEventHandler<HTMLInputElement>
  onClick: MouseEventHandler<HTMLInputElement>
  onCompositionStart: CompositionEventHandler<HTMLInputElement>
  onCompositionEnd: CompositionEventHandler<HTMLInputElement>
}

/** Spread on each slot: a `<span>` that draws one character. */
export interface OneTimeCodeSlotPartProps {
  /** The part's class: `.kv-one-time-code-slot`. */
  className: 'kv-one-time-code-slot'
  /** A slot is a drawing of the input's value, so assistive technology never sees it. */
  'aria-hidden': 'true'
  'data-filled'?: ''
  'data-active'?: ''
  'data-caret'?: 'before' | 'after'
  'data-selected'?: ''
  'data-invalid'?: ''
}

export interface UseOneTimeCodeResult {
  rootProps: OneTimeCodeRootPartProps
  inputProps: OneTimeCodeInputPartProps
  /** The props for the slot at `index`, from 0 to `length - 1`. */
  getSlotProps: (index: number) => OneTimeCodeSlotPartProps
  /** One entry per character of the code, for rendering the slots. */
  slots: readonly OneTimeCodeSlotState[]
  /** The value the input shows now. */
  value: string
  length: number
  /** Every slot is filled. */
  isComplete: boolean
  /** The hook has started and read the input's value. */
  isReady: boolean
  isInvalid: boolean
  isDisabled: boolean
}

interface FocusAndSelection {
  isFocused: boolean
  start: number
  end: number
}

const unfocused: FocusAndSelection = { isFocused: false, start: 0, end: 0 }

function readSelection(element: HTMLInputElement): FocusAndSelection {
  return { isFocused: true, start: element.selectionStart ?? 0, end: element.selectionEnd ?? 0 }
}

const isSameSelection = (first: FocusAndSelection, second: FocusAndSelection) =>
  first.isFocused === second.isFocused && first.start === second.start && first.end === second.end

/**
 * Runs the mask over the value the input already holds and writes it back only when it changed.
 * Returns the value after. The whole value counts as typed, like an autofill: separators are
 * dropped, characters that don't fit are dropped, and nothing past the length stays hidden.
 */
function normaliseInput(element: HTMLInputElement, mask: Mask): string {
  const result = mask.apply({ value: element.value })
  if (result.isChanged) {
    element.value = result.value
  }
  return element.value
}

/**
 * The index of the slot nearest to a pointer, or `undefined` when the slots aren't drawn (the
 * theme's fallback shows the plain input, and its own caret is right).
 */
function slotIndexAt(input: HTMLInputElement, clientX: number): number | undefined {
  const row = input.closest('.kv-one-time-code') ?? input.parentElement
  if (row === null) {
    return undefined
  }
  const slotElements = [...row.querySelectorAll('.kv-one-time-code-slot')]
  let nearest: { index: number; distance: number } | undefined
  for (const [index, slot] of slotElements.entries()) {
    if (slot.getClientRects().length === 0) {
      return undefined
    }
    const { left, right } = slot.getBoundingClientRect()
    const distance = clientX < left ? left - clientX : clientX > right ? clientX - right : 0
    if (nearest === undefined || distance < nearest.distance) {
      nearest = { index, distance }
    }
  }
  return nearest?.index
}

/**
 * A one-time code's wiring for your own elements (ADR-0033, contract: one-time-code.a11y.md):
 * the props of one native `<input>`, the row, and one slot per character. The slots only draw
 * the input's value, caret and selection: the input stays the one operable element, so SMS
 * autofill, paste, dictation and undo work. The hook moves no focus and submits nothing.
 *
 * @example
 * const oneTimeCode = useOneTimeCode({ length: 6, onComplete: verify })
 * <div {...oneTimeCode.rootProps}>
 *   <input {...oneTimeCode.inputProps} name="code" />
 *   {oneTimeCode.slots.map((slot, index) => (
 *     <span key={index} {...oneTimeCode.getSlotProps(index)}>{slot.character}</span>
 *   ))}
 * </div>
 */
export function useOneTimeCode({
  length = 6,
  characters = 'digits',
  value,
  defaultValue,
  onValueChange,
  onComplete,
  disabled = false,
  announceRejections,
  messages,
}: UseOneTimeCodeOptions = {}): UseOneTimeCodeResult {
  const field = useContext(FieldContext)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const isInvalid = field?.state.isInvalid ?? false
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const controlProps = field?.controlProps

  const mask = useMemo(() => masks.oneTimeCode({ length, characters }), [length, characters])

  const isControlled = value !== undefined
  const inputRef = useRef<HTMLInputElement | null>(null)
  // What the input shows, for drawing. Read from the DOM on mount and whenever the value prop or this state changes, so autofill, a
  // controlled value and a form reset are drawn as they are, never as the hook last heard.
  const [shownValue, setShownValue] = useState(value ?? defaultValue ?? '')
  const [focusAndSelection, setFocusAndSelection] = useState(unfocused)
  const [isReady, setIsReady] = useState(false)
  const previousValue = useRef(shownValue)

  const updateFocusAndSelection = useCallback((next: FocusAndSelection) => {
    setFocusAndSelection((current) => (isSameSelection(current, next) ? current : next))
  }, [])

  const handleValueChange = useCallback(
    (nextValue: string, details: InputChangeDetails) => {
      setShownValue(nextValue)
      updateFocusAndSelection(readSelection(details.event.currentTarget))
      const before = previousValue.current
      previousValue.current = nextValue
      onValueChange?.(nextValue, details)
      if (details.isComplete === true && nextValue !== before) {
        onComplete?.(nextValue)
      }
    },
    [onValueChange, onComplete, updateFocusAndSelection],
  )
  const masked = useMask({
    mask,
    onValueChange: handleValueChange,
    announceRejections,
    messages,
  })
  const { ref: maskRef, ...maskHandlers } = masked.inputProps
  const ref = useMergedRef(maskRef, inputRef)

  // Before paint, so the slots never show a value the input doesn't have. It runs on mount, which
  // reads whatever the browser or a password manager filled in before the script ran, and when
  // `value` changes (a controlled value is on the input by then).
  useLayoutEffect(() => {
    const element = inputRef.current
    if (element === null) {
      return
    }
    if (element.value !== shownValue) {
      previousValue.current = element.value
      setShownValue(element.value)
    }
  }, [shownValue, value])
  // The start: whatever was in the field before the script ran (typed on a slow page, autofilled)
  // goes through the mask, so the boxes never draw a value that has a separator or is too long
  // for them. It is written back only if the mask changed it.
  useLayoutEffect(() => {
    const element = inputRef.current
    if (element !== null) {
      if (isControlled) {
        // A controlled value is the consumer's: draw it as it is.
        setShownValue(element.value)
      } else {
        previousValue.current = normaliseInput(element, mask)
        setShownValue(element.value)
      }
      if (element.ownerDocument.activeElement === element) {
        updateFocusAndSelection(readSelection(element))
      }
    }
    setIsReady(true)
  }, [isControlled, mask, updateFocusAndSelection])

  // A form reset puts the default value back without an input event. It does so after the event
  // has been dispatched, so read the input on the next task.
  useEffect(() => {
    const element = inputRef.current
    const form = element?.form
    if (element === null || element === undefined || form === null || form === undefined) {
      return
    }
    let timer: ReturnType<typeof setTimeout> | undefined
    const readAfterReset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        // The default value comes back as it was written in the markup: through the mask again.
        previousValue.current = isControlled ? element.value : normaliseInput(element, mask)
        setShownValue(element.value)
      }, 0)
    }
    form.addEventListener('reset', readAfterReset)
    return () => {
      clearTimeout(timer)
      form.removeEventListener('reset', readAfterReset)
    }
  }, [isControlled, mask])

  const inputProps: OneTimeCodeInputPartProps = {
    ...controlProps,
    ...(isDisabled ? { disabled: true, 'data-disabled': '' } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' } : {}),
    className: 'kv-one-time-code-input',
    type: 'text',
    autoComplete: 'one-time-code',
    spellCheck: false,
    autoCorrect: 'off',
    ...(characters === 'digits' ? { inputMode: 'numeric' } : { autoCapitalize: 'characters' }),
    dir: 'ltr',
    ...(value === undefined ? {} : { value }),
    ...(defaultValue === undefined ? {} : { defaultValue }),
    ref,
    onChange: maskHandlers.onChange,
    onCompositionStart: maskHandlers.onCompositionStart,
    onCompositionEnd: maskHandlers.onCompositionEnd,
    onFocus: (event) => {
      maskHandlers.onFocus(event)
      focusVisibleProps.onFocus(event)
      updateFocusAndSelection(readSelection(event.currentTarget))
    },
    onBlur: (event) => {
      focusVisibleProps.onBlur(event)
      updateFocusAndSelection(unfocused)
    },
    // React raises it from `selectionchange`, keys and the pointer: every caret or selection move.
    onSelect: (event) => {
      updateFocusAndSelection(readSelection(event.currentTarget))
    },
    // A press on an empty slot puts the caret at the end of the code, and a press on a filled
    // slot before its character. The invisible text's own positions are only approximate, so the
    // press is mapped to the slot, never to the text. A double click, a drag and a long press
    // keep the browser's selection.
    onClick: (event) => {
      const element = event.currentTarget
      if (
        event.detail !== 1 ||
        element.disabled ||
        element.selectionStart !== element.selectionEnd
      ) {
        return
      }
      const index = slotIndexAt(element, event.clientX)
      if (index === undefined) {
        return
      }
      const position = Math.min(index, element.value.length)
      element.setSelectionRange(position, position)
      updateFocusAndSelection(readSelection(element))
    },
  }

  const { isFocused, start, end } = focusAndSelection
  const isCollapsed = start === end
  const activeIndex = isFocused && isCollapsed ? Math.min(start, length - 1) : undefined
  const slots = Array.from({ length }, (_, index): OneTimeCodeSlotState => {
    const character = shownValue[index] ?? ''
    const isActive = activeIndex === index
    return {
      character,
      isFilled: character !== '',
      isActive,
      caret: isActive ? (start >= length ? 'after' : 'before') : undefined,
      isSelected: isFocused && !isCollapsed && character !== '' && index >= start && index < end,
    }
  })
  const isComplete = slots.every((slot) => slot.isFilled)

  const rootProps: OneTimeCodeRootPartProps = {
    className: 'kv-one-time-code',
    ...(isComplete ? { 'data-complete': '' } : {}),
    ...(isInvalid ? { 'data-invalid': '' } : {}),
    ...(isDisabled ? { 'data-disabled': '' } : {}),
    ...(isReady ? { 'data-ready': '' } : {}),
  }

  const getSlotProps = (index: number): OneTimeCodeSlotPartProps => {
    const slot = slots[index]
    return {
      className: 'kv-one-time-code-slot',
      'aria-hidden': 'true',
      ...(slot?.isFilled === true ? { 'data-filled': '' } : {}),
      ...(slot?.isActive === true ? { 'data-active': '' } : {}),
      ...(slot?.caret === undefined ? {} : { 'data-caret': slot.caret }),
      ...(slot?.isSelected === true ? { 'data-selected': '' } : {}),
      ...(isInvalid ? { 'data-invalid': '' } : {}),
    }
  }

  return {
    rootProps,
    inputProps,
    getSlotProps,
    slots,
    value: shownValue,
    length,
    isComplete,
    isReady,
    isInvalid,
    isDisabled,
  }
}
