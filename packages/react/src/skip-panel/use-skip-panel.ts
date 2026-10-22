import { getRovingTarget, matchShortcut, shortcutKeys, toAriaKeyShortcuts } from '@kvirn-ui/core'
import type { Env, Shortcut, ShortcutKey } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { FocusEvent, KeyboardEvent, MouseEvent, RefObject } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { useEnv } from '../provider/use-env.ts'
import { useMessages } from '../provider/use-messages.ts'
import { useSkipLink } from '../skip-link/use-skip-link.ts'
import type { SkipPanelContextValue } from './skip-panel-context.ts'
import { SkipPanelContext } from './skip-panel-context.ts'

export interface UseSkipPanelOptions {
  /** Opens the list again from anywhere on the page: it focuses the first Link. No default. */
  reopenShortcut?: Shortcut | undefined
  /** `false` adds no listener and drops the key caps and `aria-keyshortcuts`. Default `true`. */
  shortcutsEnabled?: boolean | undefined
}

/** Spread on the Root's `<div>`. */
export interface SkipPanelRootPartProps {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-skip-panel`. */
  className: 'kv-skip-panel'
  /** Set after Escape on the floating list: only the focused item stays visible. */
  'data-collapsed'?: ''
  /** Set while the list was opened by `reopenShortcut`. */
  'data-reopened'?: ''
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
  /** Keeps focus in the card when a row is pressed, since Safari and Firefox on macOS don't focus a button on mousedown. */
  onMouseDown: (event: MouseEvent<HTMLElement>) => void
}

export interface SkipPanelListPartProps {
  className: 'kv-skip-panel__list'
  role: 'list'
}

export interface SkipPanelItemPartProps {
  className: 'kv-skip-panel__item'
}

export interface SkipPanelGroupPartProps {
  className: 'kv-skip-panel__group'
  role: 'group'
  'aria-labelledby': string
}

export interface SkipPanelLabelPartProps {
  className: 'kv-skip-panel__label'
  id: string
}

/** Spread on the Link's `<a>`. */
export interface SkipPanelLinkPartProps {
  className: 'kv-skip-panel__link'
  href: string
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void
}

/** Spread on the Shortcut's button or link. */
export interface SkipPanelShortcutPartProps {
  className: 'kv-skip-panel__shortcut'
  'aria-keyshortcuts'?: string
}

/** Spread on the HelpLink's `<a>`. */
export interface SkipPanelHelpLinkPartProps {
  className: 'kv-skip-panel__help-link'
}

export interface SkipPanelHintPartProps {
  className: 'kv-skip-panel__hint'
}

export type SkipPanelPartProps = SkipPanelRootPartProps

export interface UseSkipPanelResult {
  rootProps: SkipPanelRootPartProps
  listProps: SkipPanelListPartProps
  itemProps: SkipPanelItemPartProps
  hintProps: SkipPanelHintPartProps
  /** The Root's element, for the parts' own code. */
  rootRef: RefObject<HTMLElement | null>
  /** What the parts share. Your own parts read it through `SkipPanelContext`. */
  context: SkipPanelContextValue
  collapsed: boolean
  reopened: boolean
}

interface RegisteredShortcut {
  shortcut: Shortcut
  elementRef: RefObject<HTMLElement | null>
}

const textInputTypes = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
])

function isEditable(target: EventTarget | null): boolean {
  if (target === null || !('tagName' in target)) {
    return false
  }
  const element = target as HTMLElement
  if (element.isContentEditable) {
    return true
  }
  const tag = element.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') {
    return true
  }
  if (tag === 'INPUT') {
    return textInputTypes.has((element as HTMLInputElement).type)
  }
  return element.closest('[role="textbox"], [role="searchbox"], [role="combobox"]') !== null
}

function isApplePlatform(env: Env | undefined): boolean {
  if (env === undefined) {
    return false
  }
  const { navigator } = env.window
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform
  return /mac|iphone|ipad|ipod/i.test(platform)
}

function isModal(dialog: Element): boolean {
  try {
    return dialog.matches(':modal')
  } catch {
    // Safari before 15.6 has no :modal: treat the dialog as not modal.
    return false
  }
}

const itemSelector = '.kv-skip-panel__link, .kv-skip-panel__shortcut, .kv-skip-panel__help-link'

// Roving tabindex by attribute: the parts render none, so the first render has no stop to lose.
function syncItems(root: HTMLElement, stop: HTMLElement | null, describedById: string | undefined) {
  const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector))
  const firstLink = items.find((item) => item.classList.contains('kv-skip-panel__link'))
  const current = stop !== null && items.includes(stop) ? stop : (firstLink ?? items[0])
  for (const item of items) {
    item.setAttribute('tabindex', item === current ? '0' : '-1')
    const ids = (item.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id !== '')
    const others = ids.filter((id) => id !== describedById)
    const next =
      item === firstLink && describedById !== undefined ? [...others, describedById] : others
    if (next.length > 0) {
      item.setAttribute('aria-describedby', next.join(' '))
    } else if (ids.length > 0) {
      item.removeAttribute('aria-describedby')
    }
  }
}

// A chord must not reach past an inert subtree or an open modal dialog that doesn't hold the card.
function isBlocked(env: Env, root: HTMLElement): boolean {
  if (root.closest('[inert]') !== null) {
    return true
  }
  return Array.from(env.document.querySelectorAll('dialog[open]')).some(
    (dialog) => isModal(dialog) && !dialog.contains(root),
  )
}

function warnAboutShortcut(shortcut: Shortcut, apple: boolean): void {
  const written = toAriaKeyShortcuts(shortcut, { apple })
  if (
    shortcut.key.length === 1 &&
    shortcut.alt !== true &&
    shortcut.ctrl !== true &&
    shortcut.meta !== true &&
    shortcut.mod !== true
  ) {
    warnOnce(
      `skip-panel-bare-shortcut:${written}`,
      `SkipPanel shortcut ${written} is a single character with no Alt, Ctrl or Meta, so it fires while someone types or uses speech input (2.1.4). Add a modifier.`,
    )
  }
  if (shortcut.mod === true && (shortcut.ctrl === true || shortcut.meta === true)) {
    warnOnce(
      `skip-panel-mod-shortcut:${written}`,
      `SkipPanel shortcut ${written} has mod and also ctrl or meta, so it asks for the same modifier twice or for both. Use mod alone: it is Command on Apple and Ctrl elsewhere.`,
    )
  }
  if ((shortcut.ctrl === true || (shortcut.mod === true && !apple)) && shortcut.alt === true) {
    warnOnce(
      `skip-panel-altgr-shortcut:${written}`,
      `SkipPanel shortcut ${written} is Ctrl+Alt, which is AltGr on Windows and types characters on Nordic layouts, so it never fires there. Use Alt+Shift.`,
    )
  }
}

// A div or main has a tabIndex of -1 without the attribute, so the attribute is what tells.
function focusTarget(env: Env, href: string): void {
  if (!href.startsWith('#') || href.length === 1) {
    return
  }
  let id = href.slice(1)
  try {
    id = decodeURIComponent(id)
  } catch {
    // keep the raw id
  }
  const target = env.document.getElementById(id)
  if (target === null) {
    return
  }
  if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  target.focus()
}

/**
 * A skip panel's Root: the reopen and Escape state and the page-wide chords (contract:
 * skip-panel.a11y.md). One `keydown` listener on the document, only while `shortcutsEnabled`.
 *
 * @example
 * const skipPanel = useSkipPanel({ reopenShortcut: { key: 'k', alt: true, shift: true } })
 * <SkipPanelContext.Provider value={skipPanel.context}>
 *   <div {...skipPanel.rootProps} ref={skipPanel.rootRef}>…</div>
 * </SkipPanelContext.Provider>
 */
export function useSkipPanel({
  reopenShortcut,
  shortcutsEnabled = true,
}: UseSkipPanelOptions = {}): UseSkipPanelResult {
  const env = useEnv()
  const rootRef = useRef<HTMLElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const registry = useRef(new Set<RegisteredShortcut>())
  const [collapsed, setCollapsed] = useState(false)
  const [reopened, setReopened] = useState(false)
  const apple = isApplePlatform(env)

  const registerShortcut = useCallback<SkipPanelContextValue['registerShortcut']>(
    (shortcut, elementRef) => {
      warnAboutShortcut(shortcut, apple)
      const entry = { shortcut, elementRef }
      registry.current.add(entry)
      return () => {
        registry.current.delete(entry)
      }
    },
    [apple],
  )

  const arrowHintId = `${useId()}-arrow-hint`
  const stopRef = useRef<HTMLElement | null>(null)
  const hintCount = useRef(0)
  const syncStops = useCallback(() => {
    if (rootRef.current !== null) {
      syncItems(rootRef.current, stopRef.current, hintCount.current > 0 ? arrowHintId : undefined)
    }
  }, [arrowHintId])
  const registerArrowHint = useCallback(() => {
    hintCount.current += 1
    syncStops()
    return () => {
      hintCount.current -= 1
      syncStops()
    }
  }, [syncStops])
  const registerItem = useCallback(() => {
    syncStops()
    // The node is still attached while a layout cleanup runs on unmount.
    return () => queueMicrotask(syncStops)
  }, [syncStops])
  useLayoutEffect(syncStops)
  useEffect(() => {
    if (hintCount.current === 0) {
      warnOnce(
        'skip-panel-hint-missing',
        'SkipPanel has no SkipPanel.Hint, so the first link has no description of the arrow keys and keyboard users are not told that the arrow keys move between items. Put <SkipPanel.Hint /> inside Root.',
      )
    }
  }, [])

  const latest = useRef({ reopenShortcut, reopened })
  useEffect(() => {
    latest.current = { reopenShortcut, reopened }
  })

  const reopenWritten =
    reopenShortcut === undefined ? undefined : toAriaKeyShortcuts(reopenShortcut, { apple })
  useEffect(() => {
    if (reopenShortcut !== undefined) {
      warnAboutShortcut(reopenShortcut, apple)
    }
    // Keyed by the written chord: an inline object is new on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reopenWritten])

  useEffect(() => {
    if (!shortcutsEnabled || env === undefined) {
      return
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      // Chrome's autofill dispatches a plain Event named keydown, with no key or getModifierState.
      if (typeof event.getModifierState !== 'function') {
        return
      }
      if (event.repeat) {
        return
      }
      const keyEvent = {
        key: event.key,
        code: event.code,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        // Apple keyboards have no AltGr, and Firefox on macOS may report it while Option is held.
        altGraph: event.getModifierState('AltGraph') && !(apple && event.altKey),
        editable: isEditable(event.target),
      }
      const root = rootRef.current
      if (root === null || isBlocked(env, root)) {
        return
      }
      const reopen = latest.current.reopenShortcut
      if (reopen !== undefined && matchShortcut(keyEvent, reopen, { apple })) {
        const firstLink = root.querySelector<HTMLElement>('.kv-skip-panel__link')
        if (firstLink === null) {
          return
        }
        event.preventDefault()
        const active = env.document.activeElement
        if (
          active instanceof HTMLElement &&
          active !== env.document.body &&
          !root.contains(active)
        ) {
          returnFocusRef.current = active
        }
        setReopened(true)
        firstLink.focus()
        return
      }
      for (const entry of registry.current) {
        if (matchShortcut(keyEvent, entry.shortcut, { apple })) {
          event.preventDefault()
          entry.elementRef.current?.click()
          return
        }
      }
    }
    env.document.addEventListener('keydown', onKeyDown)
    return () => env.document.removeEventListener('keydown', onKeyDown)
  }, [env, shortcutsEnabled, apple])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) {
      return
    }
    if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(itemSelector))
      const currentIndex = items.indexOf(event.target as HTMLElement)
      const target =
        currentIndex === -1
          ? null
          : getRovingTarget({
              key: event.key,
              currentIndex,
              count: items.length,
              orientation: 'vertical',
              direction: 'ltr',
              loop: false,
            })
      if (target !== null) {
        event.preventDefault()
        items[target]?.focus()
        return
      }
    }
    if (event.key !== 'Escape') {
      return
    }
    if (reopened) {
      event.preventDefault()
      setReopened(false)
      const previous = returnFocusRef.current
      returnFocusRef.current = null
      if (previous !== null && previous.isConnected) {
        previous.focus()
      } else if (env !== undefined) {
        const href = rootRef.current
          ?.querySelector<HTMLAnchorElement>('.kv-skip-panel__link')
          ?.getAttribute('href')
        if (href !== null && href !== undefined) {
          focusTarget(env, href)
        }
      }
      return
    }
    setCollapsed(true)
  }

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.matches(itemSelector)) {
      stopRef.current = target
      syncStops()
    }
  }

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) {
      return
    }
    stopRef.current = null
    syncStops()
    setCollapsed(false)
    setReopened(false)
    returnFocusRef.current = null
  }

  const onMouseDown = (event: MouseEvent<HTMLElement>) => {
    const active = env?.document.activeElement
    if (
      active instanceof HTMLElement &&
      event.currentTarget.contains(active) &&
      event.target instanceof Node &&
      !active.contains(event.target)
    ) {
      event.preventDefault()
    }
  }

  const context = useMemo(
    () => ({
      shortcutsEnabled,
      apple,
      reopenShortcut,
      arrowHintId,
      registerArrowHint,
      registerItem,
      syncItems: syncStops,
      registerShortcut,
    }),
    // The chord is read through its written form: an inline object changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      shortcutsEnabled,
      apple,
      reopenWritten,
      arrowHintId,
      registerArrowHint,
      registerItem,
      syncStops,
      registerShortcut,
    ],
  )

  return {
    rootProps: {
      className: 'kv-skip-panel',
      ...(collapsed ? { 'data-collapsed': '' as const } : {}),
      ...(reopened ? { 'data-reopened': '' as const } : {}),
      onKeyDown,
      onFocus,
      onBlur,
      onMouseDown,
    },
    listProps: { className: 'kv-skip-panel__list', role: 'list' },
    itemProps: { className: 'kv-skip-panel__item' },
    hintProps: { className: 'kv-skip-panel__hint' },
    rootRef,
    context,
    collapsed,
    reopened,
  }
}

export interface UseSkipPanelGroupResult {
  groupProps: SkipPanelGroupPartProps
  labelProps: SkipPanelLabelPartProps
}

/** A group named by its visible Label. */
export function useSkipPanelGroup(): UseSkipPanelGroupResult {
  const labelId = useId()
  return {
    groupProps: { className: 'kv-skip-panel__group', role: 'group', 'aria-labelledby': labelId },
    labelProps: { className: 'kv-skip-panel__label', id: labelId },
  }
}

// An item joins the roving tabindex when it mounts, and keeps the first Link's description merged
// with the consumer's own `aria-describedby` after each render.
function useItemSync(): void {
  const context = useContext(SkipPanelContext)
  const registerItem = context?.registerItem
  const syncItems = context?.syncItems
  useLayoutEffect(() => registerItem?.(), [registerItem])
  useLayoutEffect(() => syncItems?.())
}

export interface UseSkipPanelLinkOptions {
  /** A same-page address, `#main`. */
  href: string
  messages?: Partial<KvirnMessages['skipPanel']> | undefined
}

export interface UseSkipPanelLinkResult {
  linkProps: SkipPanelLinkPartProps
  /** The message `skipPanel.mainContent`: the default text of the link. */
  label: string
}

/** A Link's props: the focus logic is SkipLink's. */
export function useSkipPanelLink({
  href,
  messages,
}: UseSkipPanelLinkOptions): UseSkipPanelLinkResult {
  const { skipLinkProps } = useSkipLink({ href })
  const skipPanelMessages = useMessages('skipPanel', messages)
  useItemSync()
  return {
    linkProps: { className: 'kv-skip-panel__link', href, onClick: skipLinkProps.onClick },
    label: skipPanelMessages.mainContent,
  }
}

export interface UseSkipPanelKeysResult {
  /** The key caps in order, with their text. Empty while shortcuts are off. */
  keys: readonly { key: ShortcutKey; text: string }[]
  /** The message `keys.joiner`, between the key caps. */
  joiner: string
}

function useShortcutKeys(shortcut: Shortcut | undefined): UseSkipPanelKeysResult {
  const context = useContext(SkipPanelContext)
  const keyMessages = useMessages('keys')
  if (shortcut === undefined || context === null || !context.shortcutsEnabled) {
    return { keys: [], joiner: keyMessages.joiner }
  }
  return {
    keys: shortcutKeys(shortcut, { apple: context.apple }).map((key) => ({
      key,
      text: key.type === 'modifier' ? keyMessages[key.name] : key.label,
    })),
    joiner: keyMessages.joiner,
  }
}

export interface UseSkipPanelShortcutOptions {
  shortcut: Shortcut
  /** The element the chord activates. */
  elementRef: RefObject<HTMLElement | null>
}

export interface UseSkipPanelShortcutResult extends UseSkipPanelKeysResult {
  shortcutProps: SkipPanelShortcutPartProps
}

/** A Shortcut row: it registers its chord with the Root and gives the key caps. */
export function useSkipPanelShortcut({
  shortcut,
  elementRef,
}: UseSkipPanelShortcutOptions): UseSkipPanelShortcutResult {
  const context = useContext(SkipPanelContext)
  const registerShortcut = context?.registerShortcut
  const enabled = context?.shortcutsEnabled === true
  const apple = context?.apple === true
  const written = toAriaKeyShortcuts(shortcut, { apple })
  useEffect(() => {
    if (!enabled || registerShortcut === undefined) {
      return
    }
    return registerShortcut(shortcut, elementRef)
    // Keyed by the written chord: an inline object is new on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, registerShortcut, written, elementRef])
  const keys = useShortcutKeys(shortcut)
  useItemSync()
  return {
    ...keys,
    shortcutProps: {
      className: 'kv-skip-panel__shortcut',
      ...(enabled ? { 'aria-keyshortcuts': written } : {}),
    },
  }
}

export interface UseSkipPanelHintResult extends UseSkipPanelKeysResult {
  hintProps: SkipPanelHintPartProps
  /** The arrow-key sentence and the id the first Link's `aria-describedby` points at. */
  arrowHint: { id: string | undefined; text: string }
  /** The sentence around `{keys}`: `before` and `after`. `undefined` when there is nothing to say. */
  sentence: { before: string; after: string } | undefined
}

/**
 * The Hint: the arrow-key sentence the first Link is described by, then how to open the list again
 * when there is a `reopenShortcut`.
 */
export function useSkipPanelHint(): UseSkipPanelHintResult {
  const context = useContext(SkipPanelContext)
  const registerArrowHint = context?.registerArrowHint
  useLayoutEffect(() => registerArrowHint?.(), [registerArrowHint])
  const skipPanelMessages = useMessages('skipPanel')
  const keys = useShortcutKeys(context?.reopenShortcut)
  const [before = '', after = ''] = skipPanelMessages.reopenHint.split('{keys}')
  return {
    ...keys,
    hintProps: { className: 'kv-skip-panel__hint' },
    arrowHint: { id: context?.arrowHintId, text: skipPanelMessages.arrowHint },
    sentence: keys.keys.length === 0 ? undefined : { before, after },
  }
}

export interface UseSkipPanelHelpLinkOptions {
  messages?: Partial<KvirnMessages['skipPanel']> | undefined
}

export interface UseSkipPanelHelpLinkResult {
  helpLinkProps: SkipPanelHelpLinkPartProps
  /** The message `skipPanel.helpLink`: the default text of the link. */
  label: string
}

/** The HelpLink's props: an item in the roving set that follows its `href` natively. */
export function useSkipPanelHelpLink({
  messages,
}: UseSkipPanelHelpLinkOptions = {}): UseSkipPanelHelpLinkResult {
  const skipPanelMessages = useMessages('skipPanel', messages)
  useItemSync()
  return {
    helpLinkProps: { className: 'kv-skip-panel__help-link' },
    label: skipPanelMessages.helpLink,
  }
}
