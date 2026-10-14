import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  cardBodyAttributes,
  cardFooterAttributes,
  cardHeaderAttributes,
  cardPartRows,
  cardRootAttributes,
  cardRootRows,
  useCardResult,
} from '../content/card.api.ts'
import { CardWithActions } from '../examples/card/actions.tsx'
import { ArticleCard } from '../examples/card/article.tsx'
import { DefaultCard } from '../examples/card/default.tsx'
import { CardWithDividers } from '../examples/card/dividers.tsx'
import { NewsList } from '../examples/card/list.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CardExampleSources = Record<
  'default' | 'actions' | 'list' | 'article' | 'dividers',
  string
>

const partRenders = (element: string) => (
  <>
    <code>&lt;{element}&gt;</code> with no role. It takes every attribute of a{' '}
    <code>&lt;{element}&gt;</code> and passes <code>ref</code> to it. The default theme is described
    on <Link href="/foundation/theming">Theming</Link>.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'Card.Root',
    renders: (
      <>
        {partRenders('div')} Also exported as <code>CardRoot</code>.
      </>
    ),
    props: cardRootRows,
    attributes: cardRootAttributes,
  },
  {
    name: 'Card.Header',
    renders: (
      <>
        {partRenders('div')} Never a <code>&lt;header&gt;</code>, which would be a page landmark.
        Also exported as <code>CardHeader</code>.
      </>
    ),
    props: cardPartRows,
    attributes: cardHeaderAttributes,
  },
  {
    name: 'Card.Body',
    renders: (
      <>
        {partRenders('div')} Also exported as <code>CardBody</code>.
      </>
    ),
    props: cardPartRows,
    attributes: cardBodyAttributes,
  },
  {
    name: 'Card.Footer',
    renders: (
      <>
        {partRenders('div')} Never a <code>&lt;footer&gt;</code>, which would be a page landmark.
        Also exported as <code>CardFooter</code>.
      </>
    ),
    props: cardPartRows,
    attributes: cardFooterAttributes,
  },
]

export function CardPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: CardExampleSources
}) {
  return (
    <ComponentPage
      title="Card"
      lead="It groups what belongs together on a raised surface and adds no role, text or behaviour of its own."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a card for one thing that a resident or a case worker looks at as a unit: a service,
            a news item, a case.
          </li>
          <li>
            Put a heading at the top and, if the card leads somewhere, one link in the heading.
            Actions go in the footer as buttons.
          </li>
          <li>
            A list of cards is a list: render each card as a list item, so a screen reader (software
            that reads the screen aloud) says how many there are.
          </li>
          <li>
            Not for a region of the page, such as a sidebar or a band of content: use a{' '}
            <Link href="/components/section">Section</Link>. A card on a section is fine, a section
            inside a card isn’t.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultCard />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="service-with-actions"
            title="A service with actions"
            why="Use it when a card is a service the user can act on. The text goes in the body, with the heading first, and the actions go in the footer: one primary button, the rest secondary."
            code={sources['actions']}
            propsUsed={[
              { part: 'Card.Body', prop: 'className' },
              { part: 'Card.Footer', prop: 'className' },
            ]}
          >
            <CardWithActions />
          </UseCase>
          <UseCase
            id="list-of-cards"
            title="A list of news items"
            why="Several cards of the same kind are a list. Make each card a list item with as, so a screen reader announces how many items there are. Give each card one link, in its heading, with text that makes sense on its own."
            code={sources['list']}
            propsUsed={[{ part: 'Card.Root', prop: 'as' }]}
            note={
              <Note kind="reminder">
                Put <code>role=&quot;list&quot;</code> on a hand-written <code>&lt;ul&gt;</code>.
                The default theme draws no marker on a card, and Safari with VoiceOver can then read
                the list as a plain group (1.3.1 Info and Relationships). A{' '}
                <Link href="/components/stack">Stack</Link> as a <code>&lt;ul&gt;</code> adds it for
                you.
              </Note>
            }
          >
            <NewsList />
          </UseCase>
          <UseCase
            id="story-that-stands-alone"
            title="A story that stands on its own"
            why={
              <>
                Render the card as an <code>&lt;article&gt;</code> when it is a self-contained item,
                such as a news story, and name it with <code>aria-labelledby</code> pointing at its
                heading. An <code>&lt;article&gt;</code> is not a landmark, so many of them don’t
                crowd a screen reader’s list of landmarks.
              </>
            }
            code={sources['article']}
            propsUsed={[{ part: 'Card.Root', prop: 'as' }]}
          >
            <ArticleCard />
          </UseCase>
          <UseCase
            id="parts-with-dividers"
            title="A case with a divider between its parts"
            why="A card for staff or a dense page can mark its parts with a line and use less padding. Put the heading in the header, the content in the body and the action in the footer."
            code={sources['dividers']}
            propsUsed={[{ part: 'Card.Root', prop: 'className' }]}
          >
            <CardWithDividers />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Choose the heading level the page’s outline needs, because Card can’t know it (2.4.6
                Headings and Labels). Give a decorative image <code>alt=&quot;&quot;</code>, and put
                one link per card in the heading, with text that makes sense on its own (1.1.1
                Non-text Content, 2.4.4 Link Purpose (In Context)).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <>
          <ApiBlock
            importLine="import { Card, useCard } from '@kvirn-ui/react'"
            parts={parts}
            hook={{ name: 'useCard', intro: 'Takes no options.', result: useCardResult }}
          />
          <CodeBlock
            code={`const card = useCard()\n<section {...card.rootProps} aria-labelledby={headingId}>\n  <div {...card.bodyProps}>…</div>\n</section>`}
          />
        </>
      }
    />
  )
}
