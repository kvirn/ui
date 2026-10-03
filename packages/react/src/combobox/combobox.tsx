'use client'
import { Fragment, useContext, useEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import {
  Listbox,
  ListboxEmpty,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxList,
  ListboxOption,
  ListboxPopup,
} from '../listbox/listbox.tsx'
import type {
  ListboxEmptyProps,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemRenderer,
  ListboxListProps,
  ListboxOptionProps,
  ListboxOptionState,
  ListboxPartState,
  ListboxPopupProps,
} from '../listbox/listbox.tsx'
import { ListboxListContext } from '../listbox/listbox-context.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { ComboboxContext } from './combobox-context.ts'
import { useCombobox } from './use-combobox.ts'
import type {
  ComboboxSelectedValue,
  UseComboboxOptions,
  UseComboboxResult,
} from './use-combobox.ts'

/** What `render` receives as its second argument, for the parts that show the open state. */
export interface ComboboxPartState {
  isOpen: boolean
}

export type ComboboxRootProps<TItem> = UseComboboxOptions<TItem> & {
  children?: ReactNode
}

/** Internal. The dev warning for a part used outside a Root, shared by Combobox and Autocomplete. */
function warnOutsideRoot(part: string): void {
  warnOnce(
    `combobox-${part.toLowerCase()}-outside-root`,
    `A ${part} is outside a Combobox.Root or Autocomplete.Root, so it does nothing. Put it inside the Root.`,
  )
}

/**
 * Internal. Provides what the parts read: the field's own context, and the Listbox's list
 * context that the popup parts (`Popup`, `List`, `Option`, `Group`, `GroupLabel`, `Empty`) share.
 * `Combobox.Root` and `Autocomplete.Root` both render it, after their own hook.
 */
export function ComboboxProviders<TItem>({
  combobox,
  children,
}: {
  combobox: UseComboboxResult<TItem>
  children?: ReactNode
}): ReactElement {
  return (
    <ComboboxContext.Provider
      value={{
        variant: combobox.variant,
        isOpen: combobox.isOpen,
        isMultiple: combobox.isMultiple,
        isDisabled: combobox.isDisabled,
        hasClearableValue: combobox.hasClearableValue,
        controlProps: combobox.controlProps,
        inputProps: combobox.inputProps,
        toggleProps: combobox.toggleProps,
        clearProps: combobox.clearProps,
        valueListProps: combobox.valueListProps,
        selectedValues: combobox.selectedValues,
        getValueProps: combobox.getValueProps,
        getRemoveButtonProps: combobox.getRemoveButtonProps,
      }}
    >
      <ListboxListContext.Provider
        value={{
          isOpen: combobox.isOpen,
          entries: combobox.entries,
          sections: combobox.sections,
          size: combobox.size,
          activeKey: combobox.activeKey,
          popupProps: combobox.popupProps,
          listProps: combobox.listProps,
          emptyProps: combobox.emptyProps,
          // While the options load, an empty list says so instead of "No results".
          emptyText: combobox.isLoading ? combobox.loadingText : combobox.emptyText,
          getOptionProps: combobox.getOptionProps,
          getGroupProps: combobox.getGroupProps,
          getGroupLabelProps: combobox.getGroupLabelProps,
          getEntry: combobox.getEntry,
          shouldScrollToActive: combobox.shouldScrollToActive,
          virtualization: combobox.virtualization,
        }}
      >
        {children}
        {combobox.hiddenInputs.map((input) => (
          <input key={`${input.name}:${input.value}`} type="hidden" {...input} />
        ))}
      </ListboxListContext.Provider>
    </ComboboxContext.Provider>
  )
}

/**
 * Owns the state of a Combobox: the options, the chosen value, the text and the open state
 * (contract: combobox.a11y.md). It renders no element of its own: put a
 * `Combobox.Input` and a `Combobox.Popup` inside it, in a `Field`, the popup right after the
 * input. With `multiple`, put a `Combobox.ValueList` before the input.
 *
 * The user types to filter the list, then chooses. The value is the chosen option's key
 * (`itemToKey`): a string or `null`, or with `multiple` an array. It is controlled with `value`
 * and `onValueChange`, or uncontrolled with `defaultValue`. The text is `inputValue` and
 * `onInputValueChange`. With `name`, hidden inputs put the value in a plain `<form>`.
 *
 * Text that matches no option stays in the input and the value is `null`: say "Välj ett
 * alternativ i listan" in your own validation. The text is never cleared silently.
 *
 * @example
 * <Field>
 *   <Label>Kommun</Label>
 *   <Combobox.Root items={municipalities} itemToString={(municipality) => municipality.name}
 *     itemToKey={(municipality) => municipality.code} name="municipality">
 *     <Combobox.Input />
 *     <Combobox.Popup>
 *       <Combobox.List>{(municipality) => <Combobox.Option item={municipality} />}</Combobox.List>
 *       <Combobox.Empty />
 *     </Combobox.Popup>
 *   </Combobox.Root>
 * </Field>
 */
export function ComboboxRoot<TItem>(props: ComboboxRootProps<TItem>): ReactElement {
  const combobox = useCombobox(props)
  return <ComboboxProviders combobox={combobox}>{props.children}</ComboboxProviders>
}
ComboboxRoot.displayName = 'Combobox.Root'

export interface ComboboxControlProps extends ComponentPropsWithRef<'div'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, ComboboxPartState> | undefined
}

/**
 * An optional box around the input and its Toggle and Clear buttons. The popup is placed
 * against it (as wide as it) instead of against the input alone, and the default theme draws
 * the field's edge, fill and focus ring on it. Without it the input and the buttons are yours to
 * lay out. It has no role.
 */
export function ComboboxControl({
  render,
  ref,
  ...otherProps
}: ComboboxControlProps): ReactElement {
  const combobox = useContext(ComboboxContext)
  const mergedRef = useMergedRef(ref, combobox?.controlProps.ref ?? null)
  useEffect(() => {
    if (combobox === null) {
      warnOutsideRoot('Combobox.Control')
    }
  }, [combobox])
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, combobox?.controlProps ?? { className: 'kv-combobox-control' }),
      ref: mergedRef,
    },
    state: { isOpen: combobox?.isOpen ?? false },
  })
}
ComboboxControl.displayName = 'Combobox.Control'

export interface ComboboxInputProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'id' | 'type' | 'role' | 'value' | 'defaultValue'
> {
  render?: RenderProp<ComponentPropsWithRef<'input'>, ComboboxPartState> | undefined
}

function hasNameSource(input: HTMLInputElement): boolean {
  return (
    input.hasAttribute('aria-label') ||
    input.hasAttribute('aria-labelledby') ||
    input.hasAttribute('title') ||
    (input.labels?.length ?? 0) > 0
  )
}

/**
 * The text field: a native `<input role="combobox" aria-autocomplete="list">`, named by the
 * Field's `<label for>`. **DOM focus stays on it**, and the active option is
 * `aria-activedescendant`. Typing filters the list and opens the popup. ArrowDown and ArrowUp
 * open it and move the highlight (no option is active until then, so Enter never chooses
 * something the user didn't move to), and Enter with no active option is the browser's own.
 * Escape closes and keeps the text, Tab closes without choosing, and Home and End move the caret.
 * Your own `autoComplete` replaces the default `off`.
 */
export function ComboboxInput({ render, ref, ...otherProps }: ComboboxInputProps): ReactElement {
  const combobox = useContext(ComboboxContext)
  const field = useContext(FieldContext)
  const elementRef = useRef<HTMLInputElement | null>(null)
  const mergedRef = useMergedRef(useMergedRef(ref, combobox?.inputProps.ref ?? null), elementRef)
  useEffect(() => {
    if (combobox === null) {
      warnOutsideRoot('Combobox.Input')
    }
  }, [combobox])
  useEffect(() => {
    const element = elementRef.current
    if (element === null || combobox === null || hasNameSource(element)) {
      return
    }
    if (field !== null) {
      warnOnce(
        'combobox-input-in-field-without-label',
        'A Combobox.Input in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
      )
    } else {
      warnOnce(
        'combobox-input-without-name',
        'A Combobox.Input has no accessible name. A placeholder isn’t a label: it disappears when the user types (WCAG 3.3.2). Put it in a Field with a Field.Label, or give it aria-label or aria-labelledby.',
      )
    }
  })

  return renderPart({
    render,
    defaultElement: 'input',
    partProps: {
      ...mergeProps(
        { autoComplete: 'off', spellCheck: combobox?.variant === 'combobox' ? false : undefined },
        otherProps,
        combobox?.inputProps ?? { className: 'kv-combobox-input' },
      ),
      ref: mergedRef,
    },
    state: { isOpen: combobox?.isOpen ?? false },
  })
}
ComboboxInput.displayName = 'Combobox.Input'

export interface ComboboxToggleProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, ComboboxPartState> | undefined
}

/**
 * An optional button that opens and closes the popup, named by `combobox.showOptions` ("Visa
 * alternativ"). It is **not a tab stop** (`tabindex="-1"`): the keyboard has ArrowDown and
 * Alt+ArrowDown on the input, and pressing it never takes focus from the input. Put it after the
 * input, in a `Combobox.Control`. No children: the default theme draws a chevron.
 */
export function ComboboxToggle({
  render,
  ref,
  children,
  ...otherProps
}: ComboboxToggleProps): ReactElement {
  const combobox = useContext(ComboboxContext)
  const mergedRef = useMergedRef(ref, combobox?.toggleProps.ref ?? null)
  useEffect(() => {
    if (combobox === null) {
      warnOutsideRoot('Combobox.Toggle')
    }
  }, [combobox])
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, combobox?.toggleProps ?? { className: 'kv-combobox-toggle' }),
      ref: mergedRef,
      children,
    },
    state: { isOpen: combobox?.isOpen ?? false },
  })
}
ComboboxToggle.displayName = 'Combobox.Toggle'

export interface ComboboxClearProps extends ComponentPropsWithRef<'button'> {
  render?: RenderProp<ComponentPropsWithRef<'button'>, ComboboxPartState> | undefined
}

/**
 * An optional button that empties the text and the value, named by `combobox.clear` ("Rensa"). It
 * is the only thing that empties the text: nothing clears it silently. It shows only while
 * there is text or a chosen value, is **not a tab stop** (select the text and delete it, or
 * remove the values one by one), and focus stays on, or returns to, the input.
 */
export function ComboboxClear({
  render,
  ref,
  children,
  ...otherProps
}: ComboboxClearProps): ReactElement | null {
  const combobox = useContext(ComboboxContext)
  const mergedRef = useMergedRef(ref, combobox?.clearProps.ref ?? null)
  useEffect(() => {
    if (combobox === null) {
      warnOutsideRoot('Combobox.Clear')
    }
  }, [combobox])
  if (combobox === null || !combobox.hasClearableValue) {
    return null
  }
  return renderPart({
    render,
    defaultElement: 'button',
    partProps: {
      ...mergeProps(otherProps, combobox.clearProps),
      ref: mergedRef,
      children,
    },
    state: { isOpen: combobox.isOpen },
  })
}
ComboboxClear.displayName = 'Combobox.Clear'

/** What the function children of `Combobox.ValueList` render for each chosen value. */
export type ComboboxValueRenderer<TItem> = (
  item: TItem,
  value: ComboboxSelectedValue<TItem>,
) => ReactNode

export interface ComboboxValueListProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'ul'>,
  'children'
> {
  /**
   * A function that renders one `Combobox.Value` per chosen value: `(item) => <Combobox.Value
   * item={item} />`. Default: one `Combobox.Value` with the item's text.
   */
  children?: ReactNode | ComboboxValueRenderer<TItem>
  render?: RenderProp<ComponentPropsWithRef<'ul'>, ComboboxPartState> | undefined
}

/**
 * The chosen values of a `multiple` Combobox, before the input: a `<ul>` named by the Field's
 * label, one `Combobox.Value` (`<li>`) per value, each with a remove button. It renders nothing
 * while no value is chosen.
 */
export function ComboboxValueList<TItem = unknown>({
  children,
  render,
  ref,
  ...otherProps
}: ComboboxValueListProps<TItem>): ReactElement | null {
  const combobox = useContext(ComboboxContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (combobox === null) {
      warnOutsideRoot('Combobox.ValueList')
    }
  }, [combobox])
  if (combobox === null || combobox.selectedValues.length === 0) {
    return null
  }
  const hasOwnName =
    otherProps['aria-label'] !== undefined || otherProps['aria-labelledby'] !== undefined
  // The context can't carry the item type, so the caller's `TItem` is taken on trust.
  const values = combobox.selectedValues as readonly ComboboxSelectedValue<TItem>[]
  return renderPart({
    render,
    defaultElement: 'ul',
    partProps: {
      ...mergeProps(otherProps, combobox.valueListProps),
      // A list's own name wins over the Field's label.
      ...(hasOwnName ? { 'aria-labelledby': otherProps['aria-labelledby'] } : {}),
      ref: mergedRef,
      children: values.map((value) => (
        <Fragment key={value.key}>
          {typeof children === 'function'
            ? children(value.item, value)
            : (children ?? <ComboboxValue item={value.item} />)}
        </Fragment>
      )),
    },
    state: { isOpen: combobox.isOpen },
  })
}
ComboboxValueList.displayName = 'Combobox.ValueList'

/** What `render` receives as its second argument, for `Combobox.Value`. */
export interface ComboboxValueState<TItem = unknown> {
  item: TItem
  /** The value's text (`itemToString`). */
  label: string
  isDisabled: boolean
}

export interface ComboboxValueProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'li'>,
  'children'
> {
  /** One of the chosen items, as `Combobox.ValueList` hands it to you. */
  item: TItem
  /** The visible text. Default: the item's text. It is also the name of the remove button. */
  children?: ReactNode
  /** Drawn inside the remove button, which has no text of its own. Default: a cross, drawn by the theme. */
  removeIcon?: ReactNode
  render?: RenderProp<ComponentPropsWithRef<'li'>, ComboboxValueState<TItem>> | undefined
}

/**
 * One chosen value: an `<li>` with its text and a remove `<button>` named by
 * `combobox.removeValue` ("Ta bort Stockholm"). Removing a value moves focus to the next remove
 * button, else the previous, else the input. The remove button is a normal tab stop and is
 * operated with Enter or Space. Backspace in the empty input does not remove a value.
 */
export function ComboboxValue<TItem = unknown>({
  item,
  children,
  removeIcon,
  render,
  ref,
  ...otherProps
}: ComboboxValueProps<TItem>): ReactElement | null {
  const combobox = useContext(ComboboxContext)
  const mergedRef = useMergedRef(ref, null)
  const value = combobox?.selectedValues.find((candidate) => Object.is(candidate.item, item))
  useEffect(() => {
    if (combobox === null) {
      warnOutsideRoot('Combobox.Value')
    } else if (value === undefined) {
      warnOnce(
        'combobox-value-unknown-item',
        'A Combobox.Value got an item that is not chosen. Pass the item that Combobox.ValueList hands to your function, unchanged.',
      )
    }
  }, [combobox, value])
  if (combobox === null || value === undefined) {
    return null
  }
  const removeProps = combobox.getRemoveButtonProps(value)
  return renderPart({
    render,
    defaultElement: 'li',
    partProps: {
      ...mergeProps(otherProps, combobox.getValueProps(value)),
      ref: mergedRef,
      children: (
        <>
          <span className="kv-combobox-value-label">{children ?? value.label}</span>
          <button {...removeProps}>
            {removeIcon === undefined ? null : <span aria-hidden="true">{removeIcon}</span>}
          </button>
        </>
      ),
    },
    state: { item, label: value.label, isDisabled: combobox.isDisabled },
  })
}
ComboboxValue.displayName = 'Combobox.Value'

// The popup parts are the Listbox's: each Root provides the same context.
export {
  ListboxEmpty as ComboboxEmpty,
  ListboxGroup as ComboboxGroup,
  ListboxGroupLabel as ComboboxGroupLabel,
  ListboxList as ComboboxList,
  ListboxOption as ComboboxOption,
  ListboxPopup as ComboboxPopup,
}
export type ComboboxEmptyProps = ListboxEmptyProps
export type ComboboxGroupLabelProps = ListboxGroupLabelProps
export type ComboboxGroupProps<TItem = unknown> = ListboxGroupProps<TItem>
export type ComboboxItemRenderer<TItem> = ListboxItemRenderer<TItem>
export type ComboboxListProps<TItem = unknown> = ListboxListProps<TItem>
export type ComboboxOptionProps<TItem = unknown> = ListboxOptionProps<TItem>
export type ComboboxOptionState<TItem = unknown> = ListboxOptionState<TItem>
export type ComboboxPopupProps = ListboxPopupProps
export type ComboboxPopupState = ListboxPartState

/**
 * The Combobox's parts. `Root` with `Input` and `Popup` is the editable combobox (the
 * APG combobox with list autocomplete): the user types to filter, then chooses. `Control`,
 * `Toggle` and `Clear` are optional, `ValueList` and `Value` are for `multiple`. The popup parts
 * (`Popup`, `List`, `Option`, `Group`, `GroupLabel`, `Empty`) are the Listbox's.
 */
export const Combobox = {
  Root: ComboboxRoot,
  Control: ComboboxControl,
  Input: ComboboxInput,
  Toggle: ComboboxToggle,
  Clear: ComboboxClear,
  ValueList: ComboboxValueList,
  Value: ComboboxValue,
  Popup: Listbox.Popup,
  List: Listbox.List,
  Option: Listbox.Option,
  Group: Listbox.Group,
  GroupLabel: Listbox.GroupLabel,
  Empty: Listbox.Empty,
} as const
