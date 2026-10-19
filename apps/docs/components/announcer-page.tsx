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
import { AutosaveAnnouncer } from '../examples/announcer/autosave.tsx'
import { DefaultAnnouncer } from '../examples/announcer/default.tsx'
import { InsideDialog } from '../examples/announcer/inside-dialog.tsx'
import { ResultCountAnnouncer } from '../examples/announcer/results.tsx'
import { ThrottledAnnouncer } from '../examples/announcer/throttled.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AnnouncerExampleSources = Record<
  'default' | 'results' | 'assertive' | 'throttled' | 'inside-dialog' | 'autosave',
  string
>

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
      lead="A live region is a part of the page that a screen reader (software that reads the screen aloud) speaks when its text changes. You send a message with a hook, and the outermost KvirnProvider holds the live regions."
      whenToUse={
        <ul>
          <li>
            Use it for a change a screen reader user can’t otherwise perceive without moving focus:
            a count, a result, a rejected character, a finished upload.
          </li>
          <li>
            Don’t announce what focus already reads, such as a focused control’s own label or state.
            Don’t add your own <code>role=&quot;status&quot;</code> or <code>aria-live</code> for
            the same message either: it would be read twice.
          </li>
          <li>
            Keep a message short, with the number or the name in it: “3 services found”, not “The
            list has been updated”. Send it from an event handler or an effect, never while the
            component renders.
          </li>
          <li>
            For a status message that is also shown on the page, use an{' '}
            <Link href="/components/alert">Alert</Link> with <code>announce</code>. It calls the
            Announcer for you.
          </li>
          <li>
            There is no part to render. You call a hook and pass a message that is already
            translated, because the Announcer has no text of its own.
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
            id="result-count"
            title="Say how many results there are"
            why="A search list changes while the user types and focus stays in the field. Show the count on the page, and send the same words to the Announcer once the user pauses, so people who can’t see the list hear the result too."
            code={sources['results']}
            note={
              <Note kind="tip">
                Showing the message on the page as well is right: not everyone hears it. The visible
                text is not a live region, so it is not read twice.
              </Note>
            }
          >
            <ResultCountAnnouncer />
          </UseCase>
          <UseCase
            id="assertive"
            title="Something to act on now"
            why="Assertive interrupts the screen reader, so keep it for what the user must act on right now, such as a session that has ended. Use it rarely. An announcement after a session has expired is not enough: warn before it expires and let people extend it (2.2.1 Timing Adjustable, A), for example with an AlertDialog."
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
          <UseCase
            id="inside-dialog"
            title="A message from inside a dialog"
            why="A modal dialog makes the rest of the page silent, including the page’s live regions. A Dialog or an AlertDialog has its own live regions while it is open, so a message sent from a component inside it is still spoken. You call announce as usual."
            code={sources['inside-dialog']}
            note={
              <Note kind="reminder">
                Call <code>useAnnouncer</code> in a component that sits inside the dialog, as{' '}
                <code>FreeTimes</code> does here. Inside a dialog you build yourself, with a native{' '}
                <code>&lt;dialog&gt;</code> or <code>inert</code>, put a live region of your own
                inside it (4.1.3 Status Messages, AA).
              </Note>
            }
          >
            <InsideDialog />
          </UseCase>
          <UseCase
            id="autosave"
            title="A draft that saves itself"
            why="A form saves the draft each time a field loses focus, so tabbing through it saves many times. Show “Draft saved” on the page each time, and give the spoken message a key and a longer window, so it is read at most once every 30 seconds."
            code={sources['autosave']}
            propsUsed={[
              { part: apiHookPart('announce', 'options'), label: 'announce', prop: 'key' },
              {
                part: apiHookPart('announce', 'options'),
                label: 'announce',
                prop: 'throttleMilliseconds',
              },
            ]}
            note={
              <Note kind="tip">
                A throttled message is dropped, not delayed. That suits a message that never
                changes. For a count that changes, wait until the user pauses and send the latest
                value, as in the search above.
              </Note>
            }
          >
            <AutosaveAnnouncer />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Mount KvirnProvider once, at the top of your app and outside any form. Without it,{' '}
                <code>announce</code> does nothing and screen reader users hear nothing (4.1.3
                Status Messages, AA). Set the page language to the provider’s language too: the live
                regions have no language of their own (3.1.1 Language of Page, A).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If an issue here affects your service, list it in your accessibility statement with
                its workaround.
              </Note>
            ),
          }}
        />
      }
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
