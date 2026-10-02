import { describe, expect, test, vi } from 'vite-plus/test'
import { announcementDebounceMilliseconds, createCombobox } from './create-combobox.ts'
import type { ComboboxKeyEvent, ComboboxOptions } from './create-combobox.ts'

const places = ['Stockholm', 'Göteborg', 'Malmö', 'Örebro', 'Uppsala']
const numbered = Array.from({ length: 25 }, (_, index) => `Item ${String(index).padStart(2, '0')}`)

/** A `Combobox<string>` with spies on its callbacks. */
function setup(options: ComboboxOptions<string> = {}) {
  const onOpenChange = vi.fn<(...args: unknown[]) => void>()
  const onInputValueChange = vi.fn<(...args: unknown[]) => void>()
  const onSelectedKeysChange = vi.fn<(...args: unknown[]) => void>()
  const combobox = createCombobox<string>({
    items: places,
    locale: 'sv',
    onOpenChange,
    onInputValueChange,
    onSelectedKeysChange,
    ...options,
  })
  const press = (key: string, modifiers: Omit<ComboboxKeyEvent, 'key'> = {}) =>
    combobox.actions.handleKeyDown({ key, ...modifiers })
  return { combobox, press, onOpenChange, onInputValueChange, onSelectedKeysChange }
}

describe('combobox mode: opening and the active option', () => {
  test('starts closed with no active option and no value', () => {
    const { combobox } = setup()
    const state = combobox.getState()
    expect(state.open).toBe(false)
    expect(state.activeKey).toBeUndefined()
    expect(state.selectedKeys).toEqual([])
    expect(state.inputValue).toBe('')
    expect(state.announcement).toBeUndefined()
  })

  test('typing opens the popup and filters, with no option active', () => {
    const { combobox, onOpenChange, onInputValueChange } = setup()
    combobox.actions.setInputValue('mal')
    const state = combobox.getState()
    expect(state.open).toBe(true)
    expect(state.inputValue).toBe('mal')
    expect(state.entries.map((entry) => entry.key)).toEqual(['Malmö'])
    expect(state.activeKey).toBeUndefined()
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(onInputValueChange).toHaveBeenCalledWith('mal', 'input')
  })

  test('typing clears the active option', () => {
    const { combobox, press } = setup()
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Stockholm')
    combobox.actions.setInputValue('s')
    expect(combobox.getActiveKey()).toBeUndefined()
  })

  test('ArrowDown on the closed field opens it and activates the first option', () => {
    const { combobox, press } = setup()
    expect(press('ArrowDown')).toEqual({ handled: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getActiveKey()).toBe('Stockholm')
  })

  test('ArrowUp on the closed field opens it and activates the last option', () => {
    const { combobox, press } = setup()
    expect(press('ArrowUp')).toEqual({ handled: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getActiveKey()).toBe('Uppsala')
  })

  test('ArrowDown and ArrowUp move through an open list and do not wrap', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('')
    combobox.actions.setOpen(true)
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Stockholm')
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Göteborg')
    press('ArrowUp')
    press('ArrowUp')
    expect(combobox.getActiveKey()).toBe('Stockholm')
    press('End')
    for (let index = 0; index < 6; index += 1) {
      press('ArrowDown')
    }
    expect(combobox.getActiveKey()).toBe('Uppsala')
  })

  test('the first ArrowDown in an open list with nothing active goes to the first option', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('ö')
    expect(combobox.getActiveKey()).toBeUndefined()
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Göteborg')
  })

  test('PageDown and PageUp move ten options in an open list', () => {
    const { combobox, press } = setup({ items: numbered })
    combobox.actions.setOpen(true)
    expect(press('PageDown')).toEqual({ handled: true })
    expect(combobox.getActiveKey()).toBe('Item 09')
    press('PageDown')
    press('PageDown')
    expect(combobox.getActiveKey()).toBe('Item 24')
    press('PageUp')
    expect(combobox.getActiveKey()).toBe('Item 14')
  })

  test('PageDown on a closed field is left to the browser', () => {
    const { press } = setup()
    expect(press('PageDown')).toEqual({ handled: false })
  })

  test('Home and End are left to the text field and leave no option active', () => {
    const { combobox, press } = setup()
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Stockholm')
    expect(press('Home')).toEqual({ handled: false })
    expect(combobox.getActiveKey()).toBeUndefined()
    press('ArrowDown')
    expect(press('End')).toEqual({ handled: false })
    expect(combobox.getActiveKey()).toBeUndefined()
    // The popup stays open: only the highlight goes.
    expect(combobox.getState().open).toBe(true)
  })

  test('ArrowLeft and ArrowRight, with or without Shift or Control, move the caret and leave no option active', () => {
    const { combobox, press } = setup()
    for (const key of ['ArrowLeft', 'ArrowRight']) {
      for (const modifiers of [{}, { shiftKey: true }, { ctrlKey: true }]) {
        press('ArrowDown')
        expect(combobox.getActiveKey()).toBeDefined()
        expect(press(key, modifiers)).toEqual({ handled: false })
        expect(combobox.getActiveKey()).toBeUndefined()
      }
    }
    press('ArrowDown')
    expect(press('Home', { shiftKey: true })).toEqual({ handled: false })
    expect(combobox.getActiveKey()).toBeUndefined()
  })

  test('Alt+ArrowLeft is the browser’s (back) and leaves the active option alone', () => {
    const { combobox, press } = setup()
    press('ArrowDown')
    expect(press('ArrowLeft', { altKey: true })).toEqual({ handled: false })
    expect(combobox.getActiveKey()).toBe('Stockholm')
  })

  test('Space is typed into the text field', () => {
    const { combobox, press } = setup()
    combobox.actions.setOpen(true)
    expect(press(' ')).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(true)
  })

  test('printable characters are typed into the text field', () => {
    const { press } = setup()
    expect(press('a')).toEqual({ handled: false })
  })

  test('the active option is cleared when the popup closes', () => {
    const { combobox, press } = setup()
    press('ArrowDown')
    press('Escape')
    expect(combobox.getActiveKey()).toBeUndefined()
  })

  test('pointer hover can set the active option', () => {
    const { combobox } = setup()
    expect(combobox.actions.setActiveKey('Malmö')).toBe(true)
    expect(combobox.getState().activeIndex).toBe(2)
    expect(combobox.actions.setActiveKey('Nowhere')).toBe(false)
  })
})

describe('combobox mode: choosing', () => {
  test('Enter with no active option selects nothing and is left to the browser', () => {
    const { combobox, press, onSelectedKeysChange } = setup()
    combobox.actions.setInputValue('s')
    expect(press('Enter')).toEqual({ handled: false })
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getState().inputValue).toBe('s')
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('Enter on the closed field is left to the browser', () => {
    const { combobox, press } = setup()
    expect(press('Enter')).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(false)
  })

  test('Enter on the active option selects it, shows its label and closes', () => {
    const { combobox, press, onSelectedKeysChange, onInputValueChange } = setup()
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    expect(press('Enter')).toEqual({ handled: true })
    const state = combobox.getState()
    expect(state.selectedKeys).toEqual(['Malmö'])
    expect(state.inputValue).toBe('Malmö')
    expect(state.open).toBe(false)
    expect(state.activeKey).toBeUndefined()
    expect(onSelectedKeysChange).toHaveBeenCalledWith(['Malmö'])
    expect(onInputValueChange).toHaveBeenLastCalledWith('Malmö', 'selection')
  })

  test('a click chooses an option', () => {
    const { combobox } = setup()
    combobox.actions.setOpen(true)
    expect(combobox.actions.selectOption('Örebro')).toBe(true)
    expect(combobox.getState().inputValue).toBe('Örebro')
    expect(combobox.getSelectedItems()).toEqual(['Örebro'])
  })

  test('after a choice the list is whole again when it opens', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    press('Enter')
    press('ArrowDown')
    const state = combobox.getState()
    expect(state.open).toBe(true)
    expect(state.size).toBe(5)
    expect(state.activeKey).toBe('Malmö')
  })

  test('a disabled option can be reached but not chosen, and Enter does not submit', () => {
    const { combobox, press, onSelectedKeysChange } = setup({
      isItemDisabled: (item) => item === 'Malmö',
    })
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Malmö')
    expect(press('Enter')).toEqual({ handled: true })
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().open).toBe(true)
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
    expect(combobox.actions.selectOption('Malmö')).toBe(false)
  })

  test('Alt+ArrowDown opens without moving the active option', () => {
    const { combobox, press } = setup()
    expect(press('ArrowDown', { altKey: true })).toEqual({ handled: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getActiveKey()).toBeUndefined()
  })

  test('Alt+ArrowUp selects the active option and closes', () => {
    const { combobox, press } = setup()
    combobox.actions.setOpen(true)
    press('ArrowDown')
    press('ArrowDown')
    expect(press('ArrowUp', { altKey: true })).toEqual({ handled: true })
    expect(combobox.getState().selectedKeys).toEqual(['Göteborg'])
    expect(combobox.getState().open).toBe(false)
  })

  test('Alt+ArrowUp with no active option only closes', () => {
    const { combobox, press } = setup()
    combobox.actions.setOpen(true)
    press('ArrowUp', { altKey: true })
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('Alt+ArrowUp on a closed field is left to the browser', () => {
    const { press } = setup()
    expect(press('ArrowUp', { altKey: true })).toEqual({ handled: false })
  })

  test('starts with the label of the selected option in the field', () => {
    const { combobox } = setup({ selectedKeys: ['Malmö'] })
    expect(combobox.getState().inputValue).toBe('Malmö')
    expect(combobox.getState().size).toBe(5)
  })
})

describe('combobox mode: Escape, Tab and typed text (no silent clear)', () => {
  test('Escape closes and keeps the typed text and the value', () => {
    const { combobox, press, onInputValueChange } = setup()
    combobox.actions.setInputValue('xyz')
    onInputValueChange.mockClear()
    expect(press('Escape')).toEqual({ handled: true })
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().inputValue).toBe('xyz')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(onInputValueChange).not.toHaveBeenCalled()
  })

  test('a second Escape does not clear the text and is left to the page', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('xyz')
    press('Escape')
    expect(press('Escape')).toEqual({ handled: false })
    expect(combobox.getState().inputValue).toBe('xyz')
  })

  test('Escape keeps a chosen value', () => {
    const { combobox, press } = setup({ selectedKeys: ['Malmö'] })
    press('ArrowDown')
    press('Escape')
    expect(combobox.getState().selectedKeys).toEqual(['Malmö'])
    expect(combobox.getState().inputValue).toBe('Malmö')
  })

  test('Tab closes without selecting and moves on', () => {
    const { combobox, press, onSelectedKeysChange } = setup()
    combobox.actions.setInputValue('s')
    press('ArrowDown')
    expect(press('Tab')).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().inputValue).toBe('s')
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('Shift+Tab does the same', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('s')
    press('ArrowDown')
    expect(press('Tab', { shiftKey: true })).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('text that matches no option is kept after leaving, and the value stays null', () => {
    const { combobox, press, onSelectedKeysChange } = setup()
    combobox.actions.setInputValue('Narnia')
    expect(combobox.getState().size).toBe(0)
    press('Tab')
    expect(combobox.getState().inputValue).toBe('Narnia')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getSelectedItems()).toEqual([])
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('editing away from the chosen label makes the value null and keeps the text', () => {
    const { combobox, press, onSelectedKeysChange } = setup()
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    press('Enter')
    combobox.actions.setInputValue('Malm')
    expect(combobox.getState().inputValue).toBe('Malm')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith([])
  })

  test('the Clear button empties the text and the value', () => {
    const { combobox, onInputValueChange, onSelectedKeysChange } = setup({
      selectedKeys: ['Malmö'],
    })
    combobox.actions.clear()
    expect(combobox.getState().inputValue).toBe('')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(onInputValueChange).toHaveBeenCalledWith('', 'clear')
    expect(onSelectedKeysChange).toHaveBeenCalledWith([])
  })

  test('shortcuts with Control or Command are left alone', () => {
    const { combobox, press } = setup()
    expect(press('ArrowDown', { ctrlKey: true })).toEqual({ handled: false })
    expect(press('ArrowDown', { metaKey: true })).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(false)
  })

  test('Shift with a named key is left to the text field', () => {
    const { combobox, press } = setup()
    expect(press('ArrowDown', { shiftKey: true })).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(false)
  })
})

describe('combobox mode: controlled value', () => {
  test('setSelectedKeys shows the label of a new value', () => {
    const { combobox, onSelectedKeysChange } = setup()
    combobox.actions.setSelectedKeys(['Uppsala'])
    expect(combobox.getState().selectedKeys).toEqual(['Uppsala'])
    expect(combobox.getState().inputValue).toBe('Uppsala')
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('setSelectedKeys with an empty value does not clear the text', () => {
    const { combobox } = setup()
    combobox.actions.setInputValue('Narnia')
    combobox.actions.setSelectedKeys([])
    expect(combobox.getState().inputValue).toBe('Narnia')
  })
})

describe('filtering', () => {
  test('uses the locale: å, ä and ö stay distinct in Swedish', () => {
    const { combobox } = setup({ items: ['Älmhult', 'Alvesta', 'Örebro', 'Orsa'] })
    combobox.actions.setInputValue('ä')
    expect(combobox.getState().entries.map((entry) => entry.key)).toEqual(['Älmhult'])
    combobox.actions.setInputValue('o')
    expect(combobox.getState().entries.map((entry) => entry.key)).toEqual(['Örebro', 'Orsa'])
  })

  test('uses the locale: accents are ignored in English', () => {
    const { combobox } = setup({ items: ['Älmhult', 'Alvesta', 'Orsa'], locale: 'en' })
    combobox.actions.setInputValue('a')
    expect(combobox.getState().entries.map((entry) => entry.key)).toEqual([
      'Älmhult',
      'Alvesta',
      'Orsa',
    ])
  })

  test('uses the locale: ä and ö stay distinct in Finnish', () => {
    const { combobox } = setup({ items: ['Äänekoski', 'Alajärvi', 'Oulu'], locale: 'fi' })
    combobox.actions.setInputValue('ää')
    expect(combobox.getState().entries.map((entry) => entry.key)).toEqual(['Äänekoski'])
  })

  test('an emptied field shows the whole list again', () => {
    const { combobox } = setup()
    combobox.actions.setInputValue('mal')
    combobox.actions.setInputValue('')
    expect(combobox.getState().size).toBe(5)
  })

  test('a custom filter replaces the default', () => {
    const { combobox } = setup({ filter: (item, query) => item.startsWith(query) })
    combobox.actions.setInputValue('al')
    expect(combobox.getState().size).toBe(0)
    combobox.actions.setInputValue('Mal')
    expect(combobox.getState().size).toBe(1)
  })

  test('filter: false keeps the list as it is, for server-side results', () => {
    const { combobox } = setup({ filter: false })
    combobox.actions.setInputValue('zzz')
    expect(combobox.getState().size).toBe(5)
  })

  test('groups are filtered and empty groups drop out', () => {
    const { combobox } = setup({
      items: undefined,
      groups: [
        { key: 'east', label: 'East', items: ['Stockholm', 'Uppsala'] },
        { key: 'west', label: 'West', items: ['Göteborg'] },
      ],
    })
    combobox.actions.setInputValue('gö')
    const state = combobox.getState()
    expect(state.sections?.map((section) => section.key)).toEqual(['west'])
    expect(state.size).toBe(1)
  })

  test('setItems filters the new list by the current text', () => {
    const { combobox } = setup()
    combobox.actions.setInputValue('s')
    combobox.actions.setItems(['Sundsvall', 'Malmö'])
    expect(combobox.getState().entries.map((entry) => entry.key)).toEqual(['Sundsvall'])
  })

  test('setItems clears the active option when it is gone', () => {
    const { combobox } = setup()
    combobox.actions.setOpen(true)
    combobox.actions.setActiveKey('Malmö')
    combobox.actions.setItems(['Sundsvall'])
    expect(combobox.getActiveKey()).toBeUndefined()
  })

  test('a chosen item stays available when the filter hides it', () => {
    const { combobox } = setup({ multiple: true })
    combobox.actions.setOpen(true)
    combobox.actions.selectOption('Malmö')
    combobox.actions.setInputValue('stock')
    expect(combobox.getState().size).toBe(1)
    expect(combobox.getSelectedItems()).toEqual(['Malmö'])
    combobox.actions.setItems(['Sundsvall'])
    expect(combobox.getSelectedItems()).toEqual(['Malmö'])
  })
})

describe('announcements', () => {
  test('the debounce is about half a second', () => {
    expect(announcementDebounceMilliseconds).toBe(500)
  })

  test('says how many results there are while the popup is open', () => {
    const { combobox } = setup()
    combobox.actions.setInputValue('s')
    expect(combobox.getState().announcement).toEqual({ kind: 'resultCount', count: 2 })
    combobox.actions.setInputValue('')
    expect(combobox.getState().announcement).toEqual({ kind: 'resultCount', count: 5 })
  })

  test('says there are no results', () => {
    const { combobox } = setup()
    combobox.actions.setInputValue('zzz')
    expect(combobox.getState().announcement).toEqual({ kind: 'noResults' })
  })

  test('says that results are loading, and then how many', () => {
    const { combobox } = setup({ filter: false })
    combobox.actions.setOpen(true)
    combobox.actions.setLoading(true)
    expect(combobox.getState().announcement).toEqual({ kind: 'loading' })
    combobox.actions.setItems(['Sundsvall'])
    combobox.actions.setLoading(false)
    expect(combobox.getState().announcement).toEqual({ kind: 'resultCount', count: 1 })
  })

  test('says nothing while the popup is closed', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('s')
    press('Escape')
    expect(combobox.getState().announcement).toBeUndefined()
  })

  test('keeps the same object while nothing changes, so a binding does not announce twice', () => {
    const { combobox, press } = setup()
    combobox.actions.setInputValue('s')
    const before = combobox.getState().announcement
    press('ArrowDown')
    expect(combobox.getState().announcement).toBe(before)
  })

  test('never announces the active option', () => {
    const { combobox, press } = setup()
    combobox.actions.setOpen(true)
    press('ArrowDown')
    expect(combobox.getState().announcement).toEqual({ kind: 'resultCount', count: 5 })
  })
})

describe('multiple', () => {
  test('choosing adds a value, keeps the popup open and empties the text', () => {
    const { combobox, press, onSelectedKeysChange } = setup({ multiple: true })
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    expect(press('Enter')).toEqual({ handled: true })
    const state = combobox.getState()
    expect(state.selectedKeys).toEqual(['Malmö'])
    expect(state.open).toBe(true)
    expect(state.inputValue).toBe('')
    expect(state.size).toBe(5)
    expect(onSelectedKeysChange).toHaveBeenCalledWith(['Malmö'])
  })

  test('choosing a chosen option again removes it', () => {
    const { combobox } = setup({ multiple: true, selectedKeys: ['Malmö', 'Örebro'] })
    combobox.actions.setOpen(true)
    combobox.actions.selectOption('Malmö')
    expect(combobox.getState().selectedKeys).toEqual(['Örebro'])
  })

  test('typing never changes the value', () => {
    const { combobox, onSelectedKeysChange } = setup({ multiple: true, selectedKeys: ['Malmö'] })
    combobox.actions.setInputValue('xyz')
    expect(combobox.getState().selectedKeys).toEqual(['Malmö'])
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('Alt+ArrowUp adds the active option and closes, and never removes a chosen one', () => {
    const { combobox, press } = setup({ multiple: true, selectedKeys: ['Stockholm'] })
    combobox.actions.setOpen(true)
    combobox.actions.setActiveKey('Stockholm')
    press('ArrowUp', { altKey: true })
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm'])
    expect(combobox.getState().open).toBe(false)
    combobox.actions.setOpen(true)
    combobox.actions.setActiveKey('Malmö')
    press('ArrowUp', { altKey: true })
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm', 'Malmö'])
  })

  test('Tab closes and does not change the value', () => {
    const { combobox, press } = setup({ multiple: true })
    combobox.actions.setOpen(true)
    press('ArrowDown')
    press('Tab')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().open).toBe(false)
  })

  test('removing a value sends focus to the next remove button', () => {
    const { combobox } = setup({ multiple: true, selectedKeys: ['Stockholm', 'Malmö', 'Örebro'] })
    expect(combobox.actions.removeValue('Malmö')).toEqual({
      removed: true,
      focusTarget: { type: 'removeButton', key: 'Örebro' },
    })
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm', 'Örebro'])
  })

  test('removing the last value sends focus to the previous remove button', () => {
    const { combobox } = setup({ multiple: true, selectedKeys: ['Stockholm', 'Malmö', 'Örebro'] })
    expect(combobox.actions.removeValue('Örebro').focusTarget).toEqual({
      type: 'removeButton',
      key: 'Malmö',
    })
  })

  test('removing the only value sends focus to the input', () => {
    const { combobox } = setup({ multiple: true, selectedKeys: ['Malmö'] })
    expect(combobox.actions.removeValue('Malmö')).toEqual({
      removed: true,
      focusTarget: { type: 'input' },
    })
  })

  test('removing a value that is not chosen changes nothing', () => {
    const { combobox, onSelectedKeysChange } = setup({ multiple: true, selectedKeys: ['Malmö'] })
    expect(combobox.actions.removeValue('Örebro')).toEqual({
      removed: false,
      focusTarget: { type: 'input' },
    })
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('removal works on a value the filter hides', () => {
    const { combobox } = setup({ multiple: true, selectedKeys: ['Malmö', 'Örebro'] })
    combobox.actions.setInputValue('stock')
    expect(combobox.actions.removeValue('Malmö').removed).toBe(true)
  })

  test('Backspace in the field does not remove a value', () => {
    const { combobox, press } = setup({ multiple: true, selectedKeys: ['Malmö'] })
    expect(press('Backspace')).toEqual({ handled: false })
    expect(combobox.getState().selectedKeys).toEqual(['Malmö'])
  })
})

describe('autocomplete mode', () => {
  test('typing opens the suggestions and the value is the text', () => {
    const { combobox, onSelectedKeysChange } = setup({ mode: 'autocomplete' })
    combobox.actions.setInputValue('mal')
    const state = combobox.getState()
    expect(state.open).toBe(true)
    expect(state.inputValue).toBe('mal')
    expect(state.entries.map((entry) => entry.key)).toEqual(['Malmö'])
    expect(state.selectedKeys).toEqual([])
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('emptying the text closes the suggestions', () => {
    const { combobox } = setup({ mode: 'autocomplete' })
    combobox.actions.setInputValue('mal')
    combobox.actions.setInputValue('')
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().announcement).toBeUndefined()
  })

  test('picking a suggestion fills the input and closes, with no value', () => {
    const { combobox, press, onSelectedKeysChange, onInputValueChange } = setup({
      mode: 'autocomplete',
    })
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    expect(press('Enter')).toEqual({ handled: true })
    expect(combobox.getState().inputValue).toBe('Malmö')
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(onInputValueChange).toHaveBeenLastCalledWith('Malmö', 'selection')
    expect(onSelectedKeysChange).not.toHaveBeenCalled()
  })

  test('Enter with no suggestion active is left to the browser, so other text can be submitted', () => {
    const { combobox, press } = setup({ mode: 'autocomplete' })
    combobox.actions.setInputValue('mal')
    expect(press('Enter')).toEqual({ handled: false })
    expect(combobox.getState().inputValue).toBe('mal')
  })

  test('free text is kept through Escape and Tab', () => {
    const { combobox, press } = setup({ mode: 'autocomplete' })
    combobox.actions.setInputValue('Narnia')
    press('Escape')
    press('Tab')
    expect(combobox.getState().inputValue).toBe('Narnia')
  })

  test('multiple is ignored', () => {
    const { combobox } = setup({ mode: 'autocomplete', multiple: true })
    expect(combobox.multiple).toBe(false)
  })

  test('Tab does not pick a suggestion', () => {
    const { combobox, press } = setup({ mode: 'autocomplete' })
    combobox.actions.setInputValue('mal')
    press('ArrowDown')
    press('Tab')
    expect(combobox.getState().inputValue).toBe('mal')
  })
})

describe('listbox mode (select-only)', () => {
  test('has no text field and no filtering', () => {
    const { combobox } = setup({ mode: 'listbox' })
    combobox.actions.setInputValue('mal')
    expect(combobox.getState().inputValue).toBe('')
    expect(combobox.getState().size).toBe(5)
    expect(combobox.getState().announcement).toBeUndefined()
  })

  test.each(['Enter', ' ', 'ArrowDown'])('%j on the closed trigger opens it', (key) => {
    const { combobox, press } = setup({ mode: 'listbox' })
    expect(press(key)).toEqual({ handled: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getActiveKey()).toBe('Stockholm')
  })

  test('opening activates the selected option', () => {
    const { combobox, press } = setup({ mode: 'listbox', selectedKeys: ['Malmö'] })
    press('ArrowDown')
    expect(combobox.getActiveKey()).toBe('Malmö')
  })

  test('ArrowUp on the closed trigger opens it and activates the last option', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    press('ArrowUp')
    expect(combobox.getActiveKey()).toBe('Uppsala')
  })

  test('Home and End go to the first and last option', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    combobox.actions.setOpen(true)
    expect(press('End')).toEqual({ handled: true })
    expect(combobox.getActiveKey()).toBe('Uppsala')
    expect(press('Home')).toEqual({ handled: true })
    expect(combobox.getActiveKey()).toBe('Stockholm')
  })

  test('PageDown moves ten options', () => {
    const { combobox, press } = setup({ mode: 'listbox', items: numbered })
    combobox.actions.setOpen(true)
    press('PageDown')
    expect(combobox.getActiveKey()).toBe('Item 09')
  })

  test('Enter selects the active option and closes', () => {
    const { combobox, press, onSelectedKeysChange } = setup({ mode: 'listbox' })
    press('ArrowDown')
    press('ArrowDown')
    expect(press('Enter')).toEqual({ handled: true })
    expect(combobox.getState().selectedKeys).toEqual(['Göteborg'])
    expect(combobox.getState().open).toBe(false)
    expect(combobox.getState().inputValue).toBe('')
    expect(onSelectedKeysChange).toHaveBeenCalledWith(['Göteborg'])
  })

  test('Space selects the active option and closes', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    press('ArrowDown')
    expect(press(' ')).toEqual({ handled: true })
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm'])
    expect(combobox.getState().open).toBe(false)
  })

  test('Tab selects the active option and moves on', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    press('ArrowDown')
    press('ArrowDown')
    expect(press('Tab')).toEqual({ handled: false })
    expect(combobox.getState().selectedKeys).toEqual(['Göteborg'])
    expect(combobox.getState().open).toBe(false)
  })

  test('Shift+Tab selects the active option and moves on, backwards', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    press('ArrowDown')
    expect(press('Tab', { shiftKey: true })).toEqual({ handled: false })
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm'])
  })

  test('Tab with no active option selects nothing', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    combobox.actions.setOpen(true)
    press('Tab')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().open).toBe(false)
  })

  test('Tab does not select a disabled option', () => {
    const { combobox, press } = setup({
      mode: 'listbox',
      isItemDisabled: (item) => item === 'Stockholm',
    })
    press('ArrowDown')
    press('Tab')
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('Escape closes and keeps the value', () => {
    const { combobox, press } = setup({ mode: 'listbox', selectedKeys: ['Malmö'] })
    press('ArrowDown')
    press('ArrowDown')
    expect(press('Escape')).toEqual({ handled: true })
    expect(combobox.getState().selectedKeys).toEqual(['Malmö'])
    expect(combobox.getState().open).toBe(false)
  })

  test('Alt+ArrowDown opens without moving, and Alt+ArrowUp selects and closes', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    press('ArrowDown', { altKey: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getActiveKey()).toBeUndefined()
    press('ArrowDown')
    press('ArrowUp', { altKey: true })
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm'])
    expect(combobox.getState().open).toBe(false)
  })

  test('printable characters open the list and jump by typeahead', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    expect(press('m')).toEqual({ handled: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getActiveKey()).toBe('Malmö')
  })

  test('typeahead is locale-aware', () => {
    const items = ['Zlatan', 'Örebro', 'Orsa']
    const withO = setup({ mode: 'listbox', items })
    withO.press('o')
    expect(withO.combobox.getActiveKey()).toBe('Orsa')
    const withUmlaut = setup({ mode: 'listbox', items })
    withUmlaut.press('ö')
    expect(withUmlaut.combobox.getActiveKey()).toBe('Örebro')
  })

  test('typeahead does not select', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    press('m')
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('a space inside a typeahead word does not select', () => {
    const { combobox, press } = setup({ mode: 'listbox', items: ['Newark', 'New York'] })
    for (const key of ['n', 'e', 'w', ' ']) {
      press(key)
    }
    expect(combobox.getActiveKey()).toBe('New York')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().open).toBe(true)
  })

  test('Space with no active option selects nothing but is still handled, so the page does not scroll', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    combobox.actions.setOpen(true)
    expect(press(' ')).toEqual({ handled: true })
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('Enter with no active option selects nothing', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    combobox.actions.setOpen(true)
    expect(press('Enter')).toEqual({ handled: false })
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('multiple: Space toggles and the popup stays open', () => {
    const { combobox, press } = setup({ mode: 'listbox', multiple: true })
    press('ArrowDown')
    press(' ')
    expect(combobox.getState().selectedKeys).toEqual(['Stockholm'])
    expect(combobox.getState().open).toBe(true)
    press(' ')
    expect(combobox.getState().selectedKeys).toEqual([])
  })

  test('multiple: Tab closes and does not change the selection', () => {
    const { combobox, press } = setup({ mode: 'listbox', multiple: true })
    press('ArrowDown')
    press('Tab')
    expect(combobox.getState().selectedKeys).toEqual([])
    expect(combobox.getState().open).toBe(false)
  })

  test('typing with Control or Alt is not typeahead', () => {
    const { combobox, press } = setup({ mode: 'listbox' })
    expect(press('m', { ctrlKey: true })).toEqual({ handled: false })
    expect(press('m', { altKey: true })).toEqual({ handled: false })
    expect(combobox.getState().open).toBe(false)
  })
})

describe('open state', () => {
  test('setOpen reports changes only', () => {
    const { combobox, onOpenChange } = setup()
    combobox.actions.setOpen(true)
    combobox.actions.setOpen(true)
    combobox.actions.toggleOpen()
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  test('can start open', () => {
    const { combobox } = setup({ defaultOpen: true })
    expect(combobox.getState().open).toBe(true)
    expect(combobox.getState().announcement).toEqual({ kind: 'resultCount', count: 5 })
  })

  test('state exposes the list size and active key for a virtualizer', () => {
    const { combobox } = setup()
    combobox.actions.setInputValue('stock')
    expect(combobox.getSize()).toBe(1)
    combobox.actions.setActiveKey('Stockholm')
    expect(combobox.getRequiredRenderKeys()).toEqual(['Stockholm'])
  })

  test('subscribers hear about changes', () => {
    const { combobox } = setup()
    const listener = vi.fn<(...args: unknown[]) => void>()
    combobox.subscribe(listener)
    combobox.actions.setOpen(true)
    expect(listener).toHaveBeenCalled()
  })

  test('works with objects, itemToString and itemToKey', () => {
    const combobox = createCombobox({
      items: [
        { code: '0180', name: 'Stockholm' },
        { code: '1480', name: 'Göteborg' },
      ],
      itemToString: (municipality) => municipality.name,
      itemToKey: (municipality) => municipality.code,
      locale: 'sv',
    })
    combobox.actions.setInputValue('gö')
    combobox.actions.selectOption('1480')
    expect(combobox.getState().inputValue).toBe('Göteborg')
    expect(combobox.getSelectedKeys()).toEqual(['1480'])
    expect(combobox.getSelectedItems()).toEqual([{ code: '1480', name: 'Göteborg' }])
  })
})
