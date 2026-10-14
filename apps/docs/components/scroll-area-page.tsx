import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  scrollAreaAttributes,
  scrollAreaRows,
  useScrollAreaHook,
} from '../content/scroll-area.api.ts'
import { AlwaysRegion } from '../examples/scroll-area/always-region.tsx'
import { CodeSample } from '../examples/scroll-area/code-sample.tsx'
import { DefaultScrollArea } from '../examples/scroll-area/default.tsx'
import { Fits } from '../examples/scroll-area/fits.tsx'
import { OwnMarkup } from '../examples/scroll-area/own-markup.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ScrollAreaExampleSources = Record<
  'default' | 'fits' | 'always-region' | 'code-sample' | 'own-markup',
  string
>

const parts: ApiPart[] = [
  {
    name: 'ScrollArea',
    renders: (
      <>
        <code>&lt;div&gt;</code>, which is a <code>region</code> only while it scrolls (or with{' '}
        <code>region=&quot;always&quot;</code>). It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: scrollAreaRows,
    attributes: scrollAreaAttributes,
  },
]

export function ScrollAreaPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ScrollAreaExampleSources
}) {
  return (
    <ComponentPage
      title="ScrollArea"
      lead="While it scrolls, a keyboard user can Tab to it and scroll it."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it around content that needs two directions to make sense and can’t wrap: a wide
            table from your content system, or a long line of code. Everything else must wrap, so
            the page never scrolls sideways at 320 pixels wide (1.4.10 Reflow).
          </li>
          <li>
            When everything fits it is a plain <code>&lt;div&gt;</code>. Only while it scrolls is it
            a named region (a part of the page that a screen reader, software that reads the screen
            aloud, can list so users jump to it) and a Tab stop (a place the Tab key stops at).
          </li>
          <li>Name it, and say what is inside.</li>
          <li>
            Not for a table you build with Table: <Link href="/components/table">Table</Link> has
            its own scroll region. Not for a long page: let the page scroll.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultScrollArea />
          </ExampleFrame>
          <Note
            kind="recipe"
            more={<CodeBlock language="css" code={'.permit-list {\n  max-block-size: 20rem;\n}'} />}
          >
            The area sets no size. Add your own class with a height limit, such as{' '}
            <code>className=&quot;permit-list&quot;</code>, and it scrolls down as well as sideways.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="short-table"
            title="A short fee list that fits"
            why="A short table fits, so nothing scrolls and the area is a plain div: no role, no name and no Tab stop. It becomes a named region by itself if the window narrows or the text grows."
            code={sources['fits']}
          >
            <Fits />
          </UseCase>
          <UseCase
            id="table-to-jump-to"
            title="A table people can jump to"
            why="Set region to always when a table matters enough that screen reader users should find it in their list of regions, even when it fits. It is still a Tab stop only while it scrolls."
            code={sources['always-region']}
            propsUsed={[{ part: 'ScrollArea', prop: 'region' }]}
          >
            <AlwaysRegion />
          </UseCase>
          <UseCase
            id="code-sample"
            title="A code sample in an open-data guide"
            why="A long line of code keeps its meaning only when it isn’t wrapped. Let the area scroll sideways, and name it so people know what it holds."
            code={sources['code-sample']}
          >
            <CodeSample />
          </UseCase>
          <UseCase
            id="own-markup"
            title="A table in your own element"
            why="When the markup is yours, spread the props of the hook on the element that scrolls. Add the name only while isRegion is true, because a name on a plain div is not allowed."
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useScrollArea', 'result'),
                label: 'useScrollArea (result)',
                prop: 'isRegion',
              },
            ]}
          >
            <OwnMarkup />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Name the area and say what is inside. Without a name a screen reader says only
                “region”, and the user can’t tell what it holds (4.1.2 Name, Role, Value).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you restyle the area, keep its focus ring and its native scrollbars. Keyboard
                users need the ring to see where they are (2.4.7 Focus Visible).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { ScrollArea, useScrollArea } from '@kvirn-ui/react'"
          parts={parts}
          hook={useScrollAreaHook}
        />
      }
    />
  )
}
