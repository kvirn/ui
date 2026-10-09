'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useStepper } from './use-stepper.ts'

const stepperTags = ['p', 'div'] as const

interface StepperOwnProps {
  /** The text is the message: there are no `children`. */
  children?: never
  /** The step the user is on: a positive whole number, at most `total`. */
  current: number
  /** How many steps there are. Count sections, so an answer that adds a page never changes it. */
  total: number
  /** The section's name: `Your vehicle`. */
  name?: string | undefined
  /** Replaces `stepper.status` and `stepper.statusWithName` for this instance. */
  messages?: Partial<KvirnMessages['stepper']> | undefined
}

/** `as` is `p` (default) or `div`. Its own semantics apply. */
export type StepperProps = AsTag<(typeof stepperTags)[number], 'p', StepperOwnProps>

/**
 * Where the user is in a multi-page form, as one line of text (contract: stepper.a11y.md): one
 * `<p class="kv-stepper">`, such as "Step 2 of 5: Your vehicle". Put it directly after the page
 * heading, never inside it. It is a position, not navigation: no list, no links, no live region,
 * not a Tab stop.
 *
 * @example
 * <h1>Which vehicle is the permit for?</h1>
 * <Stepper current={2} total={5} name="Your vehicle" />
 */
export function Stepper({
  current,
  total,
  name,
  messages,
  as,
  ref,
  ...otherProps
}: StepperProps): ReactElement {
  const stepper = useStepper({ current, total, name, messages })
  const { ref: ownRef, ...partProps } = stepper.rootProps
  const elementRef = useMergedRef(ref, ownRef)
  return renderPart({
    as: resolveAsTag({ part: 'Stepper', as, allowedTags: stepperTags }),
    defaultElement: stepper.element,
    partProps: { ...mergeProps(otherProps, partProps), children: stepper.text, ref: elementRef },
  })
}
Stepper.displayName = 'Stepper'
