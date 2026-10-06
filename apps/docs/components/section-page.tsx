import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { sectionAttributes, sectionRows, useSectionResult } from '../content/section.api.ts'
import { Band } from '../examples/section/band.tsx'
import { DefaultSection } from '../examples/section/default.tsx'
import { SectionNavigation } from '../examples/section/navigation.tsx'
import { Sidebar } from '../examples/section/sidebar.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SectionExampleSources = Record<'default' | 'sidebar' | 'navigation' | 'band', string>

const parts: ApiPart[] = [
  {
    name: 'Section',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It is one element, so it is
        written <code>&lt;Section&gt;</code>; <code>Section.Root</code> still works but is
        deprecated and removed in 1.0. Also exported as <code>SectionRoot</code>. This is not the{' '}
        <code>Section</code> part of Disclosure or Tabs. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: sectionRows,
    attributes: sectionAttributes,
  },
]

export function SectionPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SectionExampleSources
}) {
  return (
    <ComponentPage
      title="Section"
      lead="A container for a region of the page, such as a sidebar or a band of content. It gives the region its own surface and padding, and it can become a named landmark when you choose the element."
      status="alpha"
      whenToUse={
        <ul>
          <li>
            Use a section for a region of a page: a sidebar, a band of related content, a group of
            navigation links.
          </li>
          <li>
            Put a heading at the top, at the level the page’s outline needs. Make the section a
            landmark only for a region a user would want to jump to.
          </li>
          <li>
            Keep the DOM order the same as the reading order: a sidebar that sits beside the main
            content comes after it in the code.
          </li>
          <li>
            Not for one thing in a region, such as a service or a news item: use a{' '}
            <Link href="/components/card">Card</Link>. A card on a section is fine, a section inside
            a card isn’t.
          </li>
          <li>Don’t render a section with no content: it still has padding and a surface.</li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultSection />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="sidebar"
            title="A sidebar users can jump to"
            why={
              <>
                Render the section as an <code>&lt;aside&gt;</code> for complementary content, such
                as contact details. Name it with <code>aria-labelledby</code> pointing at its
                heading, so it is a landmark in the screen reader’s list.
              </>
            }
            code={sources['sidebar']}
            propsUsed={[
              { part: 'Section', prop: 'render' },
              { part: 'Section', prop: 'className' },
            ]}
            note={
              <Note kind="reminder">
                A landmark needs a name, and a <code>&lt;section&gt;</code> without one is not a
                landmark at all. Keep landmarks few. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <Sidebar />
          </UseCase>
          <UseCase
            id="navigation"
            title="A group of navigation links"
            why={
              <>
                Render the section as a <code>&lt;nav&gt;</code> for a sidebar of links, and name it
                with <code>aria-labelledby</code>. Use a named navigation landmark only for the
                links that are the page’s navigation.
              </>
            }
            code={sources['navigation']}
            propsUsed={[{ part: 'Section', prop: 'render' }]}
          >
            <SectionNavigation />
          </UseCase>
          <UseCase
            id="band-that-looks-like-the-page"
            title="A band with a card on it"
            why="Use canvas when a region should look like the page again, for example a band that holds a card. It has no landmark: it is a visual region, and its heading gives it a name in the outline."
            code={sources['band']}
            propsUsed={[{ part: 'Section', prop: 'className' }]}
            note={
              <Note kind="tip">
                A card on a section keeps its default look. The other way round doesn’t work: don’t
                put a section inside a card.
              </Note>
            }
          >
            <Band />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <>
          <ApiBlock
            importLine="import { Section, useSection } from '@kvirn-ui/react'"
            parts={parts}
            hook={{ name: 'useSection', intro: 'Takes no options.', result: useSectionResult }}
          />
          <CodeBlock
            code={`const section = useSection()\n<nav {...section.rootProps} aria-labelledby={headingId}>…</nav>`}
          />
        </>
      }
    />
  )
}
