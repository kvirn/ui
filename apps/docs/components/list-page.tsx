import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { listRootAttributes, listRootRows, listItemRows } from '../content/list.api.ts'
import { DefaultList } from '../examples/list/default.tsx'
import { Nested } from '../examples/list/nested.tsx'
import { RelatedLinks } from '../examples/list/related-links.tsx'
import { Steps } from '../examples/list/steps.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ListExampleSources = Record<'default' | 'related-links' | 'steps' | 'nested', string>

const parts: ApiPart[] = [
  {
    name: 'List.Root',
    renders: (
      <>
        <code>&lt;ul&gt;</code>, or <code>&lt;ol&gt;</code> with <code>as=&quot;ol&quot;</code>,
        with the role <code>list</code>. It takes every attribute of a <code>&lt;ul&gt;</code> and
        passes <code>ref</code> to it. It has no state, no hook and no strings, and it renders on
        the server too. Also exported as <code>ListRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: listRootRows,
    attributes: listRootAttributes,
  },
  {
    name: 'List.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with no class and no role of its own. It takes every attribute of an{' '}
        <code>&lt;li&gt;</code> and passes <code>ref</code> to it. Also exported as{' '}
        <code>ListItem</code>. Put a <Link href="/components/link">Link</Link> or text in it, and a
        nested <code>List.Root</code> when the item has sub-items.
      </>
    ),
    props: listItemRows,
  },
]

export function ListPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ListExampleSources
}) {
  return (
    <ComponentPage
      title="List"
      lead="A class sets the marker and the space between items, and the list has the list role unless you set another role."
      whenToUse={
        <ul>
          <li>
            Use it for any short list: related links, footer links, what to bring, the steps of an
            application.
          </li>
          <li>
            It has no marker. Add <code>kv-list--bullet</code> for bullets. Use{' '}
            <code>as=&quot;ol&quot;</code> with <code>kv-list--decimal</code> when the order
            matters.
          </li>
          <li>
            A list of links is a list, not a navigation. When it is navigation, put it in a{' '}
            <code>nav</code> with a name.
          </li>
          <li>
            Not for a menu that marks the current page: use{' '}
            <Link href="/components/navigation">Navigation</Link>. Not for a label with its value:
            use a <Link href="/components/definition-list">DefinitionList</Link>. Not for columns of
            data: use a <Link href="/components/table">Table</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultList />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="related-links"
            title="Related services at the end of a page"
            why="Links to other services. Put them in a named nav, so people who jump between landmarks can find them."
            code={sources['related-links']}
            note={
              <Note kind="reminder">
                Give the nav a name. An unnamed nav is announced only as “navigation”, so people
                can’t tell it from the page’s other navigation areas (1.3.1 Info and Relationships,
                2.4.1 Bypass Blocks).
              </Note>
            }
          >
            <RelatedLinks />
          </UseCase>
          <UseCase
            id="steps"
            title="How to apply for a parking permit"
            why="Steps in a fixed order: an ordered list says so in the markup, and the decimal class shows the numbers."
            code={sources['steps']}
            propsUsed={[{ part: 'List.Root', prop: 'as' }]}
          >
            <Steps />
          </UseCase>
          <UseCase
            id="nested"
            title="Services with sub-services"
            why="Put an inner list inside the List.Item it belongs to. The bullet class marks each level."
            code={sources['nested']}
          >
            <Nested />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Use the decimal class with <code>as=&quot;ol&quot;</code>, not with a plain list. On
                a plain list the numbers you see say nothing about order to a screen reader
                (software that reads the screen aloud), so that information would be lost (1.3.1
                Info and Relationships).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={<ApiBlock importLine="import { List } from '@kvirn-ui/react'" parts={parts} />}
    />
  )
}
