import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import {
  kvirnSpeechEngineRows,
  readAloudButtonRows,
  readAloudNoteAttributes,
  readAloudNoteRows,
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
import type { Contract } from '../lib/contract-parser.ts'

export type ReadAloudExampleSources = Record<'default', string>

const importLines = `import { ReadAloud, useReadAloud } from '@kvirn-ui/read-aloud'
import { kvirnSpeechEngine } from '@kvirn-ui/core'`

const buttonRenders = (role: string) => (
  <>
    <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>
    {role}. It takes every attribute of a <code>&lt;button&gt;</code> and passes <code>ref</code> to
    it.
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
        <code>onKeyDown</code>, and passes <code>ref</code> to it. Renders nothing once it knows the
        page's language has no voice on the service. Put the other parts inside it. The default
        theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: useReadAloudRows,
    attributes: readAloudRootAttributes,
  },
  {
    name: 'ReadAloud.Play',
    renders: buttonRenders(
      ', named Listen, Listen to selected text while a selection is captured, or Pause while reading or getting the audio. It stays pressable while getting the audio, so pressing it is how you stop the wait',
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
        . Changing it changes the speed of the sentence already playing: no new request. It takes
        every attribute of a <code>&lt;select&gt;</code>.
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
        <code>&lt;label&gt;</code>. It renders only when there are two or more; while the list has
        not arrived from the service yet, it shows a loading message instead. Not in the recommended
        composition below: today only English has more than one voice.
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
        feedback. It shows the sentence position, that the audio is on its way, that a part was
        skipped, or why reading stopped.
      </>
    ),
    props: readAloudStatusRows,
    attributes: readAloudStatusAttributes,
  },
  {
    name: 'ReadAloud.Note',
    renders: (
      <>
        <code>&lt;p&gt;</code> naming who the text is sent to and that nothing is stored (
        <code>readAloud.note</code>), with your <code>howItWorksHref</code> as a link at the end.
        Renders nothing when <code>ReadAloud.Root</code> was given no <code>name</code>: there is no
        sensible text to show without knowing the recipient.
      </>
    ),
    props: readAloudNoteRows,
    attributes: readAloudNoteAttributes,
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
  {
    name: 'kvirnSpeechEngine',
    renders: (
      <>
        nothing: <code>kvirnSpeechEngine(options)</code> from <code>@kvirn-ui/core</code> returns
        the engine for Kvirn's voice service, for <code>useReadAloud</code>'s <code>engine</code>{' '}
        option. These are its options.
      </>
    ),
    props: kvirnSpeechEngineRows,
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
      pattern="APG Button (for the buttons)"
      lead="ReadAloud reads a page's text aloud, sentence by sentence, with the sentence being read shown on screen. It is not a substitute for a screen reader (software that reads the whole screen aloud), and it never starts by itself."
      whenToUse={
        <ul>
          <li>
            Offer it on text people may prefer to hear: a long guidance page, a decision letter, a
            notice. It helps a reader with dyslexia or low literacy, someone reading in their second
            language, a visitor with low vision, or anyone who is simply tired of reading.
          </li>
          <li>
            It is not aimed at screen-reader users: they already have a better reader, and ReadAloud
            must never fight it. Offer it to everyone and never hide it from assistive technology
            (software that people with disabilities use, such as a screen reader).
          </li>
          <li>
            Put it before the text it reads, in the page, never floating or in a menu. Don&rsquo;t
            start it automatically.
          </li>
          <li>
            Listen reads the whole text, or only the text the reader has selected (select with Shift
            and the arrow keys, then press Listen). Pause and Stop control it, and Previous and Next
            move one sentence at a time.
          </li>
          <li>
            Pressing Listen sends that page's text to Kvirn's voice service, which makes the audio.
            The service is Kvirn's own, hosted in the EU, sets no cookies and does not save the text
            or the audio. Nothing is sent before the reader presses Listen. Name the service in your
            own privacy notice, as the <code>Note</code> part already does on the page.
          </li>
          <li>
            Today the service has voices for Swedish, Norwegian (Bokmål) and English only. A page in
            Finnish or Norwegian Nynorsk gets no player at all: there is no voice to read it with.
            The voice list only arrives after the first press, so until your page declares its
            content language, the player can briefly appear before it disappears for one of these
            two languages.
          </li>
          <li>
            It is not for announcing a change in the page. Use the{' '}
            <Link href="/components/announcer">Announcer</Link> for that.
          </li>
        </ul>
      }
      example={
        <>
          <p>
            Press Listen to hear the article. Previous and Next move one sentence; Speed changes how
            fast it is read, without a new request. If the voice service at{' '}
            <code>NEXT_PUBLIC_KVIRN_VOICE_URL</code> (the local dev edge by default) isn't running,
            Status says the service can't be reached right now rather than the button doing nothing.
          </p>
          <ExampleFrame headingId="example" code={sources['default']}>
            <Player />
          </ExampleFrame>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Wrap your app in a <code>KvirnProvider</code>. The player announces its errors
                through it. Without it, a screen reader user hears nothing when reading stops (4.1.3
                Status Messages, level AA).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="tip">
                The default theme styles the player but not the sentence highlight. Where the
                browser supports it (the CSS Custom Highlight API), the sentence being read is
                registered as <code>::highlight(kv-read-aloud)</code>, and nothing paints it until
                you add that style. Where the browser doesn't, or you add no style, the Status text
                is the only cue to which sentence is playing.
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
          importLine={importLines}
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
                { key: 'pause', meaning: 'The name of Play while reading or getting the audio.' },
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
                  key: 'preparing',
                  meaning:
                    "The Status while the first or next chunk's audio is on its way. Announced once, past a one-second wait.",
                },
                {
                  key: 'errorServiceBusy',
                  meaning:
                    'The Status when the service is busy and the one automatic retry also failed. Also announced.',
                },
                {
                  key: 'errorServiceUnavailable',
                  meaning: "The Status when the service can't be reached. Also announced.",
                },
                {
                  key: 'errorPlayback',
                  meaning: "The Status when the browser couldn't play the audio. Also announced.",
                },
                {
                  key: 'errorNoVoice',
                  meaning:
                    'Shown beside the article where you choose to, for a language with no voice.',
                  values: { language: 'English' },
                },
                {
                  key: 'partSkipped',
                  meaning:
                    'The Status after a passage with no voice, or too long for the service, was skipped. Shown only, never announced.',
                },
                {
                  key: 'voicesLoading',
                  meaning: 'Shown by the Voice select while the voice list has not arrived yet.',
                },
                {
                  key: 'note',
                  meaning: "The Note part's text, naming who receives the text.",
                  values: { name: 'Kvirn’s voice service' },
                },
                { key: 'howItWorks', meaning: "The Note part's link text." },
              ]}
            />
          }
        />
      }
    />
  )
}
