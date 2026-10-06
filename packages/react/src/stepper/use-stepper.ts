import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useState } from 'react'
import type { RefCallback } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useMessages } from '../provider/use-messages.ts'

/** Spread on the Stepper's element. Only the part's class and a ref for the placement check: Stepper adds no role, ARIA or state. */
export interface StepperPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `kv-stepper`. */
  className: string
  /** Checks, in development, that the element is not inside a heading, label, legend, summary, button, link or caption. Pass it on if you set your own `ref`. */
  ref: RefCallback<HTMLElement>
}

export interface UseStepperOptions {
  /** The step the user is on: a positive whole number, at most `total`. */
  current: number
  /** How many steps there are: a positive whole number. Count sections, so an answer that adds a page never changes it. */
  total: number
  /** The section's name, in plain words: `Your vehicle`. It is added after the position. */
  name?: string | undefined
  /** Replaces `stepper.status` and `stepper.statusWithName` for this instance. */
  messages?: Partial<KvirnMessages['stepper']> | undefined
}

export interface UseStepperResult {
  /** The words, for example `Step 2 of 5: Your vehicle`. Reuse them in `<title>` if you like. */
  text: string
  /** The element: always `'p'`. */
  element: 'p'
  rootProps: StepperPartProps
}

const headingContext =
  'h1, h2, h3, h4, h5, h6, [role="heading"], label, legend, summary, button, a, caption'

/**
 * Stepper's text, element and class for your own element (contract: stepper.a11y.md).
 *
 * @example
 * const stepper = useStepper({ current: 2, total: 5, name: 'Your vehicle' })
 * <p {...stepper.rootProps}>{stepper.text}</p>
 */
export function useStepper({
  current,
  total,
  name,
  messages,
}: UseStepperOptions): UseStepperResult {
  const stepperMessages = useMessages('stepper', messages)
  const hasName = name !== undefined && name.trim() !== ''
  const text = hasName
    ? stepperMessages.statusWithName({ current, total, name })
    : stepperMessages.status({ current, total })

  useEffect(() => {
    if (!Number.isInteger(current) || !Number.isInteger(total) || current < 1 || total < 1) {
      warnOnce(
        'stepper-invalid-position',
        `A Stepper got current=${current} and total=${total}: both must be positive whole numbers (WCAG 1.3.1). It shows what it was given.`,
      )
    } else if (current > total) {
      warnOnce(
        'stepper-invalid-position',
        `A Stepper has current=${current} after total=${total}: "Step ${current} of ${total}" is wrong, so fix the count (WCAG 1.3.1).`,
      )
    }
  }, [current, total])

  const [element, setElement] = useState<HTMLElement | null>(null)
  const ref = useCallback((instance: HTMLElement | null) => setElement(instance), [])
  useEffect(() => {
    if (element?.parentElement?.closest(headingContext)) {
      warnOnce(
        'stepper-in-name',
        'A Stepper is inside a heading, label, legend, summary, button, link or caption, so its text joins that name. Put it directly after the heading, as its own element (WCAG 1.3.1, 2.4.6).',
      )
    }
  }, [element])

  return { text, element: 'p', rootProps: { className: 'kv-stepper', ref } }
}
