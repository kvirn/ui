import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  popoverCloseAttributes,
  popoverCloseRows,
  popoverPopupAttributes,
  popoverPopupRows,
  popoverRootRows,
  popoverTriggerAttributes,
  popoverTriggerRows,
  usePopoverHook,
} from '../content/popover.api.ts'
import { ApplicationRows } from '../examples/popover/application-rows.tsx'
import { ControlledPopover } from '../examples/popover/controlled.tsx'
import { DefaultPopover } from '../examples/popover/default.tsx'
import { FocusInTheField } from '../examples/popover/focus-in-the-field.tsx'
import { Placement } from '../examples/popover/placement.tsx'
import { WithAForm } from '../examples/popover/with-a-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type PopoverExampleSources = Record<
  | 'default'
  | 'with-a-form'
  | 'focus-in-the-field'
  | 'application-rows'
  | 'controlled'
  | 'placement',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Popover.Root',
    renders: (
      <>
        no element. It owns the open state and passes it to the parts inside it. The default theme
        is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: popoverRootRows,
  },
  {
    name: 'Popover.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>. It takes every attribute of a{' '}
        <code>&lt;button&gt;</code> and passes <code>ref</code> to it. The popup is placed against
        it.
      </>
    ),
    props: popoverTriggerRows,
    attributes: popoverTriggerAttributes,
  },
  {
    name: 'Popover.Popup',
    renders: (
      <>
        <code>&lt;div popover=&quot;auto&quot;&gt;</code> with the role <code>dialog</code>. It
        takes every attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it.
        Render it right after the trigger.
      </>
    ),
    props: popoverPopupRows,
    attributes: popoverPopupAttributes,
  },
  {
    name: 'Popover.Close',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> that closes the popover and returns
        focus to the trigger. It takes every attribute of a <code>&lt;button&gt;</code> and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    props: popoverCloseRows,
    attributes: popoverCloseAttributes,
  },
]

export function PopoverPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: PopoverExampleSources
}) {
  return (
    <ComponentPage
      title="Popover"
      lead="It sits next to the button, stays inside the screen, and closes with Escape or a press outside."
      status="alpha-candidate"
      pattern="None exactly: APG Disclosure for the button, Dialog (Modal) roles for the popup, used non-modal"
      whenToUse={
        <ul>
          <li>
            Use a popover for a little extra that the user asks for with a press: a short
            explanation, a short form, a few related controls, small enough to sit beside the
            button.
          </li>
          <li>
            Give a popover with a form or several controls a visible Close button. It is
            recommended, not required: it gives touch, voice and magnifier users a target.
          </li>
          <li>
            Not for instructions people need to fill in a field correctly: show those under the
            field as <Link href="/components/field">help text</Link>, where everyone sees them, or
            in a <Link href="/components/disclosure">Disclosure</Link> for longer optional help.
          </li>
          <li>
            Not for text that should appear on hover or focus: use a{' '}
            <Link href="/components/tooltip">Tooltip</Link> for a name or a shortcut.
          </li>
          <li>
            Not for content that must take over the page or stop the user from going on: use a{' '}
            <Link href="/components/dialog">Dialog</Link>. A popover never blocks the page behind
            it.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultPopover />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="small-form"
            title="Change one value without leaving the page"
            why="Changing a phone number does not need a page of its own. The form sits in the popup, so Tab goes from the button into the form and on to Cancel. After saving, close the popup, put focus back on the button and confirm the change in text that is already on the page."
            code={sources['with-a-form']}
            propsUsed={[
              { part: 'Popover.Root', prop: 'open' },
              { part: 'Popover.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="reminder">
                Focus goes back to the button by itself when the popup closes with Escape, Close, a
                press outside or a light dismiss. When your own code closes it, as after Save, move
                focus there yourself (2.4.3 Focus Order). See{' '}
                <Link href="#focus">Focus management</Link>.
              </Note>
            }
          >
            <WithAForm />
          </UseCase>
          <UseCase
            id="focus-in-the-field"
            title="Open with the cursor in the field"
            why="Opening a popover leaves focus on its button, so a screen reader user hears only “expanded” and has to move on to find the popup. When it opens with one field, move focus to that field yourself, in an effect that runs after it has opened. Escape or Close then returns focus to the button."
            code={sources['focus-in-the-field']}
            propsUsed={[
              { part: 'Popover.Root', prop: 'open' },
              { part: 'Popover.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="tip">
                Moving focus is your choice, and the contract names it as the one case where the
                pattern asks for a move. For a hint or a few links, leave focus on the button. See{' '}
                <Link href="#focus">Focus management</Link>.
              </Note>
            }
          >
            <FocusInTheField />
          </UseCase>
          <UseCase
            id="application-rows"
            title="A details button on every row"
            why="Each row gets its own Popover. The browser allows one open popover at a time, so opening another closes the first. Give every button a name that says which row it is for, starting with the visible word, and name each popup by its own heading."
            code={sources['application-rows']}
            note={
              <Note kind="reminder">
                Give each repeated button a name that begins with its visible word (“Details for
                application 2024-118”), so a screen reader’s list of buttons can tell them apart
                (2.5.3 Label in Name). Name each popup too (4.1.2 Name, Role, Value).
              </Note>
            }
          >
            <ApplicationRows />
          </UseCase>
          <UseCase
            id="know-why-it-closed"
            title="Know why it closed"
            why={
              <>
                Keep the open state yourself when the page needs to react, for example to save a
                draft. <code>onOpenChange</code> says why it changed. With <code>open</code> set,
                closing is a request: you decide whether to close.
              </>
            }
            code={sources['controlled']}
            propsUsed={[
              { part: 'Popover.Root', prop: 'open' },
              { part: 'Popover.Root', prop: 'onOpenChange' },
            ]}
          >
            <ControlledPopover />
          </UseCase>
          <UseCase
            id="where-it-opens"
            title="Choose where it opens"
            why="The popup opens below the start of the button. Pick another side or alignment when the layout needs it, such as the end of a button at the edge of the page. It still flips when there is no room."
            code={sources['placement']}
            propsUsed={[
              { part: 'Popover.Root', prop: 'placement' },
              { part: 'Popover.Root', prop: 'offset' },
            ]}
            note={
              <Note kind="tip">
                <code>start</code> and <code>end</code> follow the reading direction, so the same
                placement works in right-to-left languages.
              </Note>
            }
          >
            <Placement />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Name the popup with <code>aria-label</code> or <code>aria-labelledby</code>, and
                render it right after its button. Without a name a screen reader says only “dialog”
                (4.1.2 Name, Role, Value). Out of order, Tab skips it (2.4.3 Focus Order).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you style the popup yourself, keep its edge at 3:1 contrast against the page
                (1.4.11 Non-text Contrast) and its text at 4.5:1 (1.4.3 Contrast (Minimum)).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Popover, usePopover } from '@kvirn-ui/react'"
          parts={parts}
          hook={usePopoverHook}
        />
      }
    />
  )
}
