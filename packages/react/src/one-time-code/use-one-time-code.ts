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

export interface UseOneTimeCodeOptions {
  /**
   * The shape of the code, one symbol per position (ADR-0045): `9` a digit, `*` a letter or digit,
   * `a` a letter, `A` an upper-case letter and `&` an upper-case letter or digit (lower case typed
   * is upper-cased), and `-` a separator between two of them, drawn as its own cell. ASCII only.
   * `'****-****'` is two groups of four. Default `'999999'`. An invalid pattern throws a
   * `RangeError`.
   */
  pattern?: string | undefined
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
   * last character, a paste, an autofill. `value` is what the input holds (`ABCD-1234`) and
   * `unmaskedValue` is the code without the separators (`ABCD1234`). It never submits and never
   * moves focus (3.2.2). Say in the hint that the code is checked as soon as it's entered, and
   * keep a submit button.
   */
  onComplete?: ((value: string, unmaskedValue: string) => void) | undefined
  /** Native `disabled`. A disabled Field disables the input too. */
  disabled?: boolean | undefined
  /** Announce, politely and throttled, when the mask drops a character (4.1.3). Default `true`. */
  announceRejections?: boolean | undefined
  /** Per-instance message overrides for the rejection announcements (ADR-0007). */
  messages?: Partial<KvirnMessages['mask']> | undefined
}

/**
 * One cell of the pattern, the state of its box. `index` in `getSlotProps` and in `slots` is the
 * position in the pattern: position _i_ of the pattern draws position _i_ of the value.
 */
export interface OneTimeCodeSlotState {
  /** `'character'` takes a character of the code. `'separator'` is the pattern's `-` (ADR-0045). */
  kind: 'character' | 'separator'
  /**
   * The character, or `''` when a character slot is empty. A separator always has `'-'`: it is the
   * pattern, not the value.
   */
  character: string
  /** A character slot holds a character. Never true for a separator. */
  isFilled: boolean
  /**
   * The input has focus, nothing is selected, and the caret is at this slot. At most one, and
   * never a separator: it is the first character slot at or after the caret.
   */
  isActive: boolean
  /**
   * On the active slot: `'before'` when the caret is before this slot's position (in an empty
   * slot, where the next character goes). `'after'` when the caret is after this slot's character
   * and the next position is not a character slot you could type in: the last slot of a complete
   * code, or the slot before a `-` that the caret has stepped back over.
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
  /** The number of character symbols in the pattern (`8` for `****-****`), for the theme. */
  'data-character-count': number
  /** The number of `-` in the pattern (`1` for `****-****`, `0` for none). The theme reads it. */
  'data-separator-count': number
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
  /** `numeric` when every symbol of the pattern is `9`. */
  inputMode?: 'numeric'
  /** Set when no symbol is `a` or `*`: the code is in capitals or digits. */
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

/**
 * Spread on each slot: a `<span>` that draws one character or, for the pattern's `-`, a separator.
 * A separator has no `data-*` state at all: it is the pattern's dash, not part of the code's state.
 */
export interface OneTimeCodeSlotPartProps {
  /** `.kv-one-time-code-slot` for a character, `.kv-one-time-code-separator` for a separator. */
  className: 'kv-one-time-code-slot' | 'kv-one-time-code-separator'
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
  /** The props for the slot at `index`, a position in the pattern: 0 to `pattern.length - 1`. */
  getSlotProps: (index: number) => OneTimeCodeSlotPartProps
  /** One entry per position of the pattern (characters and separators), for rendering the slots. */
  slots: readonly OneTimeCodeSlotState[]
  /** The value the input shows now, with its separators (`ABCD-1234`). */
  value: string
  /** The pattern in use. */
  pattern: string
  /** How many characters the code has: the pattern without its separators. */
  characterCount: number
  /** Every character slot is filled. */
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
 * The ordinal (0 for the first character slot) of the character slot nearest to a pointer, or
 * `undefined` when the slots aren't drawn (the theme's fallback shows the plain input, and its own
 * caret is right). Only `.kv-one-time-code-slot` counts: a separator is `.kv-one-time-code-separator`,
 * so a press on a separator or in a gap goes to the nearest character slot.
 */
function characterSlotAt(input: HTMLInputElement, clientX: number): number | undefined {
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
 * A one-time code's wiring for your own elements (ADR-0033 and ADR-0045, contract:
 * one-time-code.a11y.md): the props of one native `<input>`, the row, and one slot per position of
 * the pattern. The slots only draw the input's value, caret and selection: the input stays the one
 * operable element, so SMS autofill, paste, dictation and undo work. The hook moves no focus and
 * submits nothing.
 *
 * @example
 * const oneTimeCode = useOneTimeCode({ pattern: '****-****', onComplete: verify })
 * <div {...oneTimeCode.rootProps}>
 *   <input {...oneTimeCode.inputProps} name="code" />
 *   {oneTimeCode.slots.map((slot, index) => (
 *     <span key={index} {...oneTimeCode.getSlotProps(index)}>{slot.character}</span>
 *   ))}
 * </div>
 */
export function useOneTimeCode({
  pattern = '999999',
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

  // Throws a RangeError for an invalid pattern, in development, naming the character.
  const mask = useMemo(() => masks.oneTimeCode({ pattern }), [pattern])
  const characterPositions = useMemo(
    () => [...pattern].flatMap((symbol, position) => (symbol === '-' ? [] : [position])),
    [pattern],
  )
  const characterCount = characterPositions.length

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
        onComplete?.(nextValue, details.unmaskedValue ?? mask.unmask(nextValue))
      }
    },
    [onValueChange, onComplete, updateFocusAndSelection, mask],
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
    // The pattern decides (ADR-0045 item 9): the mask suggests, the same as for an Input.
    ...(mask.attributes.inputMode === 'numeric' ? { inputMode: 'numeric' } : {}),
    ...(mask.attributes.autoCapitalize === 'characters' ? { autoCapitalize: 'characters' } : {}),
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
    // press is mapped to the slot, never to the text. A press on a separator or in a gap goes to
    // the nearest character slot. The slot's position in the pattern is its position in the value,
    // because the value holds the separators. A double click, a drag and a long press keep the
    // browser's selection.
    onClick: (event) => {
      const element = event.currentTarget
      if (
        event.detail !== 1 ||
        element.disabled ||
        element.selectionStart !== element.selectionEnd
      ) {
        return
      }
      const ordinal = characterSlotAt(element, event.clientX)
      const index = ordinal === undefined ? undefined : characterPositions[ordinal]
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
  // Where the caret is drawn: the first character slot at or after it, "before" its character.
  // A caret just before a `-` that is in the value (the user stepped back over it) is "after" the
  // character before the dash, so the two sides of a separator don't look the same. With no
  // character slot left (the end of a complete code) it is "after" the last character.
  let activeIndex: number | undefined
  let caretSide: 'before' | 'after' = 'before'
  if (isFocused && isCollapsed) {
    if (pattern[start] === '-' && shownValue[start] === '-' && start > 0) {
      activeIndex = start - 1
      caretSide = 'after'
    } else {
      activeIndex = characterPositions.find((position) => position >= start)
      if (activeIndex === undefined) {
        activeIndex = characterPositions.at(-1)
        caretSide = 'after'
      }
    }
  }
  const slots = Array.from({ length: pattern.length }, (_, index): OneTimeCodeSlotState => {
    if (pattern[index] === '-') {
      return {
        kind: 'separator',
        character: '-',
        isFilled: false,
        isActive: false,
        caret: undefined,
        isSelected: false,
      }
    }
    const character = shownValue[index] ?? ''
    const isActive = activeIndex === index
    return {
      kind: 'character',
      character,
      isFilled: character !== '',
      isActive,
      caret: isActive ? caretSide : undefined,
      isSelected: isFocused && !isCollapsed && character !== '' && index >= start && index < end,
    }
  })
  const isComplete = slots.every((slot) => slot.kind === 'separator' || slot.isFilled)

  const rootProps: OneTimeCodeRootPartProps = {
    className: 'kv-one-time-code',
    'data-character-count': characterCount,
    'data-separator-count': pattern.length - characterCount,
    ...(isComplete ? { 'data-complete': '' } : {}),
    ...(isInvalid ? { 'data-invalid': '' } : {}),
    ...(isDisabled ? { 'data-disabled': '' } : {}),
    ...(isReady ? { 'data-ready': '' } : {}),
  }

  const getSlotProps = (index: number): OneTimeCodeSlotPartProps => {
    const slot = slots[index]
    if (slot?.kind === 'separator') {
      return {
        className: 'kv-one-time-code-separator',
        'aria-hidden': 'true',
      }
    }
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
    pattern,
    characterCount,
    isComplete,
    isReady,
    isInvalid,
    isDisabled,
  }
}
