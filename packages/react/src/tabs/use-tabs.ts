import { getRovingTarget } from '@kvirn-ui/core'
import type { RovingOrientation } from '@kvirn-ui/core'
import { useEffect, useId, useState } from 'react'
import type {
  FocusEvent,
  FocusEventHandler,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  RefCallback,
} from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { getPanelId, getTabId } from './tabs-ids.ts'

/**
 * How arrow keys, Home and End treat selection. `'automatic'` selects the tab that gets focus,
 * which is right when the panels show at once. `'manual'` only moves focus, and Enter or Space
 * selects: use it when showing a panel is slow.
 */
export type TabsActivationMode = 'automatic' | 'manual'

/** What the user did: pressed a tab (a click, or Enter or Space in manual mode), or moved with the keys. */
export type TabsChangeReason = 'press' | 'arrow-key' | 'home-end-key'

/** What `onValueChange` gets besides the value: why, and the event behind it. */
export type TabsChangeDetails =
  | { reason: 'press'; event: MouseEvent<HTMLElement> }
  | { reason: 'arrow-key' | 'home-end-key'; event: KeyboardEvent<HTMLElement> }

interface UseTabsBaseOptions {
  /**
   * Called when the user selects a tab, with its value and `{ reason, event }`. It only reports:
   * with `value` set, you change `value` yourself. Never called for a disabled tab, nor for the tab
   * that is already selected.
   */
  onValueChange?: ((value: string, details: TabsChangeDetails) => void) | undefined
  /**
   * `'automatic'` (default): the arrow keys, Home and End select the tab they move to, except a
   * disabled one. `'manual'`: they only move focus, and Enter or Space selects.
   */
  activationMode?: TabsActivationMode | undefined
  /**
   * The axis of the arrow keys. `'horizontal'` (default) uses Left and Right, which flip in
   * right-to-left text. `'vertical'` uses Down and Up and sets `aria-orientation`.
   */
  orientation?: RovingOrientation | undefined
}

/** Controlled: `value` is the selected tab, and you change it from `onValueChange`. */
interface UseTabsControlledOptions extends UseTabsBaseOptions {
  /** The value of the selected tab. Pair it with `onValueChange`. */
  value: string
  defaultValue?: string | undefined
}

/** Uncontrolled: `defaultValue` is the tab that is selected to begin with. */
interface UseTabsUncontrolledOptions extends UseTabsBaseOptions {
  value?: undefined
  /** The value of the tab that is selected to begin with. */
  defaultValue: string
}

/**
 * One of `value` and `defaultValue` is required: there is no "first tab" fallback, because the
 * tabs register after the server render, and the server markup must already say which one is
 * selected.
 */
export type UseTabsOptions = UseTabsControlledOptions | UseTabsUncontrolledOptions

/** Internal. What `useTabsState` takes, for a root that has taken its own props out of the rest. */
export interface TabsStateOptions extends UseTabsBaseOptions {
  value?: string | undefined
  defaultValue?: string | undefined
}

/** Spread on the root's element: a `<div>`. */
export interface TabsRootPartProps {
  /**
   * The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-tabs`. Add a class of your own
   * next to it with `mergeProps`: class names join.
   */
  className: 'kv-tabs'
  /** The theme lays a vertical set of tabs out as a row, from this. */
  'data-orientation': RovingOrientation
}

/** Spread on the list's element: a `<div>`. Name it with `aria-label` or `aria-labelledby`. */
export interface TabsListPartProps {
  /** The part's class: `.kv-tabs-list`. */
  className: 'kv-tabs-list'
  role: 'tablist'
  /** Only set when vertical: horizontal is the default of the role. */
  'aria-orientation'?: 'vertical'
  /** The arrow keys, Home and End. A key the list doesn't own, or that has a modifier, is left alone. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  /** Forgets the focused tab when focus leaves the list, so the selected tab is the Tab stop again. */
  onBlur: FocusEventHandler<HTMLElement>
}

/** Spread on a tab: a `<button>`. */
export interface TabsTabPartProps {
  /** The part's class: `.kv-tabs-tab`. */
  className: 'kv-tabs-tab'
  /** From the root's id and the value, so the panel can name itself by it on the first server render. */
  id: string
  type: 'button'
  role: 'tab'
  /**
   * `0` for the one tab the Tab key reaches, `-1` for the rest. That is the focused tab while focus
   * is in the list, and the selected tab otherwise, so Tab from an unselected tab leaves the list.
   */
  tabIndex: 0 | -1
  'aria-selected': boolean
  /** The id of this tab's panel. */
  'aria-controls': string
  /** A disabled tab stays focusable, so users can find it. Never the native `disabled`. */
  'aria-disabled'?: 'true'
  'data-selected'?: ''
  'data-disabled'?: ''
  /** Registers the element while it is mounted. The same function for the same value on every render. */
  ref: RefCallback<HTMLElement>
  /** Selects the tab. A disabled tab ignores it, and so does the `onClick` you gave `getTabProps`. */
  onClick: MouseEventHandler<HTMLElement>
  onFocus: FocusEventHandler<HTMLElement>
}

/** Spread on a panel: a `<div>`. */
export interface TabsPanelPartProps {
  /** The part's class: `.kv-tabs-panel`. */
  className: 'kv-tabs-panel'
  id: string
  role: 'tabpanel'
  /**
   * `0` by default, so keyboard users can reach a panel that has no focusable content and scroll
   * it (2.1.1). Pass `tabIndex={-1}` after the spread when the panel starts with a focusable
   * element, so Tab goes straight to that element.
   */
  tabIndex: 0
  /** The id of this panel's tab: it is named by it. */
  'aria-labelledby': string
  /** Set while the panel isn't selected. Panels are always rendered, so every `aria-controls` resolves. */
  hidden?: true
  'data-selected'?: ''
  /** Registers the element while it is mounted. The same function for the same value on every render. */
  ref: RefCallback<HTMLElement>
}

export interface UseTabsTabOptions {
  /**
   * The tab is unavailable: `aria-disabled="true"` and `data-disabled`, and it can't be selected.
   * It stays focusable, so users can find it, and automatic activation never selects it.
   */
  disabled?: boolean | undefined
  /**
   * Called when the tab is pressed (a click, or Enter or Space), after the selection, and never
   * while the tab is disabled. Pass it here rather than merging your own `onClick` over the props.
   */
  onClick?: MouseEventHandler<HTMLElement> | undefined
}

export interface UseTabsResult {
  /** The value of the selected tab. */
  value: string
  orientation: RovingOrientation
  activationMode: TabsActivationMode
  rootProps: TabsRootPartProps
  listProps: TabsListPartProps
  /** The props of one tab. `value` ties it to the panel with the same value. */
  getTabProps: (value: string, options?: UseTabsTabOptions) => TabsTabPartProps
  /** The props of one panel. `value` ties it to the tab with the same value. */
  getPanelProps: (value: string) => TabsPanelPartProps
}

/** The elements of one kind of part by value, and the one stable ref callback of each. */
interface PartRegistry {
  elements: Map<string, HTMLElement>
  callbacks: Map<string, RefCallback<HTMLElement>>
}

function createPartRegistry(): PartRegistry {
  return { elements: new Map(), callbacks: new Map() }
}

/**
 * One ref callback per value, the same function on every render, so React never detaches and
 * attaches it again and the registry doesn't churn. It registers the element while it is mounted.
 */
function getRegistryRef(registry: PartRegistry, key: string): RefCallback<HTMLElement> {
  const known = registry.callbacks.get(key)
  if (known !== undefined) {
    return known
  }
  const callback: RefCallback<HTMLElement> = (element) => {
    if (element === null) {
      return
    }
    registry.elements.set(key, element)
    return () => {
      if (registry.elements.get(key) === element) {
        registry.elements.delete(key)
      }
      // Only forget this callback: a newer one for the same value may have replaced it already.
      if (registry.callbacks.get(key) === callback) {
        registry.callbacks.delete(key)
      }
    }
  }
  registry.callbacks.set(key, callback)
  return callback
}

/** The registered tabs in the order they have in the page, which is the order of the keys. */
function tabsInDocumentOrder(
  registry: PartRegistry,
): Array<{ value: string; element: HTMLElement }> {
  return [...registry.elements]
    .map(([value, element]) => ({ value, element }))
    .sort((first, second) =>
      first.element === second.element
        ? 0
        : first.element.compareDocumentPosition(second.element) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
    )
}

/**
 * Internal. The implementation of `useTabs`, with both values optional: `Tabs.Root` takes its
 * props apart, and TypeScript can't carry the either-or of `UseTabsOptions` through that.
 */
export function useTabsState({
  value: valueProp,
  defaultValue,
  onValueChange,
  activationMode = 'automatic',
  orientation = 'horizontal',
}: TabsStateOptions): UseTabsResult {
  const rootId = useId()
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  /** The tab that has focus while focus is in the list: the Tab stop then, selected or not. */
  const [focusedValue, setFocusedValue] = useState<string | null>(null)
  const [tabRegistry] = useState(createPartRegistry)
  const [panelRegistry] = useState(createPartRegistry)

  const isControlled = valueProp !== undefined
  // Without either (a JavaScript user), nothing is selected and a development warning says so.
  const value = (isControlled ? valueProp : uncontrolledValue) ?? ''

  const select = (nextValue: string, details: TabsChangeDetails): void => {
    if (nextValue === value) {
      return
    }
    if (!isControlled) {
      setUncontrolledValue(nextValue)
    }
    onValueChange?.(nextValue, details)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return
    }
    // Only a key from a registered tab: another element in the list is not ours to move from.
    const tabs = tabsInDocumentOrder(tabRegistry)
    const currentIndex = tabs.findIndex((tab) => tab.element === event.target)
    if (currentIndex === -1) {
      return
    }
    const list = event.currentTarget
    const direction =
      list.ownerDocument.defaultView?.getComputedStyle(list).direction === 'rtl' ? 'rtl' : 'ltr'
    const nextIndex = getRovingTarget({
      key: event.key,
      currentIndex,
      count: tabs.length,
      orientation,
      direction,
      loop: true,
    })
    const next = nextIndex === null ? undefined : tabs[nextIndex]
    if (next === undefined) {
      return
    }
    event.preventDefault()
    next.element.focus()
    // A disabled tab takes focus and is never selected: focus and selection can differ.
    if (activationMode === 'automatic' && next.element.getAttribute('aria-disabled') !== 'true') {
      select(next.value, {
        reason: event.key === 'Home' || event.key === 'End' ? 'home-end-key' : 'arrow-key',
        event,
      })
    }
  }

  const handleBlur = (event: FocusEvent<HTMLElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedValue(null)
    }
  }

  // After commit, so the refs of this render's tabs and panels have registered.
  useEffect(() => {
    if (!tabRegistry.elements.has(value)) {
      warnOnce(
        `tabs-value-without-tab:${value}`,
        `The selected value "${value}" matches no Tabs.Tab, so no tab is the Tab stop and no panel is shown: keyboard users can't reach the tabs (WCAG 2.1.1, 4.1.2). Give a Tabs.Tab the value "${value}", or set value or defaultValue to the value of one of the tabs.`,
      )
    }
    for (const tabValue of tabRegistry.elements.keys()) {
      if (!panelRegistry.elements.has(tabValue)) {
        warnOnce(
          `tabs-unpaired:${tabValue}`,
          `The Tabs.Tab with value "${tabValue}" has no Tabs.Panel with the same value, so its aria-controls points at nothing (WCAG 4.1.2). Render a Tabs.Panel with value="${tabValue}" in the same Tabs.Root.`,
        )
      }
    }
    for (const panelValue of panelRegistry.elements.keys()) {
      if (!tabRegistry.elements.has(panelValue)) {
        warnOnce(
          `tabs-unpaired:${panelValue}`,
          `The Tabs.Panel with value "${panelValue}" has no Tabs.Tab with the same value, so its aria-labelledby points at nothing and no tab shows it (WCAG 4.1.2). Render a Tabs.Tab with value="${panelValue}" in the same Tabs.Root.`,
        )
      }
    }
  })

  return {
    value,
    orientation,
    activationMode,
    rootProps: { className: 'kv-tabs', 'data-orientation': orientation },
    listProps: {
      className: 'kv-tabs-list',
      role: 'tablist',
      ...(orientation === 'vertical' ? { 'aria-orientation': 'vertical' as const } : {}),
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
    },
    getTabProps: (tabValue, { disabled = false, onClick } = {}) => ({
      className: 'kv-tabs-tab',
      id: getTabId(rootId, tabValue),
      type: 'button',
      role: 'tab',
      tabIndex: (focusedValue ?? value) === tabValue ? 0 : -1,
      'aria-selected': tabValue === value,
      'aria-controls': getPanelId(rootId, tabValue),
      ...(disabled ? { 'aria-disabled': 'true' as const, 'data-disabled': '' as const } : {}),
      ...(tabValue === value ? { 'data-selected': '' as const } : {}),
      ref: getRegistryRef(tabRegistry, tabValue),
      onClick: (event) => {
        if (disabled) {
          // Blocks the click, as useButton does for a disabled button.
          event.preventDefault()
          return
        }
        select(tabValue, { reason: 'press', event })
        onClick?.(event)
      },
      onFocus: () => setFocusedValue(tabValue),
    }),
    getPanelProps: (panelValue) => ({
      className: 'kv-tabs-panel',
      id: getPanelId(rootId, panelValue),
      role: 'tabpanel',
      tabIndex: 0,
      'aria-labelledby': getTabId(rootId, panelValue),
      ...(panelValue === value ? { 'data-selected': '' as const } : { hidden: true as const }),
      ref: getRegistryRef(panelRegistry, panelValue),
    }),
  }
}

/**
 * A set of tabs for your own elements (APG Tabs, contract: tabs.a11y.md): a list of tabs and a
 * panel for each, with one tab selected and its panel shown.
 *
 * - **One Tab stop.** The selected tab has `tabindex="0"` and the others `-1`. While focus is in
 *   the list, the tab that has focus is the stop, so Tab from an unselected tab leaves the list
 *   for the panel. Tab then reaches the selected panel, which has `tabindex="0"` too.
 * - **Arrows** move to the next and previous tab (Left and Right, flipped in right-to-left text,
 *   or Down and Up when `orientation="vertical"`), wrapping. Home and End go to the ends.
 *   `activationMode="automatic"` selects the tab that gets focus, `"manual"` leaves that to Enter
 *   and Space. A disabled tab (`aria-disabled`) stays focusable and is never selected.
 * - **Nothing else is taken:** a key with Control, Alt, Meta or Shift, a key a tab already
 *   handled (`defaultPrevented`), and a key from an element that isn't a registered tab.
 * - **Ids** come from `useId()` and the value, so a tab and its panel point at each other already
 *   on the server. Render every panel, with `hidden` while it isn't selected: the props do that.
 * - **Name the list** with `aria-label` or `aria-labelledby` when a page has more than one.
 *
 * @example
 * const tabs = useTabs({ defaultValue: 'uppgifter' })
 * <div {...tabs.rootProps}>
 *   <div {...tabs.listProps} aria-label="Ärendet">
 *     <button {...tabs.getTabProps('uppgifter')}>Uppgifter</button>
 *     <button {...tabs.getTabProps('historik')}>Historik</button>
 *   </div>
 *   <div {...tabs.getPanelProps('uppgifter')}>…</div>
 *   <div {...tabs.getPanelProps('historik')}>…</div>
 * </div>
 */
export function useTabs(options: UseTabsOptions): UseTabsResult {
  return useTabsState(options)
}
