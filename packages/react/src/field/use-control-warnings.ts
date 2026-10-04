import { useEffect } from 'react'
import type { RefObject } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'

/** Internal. Whether the browser gives a form control a name: a label, `aria-label` or similar. */
function hasNameSource(
  control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): boolean {
  return (
    control.hasAttribute('aria-label') ||
    control.hasAttribute('aria-labelledby') ||
    control.hasAttribute('title') ||
    (control.labels?.length ?? 0) > 0
  )
}

export interface UseControlWarningsOptions {
  /** The control's element. */
  elementRef: RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>
  /** Whether the control is inside a Field. */
  isInField: boolean
  /** The `id` the consumer passed to the control. */
  id: string | undefined
  /** For the messages and their once-only keys, such as `Checkbox`. */
  componentName: string
}

/**
 * Internal. The development warnings every native form control shares: an `id` that
 * a Field ignores, and a control without an accessible name. They run in development only, and
 * once per component name.
 */
export function useControlWarnings({
  elementRef,
  isInField,
  id,
  componentName,
}: UseControlWarningsOptions): void {
  useEffect(() => {
    if (isInField && id !== undefined) {
      warnOnce(
        `${componentName}-id-in-field`,
        `A ${componentName} inside a Field got id="${id}", which is ignored so the Field's label and help text stay linked. Set the id with controlId on Field.Root.`,
      )
    }
  }, [isInField, id, componentName])

  useEffect(() => {
    const element = elementRef.current
    if (element === null || hasNameSource(element)) {
      return
    }
    if (isInField) {
      warnOnce(
        `${componentName}-in-field-without-label`,
        `A ${componentName} in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.`,
      )
    } else {
      warnOnce(
        `${componentName}-without-name`,
        `A ${componentName} has no accessible name. Put it in a Field with a Field.Label, or give it aria-labelledby (WCAG 1.3.1, 4.1.2).`,
      )
    }
  })
}
