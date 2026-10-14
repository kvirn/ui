import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  alertDialogActionsAttributes,
  alertDialogBodyAttributes,
  alertDialogCloseAttributes,
  alertDialogCloseRows,
  alertDialogDescriptionAttributes,
  alertDialogPopupAttributes,
  alertDialogRootRows,
  alertDialogTitleAttributes,
  alertDialogTriggerAttributes,
  useAlertDialogHook,
} from '../content/alert-dialog.api.ts'
import { ConfirmDelete } from '../examples/alert-dialog/confirm-delete.tsx'
import { DeleteCases } from '../examples/alert-dialog/delete-cases.tsx'
import { TimeoutWarning } from '../examples/alert-dialog/timeout-warning.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AlertDialogExampleSources = Record<
  'confirm-delete' | 'timeout-warning' | 'delete-cases',
  string
>

const parts: ApiPart[] = [
  {
    name: 'AlertDialog.Root',
    renders: (
      <>
        no element. It owns the open state, passes it to the parts inside it and hosts the live
        regions for what is inside the dialog. It has no <code>dismissOnOutsidePress</code>: a press
        on the backdrop never closes an alert dialog.
      </>
    ),
    props: alertDialogRootRows,
  },
  {
    name: 'AlertDialog.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, optional: a dialog opened by a timer
        has none. It takes every attribute of a <code>&lt;button&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    attributes: alertDialogTriggerAttributes,
  },
  {
    name: 'AlertDialog.Popup',
    renders: (
      <>
        <code>&lt;dialog&gt;</code> shown with <code>showModal()</code>, in the top layer. It is
        always rendered and hidden while it is closed, and its children stay mounted.
      </>
    ),
    attributes: alertDialogPopupAttributes,
  },
  {
    name: 'AlertDialog.Title',
    renders: (
      <>
        <code>&lt;h2&gt;</code> that names the alert dialog: the question the buttons answer.
      </>
    ),
    attributes: alertDialogTitleAttributes,
  },
  {
    name: 'AlertDialog.Description',
    renders: (
      <>
        <code>&lt;p&gt;</code> with the consequence. Always give one: it is read out with the title.
      </>
    ),
    attributes: alertDialogDescriptionAttributes,
  },
  {
    name: 'AlertDialog.Body',
    renders: (
      <>
        <code>&lt;div&gt;</code> for content between the description and the actions.
      </>
    ),
    attributes: alertDialogBodyAttributes,
  },
  {
    name: 'AlertDialog.Actions',
    renders: (
      <>
        <code>&lt;div&gt;</code> for your buttons, the primary one first.
      </>
    ),
    attributes: alertDialogActionsAttributes,
  },
  {
    name: 'AlertDialog.Close',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> that closes the alert dialog with the
        reason <code>close-press</code> and returns focus. Its children are its name: say what it
        does (“Keep draft”). It has no icon and no default text, and a development warning fires
        without a name. It is an ordinary action, so it can be the <code>initialFocusRef</code>.
        Pass <code>as={'{Button}'}</code> to render your own button component.
      </>
    ),
    props: alertDialogCloseRows,
    attributes: alertDialogCloseAttributes,
  },
]

export function AlertDialogPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AlertDialogExampleSources
}) {
  return (
    <ComponentPage
      title="AlertDialog"
      lead="It is read out together with its description, and a press outside never closes it. Focus starts on the action you choose."
      status="alpha-candidate"
      pattern="APG Alert Dialog"
      whenToUse={
        <ul>
          <li>
            Use an alert dialog when the user must answer before going on, and the answer matters:
            an action that can’t be undone, or a session that is about to end.
          </li>
          <li>
            Use it in a page or a form for residents and in staff tools alike. Opening it on page
            load is for system messages only, such as the timeout warning.
          </li>
          <li>
            Not for a form or a read the user may dismiss: that is a{' '}
            <Link href="/components/dialog">Dialog</Link>.
          </li>
          <li>
            Not for a message that is part of the page: use an{' '}
            <Link href="/components/alert">Alert</Link>.
          </li>
          <li>Not for a multi-step form or long reading: use a page.</li>
          <li>
            Write the title as the question the buttons answer, and the buttons as a verb and an
            object, as <Link href="#what-you-need-to-do">What you need to do</Link> says.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['confirm-delete']}>
          <ConfirmDelete />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="session-timeout"
            title="Warn before a session ends"
            why={
              <>
                A system opens the alert dialog, so there may be no trigger to return to. Pass{' '}
                <code>finalFocusRef</code>, so focus has somewhere to go, and{' '}
                <code>initialFocusRef</code> on the primary action. Give the clock time, and update
                the minutes left in a status line inside the dialog.
              </>
            }
            code={sources['timeout-warning']}
            propsUsed={[
              { part: 'AlertDialog.Root', prop: 'initialFocusRef' },
              { part: 'AlertDialog.Root', prop: 'finalFocusRef' },
            ]}
            note={
              <Note kind="reminder">
                Say that the answers are kept, and make “Stay signed in” really keep the session
                going (2.2.1 Timing Adjustable). Escape closes the dialog too, so it must do the
                same as “Stay signed in”, never sign the user out.
              </Note>
            }
          >
            <TimeoutWarning />
          </UseCase>
          <UseCase
            id="delete-several"
            title="Delete the cases chosen in a list"
            why="A case worker chooses several cases and deletes them. Put what will be deleted in the Body, so the answer is made with the facts in view, and say how many in the title and on the button. Render the safe action with your own Button component."
            code={sources['delete-cases']}
            propsUsed={[
              { part: 'AlertDialog.Root', prop: 'initialFocusRef' },
              { part: 'AlertDialog.Close', prop: 'as' },
            ]}
          >
            <DeleteCases />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="recipe">
                Write the title as the question the buttons answer, and each button as a verb and an
                object, so it makes sense alone. Avoid “Cancel” when it could mean cancelling the
                whole application: say what is kept, such as “Keep draft”.
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="tip">
                While it is open, the <code>&lt;html&gt;</code> element has{' '}
                <code>data-kv-scroll-locked</code>. The default theme turns it into{' '}
                <code>overflow: hidden</code>. Without the theme, add that rule yourself: the
                headless package ships no CSS.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { AlertDialog, useAlertDialog } from '@kvirn-ui/react'"
          parts={parts}
          hook={useAlertDialogHook}
        />
      }
    />
  )
}
