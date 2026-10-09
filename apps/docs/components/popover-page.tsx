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
  popoverRootRows,
  popoverTriggerAttributes,
  popoverTriggerRows,
  usePopoverHook,
} from '../content/popover.api.ts'
import { ControlledPopover } from '../examples/popover/controlled.tsx'
import { DefaultPopover } from '../examples/popover/default.tsx'
import { Placement } from '../examples/popover/placement.tsx'
import { WithAForm } from '../examples/popover/with-a-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type PopoverExampleSources = Record<
  'default' | 'with-a-form' | 'controlled' | 'placement',
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
      lead="A small panel that a button opens: a hint, a short form or a few controls. It sits next to the button, stays inside the screen, and closes with Escape or a press outside."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a popover for a little extra that the user asks for with a press: help for a field,
            a short form, a few related controls.
          </li>
          <li>
            Use it in a page or a form for residents and in staff tools alike, where the content is
            small enough to sit beside the button.
          </li>
          <li>
            Give a popover with a form or several controls a visible Close button, so touch and
            voice users have a target.
          </li>
          <li>
            Not for text that should appear on hover or focus: use a{' '}
            <Link href="/components/tooltip">Tooltip</Link> for a name or a shortcut.
          </li>
          <li>
            Not for content that must take over the page or stop the user from going on: that is a
            Dialog. A popover never blocks the page behind it.
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
            title="A small form next to its button"
            why="Changing one value does not need a page of its own. The form sits in the popup, so Tab goes from the button into the form and on to Close."
            code={sources['with-a-form']}
            note={
              <Note kind="reminder">
                Name the popup with <code>aria-label</code> or <code>aria-labelledby</code>: its
                role is <code>dialog</code> and needs a name. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <WithAForm />
          </UseCase>
          <UseCase
            id="know-why-it-closed"
            title="Know why it closed"
            why="You keep the open state yourself when the page needs to react, for example to save a draft. onOpenChange says why it changed. With open set, closing is a request: you decide whether to close."
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
      contract={<ContractSectionsView contract={contract} />}
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
