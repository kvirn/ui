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
    props: cardPartRows,
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
      lead="A container for one thing on the page, such as a service, a news item or a case. It groups what belongs together on a raised surface and adds no role, text or behaviour of its own."
      status="alpha"
      whenToUse={
        <ul>
          <li>
            Use a card for one identifiable thing a resident or a case worker looks at as a unit: a
            service, a news item, a case.
          </li>
          <li>
            Put a heading at the top and, if the card leads somewhere, one link in the heading.
            Actions go in the footer as buttons.
          </li>
          <li>
            A list of cards is a list: render each card as a list item, so a screen reader says how
            many there are.
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
            propsUsed={[{ part: 'Card.Root', prop: 'className' }]}
            note={
              <Note kind="reminder">
                Card can’t know the heading level, so you choose the one the page’s outline needs.
                See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <CardWithActions />
          </UseCase>
          <UseCase
            id="list-of-cards"
            title="A list of news items"
            why="Several cards of the same kind are a list. Render each card as a list item with render, so a screen reader announces how many items there are. Give each card one link, in its heading, with text that makes sense on its own."
            code={sources['list']}
            propsUsed={[{ part: 'Card.Root', prop: 'render' }]}
            note={
              <Note kind="tip">
                The default theme draws no marker on a card, and Safari with VoiceOver can then read
                the list as a plain group. <code>role=&quot;list&quot;</code> on the{' '}
                <code>&lt;ul&gt;</code> keeps it a list. This example leaves it out only because
                KvirnUI’s own linter rejects it as redundant.
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
                such as a news story. Name it with <code>aria-labelledby</code> pointing at its
                heading. Use a landmark only where a user would want to jump to it, and never for
                every card in a list.
              </>
            }
            code={sources['article']}
            propsUsed={[{ part: 'Card.Root', prop: 'render' }]}
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
      contract={<ContractSectionsView contract={contract} />}
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
