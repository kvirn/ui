import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { stackAttributes, stackRows, useStackHook } from '../content/stack.api.ts'
import { DefaultStack } from '../examples/stack/default.tsx'
import { StackedForm } from '../examples/stack/form.tsx'
import { Gaps } from '../examples/stack/gaps.tsx'
import { StackAsList } from '../examples/stack/list.tsx'
import { StackOfSections } from '../examples/stack/sections.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type StackExampleSources = Record<'default' | 'sections' | 'gaps' | 'list' | 'form', string>

const parts: ApiPart[] = [
  {
    name: 'Stack',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-stack&quot;&gt;</code> with no role. It takes every attribute
        of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It has no state, so no{' '}
        <code>data-*</code>, and it works in a server component. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: stackRows,
    attributes: stackAttributes,
  },
]

export function StackPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: StackExampleSources
}) {
  return (
    <ComponentPage
      title="Stack"
      lead="Its children one below the other, with an even space between them. It adds no role and no behaviour, so the element and its semantics are the ones you choose."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for the vertical rhythm between blocks: the sections of a page, the parts of a
            form or the items of a list.
          </li>
          <li>
            Pick the space with <code>gap</code>: a smaller step inside a group, a larger one
            between sections.
          </li>
          <li>
            Use <code>as</code> to make it the element the content needs, such as a <code>ul</code>{' '}
            or a <code>form</code>.
          </li>
          <li>
            Not for text flow: <Link href="/components/prose">Prose</Link> has its own margins for
            headings and paragraphs. Not for putting blocks side by side: use Columns.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultStack />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="stack-of-sections"
            title="A stack of sections"
            why="A page is a series of bands. Nest a tight stack for each section’s own content inside a loose stack for the page, so the sections read as groups."
            code={sources['sections']}
            propsUsed={[
              { part: 'Stack', prop: 'gap' },
              { part: 'Stack', prop: 'as' },
            ]}
          >
            <StackOfSections />
          </UseCase>
          <UseCase
            id="gaps"
            title="Choosing the space"
            why="Items that belong together sit closer than separate blocks. The same lines are shown with the three steps that differ from the default."
            code={sources['gaps']}
            propsUsed={[{ part: 'Stack', prop: 'gap' }]}
          >
            <Gaps />
          </UseCase>
          <UseCase
            id="list"
            title="A list of links"
            why={
              <>
                Render the stack as a <code>ul</code> with <code>li</code> children and a screen
                reader announces a list with its number of items.
              </>
            }
            code={sources['list']}
            propsUsed={[
              { part: 'Stack', prop: 'gap' },
              { part: 'Stack', prop: 'as' },
            ]}
            note={
              <Note kind="tip">
                The theme may remove list markers. A list keeps its list role either way, because
                the element decides, not the style.
              </Note>
            }
          >
            <StackAsList />
          </UseCase>
          <UseCase
            id="form"
            title="The parts of a form"
            why="Render the stack as a form, and stack each label with its field in a tighter stack inside it. The reading order stays the DOM order."
            code={sources['form']}
            propsUsed={[
              { part: 'Stack', prop: 'gap' },
              { part: 'Stack', prop: 'as' },
            ]}
          >
            <StackedForm />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Stack, useStack } from '@kvirn-ui/react'"
          parts={parts}
          hook={useStackHook}
        />
      }
    />
  )
}
