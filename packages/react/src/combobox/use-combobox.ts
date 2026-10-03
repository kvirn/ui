import { announcementDebounceMilliseconds, createCombobox } from '@kvirn-ui/core'
import type {
  Combobox as ComboboxMachine,
  ComboboxAnnouncement,
  ComboboxFocusTarget,
  ComboboxInputReason,
  Env,
  ListboxEntry,
  ListboxGroup,
  ListboxSection,
} from '@kvirn-ui/core'
import type { KvirnMessages } from '@kvirn-ui/i18n'
import {
  useCallback,
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
import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent, RefObject } from 'react'
import { useQuietAnnouncer, warnAnnouncerMissing } from '../announcer/use-announcer.ts'
import { FieldContext } from '../field/field-context.ts'
import type { FieldStateAttributes } from '../field/field-state.ts'
import { useFocusVisible } from '../focus-visible/use-focus-visible.ts'
import type {
  ListboxEmptyPartProps,
  ListboxGroupLabelPartProps,
  ListboxGroupPartProps,
  ListboxHiddenInput,
  ListboxListPartProps,
  ListboxOptionEntry,
  ListboxOptionPartProps,
  ListboxPopupPartProps,
} from '../listbox/use-listbox.ts'
import {
  getFirstSelectedIndex,
  getRequiredIndexes,
  useListVirtualization,
} from '../listbox/use-list-virtualization.ts'
import type {
  ListboxVirtualization,
  ListboxVirtualizeOption,
} from '../listbox/use-list-virtualization.ts'
import { isInsideElement, useDismissableLayer } from '../popup/use-dismissable-layer.ts'
import { usePopup } from '../popup/use-popup.ts'
import type { Placement } from '../popup/use-popup.ts'
import { useEnv } from '../provider/use-env.ts'
import { useLocale } from '../provider/use-locale.ts'
import { useMessages } from '../provider/use-messages.ts'

/** Why the popup opened or closed, in the second argument of `onOpenChange`. */
export type ComboboxOpenChangeReason =
  | 'input'
  | 'key'
  | 'escape'
  | 'toggle-press'
  | 'option-press'
  | 'outside-press'
  | 'blur'
  | 'light-dismiss'
  | 'clear'

export interface ComboboxOpenChangeDetails {
  reason: ComboboxOpenChangeReason
}

/**
 * Why the value changed, in the second argument of `onValueChange`: an option was pressed, a key
 * chose it (Enter, Alt+ArrowUp), the text no longer names the chosen option (`'input'`), a chosen
 * value was removed, or the Clear button was pressed.
 */
export type ComboboxValueChangeReason = 'option-press' | 'key' | 'input' | 'remove' | 'clear'

export interface ComboboxValueChangeDetails {
  reason: ComboboxValueChangeReason
}

/** Why the text changed: the user typed, an option was chosen (it fills or empties the text), or Clear was pressed. */
export interface ComboboxInputChangeDetails {
  reason: ComboboxInputReason
}

/** `'combobox'`: the value is one of the options (or several). `'autocomplete'`: the value is the text. */
export type ComboboxVariant = 'combobox' | 'autocomplete'

/** The options that Combobox and Autocomplete share. */
export interface UseComboboxCommonOptions<TItem> {
  /** A flat list. A new array of the same items changes nothing, but items you build in render must be stable objects (memoize them), and a change in what `isItemDisabled`, `itemToString` or `itemToKey` say needs a new array. Ignored when `groups` is given. */
  items?: readonly TItem[] | undefined
  /** Items in named groups (`{ key, label, items }`). Groups aren't nested. */
  groups?: readonly ListboxGroup<TItem>[] | undefined
  /** The text of an item: shown in the list, matched by the filter, and put in the input when chosen. Default `String(item)`. */
  itemToString?: ((item: TItem) => string) | undefined
  /** A stable, unique key of an item: what a Combobox's value holds. Default: the text. */
  itemToKey?: ((item: TItem) => string) | undefined
  /** Disabled options stay reachable with the arrow keys and can't be chosen. */
  isItemDisabled?: ((item: TItem) => boolean) | undefined
  /**
   * Replaces the default filter, which matches anywhere in the text, in the provider's locale (å,
   * ä and ö are not a and o in Swedish). Called with each item and what the user typed. Applied
   * on the next keystroke. `false` turns filtering off, for results that your server has
   * already filtered: pass `isLoading` while it works.
   */
  filter?: ((item: TItem, query: string) => boolean) | false | undefined
  /** The options are being fetched. The popup says so (and announces it), and `items` may still be the last result. */
  isLoading?: boolean | undefined
  /** Disables it. A disabled Field disables it too. */
  disabled?: boolean | undefined
  /** The input's id, outside a Field. Inside one, the Field's control id is used. */
  id?: string | undefined
  /** Controlled: whether the popup is open. Pair it with `onOpenChange`. */
  open?: boolean | undefined
  /** Uncontrolled: whether the popup starts open. Default `false`. */
  defaultOpen?: boolean | undefined
  /** Called when the user opens or closes the popup. It only reports: with `open` set, you change `open`. */
  onOpenChange?: ((open: boolean, details: ComboboxOpenChangeDetails) => void) | undefined
  /** Where the popup goes when there is room. Default `'bottom-start'`. It flips when it doesn't fit. */
  placement?: Placement | undefined
  /** The gap between the field and the popup, in pixels. Default 4. */
  offset?: number | undefined
  /** The space kept to the edge of the viewport, in pixels. Default 8. */
  padding?: number | undefined
  /**
   * How long to wait after the last change before the result count is announced, in
   * milliseconds. Default 500. Nothing is announced while the user is typing.
   */
  announcementDebounceMilliseconds?: number | undefined
  /** Per-instance message overrides (ADR-0007): the result count, "no results", "loading", and the names of the buttons. */
  messages?: Partial<KvirnMessages['combobox']> | undefined
  /**
   * Renders only the options that are scrolled into view, plus the active and the chosen one, for
   * a flat list of thousands (ADR-0059). `true` uses the defaults. The `Combobox.List` must be a
   * scroll container with a height limit (the default theme makes it one). Not with `groups`
   * (they render in full, with a development warning). Let the user filter first: unrendered
   * options can't be found with find in page or printed.
   */
  virtualize?: ListboxVirtualizeOption | undefined
}

interface UseComboboxBaseOptions<TItem> extends UseComboboxCommonOptions<TItem> {
  /** With `name`, a hidden `<input>` per chosen key goes in a plain `<form>`. The visible text is not sent. */
  name?: string | undefined
  /** Controlled: what the text field shows. Give the chosen option's text while a value is chosen. */
  inputValue?: string | undefined
  /** Uncontrolled: the text to begin with. Default: the chosen option's text. */
  defaultInputValue?: string | undefined
  /** Called with the text when the user types, chooses an option or clears. It only reports. */
  onInputValueChange?:
    | ((inputValue: string, details: ComboboxInputChangeDetails) => void)
    | undefined
}

/** One choice. `value` is the chosen option's key, or `null`. */
export interface UseComboboxSingleOptions<TItem> extends UseComboboxBaseOptions<TItem> {
  multiple?: false | undefined
  /** Controlled: the chosen item's key, or `null` for none. */
  value?: string | null | undefined
  /** Uncontrolled: the key chosen to begin with. */
  defaultValue?: string | null | undefined
  /**
   * Called with the chosen key when the user chooses, and with `null` when the text no longer
   * names the chosen option. It only reports (ADR-0029).
   */
  onValueChange?: ((value: string | null, details: ComboboxValueChangeDetails) => void) | undefined
}

/** Several choices. `value` holds the chosen keys, in the order they were chosen. */
export interface UseComboboxMultipleOptions<TItem> extends UseComboboxBaseOptions<TItem> {
  multiple: true
  /** Controlled: the chosen keys. */
  value?: readonly string[] | undefined
  /** Uncontrolled: the keys chosen to begin with. */
  defaultValue?: readonly string[] | undefined
  /** Called with all chosen keys when the user chooses, removes or clears. */
  onValueChange?: ((value: string[], details: ComboboxValueChangeDetails) => void) | undefined
}

export type UseComboboxOptions<TItem> =
  | UseComboboxSingleOptions<TItem>
  | UseComboboxMultipleOptions<TItem>

/** Spread on the optional box around the input and its buttons. It is the popup's anchor when present. */
export interface ComboboxControlPartProps extends FieldStateAttributes {
  className: 'kv-combobox-control' | 'kv-autocomplete-control'
  'data-open'?: ''
  'data-focus-visible'?: ''
  ref: RefObject<HTMLDivElement | null>
}

/** Spread on the `<input role="combobox">`. */
export interface ComboboxInputPartProps extends FieldStateAttributes {
  className: 'kv-combobox-input' | 'kv-autocomplete-input'
  id: string
  type: 'text'
  role: 'combobox'
  'aria-autocomplete': 'list'
  'aria-expanded': boolean
  'aria-controls': string
  /** The active option, only while open and only when it is rendered. */
  'aria-activedescendant'?: string | undefined
  'aria-describedby'?: string | undefined
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
  disabled?: true
  /** Autocomplete only: the text is the value, so the input carries the `name`. */
  name?: string | undefined
  value: string
  'data-open'?: ''
  'data-focus-visible'?: ''
  ref: RefObject<HTMLInputElement | null>
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onFocus: (event: FocusEvent<HTMLInputElement>) => void
  onBlur: (event: FocusEvent<HTMLInputElement>) => void
}

/** Spread on the optional button that opens and closes the popup. It is not a tab stop. */
export interface ComboboxTogglePartProps {
  className: 'kv-combobox-toggle' | 'kv-autocomplete-toggle'
  type: 'button'
  tabIndex: -1
  /** `combobox.showOptions`. */
  'aria-label': string
  'aria-expanded': boolean
  'aria-controls': string
  disabled?: true
  'data-open'?: ''
  'data-disabled'?: ''
  ref: RefObject<HTMLButtonElement | null>
  /** Keeps DOM focus on the input. */
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

/** Spread on the optional button that empties the text and the value. It is not a tab stop. */
export interface ComboboxClearPartProps {
  className: 'kv-combobox-clear' | 'kv-autocomplete-clear'
  type: 'button'
  tabIndex: -1
  /** `combobox.clear`. */
  'aria-label': string
  disabled?: true
  'data-disabled'?: ''
  ref: RefObject<HTMLButtonElement | null>
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

/** Spread on the `<ul>` of the chosen values (`multiple`). */
export interface ComboboxValueListPartProps {
  className: 'kv-combobox-value-list'
  /** Redundant on a `<ul>` on purpose: Safari drops the list semantics when the theme removes the markers. */
  role: 'list'
  /** The Field's label: "Kommuner, list, 2 items". */
  'aria-labelledby'?: string | undefined
}

/** Spread on one chosen value's `<li>`. */
export interface ComboboxValuePartProps {
  className: 'kv-combobox-value'
  'data-disabled'?: ''
}

/** Spread on a chosen value's remove button. */
export interface ComboboxRemoveButtonPartProps {
  className: 'kv-combobox-value-remove'
  type: 'button'
  /** `combobox.removeValue`, with the value's text. */
  'aria-label': string
  disabled?: true
  ref: (element: HTMLButtonElement | null) => void
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

/** A chosen value: its key, its item and its text. */
export interface ComboboxSelectedValue<TItem> {
  key: string
  item: TItem
  /** `itemToString(item)`. */
  label: string
}

export interface UseComboboxResult<TItem> {
  variant: ComboboxVariant
  isOpen: boolean
  isMultiple: boolean
  isDisabled: boolean
  isInvalid: boolean
  isRequired: boolean
  isFocusVisible: boolean
  isLoading: boolean
  /** What the text field shows. */
  inputValue: string
  /** There is text, or (one choice only) a chosen value, so a Clear button has something to clear. */
  hasClearableValue: boolean
  /** Every option that the filter lets through, in order. `index` counts across groups. */
  entries: readonly ListboxEntry<TItem>[]
  /** The groups with their entries, or `undefined` for a flat list. */
  sections: readonly ListboxSection<TItem>[] | undefined
  /** The number of options after filtering. */
  size: number
  /** The active option's key. Always `undefined` while closed and until the user moves. */
  activeKey: string | undefined
  selectedKeys: readonly string[]
  /** The chosen values, in the order chosen, including ones that the filter hides now. */
  selectedValues: readonly ComboboxSelectedValue<TItem>[]
  /** The text of `Combobox.Empty` unless you give it children: `combobox.noResults`. */
  emptyText: string
  /** The text of the loading state: `combobox.loading`. */
  loadingText: string
  controlProps: ComboboxControlPartProps
  inputProps: ComboboxInputPartProps
  toggleProps: ComboboxTogglePartProps
  clearProps: ComboboxClearPartProps
  valueListProps: ComboboxValueListPartProps
  getValueProps: (value: { key: string }) => ComboboxValuePartProps
  getRemoveButtonProps: (value: ComboboxSelectedValue<TItem>) => ComboboxRemoveButtonPartProps
  /** `data-loading` is present while `isLoading` is set and the popup is open. */
  popupProps: ListboxPopupPartProps & { 'data-loading'?: '' }
  listProps: ListboxListPartProps
  emptyProps: ListboxEmptyPartProps
  getOptionProps: (entry: ListboxOptionEntry) => ListboxOptionPartProps
  getGroupProps: (section: { key: string }) => ListboxGroupPartProps
  getGroupLabelProps: (section: { key: string }) => ListboxGroupLabelPartProps
  /** The entry of an item that the list rendered, found by identity. */
  getEntry: (item: unknown) => ListboxEntry<unknown> | undefined
  /** `false` while the pointer moved the active option: it is already under the pointer. */
  shouldScrollToActive: () => boolean
  /** Set while `virtualize` is on, the popup is open and the list is flat. `Combobox.List` renders it. */
  virtualization: ListboxVirtualization | undefined
  /** For `Combobox.Root`: the hidden inputs of a plain form (Combobox only). */
  hiddenInputs: readonly ListboxHiddenInput[]
}

type Cause =
  | 'input'
  | 'key'
  | 'escape'
  | 'toggle-press'
  | 'option-press'
  | 'outside-press'
  | 'blur'
  | 'light-dismiss'
  | 'remove'
  | 'clear'

type FilterKind = 'default' | 'custom' | 'off'

/** What the machine's hook reads: the public options of Combobox or Autocomplete, made uniform. */
export interface ComboboxMachineOptions<TItem> extends UseComboboxCommonOptions<TItem> {
  variant: ComboboxVariant
  multiple: boolean
  name?: string | undefined
  /** The chosen keys when controlled, else `undefined`. */
  selectedKeys?: readonly string[] | undefined
  defaultSelectedKeys?: readonly string[] | undefined
  /** Called when the user changes the choice. */
  onSelectedKeysChange?:
    | ((keys: readonly string[], details: ComboboxValueChangeDetails) => void)
    | undefined
  inputValue?: string | undefined
  defaultInputValue?: string | undefined
  onInputValueChange?:
    | ((inputValue: string, details: ComboboxInputChangeDetails) => void)
    | undefined
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

function openReason(cause: Cause): ComboboxOpenChangeReason {
  if (cause === 'remove') {
    return 'key'
  }
  return cause
}

function valueReason(cause: Cause): ComboboxValueChangeReason {
  return cause === 'option-press' || cause === 'remove' || cause === 'clear' || cause === 'input'
    ? cause
    : 'key'
}

function filterKindOf<TItem>(filter: UseComboboxCommonOptions<TItem>['filter']): FilterKind {
  if (filter === false) {
    return 'off'
  }
  return typeof filter === 'function' ? 'custom' : 'default'
}

/**
 * What the machine's callbacks reach into the hook through: the newest options and env, what the
 * user just did (for the `reason` of the callbacks), and whether the page is being pushed into
 * the machine (so it doesn't report it back). Its state lives in closures, so nothing is read or
 * written while rendering: the hook updates it in effects and handlers.
 */
interface MachineBridge<TItem> {
  getOptions: () => ComboboxMachineOptions<TItem>
  getEnv: () => Env | undefined
  update: (options: ComboboxMachineOptions<TItem>, env: Env | undefined) => void
  getCause: () => Cause
  setCause: (cause: Cause) => void
  isSyncing: () => boolean
  setSyncing: (isSyncing: boolean) => void
  requestSync: () => void
}

function createMachineBridge<TItem>(
  initialOptions: ComboboxMachineOptions<TItem>,
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

interface MachineConfig<TItem> {
  variant: ComboboxVariant
  multiple: boolean
  filterKind: FilterKind
  list: Pick<UseComboboxCommonOptions<TItem>, 'items' | 'groups'>
  locale: string
  selectedKeys: readonly string[]
  inputValue: string | undefined
  isLoading: boolean
  startOpen: boolean
}

/** Internal. Builds the `createCombobox` machine, reading what changes through `bridge`. */
function createComboboxMachine<TItem>(
  bridge: MachineBridge<TItem>,
  config: MachineConfig<TItem>,
): ComboboxMachine<TItem> {
  const { requestSync } = bridge
  return createCombobox<TItem>(
    {
      mode: config.variant,
      multiple: config.multiple,
      items: config.list.items,
      groups: config.list.groups,
      itemToString: (item) => (bridge.getOptions().itemToString ?? String)(item),
      itemToKey: (item) =>
        (bridge.getOptions().itemToKey ?? bridge.getOptions().itemToString ?? String)(item),
      isItemDisabled: (item) => bridge.getOptions().isItemDisabled?.(item) ?? false,
      filter:
        config.filterKind === 'off'
          ? false
          : config.filterKind === 'custom'
            ? (item, query) => {
                const { filter } = bridge.getOptions()
                return typeof filter === 'function' ? filter(item, query) : true
              }
            : undefined,
      isLoading: config.isLoading,
      selectedKeys: config.selectedKeys,
      defaultInputValue: config.inputValue,
      defaultOpen: config.startOpen,
      locale: config.locale,
      onOpenChange: (nextOpen) => {
        if (bridge.isSyncing()) {
          return
        }
        const current = bridge.getOptions()
        current.onOpenChange?.(nextOpen, { reason: openReason(bridge.getCause()) })
        // A parent that ignores the change leaves the machine ahead of the page: pull it back.
        if (current.open !== undefined) {
          requestSync()
        }
      },
      onInputValueChange: (inputValue, reason) => {
        if (bridge.isSyncing()) {
          return
        }
        const current = bridge.getOptions()
        current.onInputValueChange?.(inputValue, { reason })
        if (current.inputValue !== undefined) {
          requestSync()
        }
      },
      onSelectedKeysChange: (keys) => {
        const current = bridge.getOptions()
        current.onSelectedKeysChange?.(keys, { reason: valueReason(bridge.getCause()) })
        if (current.selectedKeys !== undefined) {
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

/** The message for what a live region should say about the list. */
function announcementText(
  announcement: ComboboxAnnouncement,
  messages: {
    resultCount: (values: { count: number }) => string
    noResults: string
    loading: string
  },
): string {
  switch (announcement.kind) {
    case 'resultCount':
      return messages.resultCount({ count: announcement.count })
    case 'noResults':
      return messages.noResults
    case 'loading':
      return messages.loading
  }
}

/**
 * Internal. The state and props behind Combobox and Autocomplete (ADR-0037; contracts:
 * combobox.a11y.md and autocomplete.a11y.md), built on `createCombobox`. `useCombobox` and
 * `useAutocomplete` map their public options onto it.
 */
export function useComboboxMachine<TItem>(
  options: ComboboxMachineOptions<TItem>,
): UseComboboxResult<TItem> {
  const {
    items,
    groups,
    variant,
    multiple: isMultiple,
    name,
    disabled = false,
    id,
    open: openProp,
    defaultOpen = false,
    placement,
    offset = 4,
    padding = 8,
    messages,
    isLoading = false,
    announcementDebounceMilliseconds: debounceOption,
    virtualize,
  } = options
  const field = useContext(FieldContext)
  const env = useEnv()
  const { locale } = useLocale()
  const comboboxMessages = useMessages('combobox', messages)
  const { isFocusVisible, focusVisibleProps } = useFocusVisible()
  const { announce, isAvailable } = useQuietAnnouncer()
  const baseId = useId()
  const popupId = `${baseId}-popup`
  const listId = `${baseId}-list`
  const controlRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const clearRef = useRef<HTMLButtonElement | null>(null)
  const anchorRef = useRef<Element | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const activationRef = useRef<'keyboard' | 'pointer'>('keyboard')
  const removeButtons = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<{ removedKey: string; target: ComboboxFocusTarget } | undefined>(
    undefined,
  )
  const [syncCount, requestSync] = useReducer((count: number) => count + 1, 0)
  const [focusCount, requestFocusCheck] = useReducer((count: number) => count + 1, 0)

  // The newest options and env, read by the machine's callbacks. Written before they can run.
  const [bridge] = useState(() => createMachineBridge(options, requestSync))
  useLayoutEffect(() => {
    bridge.update(options, env)
  })

  const filterKind = filterKindOf(options.filter)
  const controlledKeys = options.selectedKeys

  const [holder, setHolder] = useState(() => ({
    key: `${variant}:${isMultiple}:${filterKind}`,
    machine: createComboboxMachine(bridge, {
      variant,
      multiple: isMultiple,
      filterKind,
      list: { items, groups },
      locale,
      selectedKeys: controlledKeys ?? options.defaultSelectedKeys ?? [],
      inputValue: options.inputValue ?? options.defaultInputValue,
      isLoading,
      startOpen: defaultOpen,
    }),
  }))
  let currentHolder = holder
  const holderKey = `${variant}:${isMultiple}:${filterKind}`
  if (holder.key !== holderKey) {
    // These decide the machine's rules, so a change builds a new one and keeps the choice and the text.
    const previous = holder.machine
    currentHolder = {
      key: holderKey,
      machine: createComboboxMachine(bridge, {
        variant,
        multiple: isMultiple,
        filterKind,
        list: { items, groups },
        locale,
        selectedKeys: previous.getSelectedKeys(),
        inputValue: previous.getState().inputValue,
        isLoading,
        startOpen: false,
      }),
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

  useLayoutEffect(() => {
    machine.actions.setLoading(isLoading)
  }, [machine, isLoading])

  // A controlled value: the machine follows it, and `syncCount` pulls it back when a parent refuses a change.
  const controlledSignature = JSON.stringify(controlledKeys)
  useLayoutEffect(() => {
    const keys = bridge.getOptions().selectedKeys
    if (keys !== undefined) {
      // Showing a new value changes the text too: that is the page's doing, so it isn't reported.
      bridge.setSyncing(true)
      machine.actions.setSelectedKeys(keys)
      bridge.setSyncing(false)
    }
  }, [bridge, machine, controlledSignature, syncCount])

  // A controlled text: the machine follows it. A text that changes from outside never opens the popup.
  const controlledText = options.inputValue
  useLayoutEffect(() => {
    const text = bridge.getOptions().inputValue
    if (text === undefined || machine.getState().inputValue === text) {
      return
    }
    const wasOpen = machine.getState().open
    bridge.setSyncing(true)
    machine.actions.setInputValue(text)
    if (!wasOpen && machine.getState().open) {
      machine.actions.setOpen(false)
    }
    bridge.setSyncing(false)
  }, [bridge, machine, controlledText, syncCount])

  const isDisabled = (field?.state.isDisabled ?? false) || disabled
  const isInvalid = field?.state.isInvalid ?? false
  const isRequired = field?.state.isRequired ?? false
  const isOpen = (openProp ?? state.open) && !isDisabled

  // The machine's open state follows the page: a controlled `open` and a disabled control both
  // close it without reporting.
  useLayoutEffect(() => {
    bridge.setSyncing(true)
    machine.actions.setOpen(isOpen)
    bridge.setSyncing(false)
  }, [bridge, machine, isOpen, syncCount])

  const close = (cause: Cause) => {
    bridge.setCause(cause)
    machine.actions.setOpen(false)
  }

  // The input, its box and its buttons are the anchor, not outside: pressing them never dismisses.
  const isInsideField = useCallback(
    (target: unknown) =>
      isInsideElement(inputRef.current, target) ||
      isInsideElement(controlRef.current, target) ||
      isInsideElement(toggleRef.current, target) ||
      isInsideElement(clearRef.current, target),
    [],
  )

  // The popup sits against the box around the input and its buttons, or the input alone.
  useLayoutEffect(() => {
    anchorRef.current = controlRef.current ?? inputRef.current
  })

  const popup = usePopup({
    open: isOpen,
    anchorRef,
    popupRef,
    placement,
    offset,
    padding,
    matchAnchorWidth: true,
    popover: 'manual',
    onNativeDismiss: () => close('light-dismiss'),
  })

  const ignore = useMemo(() => [isInsideField], [isInsideField])
  useDismissableLayer({
    open: isOpen,
    ref: popupRef,
    ignore,
    onDismiss: (reason) => close(reason === 'escape' ? 'escape' : 'outside-press'),
  })

  // The result count, "no results" and "loading", said politely once the user stops typing
  // (4.1.3). Every keystroke starts the wait again, so nothing is said while typing. The active
  // option is never announced: the screen reader reads it through `aria-activedescendant`.
  const latestAnnouncing = useRef({ comboboxMessages, announce, isAvailable })
  useLayoutEffect(() => {
    latestAnnouncing.current = { comboboxMessages, announce, isAvailable }
  })
  const { announcement } = state
  // Said only for what the user caused by typing, and for loading and "no results": opening the
  // list with a key or the Toggle doesn't read out a count for a list that didn't change.
  const isCountWanted = useRef(false)
  useEffect(() => {
    if (announcement === undefined || env === undefined) {
      isCountWanted.current = false
      return
    }
    if (announcement.kind !== 'resultCount') {
      // What follows "loading" or "no results" is a change worth saying too.
      isCountWanted.current = true
    } else if (!isCountWanted.current) {
      return
    }
    const timer = env.window.setTimeout(() => {
      const latest = latestAnnouncing.current
      if (latest.isAvailable) {
        latest.announce(announcementText(announcement, latest.comboboxMessages))
      } else {
        warnAnnouncerMissing()
      }
    }, debounceOption ?? announcementDebounceMilliseconds)
    return () => env.window.clearTimeout(timer)
  }, [announcement, state.inputValue, state.filterQuery, env, debounceOption])

  // After a value is removed, focus goes to the next remove button, else the previous, else the input.
  useLayoutEffect(() => {
    const pending = pendingFocus.current
    if (pending === undefined) {
      return
    }
    pendingFocus.current = undefined
    if (machine.getSelectedKeys().includes(pending.removedKey)) {
      // A parent that kept the value: the chip is rendered again by the next commit, so focus
      // goes back to its remove button then.
      pendingFocus.current = {
        removedKey: '',
        target: { type: 'removeButton', key: pending.removedKey },
      }
      requestFocusCheck()
      return
    }
    const button =
      pending.target.type === 'removeButton'
        ? removeButtons.current.get(pending.target.key)
        : undefined
    ;(button ?? inputRef.current)?.focus()
  }, [machine, focusCount])

  const selectedKeys = state.selectedKeys
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])
  const entryByItem = useMemo(
    () =>
      new Map<unknown, ListboxEntry<unknown>>(state.entries.map((entry) => [entry.item, entry])),
    [state.entries],
  )
  const { itemToString = String, itemToKey = options.itemToString ?? String } = options
  const selectedValues: ComboboxSelectedValue<TItem>[] = machine
    .getSelectedItems()
    .map((item) => ({ key: itemToKey(item), item, label: itemToString(item) }))

  const getOptionId = (entry: { index: number }) => `${baseId}-option-${entry.index}`
  const getGroupLabelId = (section: { key: string }) => {
    const index = state.sections?.findIndex((candidate) => candidate.key === section.key) ?? 0
    return `${baseId}-group-${index}`
  }

  // Expanded means a listbox is there to move into: with no option and nothing loading the popup
  // may still show its "No results" text, but the combobox reports collapsed (APG).
  const isExpanded = isOpen && (state.size > 0 || state.isLoading)
  const activeEntry =
    isOpen && state.activeKey !== undefined ? machine.getEntry(state.activeKey) : undefined
  // After `usePopup`, so the popup is shown and placed when the scroll element is measured.
  const virtualization = useListVirtualization({
    virtualize,
    hasGroups: groups !== undefined,
    isOpen,
    entries: state.entries,
    getRequiredIndexes: () => getRequiredIndexes(machine),
    activeIndex: activeEntry?.index,
    initialScrollIndex: getFirstSelectedIndex(machine, selectedKeys),
    shouldScrollToActive: () => activationRef.current !== 'pointer',
    listRef,
  })
  const classPrefix = variant === 'autocomplete' ? 'kv-autocomplete' : 'kv-combobox'
  // With several choices the Clear button empties the text only: each chosen value has its own
  // remove button, so one press never throws away a whole selection.
  const hasClearableValue = state.inputValue !== '' || (!isMultiple && selectedKeys.length > 0)

  const stateAttributes = {
    ...(isInvalid ? { 'data-invalid': '' as const } : {}),
    ...(isRequired ? { 'data-required': '' as const } : {}),
    ...(isDisabled ? { 'data-disabled': '' as const } : {}),
  }

  const controlProps: ComboboxControlPartProps = {
    className: `${classPrefix}-control`,
    ...stateAttributes,
    ...(isOpen ? { 'data-open': '' as const } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' as const } : {}),
    ref: controlRef,
  }

  const inputProps: ComboboxInputPartProps = {
    className: `${classPrefix}-input`,
    id: field?.controlProps.id ?? id ?? `${baseId}-input`,
    type: 'text',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': isExpanded,
    'aria-controls': listId,
    'aria-activedescendant': activeEntry === undefined ? undefined : getOptionId(activeEntry),
    'aria-describedby': field?.controlProps['aria-describedby'],
    ...(isInvalid ? { 'aria-invalid': 'true' as const } : {}),
    ...(isRequired ? { 'aria-required': 'true' as const } : {}),
    ...(isDisabled ? { disabled: true as const } : {}),
    ...stateAttributes,
    ...(variant === 'autocomplete' && name !== undefined && !isDisabled ? { name } : {}),
    value: options.inputValue ?? state.inputValue,
    ...(isOpen ? { 'data-open': '' as const } : {}),
    ...(isFocusVisible ? { 'data-focus-visible': '' as const } : {}),
    ref: inputRef,
    onChange: (event) => {
      isCountWanted.current = true
      bridge.setCause('input')
      activationRef.current = 'keyboard'
      machine.actions.setInputValue(event.currentTarget.value)
    },
    onKeyDown: (event) => {
      // A key during an IME or dead-key composition belongs to the composition (Enter would choose).
      if (isDisabled || event.defaultPrevented || event.nativeEvent.isComposing) {
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
      if (
        machine.getState().open &&
        !isInsideElement(popupRef.current, next) &&
        !isInsideField(next)
      ) {
        close('blur')
      }
    },
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const toggleProps: ComboboxTogglePartProps = {
    className: `${classPrefix}-toggle`,
    type: 'button',
    tabIndex: -1,
    'aria-label': comboboxMessages.showOptions,
    'aria-expanded': isExpanded,
    'aria-controls': listId,
    ...(isDisabled ? { disabled: true as const, 'data-disabled': '' as const } : {}),
    ...(isOpen ? { 'data-open': '' as const } : {}),
    ref: toggleRef,
    // A press never takes focus from the input, so Safari and Firefox behave like Chromium.
    onMouseDown: (event) => {
      event.preventDefault()
    },
    onClick: () => {
      if (isDisabled) {
        return
      }
      bridge.setCause('toggle-press')
      activationRef.current = 'keyboard'
      machine.actions.setOpen(!isOpen)
      focusInput()
    },
  }

  const clearProps: ComboboxClearPartProps = {
    className: `${classPrefix}-clear`,
    type: 'button',
    tabIndex: -1,
    'aria-label': comboboxMessages.clear,
    ...(isDisabled ? { disabled: true as const, 'data-disabled': '' as const } : {}),
    ref: clearRef,
    onMouseDown: (event) => {
      event.preventDefault()
    },
    onClick: () => {
      if (isDisabled) {
        return
      }
      bridge.setCause('clear')
      if (isMultiple) {
        machine.actions.setInputValue('')
      } else {
        machine.actions.clear()
      }
      focusInput()
    },
  }

  const popupProps: ListboxPopupPartProps & { 'data-loading'?: '' } = {
    ...popup.popupProps,
    className: 'kv-listbox-popup',
    id: popupId,
    ...(isOpen && state.isLoading ? { 'data-loading': '' as const } : {}),
    ref: popupRef,
    onMouseDown: (event) => {
      // A press in the popup (an option, the padding, its scrollbar) must not take focus from the input.
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
    name === undefined || variant === 'autocomplete' || isDisabled
      ? []
      : isMultiple
        ? selectedKeys.map((key) => ({ name, value: key }))
        : [{ name, value: selectedKeys[0] ?? '' }]

  return {
    variant,
    isOpen,
    isMultiple,
    isDisabled,
    isInvalid,
    isRequired,
    isFocusVisible,
    isLoading: state.isLoading,
    inputValue: options.inputValue ?? state.inputValue,
    hasClearableValue,
    entries: state.entries,
    sections: state.sections,
    size: state.size,
    activeKey: isOpen ? state.activeKey : undefined,
    selectedKeys,
    selectedValues,
    emptyText: comboboxMessages.noResults,
    loadingText: comboboxMessages.loading,
    controlProps,
    inputProps,
    toggleProps,
    clearProps,
    valueListProps: {
      className: 'kv-combobox-value-list',
      role: 'list',
      'aria-labelledby': field?.labelId,
    },
    getValueProps: () => ({
      className: 'kv-combobox-value',
      ...(isDisabled ? { 'data-disabled': '' as const } : {}),
    }),
    getRemoveButtonProps: (value) => ({
      className: 'kv-combobox-value-remove',
      type: 'button',
      'aria-label': comboboxMessages.removeValue({ label: value.label }),
      ...(isDisabled ? { disabled: true as const } : {}),
      ref: (element) => {
        if (element === null) {
          removeButtons.current.delete(value.key)
        } else {
          removeButtons.current.set(value.key, element)
        }
      },
      onClick: () => {
        if (isDisabled) {
          return
        }
        bridge.setCause('remove')
        const result = machine.actions.removeValue(value.key)
        if (result.removed) {
          pendingFocus.current = { removedKey: value.key, target: result.focusTarget }
          // Focus moves in the commit after the list has re-rendered without this value.
          requestFocusCheck()
        }
      },
    }),
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
  }
}

/**
 * The state and props of a Combobox (ADR-0037; contract: combobox.a11y.md): an editable
 * `role="combobox"` input that filters a list as the user types, and a popup to choose from. The
 * value is one of the options (or several), never the text. Built on `createCombobox`.
 *
 * - **DOM focus stays on the input** (`aria-activedescendant`). Opening never moves it. No
 *   option is active until ArrowDown or ArrowUp, so Enter never picks something the user didn't
 *   choose, and with none active Enter keeps its native meaning (a form can submit).
 * - **Typed text is never cleared or replaced silently.** Text that matches no option stays, and
 *   the value is `null`: your validation says "Choose an option from the list". Choosing an
 *   option puts its text in the input (`multiple`: the field empties, the choice moves to the
 *   value list). Only the Clear button empties it (several choices: the text only).
 * - **Keys** are the core's `handleKeyDown`: ArrowDown and ArrowUp (no wrap), Page Up and Down,
 *   Enter, Escape, Tab (closes without choosing), Alt+ArrowDown and Alt+ArrowUp. Home and End
 *   move the caret.
 * - **Announcements:** the result count, "no results" and "loading" go to the shared Announcer
 *   once the user stops typing (needs a `KvirnProvider`).
 * - **The value is a key** (`itemToKey`): a string or `null`, or with `multiple` an array.
 *   Controlled with `value`, uncontrolled with `defaultValue`. With `name`, `hiddenInputs` holds
 *   one entry per chosen key.
 *
 * @example
 * const municipality = useCombobox({ items: municipalities, itemToString: (m) => m.name })
 * <input {...municipality.inputProps} />
 * <div {...municipality.popupProps}><div {...municipality.listProps}>…</div></div>
 */
export function useCombobox<TItem>(options: UseComboboxOptions<TItem>): UseComboboxResult<TItem> {
  const isMultiple = options.multiple === true
  const current = options
  return useComboboxMachine({
    ...options,
    variant: 'combobox',
    multiple: isMultiple,
    selectedKeys: toKeys(options.value),
    defaultSelectedKeys: toKeys(options.defaultValue),
    onSelectedKeysChange: (keys, details) => {
      if (current.multiple === true) {
        current.onValueChange?.([...keys], details)
      } else {
        current.onValueChange?.(keys[0] ?? null, details)
      }
    },
  })
}
