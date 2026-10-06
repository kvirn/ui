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
        depending on <code>level</code>. It takes every attribute of a heading and passes{' '}
        <code>ref</code> to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
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
      lead="A heading with its level as a required prop and its look as an optional one. The level is the page’s outline, and the size is how it looks, so you never pick a level because of its size."
      status="alpha"
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
            Not for making text bigger or bolder: use a type role in your CSS. Not for the name of a
            form field: use a <Link href="/components/field">Field</Link> label.
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
            why="A heading under an h3 is an h4, even when the design wants it larger. Keep the level for the outline and set the size for the look."
            code={sources['size']}
            propsUsed={[
              { part: 'Heading', prop: 'level' },
              { part: 'Heading', prop: 'size' },
            ]}
            note={
              <Note kind="reminder">
                Don’t skip a level to get a smaller or larger heading: screen reader users move by
                level. See <Link href="#what-you-need-to-do">What you need to do</Link>.
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
                <code>aria-labelledby</code> on the region, so the region’s name is the heading’s
                text and is said once.
              </>
            }
            code={sources['names-region']}
            propsUsed={[{ part: 'Heading', prop: 'level' }]}
          >
            <NamesRegion />
          </UseCase>
          <UseCase
            id="in-running-text"
            title="Headings in running text"
            why="Inside prose the headings get their margins from the prose, and each level keeps its own look, so an h4 and an h5 differ by weight and tracking rather than size."
            code={sources['in-prose']}
            propsUsed={[{ part: 'Heading', prop: 'level' }]}
          >
            <InProse />
          </UseCase>
          <UseCase
            id="own-element"
            title="Your own element"
            why="When you already have the element, such as a heading from your CMS, take its classes from useHeading and keep the level you pass in step with the element."
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
