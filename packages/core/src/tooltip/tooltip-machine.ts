/** Why a tooltip opened or closed, as `onOpenChange` reports it. */
export type TooltipChangeReason =
  | 'hover'
  | 'focus'
  | 'escape'
  | 'pointer-leave'
  | 'blur'
  | 'trigger-press'

/** The pointer rests this long on the trigger before the tooltip opens, in milliseconds. */
export const defaultTooltipDelay = 500
/** After the pointer leaves, the tooltip waits this long, so the pointer can cross the gap to it. */
export const defaultTooltipCloseDelay = 100
/** Within this long after a tooltip closed, the next one opens without its delay. */
export const defaultTooltipSkipDelay = 300

/** The clock a tooltip machine uses. The default is the global `setTimeout` and `Date.now`. */
export interface TooltipTimers {
  setTimeout: (callback: () => void, milliseconds: number) => unknown
  clearTimeout: (handle: unknown) => void
  now: () => number
}

/**
 * Where tooltips share their delay: once one has opened, moving on to the next one opens it
 * without the delay, and only one tooltip of a group is open at a time.
 */
export interface TooltipGroup {
  /** Whether a tooltip is open, or one closed so recently that the next opens without its delay. */
  isWarm: () => boolean
  /** A tooltip opened. The one that was open is closed at once. */
  opened: (close: () => void) => void
  /**
   * A tooltip follows its owner's `open` (a controlled tooltip): it takes the place of the open
   * tooltip only when there is none, and never closes another, so an owner that keeps one open
   * doesn't fight the tooltip that is open now.
   */
  adopted: (close: () => void) => void
  /**
   * A tooltip closed because another opened, while the keyboard focus is still on its trigger:
   * `reopen` runs when the group has no open tooltip again.
   */
  displaced: (reopen: () => void) => void
  /** A tooltip closed. It starts the window in which the next one opens without its delay. */
  closed: (close: () => void) => void
}

export interface TooltipGroupOptions {
  /** How long after a close the next tooltip skips its delay. Default 300. */
  skipDelay?: number | undefined
  timers?: Pick<TooltipTimers, 'now'> | undefined
}

/** A group of its own, for tooltips that should share a delay apart from the rest of the page. */
export function createTooltipGroup({
  skipDelay = defaultTooltipSkipDelay,
  timers,
}: TooltipGroupOptions = {}): TooltipGroup {
  let current: (() => void) | undefined
  let lastClosedAt = Number.NEGATIVE_INFINITY
  let waiting: Array<() => void> = []
  const now = () => (timers === undefined ? Date.now() : timers.now())

  return {
    isWarm: () => current !== undefined || now() - lastClosedAt < skipDelay,
    opened: (close) => {
      const previous = current
      current = close
      if (previous !== undefined && previous !== close) {
        previous()
      }
    },
    adopted: (close) => {
      current ??= close
    },
    displaced: (reopen) => {
      waiting.push(reopen)
    },
    closed: (close) => {
      if (current === close) {
        current = undefined
      }
      lastClosedAt = now()
      if (current === undefined && waiting.length > 0) {
        const reopeners = waiting
        waiting = []
        for (const reopen of reopeners) {
          reopen()
        }
      }
    },
  }
}

let pageGroup: TooltipGroup | undefined

/** The group every tooltip shares unless it is given its own. Created on first use, so importing this touches nothing. */
export function getTooltipGroup(): TooltipGroup {
  pageGroup ??= createTooltipGroup()
  return pageGroup
}

export interface TooltipMachineOptions {
  /** Called when the user opens or closes the tooltip. The owner decides: it only asks. */
  onOpenChange: (open: boolean, reason: TooltipChangeReason) => void
  /** Milliseconds of hover before it opens. Default 500. Keyboard focus opens it at once. */
  delay?: number | undefined
  /** Milliseconds after the pointer leaves before it closes. Default 100. */
  closeDelay?: number | undefined
  /** Default: the page's group (`getTooltipGroup()`). */
  group?: TooltipGroup | undefined
  timers?: TooltipTimers | undefined
}

export interface TooltipMachine {
  isOpen: () => boolean
  /** Follows the owner's state (a controlled `open`), without asking for anything. */
  sync: (open: boolean) => void
  /** Changes the delays and the group, for the next event. */
  configure: (options: Pick<TooltipMachineOptions, 'delay' | 'closeDelay' | 'group'>) => void
  /** The pointer is on the trigger or on the tooltip. */
  pointerEnter: () => void
  /** The pointer left the trigger or the tooltip. */
  pointerLeave: () => void
  /** The trigger got focus. Only focus that shows a focus ring (the keyboard's) opens the tooltip. */
  focus: (isKeyboardFocus: boolean) => void
  /** The trigger lost focus. */
  blur: () => void
  /** A pointer press on the trigger: it hides the tooltip until the pointer leaves and comes back. */
  press: () => void
  /** Escape. Hides the tooltip until the pointer leaves and comes back, or focus does. */
  escape: () => void
  /** While suppressed (the trigger's own popup is open) the tooltip is closed and stays closed. */
  suppress: (isSuppressed: boolean) => void
  /** Clears the timers. The machine can be used again afterwards. */
  destroy: () => void
}

function getDefaultTimers(): TooltipTimers {
  return {
    setTimeout: (callback, milliseconds) => globalThis.setTimeout(callback, milliseconds),
    clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
    now: () => Date.now(),
  }
}

/**
 * The timing of a tooltip (WCAG 1.4.13, contract: tooltip.a11y.md). It holds no DOM and no React:
 * the owner tells it what the pointer and the focus do, and it asks `onOpenChange` to open or
 * close. Hover opens after `delay`, keyboard focus at once, and the next tooltip at once when one
 * is open or closed less than 300 ms ago (the group). It stays open while the pointer is on the
 * trigger or the tooltip, with a grace period of `closeDelay` to cross the gap, and while the
 * trigger has keyboard focus. Escape and a press on the trigger hide it until the pointer leaves
 * and comes back, or focus does. It never closes on a timer alone.
 */
export function createTooltipMachine(options: TooltipMachineOptions): TooltipMachine {
  const timers = options.timers ?? getDefaultTimers()
  let delay = options.delay ?? defaultTooltipDelay
  let closeDelay = options.closeDelay ?? defaultTooltipCloseDelay
  let group: TooltipGroup | undefined = options.group

  let open = false
  let isHovering = false
  let hasKeyboardFocus = false
  /** Hidden by Escape or a press, until the pointer leaves and comes back. */
  let isHoverDismissed = false
  /** Hidden by Escape or a press, until focus leaves and comes back. */
  let isFocusDismissed = false
  let isSuppressed = false
  let openTimer: unknown
  let closeTimer: unknown

  const getGroup = () => (group ??= getTooltipGroup())

  const clearOpenTimer = () => {
    if (openTimer !== undefined) {
      timers.clearTimeout(openTimer)
      openTimer = undefined
    }
  }
  const clearCloseTimer = () => {
    if (closeTimer !== undefined) {
      timers.clearTimeout(closeTimer)
      closeTimer = undefined
    }
  }

  /** Whether the pointer or the focus still asks for the tooltip. */
  const isWanted = () =>
    !isSuppressed && ((isHovering && !isHoverDismissed) || (hasKeyboardFocus && !isFocusDismissed))

  const closeFromGroup = () => {
    if (open) {
      clearOpenTimer()
      clearCloseTimer()
      open = false
      getGroup().closed(closeFromGroup)
      // Pushed out by another tooltip while the keyboard focus is still here: it comes back when that one closes.
      if (hasKeyboardFocus && !isFocusDismissed && !isSuppressed) {
        getGroup().displaced(reopenFromGroup)
      }
      options.onOpenChange(false, 'pointer-leave')
    }
  }

  const reopenFromGroup = () => {
    if (!open && hasKeyboardFocus && !isFocusDismissed && !isSuppressed) {
      openNow('focus')
    }
  }

  const openNow = (reason: TooltipChangeReason) => {
    clearOpenTimer()
    clearCloseTimer()
    if (open) {
      return
    }
    open = true
    getGroup().opened(closeFromGroup)
    options.onOpenChange(true, reason)
  }

  const closeNow = (reason: TooltipChangeReason) => {
    clearOpenTimer()
    clearCloseTimer()
    if (!open) {
      return
    }
    open = false
    getGroup().closed(closeFromGroup)
    options.onOpenChange(false, reason)
  }

  const dismiss = (reason: TooltipChangeReason) => {
    isHoverDismissed = isHovering
    isFocusDismissed = hasKeyboardFocus
    closeNow(reason)
  }

  return {
    isOpen: () => open,
    sync: (next) => {
      if (next === open) {
        return
      }
      clearOpenTimer()
      clearCloseTimer()
      open = next
      if (next) {
        getGroup().adopted(closeFromGroup)
      } else {
        getGroup().closed(closeFromGroup)
      }
    },
    configure: (next) => {
      delay = next.delay ?? defaultTooltipDelay
      closeDelay = next.closeDelay ?? defaultTooltipCloseDelay
      group = next.group
    },
    pointerEnter: () => {
      isHovering = true
      clearCloseTimer()
      if (isSuppressed || isHoverDismissed || open) {
        return
      }
      clearOpenTimer()
      if (delay <= 0 || getGroup().isWarm()) {
        openNow('hover')
      } else {
        openTimer = timers.setTimeout(() => {
          openTimer = undefined
          openNow('hover')
        }, delay)
      }
    },
    pointerLeave: () => {
      isHovering = false
      isHoverDismissed = false
      clearOpenTimer()
      if (!open || isWanted()) {
        return
      }
      if (closeDelay <= 0) {
        closeNow('pointer-leave')
        return
      }
      clearCloseTimer()
      closeTimer = timers.setTimeout(() => {
        closeTimer = undefined
        if (!isWanted()) {
          closeNow('pointer-leave')
        }
      }, closeDelay)
    },
    focus: (isKeyboardFocus) => {
      if (!isKeyboardFocus) {
        return
      }
      hasKeyboardFocus = true
      if (isSuppressed || isFocusDismissed) {
        return
      }
      openNow('focus')
    },
    blur: () => {
      hasKeyboardFocus = false
      isFocusDismissed = false
      if (open && !isWanted()) {
        closeNow('blur')
      }
    },
    press: () => dismiss('trigger-press'),
    escape: () => dismiss('escape'),
    suppress: (next) => {
      isSuppressed = next
      if (next) {
        closeNow('trigger-press')
      }
    },
    destroy: () => {
      clearOpenTimer()
      clearCloseTimer()
      if (open) {
        open = false
        getGroup().closed(closeFromGroup)
      }
    },
  }
}
