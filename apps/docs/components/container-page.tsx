import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { containerAttributes, containerRows, useContainerHook } from '../content/container.api.ts'
import { DefaultContainer } from '../examples/container/default.tsx'
import { FormColumn } from '../examples/container/form.tsx'
import { NamedRegion } from '../examples/container/region.tsx'
import { NestedContainers } from '../examples/container/nested.tsx'
import { ReadingColumn } from '../examples/container/reading.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ContainerExampleSources = Record<
  'default' | 'reading' | 'form' | 'nested' | 'region',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Container',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-container&quot;&gt;</code> with no role. It takes every
        attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It has no state,
        so no <code>data-*</code>, and it works in a server component. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: containerRows,
    attributes: containerAttributes,
  },
]

export function ContainerPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ContainerExampleSources
}) {
  return (
    <ComponentPage
      title="Container"
      lead="It adds no role and no behaviour, so the element and its semantics are the ones you choose."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it to keep a page’s content inside a readable width: the whole page, a reading
            column or a form column.
          </li>
          <li>
            Pick the width with <code>size</code>: <code>page</code> for the page,{' '}
            <code>reading</code> for text and <code>form</code> for one form.
          </li>
          <li>
            Use <code>as</code> when the container should be a landmark such as <code>main</code>,
            or a named <code>section</code>.
          </li>
          <li>
            Not for text flow: use <Link href="/components/prose">Prose</Link> for the headings,
            paragraphs and lists inside it. Not for putting blocks side by side: use Columns.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultContainer />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="reading-column"
            title="A reading column"
            why="Long text is hard to read on a wide screen. A reading container keeps lines to a comfortable length, for guidance, news and case pages."
            code={sources['reading']}
            propsUsed={[{ part: 'Container', prop: 'size' }]}
          >
            <ReadingColumn />
          </UseCase>
          <UseCase
            id="form-column"
            title="A form column"
            why="A form is easier to fill in when its fields aren’t stretched across the page. A form container gives it a narrow column at the start of the line."
            code={sources['form']}
            propsUsed={[{ part: 'Container', prop: 'size' }]}
          >
            <FormColumn />
          </UseCase>
          <UseCase
            id="page-with-column"
            title="The page and a column inside it"
            why="The reading and form measures add no padding and sit at the start of the line. Put them inside a page container, which keeps the page’s side gutter."
            code={sources['nested']}
            propsUsed={[{ part: 'Container', prop: 'size' }]}
          >
            <NestedContainers />
          </UseCase>
          <UseCase
            id="named-region"
            title="A named region"
            why={
              <>
                Give the container the element a landmark needs with <code>as</code>, and name it. A
                page has one <code>main</code>, which a page-width container often is.
              </>
            }
            code={sources['region']}
            propsUsed={[
              { part: 'Container', prop: 'size' },
              { part: 'Container', prop: 'as' },
            ]}
            note={
              <Note kind="reminder">
                Make a container a landmark only for a region people want to jump to, and always
                name it with <code>aria-labelledby</code> or <code>aria-label</code>. The container
                itself adds no name.
              </Note>
            }
          >
            <NamedRegion />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Container, useContainer } from '@kvirn-ui/react'"
          parts={parts}
          hook={useContainerHook}
        />
      }
    />
  )
}
