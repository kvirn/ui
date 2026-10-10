import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  toolbarButtonAttributes,
  toolbarButtonRows,
  toolbarGroupAttributes,
  toolbarItemAttributes,
  toolbarItemRows,
  toolbarRootAttributes,
  toolbarRootRows,
  toolbarToggleAttributes,
  toolbarToggleRows,
  useToolbarHook,
} from '../content/toolbar.api.ts'
import { DefaultToolbar } from '../examples/toolbar/default.tsx'
import { NoLoop } from '../examples/toolbar/no-loop.tsx'
import { OtherControls } from '../examples/toolbar/other-controls.tsx'
import { Toggles } from '../examples/toolbar/toggles.tsx'
import { Unavailable } from '../examples/toolbar/unavailable.tsx'
import { Vertical } from '../examples/toolbar/vertical.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ToolbarExampleSources = Record<
  'default' | 'toggles' | 'unavailable' | 'other-controls' | 'vertical' | 'no-loop',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Toolbar.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the role <code>toolbar</code>. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> except <code>role</code> and <code>aria-orientation</code>, and
        passes <code>ref</code> to it. Name it with <code>aria-label</code> or{' '}
        <code>aria-labelledby</code>, and set <code>aria-controls</code> to the element it acts on.
        The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: toolbarRootRows,
    attributes: toolbarRootAttributes,
  },
  {
    name: 'Toolbar.Group',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the role <code>group</code> once it has a name. It is a{' '}
        <Link href="/components/button-group">ButtonGroup</Link>, takes every attribute of a{' '}
        <code>&lt;div&gt;</code> except <code>role</code>, and passes <code>ref</code> to it. In a
        toolbar it needs <code>aria-label</code> or <code>aria-labelledby</code>.
      </>
    ),
    attributes: toolbarGroupAttributes,
  },
  {
    name: 'Toolbar.Button',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>. It is
        a <Link href="/components/button">Button</Link> that is also a toolbar item, takes the same
        attributes and passes <code>ref</code> to the button.
      </>
    ),
    props: toolbarButtonRows,
    attributes: toolbarButtonAttributes,
  },
  {
    name: 'Toolbar.Toggle',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code> and{' '}
        <code>aria-pressed</code>. It is a <Link href="/components/toggle">Toggle</Link> that is
        also a toolbar item, takes the same attributes and passes <code>ref</code> to the button.
      </>
    ),
    props: toolbarToggleRows,
    attributes: toolbarToggleAttributes,
  },
  {
    name: 'Toolbar.Item',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>, or the component you give{' '}
        <code>as</code>. It makes any control that can take focus by itself a toolbar item. It takes
        every attribute of a <code>&lt;button&gt;</code> and passes <code>ref</code> to the element.
        The toolbar’s <code>tabindex</code> wins over the element’s own.
      </>
    ),
    props: toolbarItemRows,
    attributes: toolbarItemAttributes,
  },
]

export function ToolbarPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ToolbarExampleSources
}) {
  return (
    <ComponentPage
      title="Toolbar"
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a toolbar for three or more related commands that act on one thing, such as the
            formatting buttons above a text editor.
          </li>
          <li>Name the toolbar, and name each group, so a screen reader says where focus is.</li>
          <li>
            Not for two controls or fewer: separate <Link href="/components/button">Buttons</Link>{' '}
            or a <Link href="/components/button-group">ButtonGroup</Link> are easier to find.
          </li>
          <li>
            Not for moving between pages: use <Link href="/components/navigation">Navigation</Link>.
            A row of text buttons that navigates is a nav, not a toolbar.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultToolbar />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="toggles"
            title="Toggles that change what the user sees"
            why={
              <>
                A style such as bold is on or off. Use a <code>Toolbar.Toggle</code>, so{' '}
                <code>aria-pressed</code> says which are on and the name never changes. Point the
                toolbar at the element it changes with <code>aria-controls</code>.
              </>
            }
            code={sources['toggles']}
            propsUsed={[
              { part: 'Toolbar.Toggle', prop: 'pressed' },
              { part: 'Toolbar.Toggle', prop: 'onPressedChange' },
            ]}
          >
            <Toggles />
          </UseCase>
          <UseCase
            id="unavailable-command"
            title="A command that isn’t available now"
            why="Redo has nothing to redo yet. The button stays in the arrow-key order and a screen reader says it is unavailable, so users can find it. Pressing it does nothing."
            code={sources['unavailable']}
            propsUsed={[{ part: 'Toolbar.Button', prop: 'disabled' }]}
            note={
              <Note kind="tip">
                In a toolbar <code>focusableWhenDisabled</code> is on by default, unlike on a plain
                Button. Turn it off only when the whole toolbar is disabled.
              </Note>
            }
          >
            <Unavailable />
          </UseCase>
          <UseCase
            id="other-controls"
            title="A link or a control that opens something"
            why={
              <>
                A control that isn’t a button joins the toolbar through <code>Toolbar.Item</code>{' '}
                and <code>as</code>: a link, a <code>Popover.Trigger</code> or a{' '}
                <code>Listbox.Trigger</code>. A plain element placed in the toolbar is a Tab stop of
                its own and the arrows skip it.
              </>
            }
            code={sources['other-controls']}
            propsUsed={[{ part: 'Toolbar.Item', prop: 'as' }]}
            note={
              <Note kind="reminder">
                A Listbox in a toolbar needs <code>native=&quot;never&quot;</code> on its{' '}
                <code>Listbox.Root</code>. Otherwise a touch device renders a native select with no
                name, and the item never appears. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <OtherControls />
          </UseCase>
          <UseCase
            id="vertical"
            title="A column of commands"
            why="A toolbar beside or below something, such as the actions for a row in a list. Down and Up move between the controls, and aria-orientation tells a screen reader."
            code={sources['vertical']}
            propsUsed={[{ part: 'Toolbar.Root', prop: 'orientation' }]}
            note={
              <Note kind="tip">
                The default theme only draws horizontal toolbars, so the column layout is your own
                CSS. The arrows follow the DOM order whatever the layout.
              </Note>
            }
          >
            <Vertical />
          </UseCase>
          <UseCase
            id="no-loop"
            title="Arrows that stop at the ends"
            why="The arrows wrap from the last control to the first by default, as in the APG example. Set loop to false when the order has a start and an end that users should feel."
            code={sources['no-loop']}
            propsUsed={[{ part: 'Toolbar.Root', prop: 'loop' }]}
          >
            <NoLoop />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Toolbar, useToolbar } from '@kvirn-ui/react'"
          parts={parts}
          hook={useToolbarHook}
        />
      }
    />
  )
}
