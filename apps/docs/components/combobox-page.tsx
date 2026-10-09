import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  comboboxRootRows,
  fieldAttributes,
  popupWithLoadingAttributes,
  useComboboxHook,
  valueAttributes,
  valueListAttributes,
  valueListRows,
  valueRows,
} from '../content/combobox.api.ts'
import {
  emptyAttributes,
  groupAttributes,
  groupLabelAttributes,
  groupRows,
  listAttributes,
  listRows,
  optionAttributes,
  optionDescriptionAttributes,
  optionIconAttributes,
  optionIndicatorAttributes,
  optionRows,
  optionTextAttributes,
  popupAttributes,
} from '../content/listbox.api.ts'
import { DefaultCombobox } from '../examples/combobox/default.tsx'
import { LongListCombobox } from '../examples/combobox/long-list.tsx'
import { NotInListCombobox } from '../examples/combobox/not-in-list.tsx'
import { OwnFilterCombobox } from '../examples/combobox/own-filter.tsx'
import { PlainFormCombobox } from '../examples/combobox/plain-form.tsx'
import { RichOptionsCombobox } from '../examples/combobox/rich-options.tsx'
import { ServerResultsCombobox } from '../examples/combobox/server-results.tsx'
import { SeveralCombobox } from '../examples/combobox/several.tsx'
import type { Contract } from '../lib/contract-parser.ts'

// The Combobox page (docs/design/docs-component-page.md, "How to write a component page"). The
// popup parts are the Listbox's, so their rows come from content/listbox.api.ts.

export type ComboboxExampleSources = Record<
  | 'default'
  | 'several'
  | 'server-results'
  | 'own-filter'
  | 'not-in-list'
  | 'rich-options'
  | 'plain-form'
  | 'long-list',
  string
>

const element = (tag: string) => <code>&lt;{tag}&gt;</code>
const field = fieldAttributes('combobox')

const parts: ApiPart[] = [
  {
    name: 'Combobox.Root',
    renders: (
      <>
        no element of its own. It renders hidden inputs after its children when you give{' '}
        <code>name</code>. Put a <code>Combobox.Input</code> and a <code>Combobox.Popup</code>{' '}
        inside it, in a <code>Field</code>, the popup right after the input.
      </>
    ),
    props: comboboxRootRows,
  },
  {
    name: 'Combobox.Control',
    renders: (
      <>
        {element('div')} with no role, around the input and its Toggle and Clear. It is optional.
        The popup is placed against it and is as wide as it, and the default theme draws the field’s
        edge and focus ring on it. It takes every attribute of a {element('div')} and passes{' '}
        <code>ref</code> to it. Theming is on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    attributes: field.control,
  },
  {
    name: 'Combobox.Input',
    renders: (
      <>
        {element('input type="text" role="combobox" aria-autocomplete="list"')}, named by the
        Field’s label. Focus stays on it, and the active option is{' '}
        <code>aria-activedescendant</code>. Its <code>autoComplete</code> is <code>off</code> unless
        you set your own.
      </>
    ),
    attributes: field.input,
  },
  {
    name: 'Combobox.Toggle',
    renders: (
      <>
        {element('button type="button" tabindex="-1"')} that opens and closes the popup, named “Show
        options” (<code>combobox.showOptions</code>). It is optional, not a tab stop, and a press
        keeps focus in the input. Put it after the input, in a <code>Combobox.Control</code>.
      </>
    ),
    attributes: field.toggle,
  },
  {
    name: 'Combobox.Clear',
    renders: (
      <>
        {element('button type="button" tabindex="-1"')} that empties the text and, with one choice,
        the value, named “Clear” (<code>combobox.clear</code>). It renders only while there is
        something to clear, and it is the only thing that empties the text. With{' '}
        <code>multiple</code> it empties the typed text only.
      </>
    ),
    attributes: field.clear,
  },
  {
    name: 'Combobox.ValueList',
    renders: (
      <>
        {element('ul role="list"')} of the chosen values, for <code>multiple</code>, before the
        input and named by the Field’s label. It renders nothing while no value is chosen.
      </>
    ),
    props: valueListRows,
    attributes: valueListAttributes,
  },
  {
    name: 'Combobox.Value',
    renders: (
      <>
        {element('li')} with the value’s text and a remove {element('button')} named “Remove …” (
        <code>combobox.removeValue</code>). The remove button is a normal tab stop. Removing a value
        moves focus to the next remove button, else the previous, else the input.
      </>
    ),
    props: valueRows,
    attributes: valueAttributes,
  },
  {
    name: 'Combobox.Popup',
    renders: (
      <>
        {element('div popover="manual"')} with no role, in the top layer: the same part as{' '}
        <Link href="/components/listbox">Listbox.Popup</Link>. Focus never enters it.
      </>
    ),
    attributes: popupWithLoadingAttributes(popupAttributes),
  },
  {
    name: 'Combobox.List',
    renders: (
      <>
        {element('div role="listbox"')} inside the popup: the same part as <code>Listbox.List</code>
        . It has <code>aria-multiselectable</code> with <code>multiple</code>.
      </>
    ),
    props: listRows,
    attributes: listAttributes,
  },
  {
    name: 'Combobox.Option',
    renders: (
      <>
        {element('div role="option"')}: the same part as <code>Listbox.Option</code>.{' '}
        <code>aria-selected</code> means chosen, not highlighted.
      </>
    ),
    props: optionRows,
    attributes: optionAttributes,
  },
  {
    name: 'Combobox.OptionIcon',
    renders: (
      <>
        {element('span aria-hidden="true"')}: the same part as <code>Listbox.OptionIcon</code>.
      </>
    ),
    attributes: optionIconAttributes,
  },
  {
    name: 'Combobox.OptionText',
    renders: (
      <>
        {element('span')} that names the option: the same part as <code>Listbox.OptionText</code>.
      </>
    ),
    attributes: optionTextAttributes,
  },
  {
    name: 'Combobox.OptionDescription',
    renders: (
      <>
        {element('span')} that describes the option: the same part as{' '}
        <code>Listbox.OptionDescription</code>.
      </>
    ),
    attributes: optionDescriptionAttributes,
  },
  {
    name: 'Combobox.OptionIndicator',
    renders: (
      <>
        {element('span aria-hidden="true"')}: the same part as <code>Listbox.OptionIndicator</code>.
      </>
    ),
    attributes: optionIndicatorAttributes,
  },
  {
    name: 'Combobox.Group',
    renders: (
      <>
        {element('div role="group"')}: the same part as <code>Listbox.Group</code>. A group left
        with no match is not rendered.
      </>
    ),
    props: groupRows,
    attributes: groupAttributes,
  },
  {
    name: 'Combobox.GroupLabel',
    renders: (
      <>
        {element('div')} with the group’s name: the same part as <code>Listbox.GroupLabel</code>.
      </>
    ),
    attributes: groupLabelAttributes,
  },
  {
    name: 'Combobox.Empty',
    renders: (
      <>
        {element('div')} with plain text, shown while the popup is open and no option matches: the
        same part as <code>Listbox.Empty</code>. Its default text is “No results”, or “Loading
        results” while <code>isLoading</code> is on.
      </>
    ),
    attributes: emptyAttributes,
  },
]

export function ComboboxPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ComboboxExampleSources
}) {
  return (
    <ComponentPage
      title="Combobox"
      lead="A text field with a list of options that shrinks as the user types, for choosing one option or several from a long list. The value is always one of the options, never the free text."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a Combobox when the list is too long to scan and the user can type a few letters to
            narrow it, such as a municipality, an authority or a country.
          </li>
          <li>
            The value is an option, so text that matches nothing leaves the value empty (
            <code>null</code>). For free text that only gets suggestions, use an{' '}
            <Link href="/components/autocomplete">Autocomplete</Link>.
          </li>
          <li>
            For up to about 15 options, a <Link href="/components/listbox">Listbox</Link> or radio
            buttons are easier. A Combobox is always custom: it has no native rendering on touch
            devices.
          </li>
          <li>Not for a list of actions or for going to a page. Use a Button or a Link.</li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultCombobox />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="several"
            title="Choosing several options"
            why="With multiple, each choice moves out of the field into a list of values before the input, and the popup stays open for the next one. Each value has a remove button, so the user can take one back."
            code={sources['several']}
            propsUsed={[
              { part: 'Combobox.Root', prop: 'multiple' },
              { part: 'Combobox.Root', prop: 'defaultValue' },
            ]}
          >
            <SeveralCombobox />
          </UseCase>
          <UseCase
            id="server-results"
            title="Results from your server"
            why="When the list lives on a server, turn the filter off, pass isLoading while you fetch and keep the last result in items. You write the debounce and the fetch. The popup shows “Loading results” and announces it."
            code={sources['server-results']}
            propsUsed={[
              { part: 'Combobox.Root', prop: 'filter' },
              { part: 'Combobox.Root', prop: 'isLoading' },
              { part: 'Combobox.Root', prop: 'onInputValueChange' },
            ]}
          >
            <ServerResultsCombobox />
          </UseCase>
          <UseCase
            id="own-filter"
            title="Your own filter"
            why="The default filter matches the query anywhere in the text, in the provider’s locale. Pass a function to change the rule, here to match only the start. It runs on the next keystroke."
            code={sources['own-filter']}
            propsUsed={[{ part: 'Combobox.Root', prop: 'filter' }]}
          >
            <OwnFilterCombobox />
          </UseCase>
          <UseCase
            id="not-in-list"
            title="Text that matches nothing"
            why="The Combobox never clears what the user typed, and the value stays null. You decide when that is an error and say what to do. Here the field is invalid once it has been left with text that is not an option."
            code={sources['not-in-list']}
            propsUsed={[
              { part: 'Combobox.Root', prop: 'value' },
              { part: 'Combobox.Root', prop: 'onValueChange' },
              { part: 'Combobox.Root', prop: 'inputValue' },
              { part: 'Combobox.Root', prop: 'onInputValueChange' },
            ]}
            note={
              <Note kind="tip">
                Editing away from a chosen option’s text also makes the value <code>null</code>, and
                keeps what was typed. Apply <code>onValueChange(null)</code> when you control the
                value, or the old text is put back.
              </Note>
            }
          >
            <NotInListCombobox />
          </UseCase>
          <UseCase
            id="rich-options"
            title="An icon and a second line in each option"
            why="An option can hold any markup. The optional parts give it a place and keep its name right: the icon is decorative, the text is the name and what goes in the input, and the description is read as help."
            code={sources['rich-options']}
            propsUsed={[{ part: 'Combobox.Option', prop: 'children' }]}
          >
            <RichOptionsCombobox />
          </UseCase>
          <UseCase
            id="plain-form"
            title="Sending the choice in a plain form"
            why="KvirnUI holds no form state. Give the Root a name and each chosen key goes into the form as a hidden input, so FormData and a plain submit work."
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Combobox.Root', prop: 'name' },
              { part: 'Combobox.Root', prop: 'defaultValue' },
            ]}
            note={
              <Note kind="tip">
                The text in the input is never sent, only the key of the chosen option. Pressing
                Enter with no active option submits the form, as in any text field.
              </Note>
            }
          >
            <PlainFormCombobox />
          </UseCase>
          <UseCase
            id="long-list"
            title="A list of thousands"
            why="Let the user filter first. If the list stays long after that, virtualize renders only the options in view plus the active and the chosen one, and each option says how many there are and where it is. Unrendered options can’t be found with find in page or printed."
            code={sources['long-list']}
            propsUsed={[{ part: 'Combobox.Root', prop: 'virtualize' }]}
          >
            <LongListCombobox />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView contract={contract} messageNamespace="combobox" linkToStrings />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Combobox, useCombobox } from '@kvirn-ui/react'"
          parts={parts}
          hook={useComboboxHook}
          strings={
            <StringsBlock
              namespace="combobox"
              component="Combobox"
              keys={[
                {
                  key: 'resultCount',
                  values: { count: 5 },
                  meaning:
                    'Announced, politely and after a pause, when the list changes because the user typed. The texts below use five results.',
                },
                {
                  key: 'noResults',
                  meaning:
                    'Announced when no option matches, and the default text of Combobox.Empty.',
                },
                {
                  key: 'loading',
                  meaning:
                    'Announced while the options are loading, and the text of Combobox.Empty then.',
                },
                {
                  key: 'removeValue',
                  values: { label: 'Stockholm' },
                  meaning:
                    'The name of a remove button. The texts below use “Stockholm” as the value.',
                },
                { key: 'clear', meaning: 'The name of the Clear button.' },
                { key: 'showOptions', meaning: 'The name of the Toggle button.' },
              ]}
            />
          }
        />
      }
    />
  )
}
