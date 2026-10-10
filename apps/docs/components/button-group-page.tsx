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
import { CardFooter } from '../examples/button-group/card-footer.tsx'
import { DefaultButtonGroup } from '../examples/button-group/default.tsx'
import { NamedByHeading } from '../examples/button-group/named-by-heading.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ButtonGroupExampleSources = Record<
  'default' | 'card-footer' | 'named-by-heading',
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
      lead="Give it a name and a screen reader tells users which buttons belong together."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a button group for buttons that act on the same thing: the actions of a form, or the
            footer of a card.
          </li>
          <li>
            Put the primary button first, so it is first in the Tab order. Keep one primary button
            per view.
          </li>
          <li>
            Name the group when the buttons need a context their own labels don’t give. A group in a{' '}
            <Link href="/components/toolbar">Toolbar</Link> always needs a name.
          </li>
          <li>
            Not for one Tab stop with the arrow keys: use a{' '}
            <Link href="/components/toolbar">Toolbar</Link>. Not for links: use{' '}
            <Link href="/components/link">Link</Link>.
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
            why="The buttons’ own labels say enough, so the group needs no name. Without one it is a plain div and adds nothing to the accessibility tree."
            code={sources['card-footer']}
            note={
              <Note kind="tip">
                Each button is its own Tab stop. If the buttons must be one Tab stop that you move
                through with the arrow keys, use a Toolbar instead.
              </Note>
            }
          >
            <CardFooter />
          </UseCase>
          <UseCase
            id="named-by-heading"
            title="A group named by the card’s heading"
            why={
              <>
                When the buttons need the context of the card, point <code>aria-labelledby</code> at
                its visible heading. A screen reader then says the heading and “group” as focus
                enters it.
              </>
            }
            code={sources['named-by-heading']}
            note={
              <Note kind="reminder">
                In a Toolbar the group must have a name, from your translations or a visible
                heading, and a development warning says so. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <NamedByHeading />
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
