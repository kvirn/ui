import type { CodeBlockCopyProps, UseCodeBlockResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

export type CodeBlockCopyDocumentedProps = Pick<
  CodeBlockCopyProps,
  'text' | 'textRef' | 'onCopied' | 'onCopyError' | 'children' | 'messages'
>

export const codeBlockCopyRows = propRows<CodeBlockCopyDocumentedProps>({
  text: {
    type: 'string | (() => string)',
    default: "the Code's text",
    description: 'The text to copy. By default the text content of CodeBlock.Code.',
  },
  textRef: {
    type: 'RefObject<Element | null>',
    default: 'the Code element',
    description: 'The element selected when the browser refuses to write.',
  },
  onCopied: {
    type: '(text: string) => void',
    default: '–',
    description: 'Called with the text after it was written to the clipboard.',
  },
  onCopyError: {
    type: '(text: string) => void',
    default: '–',
    description: 'Called when the text could not be written, after the failure is announced.',
  },
  children: {
    type: 'ReactNode',
    default: 'the message copyButton.label',
    description: 'Your own label, which replaces the message, so its language is yours to set.',
  },
  messages: {
    type: 'Partial<{ label, copied, failed }>',
    default: '–',
    description: 'Per-instance overrides of the three messages. See Strings.',
  },
})

export const codeBlockRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-code-block',
    values: 'always',
    meaning: 'The part class. The default theme draws the surface.',
  },
  {
    name: 'role="group", aria-labelledby',
    values: 'while a Label is mounted',
    meaning: 'The group is named by the Label. Without a Label the Root is a plain div.',
  },
]

export const codeBlockLabelAttributes: readonly AttributeRow[] = [
  { name: 'kv-code-block-label', values: 'always', meaning: 'The part class.' },
  {
    name: 'id',
    values: 'set by the Root',
    meaning: 'Names the group. A Label is a p, never a heading.',
  },
]

export const codeBlockCodeAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-code-block-code',
    values: 'always',
    meaning: 'The part class. The default theme sets the mono type and wraps the text.',
  },
]

export const codeBlockCopyAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-code-block-copy',
    values: 'always',
    meaning: 'The class of Button, and the part class.',
  },
  {
    name: 'data-status',
    values: 'idle, copied or failed',
    meaning: 'As CopyButton: the result of the last copy, a hook for your own cue.',
  },
]

export const useCodeBlockHook: ApiHook = {
  name: 'useCodeBlock',
  intro: 'Takes no options.',
  result: propRows<UseCodeBlockResult>({
    rootProps: {
      type: 'CodeBlockRootProps',
      default: '–',
      description:
        'Spread on the Root: the class, and role="group" with aria-labelledby while a Label is mounted.',
    },
    labelProps: {
      type: 'CodeBlockLabelProps',
      default: '–',
      description: 'Spread on the Label: the class and the id that names the group.',
    },
    codeProps: {
      type: 'CodeBlockCodeProps',
      default: '–',
      description: 'Spread on the Code, which also gets context.codeRef as its ref.',
    },
    context: {
      type: 'CodeBlockContextValue',
      default: '–',
      description: 'What the parts share: labelId, codeRef and registerLabel.',
    },
    hasLabel: { type: 'boolean', default: '–', description: 'True while a Label is mounted.' },
  }),
}
