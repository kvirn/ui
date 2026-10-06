import { Link } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
import { ApiBlock } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { announceOptionRows, useAnnouncerResultRows } from '../content/announcer.api.ts'
import { AssertiveAnnouncer } from '../examples/announcer/assertive.tsx'
import { DefaultAnnouncer } from '../examples/announcer/default.tsx'
import { ThrottledAnnouncer } from '../examples/announcer/throttled.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AnnouncerExampleSources = Record<'default' | 'assertive' | 'throttled', string>

export function AnnouncerPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AnnouncerExampleSources
}) {
  return (
    <ComponentPage
      title="Announcer"
      lead="The shared live regions that tell screen reader users something changed without moving focus. You call a hook, and the outermost KvirnProvider renders the regions."
      status="alpha"
      whenToUse={
        <ul>
          <li>
            Use it for a change a screen reader user can’t otherwise perceive without moving focus:
            a count, a result, a rejected character, a finished upload.
          </li>
          <li>
            Don’t announce what focus already reads, such as a focused control’s own label or state,
            and don’t add your own <code>role=&quot;status&quot;</code> or <code>aria-live</code>{' '}
            for the same message: it would be read twice.
          </li>
          <li>
            For a status message that is also shown on the page, use an{' '}
            <Link href="/components/alert">Alert</Link> with <code>announce</code>. It calls the
            Announcer for you.
          </li>
          <li>
            There is no component to render and no text of its own: you pass a message already
            translated.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultAnnouncer />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="assertive"
            title="Something to act on now"
            why="Assertive interrupts the screen reader, so keep it for what the user must act on right now, such as a session that has ended. Use it rarely."
            code={sources['assertive']}
            propsUsed={[
              { part: apiHookPart('announce', 'options'), label: 'announce', prop: 'politeness' },
            ]}
          >
            <AssertiveAnnouncer />
          </UseCase>
          <UseCase
            id="repeating-messages"
            title="A message that can repeat quickly"
            why="Typing or holding a key can send the same message again and again. Give it a key, such as the field’s id, and later messages with that key are dropped for three seconds."
            code={sources['throttled']}
            propsUsed={[
              { part: apiHookPart('announce', 'options'), label: 'announce', prop: 'key' },
            ]}
            note={
              <Note kind="tip">
                Two messages of the same politeness within 100 ms replace each other. Batch related
                changes into one sentence.
              </Note>
            }
          >
            <ThrottledAnnouncer />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <>
          <ApiBlock
            importLine="import { useAnnouncer } from '@kvirn-ui/react'"
            parts={[]}
            hooks={[
              {
                name: 'useAnnouncer',
                intro: 'Takes no options. The provider renders the live regions.',
                result: useAnnouncerResultRows,
              },
              { name: 'announce', options: announceOptionRows },
            ]}
          />
          <CodeBlock
            code={`const { announce } = useAnnouncer()\nannounce(messages.saved, { politeness: 'polite', key: 'save' })`}
          />
        </>
      }
    />
  )
}
