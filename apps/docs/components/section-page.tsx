import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { sectionAttributes, sectionRows, useSectionResult } from '../content/section.api.ts'
import { Band } from '../examples/section/band.tsx'
import { DefaultSection } from '../examples/section/default.tsx'
import { SectionList } from '../examples/section/list.tsx'
import { SectionNavigation } from '../examples/section/navigation.tsx'
import { OtherLanguageSection } from '../examples/section/other-language.tsx'
import { Sidebar } from '../examples/section/sidebar.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SectionExampleSources = Record<
  'default' | 'sidebar' | 'navigation' | 'band' | 'list' | 'other-language',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Section',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it, whichever element{' '}
        <code>as</code> picks. It is one element, so it is written <code>&lt;Section&gt;</code>;{' '}
        <code>Section.Root</code> still works but is deprecated and removed in 1.0. Also exported as{' '}
        <code>SectionRoot</code>. This is not the <code>Section</code> part of Disclosure or Tabs.
        The default theme is described on <Link href="/foundation/theming">Theming</Link>.
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
      lead="It gives the region its own surface and padding, and it can become a named landmark when you choose the element."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a section for a region of a page: a sidebar, a band of related content, a group of
            navigation links.
          </li>
          <li>
            Put a heading at the top, at the level the page’s outline needs. Make the section a
            landmark (a part of the page that screen readers list, so users can jump to it) only for
            a region a user would want to jump to.
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
            title="A sidebar with contact details"
            why={
              <>
                Render the section as an <code>&lt;aside&gt;</code> for complementary content, such
                as contact details. Name it with <code>aria-labelledby</code> pointing at its
                heading, so it is in the screen reader’s list of landmarks.
              </>
            }
            code={sources['sidebar']}
            propsUsed={[
              { part: 'Section', prop: 'as' },
              { part: 'Section', prop: 'className' },
            ]}
            note={
              <Note kind="reminder">
                Name every landmark with the heading it holds. A <code>&lt;section&gt;</code>{' '}
                without a name is not a landmark, so users can’t jump to it (4.1.2 Name, Role,
                Value). Keep landmarks few.
              </Note>
            }
          >
            <Sidebar />
          </UseCase>
          <UseCase
            id="navigation"
            title="A sidebar of links to your cases"
            why={
              <>
                Render the section as a <code>&lt;nav&gt;</code> for a sidebar of links, and name it
                with <code>aria-labelledby</code>. Use a named navigation landmark only for the
                links that are the page’s navigation.
              </>
            }
            code={sources['navigation']}
            propsUsed={[{ part: 'Section', prop: 'as' }]}
          >
            <SectionNavigation />
          </UseCase>
          <UseCase
            id="band-that-looks-like-the-page"
            title="A waste-collection band with a card"
            why="Use canvas when a region should look like the page again, for example a band that holds a card. It is not a landmark: its heading shows it in the page outline."
            code={sources['band']}
            propsUsed={[{ part: 'Section', prop: 'className' }]}
            note={
              <Note kind="tip">
                A section inside a section is only for switching between the surface and canvas
                looks.
              </Note>
            }
          >
            <Band />
          </UseCase>
          <UseCase
            id="list-of-sections"
            title="A guide in parts, as a list"
            why={
              <>
                Render each section as an <code>&lt;li&gt;</code> inside a <code>&lt;ul&gt;</code>
                when a page is a set of short parts that belong together. A screen reader announces
                it as a list. Give each part its own heading.
              </>
            }
            code={sources['list']}
            propsUsed={[{ part: 'Section', prop: 'as' }]}
            note={
              <Note kind="reminder">
                Put <code>role=&quot;list&quot;</code> on the <code>&lt;ul&gt;</code>. Safari can
                stop announcing a list when its markers are hidden (1.3.1 Info and Relationships,
                A). We have not checked this with VoiceOver yet.
              </Note>
            }
          >
            <SectionList />
          </UseCase>
          <UseCase
            id="notice-in-another-language"
            title="A notice in Swedish on an English page"
            why={
              <>
                Text in a different language from the page needs its own language setting, so a
                screen reader uses the right voice. Wrap it in a nested <code>KvirnProvider</code>{' '}
                and spread <code>useLocale().localeProps</code> on the section. The section is also
                a named region, so a screen reader user can jump to it. In English, the notice says:
                “Snow clearing. We plough streets and cycle paths when more than five centimetres of
                snow has fallen.”
              </>
            }
            code={sources['other-language']}
            propsUsed={[{ part: 'Section', prop: 'as' }]}
            note={
              <Note kind="reminder">
                Mark each region in another language (3.1.2 Language of Parts, AA). Without it, a
                screen reader reads the text with the page’s language.
              </Note>
            }
          >
            <OtherLanguageSection />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Write the children in the order people should read and Tab through them, so a
                sidebar beside the main content comes after it in the code. Reordering with your own
                CSS breaks the match between what people see and what a keyboard or screen reader
                follows (1.3.2 Meaningful Sequence, 2.4.3 Focus Order).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Section, useSection } from '@kvirn-ui/react'"
          parts={parts}
          hook={{
            name: 'useSection',
            intro: (
              <>
                Takes no options. Spread <code>rootProps</code> on your own element, such as a{' '}
                <code>&lt;nav&gt;</code> with <code>aria-labelledby</code>. To add a class, join it
                with <code>mergeProps</code>.
              </>
            ),
            result: useSectionResult,
          }}
        />
      }
    />
  )
}
