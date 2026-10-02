import type { KvirnMessages } from '@kvirn-ui/i18n'
import { createContext, useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import type { FieldMarker, FieldState } from './field-state.ts'
import type {
  FieldControlPartProps,
  FieldDescriptionPartProps,
  FieldErrorMessagePartProps,
  FieldLabelPartProps,
} from './use-field.ts'

// Internal. How a Field or Fieldset and its parts find each other, without DOM queries and
// without global ids (ADR-0029). Three contexts:
//
// - FieldTextHostContext: the nearest Field or Fieldset. Description and ErrorMessage attach to
//   it, and tell it when they mount, so `aria-describedby` only lists parts that exist.
// - FieldContext: the nearest Field. Label and the control (Input and, later, Checkbox) read it.
// - FieldGroupContext: `true` inside a group fieldset (a CheckboxGroup, a RadioGroup, a date
//   input). A Field in it defaults to `marker="none"`. A Fieldset's `invalid` is never put on
//   FieldContext, so it doesn't cascade to the Fields inside it.

/** Description and ErrorMessage attach to the nearest Field or Fieldset. */
export interface FieldTextHostContextValue {
  /** The props for the Description with this name. Each Description has its own id. */
  getDescriptionProps: (name: string) => FieldDescriptionPartProps
  errorMessageProps: FieldErrorMessagePartProps
  state: FieldState
  messages: Partial<KvirnMessages['field']> | undefined
  /**
   * A Description registers itself while mounted, with its name and its element. The host lists
   * the registered names in DOM order. Returns the unregister function.
   */
  registerDescription: (name: string, element: RefObject<Element | null>) => () => void
  /** An ErrorMessage registers itself while it renders. Returns the unregister function. */
  registerErrorMessage: () => () => void
}

export const FieldTextHostContext = createContext<FieldTextHostContextValue | null>(null)

/** The nearest Field: what its Label and its control read. */
export interface FieldContextValue {
  controlProps: FieldControlPartProps
  labelProps: FieldLabelPartProps
  /** The label's id, for a part that names itself by the label (`aria-labelledby`). */
  labelId: string
  state: FieldState
  marker: FieldMarker
  messages: Partial<KvirnMessages['field']> | undefined
}

export const FieldContext = createContext<FieldContextValue | null>(null)

export const FieldGroupContext = createContext(false)

export interface TextPartRegistry {
  /** The mounted Descriptions' names, in DOM order. */
  descriptionNames: readonly string[]
  hasErrorMessage: boolean
  registerDescription: (name: string, element: RefObject<Element | null>) => () => void
  registerErrorMessage: () => () => void
}

function isSameList(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((name, index) => name === second[index])
}

/** Internal. Orders registered Descriptions by where their elements are in the document. */
function byDocumentPosition(
  [, first]: readonly [string, RefObject<Element | null>],
  [, second]: readonly [string, RefObject<Element | null>],
): number {
  if (first.current === null || second.current === null) {
    return 0
  }
  return first.current.compareDocumentPosition(second.current) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1
}

/**
 * Internal. Tracks the Descriptions and ErrorMessages mounted in a Field or Fieldset, for the
 * Root's `aria-describedby`. Also warns, once, when the owner is invalid and no ErrorMessage
 * rendered (3.3.1), and when it renders two (they'd share one id).
 *
 * Descriptions are listed in DOM order, not mount order (ADR-0031): each registers its element,
 * and the list is sorted with `compareDocumentPosition` inside the layout effect, never while
 * rendering.
 *
 * An invalid owner lists its error id from the first render, because ErrorMessage renders
 * exactly when its owner is invalid. Waiting for the ErrorMessage to register would leave the id
 * out for one render, and an app that focuses the first invalid field in an effect after submit
 * would focus it before the error is linked: screen readers then never read the error. The id
 * is dropped only once a layout effect has confirmed that no ErrorMessage is mounted, so it
 * never points at nothing for long.
 */
export function useTextPartRegistry(
  isInvalid: boolean,
  ownerName: 'Field' | 'Fieldset',
): TextPartRegistry {
  const [descriptionNames, setDescriptionNames] = useState<readonly string[]>([])
  const descriptionEntries = useRef(new Map<string, RefObject<Element | null>>())
  const [isErrorMessageMissing, setIsErrorMessageMissing] = useState(false)
  // Counted synchronously, because the check below runs in the same commit as the children's
  // layout effects.
  const errorMessageRegistrations = useRef(0)

  const syncDescriptionNames = useCallback(() => {
    const sortedNames = [...descriptionEntries.current.entries()]
      .sort(byDocumentPosition)
      .map(([name]) => name)
    setDescriptionNames((previous) => (isSameList(previous, sortedNames) ? previous : sortedNames))
  }, [])
  const registerDescription = useCallback(
    (name: string, element: RefObject<Element | null>) => {
      descriptionEntries.current.set(name, element)
      syncDescriptionNames()
      return () => {
        descriptionEntries.current.delete(name)
        syncDescriptionNames()
      }
    },
    [syncDescriptionNames],
  )
  const registerErrorMessage = useCallback(() => {
    errorMessageRegistrations.current += 1
    if (errorMessageRegistrations.current > 1) {
      warnOnce(
        `${ownerName.toLowerCase()}-two-error-messages`,
        `A ${ownerName} renders two ${ownerName}.ErrorMessages. They share one id, so only one can be linked from the control, and users would hear one message twice or miss the other. Render one ${ownerName}.ErrorMessage, with all the text.`,
      )
    }
    setIsErrorMessageMissing(false)
    return () => {
      errorMessageRegistrations.current -= 1
      // An ErrorMessage removed while its owner stays invalid: drop the id. When the owner
      // turns valid in the same commit, the check below resets this.
      if (errorMessageRegistrations.current === 0) {
        setIsErrorMessageMissing(true)
      }
    }
  }, [ownerName])

  // Runs after the children's layout effects, before paint and before the app's effects.
  useLayoutEffect(() => {
    const isMissing = isInvalid && errorMessageRegistrations.current === 0
    if (isMissing) {
      warnOnce(
        `${ownerName.toLowerCase()}-invalid-without-error-message`,
        `A ${ownerName} is invalid but renders no ${ownerName}.ErrorMessage, so users aren't told what's wrong or how to fix it (WCAG 3.3.1, 3.3.3). Render <${ownerName}.ErrorMessage> with the message, or stop setting invalid.`,
      )
    }
    setIsErrorMessageMissing(isMissing)
    // Registering and unregistering update the state themselves, so only `isInvalid` matters.
  }, [isInvalid, ownerName])

  return {
    descriptionNames,
    hasErrorMessage: !isErrorMessageMissing,
    registerDescription,
    registerErrorMessage,
  }
}
