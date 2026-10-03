import { startsWithText } from '../filter/filter-items.ts'
import type { FilterLocale } from '../filter/filter-items.ts'
import { createComponentStore } from '../store/create-component-store.ts'
import type { ComponentStore } from '../store/create-component-store.ts'

/**
 * What the listbox needs from the page: timers, for the typeahead buffer. `Env` satisfies it, and
 * a Node test can pass a few functions instead of a DOM.
 */
export interface ListboxEnv {
  readonly window: {
    readonly setTimeout: (handler: () => void, milliseconds: number) => number
    readonly clearTimeout: (handle: number) => void
  }
}

/** A named group of items. Groups are flat (no nesting) and an empty group is kept as it is. */
export interface ListboxGroup<TItem> {
  key: string
  label: string
  items: readonly TItem[]
}

/** One option, as the binding renders it. `index` counts across groups, from 0. */
export interface ListboxEntry<TItem> {
  key: string
  item: TItem
  label: string
  index: number
  /** Disabled entries stay reachable with the arrow keys and can't be selected. */
  disabled: boolean
  /** The key of the group the entry is in, `undefined` in a flat list. */
  groupKey: string | undefined
}

export interface ListboxSection<TItem> {
  key: string
  label: string
  entries: readonly ListboxEntry<TItem>[]
}

export interface ListboxOptions<TItem> {
  /** A flat list. Ignored when `groups` is given. */
  items?: readonly TItem[] | undefined
  groups?: readonly ListboxGroup<TItem>[] | undefined
  /** The label of an item: shown, matched by typeahead and filtering. Default `String(item)`. */
  itemToString?: ((item: TItem) => string) | undefined
  /** A stable, unique key of an item. Default: the label. */
  itemToKey?: ((item: TItem) => string) | undefined
  isItemDisabled?: ((item: TItem) => boolean) | undefined
  /** Several items can be selected. Default `false`. */
  multiple?: boolean | undefined
  /** The keys selected to begin with. Only the first is used unless `multiple`. */
  selectedKeys?: readonly string[] | undefined
  /** The locale for typeahead matching. */
  locale?: FilterLocale
  /** How far PageUp and PageDown move, in options. Default 10. */
  pageSize?: number | undefined
  /** How long a pause ends a typeahead word, in milliseconds. Default 500. */
  typeaheadResetMilliseconds?: number | undefined
  /** Called when the user changes the selection (`select`, `toggle`, `deselect`, `clearSelection`). Not for `setSelectedKeys`. */
  onSelectedKeysChange?: ((keys: readonly string[]) => void) | undefined
}

export interface ListboxState<TItem> {
  entries: readonly ListboxEntry<TItem>[]
  /** The groups with their entries, or `undefined` for a flat list. */
  sections: readonly ListboxSection<TItem>[] | undefined
  /** The number of entries now in the list, after any filtering. This is `aria-setsize`. */
  size: number
  /** The active (highlighted) entry. `undefined` until the user moves to one. */
  activeKey: string | undefined
  /** The index of the active entry, `-1` when there is none. `aria-posinset` is this plus 1. */
  activeIndex: number
  /** In the order they were selected. May hold keys that aren't in `entries` (filtered out). */
  selectedKeys: readonly string[]
  /** What the user has typed since the last pause, for typeahead. */
  typeaheadBuffer: string
}

export interface ListboxActions<TItem> {
  /** Replaces the flat list. The active entry is kept when it is still there, else cleared. */
  setItems: (items: readonly TItem[]) => void
  setGroups: (groups: readonly ListboxGroup<TItem>[]) => void
  /** Returns `false` and does nothing when the key isn't in the list. `undefined` clears. */
  setActiveKey: (key: string | undefined) => boolean
  /** The next entry. Nothing active yet: the first. Doesn't wrap. Returns the active key. */
  activateNext: () => string | undefined
  /** The previous entry. Nothing active yet: the last. Doesn't wrap. Returns the active key. */
  activatePrevious: () => string | undefined
  activateFirst: () => string | undefined
  activateLast: () => string | undefined
  /** `pageSize` entries on, stopping at the last. Nothing active yet: counts from before the first. */
  activateNextPage: () => string | undefined
  /** `pageSize` entries back, stopping at the first. Nothing active yet: the last. */
  activatePreviousPage: () => string | undefined
  /**
   * Adds a character to the typeahead word and activates the first entry whose label starts with
   * it, looking forward from the active one and wrapping. The same character again cycles
   * through the entries that start with it. Disabled entries match too (they are reachable).
   * Returns the active key, or `undefined` when nothing matches (the word is kept).
   */
  typeahead: (character: string) => string | undefined
  resetTypeahead: () => void
  /**
   * Selects an entry: it replaces the selection, or is added in `multiple`. Returns `true` when
   * the entry could be selected (it exists and isn't disabled), even if it already was.
   */
  select: (key: string) => boolean
  /** `multiple`: flips the entry. Otherwise the same as `select`, because a single choice can't be unmade this way. */
  toggle: (key: string) => boolean
  /** Removes a key from the selection, whether or not it is in the list. Returns `true` when it was selected. */
  deselect: (key: string) => boolean
  clearSelection: () => void
  /** Sets the selection from outside (a controlled value). Doesn't call `onSelectedKeysChange`. */
  setSelectedKeys: (keys: readonly string[]) => void
}

export interface ListboxReaders<TItem> {
  getActiveKey: () => string | undefined
  getActiveIndex: () => number
  getSelectedKeys: () => readonly string[]
  /** The number of entries now in the list, after any filtering. */
  getSize: () => number
  getEntry: (key: string) => ListboxEntry<TItem> | undefined
  /**
   * The keys a virtualized list must always render: the active entry, then the selected ones that
   * are in the list. `aria-activedescendant` can only point at an option that is in the DOM.
   */
  getRequiredRenderKeys: () => string[]
}

export type Listbox<TItem> = ComponentStore<ListboxState<TItem>, ListboxActions<TItem>> &
  ListboxReaders<TItem>

export const defaultPageSize = 10
export const defaultTypeaheadResetMilliseconds = 500

/** The shared defaults for `itemToString` and `itemToKey`. */
export function resolveItemAccessors<TItem>(options: {
  itemToString?: ((item: TItem) => string) | undefined
  itemToKey?: ((item: TItem) => string) | undefined
}): { itemToString: (item: TItem) => string; itemToKey: (item: TItem) => string } {
  const itemToString = options.itemToString ?? ((item: TItem) => String(item))
  return { itemToString, itemToKey: options.itemToKey ?? itemToString }
}

function uniqueKeys(keys: readonly string[], multiple: boolean): readonly string[] {
  const unique = [...new Set(keys)]
  return multiple ? unique : unique.slice(0, 1)
}

function sameKeys(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((key, index) => key === second[index])
}

/**
 * The state behind a listbox: the entries, the active entry, the selection and
 * typeahead. It has no DOM and no keyboard handling: `createCombobox` adds the keys, the popup
 * and the input on top of it. Nothing is active until something asks for it, so Enter can never
 * pick an option the user didn't choose.
 *
 * Arrows and page jumps don't wrap. Disabled entries are in the sequence, so a user can discover
 * them, but they can't be selected. `env` is `undefined` while server rendering, and then the
 * typeahead word is only ended by `resetTypeahead` or by another way of moving.
 */
export function createListbox<TItem>(
  options: ListboxOptions<TItem> = {},
  env?: ListboxEnv,
): Listbox<TItem> {
  const {
    multiple = false,
    locale,
    pageSize = defaultPageSize,
    typeaheadResetMilliseconds = defaultTypeaheadResetMilliseconds,
    onSelectedKeysChange,
  } = options
  const { itemToString, itemToKey } = resolveItemAccessors(options)
  const isItemDisabled = options.isItemDisabled ?? (() => false)

  let entryByKey = new Map<string, ListboxEntry<TItem>>()

  const createEntry = (
    item: TItem,
    index: number,
    groupKey: string | undefined,
  ): ListboxEntry<TItem> => ({
    key: itemToKey(item),
    item,
    label: itemToString(item),
    index,
    disabled: isItemDisabled(item),
    groupKey,
  })

  type Derived = Pick<ListboxState<TItem>, 'entries' | 'sections' | 'size'>

  const derive = (
    items: readonly TItem[] | undefined,
    groups: readonly ListboxGroup<TItem>[] | undefined,
  ): Derived => {
    const entries: ListboxEntry<TItem>[] = []
    let sections: ListboxSection<TItem>[] | undefined
    if (groups === undefined) {
      for (const item of items ?? []) {
        entries.push(createEntry(item, entries.length, undefined))
      }
    } else {
      sections = []
      for (const group of groups) {
        const groupEntries = group.items.map((item, offset) =>
          createEntry(item, entries.length + offset, group.key),
        )
        entries.push(...groupEntries)
        sections.push({ key: group.key, label: group.label, entries: groupEntries })
      }
    }
    entryByKey = new Map(entries.map((entry) => [entry.key, entry]))
    return { entries, sections, size: entries.length }
  }

  const initial = derive(options.items, options.groups)
  const store = createComponentStore<ListboxState<TItem>, ListboxActions<TItem>>(
    {
      ...initial,
      activeKey: undefined,
      activeIndex: -1,
      selectedKeys: uniqueKeys(options.selectedKeys ?? [], multiple),
      typeaheadBuffer: '',
    },
    ({ getState, update }) => {
      let resetTimer: number | undefined

      const stopTimer = () => {
        if (resetTimer !== undefined) {
          env?.window.clearTimeout(resetTimer)
          resetTimer = undefined
        }
      }

      const resetTypeahead = () => {
        stopTimer()
        if (getState().typeaheadBuffer !== '') {
          update((state) => ({ ...state, typeaheadBuffer: '' }))
        }
      }

      /** Moves the active entry without touching the typeahead word. */
      const applyActive = (key: string | undefined): string | undefined => {
        const entry = key === undefined ? undefined : entryByKey.get(key)
        const activeKey = entry?.key
        if (getState().activeKey !== activeKey) {
          update((state) => ({ ...state, activeKey, activeIndex: entry?.index ?? -1 }))
        }
        return activeKey
      }

      const activateIndex = (index: number): string | undefined => {
        resetTypeahead()
        return applyActive(getState().entries[index]?.key)
      }

      const commitSelection = (keys: readonly string[]) => {
        if (sameKeys(getState().selectedKeys, keys)) {
          return
        }
        update((state) => ({ ...state, selectedKeys: keys }))
        onSelectedKeysChange?.(keys)
      }

      const findSelectable = (key: string): ListboxEntry<TItem> | undefined => {
        const entry = entryByKey.get(key)
        return entry === undefined || entry.disabled ? undefined : entry
      }

      const replaceList = (derived: Derived) => {
        update((state) => {
          const active = state.activeKey === undefined ? undefined : entryByKey.get(state.activeKey)
          return {
            ...state,
            ...derived,
            activeKey: active?.key,
            activeIndex: active?.index ?? -1,
          }
        })
      }

      const select = (key: string): boolean => {
        const entry = findSelectable(key)
        if (entry === undefined) {
          return false
        }
        const current = getState().selectedKeys
        commitSelection(
          multiple ? (current.includes(key) ? current : [...current, key]) : [entry.key],
        )
        return true
      }

      return {
        setItems: (items) => {
          replaceList(derive(items, undefined))
        },
        setGroups: (groups) => {
          replaceList(derive(undefined, groups))
        },
        setActiveKey: (key) => {
          if (key !== undefined && !entryByKey.has(key)) {
            return false
          }
          resetTypeahead()
          applyActive(key)
          return true
        },
        activateNext: () => {
          const { activeIndex, size } = getState()
          return size === 0 ? undefined : activateIndex(Math.min(activeIndex + 1, size - 1))
        },
        activatePrevious: () => {
          const { activeIndex, size } = getState()
          return size === 0
            ? undefined
            : activateIndex(activeIndex < 0 ? size - 1 : Math.max(activeIndex - 1, 0))
        },
        activateFirst: () => (getState().size === 0 ? undefined : activateIndex(0)),
        activateLast: () => {
          const { size } = getState()
          return size === 0 ? undefined : activateIndex(size - 1)
        },
        activateNextPage: () => {
          const { activeIndex, size } = getState()
          return size === 0 ? undefined : activateIndex(Math.min(activeIndex + pageSize, size - 1))
        },
        activatePreviousPage: () => {
          const { activeIndex, size } = getState()
          return size === 0
            ? undefined
            : activateIndex(activeIndex < 0 ? size - 1 : Math.max(activeIndex - pageSize, 0))
        },
        typeahead: (character) => {
          const state = getState()
          if (character === '') {
            return undefined
          }
          const word = state.typeaheadBuffer + character
          stopTimer()
          if (env !== undefined) {
            resetTimer = env.window.setTimeout(() => {
              resetTimer = undefined
              update((current) => ({ ...current, typeaheadBuffer: '' }))
            }, typeaheadResetMilliseconds)
          }
          update((current) => ({ ...current, typeaheadBuffer: word }))

          const letters = Array.from(word)
          const first = letters[0] ?? ''
          // "aaa" means "the next entry starting with a", as in a native select.
          const repeated =
            letters.length > 1 && letters.every((letter) => startsWithText(letter, first, locale))
          const query = repeated ? first : word
          const start = repeated || letters.length === 1 ? state.activeIndex + 1 : state.activeIndex
          for (let offset = 0; offset < state.size; offset += 1) {
            const entry = state.entries[(Math.max(start, 0) + offset) % state.size]
            if (entry !== undefined && startsWithText(entry.label, query, locale)) {
              return applyActive(entry.key)
            }
          }
          return undefined
        },
        resetTypeahead,
        select,
        toggle: (key) => {
          if (!multiple) {
            return select(key)
          }
          const entry = findSelectable(key)
          if (entry === undefined) {
            return false
          }
          const current = getState().selectedKeys
          commitSelection(
            current.includes(key) ? current.filter((other) => other !== key) : [...current, key],
          )
          return true
        },
        deselect: (key) => {
          const current = getState().selectedKeys
          if (!current.includes(key)) {
            return false
          }
          commitSelection(current.filter((other) => other !== key))
          return true
        },
        clearSelection: () => {
          commitSelection([])
        },
        setSelectedKeys: (keys) => {
          const next = uniqueKeys(keys, multiple)
          if (!sameKeys(getState().selectedKeys, next)) {
            update((state) => ({ ...state, selectedKeys: next }))
          }
        },
      }
    },
  )

  return {
    ...store,
    getActiveKey: () => store.getState().activeKey,
    getActiveIndex: () => store.getState().activeIndex,
    getSelectedKeys: () => store.getState().selectedKeys,
    getSize: () => store.getState().size,
    getEntry: (key) => entryByKey.get(key),
    getRequiredRenderKeys: () => {
      const { activeKey, selectedKeys } = store.getState()
      const keys = [...(activeKey === undefined ? [] : [activeKey]), ...selectedKeys]
      return [...new Set(keys)].filter((key) => entryByKey.has(key))
    },
  }
}
