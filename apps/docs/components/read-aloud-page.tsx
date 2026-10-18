import { Link } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
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
import { PlayerInsideContent } from '../examples/read-aloud/inside-content.tsx'
import { MinimalPlayer } from '../examples/read-aloud/minimal.tsx'
import { OwnPlayer } from '../examples/read-aloud/own-markup.tsx'
import { SwedishContent } from '../examples/read-aloud/swedish-content.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ReadAloudExampleSources = Record<
  'default' | 'minimal' | 'swedish-content' | 'inside-content' | 'own-markup',
  string
>

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
        every attribute of a <code>&lt;div&gt;</code> except <code>lang</code> and{' '}
        <code>onKeyDown</code>, and passes <code>ref</code> to it. Put the other parts inside it.
        The default theme is described on <Link href="/foundation/theming">Theming</Link>.
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
        feedback. It shows the sentence position, or why nothing is read. With the group, it is the
        only part left when the browser cannot read text aloud.
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
      lead="It never starts by itself, and it is not a substitute for a screen reader (software that reads the whole screen aloud)."
      whenToUse={
        <ul>
          <li>
            Use it on text that people may prefer to hear: a long guidance page, a decision, a
            notice.
          </li>
          <li>
            Put it before the text it reads, and offer it to everyone. Don&rsquo;t start it
            automatically and don&rsquo;t hide it from assistive technology (software that people
            with disabilities use, such as a screen reader).
          </li>
          <li>
            Listen reads the whole text, or only the text the reader has selected. Pause and Stop
            control it, and Previous and Next move one sentence. To select with the keyboard, use
            Shift and the arrow keys, then press Listen.
          </li>
          <li>
            By default it uses only voices stored on the user&rsquo;s device, so the text is not
            sent anywhere. A device may have no voice for a language, or none at all, and the player
            then says so. In a browser that can&rsquo;t read text aloud, the player shows only a
            status text, not buttons that cannot work.
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
            id="small-player"
            title="A short notice with a simple player"
            why="Every part is optional. For a short text, leave out Speed, Voice, Previous and Next. Mark text that must not be read, such as a reference number, with data-kv-read-aloud-skip."
            code={sources['minimal']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'contentRef' }]}
          >
            <MinimalPlayer />
          </UseCase>
          <UseCase
            id="language-of-the-text"
            title="Text in another language than the page"
            why="The article below is in Swedish, and its element is marked as Swedish with the lang attribute. It says the same as the first paragraph of the main example: how to apply for a building permit. The player reads each sentence with a voice for that sentence’s own language, and never with a voice for another language. If the device has no voice for it, reading stops, the Status names the language and a screen reader announces it. The tests use a fake speech engine, so what you hear depends on the voices on your device."
            code={sources['swedish-content']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'contentRef' }]}
            note={
              <Note kind="reminder">
                Set <code>lang</code> on your own element around the content: it picks the voice.
                The player takes no <code>lang</code> itself. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <SwedishContent />
          </UseCase>
          <UseCase
            id="player-inside-the-text"
            title="A player at the top of a notice"
            why="Put the player inside the element it reads, with the notice. One ref covers the whole notice, and the player never reads its own button names or status text."
            code={sources['inside-content']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'contentRef' }]}
          >
            <PlayerInsideContent />
          </UseCase>
          <UseCase
            id="your-own-markup"
            title="One Listen button in your own markup"
            why={
              <>
                When a design has room for only one button, call <code>useReadAloud</code> and
                spread its props on your own elements. This notice gets a Listen button that becomes
                Pause, and the position as text. In a browser that can’t read text aloud,{' '}
                <code>isSupported</code> is false and only the status text is shown.
              </>
            }
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useReadAloud', 'result'),
                label: 'useReadAloud (result)',
                prop: 'isSupported',
              },
              {
                part: apiHookPart('useReadAloud', 'result'),
                label: 'useReadAloud (result)',
                prop: 'rootProps',
              },
            ]}
            note={
              <Note kind="tip">
                Spread <code>rootProps</code> on the element around the controls. It gives the group
                its name and makes Escape stop the reading, as in the other examples.
              </Note>
            }
          >
            <OwnPlayer />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'visual-and-modes': (
              <Note kind="tip">
                The default theme styles the player but not the sentence highlight. The sentence is
                registered as <code>::highlight(kv-read-aloud)</code>, and nothing paints it until
                you add that style. The Status text gives the position.
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
