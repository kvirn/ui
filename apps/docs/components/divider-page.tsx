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
import type { Contract } from '../lib/contract-parser.ts'

export type DividerExampleSources = Record<'default' | 'decorative-line', string>

const parts: ApiPart[] = [
  {
    name: 'Divider',
    renders: (
      <>
        <code>&lt;hr&gt;</code>, whose implicit role is <code>separator</code>. It takes every
        attribute of an <code>&lt;hr&gt;</code> and passes <code>ref</code> to it. It has no state,
        no hook and no <code>as</code>, and it renders on the server too. With the default theme you
        change the line with five CSS variables, set on the element, a class or any ancestor:{' '}
        <code>--kv-divider-margin-block</code>, <code>--kv-divider-margin-inline</code>,{' '}
        <code>--kv-divider-width</code>, <code>--kv-divider-style</code> and{' '}
        <code>--kv-divider-color</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
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
      lead="A line between two blocks. It adds no text or behaviour, and the default theme sets its margin and colour from CSS variables."
      whenToUse={
        <ul>
          <li>
            Use it between two blocks on different topics, where a line helps people see where one
            ends and the next begins.
          </li>
          <li>
            A screen reader may announce the default line as a separator. If the line is only
            decoration, pass <code>role=&quot;presentation&quot;</code> and it is skipped.
          </li>
          <li>
            Don&rsquo;t use it instead of a heading. The blocks around it still need headings or
            text that say what they are.
          </li>
          <li>
            Don&rsquo;t use it to space blocks. Use a layout such as a{' '}
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
        <UseCase
          id="decorative-line"
          title="A line that is only decoration"
          why="A footnote under a page is not a new topic. Hide the line from screen readers so they do not announce a separator."
          code={sources['decorative-line']}
          note={
            <Note kind="reminder">
              The line must not carry meaning alone. What the footnote is has to be clear from its
              text (1.3.1 Info and Relationships).
            </Note>
          }
        >
          <DecorativeLine />
        </UseCase>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={<ApiBlock importLine="import { Divider } from '@kvirn-ui/react'" parts={parts} />}
    />
  )
}
