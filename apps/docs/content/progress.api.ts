import type {
  ProgressBarProps,
  ProgressIndicatorProps,
  ProgressLabelProps,
  ProgressRootProps,
  UseProgressOptions,
  UseProgressResult,
} from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

const optionRows = {
  label: {
    type: 'string',
    default: 'the message progress.loading',
    description:
      'What is happening, as a short sentence that ends with a full stop. It names the bar and is announced once. Without it a development warning asks for a specific one.',
  },
  value: {
    type: 'number',
    default: '–',
    description:
      'How far along, when you know it. The bar renders only with a number; an unknown wait has the label alone.',
  },
  max: {
    type: 'number',
    default: '100',
    description: 'The value that means done.',
  },
  delayMilliseconds: {
    type: 'number',
    default: '1000',
    description: 'How long a wait stays invisible, so a quick one never flashes.',
  },
  slowAfterMilliseconds: {
    type: 'number | false',
    default: '10000',
    description: 'When, counted from mounting, the slow sentence is added. false never adds it.',
  },
  announce: {
    type: 'boolean',
    default: 'true',
    description:
      'Announces the label once when it is shown and the slow sentence once when it becomes slow. Set false when focus already reads the state or another part announces it. The percent is never announced.',
  },
  messages: {
    type: "Partial<KvirnMessages['progress']>",
    default: '–',
    description: 'Per-instance override of the loading, slow and value texts.',
  },
} as const

export const rootRows = propRows<
  Pick<
    ProgressRootProps,
    | 'label'
    | 'value'
    | 'max'
    | 'delayMilliseconds'
    | 'slowAfterMilliseconds'
    | 'announce'
    | 'messages'
    | 'ref'
  >
>({
  ...optionRows,
  ref: {
    type: 'Ref<HTMLDivElement>',
    default: '–',
    description: 'Reaches the <div>.',
  },
})

export const labelRows = propRows<Pick<ProgressLabelProps, 'as' | 'children' | 'ref'>>({
  as: {
    type: "'p' | 'div' | 'span'",
    default: "'p'",
    description:
      'Changes the element: span fits beside a busy button. It is plain text, never a heading.',
  },
  children: {
    type: 'ReactNode',
    default: 'the Root’s label',
    description: 'Another text than the Root’s label. It names the bar, so keep it the same words.',
  },
  ref: {
    type: 'Ref<HTMLElement>',
    default: '–',
    description: 'Reaches the element, whichever it is.',
  },
})

export const barRows = propRows<Pick<ProgressBarProps, 'ref'>>({
  ref: {
    type: 'Ref<HTMLProgressElement>',
    default: '–',
    description: 'Reaches the <progress>.',
  },
})

export const indicatorRows = propRows<Pick<ProgressIndicatorProps, 'ref'>>({
  ref: {
    type: 'Ref<HTMLSpanElement>',
    default: '–',
    description: 'Reaches the <span>.',
  },
})

export const rootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-progress',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'data-state',
    values: 'busy | slow',
    meaning: 'slow once the wait passed slowAfterMilliseconds.',
  },
  {
    name: 'data-determinate',
    values: 'present with a value',
    meaning: 'The wait has a known value, so the Bar renders.',
  },
]

export const labelAttributes: readonly AttributeRow[] = [
  { name: 'kv-progress-label', values: 'always', meaning: 'The part class.' },
  {
    name: 'kv-progress-percent',
    values: 'on a span, with a value',
    meaning: 'The visible percent after the label text. It is text, never announced.',
  },
  {
    name: 'kv-progress-slow',
    values: 'on a span, once slow',
    meaning: 'The slow sentence after the label text. It is not part of the bar’s name.',
  },
]

export const barAttributes: readonly AttributeRow[] = [
  { name: 'kv-progress-bar', values: 'always', meaning: 'The part class.' },
  {
    name: 'aria-labelledby',
    values: 'the label text’s id',
    meaning: 'Names the bar by the label text only, not by the percent or the slow sentence.',
  },
  {
    name: 'aria-valuetext',
    values: 'the message progress.valueText',
    meaning: 'For example “Exporting cases, 45%”.',
  },
]

export const indicatorAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-spinner',
    values: 'always',
    meaning:
      'The spinner class. kv-spinner--sm and kv-spinner--lg change its size. The theme shows a still shape under reduced motion.',
  },
  { name: 'aria-hidden', values: 'true', meaning: 'It is decoration; the text carries the wait.' },
]

export const useProgressHook: ApiHook = {
  name: 'useProgress',
  options: propRows<UseProgressOptions>(optionRows),
  result: propRows<UseProgressResult>({
    isShown: {
      type: 'boolean',
      default: '–',
      description: 'false while the wait is still inside the show delay: render nothing.',
    },
    isSlow: {
      type: 'boolean',
      default: '–',
      description: 'true once the wait passed the slow limit.',
    },
    labelId: {
      type: 'string',
      default: '–',
      description: 'The id for the element that holds the label text, which names the bar.',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The label, or the message progress.loading.',
    },
    slowText: {
      type: 'string',
      default: '–',
      description: 'The message progress.slow. Show it after the label when isSlow.',
    },
    percent: {
      type: 'number | undefined',
      default: '–',
      description: 'The value as a whole percent, 0 to 100. undefined without a value.',
    },
    rootProps: {
      type: 'ProgressRootPartProps',
      default: '–',
      description: 'Spread on the Root’s element: the class and data-state.',
    },
    labelProps: {
      type: 'ProgressLabelPartProps',
      default: '–',
      description: 'Spread on the element around the label text.',
    },
    barProps: {
      type: 'ProgressBarPartProps | undefined',
      default: '–',
      description:
        'Spread on a <progress>. undefined without a numeric value: an unknown wait has no bar.',
    },
  }),
}
