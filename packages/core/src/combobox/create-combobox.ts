import { matchesText } from '../filter/filter-items.ts'
import { createListbox, resolveItemAccessors } from '../listbox/create-listbox.ts'
import type {
  Listbox,
  ListboxEnv,
  ListboxGroup,
  ListboxOptions,
  ListboxReaders,
  ListboxState,
} from '../listbox/create-listbox.ts'
import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'

/**
 * - `'listbox'`: select-only. There is no text field: the user picks, and typeahead jumps.
 * - `'combobox'`: the user types to filter, then picks. The value is one of the options (or several).
 * - `'autocomplete'`: the user types free text and gets suggestions. The value is the text.
 */
export type ComboboxMode = 'listbox' | 'combobox' | 'autocomplete'

/**
 * What a live region should say about the list, as data. The binding turns it into a message
 * from i18n (`combobox.resultCount`, `combobox.noResults`, `combobox.loading`) and sends it to the
 * Announcer, debounced by {@link announcementDebounceMilliseconds} (4.1.3). It is `undefined`
 * while the popup is closed and in `'listbox'` mode. The active option is never announced: the
 * screen reader reads it through `aria-activedescendant`.
 */
export type ComboboxAnnouncement =
  | { kind: 'resultCount'; count: number }
  | { kind: 'noResults' }
  | { kind: 'loading' }

/** Why the text changed: the user typed, an option was chosen, or the field was cleared. */
export type ComboboxInputReason = 'input' | 'selection' | 'clear'

/** Where focus goes after a value is removed (ADR-0037, item 4). */
export type ComboboxFocusTarget = { type: 'removeButton'; key: string } | { type: 'input' }

/** The parts of a `KeyboardEvent` the combobox reads. A DOM event satisfies it. */
export interface ComboboxKeyEvent {
  key: string
  altKey?: boolean | undefined
  ctrlKey?: boolean | undefined
  metaKey?: boolean | undefined
  shiftKey?: boolean | undefined
}

export interface ComboboxKeyResult {
  /**
   * `true`: the combobox used the key, so the binding calls `preventDefault`. `false`: the key
   * is left to the browser (typing, Home and End in the text field, Enter submitting a form,
   * Tab moving on), although state may still have changed (Tab closes the popup).
   */
  handled: boolean
}

export interface ComboboxOptions<TItem> extends ListboxOptions<TItem> {
  /** Default `'combobox'`. */
  mode?: ComboboxMode | undefined
  /** Ignored for `'autocomplete'`, which has a text for a value. */
  multiple?: boolean | undefined
  defaultOpen?: boolean | undefined
  /** The text to begin with. Default: the label of the selected option, in single `'combobox'` mode. */
  defaultInputValue?: string | undefined
  /**
   * Replaces the default filter (a substring match on the label, locale-aware). `false` turns
   * filtering off, for results that the server has already filtered: pass `isLoading` while it works.
   */
  filter?: ((item: TItem, query: string) => boolean) | false | undefined
  isLoading?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  onInputValueChange?: ((inputValue: string, reason: ComboboxInputReason) => void) | undefined
}

export interface ComboboxState<TItem> extends Pick<
  ListboxState<TItem>,
  'entries' | 'sections' | 'size' | 'activeKey' | 'activeIndex' | 'selectedKeys' | 'typeaheadBuffer'
> {
  open: boolean
  /** What the text field shows. Always `''` in `'listbox'` mode. */
  inputValue: string
  /** What the list is filtered by. Empty after a choice, so the list is whole when it opens again. */
  filterQuery: string
  isLoading: boolean
  announcement: ComboboxAnnouncement | undefined
}

export interface ComboboxActions<TItem> {
  setOpen: (open: boolean) => void
  /** Closing clears the active option, so `aria-activedescendant` is removed. */
  toggleOpen: () => void
  /**
   * The text field changed (call it from `onChange`). It filters, clears the active option and
   * opens the popup (autocomplete: only for text). In single `'combobox'` mode, editing away from
   * the chosen label makes the value `null`. The typed text itself is never changed.
   */
  setInputValue: (inputValue: string) => void
  /** For pointer hover. `undefined` clears. Returns `false` for a key that isn't in the list. */
  setActiveKey: (key: string | undefined) => boolean
  /** Chooses an option (a click, Enter). Returns `false` for a disabled or unknown one. */
  selectOption: (key: string) => boolean
  selectActiveOption: () => boolean
  /** `multiple`: removes a chosen value and says where focus goes. */
  removeValue: (key: string) => { removed: boolean; focusTarget: ComboboxFocusTarget }
  /** The Clear button: empties the text and the value. An explicit user action, never automatic. */
  clear: () => void
  /** Sets the value from outside (a controlled value). Doesn't call `onSelectedKeysChange`. */
  setSelectedKeys: (keys: readonly string[]) => void
  /** The full list. It is filtered here, unless `filter` is `false`. */
  setItems: (items: readonly TItem[]) => void
  setGroups: (groups: readonly ListboxGroup<TItem>[]) => void
  setLoading: (isLoading: boolean) => void
  /** Forward `keydown` to this. See {@link ComboboxKeyResult}. */
  handleKeyDown: (event: ComboboxKeyEvent) => ComboboxKeyResult
}

export type Combobox<TItem> = ComponentStore<ComboboxState<TItem>, ComboboxActions<TItem>> &
  ListboxReaders<TItem> & {
    readonly mode: ComboboxMode
    readonly multiple: boolean
    /** The chosen items, in the order chosen, including ones that the filter hides now. */
    getSelectedItems: () => TItem[]
  }

/** How long to wait after the last change before announcing the result count (ADR-0037, item 9). */
export const announcementDebounceMilliseconds = 500

function deriveAnnouncement(
  mode: ComboboxMode,
  open: boolean,
  isLoading: boolean,
  size: number,
): ComboboxAnnouncement | undefined {
  if (!open || mode === 'listbox') {
    return undefined
  }
  if (isLoading) {
    return { kind: 'loading' }
  }
  return size === 0 ? { kind: 'noResults' } : { kind: 'resultCount', count: size }
}

function sameAnnouncement(
  first: ComboboxAnnouncement | undefined,
  second: ComboboxAnnouncement | undefined,
): boolean {
  if (first === undefined || second === undefined) {
    return first === second
  }
  return (
    first.kind === second.kind &&
    (first.kind !== 'resultCount' ||
      (second.kind === 'resultCount' && first.count === second.count))
  )
}

/** Keys that move the caret in a text field. */
const caretKeys: ReadonlySet<string> = new Set(['Home', 'End', 'ArrowLeft', 'ArrowRight'])

function keyResult(handled: boolean): ComboboxKeyResult {
  return { handled }
}

/**
 * The state and keyboard behaviour behind Listbox, Combobox and Autocomplete (ADR-0037), built
 * on `createListbox`. DOM focus stays on the trigger or the input, and the active option is
 * `activeKey` (`aria-activedescendant`).
 *
 * The rules that matter for users:
 * - No option is active until an arrow key (or typeahead). Enter with none active selects nothing.
 * - Typed text is never cleared or replaced silently. Escape and Tab keep it, and text that
 *   matches no option stays, with the value `null`. Only choosing an option replaces it (with the
 *   label, or in `multiple` by an empty field, since the choice moves to the value list), and
 *   only the Clear button empties it.
 * - Arrows and page jumps don't wrap.
 *
 * `env` supplies timers for the typeahead word and is `undefined` while server rendering.
 */
export function createCombobox<TItem>(
  options: ComboboxOptions<TItem> = {},
  env?: ListboxEnv,
): Combobox<TItem> {
  const mode = options.mode ?? 'combobox'
  const multiple = mode === 'autocomplete' ? false : (options.multiple ?? false)
  const isEditable = mode !== 'listbox'
  const { locale, filter, onOpenChange, onInputValueChange, onSelectedKeysChange } = options
  const { itemToString, itemToKey } = resolveItemAccessors(options)

  let sourceItems: readonly TItem[] | undefined = options.items
  let sourceGroups: readonly ListboxGroup<TItem>[] | undefined = options.groups
  /** Every item seen, so chosen values keep their item when a filter or a new result set drops them. */
  const knownItems = new Map<string, TItem>()
  const remember = () => {
    const items =
      sourceGroups === undefined
        ? (sourceItems ?? [])
        : sourceGroups.flatMap((group) => group.items)
    for (const item of items) {
      knownItems.set(itemToKey(item), item)
    }
  }
  remember()

  const labelOf = (key: string): string | undefined => {
    const item = knownItems.get(key)
    return item === undefined ? undefined : itemToString(item)
  }

  const matches = (item: TItem, query: string): boolean =>
    typeof filter === 'function'
      ? filter(item, query)
      : matchesText(itemToString(item), query, locale)

  /** What the list should hold for a query: the whole source, or the matching part of it. */
  const filterSource = (
    query: string,
  ): { items: readonly TItem[] } | { groups: readonly ListboxGroup<TItem>[] } => {
    const skip = !isEditable || filter === false || query === ''
    if (sourceGroups !== undefined) {
      return {
        groups: skip
          ? sourceGroups
          : sourceGroups
              .map((group) => ({
                ...group,
                items: group.items.filter((item) => matches(item, query)),
              }))
              .filter((group) => group.items.length > 0),
      }
    }
    const items = sourceItems ?? []
    return { items: skip ? items : items.filter((item) => matches(item, query)) }
  }

  const initialKey = options.selectedKeys?.[0]
  const initialLabel = initialKey === undefined ? undefined : labelOf(initialKey)
  const initialInputValue = !isEditable
    ? ''
    : (options.defaultInputValue ??
      (mode === 'combobox' && !multiple && initialLabel !== undefined ? initialLabel : ''))
  const initialFilterQuery =
    mode === 'autocomplete'
      ? initialInputValue
      : isEditable && initialInputValue !== initialLabel
        ? initialInputValue
        : ''

  const listbox: Listbox<TItem> = createListbox(
    {
      ...filterSource(initialFilterQuery),
      itemToString,
      itemToKey,
      isItemDisabled: options.isItemDisabled,
      multiple,
      selectedKeys: options.selectedKeys,
      locale,
      pageSize: options.pageSize,
      typeaheadResetMilliseconds: options.typeaheadResetMilliseconds,
      onSelectedKeysChange,
    },
    env,
  )

  const mirror = (): Pick<
    ComboboxState<TItem>,
    | 'entries'
    | 'sections'
    | 'size'
    | 'activeKey'
    | 'activeIndex'
    | 'selectedKeys'
    | 'typeaheadBuffer'
  > => {
    const { entries, sections, size, activeKey, activeIndex, selectedKeys, typeaheadBuffer } =
      listbox.getState()
    return { entries, sections, size, activeKey, activeIndex, selectedKeys, typeaheadBuffer }
  }

  const initialOpen = options.defaultOpen === true
  const isLoading = options.isLoading ?? false
  const store = createComponentStore<ComboboxState<TItem>, ComboboxActions<TItem>>(
    {
      ...mirror(),
      open: initialOpen,
      inputValue: initialInputValue,
      filterQuery: initialFilterQuery,
      isLoading,
      announcement: deriveAnnouncement(mode, initialOpen, isLoading, listbox.getState().size),
    },
    ({ getState, update }) => {
      /** Merges a change and keeps `announcement` in step with it. */
      const commit = (patch: Partial<ComboboxState<TItem>>) => {
        update((state) => {
          const next = { ...state, ...patch }
          const announcement = deriveAnnouncement(mode, next.open, next.isLoading, next.size)
          return {
            ...next,
            announcement: sameAnnouncement(state.announcement, announcement)
              ? state.announcement
              : announcement,
          }
        })
      }

      listbox.subscribe(() => {
        commit(mirror())
      })

      const refilter = () => {
        const filtered = filterSource(getState().filterQuery)
        if ('groups' in filtered) {
          listbox.actions.setGroups(filtered.groups)
        } else {
          listbox.actions.setItems(filtered.items)
        }
      }

      const setOpen = (open: boolean) => {
        if (getState().open === open) {
          return
        }
        commit({ open })
        if (!open) {
          listbox.actions.setActiveKey(undefined)
        }
        onOpenChange?.(open)
      }

      /** Sets the text and what the list is filtered by. Doesn't touch the value or the popup. */
      const applyInput = (inputValue: string, filterQuery: string, reason: ComboboxInputReason) => {
        const state = getState()
        if (state.inputValue === inputValue && state.filterQuery === filterQuery) {
          return
        }
        commit({ inputValue, filterQuery })
        refilter()
        if (state.inputValue !== inputValue) {
          onInputValueChange?.(inputValue, reason)
        }
      }

      /** Opens, and activates the chosen option, or else the first or last. */
      const openAndActivate = (fallback: 'first' | 'last') => {
        setOpen(true)
        const chosenKey = listbox
          .getState()
          .selectedKeys.find((key) => listbox.getEntry(key) !== undefined)
        if (chosenKey !== undefined) {
          listbox.actions.setActiveKey(chosenKey)
        } else if (fallback === 'first') {
          listbox.actions.activateFirst()
        } else {
          listbox.actions.activateLast()
        }
      }

      const selectOption = (key: string): boolean => {
        const entry = listbox.getEntry(key)
        if (entry === undefined || entry.disabled) {
          return false
        }
        if (mode === 'autocomplete') {
          // The value is the text: picking a suggestion fills the input.
          applyInput(entry.label, entry.label, 'selection')
          setOpen(false)
          return true
        }
        const chosen = multiple ? listbox.actions.toggle(key) : listbox.actions.select(key)
        if (!chosen) {
          return false
        }
        if (mode === 'combobox') {
          // Single: the field shows the label. Multiple: the choice moves to the value list.
          applyInput(multiple ? '' : entry.label, '', 'selection')
        }
        if (!multiple) {
          setOpen(false)
        }
        return true
      }

      const selectActiveOption = (): boolean => {
        const { activeKey } = getState()
        return activeKey === undefined ? false : selectOption(activeKey)
      }

      const handleKeyDown = (event: ComboboxKeyEvent): ComboboxKeyResult => {
        const { key, altKey = false, ctrlKey = false, metaKey = false, shiftKey = false } = event
        // In the text field these keys move the caret, with or without Shift or Control. That
        // returns visual focus to the field (APG), so no option stays active and
        // `aria-activedescendant` goes. The key is never cancelled: the caret moves natively.
        if (isEditable && !altKey && caretKeys.has(key)) {
          listbox.actions.setActiveKey(undefined)
          return keyResult(false)
        }
        // Never take over the browser's, the OS's or assistive technology's shortcuts.
        if (ctrlKey || metaKey) {
          return keyResult(false)
        }
        const state = getState()

        if (key === 'Tab') {
          if (state.open) {
            if (mode === 'listbox' && !multiple && state.activeKey !== undefined) {
              selectOption(state.activeKey)
            }
            setOpen(false)
          }
          return keyResult(false)
        }

        if (altKey) {
          if (key === 'ArrowDown') {
            setOpen(true)
            return keyResult(true)
          }
          if (key === 'ArrowUp' && state.open) {
            // Alt+ArrowUp accepts: in `multiple` it adds, it doesn't flip a chosen value off.
            const { activeKey } = state
            if (activeKey !== undefined && !(multiple && state.selectedKeys.includes(activeKey))) {
              selectOption(activeKey)
            }
            setOpen(false)
            return keyResult(true)
          }
          return keyResult(false)
        }

        // A named key with Shift (selecting text, extending a range) isn't ours.
        if (shiftKey && key.length > 1) {
          return keyResult(false)
        }

        switch (key) {
          case 'ArrowDown':
            if (state.open) {
              listbox.actions.activateNext()
            } else {
              openAndActivate('first')
            }
            return keyResult(true)
          case 'ArrowUp':
            if (state.open) {
              listbox.actions.activatePrevious()
            } else {
              openAndActivate('last')
            }
            return keyResult(true)
          case 'Home':
          case 'End':
            // In the text field these move the caret.
            if (isEditable) {
              return keyResult(false)
            }
            setOpen(true)
            if (key === 'Home') {
              listbox.actions.activateFirst()
            } else {
              listbox.actions.activateLast()
            }
            return keyResult(true)
          case 'PageDown':
          case 'PageUp':
            if (!state.open) {
              return keyResult(false)
            }
            if (key === 'PageDown') {
              listbox.actions.activateNextPage()
            } else {
              listbox.actions.activatePreviousPage()
            }
            return keyResult(true)
          case 'Enter':
            if (!state.open) {
              if (isEditable) {
                // Enter in the field is the browser's: it may submit the form.
                return keyResult(false)
              }
              openAndActivate('first')
              return keyResult(true)
            }
            if (state.activeKey === undefined) {
              // Nothing is active, so nothing is chosen, and Enter keeps its native meaning.
              return keyResult(false)
            }
            selectActiveOption()
            return keyResult(true)
          case 'Escape':
            if (!state.open) {
              return keyResult(false)
            }
            // Closes only: the value and the typed text stay.
            setOpen(false)
            return keyResult(true)
          case ' ':
            if (isEditable) {
              return keyResult(false)
            }
            if (!state.open) {
              openAndActivate('first')
            } else if (state.typeaheadBuffer !== '') {
              // A space inside a typeahead word, such as "New York".
              listbox.actions.typeahead(' ')
            } else {
              selectActiveOption()
            }
            return keyResult(true)
          default:
            if (!isEditable && Array.from(key).length === 1) {
              setOpen(true)
              listbox.actions.typeahead(key)
              return keyResult(true)
            }
            return keyResult(false)
        }
      }

      return {
        setOpen,
        toggleOpen: () => {
          setOpen(!getState().open)
        },
        setInputValue: (inputValue) => {
          if (!isEditable || getState().inputValue === inputValue) {
            return
          }
          listbox.actions.setActiveKey(undefined)
          applyInput(inputValue, inputValue, 'input')
          if (mode === 'combobox' && !multiple) {
            const [chosenKey] = listbox.getState().selectedKeys
            if (chosenKey !== undefined && labelOf(chosenKey) !== inputValue) {
              // The text no longer names the chosen option, so the value no longer is it.
              listbox.actions.clearSelection()
            }
          }
          if (mode === 'autocomplete') {
            setOpen(inputValue.trim() !== '')
          } else if (inputValue !== '') {
            setOpen(true)
          }
        },
        setActiveKey: listbox.actions.setActiveKey,
        selectOption,
        selectActiveOption,
        removeValue: (key) => {
          const keys = listbox.getState().selectedKeys
          const index = keys.indexOf(key)
          if (index === -1) {
            return { removed: false, focusTarget: { type: 'input' } }
          }
          const neighbour = keys[index + 1] ?? keys[index - 1]
          listbox.actions.deselect(key)
          return {
            removed: true,
            focusTarget:
              neighbour === undefined
                ? { type: 'input' }
                : { type: 'removeButton', key: neighbour },
          }
        },
        clear: () => {
          listbox.actions.clearSelection()
          applyInput('', '', 'clear')
          if (mode === 'autocomplete') {
            setOpen(false)
          }
        },
        setSelectedKeys: (keys) => {
          listbox.actions.setSelectedKeys(keys)
          if (mode === 'combobox' && !multiple) {
            const [chosenKey] = listbox.getState().selectedKeys
            const label = chosenKey === undefined ? undefined : labelOf(chosenKey)
            // An empty value never clears the text, but a new value shows its label.
            if (label !== undefined && label !== getState().inputValue) {
              applyInput(label, '', 'selection')
            }
          }
        },
        setItems: (items) => {
          sourceItems = items
          sourceGroups = undefined
          remember()
          refilter()
        },
        setGroups: (groups) => {
          sourceItems = undefined
          sourceGroups = groups
          remember()
          refilter()
        },
        setLoading: (loading) => {
          commit({ isLoading: loading })
        },
        handleKeyDown,
      }
    },
  )

  return {
    ...store,
    mode,
    multiple,
    getActiveKey: listbox.getActiveKey,
    getActiveIndex: listbox.getActiveIndex,
    getSelectedKeys: listbox.getSelectedKeys,
    getSize: listbox.getSize,
    getEntry: listbox.getEntry,
    getRequiredRenderKeys: listbox.getRequiredRenderKeys,
    getSelectedItems: () => {
      const items: TItem[] = []
      for (const key of listbox.getSelectedKeys()) {
        const item = knownItems.get(key)
        if (item !== undefined) {
          items.push(item)
        }
      }
      return items
    },
  }
}
