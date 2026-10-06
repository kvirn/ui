import type { AnnounceOptions } from '@kvirn-ui/core'
import type { UseAnnouncerResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'

export const useAnnouncerResultRows = propRows<UseAnnouncerResult>({
  announce: {
    type: '(message: string, options?: AnnounceOptions) => boolean',
    default: '–',
    description:
      'Says the message in the shared live region. Returns true when it was accepted, and false when it was dropped: blank, throttled by key, or no provider.',
  },
})

export const announceOptionRows = propRows<AnnounceOptions>({
  politeness: {
    type: "'polite' | 'assertive'",
    default: "'polite'",
    description:
      'Polite waits for the screen reader to finish speaking. Assertive interrupts it: only for what the user must act on right now.',
  },
  key: {
    type: 'string',
    default: '–',
    description:
      'Throttles by key, such as a field’s id: later messages with the same key inside the window are dropped.',
  },
  throttleMilliseconds: {
    type: 'number',
    default: '3000',
    description: 'The throttle window for key, in milliseconds. 0 turns it off.',
  },
})
