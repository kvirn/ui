'use client'
import type { ListboxEntry, ListboxSection } from '@kvirn-ui/core'
import {
  createElement,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { useEnv } from '../provider/use-env.ts'
import { ToolbarContext } from '../toolbar/toolbar-context.ts'
import {
  ListboxGroupContext,
  ListboxListContext,
  ListboxTriggerContext,
  ListboxVirtualContext,
} from './listbox-context.ts'
import { getListboxOptionPartIds, ListboxOptionContext } from './listbox-option-context.ts'
import type { ListboxOptionPartKind } from './listbox-option-context.ts'
import { useListbox } from './use-listbox.ts'
import type { ListboxVirtualOptionPartProps } from './use-list-virtualization.ts'
import type { UseListboxOptions, UseListboxResult } from './use-listbox.ts'
import { ListboxNative } from './listbox-native.tsx'

export type ListboxRootProps<TItem> = UseListboxOptions<TItem> & {
  children?: ReactNode
}

type AriaNameProps = Pick<ComponentPropsWithRef<'div'>, 'aria-label' | 'aria-labelledby'>

/**
 * Internal. A part's own name wins over the Field's label: `aria-labelledby` would outrank the
 * consumer's `aria-label`, so the Field's id is dropped when they name the part themselves.
 */
function ownNameProps(own: AriaNameProps): AriaNameProps {
  return own['aria-label'] !== undefined || own['aria-labelledby'] !== undefined
    ? { 'aria-labelledby': own['aria-labelledby'] }
    : {}
}

/** What an option gets from a virtualized list: nothing, when its list isn't virtualized. */
const noVirtualProps: Partial<ListboxVirtualOptionPartProps> = {}

function warnOutsideRoot(part: string): void {
  warnOnce(
    `listbox-${part.toLowerCase()}-outside-root`,
    `A Listbox.${part} is outside a Listbox.Root, so it does nothing. Put it inside <Listbox.Root>.`,
  )
}

/** The native rendering's options: an empty one for "nothing chosen", then the items, in `<optgroup>`s for groups. */
function renderNativeOptions<TItem>(
  listbox: UseListboxResult<TItem>,
  itemToLang: ((item: TItem) => string | undefined) | undefined,
): ReactElement {
  const renderOption = (entry: ListboxEntry<TItem>) => (
    <option
      key={entry.key}
      value={entry.key}
      disabled={entry.disabled}
      lang={itemToLang?.(entry.item)}
    >
      {entry.label}
    </option>
  )
  // An empty option stands for "nothing chosen". Once something is chosen it goes, unless it
  // carries the placeholder text, so a screen reader doesn't read a blank option.
  const hasEmptyOption = listbox.placeholder !== undefined || listbox.selectedKeys.length === 0
  return (
    <>
      {hasEmptyOption ? <option value="">{listbox.placeholder ?? ''}</option> : null}
      {listbox.sections === undefined
        ? listbox.entries.map(renderOption)
        : listbox.sections.map((section) => (
            <optgroup key={section.key} label={section.label}>
              {section.entries.map(renderOption)}
            </optgroup>
          ))}
    </>
  )
}

/**
 * Owns the state of a Listbox: the options, the chosen value and the open state (contract: listbox.a11y.md). It renders no element of its own: put a `Listbox.Trigger` and a
 * `Listbox.Popup` inside it, the popup right after the trigger, in a `Field`.
 *
 * The value is the chosen option's key (`itemToKey`): a string or `null`, or with `multiple` an
 * array. It is controlled with `value` and `onValueChange`, or uncontrolled with `defaultValue`.
 * With `name`, hidden inputs put it in a plain `<form>`.
 *
 * On touch devices a single choice renders a native `<select>` instead of the children
 * (`native="auto"`, the default): it shows plain text, one line per option, so rich option
 * content, `Listbox.Empty` and the popup's look don't apply there. Use `native="never"` to
 * keep the popup, or `native="always"` to avoid the one frame of the custom trigger that a
 * touch device shows before it switches. `multiple` always renders the popup.
 *
 * @example
 * <Field.Root>
 *   <Field.Label>Kommun</Field.Label>
 *   <Listbox.Root items={municipalities} itemToString={(municipality) => municipality.name}
 *     itemToKey={(municipality) => municipality.code} name="municipality">
 *     <Listbox.Trigger><Listbox.Value placeholder="Välj kommun" /></Listbox.Trigger>
 *     <Listbox.Popup>
 *       <Listbox.List>{(municipality) => <Listbox.Option item={municipality} />}</Listbox.List>
 *       <Listbox.Empty />
 *     </Listbox.Popup>
 *   </Listbox.Root>
 * </Field.Root>
 */
export function ListboxRoot<TItem>(props: ListboxRootProps<TItem>): ReactElement {
  const listbox = useListbox(props)
  const isInToolbar = useContext(ToolbarContext) !== null
  const isNative = listbox.isNative
  // The contexts can't carry the item type, so the caller's `TItem` is taken on trust.
  const itemToLang = props.itemToLang as ((item: unknown) => string | undefined) | undefined

  useEffect(() => {
    if (isInToolbar && isNative) {
      warnOnce(
        'listbox-native-in-toolbar',
        'A Listbox in a Toolbar rendered a native <select> (native="auto" on a touch device, or native="always"), which replaces its children: the Toolbar.Item and the trigger\'s name are gone, and the select is not a toolbar item, so it has no accessible name from you and no roving tabindex (WCAG 4.1.2, 2.1.1). Set native="never" on the Listbox.Root.',
      )
    }
  }, [isInToolbar, isNative])

  if (listbox.isNative) {
    return (
      <ListboxNative
        name={props.name}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        value={listbox.nativeValue}
        onValueChange={listbox.selectFromNative}
      >
        {renderNativeOptions(listbox, props.itemToLang)}
      </ListboxNative>
    )
  }

  return (
    <ListboxTriggerContext.Provider
      value={{
        isOpen: listbox.isOpen,
        triggerProps: listbox.triggerProps,
        valueProps: listbox.valueProps,
        selectedItems: listbox.selectedItems,
        selectedLabels: listbox.selectedLabels,
        placeholder: listbox.placeholder,
        itemToLang,
      }}
    >
      <ListboxListContext.Provider
        value={{
          isOpen: listbox.isOpen,
          entries: listbox.entries,
          sections: listbox.sections,
          size: listbox.size,
          activeKey: listbox.activeKey,
          popupProps: listbox.popupProps,
          listProps: listbox.listProps,
          emptyProps: listbox.emptyProps,
          emptyText: listbox.emptyText,
          getOptionProps: listbox.getOptionProps,
          getGroupProps: listbox.getGroupProps,
          getGroupLabelProps: listbox.getGroupLabelProps,
          getEntry: listbox.getEntry,
          shouldScrollToActive: listbox.shouldScrollToActive,
          virtualization: listbox.virtualization,
          itemToLang,
        }}
      >
        {props.children}
        {listbox.hiddenInputs.map((input) => (
          <input key={`${input.name}:${input.value}`} type="hidden" {...input} />
        ))}
      </ListboxListContext.Provider>
    </ListboxTriggerContext.Provider>
  )
}
ListboxRoot.displayName = 'Listbox.Root'

export type ListboxTriggerProps = Omit<ComponentPropsWithRef<'div'>, 'id' | 'role'>

/**
 * The element that shows the chosen option and opens the popup: a `<div role="combobox"
 * tabindex="0">`, as in the APG select-only example. **DOM focus stays on it**, and the active
 * option is `aria-activedescendant`. Its name is the Field's label followed by the value; give it
 * your own `aria-label` or `aria-labelledby` outside a Field. A press opens or closes the popup,
 * and the keys are the contract's (arrows, Home, End, Enter, Space, Escape, Tab, typeahead).
 * With no children it renders a `Listbox.Value`.
 */
export function ListboxTrigger({
  ref,
  children,
  ...otherProps
}: ListboxTriggerProps): ReactElement {
  const trigger = useContext(ListboxTriggerContext)
  const field = useContext(FieldContext)
  const env = useEnv()
  const mergedRef = useMergedRef(ref, trigger?.triggerProps.ref ?? null)
  useEffect(() => {
    if (trigger === null) {
      warnOutsideRoot('Trigger')
    }
  }, [trigger])

  const hasOwnName =
    otherProps['aria-label'] !== undefined || otherProps['aria-labelledby'] !== undefined
  const labelId = field?.labelId
  useEffect(() => {
    if (hasOwnName || env === undefined || trigger === null) {
      return
    }
    if (labelId !== undefined && env.document.getElementById(labelId) === null) {
      warnOnce(
        'listbox-trigger-in-field-without-label',
        'A Listbox.Trigger in a Field has no Field.Label, so it has no accessible name (WCAG 1.3.1, 4.1.2). Add <Field.Label> to the Field.',
      )
    } else if (labelId === undefined) {
      warnOnce(
        'listbox-trigger-without-name',
        'A Listbox.Trigger has no accessible name. Put it in a Field with a Field.Label, or give it aria-label or aria-labelledby (WCAG 1.3.1, 4.1.2).',
      )
    }
  })

  return createElement(
    'div',
    {
      ...mergeProps(otherProps, trigger?.triggerProps ?? {}),
      ...ownNameProps(otherProps),
      // The consumer's `tabIndex` wins: a Toolbar.Item sets the roving one.
      ...(otherProps.tabIndex === undefined ? {} : { tabIndex: otherProps.tabIndex }),
      ref: mergedRef,
    },
    children ?? <ListboxValue />,
  )
}
ListboxTrigger.displayName = 'Listbox.Trigger'

export interface ListboxValueProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'span'>,
  'id' | 'children'
> {
  /** Shown while nothing is chosen. Never the only label: the Field's label stays. Default: the Root's `placeholder`. */
  placeholder?: string | undefined
  /**
   * What shows when something is chosen. Default: the chosen options' texts, joined with a
   * comma. A function gets the chosen items, for example to render a count: `(items) => items.length`.
   */
  children?: ReactNode | ((selectedItems: readonly TItem[]) => ReactNode)
}

/**
 * The chosen option's text, or the placeholder, inside `Listbox.Trigger`. It is part of the
 * trigger's accessible name and carries `data-placeholder` while nothing is chosen.
 */
export function ListboxValue<TItem = unknown>({
  placeholder,
  children,
  ref,
  ...otherProps
}: ListboxValueProps<TItem>): ReactElement {
  const trigger = useContext(ListboxTriggerContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (trigger === null) {
      warnOutsideRoot('Value')
    }
  }, [trigger])
  const isPlaceholder = (trigger?.selectedItems.length ?? 0) === 0
  let content: ReactNode
  if (isPlaceholder) {
    content = placeholder ?? trigger?.placeholder
  } else if (typeof children === 'function') {
    // The context can't carry the item type, so the caller's `TItem` is taken on trust.
    content = children((trigger?.selectedItems ?? []) as readonly TItem[])
  } else {
    const itemToLang = trigger?.itemToLang
    content =
      children ??
      (itemToLang === undefined
        ? trigger?.selectedLabels.join(', ')
        : // Each label in its own language (3.1.2); the separator stays the page's.
          trigger?.selectedItems.map((item, index) => (
            <Fragment key={index}>
              {index === 0 ? null : ', '}
              <span lang={itemToLang(item)}>{trigger.selectedLabels[index]}</span>
            </Fragment>
          )))
  }
  return createElement(
    'span',
    {
      ...mergeProps(otherProps, trigger?.valueProps ?? { className: 'kv-listbox-value' }),
      ref: mergedRef,
    },
    content,
  )
}
ListboxValue.displayName = 'Listbox.Value'

export type ListboxPopupProps = Omit<
  ComponentPropsWithRef<'div'>,
  'id' | 'role' | 'aria-label' | 'aria-labelledby'
>

/**
 * The popup: a role-less `<div popover="manual">` in the top layer, so no z-index and no clipping
 * by an ancestor. It is the shell: the edge, the shadow and the position. It is always rendered
 * and hidden by the browser while closed. It is placed under the trigger, as wide as it, flips
 * when there is no room and is never taller than the room that is left
 * (`--kv-popup-max-height`): the `Listbox.List` inside scrolls. **Focus never enters it**: a press
 * in it keeps focus on the trigger. Escape and a press outside close it. Put `Listbox.List` and
 * `Listbox.Empty` inside. Listbox, Combobox and Autocomplete share this part.
 */
export function ListboxPopup({ ref, ...otherProps }: ListboxPopupProps): ReactElement {
  const list = useContext(ListboxListContext)
  const mergedRef = useMergedRef(ref, list?.popupProps.ref ?? null)
  useEffect(() => {
    if (list === null) {
      warnOutsideRoot('Popup')
    }
  }, [list])
  return createElement('div', {
    ...mergeProps(otherProps, list?.popupProps ?? {}),
    ref: mergedRef,
  })
}
ListboxPopup.displayName = 'Listbox.Popup'

/** What the function children of `Listbox.List` and `Listbox.Group` render for each option. */
export type ListboxItemRenderer<TItem> = (item: TItem, entry: ListboxEntry<TItem>) => ReactNode

export interface ListboxListProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'id' | 'role'
> {
  /**
   * A function that renders one `Listbox.Option` per item: `(item) => <Listbox.Option item={item} />`.
   * With `groups`, a `Listbox.Group` wraps each group's options. Annotate the item
   * (`(item: Municipality) => …`) to type it. Options render only while the popup is open.
   */
  children?: ReactNode | ListboxItemRenderer<TItem>
}

/**
 * The `listbox`, inside `Listbox.Popup`: the element that `aria-controls` points at, named by the
 * Field's label (or your own `aria-label` or `aria-labelledby`), with `aria-multiselectable` for
 * `multiple`. It is the part that scrolls, so a combobox popup that is too tall scrolls without a
 * tab stop of its own. It renders the options of every item, or of every group, only while the
 * popup is open, so a long closed list costs nothing. It is always in the DOM, and `hidden`
 * while the popup is open with no option to show (then `Listbox.Empty` stands alone).
 */
export function ListboxList<TItem = unknown>({
  children,
  ref,
  ...otherProps
}: ListboxListProps<TItem>): ReactElement {
  const list = useContext(ListboxListContext)
  const mergedRef = useMergedRef(ref, list?.listProps.ref ?? null)
  useEffect(() => {
    if (list === null) {
      warnOutsideRoot('List')
    }
  }, [list])
  const isVirtualizedWithoutFunction =
    list?.virtualization !== undefined && typeof children !== 'function'
  useEffect(() => {
    if (isVirtualizedWithoutFunction) {
      warnOnce(
        'listbox-virtualize-needs-function-children',
        'A virtualized Listbox.List needs a function as its children, (item) => <Listbox.Option item={item} />, so it can render only the options that are in view. The children you gave are rendered as they are, and the list is not virtualized.',
      )
    }
  }, [isVirtualizedWithoutFunction])

  let content: ReactNode = null
  if (list !== null && list.isOpen) {
    if (typeof children !== 'function') {
      content = children
    } else if (list.virtualization !== undefined && list.sections === undefined) {
      // Only the options in view and the ones the user is on, in a sizer as tall as the whole list.
      const { sizerProps, items } = list.virtualization
      content = (
        <div {...sizerProps}>
          <ListboxVirtualContext.Provider value>
            {items.map((item) => {
              const entry = list.entries[item.index]
              return entry === undefined ? null : (
                <Fragment key={entry.key}>
                  {children(entry.item as TItem, entry as ListboxEntry<TItem>)}
                </Fragment>
              )
            })}
          </ListboxVirtualContext.Provider>
        </div>
      )
    } else if (list.sections === undefined) {
      // The context can't carry the item type, so the caller's `TItem` is taken on trust.
      content = list.entries.map((entry) => (
        <Fragment key={entry.key}>
          {children(entry.item as TItem, entry as ListboxEntry<TItem>)}
        </Fragment>
      ))
    } else {
      content = list.sections.map((section) => (
        <ListboxGroup key={section.key} section={section as ListboxSection<TItem>}>
          {children}
        </ListboxGroup>
      ))
    }
  }

  return createElement(
    'div',
    {
      ...mergeProps(otherProps, list?.listProps ?? { className: 'kv-listbox-list' }),
      ...ownNameProps(otherProps),
      ref: mergedRef,
    },
    content,
  )
}
ListboxList.displayName = 'Listbox.List'

export interface ListboxOptionProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'id' | 'role'
> {
  /** One of the Root's items, as `Listbox.List` hands it to you. */
  item: TItem
  /** Default: the item's text. Put your own content here for a rich option. */
  children?: ReactNode
}

/**
 * One option: a `<div role="option">` with `aria-selected`, and `aria-disabled` when the item is
 * disabled (it stays reachable with the arrow keys and can't be chosen). A click chooses it, and
 * moving the pointer over it makes it the active option. `data-active`, `data-selected` and
 * `data-disabled` are for your styles; the active option is also `aria-activedescendant` on the
 * trigger. The active option is scrolled into view when a key moved it, and the chosen option
 * when the popup opens.
 */
export function ListboxOption<TItem = unknown>({
  item,
  children,
  ref,
  ...otherProps
}: ListboxOptionProps<TItem>): ReactElement | null {
  const list = useContext(ListboxListContext)
  const isInVirtualList = useContext(ListboxVirtualContext)
  const entry = list?.getEntry(item)
  const elementRef = useRef<HTMLDivElement | null>(null)
  // A virtualized list measures each option it renders, so an option that wraps gets its height.
  const virtualization = isInVirtualList ? list?.virtualization : undefined
  const measureElement = virtualization?.measureElement
  const measuredRef = useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element
      measureElement?.(element)
    },
    [measureElement],
  )
  const mergedRef = useMergedRef(ref, measuredRef)
  const optionProps = entry === undefined ? undefined : list?.getOptionProps(entry)
  const virtualProps = entry === undefined ? undefined : virtualization?.getOptionProps(entry)
  const isActive = optionProps !== undefined && 'data-active' in optionProps
  const isSelected = optionProps?.['aria-selected'] === true

  // Which of OptionText, OptionDescription and OptionIndicator rendered inside this option.
  const [registered, setRegistered] = useState<Record<ListboxOptionPartKind, number>>({
    text: 0,
    description: 0,
    indicator: 0,
  })
  const registerPart = useCallback((kind: ListboxOptionPartKind) => {
    setRegistered((counts) => ({ ...counts, [kind]: counts[kind] + 1 }))
    return () => setRegistered((counts) => ({ ...counts, [kind]: counts[kind] - 1 }))
  }, [])
  const optionId = optionProps?.id
  const isDisabled = entry?.disabled ?? false
  const label = entry?.label ?? ''
  const optionContext = useMemo(
    () => ({
      ...getListboxOptionPartIds(optionId ?? ''),
      label,
      isActive,
      isSelected,
      isDisabled,
      registerPart,
    }),
    [optionId, label, isActive, isSelected, isDisabled, registerPart],
  )

  const scrollState = useRef({ list, isSelected, isVirtual: virtualProps !== undefined })
  useLayoutEffect(() => {
    scrollState.current = { list, isSelected, isVirtual: virtualProps !== undefined }
  })
  useEffect(() => {
    const element = elementRef.current
    const { list: currentList, isSelected: isCurrentlySelected, isVirtual } = scrollState.current
    // A virtualized list scrolls by index (scrollToIndex), because the element may not exist yet.
    if (element === null || currentList === null || isVirtual) {
      return
    }
    const shouldScroll = isActive
      ? currentList.shouldScrollToActive()
      : isCurrentlySelected && currentList.activeKey === undefined
    if (shouldScroll && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [isActive])

  useEffect(() => {
    if (list === null) {
      warnOutsideRoot('Option')
    } else if (entry === undefined) {
      warnOnce(
        'listbox-option-unknown-item',
        'A Listbox.Option got an item that is not in the Root’s items. Pass the item that Listbox.List hands to your function, unchanged.',
      )
    }
  }, [list, entry])

  if (entry === undefined || optionProps === undefined) {
    return null
  }
  // The name is the OptionText alone, so a second line never becomes part of it. Without one it is
  // the content, as it always was. An `aria-label` or `aria-labelledby` of the consumer's wins.
  const hasOwnName =
    otherProps['aria-label'] !== undefined || otherProps['aria-labelledby'] !== undefined
  const richProps = {
    ...(registered.text > 0 && !hasOwnName ? { 'aria-labelledby': optionContext.textId } : {}),
    ...(registered.description > 0
      ? {
          'aria-describedby': [otherProps['aria-describedby'], optionContext.descriptionId]
            .filter((id) => id !== undefined && id !== '')
            .join(' '),
        }
      : {}),
    ...(registered.indicator > 0 ? { 'data-has-indicator': '' } : {}),
  }
  return (
    <ListboxOptionContext.Provider value={optionContext}>
      {createElement(
        'div',
        {
          ...mergeProps(otherProps, optionProps, virtualProps ?? noVirtualProps, richProps),
          lang: otherProps.lang ?? list?.itemToLang?.(item),
          ref: mergedRef,
        },
        children ?? entry.label,
      )}
    </ListboxOptionContext.Provider>
  )
}
ListboxOption.displayName = 'Listbox.Option'

function warnOutsideOption(part: string): void {
  warnOnce(
    `listbox-option-${part.toLowerCase()}-outside-option`,
    `A Listbox.${part} is outside a Listbox.Option, so it does nothing for the option's name or description. Put it inside <Listbox.Option>.`,
  )
}

export type ListboxOptionIconProps = Omit<ComponentPropsWithRef<'span'>, 'aria-hidden'>

/**
 * A decorative slot at the start of an option, for an `<Icon>`, a flag (`<img alt="">`) or an
 * avatar: a `<span aria-hidden="true">`. It is never part of the option's name, so anything it
 * means (a country, a status) must also be in the text. Listbox, Combobox and Autocomplete share
 * this part. It isn't rendered in the native `<select>` rendering.
 */
export function ListboxOptionIcon({ ref, ...otherProps }: ListboxOptionIconProps): ReactElement {
  const mergedRef = useMergedRef(ref, null)
  return createElement('span', {
    ...mergeProps(otherProps, {
      className: 'kv-listbox-option-icon' as const,
      'aria-hidden': true as const,
    }),
    ref: mergedRef,
  })
}
ListboxOptionIcon.displayName = 'Listbox.OptionIcon'

export type ListboxOptionTextProps = Omit<ComponentPropsWithRef<'span'>, 'id'>

/** Whitespace as a reader would collapse it, for comparing the text with `itemToString`. */
function normalizeText(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * The option's text, for a rich option: a `<span>` that the option's `aria-labelledby` points at,
 * so the accessible name is this text alone and a second line (`Listbox.OptionDescription`) is not
 * part of it. Without one the name is the option's whole content. Typeahead, filtering and the
 * trigger's value still use `itemToString`, so this text should equal it (a development warning
 * fires when it doesn't). Default text: the item's text. Listbox, Combobox and Autocomplete
 * share this part.
 */
export function ListboxOptionText({
  children,
  ref,
  ...otherProps
}: ListboxOptionTextProps): ReactElement {
  const option = useContext(ListboxOptionContext)
  const elementRef = useRef<HTMLSpanElement | null>(null)
  const mergedRef = useMergedRef(ref, elementRef)
  const registerPart = option?.registerPart
  useLayoutEffect(() => registerPart?.('text'), [registerPart])
  useEffect(() => {
    if (option === null) {
      warnOutsideOption('OptionText')
    }
  }, [option])
  const label = option?.label
  useEffect(() => {
    const element = elementRef.current
    if (element === null || label === undefined) {
      return
    }
    const text = normalizeText(element.textContent)
    if (text !== normalizeText(label)) {
      warnOnce(
        `listbox-option-text-mismatch:${label}`,
        `A Listbox.OptionText says "${text}" but the option's text (itemToString) is "${label}". Typeahead, filtering and the trigger's value use itemToString, so a user hears one thing and the keyboard finds another (WCAG 2.5.3, 3.2.4). Make itemToString return the same text, or leave the children out.`,
      )
    }
  })
  return createElement(
    'span',
    {
      ...mergeProps(otherProps, {
        className: 'kv-listbox-option-text' as const,
        ...(option === null ? {} : { id: option.textId }),
      }),
      ref: mergedRef,
    },
    children ?? option?.label,
  )
}
ListboxOptionText.displayName = 'Listbox.OptionText'

export type ListboxOptionDescriptionProps = Omit<ComponentPropsWithRef<'span'>, 'id'>

/**
 * A second line under the option's text (a capital, an e-mail address): a `<span>` that the
 * option's `aria-describedby` points at. It is not part of the name when the option has a
 * `Listbox.OptionText`. Screen readers differ in whether they read a description for the active
 * option of a combobox, so never put the only copy of something essential here. Listbox, Combobox
 * and Autocomplete share this part.
 */
export function ListboxOptionDescription({
  ref,
  ...otherProps
}: ListboxOptionDescriptionProps): ReactElement {
  const option = useContext(ListboxOptionContext)
  const mergedRef = useMergedRef(ref, null)
  const registerPart = option?.registerPart
  useLayoutEffect(() => registerPart?.('description'), [registerPart])
  useEffect(() => {
    if (option === null) {
      warnOutsideOption('OptionDescription')
    }
  }, [option])
  return createElement('span', {
    ...mergeProps(otherProps, {
      className: 'kv-listbox-option-description' as const,
      ...(option === null ? {} : { id: option.descriptionId }),
    }),
    ref: mergedRef,
  })
}
ListboxOptionDescription.displayName = 'Listbox.OptionDescription'

export type ListboxOptionIndicatorProps = Omit<ComponentPropsWithRef<'span'>, 'aria-hidden'>

/**
 * The selection mark at the end of an option: a `<span aria-hidden="true">` that always takes its
 * place, with `data-selected` while the option is chosen. With no children the default theme
 * draws its check in it. Children replace the check and show only while the option is chosen.
 * Its presence marks the option with `data-has-indicator`, so the theme's own tick steps aside.
 * The state stays `aria-selected` on the option: this is decoration. Listbox, Combobox and
 * Autocomplete share this part.
 */
export function ListboxOptionIndicator({
  children,
  ref,
  ...otherProps
}: ListboxOptionIndicatorProps): ReactElement {
  const option = useContext(ListboxOptionContext)
  const mergedRef = useMergedRef(ref, null)
  const registerPart = option?.registerPart
  useLayoutEffect(() => registerPart?.('indicator'), [registerPart])
  useEffect(() => {
    if (option === null) {
      warnOutsideOption('OptionIndicator')
    }
  }, [option])
  const isSelected = option?.isSelected ?? false
  return createElement(
    'span',
    {
      ...mergeProps(otherProps, {
        className: 'kv-listbox-option-indicator' as const,
        'aria-hidden': true as const,
        ...(isSelected ? { 'data-selected': '' } : {}),
      }),
      ref: mergedRef,
    },
    isSelected ? children : null,
  )
}
ListboxOptionIndicator.displayName = 'Listbox.OptionIndicator'

export interface ListboxGroupProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'role'
> {
  /** The group, as the Root hands it out in its `sections`. `Listbox.List` passes it for you. */
  section: ListboxSection<TItem>
  /**
   * A function renders the group's label, then one child per option. Other children are rendered
   * as they are: put a `Listbox.GroupLabel` and your own options in them.
   */
  children?: ReactNode | ListboxItemRenderer<TItem>
}

/**
 * A group of options: a `<div role="group">` named by its `Listbox.GroupLabel`. `Listbox.List`
 * renders one per group when the Root has `groups`.
 */
export function ListboxGroup<TItem = unknown>({
  section,
  children,
  ref,
  ...otherProps
}: ListboxGroupProps<TItem>): ReactElement {
  const list = useContext(ListboxListContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (list === null) {
      warnOutsideRoot('Group')
    }
  }, [list])

  const content =
    typeof children === 'function' ? (
      <>
        <ListboxGroupLabel />
        {section.entries.map((entry) => (
          <Fragment key={entry.key}>{children(entry.item, entry)}</Fragment>
        ))}
      </>
    ) : (
      children
    )

  return createElement(
    'div',
    {
      ...mergeProps(
        otherProps,
        list?.getGroupProps(section) ?? { className: 'kv-listbox-group' as const },
      ),
      ...ownNameProps(otherProps),
      ref: mergedRef,
    },
    // The group's label finds its group here.
    <ListboxGroupContext.Provider value={{ section }}>{content}</ListboxGroupContext.Provider>,
  )
}
ListboxGroup.displayName = 'Listbox.Group'

export type ListboxGroupLabelProps = Omit<ComponentPropsWithRef<'div'>, 'id'>

/**
 * The visible name of a group. It is the group's `aria-labelledby` target, so a screen reader
 * reads it on entering the group. Default text: the group's label.
 */
export function ListboxGroupLabel({
  children,
  ref,
  ...otherProps
}: ListboxGroupLabelProps): ReactElement {
  const list = useContext(ListboxListContext)
  const group = useContext(ListboxGroupContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (list === null || group === null) {
      warnOnce(
        'listbox-group-label-outside-group',
        'A Listbox.GroupLabel is outside a Listbox.Group, so it names nothing. Put it inside <Listbox.Group>.',
      )
    }
  }, [list, group])
  const labelProps =
    list === null || group === null
      ? { className: 'kv-listbox-group-label' as const }
      : list.getGroupLabelProps(group.section)
  return createElement(
    'div',
    {
      ...mergeProps(otherProps, labelProps),
      ref: mergedRef,
    },
    children ?? group?.section.label,
  )
}
ListboxGroupLabel.displayName = 'Listbox.GroupLabel'

export type ListboxEmptyProps = ComponentPropsWithRef<'div'>

/**
 * What the open popup shows when there are no options. It renders nothing otherwise. Default
 * text: the locale's "No results" (`combobox.noResults`, or "Loading results" while a Combobox
 * or Autocomplete loads); put your own children in it to say more. It is plain text inside the
 * popup, beside the (then hidden) `Listbox.List`: not an option and not in the listbox. It isn't
 * announced by itself: Combobox and Autocomplete announce it through the Announcer.
 */
export function ListboxEmpty({
  children,
  ref,
  ...otherProps
}: ListboxEmptyProps): ReactElement | null {
  const list = useContext(ListboxListContext)
  const mergedRef = useMergedRef(ref, null)
  useEffect(() => {
    if (list === null) {
      warnOutsideRoot('Empty')
    }
  }, [list])
  if (list === null || !list.isOpen || list.size > 0) {
    return null
  }
  return createElement(
    'div',
    {
      ...mergeProps(otherProps, list.emptyProps),
      ref: mergedRef,
    },
    children ?? list.emptyText,
  )
}
ListboxEmpty.displayName = 'Listbox.Empty'

/**
 * The Listbox's parts. `Root` with `Trigger` and `Popup` is the stylable listbox
 * (the APG select-only combobox). On touch devices, `Root` renders the browser's own `<select>`
 * instead (`native="auto"`).
 */
export const Listbox = {
  Root: ListboxRoot,
  Trigger: ListboxTrigger,
  Value: ListboxValue,
  Popup: ListboxPopup,
  List: ListboxList,
  Option: ListboxOption,
  OptionIcon: ListboxOptionIcon,
  OptionText: ListboxOptionText,
  OptionDescription: ListboxOptionDescription,
  OptionIndicator: ListboxOptionIndicator,
  Group: ListboxGroup,
  GroupLabel: ListboxGroupLabel,
  Empty: ListboxEmpty,
} as const
