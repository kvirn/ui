'use client'
import type { ListboxEntry, ListboxSection } from '@kvirn-ui/core'
import { Fragment, useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { mergeProps } from '../merge-props/merge-props.ts'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { renderPart } from '../render/render-part.ts'
import type { RenderProp } from '../render/render-part.ts'
import { useEnv } from '../provider/use-env.ts'
import {
  ListboxGroupContext,
  ListboxListContext,
  ListboxTriggerContext,
  ListboxVirtualContext,
} from './listbox-context.ts'
import { useListbox } from './use-listbox.ts'
import type { ListboxVirtualOptionPartProps } from './use-list-virtualization.ts'
import type { UseListboxOptions, UseListboxResult } from './use-listbox.ts'
import { ListboxNative } from './listbox-native.tsx'

/** What `render` receives as its second argument, for the parts that show the open state. */
export interface ListboxPartState {
  isOpen: boolean
}

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
function renderNativeOptions<TItem>(listbox: UseListboxResult<TItem>): ReactElement {
  const renderOption = (entry: ListboxEntry<TItem>) => (
    <option key={entry.key} value={entry.key} disabled={entry.disabled}>
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

  if (listbox.isNative) {
    return (
      <ListboxNative
        name={props.name}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        value={listbox.nativeValue}
        onValueChange={listbox.selectFromNative}
      >
        {renderNativeOptions(listbox)}
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

export interface ListboxTriggerProps extends Omit<ComponentPropsWithRef<'div'>, 'id' | 'role'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxPartState> | undefined
}

/**
 * The element that shows the chosen option and opens the popup: a `<div role="combobox"
 * tabindex="0">`, as in the APG select-only example. **DOM focus stays on it**, and the active
 * option is `aria-activedescendant`. Its name is the Field's label followed by the value; give it
 * your own `aria-label` or `aria-labelledby` outside a Field. A press opens or closes the popup,
 * and the keys are the contract's (arrows, Home, End, Enter, Space, Escape, Tab, typeahead).
 * With no children it renders a `Listbox.Value`.
 */
export function ListboxTrigger({
  render,
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

  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, trigger?.triggerProps ?? {}),
      ...ownNameProps(otherProps),
      ref: mergedRef,
      children: children ?? <ListboxValue />,
    },
    state: { isOpen: trigger?.isOpen ?? false },
  })
}
ListboxTrigger.displayName = 'Listbox.Trigger'

/** What `render` receives as its second argument, for `Listbox.Value`. */
export interface ListboxValueState {
  /** Nothing is chosen, so the placeholder shows. */
  isPlaceholder: boolean
}

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
  render?: RenderProp<ComponentPropsWithRef<'span'>, ListboxValueState> | undefined
}

/**
 * The chosen option's text, or the placeholder, inside `Listbox.Trigger`. It is part of the
 * trigger's accessible name and carries `data-placeholder` while nothing is chosen.
 */
export function ListboxValue<TItem = unknown>({
  placeholder,
  children,
  render,
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
    content = children ?? trigger?.selectedLabels.join(', ')
  }
  return renderPart({
    render,
    defaultElement: 'span',
    partProps: {
      ...mergeProps(otherProps, trigger?.valueProps ?? { className: 'kv-listbox-value' }),
      ref: mergedRef,
      children: content,
    },
    state: { isPlaceholder },
  })
}
ListboxValue.displayName = 'Listbox.Value'

export interface ListboxPopupProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'id' | 'role' | 'aria-label' | 'aria-labelledby'
> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxPartState> | undefined
}

/**
 * The popup: a role-less `<div popover="manual">` in the top layer, so no z-index and no clipping
 * by an ancestor. It is the shell: the edge, the shadow and the position. It is always rendered
 * and hidden by the browser while closed. It is placed under the trigger, as wide as it, flips
 * when there is no room and is never taller than the room that is left
 * (`--kv-popup-max-height`): the `Listbox.List` inside scrolls. **Focus never enters it**: a press
 * in it keeps focus on the trigger. Escape and a press outside close it. Put `Listbox.List` and
 * `Listbox.Empty` inside. Listbox, Combobox and Autocomplete share this part.
 */
export function ListboxPopup({ render, ref, ...otherProps }: ListboxPopupProps): ReactElement {
  const list = useContext(ListboxListContext)
  const mergedRef = useMergedRef(ref, list?.popupProps.ref ?? null)
  useEffect(() => {
    if (list === null) {
      warnOutsideRoot('Popup')
    }
  }, [list])
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, list?.popupProps ?? {}),
      ref: mergedRef,
    },
    state: { isOpen: list?.isOpen ?? false },
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
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxPartState> | undefined
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
  render,
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

  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, list?.listProps ?? { className: 'kv-listbox-list' }),
      ...ownNameProps(otherProps),
      ref: mergedRef,
      children: content,
    },
    state: { isOpen: list?.isOpen ?? false },
  })
}
ListboxList.displayName = 'Listbox.List'

/** What `render` receives as its second argument, for `Listbox.Option`. */
export interface ListboxOptionState<TItem = unknown> {
  isActive: boolean
  isSelected: boolean
  isDisabled: boolean
  item: TItem
  /** The option's text (`itemToString`). */
  label: string
}

export interface ListboxOptionProps<TItem = unknown> extends Omit<
  ComponentPropsWithRef<'div'>,
  'id' | 'role'
> {
  /** One of the Root's items, as `Listbox.List` hands it to you. */
  item: TItem
  /** Default: the item's text. Put your own content here for a rich option. */
  children?: ReactNode
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxOptionState<TItem>> | undefined
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
  render,
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
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, optionProps, virtualProps ?? noVirtualProps),
      ref: mergedRef,
      children: children ?? entry.label,
    },
    state: {
      isActive,
      isSelected,
      isDisabled: entry.disabled,
      item,
      label: entry.label,
    },
  })
}
ListboxOption.displayName = 'Listbox.Option'

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
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxPartState> | undefined
}

/**
 * A group of options: a `<div role="group">` named by its `Listbox.GroupLabel`. `Listbox.List`
 * renders one per group when the Root has `groups`.
 */
export function ListboxGroup<TItem = unknown>({
  section,
  children,
  render,
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

  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(
        otherProps,
        list?.getGroupProps(section) ?? { className: 'kv-listbox-group' as const },
      ),
      ...ownNameProps(otherProps),
      ref: mergedRef,
      children: (
        // The group's label finds its group here.
        <ListboxGroupContext.Provider value={{ section }}>{content}</ListboxGroupContext.Provider>
      ),
    },
    state: { isOpen: list?.isOpen ?? false },
  })
}
ListboxGroup.displayName = 'Listbox.Group'

export interface ListboxGroupLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'id'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxPartState> | undefined
}

/**
 * The visible name of a group. It is the group's `aria-labelledby` target, so a screen reader
 * reads it on entering the group. Default text: the group's label.
 */
export function ListboxGroupLabel({
  children,
  render,
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
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, labelProps),
      ref: mergedRef,
      children: children ?? group?.section.label,
    },
    state: { isOpen: list?.isOpen ?? false },
  })
}
ListboxGroupLabel.displayName = 'Listbox.GroupLabel'

export interface ListboxEmptyProps extends ComponentPropsWithRef<'div'> {
  render?: RenderProp<ComponentPropsWithRef<'div'>, ListboxPartState> | undefined
}

/**
 * What the open popup shows when there are no options. It renders nothing otherwise. Default
 * text: the locale's "No results" (`combobox.noResults`, or "Loading results" while a Combobox
 * or Autocomplete loads); put your own children in it to say more. It is plain text inside the
 * popup, beside the (then hidden) `Listbox.List`: not an option and not in the listbox. It isn't
 * announced by itself: Combobox and Autocomplete announce it through the Announcer.
 */
export function ListboxEmpty({
  children,
  render,
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
  return renderPart({
    render,
    defaultElement: 'div',
    partProps: {
      ...mergeProps(otherProps, list.emptyProps),
      ref: mergedRef,
      children: children ?? list.emptyText,
    },
    state: { isOpen: true },
  })
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
  Group: ListboxGroup,
  GroupLabel: ListboxGroupLabel,
  Empty: ListboxEmpty,
} as const
