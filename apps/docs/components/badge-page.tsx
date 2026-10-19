import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { badgeAttributes, badgeRows, useBadgeHook } from '../content/badge.api.ts'
import { CountInALink } from '../examples/badge/count-in-a-link.tsx'
import { DefaultBadge } from '../examples/badge/default.tsx'
import { StatusChanges } from '../examples/badge/status-changes.tsx'
import { StatusInList } from '../examples/badge/status-in-list.tsx'
import { WithContext } from '../examples/badge/with-context.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type BadgeExampleSources = Record<
  'default' | 'status-in-list' | 'with-context' | 'status-changes' | 'count-in-a-link',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Badge',
    renders: (
      <>
        <code>&lt;span class=&quot;kv-badge&quot;&gt;</code> with no role, no ARIA and no behaviour.
        It takes every attribute of an element and passes <code>ref</code> to it. The default theme
        is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: badgeRows,
    attributes: badgeAttributes,
  },
]

export function BadgePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: BadgeExampleSources
}) {
  return (
    <ComponentPage
      title="Badge"
      lead="It is plain text in the flow of the page: it can’t be pressed and it announces nothing."
      whenToUse={
        <ul>
          <li>
            Use a badge for a short status or category next to a title, in a list or in a summary:
            “Granted”, “Waiting for more information”.
          </li>
          <li>Always write the status in words. The colour is only a second cue.</li>
          <li>
            Keep it to one word or a few words. Long text belongs in a paragraph, and an important
            message belongs in an <Link href="/components/alert">Alert</Link>.
          </li>
          <li>
            Not for something the user can press: use a{' '}
            <Link href="/components/button">Button</Link> or a{' '}
            <Link href="/components/toggle">Toggle</Link>. Don’t make a badge look pressable.
          </li>
          <li>
            Not as a dot or an icon alone: an empty badge says nothing to a screen reader (software
            that reads the screen aloud).
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultBadge />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="status-in-a-list"
            title="A status for each case in a list"
            why={
              <>
                Each item says its status in words, with a hidden “Status:” before it so a screen
                reader says what the badge is. The variant adds a colour for those who see it: pick
                it by the role of the status, not by the colour you like. If each case has several
                details, use a <Link href="/components/table">Table</Link> instead.
              </>
            }
            code={sources['status-in-list']}
            propsUsed={[{ part: 'Badge', prop: 'variant' }]}
            note={
              <Note kind="tip">
                A change of status after the page has loaded isn’t announced by a Badge. See{' '}
                <Link href="#status-changes">A status that changes while the page is open</Link>.
              </Note>
            }
          >
            <StatusInList />
          </UseCase>
          <UseCase
            id="status-with-context"
            title="A status with a label in a summary"
            why="A badge next to a title reads as part of it. Where “Granted” alone is unclear, put it under a term that says what it is, such as “Status” in a description list."
            code={sources['with-context']}
            propsUsed={[{ part: 'Badge', prop: 'variant' }]}
          >
            <WithContext />
          </UseCase>
          <UseCase
            id="status-changes"
            title="A status that changes while the page is open"
            why="A badge is plain text, so a change in it makes no sound. When the person asks for the status again, change the badge and say the result in words. Announce it, and show the same words on the page."
            code={sources['status-changes']}
            propsUsed={[{ part: 'Badge', prop: 'variant' }]}
            note={
              <Note kind="reminder">
                If people need to hear the change, announce it yourself. A Badge never does (4.1.3
                Status Messages, Level AA).
              </Note>
            }
          >
            <StatusChanges />
          </UseCase>
          <UseCase
            id="count-in-a-link"
            title="A count of new items next to a link"
            why="A number alone says little, and a badge with no words says nothing to a screen reader. Write the count as words, such as “3 new”. The badge is plain text, so it is read as part of the link."
            code={sources['count-in-a-link']}
            propsUsed={[{ part: 'Badge', prop: 'variant' }]}
          >
            <CountInALink />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Write the status in words, every time. Colour alone doesn’t reach people who can’t
                see it or who see it differently (1.4.1 Use of Color).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Badge, useBadge } from '@kvirn-ui/react'"
          parts={parts}
          hook={useBadgeHook}
        />
      }
    />
  )
}
