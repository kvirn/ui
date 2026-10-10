import { Link } from '@kvirn-ui/react'
import { apiHookPart } from './api-ids.ts'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { toastProviderRows, toastShowOptionRows, useToastResultRows } from '../content/toast.api.ts'
import { DefaultToast } from '../examples/toast/default.tsx'
import { UpdateInPlace } from '../examples/toast/update-in-place.tsx'
import { WithAnUndo } from '../examples/toast/with-an-undo.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ToastExampleSources = Record<'default' | 'with-an-undo' | 'update-in-place', string>

const providerPart: ApiPart = {
  name: 'KvirnProvider toast',
  renders: (
    <>
      the toast region, once, after the provider’s children, in the top layer. It is a{' '}
      <code>&lt;section&gt;</code> named by <code>toast.regionLabel</code> and exists only while a
      toast is shown. It has no role and no <code>aria-live</code>. See{' '}
      <Link href="/foundation/kvirn-provider">KvirnProvider</Link> for the other props.
    </>
  ),
  props: toastProviderRows,
}

const provide = `<KvirnProvider locale="sv" toast={{ limit: 10, autoDismiss: false }}>
  <App />
</KvirnProvider>`

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
      status="alpha-candidate"
      whenToUse={
        <>
          <p>
            <strong>When not to toast: use an inline Alert with announce first.</strong> A toast is
            a second channel for a result that is also shown in place. It never replaces the result,
            and nothing needed to finish a task lives only in a toast.
          </p>
          <ul>
            <li>
              Use a toast for a small confirmation that needs no reply: a setting saved, a link
              copied, a draft saved, a background export finished. Show the result in place as well,
              such as the switch’s state.
            </li>
            <li>
              Not for an error the user must fix or a failed submit: use the field’s error message
              and the error summary. There is no warning or error toast.
            </li>
            <li>
              Not for the outcome of a submit, a deadline or an outage: use an{' '}
              <Link href="/components/alert">Alert</Link> in the content, or a confirmation page.
            </li>
            <li>
              Not for a decision the user must make: use an{' '}
              <Link href="/components/alert-dialog">AlertDialog</Link>.
            </li>
            <li>
              Not for a state already visible at the control, such as a{' '}
              <Link href="/components/switch">Switch</Link> that is now on.
            </li>
          </ul>
          <ul>
            <li>
              <strong>No timers by default.</strong> A toast stays until it is closed. Turn{' '}
              <code>autoDismiss</code> (a number of milliseconds) on only as a setting the user can
              change, such as “Keep messages until I close them” (2.2.1). There is no minimum time,
              so a short value can remove a toast before it is read: that trade-off is the app’s to
              manage, and nothing the user must act on should time out.
            </li>
            <li>
              <strong>An Undo or Open action needs a persistent alternative</strong> on the page. A
              toast can be closed, and a screen reader user may never reach it.
            </li>
            <li>
              While a modal dialog is open, new toasts are held and shown when it closes. Raise a
              message inside a dialog with the dialog’s own Alert.
            </li>
            <li>
              <code>focus: true</code> only for an action the user just took, when the button they
              pressed is gone (3.2.2).
            </li>
            <li>
              Write one sentence in the user’s words, in the past tense, with no exclamation mark.
              Don’t use “OK” as an action.
            </li>
          </ul>
        </>
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
            title="A toast with Undo"
            why="An action keeps the toast on screen until it is closed, whatever autoDismiss says. The page has the same Undo, so nobody has to find the toast."
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
            id="update-in-place"
            title="Saving again, with one toast"
            why="Give the toast an id. Showing the same id again updates it in place and announces it once, so ten saves are one toast."
            code={sources['update-in-place']}
            propsUsed={[{ part: apiHookPart('show', 'options'), label: 'show', prop: 'id' }]}
          >
            <UpdateInPlace />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <>
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
          />
          <CodeBlock code={provide} />
          <CodeBlock code={use} />
        </>
      }
    />
  )
}
