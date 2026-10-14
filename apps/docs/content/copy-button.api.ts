import type { CopyButtonProps, UseCopyButtonOptions, UseCopyButtonResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props CopyButton documents: its own, `onClick` and `children`; the rest are Button's. */
export type CopyButtonDocumentedProps = Pick<
  CopyButtonProps,
  | 'text'
  | 'textRef'
  | 'onCopied'
  | 'onCopyError'
  | 'onClick'
  | 'children'
  | 'messages'
  | 'status'
  | 'disabled'
  | 'focusableWhenDisabled'
>

export const copyButtonRows = propRows<CopyButtonDocumentedProps>({
  text: {
    type: 'string | (() => string)',
    description:
      'The text to write to the clipboard. A function is read when the button is activated.',
  },
  textRef: {
    type: 'RefObject<Element | null>',
    default: '–',
    description:
      'The element that shows the text. When the browser refuses to write, its contents are selected so the user can copy them by hand.',
  },
  onCopied: {
    type: '(text: string) => void',
    default: '–',
    description: 'Called with the text after it was written to the clipboard.',
  },
  onCopyError: {
    type: '(text: string) => void',
    default: '–',
    description: 'Called with the text when it could not be written to the clipboard.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description: 'Called when the button is activated, and never while it is disabled.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message copyButton.label',
    description:
      'Your own label, which replaces the message, so its language is yours to set. Say what it copies when a page has more than one.',
  },
  messages: {
    type: 'Partial<{ label, copied, failed }>',
    default: '–',
    description: 'Per-instance overrides of the three messages. See Strings.',
  },
  status: {
    type: 'boolean',
    default: 'true',
    description:
      'false removes the result text after the button. The result is still announced and data-status is still set, so you can draw your own cue in words.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description: 'Blocks copying. As Button: without focusableWhenDisabled it is skipped by Tab.',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'false',
    description: 'With disabled, keeps the button in the Tab order. Copying stays blocked.',
  },
})

export const copyButtonAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button',
    values: 'always',
    meaning: 'The class of Button, which CopyButton renders.',
  },
  {
    name: 'data-status',
    values: 'idle, copied or failed',
    meaning:
      'The result of the last copy. copied returns to idle after 5 seconds. failed stays until the next press. A hook for your own cue: it is no name and no announcement.',
  },
  {
    name: 'kv-copy-status',
    values: 'while copied or failed',
    meaning:
      'The result text after the button, with a decorative icon. It is not there while idle or disabled, or with status={false}. It is not a live region: the announcement carries the news.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The button is disabled, natively or focusable.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The button has keyboard focus (:focus-visible).',
  },
]

export const useCopyButtonHook: ApiHook = {
  name: 'useCopyButton',
  options: propRows<UseCopyButtonOptions>({
    text: {
      type: 'string | (() => string)',
      description: 'The text to write. A function is read when the button is activated.',
    },
    textRef: {
      type: 'RefObject<Element | null>',
      default: '–',
      description: 'The element that shows the text. Its contents are selected when copying fails.',
    },
    onCopied: {
      type: '(text: string) => void',
      default: '–',
      description: 'Called with the text after it was written.',
    },
    onCopyError: {
      type: '(text: string) => void',
      default: '–',
      description: 'Called with the text when it could not be written.',
    },
    onClick: {
      type: 'MouseEventHandler<HTMLButtonElement>',
      default: '–',
      description: 'Called when the button is activated, and never while it is disabled.',
    },
    messages: {
      type: 'Partial<{ label, copied, failed }>',
      default: '–',
      description: 'Per-instance message overrides.',
    },
    disabled: { type: 'boolean', default: 'false', description: 'Mirrors HTML disabled.' },
    focusableWhenDisabled: {
      type: 'boolean',
      default: 'false',
      description: 'Keeps a disabled button in the Tab order with aria-disabled="true".',
    },
  }),
  result: propRows<UseCopyButtonResult>({
    buttonProps: {
      type: 'CopyButtonPartProps',
      default: '–',
      description: 'Spread on a <button>: the props of Button, and data-status.',
    },
    label: {
      type: 'string',
      default: '–',
      description: 'The message copyButton.label: the default text of the button.',
    },
    status: {
      type: "'idle' | 'copied' | 'failed'",
      default: '–',
      description:
        'The result of the last copy. copied is idle again after 5 seconds. failed stays until the next press.',
    },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the button is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the button has keyboard (:focus-visible) focus.',
    },
  }),
}
