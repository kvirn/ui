import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  inputGroupAddonAttributes,
  inputGroupRootAttributes,
  inputGroupRootRows,
  useInputGroupHook,
} from '../content/input-group.api.ts'
import { DefaultInputGroup } from '../examples/input-group/default.tsx'
import { DisabledWithReason } from '../examples/input-group/disabled-with-reason.tsx'
import { Invalid } from '../examples/input-group/invalid.tsx'
import { SearchWithClear } from '../examples/input-group/search-with-clear.tsx'
import { UnitFirst } from '../examples/input-group/unit-first.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type InputGroupExampleSources = Record<
  'default' | 'unit-first' | 'search-with-clear' | 'invalid' | 'disabled-with-reason',
  string
>

const parts: ApiPart[] = [
  {
    name: 'InputGroup.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It draws the input’s box, and
        holds one input and its addons or buttons. Start and end follow the order you write them in:
        there is no side prop. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: inputGroupRootRows,
    attributes: inputGroupRootAttributes,
  },
  {
    name: 'InputGroup.Addon',
    renders: (
      <>
        <code>&lt;span aria-hidden=&quot;true&quot;&gt;</code>. It takes every attribute of a{' '}
        <code>&lt;span&gt;</code> and passes <code>ref</code> to it. It holds a short unit or a
        decorative icon, is never focusable, and warns in development if it contains something
        focusable. A press on it focuses the input.
      </>
    ),
    attributes: inputGroupAddonAttributes,
  },
  {
    name: 'InputGroup.Input',
    renders: (
      <>
        the same <code>&lt;input&gt;</code> as a <code>TextInput</code>, under the group’s name. It
        takes every <code>TextInput</code> prop, reads its Field the same way, and has no props of
        its own. A <code>NumberInput</code> works in the box too, as in the examples. An{' '}
        <code>InputGroup.Input</code> needs nothing from the group: the Root only draws the box.
      </>
    ),
  },
]

export function InputGroupPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: InputGroupExampleSources
}) {
  return (
    <ComponentPage
      title="InputGroup"
      lead="It draws the edge and the focus ring once, and the label still carries all the meaning."
      whenToUse={
        <ul>
          <li>
            Use an InputGroup when a short unit (km, %, kr) or an icon belongs inside the box, or
            when a button such as clear acts on the input.
          </li>
          <li>
            Put it in a <Link href="/components/field">Field</Link> with a visible label that says
            the unit. An addon is a visual repeat, hidden from screen readers (software that reads
            the screen aloud).
          </li>
          <li>
            Put a button directly in the box, never inside an addon. It keeps its own name and Tab
            stop.
          </li>
          <li>
            Not for a plain input with nothing inside the box: use a{' '}
            <Link href="/components/text-input">TextInput</Link> or a{' '}
            <Link href="/components/number-input">NumberInput</Link>.
          </li>
          <li>
            Not for a long unit or a sentence: use the label or a help text. Not for a button that
            sits outside the box: that is a separate Button next to the Field.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultInputGroup />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="unit-first"
            title="A unit before the value"
            why="Some forms write the unit first, as in “kr 4 500”. Put the addon before the input in the box. It sits at the start of the box in either reading direction. The label still says the unit, because screen readers skip the addon."
            code={sources['unit-first']}
          >
            <UnitFirst />
          </UseCase>
          <UseCase
            id="search-with-clear"
            title="A search with a clear button"
            why="A search box has an icon at the start and a button at the end that empties it. The icon is decorative and the button is a real Button directly in the box, with its own name. It shows only while there is a text, and moves focus back to the input when it empties it. Clearing announces nothing: the focused, empty input is read as such."
            code={sources['search-with-clear']}
            note={
              <Note kind="reminder">
                The clear button disappears when it empties the box, so move focus to the input
                yourself, as the example does. Otherwise focus falls to the page (2.4.3 Focus
                Order).
              </Note>
            }
          >
            <SearchWithClear />
          </UseCase>
          <UseCase
            id="error"
            title="An error on the box"
            why="Put the group in a Field with invalid and write the message in the Field. The Field marks the input with aria-invalid and tells the box too, so both agree. The box draws a thicker edge, and the message under it says what is wrong and how to fix it, so colour is not the only signal."
            code={sources['invalid']}
            note={
              <Note kind="reminder">
                <code>invalid</code> on the Root changes only the look of the box. Set{' '}
                <code>aria-invalid</code> on the input too, or let the Field do both. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <Invalid />
          </UseCase>
          <UseCase
            id="disabled-with-reason"
            title="Disabled, with the reason"
            why="A disabled Field disables the input and draws the box dashed, and a click no longer focuses it. Say why in a help text under the box. Avoid a disabled box in a resident’s form where you can."
            code={sources['disabled-with-reason']}
          >
            <DisabledWithReason />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Write the unit in the label, as in “Monthly rent in kroner”. A screen reader skips
                the addon, so a unit that only the addon shows is never heard (3.3.2 Labels or
                Instructions).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { InputGroup, useInputGroup } from '@kvirn-ui/react'"
          parts={parts}
          hook={useInputGroupHook}
        />
      }
    />
  )
}
