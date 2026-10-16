import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { headingAttributes, headingRows, useHeadingHook } from '../content/heading.api.ts'
import { DefaultHeading } from '../examples/heading/default.tsx'
import { OwnElement } from '../examples/heading/hook.tsx'
import { InProse } from '../examples/heading/in-prose.tsx'
import { NamesRegion } from '../examples/heading/names-region.tsx'
import { SizeApartFromLevel } from '../examples/heading/size.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type HeadingExampleSources = Record<
  'default' | 'size' | 'names-region' | 'in-prose' | 'hook',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Heading',
    renders: (
      <>
        <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> with the role <code>heading</code>,
        depending on <code>as</code>. Any other value warns in development and renders an{' '}
        <code>&lt;h2&gt;</code>. It takes every attribute of a heading and passes <code>ref</code>{' '}
        to it. The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: headingRows,
    attributes: headingAttributes,
  },
]

export function HeadingPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: HeadingExampleSources
}) {
  return (
    <ComponentPage
      title="Heading"
      lead="The level gives the page its outline and the size only changes how it looks, so you never pick a level because of how big it should be."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a heading at the top of every page and of every part of it that has a topic: a card,
            a sidebar, a group of form fields.
          </li>
          <li>
            Choose the level for the outline: one <code>h1</code> a page, then no skipped levels.
            Choose the size, if it needs to differ, for the look.
          </li>
          <li>
            Write a heading that names the topic or purpose, and that differs from the headings next
            to it.
          </li>
          <li>
            Not for making text bigger or bolder: do that in your CSS. Not for the name of a form
            field: use a <Link href="/components/field">Field</Link> label.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultHeading />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="size-apart-from-level"
            title="Another look without another level"
            why={
              <>
                A heading under an <code>h3</code> is an <code>h4</code>, even when the design wants
                it larger. Keep the level for the outline and set <code>size</code> for the look.
              </>
            }
            code={sources['size']}
            propsUsed={[
              { part: 'Heading', prop: 'as' },
              { part: 'Heading', prop: 'size' },
            ]}
            note={
              <Note kind="reminder">
                Choose each level for the outline, never for its size, and don’t skip a level.
                People who move through a page by heading rely on the levels (1.3.1 Info and
                Relationships). See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <SizeApartFromLevel />
          </UseCase>
          <UseCase
            id="names-a-region"
            title="A heading that names a region"
            why={
              <>
                Give the heading an <code>id</code> and point to it with{' '}
                <code>aria-labelledby</code> on the region. The region’s name is then the heading’s
                text, so the two never differ.
              </>
            }
            code={sources['names-region']}
            propsUsed={[{ part: 'Heading', prop: 'as' }]}
          >
            <NamesRegion />
          </UseCase>
          <UseCase
            id="in-running-text"
            title="Headings in running text"
            why="Inside a block of running text (Prose) the headings get their margins from the Prose. In the default theme the levels h4 to h6 differ by size first, then by weight and letter spacing, and they do not get smaller on a small screen."
            code={sources['in-prose']}
            propsUsed={[{ part: 'Heading', prop: 'as' }]}
          >
            <InProse />
          </UseCase>
          <UseCase
            id="own-element"
            title="Your own element"
            why={
              <>
                When the element is not a Heading, such as one drawn by your own component, take its
                classes from <code>useHeading</code>. Keep the <code>level</code> you pass in step
                with the element.
              </>
            }
            code={sources['hook']}
            propsUsed={[
              {
                part: apiHookPart('useHeading', 'options'),
                label: 'useHeading (options)',
                prop: 'level',
              },
              {
                part: apiHookPart('useHeading', 'options'),
                label: 'useHeading (options)',
                prop: 'size',
              },
            ]}
          >
            <OwnElement />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Heading, useHeading } from '@kvirn-ui/react'"
          parts={parts}
          hook={useHeadingHook}
        />
      }
    />
  )
}
