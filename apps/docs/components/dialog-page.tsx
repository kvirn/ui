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
  dialogActionsAttributes,
  dialogActionsRows,
  dialogBodyAttributes,
  dialogBodyRows,
  dialogCloseAttributes,
  dialogCloseRows,
  dialogDescriptionAttributes,
  dialogDescriptionRows,
  dialogPopupAttributes,
  dialogRootRows,
  dialogTitleAttributes,
  dialogTitleRows,
  dialogTriggerAttributes,
  useDialogHook,
} from '../content/dialog.api.ts'
import { CloseFromList } from '../examples/dialog/close-from-list.tsx'
import { ControlledDialog } from '../examples/dialog/controlled.tsx'
import { DefaultDialog } from '../examples/dialog/default.tsx'
import { InitialFocus } from '../examples/dialog/initial-focus.tsx'
import { ManyRows } from '../examples/dialog/many-rows.tsx'
import { WithAForm } from '../examples/dialog/with-a-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DialogExampleSources = Record<
  'default' | 'with-a-form' | 'many-rows' | 'close-from-list' | 'controlled' | 'initial-focus',
  string
>

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
        <code>&lt;dialog&gt;</code> shown with <code>showModal()</code>. The browser puts it in the
        top layer, above all other content, so it needs no portal or <code>z-index</code>. Its
        children stay in the page while it is closed, hidden and out of reach, so what was typed is
        kept.
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
    props: dialogTitleRows,
    attributes: dialogTitleAttributes,
  },
  {
    name: 'Dialog.Description',
    renders: (
      <>
        <code>&lt;p&gt;</code> with a short explanation, read out after the title.
      </>
    ),
    props: dialogDescriptionRows,
    attributes: dialogDescriptionAttributes,
  },
  {
    name: 'Dialog.Body',
    renders: (
      <>
        <code>&lt;div&gt;</code> for the content between the description and the actions.
      </>
    ),
    props: dialogBodyRows,
    attributes: dialogBodyAttributes,
  },
  {
    name: 'Dialog.Actions',
    renders: (
      <>
        <code>&lt;div&gt;</code> for the buttons, the primary one first.
      </>
    ),
    props: dialogActionsRows,
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
      lead="The page behind it is out of reach until it closes, and focus goes back to where it was."
      pattern="APG Dialog (Modal)"
      whenToUse={
        <ul>
          <li>
            Use a dialog for one short task or read that someone should finish or dismiss before
            going on: change a value, confirm details, read a notice.
          </li>
          <li>
            It suits a form for residents and a staff tool alike, when the content fits on one
            screen, also at 320 px.
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
            why="Changing one value does not need a page of its own. The title says the task, the description says what happens next, and each button says what it does. Closing with Escape or Close keeps what was typed, and a press on the backdrop does nothing by default."
            code={sources['with-a-form']}
            propsUsed={[
              { part: 'Dialog.Root', prop: 'open' },
              { part: 'Dialog.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="reminder">
                Put the dialog outside any form on the page. A required or invalid field in the
                closed dialog would otherwise stop that form from sending, with no message (3.3.1
                Error Identification).
              </Note>
            }
          >
            <WithAForm />
          </UseCase>
          <UseCase
            id="one-dialog-many-rows"
            title="One dialog for every row of a list"
            why="A list of cases or applications can share one dialog. Open it from your own state, set what it shows, and leave out the Trigger. When it closes, focus goes back to the button that opened it."
            code={sources['many-rows']}
            propsUsed={[
              { part: 'Dialog.Root', prop: 'open' },
              { part: 'Dialog.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="reminder">
                If the button that opens the dialog can leave the page, pass{' '}
                <code>finalFocusRef</code>. Otherwise focus has nowhere to go back to (2.4.3 Focus
                Order).
              </Note>
            }
          >
            <ManyRows />
          </UseCase>
          <UseCase
            id="close-a-case-from-a-list"
            title="Close a case and keep your place in the list"
            why="Closing a case removes its row, and the button that opened the dialog goes with it. After the case is closed, pass finalFocusRef with the list’s heading and focus lands there. If the dialog is dismissed instead, leave it out and focus returns to the button. The heading also shows how many cases are left."
            code={sources['close-from-list']}
            propsUsed={[
              { part: 'Dialog.Root', prop: 'finalFocusRef' },
              { part: 'Dialog.Root', prop: 'open' },
              { part: 'Dialog.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="reminder">
                The element you pass must be able to take focus, or focus is not returned to it. A
                heading needs <code>tabindex=&quot;-1&quot;</code>. Without a place to return to,
                focus is lost (2.4.3 Focus Order).
              </Note>
            }
          >
            <CloseFromList />
          </UseCase>
          <UseCase
            id="know-why-it-closed"
            title="Know why it closed"
            why="Keep the open state yourself when the page needs to react to it. onOpenChange says why the dialog changed. While open is set, a close is only a request: you decide whether to close it."
            code={sources['controlled']}
            propsUsed={[
              { part: 'Dialog.Root', prop: 'open' },
              { part: 'Dialog.Root', prop: 'onOpenChange' },
            ]}
          >
            <ControlledDialog />
          </UseCase>
          <UseCase
            id="long-notice-with-a-choice"
            title="A long notice with a choice at the end"
            why="By default focus starts on the first control that is not Close. In a notice with text to read, that is a choice below the text. Pass the Title with initialFocusRef, and the dialog starts at its beginning, so the arrow keys scroll the text."
            code={sources['initial-focus']}
            propsUsed={[{ part: 'Dialog.Root', prop: 'initialFocusRef' }]}
          >
            <InitialFocus />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give the dialog a title. Without a name a screen reader says only “dialog”, and the
                person can’t tell what it is for (4.1.2 Name, Role, Value). Say what each button
                does, with a verb and an object, never “OK” or “Yes”.
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="tip">
                While a dialog is open, the page has <code>data-kv-scroll-locked</code>. The default
                theme turns it into no scrolling. Without the theme, add that rule yourself, or the
                page behind the dialog scrolls.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Dialog, useDialog } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDialogHook}
          strings={
            <StringsBlock
              namespace="dialog"
              component="Dialog"
              keys={[
                {
                  key: 'close',
                  meaning:
                    'The name of a Dialog.Close that has no text, only the icon. A Close with text is named by that text.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
