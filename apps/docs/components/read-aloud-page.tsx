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
  kvirnSpeechEngineRows,
  readAloudBarAttributes,
  readAloudBarRows,
  readAloudButtonRows,
  readAloudHideAttributes,
  readAloudHideRows,
  readAloudNoteAttributes,
  readAloudNoteRows,
  readAloudPlayAttributes,
  readAloudProgressAttributes,
  readAloudRootAttributes,
  readAloudSelectAttributes,
  readAloudSelectionTriggerAttributes,
  readAloudSelectRows,
  readAloudSettingsAttributes,
  readAloudSettingsRows,
  readAloudStatusAttributes,
  readAloudStatusRows,
  readAloudTransportAttributes,
  readAloudTransportRows,
  readAloudWhenStartedRows,
  useReadAloudResultRows,
  useReadAloudRows,
} from '../content/read-aloud.api.ts'
import { BarLayout } from '../examples/read-aloud/bar.tsx'
import { CmsMarkers } from '../examples/read-aloud/cms-markers.tsx'
import { Player } from '../examples/read-aloud/default.tsx'
import { IdlePanel } from '../examples/read-aloud/idle-panel.tsx'
import { LanguageOfParts } from '../examples/read-aloud/language.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ReadAloudExampleSources = Record<
  'default' | 'bar' | 'cms-markers' | 'language' | 'idle-panel',
  string
>

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
    name: 'ReadAloud.Progress',
    renders: (
      <>
        <code>&lt;p aria-hidden=&quot;true&quot;&gt;</code> wrapping the fill: the sentence meter.
        No <code>progressbar</code> or <code>slider</code> role, no handle, nothing to drag — it is
        informative only, since <code>ReadAloud.Status</code> already carries the position in words.
        Renders nothing while idle.
      </>
    ),
    attributes: readAloudProgressAttributes,
  },
  {
    name: 'ReadAloud.Play',
    renders: buttonRenders(
      ', named Listen, Listen to selected text while a selection is captured, or Pause while reading or getting the audio. It stays pressable while getting the audio, so pressing it is how you stop the wait. A play/pause icon sits before the word, decorative, and is replaced by a spinner past 300 ms of getting the audio',
    ),
    props: readAloudButtonRows,
    attributes: readAloudPlayAttributes,
  },
  {
    name: 'ReadAloud.Transport',
    renders: (
      <>
        <code>&lt;div&gt;</code> grouping <code>ReadAloud.Previous</code> and{' '}
        <code>ReadAloud.Next</code>: the cluster, its gap, and Stop's separation from it. Adds no
        Tab stop and no role. It takes every attribute of a <code>&lt;div&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    props: readAloudTransportRows,
    attributes: readAloudTransportAttributes,
  },
  {
    name: 'ReadAloud.Previous',
    renders: buttonRenders(
      ', named Previous sentence. It stays focusable with aria-disabled while idle. A decorative icon sits before the word',
    ),
    props: readAloudButtonRows,
  },
  {
    name: 'ReadAloud.Next',
    renders: buttonRenders(
      ', named Next sentence. It stays focusable with aria-disabled while idle. A decorative icon sits before the word',
    ),
    props: readAloudButtonRows,
  },
  {
    name: 'ReadAloud.Stop',
    renders: buttonRenders(
      ', named Stop. It stays focusable with aria-disabled while idle. A decorative icon sits before the word',
    ),
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
        not arrived from the service yet, it shows a loading message instead. Not in any composition
        on this page: today only English has more than one voice.
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
        <code>&lt;p&gt;</code> naming who the text is sent to, and saying that nothing is stored (
        <code>readAloud.note</code>) or that the audio may be (<code>readAloud.noteStored</code>,
        when you set <code>store: true</code>), with your <code>howItWorksHref</code> as a link at
        the end. Renders nothing when <code>ReadAloud.Root</code> was given no <code>name</code>:
        there is no sensible text to show without knowing the recipient.
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
    name: 'ReadAloud.Bar',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role or name of its own: it sits inside{' '}
        <code>ReadAloud.Root</code>'s own group, which is named <code>readAloud.barLabel</code>{' '}
        while a Bar is mounted. Its default content is a <code>Toolbar</code> of Previous, Play,
        Next, Stop and Settings (one Tab stop), a status count, and Hide. It takes every attribute
        of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: readAloudBarRows,
    attributes: readAloudBarAttributes,
  },
  {
    name: 'ReadAloud.Settings',
    renders: (
      <>
        A <code>Popover</code> trigger button, icon-only and named by{' '}
        <code>readAloud.settings</code>, opening a menu with Speed, Voice and the recipient note.
        One part works both standalone in the panel and as a toolbar item in the Bar. It takes every
        attribute of a <code>&lt;button&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: readAloudSettingsRows,
    attributes: readAloudSettingsAttributes,
  },
  {
    name: 'ReadAloud.Hide',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, icon-only and named by{' '}
        <code>readAloud.hide</code>. <code>ReadAloud.Bar</code> only. Collapses the Bar to its one
        Play button and moves focus there. Renders nothing once reading has started: hiding the only
        Pause would leave no way to stop it.
      </>
    ),
    props: readAloudHideRows,
    attributes: readAloudHideAttributes,
  },
  {
    name: 'ReadAloud.WhenStarted',
    renders: (
      <>
        Nothing of its own: its children only, once reading has started at least once, and nothing
        before. It never goes back to showing nothing. It reads the <code>ReadAloud.Root</code> it
        is inside, so there is still one engine, not a second one built separately.
      </>
    ),
    props: readAloudWhenStartedRows,
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
      pattern="APG Button (for the buttons), APG Toolbar (for the Bar's transport)"
      lead="ReadAloud reads a page's text aloud, sentence by sentence, and shows which sentence in words. It is not a substitute for a screen reader (software that reads the whole screen aloud), and it never starts by itself."
      whenToUse={
        <ul>
          <li>
            Offer it on text people may prefer to hear: a long guidance page, a decision letter, a
            notice. It helps someone with dyslexia, low literacy or a cognitive disability, a reader
            using their second language, a visitor with low vision, or anyone who is tired or doing
            something else at the same time.
          </li>
          <li>
            It is not aimed at screen-reader users: they already have a better reader, and ReadAloud
            must never fight it. Offer it to everyone and never hide it from assistive technology
            (software that people with disabilities use, such as a screen reader).
          </li>
          <li>
            There are two ways to offer it. The panel sits beside one article, with full-word
            buttons (<code>Listen</code>, <code>Previous sentence</code>, <code>Next sentence</code>
            , <code>Stop</code>): add one wherever you have a long text. The{' '}
            <code>ReadAloud.Bar</code> sits once in your page layout and reads whichever page the
            visitor is on, with Previous, Next, Stop and Settings as icons and the word kept on
            Play: choose it for listening everywhere without adding anything to each page. Both
            share one Settings menu for speed and voice.
          </li>
          <li>
            Put the panel directly before the text it reads, in the normal flow of the page — never
            floating, never in a menu. The bar is different: it sits at the top of every page, above
            the site&rsquo;s own navigation, and only becomes sticky while it is reading, so it
            never covers anything before a visitor has pressed anything. Neither player starts by
            itself.
          </li>
          <li>
            Listen reads the whole text, or only the text the reader has selected (select with Shift
            and the arrow keys, then press Listen). Pause and Stop control it, and Previous and Next
            move one sentence at a time.
          </li>
          <li>
            Pressing Listen sends that page's text to Kvirn's voice service, which turns it into
            speech. The service is Kvirn's own, hosted in the EU, sets no cookies and, by default,
            does not save the text or the audio — unless you opt in with <code>store: true</code>,
            which is only for public page text, never for anything that could contain an identity
            number. The player's recipient sentence changes its own wording to match. Nothing is
            sent before the reader presses Listen. Each player already tells the visitor who
            receives the text — the <code>Note</code> part in the panel, or the Settings menu in the
            bar — but linking your own explanation of how listening works, and naming the service in
            your privacy notice, is still your own job.
          </li>
          <li>
            Today the service has voices for Swedish, Norwegian (Bokmål) and English only. A page in
            Finnish or Norwegian Nynorsk gets no player at all, not even for a moment: the check
            happens before anything is shown, so nothing flashes on screen.
          </li>
          <li>
            The voice always follows the text's own declared language, never the page's interface
            language. A Finnish municipality can run a Finnish interface around Swedish-language
            content, and it still reads in Swedish.
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
            fast it is read, without a new request. If the voice service isn&rsquo;t running (it
            reads the address from an environment variable, and uses a local address during
            development), Status says it can&rsquo;t be reached right now, rather than the button
            doing nothing.
          </p>
          <ExampleFrame headingId="example" code={sources['default']}>
            <Player />
          </ExampleFrame>
        </>
      }
      useCases={
        <>
          <UseCase
            id="idle-panel"
            title="A quiet panel that only shows controls once you start listening"
            why={
              <>
                At rest, show only Listen. A row of controls that do nothing yet — a disabled
                Previous and Next, an empty progress bar — can look broken. Wrap the rest in{' '}
                <code>ReadAloud.WhenStarted</code>: it appears once you press Listen, in the same
                place, so the button under your finger does not move, and it never collapses back
                once reading has started.
              </>
            }
            code={sources['idle-panel']}
          >
            <IdlePanel />
          </UseCase>
          <UseCase
            id="site-wide-bar"
            title="A listening bar for the whole site"
            why={
              <>
                Add <code>ReadAloud.Bar</code> once in your page layout, with a <code>scope</code>{' '}
                selector, instead of placing a player on every page. It reads whichever part of the
                page matches that selector, sits above the site&rsquo;s own navigation, and only
                becomes sticky while it is reading.
              </>
            }
            code={sources['bar']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'scope' }]}
          >
            <BarLayout />
          </UseCase>
          <UseCase
            id="cms-markers"
            title="Marking which part of a CMS page to read"
            why={
              <>
                A content management system renders its own HTML, where React cannot write a
                comment. Wrap the part a resident should hear in{' '}
                <code>&lt;!-- KV:READ-ALOUD:START --&gt;</code> and{' '}
                <code>&lt;!-- KV:READ-ALOUD:STOP --&gt;</code>, so the player skips things like a
                related-links box around it.
              </>
            }
            code={sources['cms-markers']}
            propsUsed={[{ part: 'ReadAloud.Root', prop: 'contentRef' }]}
            note={
              <Note kind="tip">
                Most HTML minifiers strip comments by default. Keep comments on in production, or
                the markers disappear and the player reads everything instead.
              </Note>
            }
          >
            <CmsMarkers />
          </UseCase>
          <UseCase
            id="different-language"
            title="Content in a different language from the interface"
            why={
              <>
                The voice follows the text&rsquo;s own declared language, never the page&rsquo;s
                interface language. Here the page is in English, but the decision it quotes keeps
                its original Swedish wording: Listen reads that part in Swedish. In English, the
                quoted text says &ldquo;The decision becomes final three weeks after it is
                announced.&rdquo;
              </>
            }
            code={sources['language']}
            note={
              <Note kind="reminder">
                Put <code>lang</code> on the content itself, not only on the page. Without it, this
                part would be read with whatever language the page declares (3.1.2 Language of
                Parts, level AA).
              </Note>
            }
          >
            <LanguageOfParts />
          </UseCase>
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
                {
                  key: 'barLabel',
                  meaning: "The group's name while a Bar is mounted, instead of label.",
                },
                { key: 'settings', meaning: 'Names the Settings button and its popup.' },
                { key: 'hide', meaning: 'The name of the Hide button, Bar only.' },
              ]}
            />
          }
        />
      }
    />
  )
}
