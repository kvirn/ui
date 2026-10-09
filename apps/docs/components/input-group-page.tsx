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
import type { Contract } from '../lib/contract-parser.ts'

export type InputGroupExampleSources = Record<
  'default' | 'search-with-clear' | 'invalid' | 'disabled-with-reason',
  string
>

const parts: ApiPart[] = [
  {
    name: 'InputGroup.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It draws the input’s box, and
        holds one input and its addons or buttons. Start and end follow the order you write them in,
        and the reading direction: there is no side prop. The default theme is described on{' '}
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
      lead="The box around an input and what sits inside it: a unit, an icon or a button such as clear. It draws the edge and the focus ring once, and the label still carries all the meaning."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use an InputGroup when a short unit (km, %, kr) or an icon belongs inside the box, or
            when a button such as clear acts on the input.
          </li>
          <li>
            Always put it in a <code>Field</code> with a visible label that says the unit: an addon
            is a visual repeat, hidden from screen readers.
          </li>
          <li>
            Put a button directly in the box, never inside an addon. It keeps its own name and Tab
            stop.
          </li>
          <li>
            Not for a long unit or a sentence: use the label or a help text. Not for a button that
            sits beside the box: put it next to the Field instead.
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
            id="search-with-clear"
            title="A search with a clear button"
            why="A search box has an icon at the start and a button at the end that empties it. The icon is decorative and the button is a real Button directly in the box, with its own name. It shows only while there is a text, and moves focus back to the input when it empties it."
            code={sources['search-with-clear']}
            note={
              <Note kind="tip">
                Clearing a search announces nothing: the focused, empty input is read as such. Keep
                the clear button’s name a visible text, “Clear search”, or an{' '}
                <code>aria-label</code> from your translations when it only has an icon.
              </Note>
            }
          >
            <SearchWithClear />
          </UseCase>
          <UseCase
            id="error"
            title="An error on the box"
            why="Put the group in a Field with invalid and write the message in the Field. The Field marks the input with aria-invalid and the box takes the invalid edge from it, so the box and the input agree."
            code={sources['invalid']}
            propsUsed={[{ part: 'InputGroup.Root', prop: 'invalid' }]}
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
            propsUsed={[{ part: 'InputGroup.Root', prop: 'disabled' }]}
          >
            <DisabledWithReason />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
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
