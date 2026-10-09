import type {
  AlertActionsProps,
  AlertBodyProps,
  AlertCloseProps,
  AlertRootProps,
  AlertStatusRootProps,
  AlertTitleProps,
  UseAlertOptions,
  UseAlertResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export const readyMadeRootName = 'Alert.Info'

const rootAsRow = {
  type: "'div' | 'section' | 'aside'",
  default: "'div'",
  description:
    'Changes the element. A section with aria-labelledby is a named region for a site-wide alert; use aside only where the alert is tangential content. Another tag warns once in development.',
}

const refRow = {
  type: 'Ref<HTMLElement>',
  default: '–',
  description: 'Reaches the element, whichever it is.',
}

const announceRow = {
  type: "'polite' | 'assertive'",
  default: '–',
  description:
    'Announces the Title and Body text once, when the alert mounts, through the Announcer. Only for an alert inserted after an action. Needs a KvirnProvider. Without it nothing is announced.',
}

export const rootRows = propRows<Pick<AlertRootProps, 'announce' | 'as' | 'ref'>>({
  announce: announceRow,
  as: rootAsRow,
  ref: refRow,
})

export const readyMadeRootRows = propRows<
  Pick<AlertStatusRootProps, 'announce' | 'messages' | 'as' | 'ref'>
>({
  announce: {
    ...announceRow,
    description: `${announceRow.description} assertive on Info or Success gives a development warning.`,
  },
  messages: {
    type: "Partial<KvirnMessages['alert']>",
    default: '–',
    description:
      'Per-instance override of this root’s status word, such as { dangerPrefix: "Viktigt:" }, and of the close button’s name.',
  },
  as: rootAsRow,
  ref: refRow,
})

export const titleRows = propRows<Pick<AlertTitleProps, 'as' | 'ref'>>({
  as: {
    type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'",
    default: "'h2'",
    description:
      'Sets the heading level (as="h3") or a paragraph for a one-sentence alert (as="p"). The status word stays. There is no h1: the page title is not an alert’s.',
  },
  ref: refRow,
})

export const bodyRows = propRows<Pick<AlertBodyProps, 'as' | 'ref'>>({
  as: {
    type: "'div' | 'p' | 'section'",
    default: "'div'",
    description: 'Changes the element: a p for plain text, a div when it holds several blocks.',
  },
  ref: refRow,
})

export const actionsRows = propRows<Pick<AlertActionsProps, 'as' | 'ref'>>({
  as: {
    type: "'div' | 'section'",
    default: "'div'",
    description: 'Changes the element. Actions adds no list semantics.',
  },
  ref: refRow,
})

export const closeRows = propRows<
  Pick<AlertCloseProps, 'messages' | 'disabled' | 'onClick' | 'ref'>
>({
  messages: {
    type: "Partial<KvirnMessages['alert']>",
    default: '–',
    description: 'Per-instance override of the button’s name (close).',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Natively disabled: skipped by Tab, and onClick doesn’t run.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description:
      'Called on click, Enter and Space. Remove the alert here, then move focus: the button is gone with it.',
  },
  ref: {
    type: 'Ref<HTMLButtonElement>',
    default: '–',
    description: 'Reaches the button.',
  },
})

export const rootAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-alert--info',
    values: 'on Alert.Info',
    meaning: 'The status class. Chosen by the component, never by a prop.',
  },
  { name: 'kv-alert--success', values: 'on Alert.Success', meaning: 'The status class.' },
  { name: 'kv-alert--warning', values: 'on Alert.Warning', meaning: 'The status class.' },
  { name: 'kv-alert--danger', values: 'on Alert.Danger', meaning: 'The status class.' },
  {
    name: 'kv-alert-icon',
    values: 'on the icon of a ready-made root',
    meaning: 'The decorative status icon, first in the root: info, success, warning or error.',
  },
]

export const titleAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert-title', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-alert-status',
    values: 'on the status word of a ready-made root',
    meaning:
      'The span that starts the Title. The theme hides it visually, and screen readers read it.',
  },
]

export const bodyAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert-body', values: 'always', meaning: 'The part class.' },
]

export const actionsAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert-actions', values: 'always', meaning: 'The part class.' },
]

export const closeAttributes: readonly AttributeRow[] = [
  { name: 'kv-alert-close', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The button is disabled.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The button has keyboard focus (:focus-visible).',
  },
]

export const useAlertHook: ApiHook = {
  name: 'useAlert',
  options: propRows<UseAlertOptions>({
    variant: {
      type: "'info' | 'success' | 'warning' | 'danger'",
      default: '–',
      description:
        'Makes the result a ready-made root: the status class, iconProps and statusProps. Without it you bring your own icon and status word.',
    },
    announce: announceRow,
    messages: {
      type: "Partial<KvirnMessages['alert']>",
      default: '–',
      description: 'Per-instance overrides: the status word of the variant, and the close name.',
    },
  }),
  result: propRows<UseAlertResult>({
    rootProps: {
      type: 'AlertRootPartProps',
      default: '–',
      description: 'Spread on the root: kv-alert, the status class, and a callback ref.',
    },
    titleProps: {
      type: 'AlertTitlePartProps',
      default: '–',
      description: 'Spread on the Title. Its ref lets announce read the text.',
    },
    bodyProps: {
      type: 'AlertBodyPartProps',
      default: '–',
      description: 'Spread on the Body. Its ref lets announce read the text.',
    },
    actionsProps: {
      type: 'AlertActionsPartProps',
      default: '–',
      description: 'Spread on the actions element.',
    },
    closeProps: {
      type: 'AlertClosePartProps',
      default: '–',
      description:
        'Spread on a <button>: class, type and the resolved aria-label. Drop the label if the button has visible text.',
    },
    iconProps: {
      type: 'AlertIconPartProps | undefined',
      default: '–',
      description: 'Spread on an Icon. Undefined without a variant.',
    },
    statusProps: {
      type: 'AlertStatusPartProps | undefined',
      default: '–',
      description: 'Spread on a span at the start of the Title. Undefined without a variant.',
    },
  }),
}
