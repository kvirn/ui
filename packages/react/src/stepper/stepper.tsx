'use client'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import type { HTMLAttributes, ReactElement, Ref, RefCallback } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useStepper } from './use-stepper.ts'

/** What `render` receives as its second argument. */
export interface StepperState {
  current: number
  total: number
  /** The words, for example `Step 2 of 5: Your vehicle`. */
  text: string
}

/** What a `render` function gets to spread: your attributes, the class and a callback ref. `children` is the text. */
export interface StepperElementProps extends HTMLAttributes<HTMLElement> {
  ref: RefCallback<HTMLElement>
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  ref?: Ref<HTMLElement> | undefined
  /** The step the user is on: a positive whole number, at most `total`. */
  current: number
  /** How many steps there are. Count sections, so an answer that adds a page never changes it. */
  total: number
  /** The section's name: `Your vehicle`. */
  name?: string | undefined
  /** Replaces `stepper.status` and `stepper.statusWithName` for this instance. */
  messages?: Partial<KvirnMessages['stepper']> | undefined
  /** Change the element: `render={<div />}`. Its own semantics apply. */
  render?: RenderProp<StepperElementProps, StepperState> | undefined
}

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
  render,
  ref,
  ...otherProps
}: StepperProps): ReactElement {
  const stepper = useStepper({ current, total, name, messages })
  const { ref: ownRef, ...partProps } = stepper.rootProps
  const elementRef = useMergedRef(ref, ownRef)
  return renderPart({
    render,
    defaultElement: stepper.element,
    partProps: { ...mergeProps(otherProps, partProps), children: stepper.text, ref: elementRef },
    state: { current, total, text: stepper.text },
  })
}
Stepper.displayName = 'Stepper'
