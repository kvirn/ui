import { useContext, useMemo } from 'react'
import { KvirnConfigContext } from '../provider/provider-context.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { ToastContext } from './toast-context.ts'
import type { ToastShowOptions } from './toast-controller.ts'

export type { ToastShowOptions, ToastVariant } from './toast-controller.ts'

export interface UseToastResult {
  /**
   * Shows a toast and returns its id: `options.id`, or one made for it. An empty string means
   * nothing was shown: there is no provider, or it has not mounted yet. A toast shown while a
   * modal dialog is open waits until it closes.
   */
  show: (options: ToastShowOptions) => string
  /** Removes a toast, shown or waiting. Returns `false` when there is none with this id. */
  dismiss: (id: string) => boolean
  /** Removes every toast, the waiting ones too. */
  dismissAll: () => void
  /** Focuses the title of the newest toast, for a button of your own. The library adds no key. */
  focus: () => void
}

const showNothing = () => ''
const dismissNothing = () => false
const doNothing = () => {}
const withoutProvider: UseToastResult = Object.freeze({
  show: showNothing,
  dismiss: dismissNothing,
  dismissAll: doNothing,
  focus: doNothing,
})

/**
 * Shows short status messages after something worked, without moving focus (contract:
 * toast.a11y.md). The outermost `KvirnProvider` owns the queue and renders the region once, so call
 * it from anywhere below. Toasts are info or success only and persistent unless the provider's
 * `toast={{ autoDismiss }}` (milliseconds) allows them to time out: the result must also show in place, and an
 * error is not a toast. Call `show` from an event handler or an effect, never during render.
 * Without a provider every function does nothing and warns once in development.
 *
 * @example
 * const toast = useToast()
 * toast.show({ variant: 'success', title: 'Utkastet sparades' })
 */
export function useToast(): UseToastResult {
  const controller = useContext(ToastContext)
  const { locale } = useContext(KvirnConfigContext)
  if (controller === null) {
    warnOnce(
      'toast-without-provider',
      'useToast() was used outside a <KvirnProvider>, so toasts are dropped and nobody sees or hears them. Wrap the app in <KvirnProvider>: it renders the toast region.',
    )
  }
  return useMemo(
    () =>
      controller === null
        ? withoutProvider
        : {
            show: (options) => controller.show(options, locale),
            dismiss: (id) => controller.dismiss(id),
            dismissAll: controller.dismissAll,
            focus: controller.focus,
          },
    [controller, locale],
  )
}
