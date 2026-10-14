import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  accordionHeadingAttributes,
  accordionHeadingRows,
  accordionItemAttributes,
  accordionItemRows,
  accordionPanelAttributes,
  accordionPanelRows,
  accordionRootAttributes,
  accordionRootRows,
  accordionTriggerAttributes,
  useAccordionHook,
} from '../content/accordion.api.ts'
import { AsAList } from '../examples/accordion/as-a-list.tsx'
import { DefaultAccordion } from '../examples/accordion/default.tsx'
import { FindInPage } from '../examples/accordion/find-in-page.tsx'
import { OpenByDefault } from '../examples/accordion/open-by-default.tsx'
import { Regions } from '../examples/accordion/regions.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AccordionExampleSources = Record<
  'default' | 'open-by-default' | 'find-in-page' | 'regions' | 'as-a-list',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Accordion.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. The default theme is described
        on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: accordionRootRows,
    attributes: accordionRootAttributes,
  },
  {
    name: 'Accordion.Item',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It owns its own open state, so opening one item never
        closes another. It takes every attribute of a <code>&lt;div&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    props: accordionItemRows,
    attributes: accordionItemAttributes,
  },
  {
    name: 'Accordion.Heading',
    renders: (
      <>
        <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>, by <code>level</code>. The trigger goes
        inside it. It takes every attribute of a heading and passes <code>ref</code> to it.
      </>
    ),
    props: accordionHeadingRows,
    attributes: accordionHeadingAttributes,
  },
  {
    name: 'Accordion.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with <code>aria-expanded</code> and{' '}
        <code>aria-controls</code>, and a chevron after its content. It is the{' '}
        <Link href="/components/disclosure">Disclosure</Link> trigger with the accordion’s class
        added, and takes the same attributes.
      </>
    ),
    attributes: accordionTriggerAttributes,
  },
  {
    name: 'Accordion.Panel',
    renders: (
      <>
        <code>&lt;div&gt;</code>, always rendered and <code>hidden</code> while closed. It is the
        Disclosure panel with the accordion’s class added, and takes the same attributes. Render it
        right after the heading.
      </>
    ),
    props: accordionPanelRows,
    attributes: accordionPanelAttributes,
  },
]

export function AccordionPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AccordionExampleSources
}) {
  return (
    <ComponentPage
      title="Accordion"
      lead="Readers open them one by one, and every item opens on its own."
      status="alpha-candidate"
      pattern="APG Accordion"
      whenToUse={
        <ul>
          <li>
            Use it for a page of questions and answers, such as a FAQ about building permits, where
            most readers want one or two answers.
          </li>
          <li>
            Write each button as the question or the section title. Screen reader users (people
            using software that reads the screen aloud) find the questions by heading, so the
            heading level has to fit your page’s outline.
          </li>
          <li>
            Keep content that everyone needs in plain view. Hiding an answer behind a press costs
            every reader a step.
          </li>
          <li>
            For a single button and panel, use a{' '}
            <Link href="/components/disclosure">Disclosure</Link>. For a menu in the page header,
            use <Link href="/components/navigation">Navigation</Link>.
          </li>
          <li>
            This version has no “only one open” mode and no “show all” button, and the arrow keys
            don’t move between the questions.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultAccordion />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="open-by-default"
            title="The first answer already open"
            why="Most readers need the first answer, so you start it open. The other items stay closed, and opening one never closes another."
            code={sources['open-by-default']}
            propsUsed={[{ part: 'Accordion.Item', prop: 'defaultOpen' }]}
          >
            <OpenByDefault />
          </UseCase>
          <UseCase
            id="find-in-page"
            title="A long FAQ that people search"
            why={
              <>
                On a long page of questions, residents search the page (Ctrl+F) for a word from an
                answer. Set <code>hiddenUntilFound</code> once on the root, and a browser that
                supports it opens the item that matches.
              </>
            }
            code={sources['find-in-page']}
            propsUsed={[{ part: 'Accordion.Root', prop: 'hiddenUntilFound' }]}
            note={
              <Note kind="tip">
                Chromium browsers such as Chrome and Edge can reveal a closed answer. In a browser
                that can’t, a match inside a closed answer isn’t found, and nothing else changes.
              </Note>
            }
          >
            <FindInPage />
          </UseCase>
          <UseCase
            id="regions"
            title="A few sections that people jump between"
            why={
              <>
                With <code>region</code>, each open answer is a landmark named by its question, so a
                screen reader user can jump between them.
              </>
            }
            code={sources['regions']}
            propsUsed={[{ part: 'Accordion.Panel', prop: 'region' }]}
            note={
              <Note kind="tip">
                Many open regions crowd a screen reader’s list of landmarks, and the heading already
                names each question. The ARIA Authoring Practices advise about six or fewer.
              </Note>
            }
          >
            <Regions />
          </UseCase>
          <UseCase
            id="as-a-list"
            title="As a list of items"
            why={
              <>
                If you want a screen reader to say how many questions there are, make the root a
                list and each item a list item. You choose the markup with <code>as</code>.
              </>
            }
            code={sources['as-a-list']}
            propsUsed={[
              { part: 'Accordion.Root', prop: 'as' },
              { part: 'Accordion.Item', prop: 'as' },
            ]}
            note={
              <Note kind="tip">
                The root adds <code>role=&quot;list&quot;</code> to a <code>&lt;ul&gt;</code> or{' '}
                <code>&lt;ol&gt;</code> itself, so it is still read as a list when the theme removes
                the bullets. Safari with VoiceOver drops the list otherwise.
              </Note>
            }
          >
            <AsAList />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Choose the heading level that fits your page’s outline, and write each button as the
                question (1.3.1 Info and Relationships, 2.4.6 Headings and Labels). Keep the words
                the same open and closed (2.5.3 Label in Name).
              </Note>
            ),
            focus: (
              <Note kind="reminder">
                If your page has a sticky header, set <code>scroll-padding-top</code> so it doesn’t
                cover the focused button (2.4.11 Focus Not Obscured (Minimum)).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Accordion, useAccordion } from '@kvirn-ui/react'"
          parts={parts}
          hook={useAccordionHook}
        />
      }
    />
  )
}
