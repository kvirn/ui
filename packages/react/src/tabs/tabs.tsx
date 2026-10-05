'use client'
import type { RovingOrientation } from '@kvirn-ui/core'
import { useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, MouseEventHandler, ReactElement } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart, takeRenderElementProps } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { TabsContext } from './tabs-context.ts'
import { useTabsState } from './use-tabs.ts'
import type { TabsActivationMode, UseTabsOptions, UseTabsResult } from './use-tabs.ts'

const isClickHandler = (value: unknown): value is MouseEventHandler<HTMLButtonElement> =>
  typeof value === 'function'

/** What `render` receives as its second argument, for `Tabs.Root` and `Tabs.List`. */
export interface TabsState {
  /** The value of the selected tab. */
  value: string
  orientation: RovingOrientation
  activationMode: TabsActivationMode
}

/** What `render` receives as its second argument, for `Tabs.Tab`. */
export interface TabsTabState {
  isSelected: boolean
  isDisabled: boolean
}

/** What `render` receives as its second argument, for `Tabs.Panel`. */
export interface TabsPanelState {
  isSelected: boolean
}

/**
 * One of `value` (controlled) and `defaultValue` (uncontrolled) is required. Here `defaultValue`
 * is the value of the tab that starts selected, not an attribute of the `<div>`.
 */
export type TabsRootProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue'> &
  UseTabsOptions & {
    /** Change the element. It gets the class and `data-orientation`. */
    render?: RenderProp<ComponentPropsWithRef<'div'>, TabsState> | undefined
  }

/** `role` and `aria-orientation` are left out: the hook sets them. */
export interface TabsListProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'role' | 'aria-orientation'
> {
  /** Change the element. It gets the role, the class and the keys: spread the props it gets. */
  render?: RenderProp<ComponentPropsWithRef<'div'>, TabsState> | undefined
}

/**
 * The role, the id and the ARIA state are left out: the Tabs set them, so a tab and its panel
 * always point at each other. `type` is always `button`.
 */
export interface TabsTabProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'id' | 'type' | 'role' | 'aria-selected' | 'aria-controls' | 'aria-disabled'
> {
  /**
   * The tab's value: what `value` and `onValueChange` hold, and what ties it to the `Tabs.Panel`
   * with the same value. Required.
   */
  value: string
  /**
   * Unavailable: `aria-disabled="true"` and `data-disabled`. The tab stays focusable, so users can
   * find it, but it can't be selected, and a click, Enter or Space does nothing.
   */
  disabled?: boolean | undefined
  /**
   * Change the element. It must still be a `<button>` and forward its ref. An element's own
   * `onClick` is gated like the tab's. In the function form, keep `tabProps.onClick`.
   */
  render?: RenderProp<ComponentPropsWithRef<'button'>, TabsTabState> | undefined
}

/** The role, the id and the labelling are left out: the Tabs set them. */
export interface TabsPanelProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'id' | 'role' | 'aria-labelledby' | 'hidden'
> {
  /** The value of the tab that shows this panel. Required. */
  value: string
  /** Change the element. It gets the role, the id, `hidden` while it isn't selected and the class. */
  render?: RenderProp<ComponentPropsWithRef<'div'>, TabsPanelState> | undefined
}

/** What a part outside a `Tabs.Root` renders: itself, tied to nothing. */
const outsideRootState: TabsState = Object.freeze({
  value: '',
  orientation: 'horizontal',
  activationMode: 'automatic',
})

const stateOf = (tabs: UseTabsResult | null): TabsState =>
  tabs === null
    ? outsideRootState
    : { value: tabs.value, orientation: tabs.orientation, activationMode: tabs.activationMode }

/** Internal. Warns, in development, about a part that has no `Tabs.Root` around it. */
function useWarnOutsideRoot(part: 'List' | 'Tab' | 'Panel', isInRoot: boolean): void {
  useEffect(() => {
    if (!isInRoot) {
      warnOnce(
        `tabs-${part.toLowerCase()}-outside-root`,
        `A Tabs.${part} is outside a Tabs.Root, so it is tied to no tabs: no selection, no ids and no arrow keys. Put it inside <Tabs.Root>.`,
      )
    }
  }, [isInRoot, part])
}

/**
 * The tabs: owns the selected value and the activation mode, and renders a `<div class="kv-tabs">`
 * around the list and the panels. Give it `defaultValue` (uncontrolled) or `value` and
 * `onValueChange` (controlled): one of them is required.
 */
export function TabsRoot({
  value,
  defaultValue,
  onValueChange,
  activationMode,
  orientation,
  render,
  ...otherProps
}: TabsRootProps): ReactElement {
  const tabs = useTabsState({ value, defaultValue, onValueChange, activationMode, orientation })
  return (
    <TabsContext.Provider value={tabs}>
      {renderPart({
        render,
        defaultElement: 'div',
        partProps: mergeProps(otherProps, tabs.rootProps),
        state: stateOf(tabs),
      })}
    </TabsContext.Provider>
  )
}
TabsRoot.displayName = 'Tabs.Root'

/**
 * The list of tabs: a `<div role="tablist">`. **Name it** with `aria-label` or `aria-labelledby`
 * when a page has more than one. It owns the arrow keys, Home and End.
 */
export function TabsList({ render, ...otherProps }: TabsListProps): ReactElement {
  const tabs = useContext(TabsContext)
  useWarnOutsideRoot('List', tabs !== null)
  const hookProps: ComponentPropsWithRef<'div'> =
    tabs === null ? { className: 'kv-tabs-list', role: 'tablist' } : tabs.listProps
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: mergeProps(otherProps, hookProps),
    state: stateOf(tabs),
  })
}
TabsList.displayName = 'Tabs.List'

/**
 * One tab: a `<button role="tab">` that selects the panel with the same `value`. The selected tab
 * is the one Tab stop of the list, a disabled one stays focusable with `aria-disabled`, and the
 * arrow keys on the list move between the tabs.
 */
export function TabsTab({
  value,
  disabled = false,
  onClick,
  render,
  ref,
  ...otherProps
}: TabsTabProps): ReactElement {
  const tabs = useContext(TabsContext)
  useWarnOutsideRoot('Tab', tabs !== null)
  // The element's own onClick goes through the hook too, so a disabled tab blocks it.
  const { render: renderWithoutClick, takenProps } = takeRenderElementProps(render, ['onClick'])
  const elementOnClick = takenProps.onClick
  const activationHandler = isClickHandler(elementOnClick)
    ? mergeProps({ onClick }, { onClick: elementOnClick }).onClick
    : onClick
  const hookProps: ComponentPropsWithRef<'button'> =
    tabs === null
      ? { className: 'kv-tabs-tab', type: 'button', disabled, onClick: activationHandler }
      : tabs.getTabProps(value, { disabled, onClick: activationHandler })
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const mergedRef = useMergedRef(
    useMergedRef<HTMLButtonElement>(ref, hookProps.ref ?? null),
    elementRef,
  )

  useEffect(() => {
    const element = elementRef.current
    if (element === null || element.tagName !== 'BUTTON') {
      const rendered =
        element === null ? 'nothing it could reference' : `<${element.tagName.toLowerCase()}>`
      warnOnce(
        `tabs-tab-not-a-button:${rendered}`,
        `<Tabs.Tab render> must render a <button> and forward its ref, but it rendered ${rendered}. A tab's keyboard activation and its disabled state come from the native element (WCAG 4.1.2).`,
      )
    }
  })

  return renderPart({
    render: renderWithoutClick,
    defaultElement: 'button',
    partProps: { ...mergeProps(otherProps, hookProps), ref: mergedRef },
    state: { isSelected: tabs !== null && tabs.value === value, isDisabled: disabled },
  })
}
TabsTab.displayName = 'Tabs.Tab'

/**
 * The panel of a tab: a `<div role="tabpanel">` named by its tab. Every panel is rendered, and
 * the ones that aren't selected are `hidden`, so every `aria-controls` resolves. It has
 * `tabindex="0"`, so keyboard users can reach a panel without focusable content and scroll it.
 * Pass `tabIndex={-1}` when the panel starts with a focusable element, so Tab goes straight there.
 */
export function TabsPanel({ value, render, ref, ...otherProps }: TabsPanelProps): ReactElement {
  const tabs = useContext(TabsContext)
  useWarnOutsideRoot('Panel', tabs !== null)
  const hookProps: ComponentPropsWithRef<'div'> =
    tabs === null ? { className: 'kv-tabs-panel' } : tabs.getPanelProps(value)
  const mergedRef = useMergedRef<HTMLDivElement>(ref, hookProps.ref ?? null)
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, hookProps),
      // A tabIndex the consumer passes wins: -1 for a panel that starts with a focusable element.
      tabIndex: otherProps.tabIndex ?? hookProps.tabIndex,
      ref: mergedRef,
    },
    state: { isSelected: tabs !== null && tabs.value === value },
  })
}
TabsPanel.displayName = 'Tabs.Panel'

/**
 * Tabs (APG Tabs, contract: tabs.a11y.md): a list of tabs and a panel for each, with one tab
 * selected and its panel shown. The tab list is one Tab stop, at the selected tab, and the arrow
 * keys move between the tabs. For links to other pages, use `Navigation` with
 * `kv-navigation--horizontal`: tabs never navigate.
 *
 * @example
 * <Tabs.Root defaultValue="uppgifter">
 *   <Tabs.List aria-label="Ärendet">
 *     <Tabs.Tab value="uppgifter">Uppgifter</Tabs.Tab>
 *     <Tabs.Tab value="historik" disabled>Historik</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="uppgifter">…</Tabs.Panel>
 *   <Tabs.Panel value="historik">…</Tabs.Panel>
 * </Tabs.Root>
 */
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
} as const
