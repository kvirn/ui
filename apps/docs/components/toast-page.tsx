import { Link } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import { toastProviderRows, toastShowOptionRows, useToastResultRows } from '../content/toast.api.ts'
import { AutoClose } from '../examples/toast/auto-close.tsx'
import { ClearBeforeSummary } from '../examples/toast/clear-before-summary.tsx'
import { DefaultToast } from '../examples/toast/default.tsx'
import { JobInProgress } from '../examples/toast/job-in-progress.tsx'
import { RemoveAttachment } from '../examples/toast/remove-attachment.tsx'
import { WithAnUndo } from '../examples/toast/with-an-undo.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ToastExampleSources = Record<
  | 'default'
  | 'with-an-undo'
  | 'auto-close'
  | 'job-in-progress'
  | 'remove-attachment'
  | 'clear-before-summary',
  string
>

const providerPart: ApiPart = {
  name: 'KvirnProvider toast',
  renders: (
    <>
      the toast region, once, after the provider’s children, in the top layer. It is a{' '}
      <code>&lt;section&gt;</code> named by <code>toast.regionLabel</code> and exists only while a
      toast is shown. It has no <code>role</code> attribute and no <code>aria-live</code>. One
      region serves the whole page: the first <code>KvirnProvider</code> that mounted owns the{' '}
      <code>toast</code> options, and a later provider’s <code>toast</code> is ignored. See{' '}
      <Link href="/foundation/kvirn-provider">KvirnProvider</Link> for the other props.
    </>
  ),
  props: toastProviderRows,
}

const provide = `<KvirnProvider locale="sv" toast={{ limit: 10, autoDismiss: false }}>
  <App />
</KvirnProvider>`

// "Utkastet sparades" is Swedish for "The draft was saved".
const use = `const toast = useToast()
toast.show({ variant: 'success', title: 'Utkastet sparades' })`

export function ToastPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ToastExampleSources
}) {
  return (
    <ComponentPage
      title="Toast"
      lead="It doesn’t move focus, a screen reader announces it, and it stays until the user closes it unless your app turns timers on."
      whenToUse={
        <ul>
          <li>
            Use a toast for a small confirmation that needs no reply: a setting saved, a link
            copied, a draft saved, a background export finished. A toast is a second channel, so
            show the result in place as well. Nothing needed to finish a task lives only in a toast.
          </li>
          <li>
            Not for an error the user must fix or the outcome of a submit: use the field’s error
            message and the <Link href="/components/error-summary">ErrorSummary</Link>, an{' '}
            <Link href="/components/alert">Alert</Link> in the content, or a confirmation page.
            There is no warning or error toast.
          </li>
          <li>
            Not for a decision the user must make: use an{' '}
            <Link href="/components/alert-dialog">AlertDialog</Link>.
          </li>
          <li>
            Not for a state already visible at the control, such as a{' '}
            <Link href="/components/switch">Switch</Link> that is now on.
          </li>
          <li>
            Not inside a dialog: a new toast waits until the dialog closes. Raise the message with
            the dialog’s own Alert.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultToast />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="undo"
            title="Deleting a draft, with Undo"
            why={
              <>
                An action keeps the toast on screen until it is closed, whatever{' '}
                <code>autoDismiss</code> says. The page has the same Undo, so nobody has to find the
                toast.
              </>
            }
            code={sources['with-an-undo']}
            propsUsed={[
              { part: apiHookPart('show', 'options'), label: 'show', prop: 'action' },
              { part: apiHookPart('show', 'options'), label: 'show', prop: 'variant' },
            ]}
            note={
              <Note kind="reminder">
                Keep the other way to undo. A toast can be closed, and a screen reader user may
                never reach it.
              </Note>
            }
          >
            <WithAnUndo />
          </UseCase>
          <UseCase
            id="auto-close"
            title="Messages that close by themselves"
            why={
              <>
                With <code>autoDismiss</code> on, a confirmation closes by itself, and a ring on the
                toast counts down the time left. The timer pauses while you hover over or focus the
                toast, while the tab is hidden and while a dialog is open. A toast with an action,
                such as Undo, never closes by itself. Offer the timer as a user setting, not a fixed
                choice. The switch here changes this site’s own <code>KvirnProvider</code>. In your
                app you set <code>autoDismiss</code> in its <code>toast</code> prop.
              </>
            }
            code={sources['auto-close']}
            propsUsed={[{ part: apiHookPart('show', 'options'), label: 'show', prop: 'action' }]}
            note={
              <Note kind="reminder">
                Never time out an error or anything the person must act on (2.2.1 Timing
                Adjustable). Use the toast only for a confirmation, and let the user turn the timer
                off.
              </Note>
            }
          >
            <AutoClose />
          </UseCase>
          <UseCase
            id="job-in-progress"
            title="A job that takes a while"
            why={
              <>
                Show a toast with <code>busy</code> while a job runs. Then show the result with the
                same <code>id</code>, so one toast updates in place and a second one does not stack.
                The spinner is replaced, and the result is announced once. The words carry the wait:
                the status word and the title say what is happening. A busy toast stays even with{' '}
                <code>autoDismiss</code> on, and only the result that replaces it times out.
              </>
            }
            code={sources['job-in-progress']}
            propsUsed={[
              { part: apiHookPart('show', 'options'), label: 'show', prop: 'busy' },
              { part: apiHookPart('show', 'options'), label: 'show', prop: 'id' },
            ]}
            note={
              <Note kind="reminder">
                An indicator that can keep moving for more than 5 seconds alongside other content
                needs a visible control on the page that stops or hides it (2.2.2 Pause, Stop,
                Hide). An indicator that is the only content during a wait where nothing else can be
                done is exempt. <code>prefers-reduced-motion</code> alone is not that control. See{' '}
                <Link href="/foundation/theming#moving-indicators">
                  Moving indicators and WCAG 2.2.2
                </Link>
                .
              </Note>
            }
          >
            <JobInProgress />
          </UseCase>
          <UseCase
            id="remove-attachment"
            title="Removing a file from an application"
            why={
              <>
                The button the user pressed leaves the page with its row, so focus has nowhere to
                go. Focus a heading that stays, then show the toast with <code>focus: true</code>.
                The user hears the message where focus is, and one Tab reaches Undo. When the toast
                closes, focus goes back to the heading.
              </>
            }
            code={sources['remove-attachment']}
            propsUsed={[
              { part: apiHookPart('show', 'options'), label: 'show', prop: 'focus' },
              { part: apiHookPart('show', 'options'), label: 'show', prop: 'action' },
            ]}
            note={
              <Note kind="reminder">
                Move focus to something that stays on the page before you show the toast. If the
                element that had focus before is gone, the browser puts focus on the page and the
                user loses their place (2.4.3 Focus Order). A development warning says so.
              </Note>
            }
          >
            <RemoveAttachment />
          </UseCase>
          <UseCase
            id="clear-before-summary"
            title="Sending a form that has an error"
            why={
              <>
                A persistent toast from earlier stays on screen. Call <code>dismissAll</code> before
                the error summary appears, so nothing competes with it. Show the problem in the
                summary and beside the field, never in a toast.
              </>
            }
            code={sources['clear-before-summary']}
            propsUsed={[
              { part: apiHookPart('useToast', 'result'), label: 'useToast', prop: 'dismissAll' },
            ]}
          >
            <ClearBeforeSummary />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Turn <code>autoDismiss</code> on only as a setting the user can change, such as
                “Keep messages until I close them”. A toast that vanishes before it is read fails
                people who read slowly or use a screen reader (2.2.1 Timing Adjustable). There is no
                minimum time, so keep the value long enough to read.
              </Note>
            ),
            focus: (
              <Note kind="reminder">
                Use <code>focus: true</code> only for an action the user just took, when the button
                they pressed is gone. Moving focus without a reason is a surprise (3.2.2 On Input).
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
          <p>
            Wrap your app in a <code>KvirnProvider</code> once, then call <code>useToast</code> from
            any component below it. The provider options below are the defaults.
          </p>
          <CodeBlock code={provide} />
          <CodeBlock code={use} />
          <ApiBlock
            importLine="import { KvirnProvider, useToast } from '@kvirn-ui/react'"
            parts={[providerPart]}
            hooks={[
              {
                name: 'useToast',
                intro:
                  'Takes no options. Outside a KvirnProvider the functions do nothing and a development warning says so.',
                result: useToastResultRows,
              },
              { name: 'show', options: toastShowOptionRows },
            ]}
            strings={
              <StringsBlock
                namespace="toast"
                component="Toast"
                keys={[
                  {
                    key: 'regionLabel',
                    meaning:
                      'The name of the region that holds the toasts. The region exists only while a toast is shown.',
                  },
                ]}
              >
                <p>
                  The status word and the name of the Close button are the Alert’s strings:{' '}
                  <code>alert.infoPrefix</code>, <code>alert.successPrefix</code> and{' '}
                  <code>alert.close</code>.
                </p>
              </StringsBlock>
            }
          />
        </>
      }
    />
  )
}
