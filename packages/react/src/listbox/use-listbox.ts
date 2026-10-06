import { createCombobox } from '@kvirn-ui/core'
import type { Combobox, Env, ListboxEntry, ListboxGroup, ListboxSection } from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, RefObject } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'
import { FieldContext } from '../field/field-context.ts'
import { joinIds } from '../field/field-state.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import { isInsideElement, useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { usePopup } from '../popup/use-popup.ts'
import type { Placement, PopupPartProps } from '../popup/use-popup.ts'
import { useEnv } from '../provider/use-env.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'
import {
  getFirstSelectedIndex,
  getRequiredIndexes,
  useListVirtualization,
} from './use-list-virtualization.ts'
import type { ListboxVirtualization, ListboxVirtualizeOption } from './use-list-virtualization.ts'

export type { ListboxVirtualization, ListboxVirtualizeOption } from './use-list-virtualization.ts'
export type {
  ListboxVirtualOptionPartProps,
  ListboxVirtualSizerPartProps,
} from './use-list-virtualization.ts'

/**
 * When the native `<select>` renders instead of the stylable popup:
 * `'auto'` on devices whose primary pointer is coarse (touch), `'always'`, or `'never'`.
 * Single choice only: `multiple` is always the popup.
 */
export type ListboxNativeMode = 'auto' | 'always' | 'never'

/** Why the popup opened or closed, in the second argument of `onOpenChange`. */
export type ListboxOpenChangeReason =
  | 'trigger-press'
  | 'option-press'
  | 'key'
  | 'escape'
  | 'outside-press'
  | 'blur'
  | 'light-dismiss'

/** Why the value changed, in the second argument of `onValueChange`. */
export type ListboxValueChangeReason = 'option-press' | 'key' | 'native'

export interface ListboxOpenChangeDetails {
  reason: ListboxOpenChangeReason
}

export interface ListboxValueChangeDetails {
  reason: ListboxValueChangeReason
}

/** The part of an entry that option props depend on. A `ListboxEntry` of any item type fits. */
export interface ListboxOptionEntry {
  key: string
  index: number
  label: string
  disabled: boolean
}

interface UseListboxBaseOptions<TItem> {
  /** A flat list. A new array of the same items changes nothing, but items you build in render must be stable objects (memoize them), and a change in what `isItemDisabled`, `itemToString` or `itemToKey` say needs a new array. Ignored when `groups` is given. */
  items?: readonly TItem[] | undefined
  /** Items in named groups (`{ key, label, items }`). Groups aren't nested. */
  groups?: readonly ListboxGroup<TItem>[] | undefined
  /** The text of an item: shown in the trigger, read by typeahead, and the native option's label. Default `String(item)`. */
  itemToString?: ((item: TItem) => string) | undefined
  /**
   * The language of an item's text, a BCP 47 code such as `fi`, or `undefined` for the page's
   * language. It puts `lang` on the native `<option>`, the popup option and the trigger's value, so
   * a screen reader reads "Suomi" in Finnish (WCAG 3.1.2). Not a place for the text's translation.
   */
  itemToLang?: ((item: TItem) => string | undefined) | undefined
  /** A stable, unique key of an item: what the value holds. Default: the text. */
  itemToKey?: ((item: TItem) => string) | undefined
  /** Disabled options stay reachable with the arrow keys and can't be chosen. */
  isItemDisabled?: ((item: TItem) => boolean) | undefined
  /** `'auto'` (default) renders a native `<select>` on touch devices, for single choice. See {@link ListboxNativeMode}. */
  native?: ListboxNativeMode | undefined
  /** With `name`, a hidden `<input>` per chosen key goes in a plain `<form>`. The native `<select>` carries the name itself. */
  name?: string | undefined
  /** Shown while nothing is chosen, and as the label of the native select's empty option. Never the only label. */
  placeholder?: string | undefined
  /** `autocomplete` of the native select (1.3.5), such as `address-level2`. */
  autoComplete?: string | undefined
  /** Disables it. A disabled Field disables it too. */
  disabled?: boolean | undefined
  /** The trigger's id, outside a Field. Inside one, the Field's control id is used. */
  id?: string | undefined
  /** Controlled: whether the popup is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the popup starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /** Called when the user opens or closes the popup. It only reports: with `open` set, you change `open`. */
  onOpenChange?: ((open: boolean, details: ListboxOpenChangeDetails) => void) | undefined
  /** Where the popup goes when there is room. Default `'bottom-start'`. It flips when it doesn't fit. */
  placement?: Placement | undefined
  /** The gap between the trigger and the popup, in pixels. Default 4. */
  offset?: number | undefined
  /** The space kept to the edge of the viewport, in pixels. Default 8. */
  padding?: number | undefined
  /** Per-instance message overrides: `noResults` is the default text of `Listbox.Empty`. */
  messages?: Partial<KvirnMessages['combobox']> | undefined
  /**
   * Renders only the options that are scrolled into view, plus the active and the chosen one, for
   * a flat list of thousands. `true` uses the defaults. The `Listbox.List` must be a
   * scroll container with a height limit (the default theme makes it one). Not with `groups`
   * (they render in full, with a development warning), and the native `<select>` ignores it.
   * Filter or paginate first: unrendered options can't be found with find in page or printed.
   */
  virtualize?: ListboxVirtualizeOption | undefined
}

/** One choice. `value` is the chosen key, or `null`. */
export interface UseListboxSingleOptions<TItem> extends UseListboxBaseOptions<TItem> {
  multiple?: false | undefined
  /** Controlled: the chosen item's key, or `null` for none. */
  value?: string | null | undefined
  /** Uncontrolled: the key chosen to begin with. */
  defaultValue?: string | null | undefined
  /** Called with the chosen key when the user chooses. It only reports. */
  onValueChange?: ((value: string | null, details: ListboxValueChangeDetails) => void) | undefined
}

/** Several choices. `value` holds the chosen keys, in the order they were chosen. */
export interface UseListboxMultipleOptions<TItem> extends UseListboxBaseOptions<TItem> {
  multiple: true
  /** Controlled: the chosen keys. */
  value?: readonly string[] | undefined
  /** Uncontrolled: the keys chosen to begin with. */
  defaultValue?: readonly string[] | undefined
  /** Called with all chosen keys when the user chooses or un-chooses one. */
  onValueChange?: ((value: string[], details: ListboxValueChangeDetails) => void) | undefined
}

export type UseListboxOptions<TItem> =
  | UseListboxSingleOptions<TItem>
  | UseListboxMultipleOptions<TItem>

/** Spread on the trigger: a `<div role="combobox" tabindex="0">`, as in the APG select-only example. */
export interface ListboxTriggerPartProps extends FieldStateAttributes {
  /** The part's class, for `@kvirn-ui/theme` and your own CSS: `.kv-listbox-trigger`. */
  className: 'kv-listbox-trigger'
  id: string
  role: 'combobox'
  /** One Tab stop. Absent while disabled. */
  tabIndex?: 0
  'aria-expanded': boolean
  'aria-controls': string
  'aria-haspopup': 'listbox'
  /** The active option, only while open and only when it is rendered. */
  'aria-activedescendant'?: string | undefined
  /** The Field's label, then the value. */
  'aria-labelledby'?: string | undefined
  'aria-describedby'?: string | undefined
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  'aria-disabled'?: 'true'
  'data-open'?: ''
  'data-focus-visible'?: ''
  ref: RefObject<HTMLDivElement | null>
  onClick: (event: MouseEvent<HTMLDivElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onFocus: (event: FocusEvent<HTMLDivElement>) => void
  onBlur: (event: FocusEvent<HTMLDivElement>) => void
}

/** Spread on the element that shows the chosen option's text. */
export interface ListboxValuePartProps {
  className: 'kv-listbox-value'
  /** For the trigger's `aria-labelledby`. */
  id: string
  /** Present while nothing is chosen and the placeholder shows. */
  'data-placeholder'?: ''
}

/**
 * Spread on the popup: the shell in the top layer, with its edge, shadow and position. It has no
 * role (the `listbox` is the List inside it), so the empty-state text can sit beside the
 * options instead of in the listbox. Focus never enters it.
 */
export interface ListboxPopupPartProps extends PopupPartProps {
  className: 'kv-listbox-popup'
  id: string
  ref: RefObject<HTMLDivElement | null>
  /** Keeps DOM focus on the trigger when the pointer presses in the popup. */
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void
}

/**
 * Spread on the list: the `role="listbox"` element, the target of `aria-controls`, and the part
 * that scrolls. It is always in the DOM. While the popup is open with no option to show, it is
 * `hidden` (so the empty-state text stands alone) and has `data-empty`.
 */
export interface ListboxListPartProps {
  className: 'kv-listbox-list'
  id: string
  role: 'listbox'
  /** The scroll element of a virtualized list. */
  ref: RefObject<HTMLDivElement | null>
  /** Present while the options are virtualized: only some are rendered. */
  'data-virtualized'?: ''
  'aria-multiselectable'?: true
  /** The Field's label. */
  'aria-labelledby'?: string | undefined
  hidden?: true
  'data-empty'?: ''
}

export interface ListboxOptionPartProps {
  className: 'kv-listbox-option'
  /** The id `aria-activedescendant` points at. */
  id: string
  role: 'option'
  'aria-selected': boolean
  'aria-disabled'?: true
  'data-active'?: ''
  'data-selected'?: ''
  'data-disabled'?: ''
  onClick: (event: MouseEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
}

export interface ListboxGroupPartProps {
  className: 'kv-listbox-group'
  role: 'group'
  'aria-labelledby': string
}

export interface ListboxGroupLabelPartProps {
  className: 'kv-listbox-group-label'
  id: string
}

/**
 * Spread on the empty-state text: plain text beside the (hidden) list, inside the popup. It is not
 * an option and not in the listbox, so no screen reader counts it as "option 1 of 1".
 */
export interface ListboxEmptyPartProps {
  className: 'kv-listbox-empty'
}

/** One `<input type="hidden">` for a plain `<form>`. */
export interface ListboxHiddenInput {
  name: string
  value: string
}

export interface UseListboxResult<TItem> {
  /** The native `<select>` renders instead of the popup. `Listbox.Root` checks this. */
  isNative: boolean
  isOpen: boolean
  isMultiple: boolean
  isDisabled: boolean
  isInvalid: boolean
  isRequired: boolean
  isFocusVisible: boolean
  /** Every option, in order. `index` counts across groups. */
  entries: readonly ListboxEntry<TItem>[]
  /** The groups with their entries, or `undefined` for a flat list. */
  sections: readonly ListboxSection<TItem>[] | undefined
  /** The number of options. */
  size: number
  /** The active option's key. Always `undefined` while closed and until the user moves. */
  activeKey: string | undefined
  selectedKeys: readonly string[]
  /** The chosen items, in the order chosen. */
  selectedItems: readonly TItem[]
  /** The chosen items' texts (`itemToString`), in the same order. */
  selectedLabels: readonly string[]
  placeholder: string | undefined
  /** The text of `Listbox.Empty` unless you give it children: `combobox.noResults`. */
  emptyText: string
  triggerProps: ListboxTriggerPartProps
  valueProps: ListboxValuePartProps
  popupProps: ListboxPopupPartProps
  listProps: ListboxListPartProps
  emptyProps: ListboxEmptyPartProps
  getOptionProps: (entry: ListboxOptionEntry) => ListboxOptionPartProps
  getGroupProps: (section: { key: string }) => ListboxGroupPartProps
  getGroupLabelProps: (section: { key: string }) => ListboxGroupLabelPartProps
  /** The entry of an item that the list rendered, found by identity. */
  getEntry: (item: unknown) => ListboxEntry<unknown> | undefined
  /** `false` while the pointer moved the active option: it is already under the pointer. */
  shouldScrollToActive: () => boolean
  /** Set while `virtualize` is on, the popup is open and the list is flat. `Listbox.List` renders it. */
  virtualization: ListboxVirtualization | undefined
  /** For `Listbox.Root`: the hidden inputs of a plain form. Empty with the native rendering. */
  hiddenInputs: readonly ListboxHiddenInput[]
  /** For the native rendering: the chosen key, or `''`. */
  nativeValue: string
  /** For the native rendering: the user chose `value` (`''` is the empty option). */
  selectFromNative: (value: string) => void
}

type Cause = ListboxOpenChangeReason | 'native'

const coarsePointerQuery = '(pointer: coarse)'

/**
 * Internal. Whether the primary pointer is coarse. `false` while rendering on the server and
 * during hydration, then it is read **once**, right after mount (and again only if the wish
 * for it changes). It never listens for `change`: a rendering that swapped under the user would
 * drop their focus to the page, so the switch only happens before they interact.
 */
function useCoarsePointer(isWanted: boolean): boolean {
  const env = useEnv()
  // The one reading, kept for the life of the component, so a later change never swaps anything.
  const [reading] = useState<{ value?: boolean }>(() => ({}))
  const isCoarse = useSyncExternalStore(
    subscribeNever,
    () => {
      reading.value ??=
        env !== undefined && typeof env.window.matchMedia === 'function'
          ? env.window.matchMedia(coarsePointerQuery).matches
          : false
      return reading.value
    },
    () => false,
  )
  return isWanted && isCoarse
}

/** There is nothing to listen to: the pointer is read once. */
function subscribeNever(): () => void {
  return () => {}
}

/** Whether two lists hold the same items (by identity), so a new array of the same items changes nothing. */
function hasSameItems<TItem>(
  first: readonly TItem[] | undefined,
  second: readonly TItem[] | undefined,
): boolean {
  const left = first ?? []
  const right = second ?? []
  return left.length === right.length && left.every((item, index) => Object.is(item, right[index]))
}

function hasSameGroups<TItem>(
  first: readonly ListboxGroup<TItem>[],
  second: readonly ListboxGroup<TItem>[] | undefined,
): boolean {
  return (
    second !== undefined &&
    first.length === second.length &&
    first.every((group, index) => {
      const other = second[index]
      return (
        other !== undefined &&
        group.key === other.key &&
        group.label === other.label &&
        hasSameItems(group.items, other.items)
      )
    })
  )
}

function toKeys(
  value: string | null | readonly string[] | undefined,
): readonly string[] | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return []
  }
  return typeof value === 'string' ? [value] : value
}

/**
 * What the machine's callbacks reach into the hook through: the newest options and env, what the
 * user just did (for the `reason` of `onOpenChange` and `onValueChange`), and whether the open
 * state is being pushed into the machine (so it doesn't report it back). Its state lives in
 * closures, so nothing is read or written while rendering: the hook updates it in effects and
 * handlers, and the machine reads it in its callbacks.
 */
interface MachineBridge<TItem> {
  getOptions: () => UseListboxOptions<TItem>
  getEnv: () => Env | undefined
  update: (options: UseListboxOptions<TItem>, env: Env | undefined) => void
  getCause: () => Cause
  setCause: (cause: Cause) => void
  isSyncing: () => boolean
  setSyncing: (isSyncing: boolean) => void
  requestSync: () => void
}

function createMachineBridge<TItem>(
  initialOptions: UseListboxOptions<TItem>,
  requestSync: () => void,
): MachineBridge<TItem> {
  let options = initialOptions
  let env: Env | undefined
  let cause: Cause = 'key'
  let isSyncing = false
  return {
    getOptions: () => options,
    getEnv: () => env,
    update: (nextOptions, nextEnv) => {
      options = nextOptions
      env = nextEnv
    },
    getCause: () => cause,
    setCause: (nextCause) => {
      cause = nextCause
    },
    isSyncing: () => isSyncing,
    setSyncing: (nextIsSyncing) => {
      isSyncing = nextIsSyncing
    },
    requestSync,
  }
}

/** Internal. Builds the `createCombobox` machine of a Listbox, reading what changes through `bridge`. */
function createListboxMachine<TItem>(
  bridge: MachineBridge<TItem>,
  list: Pick<UseListboxOptions<TItem>, 'items' | 'groups'>,
  locale: string,
  multiple: boolean,
  selectedKeys: readonly string[],
  startOpen: boolean,
): Combobox<TItem> {
  const { requestSync } = bridge
  return createCombobox<TItem>(
    {
      mode: 'listbox',
      multiple,
      items: list.items,
      groups: list.groups,
      itemToString: (item) => (bridge.getOptions().itemToString ?? String)(item),
      itemToKey: (item) =>
        (bridge.getOptions().itemToKey ?? bridge.getOptions().itemToString ?? String)(item),
      isItemDisabled: (item) => bridge.getOptions().isItemDisabled?.(item) ?? false,
      selectedKeys,
      defaultOpen: startOpen,
      locale,
      onOpenChange: (nextOpen) => {
        if (bridge.isSyncing()) {
          return
        }
        const cause = bridge.getCause()
        bridge.getOptions().onOpenChange?.(nextOpen, {
          reason: cause === 'native' ? 'key' : cause,
        })
        // A parent that ignores the change leaves the machine ahead of the page: pull it back.
        if (bridge.getOptions().open !== undefined) {
          requestSync()
        }
      },
      onSelectedKeysChange: (keys) => {
        const cause = bridge.getCause()
        const details: ListboxValueChangeDetails = {
          reason: cause === 'native' || cause === 'option-press' ? cause : 'key',
        }
        const current = bridge.getOptions()
        if (current.multiple === true) {
          current.onValueChange?.([...keys], details)
        } else {
          current.onValueChange?.(keys[0] ?? null, details)
        }
        if (current.value !== undefined) {
          requestSync()
        }
      },
    },
    {
      window: {
        setTimeout: (handler, milliseconds) =>
          bridge.getEnv()?.window.setTimeout(handler, milliseconds) ?? 0,
        clearTimeout: (handle) => bridge.getEnv()?.window.clearTimeout(handle),
      },
    },
  )
}

/**
 * The state and props of a Listbox (contract: listbox.a11y.md): a stylable popup
 * for choosing one option or several, built on `createCombobox` in `'listbox'` mode (the APG
 * select-only combobox). On touch devices a single choice renders the native `<select>`
 * instead (`isNative`, `native: 'auto'`).
 *
 * - **DOM focus stays on the trigger** (`aria-activedescendant`). Opening never moves it. No
 *   option is active until an arrow key or a typed letter, so Enter never picks something the
 *   user didn't choose.
 * - **Keys** are the core's `handleKeyDown`: arrows (no wrap), Home, End, Page Up and Down,
 *   Enter and Space, Escape, Tab (chooses the active option and moves on), Alt+ArrowDown and
 *   Alt+ArrowUp, and typeahead that matches the start of the text in the provider's locale.
 * - **The value is a key** (`itemToKey`): a string, or `null` for none, or with `multiple` an
 *   array. Controlled with `value`, uncontrolled with `defaultValue`. It is never copied into
 *   your form state: you get `onValueChange`.
 * - **Plain forms:** with `name`, `hiddenInputs` holds one entry per chosen key.
 * - Escape and a press outside close it (`useDismissableLayer`), and the popup is placed next to
 *   the trigger, as wide as it, in the top layer (`usePopup`, `popover="manual"`).
 *
 * @example
 * const countrySelect = useListbox({ items: countries, itemToString: (country) => country.name })
 * <div {...countrySelect.triggerProps}>…</div>
 * <div {...countrySelect.popupProps}><div {...countrySelect.listProps}>…</div></div>
 */
export function useListbox<TItem>(options: UseListboxOptions<TItem>): UseListboxResult<TItem> {
  const {
    items,
    groups,
    native = 'auto',
    name,
    placeholder,
    disabled = false,
    id,
    open: openProp,
    defaultOpen = false,
    placement,
    offset = 4,
    padding = 8,
    messages,
    virtualize,
  } = options
  const isMultiple = options.multiple === true
  const field = useContext(FieldContext)
  const env = useEnv()
  const { locale } = useLocale()
  const comboboxMessages = useMessages('combobox', messages)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const baseId = useId()
  const popupId = `${baseId}-popup`
  const listId = `${baseId}-list`
  const valueId = `${baseId}-value`
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const activationRef = useRef<'keyboard' | 'pointer'>('keyboard')
  const [syncCount, requestSync] = useReducer((count: number) => count + 1, 0)

  // The newest options and env, read by the machine's callbacks. Written before they can run.
  const [bridge] = useState(() => createMachineBridge(options, requestSync))
  useLayoutEffect(() => {
    bridge.update(options, env)
  })

  const controlledKeys = toKeys(options.value)

  const [holder, setHolder] = useState(() => ({
    multiple: isMultiple,
    machine: createListboxMachine(
      bridge,
      { items, groups },
      locale,
      isMultiple,
      controlledKeys ?? toKeys(options.defaultValue) ?? [],
      defaultOpen,
    ),
  }))
  let currentHolder = holder
  if (holder.multiple !== isMultiple) {
    // `multiple` decides the machine's selection rules, so a change builds a new one and keeps the choice.
    currentHolder = {
      multiple: isMultiple,
      machine: createListboxMachine(
        bridge,
        { items, groups },
        locale,
        isMultiple,
        holder.machine.getSelectedKeys(),
        false,
      ),
    }
    setHolder(currentHolder)
  }
  const { machine } = currentHolder
  const state = useSyncExternalStore(machine.subscribe, machine.getState, machine.getState)

  // A new list of items, from outside.
  const syncedList = useRef({ items, groups })
  useLayoutEffect(() => {
    const last = syncedList.current
    if (groups !== undefined) {
      if (!hasSameGroups(groups, last.groups)) {
        machine.actions.setGroups(groups)
      }
    } else if (!hasSameItems(items, last.items) || last.groups !== undefined) {
      machine.actions.setItems(items ?? [])
    }
    syncedList.current = { items, groups }
  }, [machine, items, groups])

  // A controlled value: the machine follows it, and `syncCount` pulls it back when a parent refuses a change.
  const controlledSignature = JSON.stringify(controlledKeys)
  useLayoutEffect(() => {
    const keys = toKeys(bridge.getOptions().value)
    if (keys !== undefined) {
      machine.actions.setSelectedKeys(keys)
    }
  }, [bridge, machine, controlledSignature, syncCount])

  const isCoarse = useCoarsePointer(native === 'auto' && !isMultiple)
  const isNative = !isMultiple && (native === 'always' || (native === 'auto' && isCoarse))
  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isOpen = (openProp ?? state.open) && !isNative && !isDisabled

  // The machine's open state follows the page: a controlled `open`, a switch to the native
  // rendering, and a disabled control all close it without reporting.
  useLayoutEffect(() => {
    bridge.setSyncing(true)
    machine.actions.setOpen(isOpen)
    bridge.setSyncing(false)
  }, [bridge, machine, isOpen, syncCount])

  useEffect(() => {
    if (native === 'always' && isMultiple) {
      warnOnce(
        'listbox-native-always-multiple',
        'A Listbox got native="always" and multiple. A native <select multiple> is hard to use with a keyboard and a screen reader, so the popup is rendered. For a short list of choices use a CheckboxGroup.',
      )
    }
  }, [native, isMultiple])

  const close = (reason: ListboxOpenChangeReason) => {
    bridge.setCause(reason)
    machine.actions.setOpen(false)
  }

  const popup = usePopup({
    open: isOpen,
    anchorRef: triggerRef,
    popupRef,
    placement,
    offset,
    padding,
    matchAnchorWidth: true,
    popover: 'manual',
    onNativeDismiss: () => close('light-dismiss'),
  })

  // The trigger is the anchor, not outside: its own press toggles the popup.
  const ignore = useMemo(
    () => [(target: unknown) => isInsideElement(triggerRef.current, target)],
    [],
  )
  useDismissableLayer({
    open: isOpen,
    ref: popupRef,
    ignore,
    onDismiss: (reason) => close(reason === 'escape' ? 'escape' : 'outside-press'),
  })

  // Clicking the Field's label focuses the trigger: `<label for>` doesn't name a `<div>`.
  const labelId = field?.labelId
  useEffect(() => {
    if (labelId === undefined || env === undefined || isNative || isDisabled) {
      return
    }
    const label = env.document.getElementById(labelId)
    if (label === null) {
      return
    }
    const focusTrigger = (event: Event) => {
      if (!event.defaultPrevented) {
        triggerRef.current?.focus()
      }
    }
    label.addEventListener('click', focusTrigger)
    return () => label.removeEventListener('click', focusTrigger)
  }, [labelId, env, isNative, isDisabled])

  const selectedKeys = state.selectedKeys
  const selectedItems = machine.getSelectedItems()
  const selectedLabels = selectedItems.map((item) => (options.itemToString ?? String)(item))
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])
  const entryByItem = useMemo(
    () =>
      new Map<unknown, ListboxEntry<unknown>>(state.entries.map((entry) => [entry.item, entry])),
    [state.entries],
  )

  const getOptionId = (entry: { index: number }) => `${baseId}-option-${entry.index}`
  const getGroupLabelId = (section: { key: string }) => {
    const index = state.sections?.findIndex((candidate) => candidate.key === section.key) ?? 0
    return `${baseId}-group-${index}`
  }

  const activeEntry =
    isOpen && state.activeKey !== undefined ? machine.getEntry(state.activeKey) : undefined

  // After `usePopup`, so the popup is shown and placed when the scroll element is measured.
  const virtualization = useListVirtualization({
    virtualize,
    hasGroups: groups !== undefined,
    isOpen: isOpen && !isNative,
    entries: state.entries,
    getRequiredIndexes: () => getRequiredIndexes(machine),
    activeIndex: activeEntry?.index,
    initialScrollIndex: getFirstSelectedIndex(machine, selectedKeys),
    shouldScrollToActive: () => activationRef.current !== 'pointer',
    listRef,
  })

  const triggerProps: ListboxTriggerPartProps = {
    className: 'kv-listbox-trigger',
    id: field?.controlProps.id ?? id ?? `${baseId}-trigger`,
    role: 'combobox',
    ...(isDisabled ? {} : { tabIndex: 0 as const }),
    'aria-expanded': isOpen,
    'aria-controls': listId,
    'aria-haspopup': 'listbox',
    'aria-activedescendant': activeEntry === undefined ? undefined : getOptionId(activeEntry),
    'aria-labelledby': field === null ? undefined : joinIds(field.labelId, valueId),
    'aria-describedby': field?.controlProps['aria-describedby'],
    ...(isInvalid ? { 'aria-invalid': 'true' as const, 'data-invalid': '' as const } : {}),
    ...(isRequired ? { 'aria-required': 'true' as const, 'data-required': '' as const } : {}),
    ...(isDisabled ? { 'aria-disabled': 'true' as const, 'data-disabled': '' as const } : {}),
    ...(isOpen ? { 'data-open': '' as const } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' as const } : {}),
    ref: triggerRef,
    onClick: () => {
      if (isDisabled) {
        return
      }
      bridge.setCause('trigger-press')
      activationRef.current = 'keyboard'
      machine.actions.setOpen(!isOpen)
    },
    onKeyDown: (event) => {
      if (isDisabled || event.defaultPrevented) {
        return
      }
      bridge.setCause(event.key === 'Escape' ? 'escape' : 'key')
      activationRef.current = 'keyboard'
      const { handled } = machine.actions.handleKeyDown(event)
      if (handled) {
        event.preventDefault()
      }
    },
    onFocus: focusVisibleProps.onFocus,
    onBlur: (event) => {
      focusVisibleProps.onBlur(event)
      const next = event.relatedTarget
      if (machine.getState().open && !isInsideElement(popupRef.current, next)) {
        close('blur')
      }
    },
  }

  const popupProps: ListboxPopupPartProps = {
    ...popup.popupProps,
    className: 'kv-listbox-popup',
    id: popupId,
    ref: popupRef,
    onMouseDown: (event) => {
      // A press in the popup (an option, the padding, its scrollbar) must not take focus from the trigger.
      event.preventDefault()
    },
  }

  const getOptionProps = (entry: ListboxOptionEntry): ListboxOptionPartProps => {
    const isSelected = selectedSet.has(entry.key)
    return {
      className: 'kv-listbox-option',
      id: getOptionId(entry),
      role: 'option',
      'aria-selected': isSelected,
      ...(entry.disabled ? { 'aria-disabled': true as const, 'data-disabled': '' as const } : {}),
      ...(state.activeKey === entry.key ? { 'data-active': '' as const } : {}),
      ...(isSelected ? { 'data-selected': '' as const } : {}),
      onClick: () => {
        if (entry.disabled) {
          return
        }
        bridge.setCause('option-press')
        machine.actions.selectOption(entry.key)
      },
      onPointerMove: (event) => {
        if (event.pointerType === 'touch' || machine.getState().activeKey === entry.key) {
          return
        }
        activationRef.current = 'pointer'
        machine.actions.setActiveKey(entry.key)
      },
    }
  }

  const hiddenInputs: readonly ListboxHiddenInput[] =
    name === undefined || isNative || isDisabled
      ? []
      : isMultiple
        ? selectedKeys.map((key) => ({ name, value: key }))
        : [{ name, value: selectedKeys[0] ?? '' }]

  const isPlaceholderShown = selectedItems.length === 0

  return {
    isNative,
    isOpen,
    isMultiple,
    isDisabled,
    isInvalid,
    isRequired,
    isFocusVisible,
    entries: state.entries,
    sections: state.sections,
    size: state.size,
    activeKey: isOpen ? state.activeKey : undefined,
    selectedKeys,
    selectedItems,
    selectedLabels,
    placeholder,
    emptyText: comboboxMessages.noResults,
    triggerProps,
    valueProps: {
      className: 'kv-listbox-value',
      id: valueId,
      ...(isPlaceholderShown ? { 'data-placeholder': '' as const } : {}),
    },
    popupProps,
    listProps: {
      className: 'kv-listbox-list',
      id: listId,
      role: 'listbox',
      ref: listRef,
      ...(virtualization === undefined ? {} : { 'data-virtualized': '' as const }),
      ...(isMultiple ? { 'aria-multiselectable': true as const } : {}),
      'aria-labelledby': field?.labelId,
      ...(isOpen && state.size === 0 ? { hidden: true as const, 'data-empty': '' as const } : {}),
    },
    emptyProps: { className: 'kv-listbox-empty' },
    getOptionProps,
    getGroupProps: (section) => ({
      className: 'kv-listbox-group',
      role: 'group',
      'aria-labelledby': getGroupLabelId(section),
    }),
    getGroupLabelProps: (section) => ({
      className: 'kv-listbox-group-label',
      id: getGroupLabelId(section),
    }),
    getEntry: (item) => entryByItem.get(item),
    shouldScrollToActive: () => activationRef.current !== 'pointer',
    virtualization,
    hiddenInputs,
    nativeValue: selectedKeys[0] ?? '',
    selectFromNative: (value) => {
      bridge.setCause('native')
      if (value === '') {
        machine.actions.clear()
        return
      }
      machine.actions.selectOption(value)
    },
  }
}
