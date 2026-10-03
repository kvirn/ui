import type { AnnouncerPoliteness } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { RefCallback } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useMessages } from '../provider/use-messages.ts'

/** The four statuses. Chosen by the component you render, never by a prop. */
export type NotificationVariant = 'info' | 'success' | 'warning' | 'danger'

/**
 * The one table: a status's class, icon and status word key. The ready-made roots and
 * `useNotification({ variant })` read only this, so the colour, the icon and the word can't
 * disagree (decision 4).
 */
const statuses = {
  info: {
    className: 'kv-notification--info',
    iconName: 'info',
    messageKey: 'infoPrefix',
    componentName: 'Notification.Info',
  },
  success: {
    className: 'kv-notification--success',
    iconName: 'success',
    messageKey: 'successPrefix',
    componentName: 'Notification.Success',
  },
  warning: {
    className: 'kv-notification--warning',
    iconName: 'warning',
    messageKey: 'warningPrefix',
    componentName: 'Notification.Warning',
  },
  danger: {
    className: 'kv-notification--danger',
    iconName: 'error',
    messageKey: 'dangerPrefix',
    componentName: 'Notification.Danger',
  },
} as const satisfies Record<
  NotificationVariant,
  {
    className: `kv-notification--${NotificationVariant}`
    iconName: 'info' | 'success' | 'warning' | 'error'
    messageKey: keyof KvirnMessages['notification']
    componentName: string
  }
>

const variants = Object.keys(statuses) as NotificationVariant[]

export interface UseNotificationOptions {
  /**
   * Makes the result a ready-made root: `rootProps` gets the status class, and `iconProps` and
   * `statusProps` are set, from the same table as `Notification.Info|Success|Warning|Danger`.
   * Without it, the result is the plain Root: only the classes, so you bring your own icon and
   * status word.
   */
  variant?: NotificationVariant | undefined
  /**
   * Announces the Title and Body text once, when the notification mounts, in the shared
   * Announcer's polite or assertive region (4.1.3). Set it only on a notification
   * inserted after an action, never on one present at load. Default: nothing is announced.
   */
  announce?: AnnouncerPoliteness | undefined
  /** Per-instance overrides for the status word. Only the key of `variant` is read. */
  messages?: Partial<KvirnMessages['notification']> | undefined
}

/** Spread on the root's element. A callback ref, which fits any element. */
export interface NotificationRootPartProps {
  /** `kv-notification`, plus `kv-notification--<variant>` with a `variant`. */
  className: 'kv-notification' | `kv-notification kv-notification--${NotificationVariant}`
  ref: RefCallback<HTMLElement>
}

/** Spread on the Title's element. The ref lets `announce` read its text. */
export interface NotificationTitlePartProps {
  className: 'kv-notification-title'
  ref: RefCallback<HTMLElement>
}

/** Spread on the Body's element. The ref lets `announce` read its text. */
export interface NotificationBodyPartProps {
  className: 'kv-notification-body'
  ref: RefCallback<HTMLElement>
}

export interface NotificationActionsPartProps {
  className: 'kv-notification-actions'
}

/** Spread on `<Icon>`: `<Icon {...notification.iconProps} />`. Decorative: the status is text. */
export interface NotificationIconPartProps {
  name: 'info' | 'success' | 'warning' | 'error'
  className: 'kv-notification-icon'
}

/** Spread on a `<span>` at the start of the Title: `<span {...notification.statusProps} />`. */
export interface NotificationStatusPartProps {
  className: 'kv-notification-status'
  /** The resolved status word, for example `Varning:`. */
  children: string
}

export interface UseNotificationResult {
  rootProps: NotificationRootPartProps
  titleProps: NotificationTitlePartProps
  bodyProps: NotificationBodyPartProps
  actionsProps: NotificationActionsPartProps
  /** The status icon. `undefined` without a `variant`: you bring your own. */
  iconProps: NotificationIconPartProps | undefined
  /** The status word's span. `undefined` without a `variant`: you bring your own. */
  statusProps: NotificationStatusPartProps | undefined
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
 * A notification's props for your own elements (contract: notification.a11y.md). It
 * adds no role, `aria-live`, `aria-atomic` or `tabindex`: the visible box is never a live
 * region, and `announce` goes through the Announcer once, on mount. Attach `titleProps` to the
 * Title and `bodyProps` to the Body, so `announce` can read their text.
 *
 * @example
 * const notification = useNotification({ variant: 'warning', announce: 'polite' })
 * <div {...notification.rootProps}>
 *   <Icon {...notification.iconProps} />
 *   <h2 {...notification.titleProps}>
 *     <span {...notification.statusProps} /> Ditt tillstånd går ut
 *   </h2>
 * </div>
 */
export function useNotification(
  options: UseNotificationOptions & { variant: NotificationVariant },
): UseNotificationResult & {
  iconProps: NotificationIconPartProps
  statusProps: NotificationStatusPartProps
}
export function useNotification(options?: UseNotificationOptions): UseNotificationResult
export function useNotification({
  variant,
  announce,
  messages,
}: UseNotificationOptions = {}): UseNotificationResult {
  const notificationMessages = useMessages('notification', messages)
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
        'notification-without-title',
        'A Notification needs a Title: it holds the status word and names the message.',
      )
    }
  }, [])

  useEffect(() => {
    if (announce === 'assertive' && (variant === 'info' || variant === 'success')) {
      warnOnce(
        'notification-assertive-info-success',
        `announce="assertive" interrupts the screen reader, so it is only for something the user must act on right now. ${variant === 'info' ? 'Notification.Info' : 'Notification.Success'} should use announce="polite", or none.`,
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
        'notification-live-region',
        'A Notification root has role="alert", role="status" or aria-live. It is announced through the Announcer (announce): a second live region reads it twice.',
      )
    }
    if (announce !== undefined && root.hasAttribute('tabindex')) {
      warnOnce(
        'notification-announce-and-focus',
        'A Notification root has tabindex and announce. Focus reads it already, so announcing it as well reads it twice. Use one of the two.',
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
        `notification-status-class-on-root:${otherClassName}`,
        `A plain Notification.Root has the class ${otherClassName}. That gives the ${otherStatus} colour without the icon and the status word. Use ${otherName}, or your own class with your own icon and word.`,
      )
    } else {
      warnOnce(
        `notification-conflicting-status:${variant}:${otherClassName}`,
        `${statuses[variant].componentName} has the class ${otherClassName}: the colour would say ${otherStatus} while the icon and the word say ${variant}. Use ${otherName}.`,
      )
    }
  })

  const word =
    variant === undefined ? undefined : notificationMessages[statuses[variant].messageKey]

  return useMemo<UseNotificationResult>(() => {
    const status = variant === undefined ? undefined : statuses[variant]
    return {
      rootProps: {
        className: status === undefined ? 'kv-notification' : `kv-notification ${status.className}`,
        ref: rootRef,
      },
      titleProps: { className: 'kv-notification-title', ref: titleRef },
      bodyProps: { className: 'kv-notification-body', ref: bodyRef },
      actionsProps: { className: 'kv-notification-actions' },
      iconProps:
        status === undefined
          ? undefined
          : { name: status.iconName, className: 'kv-notification-icon' },
      statusProps:
        word === undefined ? undefined : { className: 'kv-notification-status', children: word },
    }
  }, [variant, word, rootRef, titleRef, bodyRef])
}
