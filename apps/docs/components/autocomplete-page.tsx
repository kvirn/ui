import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import { autocompleteRootRows, useAutocompleteHook } from '../content/autocomplete.api.ts'
import { fieldAttributes, popupWithLoadingAttributes } from '../content/combobox.api.ts'
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
import { ControlledAutocomplete } from '../examples/autocomplete/controlled.tsx'
import { DefaultAutocomplete } from '../examples/autocomplete/default.tsx'
import { LongListAutocomplete } from '../examples/autocomplete/long-list.tsx'
import { OwnFilterAutocomplete } from '../examples/autocomplete/own-filter.tsx'
import { PlainFormAutocomplete } from '../examples/autocomplete/plain-form.tsx'
import { RichSuggestionsAutocomplete } from '../examples/autocomplete/rich-suggestions.tsx'
import { ServerSuggestionsAutocomplete } from '../examples/autocomplete/server-suggestions.tsx'
import type { Contract } from '../lib/contract-parser.ts'

// The Autocomplete page (docs/design/docs-component-page.md, "How to write a component page").
// The popup parts are the Listbox's, so their rows come from content/listbox.api.ts.

export type AutocompleteExampleSources = Record<
  | 'default'
  | 'controlled'
  | 'server-suggestions'
  | 'own-filter'
  | 'rich-suggestions'
  | 'plain-form'
  | 'long-list',
  string
>

const element = (tag: string) => <code>&lt;{tag}&gt;</code>
const field = fieldAttributes('autocomplete')

const parts: ApiPart[] = [
  {
    name: 'Autocomplete.Root',
    renders: (
      <>
        no element of its own. Put an <code>Autocomplete.Input</code> and an{' '}
        <code>Autocomplete.Popup</code> inside it, in a <code>Field</code>, the popup right after
        the input. Its value is the text. Picking a suggestion fills the input and closes the popup.
      </>
    ),
    props: autocompleteRootRows,
  },
  {
    name: 'Autocomplete.Control',
    renders: (
      <>
        {element('div')} with no role, around the input and its Toggle and Clear. It is optional.
        The popup is placed against it and is as wide as it. It takes every attribute of a{' '}
        {element('div')} and passes <code>ref</code> to it. Theming is on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    attributes: field.control,
  },
  {
    name: 'Autocomplete.Input',
    renders: (
      <>
        {element('input type="text" role="combobox" aria-autocomplete="list"')}, named by the
        Field’s label. Focus stays on it. Its <code>autoComplete</code> is <code>off</code> unless
        you set your own, and it carries the Root’s <code>name</code>.
      </>
    ),
    attributes: field.input,
  },
  {
    name: 'Autocomplete.Toggle',
    renders: (
      <>
        {element('button type="button" tabindex="-1"')} that opens and closes the popup, named “Show
        options” (<code>combobox.showOptions</code>). It is optional and not a tab stop.
      </>
    ),
    attributes: field.toggle,
  },
  {
    name: 'Autocomplete.Clear',
    renders: (
      <>
        {element('button type="button" tabindex="-1"')} that empties the text, named “Clear” (
        <code>combobox.clear</code>). It renders only while there is text. It is optional and not a
        tab stop.
      </>
    ),
    attributes: field.clear,
  },
  {
    name: 'Autocomplete.Popup',
    renders: (
      <>
        {element('div popover="manual"')} with no role, in the top layer: the same part as{' '}
        <Link href="/components/listbox">Listbox.Popup</Link>.
      </>
    ),
    attributes: popupWithLoadingAttributes(popupAttributes),
  },
  {
    name: 'Autocomplete.List',
    renders: (
      <>
        {element('div role="listbox"')} inside the popup: the same part as <code>Listbox.List</code>
        .
      </>
    ),
    props: listRows,
    attributes: listAttributes,
  },
  {
    name: 'Autocomplete.Option',
    renders: (
      <>
        {element('div role="option"')}: the same part as <code>Listbox.Option</code>. No suggestion
        is ever chosen (<code>aria-selected</code> stays false): picking one fills the input.
      </>
    ),
    props: optionRows,
    attributes: optionAttributes,
  },
  {
    name: 'Autocomplete.OptionIcon',
    renders: (
      <>
        {element('span aria-hidden="true"')}: the same part as <code>Listbox.OptionIcon</code>.
      </>
    ),
    attributes: optionIconAttributes,
  },
  {
    name: 'Autocomplete.OptionText',
    renders: (
      <>
        {element('span')} that names the suggestion: the same part as{' '}
        <code>Listbox.OptionText</code>.
      </>
    ),
    attributes: optionTextAttributes,
  },
  {
    name: 'Autocomplete.OptionDescription',
    renders: (
      <>
        {element('span')} that describes the suggestion: the same part as{' '}
        <code>Listbox.OptionDescription</code>.
      </>
    ),
    attributes: optionDescriptionAttributes,
  },
  {
    name: 'Autocomplete.OptionIndicator',
    renders: (
      <>
        {element('span aria-hidden="true"')}: the same part as <code>Listbox.OptionIndicator</code>.
      </>
    ),
    attributes: optionIndicatorAttributes,
  },
  {
    name: 'Autocomplete.Group',
    renders: (
      <>
        {element('div role="group"')}: the same part as <code>Listbox.Group</code>.
      </>
    ),
    props: groupRows,
    attributes: groupAttributes,
  },
  {
    name: 'Autocomplete.GroupLabel',
    renders: (
      <>
        {element('div')} with the group’s name: the same part as <code>Listbox.GroupLabel</code>.
      </>
    ),
    attributes: groupLabelAttributes,
  },
  {
    name: 'Autocomplete.Empty',
    renders: (
      <>
        {element('div')} with plain text, shown while the popup is open and nothing matches: the
        same part as <code>Listbox.Empty</code>. Its default text is “No results”, or “Loading
        results” while <code>isLoading</code> is on.
      </>
    ),
    attributes: emptyAttributes,
  },
]

export function AutocompletePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AutocompleteExampleSources
}) {
  return (
    <ComponentPage
      title="Autocomplete"
      lead="The value is the text itself, so the user can write something that is not in the list."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use an Autocomplete for free text where suggestions help, such as a street address, and
            where any text is a valid answer.
          </li>
          <li>
            Picking a suggestion fills the input. Nothing is chosen from a list, so validate the
            text yourself.
          </li>
          <li>
            When only one of the options is a valid answer, use a{' '}
            <Link href="/components/combobox">Combobox</Link>. For a short list, use a{' '}
            <Link href="/components/listbox">Listbox</Link>.
          </li>
          <li>
            The browser may also suggest from its own history. Set <code>autoComplete</code> on the
            input only for a known purpose, where ours add something.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultAutocomplete />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="controlled"
            title="Keeping the text in your state"
            why="The value is the text. Pass value and onValueChange to keep it in your own state, here to show what the user entered. A suggestion that is picked and a typed text arrive the same way."
            code={sources['controlled']}
            propsUsed={[
              { part: 'Autocomplete.Root', prop: 'value' },
              { part: 'Autocomplete.Root', prop: 'onValueChange' },
            ]}
          >
            <ControlledAutocomplete />
          </UseCase>
          <UseCase
            id="server-suggestions"
            title="Suggestions from your server"
            why="When the suggestions live on a server, turn the filter off, pass isLoading while you fetch and keep the last result in items. You write the debounce and the fetch."
            code={sources['server-suggestions']}
            propsUsed={[
              { part: 'Autocomplete.Root', prop: 'filter' },
              { part: 'Autocomplete.Root', prop: 'isLoading' },
              { part: 'Autocomplete.Root', prop: 'onValueChange' },
            ]}
          >
            <ServerSuggestionsAutocomplete />
          </UseCase>
          <UseCase
            id="own-filter"
            title="Your own filter"
            why="The default filter matches the text anywhere in a suggestion, in the provider’s locale. Pass a function to change the rule, here to match only the start."
            code={sources['own-filter']}
            propsUsed={[{ part: 'Autocomplete.Root', prop: 'filter' }]}
          >
            <OwnFilterAutocomplete />
          </UseCase>
          <UseCase
            id="rich-suggestions"
            title="An icon and a second line in each suggestion"
            why="A suggestion can hold any markup. The optional parts keep its name to its text, which is also what goes in the input when it is picked, and give the second line as a description."
            code={sources['rich-suggestions']}
            propsUsed={[
              { part: 'Autocomplete.Root', prop: 'itemToString' },
              { part: 'Autocomplete.Option', prop: 'children' },
            ]}
          >
            <RichSuggestionsAutocomplete />
          </UseCase>
          <UseCase
            id="plain-form"
            title="Sending the text in a plain form"
            why="The text is the value, so the input itself carries the name and a plain form sends it. There is no hidden input. Set autoComplete for a known purpose, such as a street address."
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Autocomplete.Root', prop: 'name' },
              { part: 'Autocomplete.Root', prop: 'defaultValue' },
            ]}
            note={
              <Note kind="tip">
                Enter with no active suggestion is the browser’s own, so the form is sent with
                whatever was typed.
              </Note>
            }
          >
            <PlainFormAutocomplete />
          </UseCase>
          <UseCase
            id="long-list"
            title="Thousands of suggestions"
            why="Let the typing narrow the list first. If it stays long, virtualize renders only the suggestions in view plus the active one, and each says how many there are and where it is."
            code={sources['long-list']}
            propsUsed={[{ part: 'Autocomplete.Root', prop: 'virtualize' }]}
          >
            <LongListAutocomplete />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView contract={contract} messageNamespace="combobox" linkToStrings />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Autocomplete, useAutocomplete } from '@kvirn-ui/react'"
          parts={parts}
          hook={useAutocompleteHook}
          strings={
            <StringsBlock
              namespace="combobox"
              component="Autocomplete"
              keys={[
                {
                  key: 'resultCount',
                  values: { count: 5 },
                  meaning:
                    'Announced, politely and after a pause, when the suggestions change because the user typed. The texts below use five results.',
                },
                {
                  key: 'noResults',
                  meaning:
                    'Announced when nothing matches, and the default text of Autocomplete.Empty.',
                },
                {
                  key: 'loading',
                  meaning:
                    'Announced while the suggestions are loading, and the text of Autocomplete.Empty then.',
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
