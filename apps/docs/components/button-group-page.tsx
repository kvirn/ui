import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  buttonGroupAttributes,
  buttonGroupRows,
  useButtonGroupHook,
} from '../content/button-group.api.ts'
import { Attached } from '../examples/button-group/attached.tsx'
import { CardFooter } from '../examples/button-group/card-footer.tsx'
import { DefaultButtonGroup } from '../examples/button-group/default.tsx'
import { FilterStrip } from '../examples/button-group/filter-strip.tsx'
import { InAToolbar } from '../examples/button-group/in-a-toolbar.tsx'
import { NamedByHeading } from '../examples/button-group/named-by-heading.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ButtonGroupExampleSources = Record<
  'default' | 'card-footer' | 'named-by-heading' | 'attached' | 'filter-strip' | 'in-a-toolbar',
  string
>

const parts: ApiPart[] = [
  {
    name: 'ButtonGroup',
    renders: (
      <>
        <code>&lt;div&gt;</code>, with the role <code>group</code> only when it has a name. It takes
        every attribute of a <code>&lt;div&gt;</code> except <code>role</code>, and passes{' '}
        <code>ref</code> to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: buttonGroupRows,
    attributes: buttonGroupAttributes,
  },
]

export function ButtonGroupPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ButtonGroupExampleSources
}) {
  return (
    <ComponentPage
      title="ButtonGroup"
      lead="Give it a name and a screen reader (software that reads the screen aloud) can tell people which buttons belong together."
      whenToUse={
        <ul>
          <li>
            Use a button group for buttons that act on the same thing: the actions of a form, or the
            footer of a card.
          </li>
          <li>
            Put the main button first and keep one main button on the screen. People using a
            keyboard then reach the main next step first.
          </li>
          <li>
            Name the group when the buttons need a context their own labels don’t give. In a{' '}
            <Link href="/components/toolbar">Toolbar</Link> the name is required.
          </li>
          <li>
            The joined look (<code>kv-button-group--attached</code>) changes only how it looks. It
            doesn’t say which button is chosen, so for a choice use a{' '}
            <Link href="/components/radio-group">RadioGroup</Link> or a{' '}
            <Link href="/components/toggle">Toggle</Link>.
          </li>
          <li>
            Each button is its own Tab stop (a place where the Tab key stops). If the row should be
            one Tab stop, with the arrow keys moving between the buttons, use a{' '}
            <Link href="/components/toolbar">Toolbar</Link>.
          </li>
          <li>
            Not for a list of links to pages: use{' '}
            <Link href="/components/navigation">Navigation</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultButtonGroup />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="card-footer"
            title="The actions in a card footer"
            why="The buttons’ own labels say enough, so this group needs no name. Without a name it is a plain div, and a screen reader hears nothing extra."
            code={sources['card-footer']}
          >
            <CardFooter />
          </UseCase>
          <UseCase
            id="named-by-heading"
            title="A group named by the card’s heading"
            why={
              <>
                When the buttons need the context of the card, point <code>aria-labelledby</code> at
                the <code>id</code> of its visible heading. A screen reader then says the heading
                and “group” as focus enters the group.
              </>
            }
            code={sources['named-by-heading']}
          >
            <NamedByHeading />
          </UseCase>
          <UseCase
            id="attached"
            title="Two related actions joined in a strip"
            why={
              <>
                A staff member edits a decision letter and needs undo and redo side by side. Add the
                class <code>kv-button-group--attached</code> and the buttons touch and share
                borders. Each button is still its own Tab stop. The name tells a screen reader user
                what the pair is for.
              </>
            }
            code={sources['attached']}
            propsUsed={[{ part: 'ButtonGroup', prop: 'className' }]}
          >
            <Attached />
          </UseCase>
          <UseCase
            id="filter-strip"
            title="A strip of filters for a list of cases"
            why={
              <>
                A caseworker narrows a list with filters that can be on together. The group holds no
                state: each <Link href="/components/toggle">Toggle</Link> is on or off for itself,
                and a screen reader says which are pressed. The name says what the strip does, and
                the count under it tells everyone how many cases match.
              </>
            }
            code={sources['filter-strip']}
            propsUsed={[{ part: 'ButtonGroup', prop: 'className' }]}
          >
            <FilterStrip />
          </UseCase>
          <UseCase
            id="in-a-toolbar"
            title="Groups of case actions in a toolbar"
            why={
              <>
                With three or more actions, a <Link href="/components/toolbar">Toolbar</Link> is one
                Tab stop and the arrow keys move between the buttons, across groups. Name each group
                so a screen reader says which one focus has entered. Use <code>Toolbar.Button</code>{' '}
                for the buttons.
              </>
            }
            code={sources['in-a-toolbar']}
            note={
              <Note kind="reminder">
                Name every group in a Toolbar. Without a name, a screen reader user hears no group
                as focus moves between them (1.3.1 Info and Relationships, 4.1.2 Name, Role, Value).
                In development, a warning tells you when a name is missing.
              </Note>
            }
          >
            <InAToolbar />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { ButtonGroup, useButtonGroup } from '@kvirn-ui/react'"
          parts={parts}
          hook={useButtonGroupHook}
        />
      }
    />
  )
}
