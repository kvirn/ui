import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  tooltipNameAttributes,
  tooltipNameRows,
  tooltipPopupAttributes,
  tooltipRootRows,
  tooltipShortcutAttributes,
  tooltipShortcutRows,
  tooltipTriggerAttributes,
  tooltipTriggerRows,
  useTooltipHook,
} from '../content/tooltip.api.ts'
import { DefaultTooltip } from '../examples/tooltip/default.tsx'
import { ExtraInformation } from '../examples/tooltip/extra-information.tsx'
import { IconToolbar } from '../examples/tooltip/icon-toolbar.tsx'
import { Timing } from '../examples/tooltip/timing.tsx'
import { WithAShortcut } from '../examples/tooltip/with-a-shortcut.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TooltipExampleSources = Record<
  'default' | 'with-a-shortcut' | 'extra-information' | 'icon-toolbar' | 'timing',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Tooltip.Root',
    renders: (
      <>
        no element. It owns the open state and the timing, and passes them to the parts inside it.
        The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: tooltipRootRows,
  },
  {
    name: 'Tooltip.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, or the component you give{' '}
        <code>as</code>, with its props set on the Trigger. It takes every attribute of that element
        and passes <code>ref</code> to it. The tooltip is placed against it.
      </>
    ),
    props: tooltipTriggerRows,
    attributes: tooltipTriggerAttributes,
  },
  {
    name: 'Tooltip.Popup',
    renders: (
      <>
        <code>&lt;div popover=&quot;manual&quot;&gt;</code> with the role <code>tooltip</code>. It
        takes every attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It is
        always in the page and hidden while closed, so render it right after the trigger.
      </>
    ),
    attributes: tooltipPopupAttributes,
  },
  {
    name: 'Tooltip.Name',
    renders: (
      <>
        <code>&lt;span&gt;</code>. It takes every attribute of a <code>&lt;span&gt;</code> and
        passes <code>ref</code> to it.
      </>
    ),
    props: tooltipNameRows,
    attributes: tooltipNameAttributes,
  },
  {
    name: 'Tooltip.Shortcut',
    renders: (
      <>
        <code>&lt;span&gt;</code>. It takes every attribute of a <code>&lt;span&gt;</code> and
        passes <code>ref</code> to it.
      </>
    ),
    props: tooltipShortcutRows,
    attributes: tooltipShortcutAttributes,
  },
]

export function TooltipPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TooltipExampleSources
}) {
  return (
    <ComponentPage
      title="Tooltip"
      lead="It never takes focus and holds no controls."
      pattern="APG Tooltip"
      whenToUse={
        <ul>
          <li>
            Use a tooltip to show the name of an icon-only control and its shortcut, for example in
            a toolbar or an editor.
          </li>
          <li>
            Use it for a short extra hint that is nice to have, never for what a user needs to
            finish a task: touch users never see a tooltip.
          </li>
          <li>
            Not for text with a link, a button or a field: use a{' '}
            <Link href="/components/popover">Popover</Link>. A tooltip disappears with the pointer
            and the focus, so nothing in it can be reached with Tab.
          </li>
          <li>Not for an error or an important message: write it as visible text.</li>
          <li>
            Not on a button that is natively disabled: it gets no pointer events and no focus, so
            the tooltip never shows. Keep the button focusable and say why it is off in visible
            text.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTooltip />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="name-and-shortcut"
            title="A name and a shortcut"
            why={
              <>
                Show the key that does the same thing. The name is hidden from assistive technology
                and the shortcut is the button’s description, so a screen reader says the name once,
                then the shortcut. Set <code>aria-keyshortcuts</code> on the button too, and handle
                the key in your app: the tooltip only shows it.
              </>
            }
            code={sources['with-a-shortcut']}
            propsUsed={[{ part: 'Tooltip.Trigger', prop: 'as' }]}
            note={
              <Note kind="reminder">
                Give the control a name of its own, with <code>aria-label</code> from your
                translations, and start the tooltip with the same text. Then a person using voice
                control can say what they see (2.5.3 Label in Name). See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <WithAShortcut />
          </UseCase>
          <UseCase
            id="extra-information"
            title="A little extra information"
            why="Plain text in the popup becomes the button’s description. Use it for something the name does not say, such as what will happen. Keep it short, and never put anything in it that a user needs."
            code={sources['extra-information']}
          >
            <ExtraInformation />
          </UseCase>
          <UseCase
            id="icon-toolbar"
            title="A toolbar of icon buttons"
            why="Every button has its own tooltip. Once one has opened, the next one opens at once, so a user moving along the row with the mouse or the arrow keys does not wait for each."
            code={sources['icon-toolbar']}
            propsUsed={[{ part: 'Tooltip.Trigger', prop: 'as' }]}
            note={
              <Note kind="tip">
                Tooltips share one delay for the whole page. Make a separate group with{' '}
                <code>createTooltipGroup()</code> from <code>@kvirn-ui/core</code> when a part of
                the page should keep its own.
              </Note>
            }
          >
            <IconToolbar />
          </UseCase>
          <UseCase
            id="timing-and-place"
            title="Slower, and below the button"
            why="Hover opens a tooltip after half a second, and keyboard focus opens it at once. Change the delay when tooltips would flash over a dense row, and the side when there is more room below."
            code={sources['timing']}
            propsUsed={[
              { part: 'Tooltip.Root', prop: 'delay' },
              { part: 'Tooltip.Root', prop: 'closeDelay' },
              { part: 'Tooltip.Root', prop: 'placement' },
            ]}
          >
            <Timing />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Don’t add a <code>title</code> attribute to the control next to a tooltip. The
                browser’s own tooltip can’t be hovered or dismissed (1.4.13 Content on Hover or
                Focus), and with <code>aria-label</code> it is read twice.
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
          importLine="import { Tooltip, useTooltip } from '@kvirn-ui/react'"
          parts={parts}
          hook={useTooltipHook}
        />
      }
    />
  )
}
