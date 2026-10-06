import type { ButtonProps, UseButtonOptions, UseButtonResult } from '@kvirn-ui/react'
import { propRows } from '../components/api-block.tsx'
import type { ApiHook, AttributeRow } from '../components/api-block.tsx'

/** The props Button documents: its own, and the three native ones whose behaviour it changes. */
export type ButtonDocumentedProps = Pick<
  ButtonProps,
  'disabled' | 'busy' | 'type' | 'onClick' | 'focusableWhenDisabled' | 'render'
>

export const buttonRows = propRows<ButtonDocumentedProps>({
  disabled: {
    type: 'boolean',
    default: 'false',
    description:
      'Blocks activation. Without focusableWhenDisabled the button is natively disabled and skipped by Tab.',
  },
  focusableWhenDisabled: {
    type: 'boolean',
    default: 'false',
    description:
      'With disabled, keeps the button in the Tab order with aria-disabled="true" so users can find it and read why. Activation stays blocked.',
  },
  busy: {
    type: 'boolean',
    default: 'false',
    description:
      'A running action: aria-disabled="true" and data-busy, never native disabled, so focus stays and every press is blocked. It shows a decorative spinner as its first child, and the name does not change. Put a Progress with the words beside it, without a Progress.Indicator: one indicator per wait. disabled wins when both are set.',
  },
  type: {
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'Use "submit" for the one button that sends the form.',
  },
  onClick: {
    type: 'MouseEventHandler<HTMLButtonElement>',
    default: '–',
    description: 'Called on click, Enter and Space, and never while the button is disabled.',
  },
  render: {
    type: 'RenderProp<ComponentPropsWithRef<"button">, ButtonState>',
    default: '–',
    description:
      'Changes the element, which must still be a <button>. A function receives the props and { isDisabled, isFocusVisible }.',
  },
})

export const buttonAttributes: readonly AttributeRow[] = [
  { name: 'kv-button', values: 'always', meaning: 'The part class. The default theme styles it.' },
  {
    name: 'kv-button--primary',
    values: 'class you add',
    meaning: 'The one main action on the page. Theme variant.',
  },
  {
    name: 'kv-button--danger',
    values: 'class you add',
    meaning: 'An action that deletes something. Theme variant.',
  },
  {
    name: 'kv-button--icon-only',
    values: 'class you add',
    meaning: 'A square button with only an icon. Give it an aria-label. Theme option.',
  },
  {
    name: 'data-disabled',
    values: 'present or absent',
    meaning: 'The button is disabled, natively or focusable.',
  },
  {
    name: 'data-busy',
    values: 'present or absent',
    meaning: 'Set while busy and not disabled. The theme shows the spinner after 1000 ms.',
  },
  {
    name: 'data-focus-visible',
    values: 'present or absent',
    meaning: 'The button has keyboard focus (:focus-visible).',
  },
  {
    name: 'aria-disabled',
    values: '"true" or absent',
    meaning: 'Set when disabled and focusableWhenDisabled are both on. Not passed directly.',
  },
]

export const useButtonHook: ApiHook = {
  name: 'useButton',
  options: propRows<UseButtonOptions>({
    disabled: { type: 'boolean', default: 'false', description: 'Mirrors HTML disabled.' },
    focusableWhenDisabled: {
      type: 'boolean',
      default: 'false',
      description: 'Keeps a disabled button in the Tab order with aria-disabled="true".',
    },
    busy: {
      type: 'boolean',
      default: 'false',
      description:
        'The action is running. Renders aria-disabled="true", keeps focus on the button, blocks a second press, and never uses native disabled. Disabled wins.',
    },
    type: {
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: 'The button type.',
    },
    onClick: {
      type: 'MouseEventHandler<HTMLButtonElement>',
      default: '–',
      description:
        'Called on activation, and never while disabled or busy. Pass it here, not on top.',
    },
  }),
  result: propRows<UseButtonResult>({
    buttonProps: {
      type: 'ButtonPartProps',
      default: '–',
      description: 'Spread on a <button>: class, type, disabled state, handlers.',
    },
    isBusy: {
      type: 'boolean',
      default: '–',
      description: 'Whether the button is busy (busy is set and the button is not disabled).',
    },
    isDisabled: { type: 'boolean', default: '–', description: 'Whether the button is disabled.' },
    isFocusVisible: {
      type: 'boolean',
      default: '–',
      description: 'Whether the button has keyboard (:focus-visible) focus.',
    },
  }),
}
