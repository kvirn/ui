import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  readAloudButtonRows,
  readAloudPlayAttributes,
  readAloudRootAttributes,
  readAloudSelectAttributes,
  readAloudSelectionTriggerAttributes,
  readAloudSelectRows,
  readAloudStatusAttributes,
  readAloudStatusRows,
  useReadAloudResultRows,
  useReadAloudRows,
} from '../content/read-aloud.api.ts'
import { Player } from '../examples/read-aloud/default.tsx'
import { MinimalPlayer } from '../examples/read-aloud/minimal.tsx'
import { SwedishContent } from '../examples/read-aloud/swedish-content.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ReadAloudExampleSources = Record<'default' | 'minimal' | 'swedish-content', string>

const buttonRenders = (role: string) => (
  <>
    <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>
    {role}. It takes every attribute of a <code>&lt;button&gt;</code> and passes <code>ref</code> to
    it. It renders nothing when the browser cannot read text aloud.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'ReadAloud.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the role <code>group</code>, named by the message{' '}
        <code>readAloud.label</code>. It takes the options of <code>useReadAloud</code> as props and
        every attribute of a <code>&lt;div&gt;</code>. Put the other parts inside it. The default
        theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: useReadAloudRows,
    attributes: readAloudRootAttributes,
  },
  {
    name: 'ReadAloud.Play',
    renders: buttonRenders(
      ', named Listen, Listen to selected text while a selection is captured, or Pause while reading',
    ),
    props: readAloudButtonRows,
    attributes: readAloudPlayAttributes,
  },
  {
    name: 'ReadAloud.Previous',
    renders: buttonRenders(
      ', named Previous sentence. It stays focusable with aria-disabled while idle',
    ),
    props: readAloudButtonRows,
  },
  {
    name: 'ReadAloud.Next',
    renders: buttonRenders(
      ', named Next sentence. It stays focusable with aria-disabled while idle',
    ),
    props: readAloudButtonRows,
  },
  {
    name: 'ReadAloud.Stop',
    renders: buttonRenders(', named Stop. It stays focusable with aria-disabled while idle'),
    props: readAloudButtonRows,
  },
  {
    name: 'ReadAloud.Rate',
    renders: (
      <>
        A native <code>&lt;select&gt;</code> of the speeds with a visible <code>&lt;label&gt;</code>
        . It takes every attribute of a <code>&lt;select&gt;</code> and renders nothing when the
        browser cannot read text aloud.
      </>
    ),
    props: readAloudSelectRows,
    attributes: readAloudSelectAttributes,
  },
  {
    name: 'ReadAloud.Voice',
    renders: (
      <>
        A native <code>&lt;select&gt;</code> of the voices for the content language, with a visible{' '}
        <code>&lt;label&gt;</code>. It renders only when there are two or more voices.
      </>
    ),
    props: readAloudSelectRows,
    attributes: readAloudSelectAttributes,
  },
  {
    name: 'ReadAloud.Status',
    renders: (
      <>
        <code>&lt;span&gt;</code> with <code>role=&quot;status&quot;</code> and{' '}
        <code>aria-live=&quot;off&quot;</code>: findable, but silent, since the speech is the
        feedback. It shows the sentence position, or why nothing is read, and it is the only part
        left when the browser cannot read text aloud.
      </>
    ),
    props: readAloudStatusRows,
    attributes: readAloudStatusAttributes,
  },
  {
    name: 'ReadAloud.SelectionTrigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> in the top layer, shown below a
        selection made with a pointer. It never takes focus and is not a Tab stop: the keyboard path
        is Play. It is named <code>Listen to selected text</code> and takes every attribute of a{' '}
        <code>&lt;button&gt;</code>.
      </>
    ),
    props: readAloudButtonRows,
    attributes: readAloudSelectionTriggerAttributes,
  },
]

export function ReadAloudPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ReadAloudExampleSources
}) {
  return (
    <ComponentPage
      title="ReadAloud"
      lead="A player that reads a region of the page aloud, one sentence at a time, with the browser’s own speech. It never starts by itself, and it is not a substitute for a screen reader. Blocked: waiting for an npm package update and a re-test."
      status="in-planning"
      whenToUse={
        <ul>
          <li>
            Use it on text that people may prefer to hear: a long guidance page, a decision, a
            notice.
          </li>
          <li>
            Put it before the text it reads, and offer it to everyone. Don&rsquo;t start it
            automatically and don&rsquo;t hide it from assistive technology.
          </li>
          <li>
            It uses the voices on the user&rsquo;s device and sends nothing to a server. A browser
            may have no voice for a language, or none at all, and the player then says so.
          </li>
          <li>
            It is not for announcing a change in the page. Use the{' '}
            <Link href="/components/announcer">Announcer</Link> for that.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <Player />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="read-an-article"
            title="Read an article"
            why="Listen reads the whole article, then Pause and Stop control it, and Previous and Next move a sentence. Select text first and Listen reads only the selection. In a browser without speech, the player shows only a status text instead of buttons that cannot work."
            code={sources['default']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'contentRef' }]}
            note={
              <Note kind="tip">
                Reading a selection collapses it, so the browser&rsquo;s selection colour does not
                hide the sentence highlight. The Status shows the position as well, so the highlight
                is never the only cue.
              </Note>
            }
          >
            <Player />
          </UseCase>
          <UseCase
            id="small-player"
            title="Only the controls you need"
            why="Every part is optional. Leave out Rate, Voice, Previous and Next for a short text. Mark text that must not be read, such as a reference number, with data-kv-read-aloud-skip."
            code={sources['minimal']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'contentRef' }]}
          >
            <MinimalPlayer />
          </UseCase>
          <UseCase
            id="language-of-the-text"
            title="Text in another language than the page"
            why="Each sentence is read with a voice for its own language, never a voice of another one. Set lang on the content, or pass lang to the player. If the device has no voice for it, reading stops, the Status names the language and the player says so once."
            code={sources['swedish-content']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'lang' }]}
            note={
              <Note kind="reminder">
                Set <code>lang</code> on the content: it picks the voice. See{' '}
                <Link href="#what-you-need-to-do">what you need to do</Link>.
              </Note>
            }
          >
            <SwedishContent />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { ReadAloud, useReadAloud } from '@kvirn-ui/react'"
          parts={parts}
          hook={{
            name: 'useReadAloud',
            intro: (
              <>
                Returns the prop objects of every part (<code>rootProps</code>,{' '}
                <code>playProps</code> and so on), the labels and the state. Use it to build the
                player with your own markup.
              </>
            ),
            options: useReadAloudRows,
            result: useReadAloudResultRows,
          }}
          strings={
            <StringsBlock
              namespace="readAloud"
              component="ReadAloud"
              layout="table"
              keys={[
                { key: 'label', meaning: 'The name of the group.' },
                { key: 'play', meaning: 'The name of Play while idle.' },
                {
                  key: 'playSelection',
                  meaning:
                    'The name of Play while a selection is captured, and of the selection trigger.',
                },
                { key: 'pause', meaning: 'The name of Play while reading.' },
                { key: 'previous', meaning: 'The name of Previous.' },
                { key: 'next', meaning: 'The name of Next.' },
                { key: 'stop', meaning: 'The name of Stop.' },
                { key: 'rate', meaning: 'The label of the speed select.' },
                { key: 'voice', meaning: 'The label of the voice select.' },
                {
                  key: 'rateOption',
                  meaning: 'One speed in the select.',
                  values: { rate: 1.5 },
                },
                {
                  key: 'position',
                  meaning: 'The Status while reading.',
                  values: { current: 3, total: 12 },
                },
                {
                  key: 'positionPaused',
                  meaning: 'The Status while paused.',
                  values: { current: 3, total: 12 },
                },
                {
                  key: 'noVoice',
                  meaning:
                    'The Status when the device has no voice for the language. Also announced.',
                  values: { language: 'English' },
                },
                {
                  key: 'speechError',
                  meaning: 'The Status when the speech engine failed. Also announced.',
                },
                {
                  key: 'unsupported',
                  meaning: 'The Status when the browser cannot read text aloud.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
