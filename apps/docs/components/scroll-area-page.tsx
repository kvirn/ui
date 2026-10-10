import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
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
import { DefaultScrollArea } from '../examples/scroll-area/default.tsx'
import { Fits } from '../examples/scroll-area/fits.tsx'
import { OwnMarkup } from '../examples/scroll-area/own-markup.tsx'
import { Tall } from '../examples/scroll-area/tall.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ScrollAreaExampleSources = Record<
  'default' | 'fits' | 'always-region' | 'tall' | 'own-markup',
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
            Use it around content you can’t make fit at a narrow width or a large text size: a wide
            table, a code sample, pasted text. Everything else should wrap (WCAG 1.4.10).
          </li>
          <li>
            When everything fits it is a plain <code>&lt;div&gt;</code>. Only while it scrolls is it
            a named region and a Tab stop.
          </li>
          <li>
            Name it, and say what is inside. A region without a name is read as an unlabelled
            landmark.
          </li>
          <li>
            For a table, <Link href="/components/table">Table</Link> has its own scroll region that
            shares this logic. Not for a long page: let the page scroll.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultScrollArea />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="content-fits"
            title="When everything fits"
            why="Nothing scrolls, so the area is a plain div: no role, no name and no Tab stop. It becomes a region on its own if the window narrows or the text grows."
            code={sources['fits']}
          >
            <Fits />
          </UseCase>
          <UseCase
            id="always-a-region"
            title="A region whether it scrolls or not"
            why='Use region="always" when the area should be a named place for people to jump to, however much it holds. It is still a Tab stop only while it scrolls.'
            code={sources['always-region']}
            propsUsed={[{ part: 'ScrollArea', prop: 'region' }]}
          >
            <AlwaysRegion />
          </UseCase>
          <UseCase
            id="limited-height"
            title="Scrolling down as well"
            why="Limit the height with your own CSS, such as max-block-size, and the area scrolls down as well as sideways. The arrow keys, Page Up, Page Down, Home and End scroll it natively."
            code={sources['tall']}
            note={
              <Note kind="reminder">
                Name the area with <code>aria-label</code> or <code>aria-labelledby</code>. A
                development warning says so once it is a region. See{' '}
                <Link href="#what-you-need-to-do">what you need to do</Link>.
              </Note>
            }
          >
            <Tall />
          </UseCase>
          <UseCase
            id="own-markup"
            title="With your own element"
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
      contract={<ContractSectionsView contract={contract} />}
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
