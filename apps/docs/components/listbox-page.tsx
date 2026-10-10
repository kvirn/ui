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
  emptyAttributes,
  groupAttributes,
  groupLabelAttributes,
  groupRows,
  listAttributes,
  listRows,
  nativeAttributes,
  optionAttributes,
  optionDescriptionAttributes,
  optionIconAttributes,
  optionIndicatorAttributes,
  optionRows,
  optionTextAttributes,
  popupAttributes,
  rootRows,
  triggerAttributes,
  useListboxHook,
  valueAttributes,
  valueRows,
} from '../content/listbox.api.ts'
import { DefaultListbox } from '../examples/listbox/default.tsx'
import { DisabledOptionListbox } from '../examples/listbox/disabled-option.tsx'
import { GroupedListbox } from '../examples/listbox/groups.tsx'
import { LanguageSwitcherListbox } from '../examples/listbox/language-switcher.tsx'
import { LongListListbox } from '../examples/listbox/long-list.tsx'
import { NativeSelect } from '../examples/listbox/native-select.tsx'
import { PlainFormListbox } from '../examples/listbox/plain-form.tsx'
import { RichOptionsListbox } from '../examples/listbox/rich-options.tsx'
import { SeveralListbox } from '../examples/listbox/several.tsx'
import type { Contract } from '../lib/contract-parser.ts'

// The Listbox page (docs/design/docs-component-page.md, "How to write a component page"). It
// takes the contract and the example sources as props, so the page file does the `node:fs` reads.
// Combobox and Autocomplete share the popup parts, whose rows are in content/listbox.api.ts.

export type ListboxExampleSources = Record<
  | 'default'
  | 'groups'
  | 'several'
  | 'disabled-option'
  | 'plain-form'
  | 'native-select'
  | 'rich-options'
  | 'long-list'
  | 'language-switcher',
  string
>

const element = (tag: string) => <code>&lt;{tag}&gt;</code>

const parts: ApiPart[] = [
  {
    name: 'Listbox.Root',
    renders: (
      <>
        no element of its own. It renders hidden inputs after its children when you give{' '}
        <code>name</code>, and with <code>native=&quot;always&quot;</code> (or{' '}
        <code>&quot;auto&quot;</code> on a touch device) it renders a native {element('select')}{' '}
        instead of its children. Put a <code>Listbox.Trigger</code> and a <code>Listbox.Popup</code>{' '}
        inside it, in a <code>Field</code>.
      </>
    ),
    props: rootRows,
    attributes: nativeAttributes,
  },
  {
    name: 'Listbox.Trigger',
    renders: (
      <>
        {element('div role="combobox" tabindex="0"')}, as in the APG select-only combobox. Focus
        stays on it. It is named by the Field’s label followed by the value, and renders a{' '}
        <code>Listbox.Value</code> when it has no children. It takes every attribute of a{' '}
        {element('div')} and passes <code>ref</code> to it. Theming is on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    attributes: triggerAttributes,
  },
  {
    name: 'Listbox.Value',
    renders: (
      <>
        {element('span')} with the chosen text, or the placeholder. It is part of the trigger’s
        name.
      </>
    ),
    props: valueRows,
    attributes: valueAttributes,
  },
  {
    name: 'Listbox.Popup',
    renders: (
      <>
        {element('div popover="manual"')} with no role, in the top layer, always rendered and hidden
        by the browser while closed. It is as wide as the trigger and flips when there is no room.
        Focus never enters it. Combobox and Autocomplete use the same part.
      </>
    ),
    attributes: popupAttributes,
  },
  {
    name: 'Listbox.List',
    renders: (
      <>
        {element('div role="listbox"')} inside the popup: the element <code>aria-controls</code>{' '}
        points at, named by the Field’s label, and the part that scrolls. It is always in the page,
        and hidden while the popup is open with no option.
      </>
    ),
    props: listRows,
    attributes: listAttributes,
  },
  {
    name: 'Listbox.Option',
    renders: (
      <>
        {element('div role="option"')} with <code>aria-selected</code>, and{' '}
        <code>aria-disabled</code> when the item is disabled. A click chooses it.
      </>
    ),
    props: optionRows,
    attributes: optionAttributes,
  },
  {
    name: 'Listbox.OptionIcon',
    renders: (
      <>
        {element('span aria-hidden="true"')} at the start of an option, for an icon, a flag or an
        avatar. It is decorative, so anything it means must also be in the text. The native select
        does not render it.
      </>
    ),
    attributes: optionIconAttributes,
  },
  {
    name: 'Listbox.OptionText',
    renders: (
      <>
        {element('span')} that the option’s <code>aria-labelledby</code> points at, so its text is
        the option’s name and a description is not. Keep it equal to <code>itemToString</code>: a
        development warning fires when it is not.
      </>
    ),
    attributes: optionTextAttributes,
  },
  {
    name: 'Listbox.OptionDescription',
    renders: (
      <>
        {element('span')} that the option’s <code>aria-describedby</code> points at. Screen readers
        differ in whether they read it for the active option, so never put the only copy of
        something essential here.
      </>
    ),
    attributes: optionDescriptionAttributes,
  },
  {
    name: 'Listbox.OptionIndicator',
    renders: (
      <>
        {element('span aria-hidden="true"')} at the end of an option, with{' '}
        <code>data-selected</code> while it is chosen. With no children the default theme draws a
        check in it. Children replace the check and show only on the chosen option.
      </>
    ),
    attributes: optionIndicatorAttributes,
  },
  {
    name: 'Listbox.Group',
    renders: (
      <>
        {element('div role="group"')} named by its <code>Listbox.GroupLabel</code>.{' '}
        <code>Listbox.List</code> renders one per group when the Root has <code>groups</code>.
      </>
    ),
    props: groupRows,
    attributes: groupAttributes,
  },
  {
    name: 'Listbox.GroupLabel',
    renders: (
      <>
        {element('div')} with the group’s visible name. A screen reader reads it on entering the
        group.
      </>
    ),
    attributes: groupLabelAttributes,
  },
  {
    name: 'Listbox.Empty',
    renders: (
      <>
        {element('div')} with plain text, shown only while the popup is open and there is no option.
        It is not an option and not in the listbox. Its default text is the locale’s “No results”.
      </>
    ),
    attributes: emptyAttributes,
  },
]

export function ListboxPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ListboxExampleSources
}) {
  return (
    <ComponentPage
      title="Listbox"
      lead="A list of options that opens from a box, for choosing one option or several. It reads well with a keyboard and a screen reader, and it can be the browser’s own select."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a Listbox when the user chooses one option, or a few, from a list they can scan,
            such as a municipality or a type of service.
          </li>
          <li>
            Keep the list short enough to scan. For more than about 15 options that people would
            search, use a <Link href="/components/combobox">Combobox</Link>. For free text with
            suggestions, use an <Link href="/components/autocomplete">Autocomplete</Link>.
          </li>
          <li>
            For a few choices that all fit on the page, a group of checkboxes or radio buttons is
            easier to use than any list.
          </li>
          <li>
            On a touch device the default, <code>native=&quot;auto&quot;</code>, shows the browser’s
            own select. The examples set <code>native=&quot;never&quot;</code> so you see the popup
            everywhere. See <Link href="#native-select">The browser’s own select</Link>.
          </li>
          <li>Not for actions: use a Button for something that does, and a Link for going.</li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultListbox />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="groups"
            title="Options in groups"
            why="Use groups when the options fall into a few named sets that help people find one, such as regions. Each group is named by its label, so a screen reader says which group an option is in."
            code={sources['groups']}
            propsUsed={[{ part: 'Listbox.Root', prop: 'groups' }]}
          >
            <GroupedListbox />
          </UseCase>
          <UseCase
            id="several"
            title="Choosing several options"
            why="Use multiple when the user may choose more than one. The popup stays open after a choice, each option toggles, and the value is an array of keys. The trigger shows the chosen texts joined by a comma."
            code={sources['several']}
            propsUsed={[
              { part: 'Listbox.Root', prop: 'multiple' },
              { part: 'Listbox.Root', prop: 'defaultValue' },
            ]}
          >
            <SeveralListbox />
          </UseCase>
          <UseCase
            id="disabled-option"
            title="An option that cannot be chosen now"
            why="Some options are unavailable for a while. Keep them in the list so people know they exist, and say why in the text next to the field."
            code={sources['disabled-option']}
            propsUsed={[{ part: 'Listbox.Root', prop: 'isItemDisabled' }]}
            note={
              <Note kind="tip">
                A disabled option stays reachable with the arrow keys, so a screen reader user hears
                that it exists. It can’t be chosen, and nothing says why unless you do.
              </Note>
            }
          >
            <DisabledOptionListbox />
          </UseCase>
          <UseCase
            id="plain-form"
            title="Sending the choice in a plain form"
            why="KvirnUI holds no form state. Give the Root a name and the chosen key goes into the form as a hidden input, so FormData and a plain submit work. With nothing chosen it sends an empty value."
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Listbox.Root', prop: 'name' },
              { part: 'Listbox.Root', prop: 'defaultValue' },
            ]}
          >
            <PlainFormListbox />
          </UseCase>
          <UseCase
            id="native-select"
            title="The browser’s own select"
            why={
              <>
                On a phone the browser’s own select is often better than anything custom.{' '}
                <code>native=&quot;always&quot;</code> renders one native select from the same
                items, with the same value, name and Field wiring. It shows plain text only.
              </>
            }
            code={sources['native-select']}
            propsUsed={[
              { part: 'Listbox.Root', prop: 'native' },
              { part: 'Listbox.Root', prop: 'placeholder' },
              { part: 'Listbox.Root', prop: 'autoComplete' },
            ]}
            note={
              <Note kind="tip">
                With the default <code>native=&quot;auto&quot;</code> the first render is the popup
                trigger, and a touch device switches right after mount. Use{' '}
                <code>native=&quot;always&quot;</code> to avoid that one frame.
              </Note>
            }
          >
            <NativeSelect />
          </UseCase>
          <UseCase
            id="rich-options"
            title="An icon and a second line in each option"
            why="An option can hold any markup. The optional parts give it a place and keep its name right: the icon is decorative, the text is the name, the description is read as help and the indicator marks the chosen one."
            code={sources['rich-options']}
            propsUsed={[{ part: 'Listbox.Option', prop: 'children' }]}
            note={
              <Note kind="reminder">
                Every rich option still needs a plain text name, which is also its text in the
                trigger, and the native select shows text only. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <RichOptionsListbox />
          </UseCase>
          <UseCase
            id="language-switcher"
            title="A language switcher"
            why={
              <>
                Name each language in its own language, so people find theirs: Svenska, Suomi,
                English. A screen reader reads text in the voice of the page’s language unless the
                text says otherwise (WCAG 3.1.2), so give <code>itemToLang</code> the code of each
                item. It sets <code>lang</code> on each native option, each popup option and the
                chosen text in the trigger. It is not supported by Combobox or Autocomplete yet:
                their value is an input, which has one <code>lang</code> for the whole text.
              </>
            }
            code={sources['language-switcher']}
            propsUsed={[
              { part: 'Listbox.Root', prop: 'itemToLang' },
              { part: 'Listbox.Root', prop: 'itemToString' },
            ]}
          >
            <LanguageSwitcherListbox />
          </UseCase>
          <UseCase
            id="long-list"
            title="A list of thousands"
            why="Filter or split a long list first. If it stays long, virtualize renders only the options in view plus the active and the chosen one, and each option still says how many there are and where it is. Unrendered options can’t be found with find in page or printed."
            code={sources['long-list']}
            propsUsed={[{ part: 'Listbox.Root', prop: 'virtualize' }]}
          >
            <LongListListbox />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView contract={contract} messageNamespace="combobox" linkToStrings />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Listbox, useListbox } from '@kvirn-ui/react'"
          parts={parts}
          hook={useListboxHook}
          strings={
            <StringsBlock
              namespace="combobox"
              component="Listbox"
              keys={[
                {
                  key: 'noResults',
                  meaning:
                    'The default text of Listbox.Empty, shown while the popup is open and there is no option.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
