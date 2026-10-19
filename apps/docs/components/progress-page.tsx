import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  barAttributes,
  barRows,
  indicatorAttributes,
  indicatorRows,
  labelAttributes,
  labelRows,
  rootAttributes,
  rootRows,
  useProgressHook,
} from '../content/progress.api.ts'
import { BusyButton } from '../examples/progress/busy-button.tsx'
import { DefaultProgress } from '../examples/progress/default.tsx'
import { KnownValue } from '../examples/progress/known-value.tsx'
import { OwnMarkup } from '../examples/progress/own-markup.tsx'
import { SlowWait } from '../examples/progress/slow-wait.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ProgressExampleSources = Record<
  'default' | 'busy-button' | 'known-value' | 'slow-wait' | 'own-markup',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Progress.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It renders nothing until the show delay has passed,
        and it takes every attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to
        it. Also exported as <code>ProgressRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'Progress.Indicator',
    renders: (
      <>
        A decorative <code>&lt;span&gt;</code> with no role and <code>aria-hidden</code>, a direct
        child of the Root before the Label. It renders nothing when the Root has a{' '}
        <code>value</code>. Also exported as <code>ProgressIndicator</code>.
      </>
    ),
    props: indicatorRows,
    attributes: indicatorAttributes,
  },
  {
    name: 'Progress.Label',
    renders: (
      <>
        <code>&lt;p&gt;</code> with plain text: the label, then the percent when the value is known,
        then the slow sentence. Only the label names the bar. It is never a live region. Also
        exported as <code>ProgressLabel</code>.
      </>
    ),
    props: labelRows,
    attributes: labelAttributes,
  },
  {
    name: 'Progress.Bar',
    renders: (
      <>
        A native <code>&lt;progress&gt;</code> with the role <code>progressbar</code>. It renders
        only when the Root has a numeric <code>value</code>. It takes every attribute of a{' '}
        <code>&lt;progress&gt;</code> except <code>value</code>, <code>max</code> and{' '}
        <code>aria-labelledby</code>, and passes <code>ref</code> to it. Also exported as{' '}
        <code>ProgressBar</code>.
      </>
    ),
    props: barRows,
    attributes: barAttributes,
  },
]

export function ProgressPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ProgressExampleSources
}) {
  return (
    <ComponentPage
      title="Progress"
      lead="Shows that something the user started is still working, and how far along it is when you know. A screen reader announces it once, and a sentence is added when the wait is slow."
      whenToUse={
        <ul>
          <li>
            Use it for a wait the user started: a send, a filter, a route change. Put it where the
            result will appear, or right after the busy button.
          </li>
          <li>
            Name the thing and the action, and end with a full stop: “Sending your application.”,
            not “Loading…” or “Please wait”.
          </li>
          <li>
            Give it a <code>value</code> only when you know how far along it is. An unknown wait has
            the label alone, with a spinner if you like.
          </li>
          <li>
            It shows at once. For a wait that is often quick, set <code>delayMilliseconds</code>, so
            a short wait never flashes on the screen.
          </li>
          <li>
            Not for a message about something that happened: that is an{' '}
            <Link href="/components/alert">Alert</Link>. A{' '}
            <Link href="/components/table">Table</Link> and a{' '}
            <Link href="/components/file-upload">FileUpload</Link> keep their own loading text.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultProgress />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="busy-button"
            title="A busy button while sending"
            why={
              <>
                The pattern for a long action. The Button is <code>busy</code>, so a second press is
                blocked and focus stays on it. The Progress sits right after it and has no spinner
                of its own, because the busy button already has one. On failure the Progress goes,
                an <Link href="/components/alert">Alert</Link> takes its place and busy turns off.
                The screen reader says the label once, politely (see{' '}
                <Link href="#announcements">Announcements</Link>).
              </>
            }
            code={sources['busy-button']}
            propsUsed={[{ part: 'Progress.Root', prop: 'label' }]}
            note={
              <Note kind="reminder">
                Announcements need a <code>KvirnProvider</code> around your app. Without one the
                Progress is shown but not announced, and a development warning says so.
              </Note>
            }
          >
            <BusyButton />
          </UseCase>
          <UseCase
            id="known-value"
            title="A wait with a known value"
            why="When you know how far along it is, pass a value. The browser’s own progress bar appears, named by the label, and the percent is shown as text after it. The library never announces the percent, so a screen reader is not interrupted at every step. When the wait ends the Progress disappears without a word, so show the result, here an Alert."
            code={sources['known-value']}
            propsUsed={[
              { part: 'Progress.Root', prop: 'label' },
              { part: 'Progress.Root', prop: 'value' },
            ]}
            note={
              <Note kind="reminder">
                Give the Root a label that says what is happening. Without one the text is only
                “Loading.” (4.1.2 Name, Role, Value). If you also pass text to the Label, use the
                same words: the bar’s value text is built from the Root’s label.
              </Note>
            }
          >
            <KnownValue />
          </UseCase>
          <UseCase
            id="slow-wait"
            title="A wait that takes longer than expected"
            why="After ten seconds by default, a sentence is added saying that the wait is taking longer and to keep the page open, and it is announced once. Here the limit is four seconds, and a wait shorter than half a second is never shown. Set another limit, or false to never add the sentence."
            code={sources['slow-wait']}
            propsUsed={[
              { part: 'Progress.Root', prop: 'slowAfterMilliseconds' },
              { part: 'Progress.Root', prop: 'delayMilliseconds' },
            ]}
          >
            <SlowWait />
          </UseCase>
          <UseCase
            id="own-markup"
            title="With your own elements"
            why={
              <>
                When the markup is yours, spread the props of the hook on your elements and render
                nothing while <code>isShown</code> is false. Put <code>labelId</code> on the label
                text and spread <code>barProps</code> on a <code>&lt;progress&gt;</code>, so the
                label names the bar. The hook still announces the wait for you.
              </>
            }
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useProgress', 'options'),
                label: 'useProgress (options)',
                prop: 'value',
              },
              {
                part: apiHookPart('useProgress', 'result'),
                label: 'useProgress (result)',
                prop: 'isShown',
              },
              {
                part: apiHookPart('useProgress', 'result'),
                label: 'useProgress (result)',
                prop: 'labelId',
              },
              {
                part: apiHookPart('useProgress', 'result'),
                label: 'useProgress (result)',
                prop: 'barProps',
              },
            ]}
          >
            <OwnMarkup />
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
                An indicator that keeps moving for more than 5 seconds next to other content needs a
                visible control on the page that stops or hides it (2.2.2 Pause, Stop, Hide, level
                A). The reduced motion setting alone is not that control, and an indicator that is
                the only content during a wait where nothing else can be done needs none. Read{' '}
                <Link href="/foundation/theming#moving-indicators">
                  Moving indicators and WCAG 2.2.2
                </Link>
                .
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
          importLine="import { Progress, useProgress } from '@kvirn-ui/react'"
          parts={parts}
          hook={useProgressHook}
          strings={
            <StringsBlock
              namespace="progress"
              component="Progress"
              keys={[
                {
                  key: 'loading',
                  meaning:
                    'The label when you pass none. A development warning asks for a specific one.',
                },
                {
                  key: 'slow',
                  meaning:
                    'The sentence added after the label once the wait is slow, and announced once.',
                },
                {
                  key: 'valueText',
                  meaning: 'The bar’s value text, for example “Exporting cases, 45%”.',
                  values: { label: 'Exporting cases', percent: 45 },
                },
              ]}
            />
          }
        />
      }
    />
  )
}
