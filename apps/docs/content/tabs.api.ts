import type {
  TabsListProps,
  TabsPanelProps,
  TabsRootProps,
  TabsTabProps,
  UseTabsOptions,
  UseTabsResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const valueRows = {
  value: {
    type: 'string',
    default: '–',
    description:
      'Controlled: the value of the selected tab. Pair it with onValueChange and change it yourself. One of value and defaultValue is required.',
  },
  defaultValue: {
    type: 'string',
    default: '–',
    description:
      'Uncontrolled: the value of the tab that is selected to begin with. There is no first-tab fallback.',
  },
  onValueChange: {
    type: '(value: string, details: TabsChangeDetails) => void',
    default: '–',
    description:
      'Called when the user selects a tab, with { reason: "press" | "arrow-key" | "home-end-key", event }. Never for a disabled tab or the tab that is already selected.',
  },
  activationMode: {
    type: "'automatic' | 'manual'",
    default: "'automatic'",
    description:
      'Automatic: the arrow keys, Home and End select the tab they move to. Manual: they only move focus, and Enter or Space selects.',
  },
  orientation: {
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description:
      'The axis of the arrow keys: Left and Right (flipped in right-to-left text), or Down and Up when vertical.',
  },
} as const

export const tabsRootRows = propRows<
  Pick<
    TabsRootProps,
    'value' | 'defaultValue' | 'onValueChange' | 'activationMode' | 'orientation' | 'render'
  >
>({
  ...valueRows,
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"div">, TabsState>',
    default: '–',
    description:
      'Changes the element. A function receives the props and { value, orientation, activationMode }.',
  },
})

export const tabsRootAttributes: readonly AttributeRow[] = [
  { name: 'kv-tabs', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'data-orientation',
    values: '"horizontal" or "vertical"',
    meaning: 'The orientation. The default theme lays a vertical set out beside its panels.',
  },
]

export const tabsListRows = propRows<Pick<TabsListProps, 'render'>>({
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"div">, TabsState>',
    default: '–',
    description:
      'Changes the element. It gets the role, the class and the keys, so spread the props it receives.',
  },
})

export const tabsListAttributes: readonly AttributeRow[] = [
  { name: 'kv-tabs-list', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-orientation',
    values: '"vertical" or absent',
    meaning: 'Set only when vertical. Horizontal is the default of the tablist role.',
  },
]

export const tabsTabRows = propRows<
  Pick<TabsTabProps, 'value' | 'disabled' | 'onClick' | 'render'>
>({
  value: {
    type: 'string',
    description: 'The tab’s value: ties it to the Tabs.Panel with the same value.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Unavailable: aria-disabled="true", and it can’t be selected. The tab stays focusable so users can find it. Never a native disabled.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description: 'Called after the tab is selected, and never while the tab is disabled.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"button">, TabsTabState>',
    default: '–',
    description:
      'Changes the element, which must still be a <button> that forwards its ref. A function receives the props and { isSelected, isDisabled }.',
  },
})

export const tabsTabAttributes: readonly AttributeRow[] = [
  { name: 'kv-tabs-tab', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-selected',
    values: '"true" or "false"',
    meaning: 'Always set. Says which tab is selected.',
  },
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning: 'Set on a disabled tab. Not passed directly.',
  },
  { name: 'data-selected', values: 'present or absent', meaning: 'The tab is selected.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The tab is disabled.' },
]

export const tabsPanelRows = propRows<Pick<TabsPanelProps, 'value' | 'tabIndex' | 'render'>>({
  value: { type: 'string', description: 'The value of the tab that shows this panel.' },
  tabIndex: {
    type: 'number',
    default: '0',
    description:
      'Pass -1 when the panel starts with a focusable element, so Tab goes straight to it.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"div">, TabsPanelState>',
    default: '–',
    description: 'Changes the element. A function receives the props and { isSelected }.',
  },
})

export const tabsPanelAttributes: readonly AttributeRow[] = [
  { name: 'kv-tabs-panel', values: 'always', meaning: 'The part class.' },
  {
    name: 'hidden',
    values: 'present or absent',
    meaning: 'Present while the panel isn’t selected. Every panel stays rendered.',
  },
  { name: 'data-selected', values: 'present or absent', meaning: 'The panel is shown.' },
]

export const useTabsHook: ApiHook = {
  name: 'useTabs',
  options: propRows<UseTabsOptions>(valueRows),
  result: propRows<UseTabsResult>({
    value: { type: 'string', default: '–', description: 'The value of the selected tab.' },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: '–',
      description: 'The orientation in use.',
    },
    activationMode: {
      type: "'automatic' | 'manual'",
      default: '–',
      description: 'The activation mode in use.',
    },
    rootProps: {
      type: 'TabsRootPartProps',
      default: '–',
      description: 'Spread on the root <div>: class and data-orientation.',
    },
    listProps: {
      type: 'TabsListPartProps',
      default: '–',
      description: 'Spread on the list <div>: class, role, the keys and the blur handler.',
    },
    getTabProps: {
      type: '(value: string, options?: { disabled?: boolean; onClick?: MouseEventHandler }) => TabsTabPartProps',
      default: '–',
      description:
        'The props of one <button>: id, role, tabindex, aria-selected, aria-controls, handlers and a ref.',
    },
    getPanelProps: {
      type: '(value: string) => TabsPanelPartProps',
      default: '–',
      description: 'The props of one <div>: id, role, tabindex, aria-labelledby, hidden and a ref.',
    },
  }),
}
