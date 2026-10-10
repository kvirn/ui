import { Heading, Link } from '@kvirn-ui/react'
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
import { TimeoutWarning } from '../examples/alert-dialog/timeout-warning.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AlertDialogExampleSources = Record<'confirm-delete' | 'timeout-warning', string>

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
        <code>&lt;dialog&gt;</code> shown with <code>showModal()</code>, in the top layer. Its
        children render only while it is open.
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
        reason <code>close-press</code> and returns focus. Its children are required and are its
        name: say what it does (“Keep draft”). It has no icon and no default text. It is an ordinary
        action, so it can be the <code>initialFocusRef</code>.
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
      lead="It is read out together with its description, it starts on the safe action, and a press outside never closes it."
      status="in-progress"
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
          <li>Write the copy as the next section says.</li>
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
            why="A system opens the alert dialog, so there may be no trigger to return to. Pass finalFocusRef, so focus has somewhere to go, and initialFocusRef on the primary action."
            code={sources['timeout-warning']}
            propsUsed={[
              { part: 'AlertDialog.Root', prop: 'initialFocusRef' },
              { part: 'AlertDialog.Root', prop: 'finalFocusRef' },
            ]}
            note={
              <Note kind="reminder">
                Say that the answers are kept, and what the user can do. Without a trigger or a{' '}
                <code>finalFocusRef</code>, focus would fall to the page.
              </Note>
            }
          >
            <TimeoutWarning />
          </UseCase>
          <section aria-labelledby="copy-rules">
            <Heading as="h3" id="copy-rules">
              Write the copy
            </Heading>
            <ul>
              <li>
                <strong>Title:</strong> the question the buttons answer (“Delete the draft
                application?”). Never “Are you sure?”, “Warning” or “Confirm”.
              </li>
              <li>
                <strong>Description:</strong> the consequence and whether it can be undone, in one
                or two short sentences, in the normal text colour.
              </li>
              <li>
                <strong>Buttons:</strong> verb and object (“Delete draft”), so each makes sense
                alone. Never “OK”, “Yes” or “No”. Avoid “Cancel” when it could mean cancelling the
                whole application: say what is kept (“Keep draft”).
              </li>
              <li>One primary action. No blame and no jargon: say “signed in”, not “session”.</li>
            </ul>
          </section>
          <section aria-labelledby="scroll-lock">
            <Heading as="h3" id="scroll-lock">
              Scroll lock needs CSS
            </Heading>
            <p>
              While it is open, <code>&lt;html&gt;</code> has <code>data-kv-scroll-locked</code>.
              The default theme turns it into <code>overflow: hidden</code>. Without the theme, add
              that rule yourself: the headless package ships no CSS.
            </p>
          </section>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
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
