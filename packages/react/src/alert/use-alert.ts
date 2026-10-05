import type { AnnouncerPoliteness } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useMessages } from '../provider/use-messages.ts'

/** The four statuses. Chosen by the component you render, never by a prop. */
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

/**
 * The one table: a status's class, icon and status word key. The ready-made roots and
 * `useAlert({ variant })` read only this, so the colour, the icon and the word can't
 * disagree (decision 4).
 */
const statuses = {
  info: {
    className: 'kv-alert--info',
    iconName: 'info',
    messageKey: 'infoPrefix',
    componentName: 'Alert.Info',
  },
  success: {
    className: 'kv-alert--success',
    iconName: 'success',
    messageKey: 'successPrefix',
    componentName: 'Alert.Success',
  },
  warning: {
    className: 'kv-alert--warning',
    iconName: 'warning',
    messageKey: 'warningPrefix',
    componentName: 'Alert.Warning',
  },
  danger: {
    className: 'kv-alert--danger',
    iconName: 'error',
    messageKey: 'dangerPrefix',
    componentName: 'Alert.Danger',
  },
} as const satisfies Record<
  AlertVariant,
  {
    className: `kv-alert--${AlertVariant}`
    iconName: 'info' | 'success' | 'warning' | 'error'
    messageKey: keyof KvirnMessages['alert']
    componentName: string
  }
>

const variants = Object.keys(statuses) as AlertVariant[]

export interface UseAlertOptions {
  /**
   * Makes the result a ready-made root: `rootProps` gets the status class, and `iconProps` and
   * `statusProps` are set, from the same table as `Alert.Info|Success|Warning|Danger`.
   * Without it, the result is the plain Root: only the classes, so you bring your own icon and
   * status word.
   */
  variant?: AlertVariant | undefined
  /**
   * Announces the Title and Body text once, when the alert mounts, in the shared
   * Announcer's polite or assertive region (4.1.3). Set it only on an alert
   * inserted after an action, never on one present at load. Default: nothing is announced.
   */
  announce?: AnnouncerPoliteness | undefined
  /**
   * Per-instance overrides: the status word (only the key of `variant` is read) and the name
   * of the close button (`close`).
   */
  messages?: Partial<KvirnMessages['alert']> | undefined
}

/** Spread on the root's element. A callback ref, which fits any element. */
export interface AlertRootPartProps {
  /** `kv-alert`, plus `kv-alert--<variant>` with a `variant`. */
  className: 'kv-alert' | `kv-alert kv-alert--${AlertVariant}`
  ref: RefCallback<HTMLElement>
}

/** Spread on the Title's element. The ref lets `announce` read its text. */
export interface AlertTitlePartProps {
  className: 'kv-alert-title'
  ref: RefCallback<HTMLElement>
}

/** Spread on the Body's element. The ref lets `announce` read its text. */
export interface AlertBodyPartProps {
  className: 'kv-alert-body'
  ref: RefCallback<HTMLElement>
}

export interface AlertActionsPartProps {
  className: 'kv-alert-actions'
}

/**
 * Spread on the close `<button>`: `<button {...alert.closeProps} onClick={dismiss}><Icon name="close" /></button>`.
 * The name is the resolved `alert.close` message. Drop `aria-label` when the button has visible
 * text of your own.
 */
export interface AlertClosePartProps {
  className: 'kv-alert-close'
  type: 'button'
  /** The resolved `alert.close` message, for example `Stäng meddelandet`. */
  'aria-label': string
}

/** Spread on `<Icon>`: `<Icon {...alert.iconProps} />`. Decorative: the status is text. */
export interface AlertIconPartProps {
  name: 'info' | 'success' | 'warning' | 'error'
  className: 'kv-alert-icon'
}

/** Spread on a `<span>` at the start of the Title: `<span {...alert.statusProps} />`. */
export interface AlertStatusPartProps {
  className: 'kv-alert-status'
  /** The resolved status word, for example `Varning:`. */
  children: string
}

export interface UseAlertResult {
  rootProps: AlertRootPartProps
  titleProps: AlertTitlePartProps
  bodyProps: AlertBodyPartProps
  actionsProps: AlertActionsPartProps
  /**
   * The optional close button. The alert owns no open or closed state: you remove it in the
   * button's `onClick`, then move focus (WCAG 2.4.3).
   */
  closeProps: AlertClosePartProps
  /** The status icon. `undefined` without a `variant`: you bring your own. */
  iconProps: AlertIconPartProps | undefined
  /** The status word's span. `undefined` without a `variant`: you bring your own. */
  statusProps: AlertStatusPartProps | undefined
}

/** What a screen reader would read: the text, with block boundaries as spaces. */
function readText(element: HTMLElement | null): string {
  if (element === null) {
    return ''
  }
  // `innerText` puts block boundaries between words and skips what is `hidden`. It's empty for an
  // element that isn't rendered, so fall back to the raw text.
  const text = element.innerText === '' ? (element.textContent ?? '') : element.innerText
  return text.replaceAll(/\s+/g, ' ').trim()
}

/**
 * An alert's props for your own elements (contract: alert.a11y.md). It
 * adds no role, `aria-live`, `aria-atomic` or `tabindex`: the visible box is never a live
 * region, and `announce` goes through the Announcer once, on mount. Attach `titleProps` to the
 * Title and `bodyProps` to the Body, so `announce` can read their text.
 *
 * @example
 * const alert = useAlert({ variant: 'warning', announce: 'polite' })
 * <div {...alert.rootProps}>
 *   <Icon {...alert.iconProps} />
 *   <h2 {...alert.titleProps}>
 *     <span {...alert.statusProps} /> Ditt tillstånd går ut
 *   </h2>
 * </div>
 */
export function useAlert(options: UseAlertOptions & { variant: AlertVariant }): UseAlertResult & {
  iconProps: AlertIconPartProps
  statusProps: AlertStatusPartProps
}
export function useAlert(options?: UseAlertOptions): UseAlertResult
export function useAlert({ variant, announce, messages }: UseAlertOptions = {}): UseAlertResult {
  const alertMessages = useMessages('alert', messages)
  const { announce: say, isAvailable } = useQuietAnnouncer()

  const rootElement = useRef<HTMLElement | null>(null)
  const titleElement = useRef<HTMLElement | null>(null)
  const bodyElement = useRef<HTMLElement | null>(null)
  const rootRef = useCallback<RefCallback<HTMLElement>>((element) => {
    rootElement.current = element
  }, [])
  const titleRef = useCallback<RefCallback<HTMLElement>>((element) => {
    titleElement.current = element
  }, [])
  const bodyRef = useCallback<RefCallback<HTMLElement>>((element) => {
    bodyElement.current = element
  }, [])

  // Announcing is for the moment of mounting only: the first value of `announce` counts.
  const announceOnMount = useRef(announce)
  const hasAnnounced = useRef(false)
  useEffect(() => {
    const politeness = announceOnMount.current
    if (politeness === undefined || hasAnnounced.current) {
      return
    }
    // Strict Mode runs this twice for one mount: the second run must stay silent.
    hasAnnounced.current = true
    if (!isAvailable) {
      warnAnnouncerMissing()
      return
    }
    const text = [readText(titleElement.current), readText(bodyElement.current)]
      .filter((part) => part !== '')
      .join(' ')
    say(text, { politeness })
  }, [isAvailable, say])

  useEffect(() => {
    if (titleElement.current === null) {
      warnOnce(
        'alert-without-title',
        'An Alert needs a Title: it holds the status word and names the message.',
      )
    }
  }, [])

  useEffect(() => {
    if (announce === 'assertive' && (variant === 'info' || variant === 'success')) {
      warnOnce(
        'alert-assertive-info-success',
        `announce="assertive" interrupts the screen reader, so it is only for something the user must act on right now. ${variant === 'info' ? 'Alert.Info' : 'Alert.Success'} should use announce="polite", or none.`,
      )
    }
  }, [announce, variant])

  // What the real element ended up with, whether it came from a prop, a `render` element or the
  // `render` function form. Cheap, development-only in effect (warnOnce is silent in production).
  useEffect(() => {
    const root = rootElement.current
    if (root === null) {
      return
    }
    if (
      root.getAttribute('role') === 'alert' ||
      root.getAttribute('role') === 'status' ||
      root.hasAttribute('aria-live')
    ) {
      warnOnce(
        'alert-live-region',
        'An Alert root has role="alert", role="status" or aria-live. It is announced through the Announcer (announce): a second live region reads it twice.',
      )
    }
    if (announce !== undefined && root.hasAttribute('tabindex')) {
      warnOnce(
        'alert-announce-and-focus',
        'An Alert root has tabindex and announce. Focus reads it already, so announcing it as well reads it twice. Use one of the two.',
      )
    }
    const ownClassName = variant === undefined ? undefined : statuses[variant].className
    const otherStatus = variants.find(
      (other) =>
        statuses[other].className !== ownClassName &&
        root.classList.contains(statuses[other].className),
    )
    if (otherStatus === undefined) {
      return
    }
    const otherClassName = statuses[otherStatus].className
    const otherName = statuses[otherStatus].componentName
    if (variant === undefined) {
      warnOnce(
        `alert-status-class-on-root:${otherClassName}`,
        `A plain Alert.Root has the class ${otherClassName}. That gives the ${otherStatus} colour without the icon and the status word. Use ${otherName}, or your own class with your own icon and word.`,
      )
    } else {
      warnOnce(
        `alert-conflicting-status:${variant}:${otherClassName}`,
        `${statuses[variant].componentName} has the class ${otherClassName}: the colour would say ${otherStatus} while the icon and the word say ${variant}. Use ${otherName}.`,
      )
    }
  })

  const word = variant === undefined ? undefined : alertMessages[statuses[variant].messageKey]
  const closeName = alertMessages.close

  return useMemo<UseAlertResult>(() => {
    const status = variant === undefined ? undefined : statuses[variant]
    return {
      rootProps: {
        className: status === undefined ? 'kv-alert' : `kv-alert ${status.className}`,
        ref: rootRef,
      },
      titleProps: { className: 'kv-alert-title', ref: titleRef },
      bodyProps: { className: 'kv-alert-body', ref: bodyRef },
      actionsProps: { className: 'kv-alert-actions' },
      closeProps: { className: 'kv-alert-close', type: 'button', 'aria-label': closeName },
      iconProps:
        status === undefined ? undefined : { name: status.iconName, className: 'kv-alert-icon' },
      statusProps:
        word === undefined ? undefined : { className: 'kv-alert-status', children: word },
    }
  }, [variant, word, closeName, rootRef, titleRef, bodyRef])
}
