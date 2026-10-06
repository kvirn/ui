import type { ToggleProps, UseToggleOptions, UseToggleResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Toggle documents: its own, and the two native ones whose behaviour it changes. */
export type ToggleDocumentedProps = Pick<
  ToggleProps,
  | 'pressed'
  | 'defaultPressed'
  | 'onPressedChange'
  | 'disabled'
  | 'focusableWhenDisabled'
  | 'onClick'
  | 'render'
>

export const toggleRows = propRows<ToggleDocumentedProps>({
  pressed: {
    type: 'boolean',
    default: '–',
    description: 'Controlled: whether the toggle is on. Pair it with onPressedChange.',
  },
  defaultPressed: {
    type: 'boolean',
    default: 'false',
    description: 'Uncontrolled: whether the toggle starts on.',
  },
  onPressedChange: {
    type: '(pressed: boolean, details: { event }) => void',
    default: '–',
    description:
      'Called with the new value and the click behind it. It only reports: with pressed set, you change pressed yourself. Never called while disabled.',
  },
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Blocks switching. Without focusableWhenDisabled the toggle is natively disabled and skipped by Tab.',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'false',
    description:
      'With disabled, keeps the toggle in the Tab order with aria-disabled="true" so users can find it and read why. Switching stays blocked.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description:
      'Called on every activation, after onPressedChange, and never while the toggle is disabled.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"button">, ToggleState>',
    default: '–',
    description:
      'Changes the element, which must still be a <button>. A function receives the props and { isPressed, isDisabled, isFocusVisible }: keep toggleProps.onClick.',
  },
})

export const toggleAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button',
    values: 'always',
    meaning: 'The button class. The default theme styles it.',
  },
  {
    name: 'kv-toggle',
    values: 'always',
    meaning: 'The pressed look: a solid primary fill with a light label or icon.',
  },
  {
    name: 'kv-button--icon-only',
    values: 'class you add',
    meaning: 'A square toggle with only an icon. Give it an aria-label. Theme option.',
  },
  {
    name: 'aria-pressed',
    values: '"true" or "false"',
    meaning: 'Always set, from pressed or defaultPressed. Not passed directly.',
  },
  { name: 'data-pressed', values: 'present or absent', meaning: 'The toggle is on.' },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The toggle is disabled, natively or focusable.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The toggle has keyboard focus (:focus-visible).',
  },
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning: 'Set when disabled and focusableWhenDisabled are both on. Not passed directly.',
  },
]

export const useToggleHook: ApiHook = {
  name: 'useToggle',
  options: propRows<UseToggleOptions>({
    pressed: {
      type: 'boolean',
      default: '–',
      description: 'Controlled: whether the toggle is on.',
    },
    defaultPressed: {
      type: 'boolean',
      default: 'false',
      description: 'Uncontrolled: whether the toggle starts on.',
    },
    onPressedChange: {
      type: '(pressed: boolean, details: { event }) => void',
      default: '–',
      description: 'Called with the new value. Never called while disabled.',
    },
    disabled: { type: 'boolean', default: 'false', description: 'Mirrors HTML disabled.' },
    focusableWhenDisabled: {
      type: 'boolean',
      default: 'false',
      description: 'Keeps a disabled toggle in the Tab order with aria-disabled="true".',
    },
    onClick: {
      type: 'MouseEventHandler<HTMLButtonElement>',
      default: '–',
      description:
        'Called on every activation, and never while disabled. Pass it here, not on top.',
    },
  }),
  result: propRows<UseToggleResult>({
    toggleProps: {
      type: 'TogglePartProps',
      default: '–',
      description: 'Spread on a <button>: classes, type, aria-pressed, disabled state, handlers.',
    },
    isPressed: { type: 'boolean', default: '–', description: 'Whether the toggle is on.' },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the toggle is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the toggle has keyboard (:focus-visible) focus.',
    },
  }),
}
