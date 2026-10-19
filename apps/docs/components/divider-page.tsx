import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { dividerAttributes, dividerRows } from '../content/divider.api.ts'
import { DecorativeLine } from '../examples/divider/decorative-line.tsx'
import { DefaultDivider } from '../examples/divider/default.tsx'
import { StrongerLine } from '../examples/divider/stronger-line.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DividerExampleSources = Record<'default' | 'decorative-line' | 'stronger-line', string>

const parts: ApiPart[] = [
  {
    name: 'Divider',
    renders: (
      <>
        <code>&lt;hr&gt;</code>, whose built-in role is <code>separator</code>. It takes every
        attribute of an <code>&lt;hr&gt;</code> and passes <code>ref</code> to it. It has no state,
        no hook and no <code>as</code>. With the default theme you change the line with the CSS
        variables below. Set them on the line, on a class or on any element above it. The default
        theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: dividerRows,
    attributes: dividerAttributes,
  },
]

export function DividerPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DividerExampleSources
}) {
  return (
    <ComponentPage
      title="Divider"
      lead="It adds no text and does nothing when pressed. A screen reader (software that reads the screen aloud) may announce it as a separator. If the line is only decoration, you can tell screen readers to skip it."
      whenToUse={
        <ul>
          <li>
            Use it between two blocks on different topics, where a line helps people see where one
            ends and the next begins.
          </li>
          <li>
            Keep a heading or some text on each side that says what the block is. The line does not
            say it, and it is not a heading. For a heading, use a{' '}
            <Link href="/components/heading">Heading</Link>.
          </li>
          <li>
            If the line is only decoration, tell screen readers to skip it. See{' '}
            <Link href="#decorative-line">A line that is only decoration</Link>.
          </li>
          <li>
            Not for adding space between blocks. Use a layout such as a{' '}
            <Link href="/components/stack">Stack</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultDivider />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="decorative-line"
            title="A line that is only decoration"
            why={
              <>
                The footnote below is not a new topic, so the line is only decoration. Pass{' '}
                <code>role=&quot;presentation&quot;</code> and a screen reader skips the line
                instead of announcing a separator.
              </>
            }
            code={sources['decorative-line']}
            note={
              <Note kind="reminder">
                The line must not carry meaning alone. What the footnote is has to be clear from its
                text (1.3.1 Info and Relationships, Level A).
              </Note>
            }
          >
            <DecorativeLine />
          </UseCase>
          <UseCase
            id="stronger-line"
            title="A stronger line between a decision and the next steps"
            why="The decision and the next steps are two topics, so the line stays a separator. Make it thicker and darker so it is easier to see. Set the CSS variables in your own stylesheet, on a class. The example sets them on the line so that it runs on its own."
            code={sources['stronger-line']}
            note={
              <Note kind="reminder">
                If you change the colour, keep the line clearly visible against the background when
                it matters to understanding (1.4.11 Non-text Contrast, Level AA).
              </Note>
            }
          >
            <StrongerLine />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={<ApiBlock importLine="import { Divider } from '@kvirn-ui/react'" parts={parts} />}
    />
  )
}
