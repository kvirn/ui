import { createShiftSequence } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { useAnnouncer } from '../announcer/use-announcer.ts'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'

/** `armed`: one or two Shifts are counted. `leaving`: the page was hidden and `navigate` was called. */
export type QuickExitState = 'idle' | 'armed' | 'leaving'

const defaultWindowMs = 5000

const placeholderBase = 'http://localhost/'

/**
 * Internal. The URL a destination resolves to, or `undefined` when it isn't `http(s)`. The URL
 * parser decides, so `java\nscript:` and the like never pass. A scheme-less value is relative to `base`.
 */
export function resolveQuickExitHref(
  href: string | undefined,
  base: string = placeholderBase,
): string | undefined {
  if (href === undefined) {
    return undefined
  }
  try {
    const url = new URL(href, base)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

/** Internal. How many hooks have the shortcut on: two would both announce the Shift count. */
let mountedCount = 0

const hidePage = (document: Document) => {
  document.documentElement.style.setProperty('display', 'none', 'important')
  document.title = ''
}

const hasModifier = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey

export interface UseQuickExitOptions {
  /** Where to go: an `http(s)` URL, absolute or relative to the page. Anything else warns in development and navigates nowhere. */
  href: string | undefined
  /** Shift ×3 from anywhere on the page leaves it. `false` adds no listener. Default `true`. */
  shortcut?: boolean | undefined
  /**
   * How the page is left. Default `window.location.replace(href)`, so Back doesn't return to
   * the page. It must replace the history entry with a full navigation: a router push keeps the
   * entry and leaves a blank page. Substitute it for a spy in a test.
   */
  navigate?: ((href: string) => void) | undefined
  /** The longest gap between two Shift presses, in milliseconds. Default 5000. */
  windowMs?: number | undefined
  /** Per-instance message overrides: `{ label, hint, shortcutRemaining }`. */
  messages?: Partial<KvirnMessages['quickExit']> | undefined
}

/** Spread on the row element. */
export interface QuickExitRootPartProps {
  className: 'kv-quick-exit'
  /** `idle`, `armed` after one or two Shifts, `leaving` once the page is hidden. */
  'data-state': QuickExitState
}

/** Spread on an `<a href>`. */
export interface QuickExitLinkPartProps {
  className: 'kv-quick-exit-link'
  href: string | undefined
  rel: 'noreferrer'
  referrerPolicy: 'no-referrer'
  onClick: (event: MouseEvent<HTMLElement>) => void
  onAuxClick: (event: MouseEvent<HTMLElement>) => void
}

/** Spread on the hint's `<p>`. */
export interface QuickExitHintPartProps {
  className: 'kv-quick-exit-hint'
}

export interface UseQuickExitResult {
  rootProps: QuickExitRootPartProps
  linkProps: QuickExitLinkPartProps
  hintProps: QuickExitHintPartProps
  /** The message `quickExit.hint`: show it next to the link, and point the link's `aria-describedby` at it. */
  hint: string
  /** The message `quickExit.label`: the default text of the link. */
  label: string
  state: QuickExitState
}

/**
 * A quick exit's behaviour for your own `<div>` and `<a href>` (contract: quick-exit.a11y.md).
 * Activating the link, or pressing Shift three times within five seconds each, hides the page,
 * empties the title and navigates to `href` with `location.replace`.
 *
 * @example
 * const quickExit = useQuickExit({ href: 'https://www.smhi.se' })
 * <div {...quickExit.rootProps}><a {...quickExit.linkProps}>{quickExit.label}</a></div>
 */
export function useQuickExit({
  href,
  shortcut = true,
  navigate,
  windowMs = defaultWindowMs,
  messages,
}: UseQuickExitOptions): UseQuickExitResult {
  const env = useEnv()
  const quickExitMessages = useMessages('quickExit', messages)
  const { announce } = useAnnouncer()
  const [state, setState] = useState<QuickExitState>('idle')
  const isValid = resolveQuickExitHref(href) !== undefined

  useEffect(() => {
    if (href !== undefined && !isValid) {
      warnOnce(
        `quick-exit-href:${href}`,
        `QuickExit got href "${href}", which is not an http(s) URL, so activating it navigates nowhere.`,
      )
    }
  }, [href, isValid])

  useEffect(() => {
    if (!shortcut) {
      return
    }
    mountedCount += 1
    if (mountedCount > 1) {
      warnOnce(
        'quick-exit-multiple',
        'More than one QuickExit has the shortcut on, so each Shift press is announced twice and the page is left twice. Mount one.',
      )
    }
    return () => {
      mountedCount -= 1
    }
  }, [shortcut])

  const latest = useRef({ href, isValid, navigate, announce, quickExitMessages })
  useEffect(() => {
    latest.current = { href, isValid, navigate, announce, quickExitMessages }
  })

  const leave = useCallback(() => {
    const current = latest.current
    if (env === undefined || current.href === undefined) {
      return
    }
    const destination = /^\s*[a-z][a-z0-9+.-]*:/i.test(current.href)
      ? current.href
      : resolveQuickExitHref(current.href, env.window.location.href)
    if (!current.isValid || destination === undefined) {
      return
    }
    // Same tick, before the navigation: a slow destination never shows the page. `!important`
    // because the author's own `display` on `<body>` would win over `hidden`.
    hidePage(env.document)
    setState('leaving')
    if (current.navigate === undefined) {
      env.window.location.replace(destination)
    } else {
      current.navigate(destination)
    }
  }, [env])

  useEffect(() => {
    if (!shortcut || env === undefined) {
      return
    }
    const sequence = createShiftSequence({ count: 3, windowMs })
    let timer: number | undefined
    // A Shift counts when it goes up and nothing else happened while it was down: Shift+Tab,
    // Shift+letter and Shift+click are not a press (the GOV.UK approach).
    let isShiftClean = false
    const disarm = () => {
      sequence.reset()
      if (timer !== undefined) {
        env.window.clearTimeout(timer)
        timer = undefined
      }
      setState((current) => (current === 'leaving' ? current : 'idle'))
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }
      if (event.key === 'Shift') {
        // Alt+Shift, Control+Shift and Meta+Shift switch layouts or drive the screen reader.
        isShiftClean = !hasModifier(event)
        if (!isShiftClean) {
          disarm()
        }
        return
      }
      isShiftClean = false
      disarm()
    }
    const onPointerDown = () => {
      isShiftClean = false
      disarm()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Shift') {
        return
      }
      const wasClean = isShiftClean
      isShiftClean = false
      if (!wasClean || hasModifier(event) || !latest.current.isValid) {
        return
      }
      const result = sequence.press(event.timeStamp)
      if (result.complete) {
        disarm()
        leave()
        return
      }
      setState('armed')
      if (timer !== undefined) {
        env.window.clearTimeout(timer)
      }
      timer = env.window.setTimeout(disarm, windowMs)
      latest.current.announce(
        latest.current.quickExitMessages.shortcutRemaining({ remaining: result.remaining }),
      )
    }
    env.document.addEventListener('keydown', onKeyDown)
    env.document.addEventListener('keyup', onKeyUp)
    env.document.addEventListener('pointerdown', onPointerDown)
    return () => {
      env.document.removeEventListener('keydown', onKeyDown)
      env.document.removeEventListener('keyup', onKeyUp)
      env.document.removeEventListener('pointerdown', onPointerDown)
      if (timer !== undefined) {
        env.window.clearTimeout(timer)
      }
    }
  }, [shortcut, env, leave, windowMs])

  const activate = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    leave()
  }

  return {
    rootProps: { className: 'kv-quick-exit', 'data-state': state },
    linkProps: {
      className: 'kv-quick-exit-link',
      href: isValid ? href : undefined,
      rel: 'noreferrer',
      referrerPolicy: 'no-referrer',
      onClick: activate,
      onAuxClick: (event) => {
        if (event.button === 1) {
          activate(event)
        }
      },
    },
    hintProps: { className: 'kv-quick-exit-hint' },
    hint: quickExitMessages.hint,
    label: quickExitMessages.label,
    state,
  }
}
