import type { StepperProps, UseStepperOptions, UseStepperResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const positionRows = {
  current: {
    type: 'number',
    description: 'The step the user is on: a positive whole number, at most total.',
  },
  total: {
    type: 'number',
    description:
      'How many steps there are. Count sections, so an answer that adds a page never changes it.',
  },
  name: {
    type: 'string',
    default: '–',
    description: 'The section’s name, in plain words: “Your vehicle”. A blank name counts as none.',
  },
  messages: {
    type: "Partial<KvirnMessages['stepper']>",
    default: '–',
    description: 'Replaces stepper.status and stepper.statusWithName for this instance.',
  },
} as const

export const stepperRows = propRows<
  Pick<StepperProps, 'current' | 'total' | 'name' | 'messages' | 'as' | 'ref'>
>({
  ...positionRows,
  as: {
    type: "'p' | 'div'",
    default: "'p'",
    description:
      'Changes the element. It is a line of text: no span, no heading and no list. A string, so it works from a Server Component.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const stepperAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-stepper',
    values: 'always',
    meaning: 'The part class. The default theme styles it. Stepper has no state, so no data-*.',
  },
]

export const useStepperHook: ApiHook = {
  name: 'useStepper',
  options: propRows<UseStepperOptions>(positionRows),
  result: propRows<UseStepperResult>({
    text: {
      type: 'string',
      default: '–',
      description:
        'The words, for example “Step 2 of 5: Your vehicle”. Reuse them in <title> if you like.',
    },
    element: {
      type: "'p'",
      default: '–',
      description: 'The element to render: always p.',
    },
    rootProps: {
      type: 'StepperPartProps',
      default: '–',
      description:
        'Spread on your element: the class, and a ref that checks in development that it is not inside a heading, label, legend, summary, button, link or caption. Pass the ref on if you set your own.',
    },
  }),
}
