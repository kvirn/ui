import { createToastQueue } from '@kvirn-ui/core'
import type {
  Env,
  ToastInput,
  ToastQueue,
  ToastQueueOptions,
  ToastShowResult,
  ToastVariant,
} from '@kvirn-ui/core'
import { isValidElement } from 'react'
import type { ReactNode } from 'react'
import { isFocusTarget } from '../dialog/focus-return.ts'
import { warnOnce } from '../dev/dev-warning.ts'

export type { ToastVariant } from '@kvirn-ui/core'

export interface ToastShowOptions {
  /** `'info'` (default) or `'success'`. There is no warning or danger toast: an error is not a toast. */
  variant?: ToastVariant | undefined
  /** The message, one sentence in the user's words. It follows the status word in the toast. */
  title: string
  /** More to read, shown under the title. Optional. */
  body?: ReactNode | undefined
  /**
   * At most one action, such as Undo. The toast stays until it is dismissed, so it needs a
   * persistent alternative on the page. Pressing it runs `onPress`, then dismisses the toast.
   */
  action?: { label: string; onPress: () => void } | undefined
  /** Showing an id that is already shown updates that toast in place, and announces it once. */
  id?: string | undefined
  /**
   * `true` moves focus to the toast and announces nothing, because focus reads it. Only for a
   * user-initiated action whose trigger is gone: showing a toast otherwise never moves focus (3.2.2).
   */
  focus?: boolean | undefined
}

export interface ToastContent {
  variant: ToastVariant
  title: string
  body: ReactNode
  action: { label: string; onPress: () => void } | undefined
  /** The locale of the provider that showed it, for `lang` when it differs from the region's (3.1.2). */
  lang: string | undefined
}

export interface ToastController {
  readonly queue: ToastQueue
  /** `lang`: the locale of the caller's provider. Returns `''` when nothing was shown. */
  show: (options: ToastShowOptions, lang?: string) => string
  /** `preventScroll` for a press with the pointer, which must not scroll the page when focus returns. */
  dismiss: (id: string, preventScroll?: boolean) => boolean
  dismissAll: () => void
  focus: () => void
  contentOf: (id: string) => ToastContent | undefined
  /** The region's elements, so focus can be returned and read. */
  registerRegion: (element: HTMLElement | null) => void
  registerItem: (id: string, element: HTMLElement | null) => void
  itemElement: (id: string) => HTMLElement | undefined
  /** `true` once for a toast that was shown with `focus: true`: its announcement is skipped. */
  takeSilenced: (id: string) => boolean
  /** Focuses the title of a toast shown with `focus: true`, once it is in the page. */
  flushFocusRequest: () => void
  /**
   * Every outermost `KvirnProvider` of the page registers here. The first one is the host: it owns
   * the options and renders the region. When it unmounts the next one takes over and the toasts stay.
   * Returns the unregister function.
   */
  register: (providerId: symbol, options: ToastQueueOptions, isConfigured: boolean) => () => void
  updateOptions: (providerId: symbol, options: ToastQueueOptions) => void
  getHostId: () => symbol | undefined
  subscribeHost: (listener: () => void) => () => void
  isModalOpen: () => boolean
  /** The revision of each toast the page has already heard, so a new host region never says them again. */
  readonly announced: Map<string, number>
  /** Puts focus back where it was in the old host's region, once the new one is in the page. */
  restoreHandoverFocus: () => void
  /** `true` once for the first region that mounts after a handover (its toasts are not new). */
  takeHandover: () => boolean
}

const defaultLimit = 10

/** What a reader would need to read for the reading time: strings and numbers in the body. */
function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(nodeText).join(' ')
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children)
  }
  return ''
}

function isModalOpen(document: Document): boolean {
  try {
    return document.querySelector('dialog:modal') !== null
  } catch {
    return false
  }
}

interface HeldToast {
  content: ToastContent
  input: ToastInput
}

/**
 * Internal. Everything between `useToast()` and the region: the queue (timing, limit, order), what
 * each toast says (a React node cannot live in core), toasts held while a modal is open, and moving
 * focus when a toast that holds it goes. One per document (`getToastController`), shared by every
 * `KvirnProvider` on the page.
 * `env` is `undefined` while server rendering, when nothing can be shown.
 */
export function createToastController(
  env: Env | undefined,
  options: ToastQueueOptions = {},
): ToastController {
  const readLimit = (requested: number | undefined) =>
    requested !== undefined && Number.isFinite(requested) ? requested : defaultLimit
  let configuredLimit = readLimit(options.limit)
  const readAutoDismiss = (requested: false | number | undefined) => {
    if (requested === undefined || requested === false) {
      return false
    }
    if (Number.isFinite(requested) && requested > 0) {
      return requested
    }
    warnOnce(
      'toast-auto-dismiss-invalid',
      `autoDismiss must be false or a number of milliseconds above 0, got ${requested}. It is treated as false: no toast times out.`,
    )
    return false
  }
  let configuredAutoDismiss = readAutoDismiss(options.autoDismiss)
  const queue = createToastQueue(env, {
    limit: configuredLimit,
    autoDismiss: configuredAutoDismiss,
  })

  const contents = new Map<string, ToastContent>()
  const items = new Map<string, HTMLElement>()
  const held = new Map<string, HeldToast>()
  const silenced = new Set<string>()
  const announced = new Map<string, number>()
  let isHandoverPending = false
  let handoverFocus: { id: string | undefined; selector: string } | undefined
  let nextId = 1
  let region: HTMLElement | null = null
  let lastOutside: HTMLElement | null = null
  let focusRequest: string | undefined
  let stopWatchingModal: (() => void) | undefined
  let isConnected = false

  queue.subscribe(() => {
    const shown = new Set(queue.getState().visible.map((entry) => entry.id))
    for (const id of contents.keys()) {
      if (!shown.has(id)) {
        contents.delete(id)
        silenced.delete(id)
      }
    }
    for (const id of announced.keys()) {
      if (!shown.has(id)) {
        announced.delete(id)
      }
    }
    updateWatcher()
  })

  const closeOf = (id: string | undefined) =>
    id === undefined ? undefined : items.get(id)?.querySelector<HTMLElement>('.kv-alert-close')

  /**
   * Runs an operation that may remove toasts. If the toast that holds focus goes, focus returns to
   * the element that had it before it entered the region, else to the Close of the next toast, else
   * of the previous one, else nowhere: `body` is never a target, so the browser decides, and a
   * development warning says so. The removal is read from the queue, which is
   * updated at once, so focus moves while the toast is still in the page.
   */
  const focusFirst = (
    candidates: ReadonlyArray<HTMLElement | null | undefined>,
    preventScroll: boolean,
  ) => {
    for (const candidate of candidates) {
      if (isFocusTarget(candidate)) {
        candidate.focus({ preventScroll })
        if (candidate.ownerDocument.activeElement === candidate) {
          return true
        }
      }
    }
    return false
  }

  const warnIfFocusLost = (hasReturned: boolean) => {
    if (!hasReturned) {
      warnOnce(
        'toast-return-focus-lost',
        'A toast that held focus was removed and nothing could take focus back: the element focused before is gone and no other toast is left. The browser puts focus on the page, so the user loses their place (WCAG 2.4.3). Move focus to a sensible place when the action that removed the toast has run.',
      )
    }
  }

  const keepFocus = (operation: () => void, preventScroll = false) => {
    const active = env?.document.activeElement ?? null
    const focusedId = [...items].find(([, element]) => element.contains(active))?.[0]
    // The region itself holds focus while it scrolls (a Tab stop only then), and goes with its last toast.
    const regionHasFocus = region !== null && active === region
    const before = queue.getState().visible.map((entry) => entry.id)
    operation()
    if (focusedId === undefined) {
      if (regionHasFocus && queue.getState().visible.length === 0) {
        warnIfFocusLost(focusFirst([lastOutside], preventScroll))
      }
      return
    }
    const after = new Set(queue.getState().visible.map((entry) => entry.id))
    if (after.has(focusedId)) {
      return
    }
    const index = before.indexOf(focusedId)
    const next = before.slice(index + 1).find((id) => after.has(id))
    const previous = before.slice(0, index).findLast((id) => after.has(id))
    warnIfFocusLost(focusFirst([lastOutside, closeOf(next), closeOf(previous)], preventScroll))
  }

  /** `false` when the limit was reached and nothing could make room: the toast is ignored. */
  const place = ({ content, input }: HeldToast, wantsFocus: boolean): boolean => {
    const id = input.id as string
    contents.set(id, content)
    let result: ToastShowResult | undefined
    keepFocus(() => {
      result = queue.actions.show(input)
    })
    if (result === undefined || result.placement === 'ignored') {
      contents.delete(id)
      warnOnce(
        'toast-limit-reached',
        'A toast was ignored: the limit is reached and every toast that shows is persistent, or the user is on one. Toast sparingly, close what is done with (dismiss), or raise `toast.limit` on the KvirnProvider.',
      )
      return false
    }
    if (result.timerDropped) {
      warnOnce(
        'toast-timer-dropped',
        'autoDismiss asked for a timer, but a toast with an action never times out: the user may still be reaching for it. Give the action a persistent alternative on the page, since the toast can be closed.',
      )
    }
    if (wantsFocus) {
      focusRequest = id
      silenced.add(id)
    }
    return true
  }

  // While a modal `<dialog>` is open the region is inert: nobody can read, pause or reach a toast, so
  // timers stop (`modal`) and new toasts are held. The
  // modal's `open` attribute, its `close` event (which does not bubble) and its removal are watched
  // only while a toast shows or is held.
  function syncModal() {
    if (env === undefined) {
      return
    }
    if (isModalOpen(env.document)) {
      queue.actions.pause('modal')
      return
    }
    queue.actions.resume('modal')
    const entries = [...held.values()]
    held.clear()
    for (const entry of entries) {
      place(entry, false)
    }
  }

  function updateWatcher() {
    const isNeeded =
      isConnected && env !== undefined && (queue.getState().visible.length > 0 || held.size > 0)
    if (!isNeeded || env === undefined) {
      if (stopWatchingModal !== undefined) {
        stopWatchingModal()
        stopWatchingModal = undefined
        queue.actions.resume('modal')
      }
      return
    }
    if (stopWatchingModal === undefined) {
      const { document, window } = env
      document.addEventListener('close', syncModal, true)
      const observer = new window.MutationObserver(syncModal)
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['open'],
      })
      stopWatchingModal = () => {
        document.removeEventListener('close', syncModal, true)
        observer.disconnect()
      }
    }
    syncModal()
  }

  const applyOptions = (next: ToastQueueOptions) => {
    const nextLimit = readLimit(next.limit)
    if (nextLimit !== configuredLimit) {
      configuredLimit = nextLimit
      queue.actions.setLimit(nextLimit)
    }
    const nextAutoDismiss = readAutoDismiss(next.autoDismiss)
    if (nextAutoDismiss !== configuredAutoDismiss) {
      configuredAutoDismiss = nextAutoDismiss
      queue.actions.setAutoDismiss(nextAutoDismiss)
    }
  }

  const show = (options: ToastShowOptions, lang?: string): string => {
    if (env === undefined) {
      warnOnce(
        'toast-show-before-mount',
        'A toast was shown before the <KvirnProvider> has mounted (while server rendering, or in the first render), so it is dropped. Call show from an event handler or an effect.',
      )
      return ''
    }
    const id = options.id ?? `kv-toast-${nextId++}`
    let variant = options.variant ?? 'info'
    if (variant !== 'info' && variant !== 'success') {
      warnOnce(
        `toast-unsupported-variant:${String(variant)}`,
        `There is no "${String(variant)}" toast: a toast is info or success, and an error is not a toast. It is shown as info. Use an Alert or the field's ErrorMessage for something the user must act on.`,
      )
      variant = 'info'
    }
    const content: ToastContent = {
      variant,
      title: options.title,
      body: options.body,
      action: options.action,
      lang,
    }
    const input: ToastInput = {
      id,
      variant,
      text: [options.title, nodeText(options.body)].filter((part) => part !== '').join(' '),
      hasAction: options.action !== undefined,
    }
    if (isModalOpen(env.document)) {
      held.set(id, { content, input })
      updateWatcher()
    } else if (!place({ content, input }, options.focus === true)) {
      return ''
    }
    return id
  }

  const dismiss = (id: string, preventScroll = false): boolean => {
    const wasHeld = held.delete(id)
    if (focusRequest === id) {
      focusRequest = undefined
    }
    let dismissed = false
    keepFocus(() => {
      dismissed = queue.actions.dismiss(id)
    }, preventScroll)
    return dismissed || wasHeld
  }

  const dismissAll = () => {
    held.clear()
    silenced.clear()
    focusRequest = undefined
    keepFocus(() => {
      queue.actions.dismissAll()
    })
  }

  const focusTitle = (id: string | undefined) => {
    items
      .get(id ?? '')
      ?.querySelector<HTMLElement>('.kv-alert-title')
      ?.focus()
  }

  /** The page's own state, listened to while at least one provider is registered. Returns the cleanup. */
  const connectPage = () => {
    if (env === undefined) {
      return () => {}
    }
    const { document, window } = env
    let isWindowBlurred = false
    const syncHidden = () => {
      if (document.visibilityState === 'hidden' || isWindowBlurred) {
        queue.actions.pause('hidden')
      } else {
        queue.actions.resume('hidden')
      }
    }
    const onBlur = () => {
      isWindowBlurred = true
      syncHidden()
    }
    const onFocus = () => {
      isWindowBlurred = false
      syncHidden()
    }
    const onFocusIn = (event: FocusEvent) => {
      const { target } = event
      if (target instanceof window.HTMLElement && !region?.contains(target)) {
        lastOutside = target
      }
    }
    document.addEventListener('visibilitychange', syncHidden)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    document.addEventListener('focusin', onFocusIn, true)
    isConnected = true
    syncHidden()
    updateWatcher()
    return () => {
      isConnected = false
      document.removeEventListener('visibilitychange', syncHidden)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('focusin', onFocusIn, true)
      updateWatcher()
      held.clear()
      queue.actions.dismissAll()
    }
  }

  interface RegisteredProvider {
    id: symbol
    options: ToastQueueOptions
  }
  const providers: RegisteredProvider[] = []
  const hostListeners = new Set<() => void>()
  let disconnectPage: (() => void) | undefined
  const hostId = () => providers[0]?.id
  const notifyHost = () => {
    for (const listener of hostListeners) {
      listener()
    }
  }

  // Called while the old region is still in the page: focus inside it would otherwise fall to `body`.
  const rememberFocusForHandover = () => {
    handoverFocus = undefined
    const active = env?.document.activeElement
    if (!active || region === null || !region.contains(active)) {
      return
    }
    const id = [...items].find(([, element]) => element.contains(active))?.[0]
    const selector = ['.kv-alert-close', '.kv-alert-actions button', '.kv-alert-title'].find(
      (candidate) => active.matches(candidate),
    )
    handoverFocus = { id, selector: selector ?? '' }
  }

  const restoreHandoverFocus = () => {
    const pending = handoverFocus
    handoverFocus = undefined
    if (pending === undefined) {
      return
    }
    const item = pending.id === undefined ? undefined : items.get(pending.id)
    const target =
      pending.selector === '' ? region : item?.querySelector<HTMLElement>(pending.selector)
    const candidates = [target, lastOutside]
    if (!focusFirst(candidates, true)) {
      warnIfFocusLost(false)
    }
  }

  const register = (providerId: symbol, options: ToastQueueOptions, isConfigured: boolean) => {
    if (providers.length > 0 && isConfigured) {
      warnOnce(
        'toast-multiple-providers',
        'More than one <KvirnProvider> is on the page, and this one got `toast`, which is ignored: the toasts of the whole page share one queue and one region, configured by the first provider that mounted. Configure `toast` on that one.',
      )
    }
    const previousHost = hostId()
    providers.push({ id: providerId, options })
    if (providers.length === 1) {
      disconnectPage = connectPage()
    }
    if (hostId() !== previousHost) {
      applyOptions(options)
      notifyHost()
    }
    return () => {
      const index = providers.findIndex((candidate) => candidate.id === providerId)
      if (index === -1) {
        return
      }
      const wasHost = index === 0
      providers.splice(index, 1)
      if (providers.length === 0) {
        disconnectPage?.()
        disconnectPage = undefined
      } else if (wasHost) {
        rememberFocusForHandover()
        isHandoverPending = queue.getState().visible.length > 0
        applyOptions((providers[0] as RegisteredProvider).options)
      }
      if (wasHost) {
        notifyHost()
      }
    }
  }

  const updateOptions = (providerId: symbol, options: ToastQueueOptions) => {
    const provider = providers.find((candidate) => candidate.id === providerId)
    if (provider === undefined) {
      return
    }
    provider.options = options
    if (providers[0] === provider) {
      applyOptions(options)
    }
  }

  return {
    queue,
    show,
    dismiss,
    dismissAll,
    focus: () => {
      focusTitle(queue.getState().visible.at(-1)?.id)
    },
    register,
    updateOptions,
    getHostId: hostId,
    subscribeHost: (listener) => {
      hostListeners.add(listener)
      return () => {
        hostListeners.delete(listener)
      }
    },
    isModalOpen: () => env !== undefined && isModalOpen(env.document),
    announced,
    restoreHandoverFocus,
    takeHandover: () => {
      const pending = isHandoverPending
      isHandoverPending = false
      return pending
    },
    contentOf: (id) => contents.get(id),
    registerRegion: (element) => {
      region = element
    },
    registerItem: (id, element) => {
      if (element === null) {
        items.delete(id)
      } else {
        items.set(id, element)
      }
    },
    itemElement: (id) => items.get(id),
    takeSilenced: (id) => silenced.delete(id),
    flushFocusRequest: () => {
      const id = focusRequest
      focusRequest = undefined
      focusTitle(id)
    },
  }
}

const controllers = new WeakMap<Document, ToastController>()

/**
 * Internal. The page's one controller, made on first use, like the theme store: every provider on
 * the page shares one queue, one limit and one region.
 */
export function getToastController(env: Env): ToastController {
  let controller = controllers.get(env.document)
  if (controller === undefined) {
    controller = createToastController(env)
    controllers.set(env.document, controller)
  }
  return controller
}
