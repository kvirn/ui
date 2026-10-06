import type { KvirnProviderProps, ToastShowOptions, UseToastResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'

export const toastProviderRows = propRows<NonNullable<KvirnProviderProps['toast']>>({
  limit: {
    type: 'number',
    default: '10',
    description:
      'The most toasts shown at once. The region scrolls when they don’t fit. Past the limit the next toast is ignored: show returns an empty string and a development warning says so.',
  },
  autoDismiss: {
    type: 'false | number',
    default: 'false',
    description:
      'false: nothing times out. A number is how long, in milliseconds, an info or success toast without an action stays. There is no minimum: a short value can remove a toast before it is read (2.2.1 trade-off), so tie it to a user setting. 0, a negative number or NaN acts as false and warns in development.',
  },
})

export const useToastResultRows = propRows<UseToastResult>({
  show: {
    type: '(options: ToastShowOptions) => string',
    default: '–',
    description:
      'Shows a toast and returns its id, or an empty string when it was dropped (no provider, or before the provider mounted). Showing an id that is already shown updates it in place.',
  },
  dismiss: {
    type: '(id: string) => boolean',
    default: '–',
    description: 'Removes one toast. Returns false when there is none with that id.',
  },
  dismissAll: {
    type: '() => void',
    default: '–',
    description: 'Removes every toast.',
  },
  focus: {
    type: '() => void',
    default: '–',
    description:
      'Focuses the newest toast’s title, for a button of your own. The library adds no key for it.',
  },
})

export const toastShowOptionRows = propRows<ToastShowOptions>({
  title: {
    type: 'string',
    description: 'The message: one sentence in the user’s words. The status word comes first.',
  },
  variant: {
    type: "'info' | 'success'",
    default: "'info'",
    description:
      'There is no warning or error toast: use an inline Alert, or the form’s error summary.',
  },
  busy: {
    type: 'boolean',
    default: 'false',
    description:
      'A job in progress: a decorative spinner replaces the status icon and the status word stays. Show the result with the same id to replace it. The timer ring is unchanged.',
  },
  body: {
    type: 'ReactNode',
    default: '–',
    description: 'More to read, usually one short paragraph.',
  },
  action: {
    type: '{ label: string; onPress: () => void }',
    default: '–',
    description:
      'At most one. Pressing it runs onPress and closes the toast. A toast with an action never times out, so give it a persistent alternative on the page.',
  },
  id: {
    type: 'string',
    default: 'generated',
    description:
      'Showing the same id again updates the toast in place and announces it once: ten saves are one toast.',
  },
  focus: {
    type: 'boolean',
    default: 'false',
    description:
      'Moves focus to the toast and skips the announcement. Only for an action the user just took whose button is gone (3.2.2).',
  },
})
