import { Heading, Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  dialogActionsAttributes,
  dialogBodyAttributes,
  dialogCloseAttributes,
  dialogCloseRows,
  dialogDescriptionAttributes,
  dialogPopupAttributes,
  dialogRootRows,
  dialogTitleAttributes,
  dialogTriggerAttributes,
  useDialogHook,
} from '../content/dialog.api.ts'
import { ControlledDialog } from '../examples/dialog/controlled.tsx'
import { DefaultDialog } from '../examples/dialog/default.tsx'
import { WithAForm } from '../examples/dialog/with-a-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DialogExampleSources = Record<'default' | 'with-a-form' | 'controlled', string>

const parts: ApiPart[] = [
  {
    name: 'Dialog.Root',
    renders: (
      <>
        no element. It owns the open state, passes it to the parts inside it and hosts the live
        regions for what is inside the dialog. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: dialogRootRows,
  },
  {
    name: 'Dialog.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, optional. It takes every attribute of a{' '}
        <code>&lt;button&gt;</code> and passes <code>ref</code> to it. Focus returns here when the
        dialog closes.
      </>
    ),
    attributes: dialogTriggerAttributes,
  },
  {
    name: 'Dialog.Popup',
    renders: (
      <>
        <code>&lt;dialog&gt;</code> shown with <code>showModal()</code>, so it is in the top layer
        and needs no portal or <code>z-index</code>. Its children render only while it is open.
      </>
    ),
    attributes: dialogPopupAttributes,
  },
  {
    name: 'Dialog.Title',
    renders: (
      <>
        <code>&lt;h2&gt;</code> that names the dialog.
      </>
    ),
    attributes: dialogTitleAttributes,
  },
  {
    name: 'Dialog.Description',
    renders: (
      <>
        <code>&lt;p&gt;</code> with a short explanation, read out after the title.
      </>
    ),
    attributes: dialogDescriptionAttributes,
  },
  {
    name: 'Dialog.Body',
    renders: (
      <>
        <code>&lt;div&gt;</code> for the content between the description and the actions.
      </>
    ),
    attributes: dialogBodyAttributes,
  },
  {
    name: 'Dialog.Actions',
    renders: (
      <>
        <code>&lt;div&gt;</code> for the buttons, the primary one first.
      </>
    ),
    attributes: dialogActionsAttributes,
  },
  {
    name: 'Dialog.Close',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> that closes the dialog with the reason{' '}
        <code>close-press</code>. With no children it is an icon button named by the{' '}
        <code>dialog.close</code> message. With children, they are its name. Put the icon button
        after the Title.
      </>
    ),
    props: dialogCloseRows,
    attributes: dialogCloseAttributes,
  },
]

export function DialogPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DialogExampleSources
}) {
  return (
    <ComponentPage
      title="Dialog"
      lead="A window on top of the page that asks for the user’s attention: a form, a short read, a decision. The page behind it is out of reach until it closes, and focus goes back to where it was."
      status="in-progress"
      whenToUse={
        <ul>
          <li>
            Use a dialog for one short task or read that the user should finish or dismiss before
            going on: change a value, confirm details, read a notice.
          </li>
          <li>
            Use it in a page or a form for residents and in staff tools alike, when the content fits
            on one screen, also at 320 px.
          </li>
          <li>
            Not for a message that needs an answer, such as a confirmation before deleting: that is
            an <Link href="/components/alert-dialog">AlertDialog</Link>.
          </li>
          <li>
            Not for a small panel next to its button that leaves the page reachable: use a{' '}
            <Link href="/components/popover">Popover</Link>.
          </li>
          <li>
            Not for a multi-step form or long reading: use a page. Not for anything that opens on
            page load, except a system message such as a session timeout.
          </li>
          <li>Write the copy as the next section says.</li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultDialog />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="form-in-a-dialog"
            title="A form in a dialog"
            why="Changing one value does not need a page of its own. Closing with Escape or Close keeps what was typed, and a press on the backdrop does nothing by default."
            code={sources['with-a-form']}
            note={
              <Note kind="reminder">
                Name the dialog with a <code>Dialog.Title</code>, or <code>aria-label</code>. Say
                what each button does: verb and object, never “OK” or “Yes”.
              </Note>
            }
          >
            <WithAForm />
          </UseCase>
          <UseCase
            id="know-why-it-closed"
            title="Know why it closed"
            why="You keep the open state yourself when the page needs to react. onOpenChange says why it changed. With open set, closing is a request: you decide whether to close."
            code={sources['controlled']}
            propsUsed={[
              { part: 'Dialog.Root', prop: 'open' },
              { part: 'Dialog.Root', prop: 'onOpenChange' },
            ]}
          >
            <ControlledDialog />
          </UseCase>
          <section aria-labelledby="copy-rules">
            <Heading as="h3" id="copy-rules">
              Write the copy
            </Heading>
            <ul>
              <li>
                <strong>Title:</strong> the question the buttons answer, or a verb phrase for a task
                (“Change phone number”). Never “Are you sure?”, “Warning” or “Confirm”.
              </li>
              <li>
                <strong>Description:</strong> the consequence and whether it can be undone, in one
                or two short sentences, in the normal text colour.
              </li>
              <li>
                <strong>Buttons:</strong> verb and object (“Save number”), so each makes sense
                alone. Never “OK”, “Yes” or “No”. Avoid “Cancel” when it could mean cancelling the
                whole application: say what is kept.
              </li>
              <li>One primary action. No blame and no jargon.</li>
            </ul>
          </section>
          <section aria-labelledby="scroll-lock">
            <Heading as="h3" id="scroll-lock">
              Scroll lock needs CSS
            </Heading>
            <p>
              While a dialog is open, <code>&lt;html&gt;</code> has{' '}
              <code>data-kv-scroll-locked</code>, counted across nested dialogs. The default theme
              turns it into <code>overflow: hidden</code>. The headless package ships no CSS, so
              without the theme add that rule yourself, or the page behind will scroll.
            </p>
          </section>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Dialog, useDialog } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDialogHook}
        />
      }
    />
  )
}
