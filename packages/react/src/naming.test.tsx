import type { FileUploadEntry, FileUploadItem } from '@kvirn-ui/core'
import type { ComponentProps } from 'react'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import * as api from './index.ts'

// The naming rules for compound components (api-conventions skill), checked over the public entry:
// a component with parts is a namespace (`X.Root` + `X.Part`), a single element is flat, a part of
// another component is aliased onto its parent under its own display name, and every part also has
// a flat named export (`FieldRoot`, `CardHeader`) for React Server Components, which can't dot
// into a client module.

// The deprecated names, in one place. They keep working until 1.0 and are skipped by the checks
// that would otherwise fail on them.
/** Bare generic exports, replaced by the namespace part named here. */
const deprecatedExports: Record<string, string> = {
  Label: 'Field.Label',
  ErrorMessage: 'Field.ErrorMessage',
  Legend: 'Fieldset.Legend',
}
/** Bare exports whose namespace part is a wrapper around them, so not the same component. */
const deprecatedWrappedExports: Record<string, string> = {
  Radio: 'RadioGroup.Radio',
}
/** `<Export>.<Key>` aliases on single-element components. A Prose and a Section are one element. */
const deprecatedKeys = ['Prose.Root', 'Section.Root']

type Entry = [name: string, value: unknown]

const exportEntries = Object.entries(api) as Entry[]

function isComponent(value: unknown): value is { displayName?: unknown } {
  if (typeof value === 'function') {
    return true
  }
  return typeof value === 'object' && value !== null && '$$typeof' in value
}

function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name)
}

/** The parts of a namespace object or a callable root: its capitalised component properties. */
function partsOf(value: unknown): Entry[] {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    return []
  }
  return Object.entries(value).filter(([key, part]) => isComponentName(key) && isComponent(part))
}

/**
 * The namespaces: every capitalised export that has parts. A callable root is exported twice
 * (`Field` and `FieldRoot` are one function), so only the shortest name of each is a namespace.
 */
function namespaces(): Array<{ name: string; value: unknown; parts: Entry[] }> {
  const byValue = new Map<unknown, string>()
  for (const [name, value] of exportEntries) {
    if (!isComponentName(name) || partsOf(value).length === 0) {
      continue
    }
    const known = byValue.get(value)
    if (known === undefined || name.length < known.length) {
      byValue.set(value, name)
    }
  }
  return [...byValue].map(([value, name]) => ({ name, value, parts: partsOf(value) }))
}

describe('display names', () => {
  test('every exported component has a display name', () => {
    const missing: string[] = []
    for (const [name, value] of exportEntries) {
      if (isComponentName(name) && isComponent(value)) {
        if (typeof value.displayName !== 'string' || value.displayName === '') {
          missing.push(name)
        }
      }
    }
    expect(missing).toEqual([])
  })

  test('every part of a namespace or callable root is named <Export>.<Key>, except deprecated keys', () => {
    const wrong: string[] = []
    for (const { name, parts } of namespaces()) {
      for (const [key, part] of parts) {
        if (deprecatedKeys.includes(`${name}.${key}`)) {
          continue
        }
        const displayName = (part as { displayName?: unknown }).displayName
        if (displayName !== `${name}.${key}`) {
          wrong.push(`${name}.${key} has displayName ${String(displayName)}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })

  test('a callable root is named after its Root: Field.Root, Fieldset.Root, Link.Root', () => {
    expect(api.Field.displayName).toBe('Field.Root')
    expect(api.Fieldset.displayName).toBe('Fieldset.Root')
    expect(api.Link.displayName).toBe('Link.Root')
    expect(api.Link.NewTabNotice.displayName).toBe('Link.NewTabNotice')
    expect(api.Link.Icon.displayName).toBe('Link.Icon')
  })

  test('single elements are named flat', () => {
    expect(api.Button.displayName).toBe('Button')
    expect(api.Heading.displayName).toBe('Heading')
    expect(api.Badge.displayName).toBe('Badge')
    expect(api.Kbd.displayName).toBe('Kbd')
    expect(api.CopyButton.displayName).toBe('CopyButton')
    expect(api.SkipLink.displayName).toBe('SkipLink')
    expect(api.VisuallyHidden.displayName).toBe('VisuallyHidden')
    expect(api.Icon.displayName).toBe('Icon')
    expect(api.TextInput.displayName).toBe('TextInput')
    expect(api.NumberInput.displayName).toBe('NumberInput')
    expect(api.Textarea.displayName).toBe('Textarea')
    expect(api.CharacterCount.displayName).toBe('CharacterCount')
    expect(api.Checkbox.displayName).toBe('Checkbox')
    expect(api.Toggle.displayName).toBe('Toggle')
    expect(api.ButtonGroup.displayName).toBe('ButtonGroup')
    expect(api.Prose.displayName).toBe('Prose')
    expect(api.Section.displayName).toBe('Section')
    expect(api.Container.displayName).toBe('Container')
    expect(api.Stack.displayName).toBe('Stack')
    expect(api.Columns.displayName).toBe('Columns')
  })

  test('a part aliased onto its parent has its own name, not the source component’s', () => {
    expect(api.Combobox.Option.displayName).toBe('Combobox.Option')
    expect(api.Autocomplete.Control.displayName).toBe('Autocomplete.Control')
    expect(api.Autocomplete.Option.displayName).toBe('Autocomplete.Option')
    expect(api.Field.Prose.displayName).toBe('Field.Prose')
    expect(api.Fieldset.Prose.displayName).toBe('Fieldset.Prose')
    expect(api.Field.HelpText.displayName).toBe('Field.HelpText')
    expect(api.Fieldset.HelpText.displayName).toBe('Fieldset.HelpText')
    expect(api.CheckboxGroup.HelpText.displayName).toBe('CheckboxGroup.HelpText')
    expect(api.RadioGroup.HelpText.displayName).toBe('RadioGroup.HelpText')
    expect(api.CheckboxGroup.Legend.displayName).toBe('CheckboxGroup.Legend')
    expect(api.RadioGroup.Radio.displayName).toBe('RadioGroup.Radio')
    expect(api.InputGroup.Input.displayName).toBe('InputGroup.Input')
    expect(api.Toolbar.Group.displayName).toBe('Toolbar.Group')
    expect(api.Toolbar.Group).not.toBe(api.ButtonGroup)
    expect(api.Combobox.Option).not.toBe(api.Listbox.Option)
    expect(api.Autocomplete.Option).not.toBe(api.Combobox.Option)
    expect(api.Field.Prose).not.toBe(api.Prose)
    expect(api.Fieldset.HelpText).not.toBe(api.Field.HelpText)
  })
})

describe('single elements', () => {
  test('have no .Root other than the deprecated ones', () => {
    const roots: string[] = []
    for (const { name, parts } of namespaces()) {
      const isOnlyRoot = parts.length === 1 && parts[0]?.[0] === 'Root'
      if (isOnlyRoot && !deprecatedKeys.includes(`${name}.Root`)) {
        roots.push(`${name}.Root`)
      }
    }
    expect(roots).toEqual([])
  })

  test('the deprecated keys are exactly the ones on the allowlist', () => {
    expect(api.Prose.Root).toBe(api.ProseRoot)
    expect(api.Section.Root).toBe(api.SectionRoot)
    expect(deprecatedKeys).toEqual(['Prose.Root', 'Section.Root'])
  })
})

describe('flat part exports', () => {
  test('every part of a namespace has a flat export <Export><Key> that is the same component', () => {
    const exported = new Map(exportEntries)
    const missing: string[] = []
    for (const { name, parts } of namespaces()) {
      for (const [key, part] of parts) {
        if (deprecatedKeys.includes(`${name}.${key}`)) {
          continue
        }
        const flat = exported.get(`${name}${key}`)
        if (flat !== part) {
          missing.push(`${name}${key}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  test('the deprecated bare names are the same components as their namespace parts', () => {
    const exported = new Map(exportEntries)
    for (const [bare, path] of Object.entries(deprecatedExports)) {
      const [namespace, key] = path.split('.')
      expect(exported.get(bare)).toBe(
        Reflect.get(exported.get(namespace ?? '') as object, key ?? ''),
      )
    }
  })

  test('the deprecated wrapped names have a namespace part that replaces them', () => {
    const exported = new Map(exportEntries)
    for (const [bare, path] of Object.entries(deprecatedWrappedExports)) {
      const [namespace, key] = path.split('.')
      const part = Reflect.get(exported.get(namespace ?? '') as object, key ?? '') as {
        displayName?: string
      }
      expect(exported.get(bare)).toBeDefined()
      expect(part.displayName).toBe(path)
    }
  })

  test('Navigation is a namespace of its own parts, not a callable root', () => {
    expect(api.Navigation.Root.displayName).toBe('Navigation.Root')
    expect(api.Navigation.List.displayName).toBe('Navigation.List')
    expect(api.Navigation.Item.displayName).toBe('Navigation.Item')
    expect(api.Navigation.Label.displayName).toBe('Navigation.Label')
    expect(typeof api.Navigation).toBe('object')
  })

  test('TableOfContents is a namespace of its own parts, not a callable root', () => {
    expect(api.TableOfContents.Root.displayName).toBe('TableOfContents.Root')
    expect(api.TableOfContents.List.displayName).toBe('TableOfContents.List')
    expect(api.TableOfContents.Item.displayName).toBe('TableOfContents.Item')
    expect(api.TableOfContents.Link.displayName).toBe('TableOfContents.Link')
    expect(typeof api.TableOfContents).toBe('object')
  })

  test('Tabs is a namespace of its own parts, not a callable root', () => {
    expect(api.Tabs.Root.displayName).toBe('Tabs.Root')
    expect(api.Tabs.List.displayName).toBe('Tabs.List')
    expect(api.Tabs.Tab.displayName).toBe('Tabs.Tab')
    expect(api.Tabs.Panel.displayName).toBe('Tabs.Panel')
    expect(typeof api.Tabs).toBe('object')
  })

  test('Disclosure and Accordion are namespaces of their own parts, not callable roots', () => {
    expect(api.Disclosure.Root.displayName).toBe('Disclosure.Root')
    expect(api.Disclosure.Trigger.displayName).toBe('Disclosure.Trigger')
    expect(api.Disclosure.Panel.displayName).toBe('Disclosure.Panel')
    expect(api.Accordion.Root.displayName).toBe('Accordion.Root')
    expect(api.Accordion.Item.displayName).toBe('Accordion.Item')
    expect(api.Accordion.Heading.displayName).toBe('Accordion.Heading')
    expect(api.Accordion.Trigger.displayName).toBe('Accordion.Trigger')
    expect(api.Accordion.Panel.displayName).toBe('Accordion.Panel')
    expect(api.Accordion.Trigger).not.toBe(api.Disclosure.Trigger)
    expect(typeof api.Disclosure).toBe('object')
    expect(typeof api.Accordion).toBe('object')
  })

  test('Dialog and AlertDialog are namespaces of their own parts, not callable roots', () => {
    expect(api.Dialog.Root.displayName).toBe('Dialog.Root')
    expect(api.Dialog.Trigger.displayName).toBe('Dialog.Trigger')
    expect(api.Dialog.Popup.displayName).toBe('Dialog.Popup')
    expect(api.Dialog.Title.displayName).toBe('Dialog.Title')
    expect(api.Dialog.Description.displayName).toBe('Dialog.Description')
    expect(api.Dialog.Body.displayName).toBe('Dialog.Body')
    expect(api.Dialog.Actions.displayName).toBe('Dialog.Actions')
    expect(api.Dialog.Close.displayName).toBe('Dialog.Close')
    expect(api.AlertDialog.Root.displayName).toBe('AlertDialog.Root')
    expect(api.AlertDialog.Popup.displayName).toBe('AlertDialog.Popup')
    expect(api.AlertDialog.Close.displayName).toBe('AlertDialog.Close')
    expect(api.AlertDialog.Popup).not.toBe(api.Dialog.Popup)
    expect(typeof api.Dialog).toBe('object')
    expect(typeof api.AlertDialog).toBe('object')
  })

  test('Breadcrumb and Pagination are namespaces of their own parts, not callable roots', () => {
    expect(api.Breadcrumb.Root.displayName).toBe('Breadcrumb.Root')
    expect(api.Breadcrumb.Link.displayName).toBe('Breadcrumb.Link')
    expect(api.Breadcrumb.Current.displayName).toBe('Breadcrumb.Current')
    expect(api.Pagination.Root.displayName).toBe('Pagination.Root')
    expect(api.Pagination.Link.displayName).toBe('Pagination.Link')
    expect(api.Pagination.Previous.displayName).toBe('Pagination.Previous')
    expect(api.Pagination.Next.displayName).toBe('Pagination.Next')
    expect(typeof api.Breadcrumb).toBe('object')
    expect(typeof api.Pagination).toBe('object')
  })

  test('callable roots stay callable and are the same function as their Root', () => {
    expect(api.Field).toBe(api.Field.Root)
    expect(api.Fieldset).toBe(api.Fieldset.Root)
    expect(api.Link).toBe(api.Link.Root)
  })
})

describe('alias sets', () => {
  test('each parent offers the parts of its decided alias set', () => {
    const keys = (value: unknown) => partsOf(value).map(([key]) => key)
    expect(keys(api.Field)).toEqual(
      expect.arrayContaining(['Root', 'Label', 'Prose', 'HelpText', 'ErrorMessage']),
    )
    expect(keys(api.Fieldset)).toEqual(
      expect.arrayContaining(['Root', 'Legend', 'Prose', 'HelpText', 'ErrorMessage']),
    )
    expect(keys(api.CheckboxGroup)).toEqual(
      expect.arrayContaining(['Root', 'Legend', 'Prose', 'HelpText', 'ErrorMessage']),
    )
    expect(keys(api.RadioGroup)).toEqual(
      expect.arrayContaining(['Root', 'Radio', 'Legend', 'Prose', 'HelpText', 'ErrorMessage']),
    )
    expect(keys(api.InputGroup)).toEqual(expect.arrayContaining(['Root', 'Addon', 'Input']))
    expect(keys(api.Link)).toEqual(expect.arrayContaining(['Root', 'NewTabNotice', 'Icon']))
    expect(keys(api.Navigation)).toEqual(expect.arrayContaining(['Root', 'List', 'Item', 'Label']))
    expect(keys(api.TableOfContents)).toEqual(
      expect.arrayContaining(['Root', 'List', 'Item', 'Link']),
    )
    expect(keys(api.Tabs)).toEqual(expect.arrayContaining(['Root', 'List', 'Tab', 'Panel']))
    expect(keys(api.Breadcrumb)).toEqual(
      expect.arrayContaining(['Root', 'List', 'Item', 'Link', 'Current']),
    )
    expect(keys(api.Pagination)).toEqual(
      expect.arrayContaining([
        'Root',
        'List',
        'Item',
        'Link',
        'Previous',
        'Next',
        'Ellipsis',
        'Status',
      ]),
    )
    expect(keys(api.Disclosure)).toEqual(expect.arrayContaining(['Root', 'Trigger', 'Panel']))
    expect(keys(api.Accordion)).toEqual(
      expect.arrayContaining(['Root', 'Item', 'Heading', 'Trigger', 'Panel']),
    )
    expect(keys(api.Alert)).toEqual(
      expect.arrayContaining([
        'Root',
        'Info',
        'Success',
        'Warning',
        'Danger',
        'Title',
        'Body',
        'Actions',
        'Close',
      ]),
    )
    expect(keys(api.Toolbar)).toEqual(
      expect.arrayContaining(['Root', 'Button', 'Toggle', 'Item', 'Group']),
    )
    expect(keys(api.Dialog)).toEqual(
      expect.arrayContaining([
        'Root',
        'Trigger',
        'Popup',
        'Title',
        'Description',
        'Body',
        'Actions',
        'Close',
      ]),
    )
    expect(keys(api.AlertDialog)).toEqual(
      expect.arrayContaining([
        'Root',
        'Trigger',
        'Popup',
        'Title',
        'Description',
        'Body',
        'Actions',
        'Close',
      ]),
    )
    expect(keys(api.Tooltip)).toEqual(
      expect.arrayContaining(['Root', 'Trigger', 'Popup', 'Name', 'Shortcut']),
    )
  })
})

describe('types', () => {
  type Municipality = { id: string; name: string }

  test('a generic TItem flows through the Combobox and Autocomplete wrappers', () => {
    const municipality: Municipality = { id: 'sk', name: 'Skellefteå' }
    // `item` fixes TItem, so the state that `render` receives carries the same type.
    const comboboxOption = (
      <api.Combobox.Option
        item={municipality}
        render={(partProps, state) => {
          expectTypeOf(state.item).toEqualTypeOf<Municipality>()
          return <div {...partProps} />
        }}
      />
    )
    const autocompleteOption = (
      <api.Autocomplete.Option
        item={municipality}
        render={(partProps, state) => {
          expectTypeOf(state.item).toEqualTypeOf<Municipality>()
          return <div {...partProps} />
        }}
      />
    )
    expect(comboboxOption).toBeDefined()
    expect(autocompleteOption).toBeDefined()
  })

  test('the wrapper’s props are the shared part’s props', () => {
    expectTypeOf<ComponentProps<typeof api.Combobox.Option<Municipality>>>().toEqualTypeOf<
      api.ComboboxOptionProps<Municipality>
    >()
    expectTypeOf<ComponentProps<typeof api.Combobox.List<Municipality>>>().toEqualTypeOf<
      api.ComboboxListProps<Municipality>
    >()
    expectTypeOf<ComponentProps<typeof api.Autocomplete.Group<Municipality>>>().toEqualTypeOf<
      api.AutocompleteGroupProps<Municipality>
    >()
  })

  test('the deprecated core type is the renamed one', () => {
    expectTypeOf<FileUploadItem<string>>().toEqualTypeOf<FileUploadEntry<string>>()
  })
})
