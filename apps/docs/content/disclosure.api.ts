import type {
  DisclosureRootProps,
  UseDisclosureOptions,
  UseDisclosureResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type DisclosureRootDocumentedProps = Omit<DisclosureRootProps, 'children'>

const optionRows = {
  open: {
    type: 'boolean',
    default: '–',
    description:
      'Controlled: whether the panel is open. Pair it with onOpenChange, which only reports, so you change open yourself.',
  },
  defaultOpen: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the panel starts open.',
  },
  onOpenChange: {
    type: '(open: boolean, details: DisclosureChangeDetails) => void',
    default: '–',
    description:
      'Called when the user opens or closes the panel, with the new state and { reason, event }. The reason is "trigger-press" or "find-in-page". Never called for a press while disabled.',
  },
  hiddenUntilFound: {
    type: 'boolean',
    default: 'false',
    description:
      'Keeps the closed panel’s text findable with the browser’s find-in-page and #fragment links (hidden="until-found"). The browser then opens it and onOpenChange gets the reason "find-in-page". A browser without support treats it as hidden.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Blocks opening and closing. Without focusableWhenDisabled the trigger is natively disabled and skipped by Tab.',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'false',
    description:
      'With disabled, keeps the trigger in the Tab order with aria-disabled="true". Opening stays blocked.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description: 'Called after a click on the trigger, and never while disabled.',
  },
} as const

export const disclosureRootRows = propRows<DisclosureRootDocumentedProps>(optionRows)

export const disclosureTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-disclosure-trigger',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'kv-disclosure-icon',
    values: 'always',
    meaning: 'The chevron after the text: down while closed, up while open. It is aria-hidden.',
  },
  {
    name: 'aria-expanded',
    values: '"true" or "false"',
    meaning: 'Whether the panel is open. Set by the Disclosure: you can’t pass it.',
  },
  {
    name: 'aria-controls',
    values: 'the panel’s id',
    meaning: 'Points at the panel, which is always rendered. Set by the Disclosure.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The panel is open.' },
  { name: 'data-disabled', values: 'present or absent', meaning: 'The trigger is disabled.' },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The trigger has keyboard focus (:focus-visible).',
  },
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning: 'Set when disabled and focusableWhenDisabled are both on.',
  },
]

export const disclosurePanelAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-disclosure-panel',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'hidden',
    values: '"" or "until-found", or absent',
    meaning:
      'Set while closed. With hiddenUntilFound the value is until-found once the page has loaded.',
  },
  { name: 'data-open', values: 'present or absent', meaning: 'The panel is open.' },
]

export const useDisclosureHook: ApiHook = {
  name: 'useDisclosure',
  options: propRows<UseDisclosureOptions>(optionRows),
  result: propRows<UseDisclosureResult>({
    triggerProps: {
      type: 'DisclosureTriggerPartProps',
      default: '–',
      description:
        'Spread on a <button>: class, id, type, aria-expanded, aria-controls and the click handler.',
    },
    panelProps: {
      type: 'DisclosurePanelPartProps',
      default: '–',
      description:
        'Spread on a <div>: class, id, hidden while closed and a ref. The ref must reach the element for find-in-page.',
    },
    isOpen: { type: 'boolean', default: '–', description: 'Whether the panel is open.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the trigger is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the trigger has keyboard (:focus-visible) focus.',
    },
    triggerId: { type: 'string', default: '–', description: 'The trigger’s id.' },
    panelId: {
      type: 'string',
      default: '–',
      description: 'The panel’s id, which aria-controls uses.',
    },
  }),
}
