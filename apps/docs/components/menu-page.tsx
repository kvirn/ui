import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import {
  menuCheckableAttributes,
  menuCheckboxItemRows,
  menuGroupAttributes,
  menuGroupLabelAttributes,
  menuGroupLabelRows,
  menuGroupRows,
  menuItemAttributes,
  menuItemRows,
  menuPopupAttributes,
  menuPopupRows,
  menuRadioGroupAttributes,
  menuRadioGroupRows,
  menuRadioItemRows,
  menuRootRows,
  menuSeparatorAttributes,
  menuTriggerAttributes,
  menuTriggerRows,
  useMenuHook,
} from '../content/menu.api.ts'
import { AskFirst } from '../examples/menu/ask-first.tsx'
import { CheckboxAndRadioMenu } from '../examples/menu/checkbox-and-radio.tsx'
import { ControlledMenu } from '../examples/menu/controlled.tsx'
import { DefaultMenu } from '../examples/menu/default.tsx'
import { RowActions } from '../examples/menu/row-actions.tsx'
import { Unavailable } from '../examples/menu/unavailable.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type MenuExampleSources = Record<
  'default' | 'row-actions' | 'ask-first' | 'unavailable' | 'checkbox-and-radio' | 'controlled',
  string
>

const elementNote = (element: string) => (
  <>
    <code>&lt;{element}&gt;</code>. It takes every attribute of a <code>&lt;{element}&gt;</code> and
    passes <code>ref</code> to it.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'Menu.Root',
    renders: <>no element. It owns the open state and passes it to the parts inside it.</>,
    props: menuRootRows,
  },
  {
    name: 'Menu.Trigger',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code>. It takes every attribute of a{' '}
        <code>&lt;button&gt;</code>, and the popup is placed against it.
      </>
    ),
    props: menuTriggerRows,
    attributes: menuTriggerAttributes,
  },
  {
    name: 'Menu.Popup',
    renders: (
      <>
        <code>&lt;div popover=&quot;auto&quot;&gt;</code> with the role <code>menu</code>. Its items
        render only while it is open. Render it right after the trigger.
      </>
    ),
    props: menuPopupRows,
    attributes: menuPopupAttributes,
  },
  {
    name: 'Menu.Item',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>menuitem</code>. It
        is never a link: for a destination, use{' '}
        <Link href="/components/navigation">Navigation</Link>.
      </>
    ),
    props: menuItemRows,
    attributes: menuItemAttributes,
  },
  {
    name: 'Menu.CheckboxItem',
    renders: (
      <>
        <code>&lt;button&gt;</code> with the role <code>menuitemcheckbox</code>. It toggles when
        chosen.
      </>
    ),
    props: menuCheckboxItemRows,
    attributes: menuCheckableAttributes,
  },
  {
    name: 'Menu.RadioGroup',
    renders: (
      <>
        <code>&lt;div role=&quot;group&quot;&gt;</code> around the radio items that share a value.
        It is not the <Link href="/components/radio-group">RadioGroup</Link> component.
      </>
    ),
    props: menuRadioGroupRows,
    attributes: menuRadioGroupAttributes,
  },
  {
    name: 'Menu.RadioItem',
    renders: (
      <>
        <code>&lt;button&gt;</code> with the role <code>menuitemradio</code>. Put it inside a{' '}
        <code>Menu.RadioGroup</code>.
      </>
    ),
    props: menuRadioItemRows,
    attributes: menuCheckableAttributes,
  },
  {
    name: 'Menu.Group',
    renders: <>{elementNote('div')} Name it with a GroupLabel.</>,
    props: menuGroupRows,
    attributes: menuGroupAttributes,
  },
  {
    name: 'Menu.GroupLabel',
    renders: <>{elementNote('div')} It names the Group around it.</>,
    props: menuGroupLabelRows,
    attributes: menuGroupLabelAttributes,
  },
  {
    name: 'Menu.Separator',
    renders: <>{elementNote('div')} A divider between items.</>,
    attributes: menuSeparatorAttributes,
  },
]

export function MenuPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: MenuExampleSources
}) {
  return (
    <ComponentPage
      title="Menu"
      lead="Someone using only a keyboard opens it, moves with the arrow keys and lands back on the button."
      status="alpha-candidate"
      pattern="APG Menu Button"
      whenToUse={
        <ul>
          <li>
            Use a menu for several related actions on one thing, such as print, download and
            withdraw on a case, or the view options of a table. It suits staff tools where space is
            tight.
          </li>
          <li>
            Menus are for actions, not navigation. A list of links to pages is a{' '}
            <Link href="/components/navigation">Navigation</Link> or a{' '}
            <Link href="/components/disclosure">Disclosure</Link>, never a menu.
          </li>
          <li>
            Not for one or two actions, and not for the main action of a page: show visible buttons.
            In a service for residents, hidden actions are easy to miss, so prefer buttons that are
            always on screen.
          </li>
          <li>
            Not for a short panel with text or a form: use a{' '}
            <Link href="/components/popover">Popover</Link>. Not for choosing a value in a form: use
            a <Link href="/components/listbox">Listbox</Link>.
          </li>
          <li>There are no submenus: a menu never opens another menu.</li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultMenu />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="row-actions"
            title="Actions for one row of a list"
            why="A list of cases often has the same few actions on each row. Give every trigger the row’s name, so “Actions for case 2024-118” and “Actions for case 2024-131” differ. The menu is named by its trigger."
            code={sources['row-actions']}
            note={
              <Note kind="reminder">
                Start the trigger’s name with its visible text, then add what it is for, hidden from
                sight. A name that doesn’t start with the visible text fails 2.5.3 Label in Name,
                and identical “Actions” buttons leave a screen reader user guessing which row each
                one belongs to.
              </Note>
            }
          >
            <RowActions />
          </UseCase>
          <UseCase
            id="ask-first"
            title="An action that asks first"
            why="An action that can’t be undone, such as withdrawing an application, opens an AlertDialog from its item. Keep the open state yourself and set it in onSelect. When the dialog closes, focus goes back to the menu’s trigger."
            code={sources['ask-first']}
            propsUsed={[{ part: 'Menu.Item', prop: 'onSelect' }]}
          >
            <AskFirst />
          </UseCase>
          <UseCase
            id="unavailable"
            title="An action that is not available now"
            why="A disabled item stays in the menu, and the arrow keys still reach it, so people know the action exists. A screen reader says it is unavailable, not why. Say why in text on the page and link it to the item."
            code={sources['unavailable']}
            propsUsed={[{ part: 'Menu.Item', prop: 'disabled' }]}
          >
            <Unavailable />
          </UseCase>
          <UseCase
            id="checkbox-and-radio"
            title="Options that stay on or off"
            why="A checkbox item toggles a setting, and radio items choose one value from a few. Both keep the menu open here, so the user can change more than one."
            code={sources['checkbox-and-radio']}
            propsUsed={[
              { part: 'Menu.CheckboxItem', prop: 'checked' },
              { part: 'Menu.CheckboxItem', prop: 'closeOnSelect' },
              { part: 'Menu.RadioGroup', prop: 'value' },
            ]}
            note={
              <Note kind="reminder">
                A change is not announced once the menu has closed, and the closed menu shows
                nothing. Show the current setting on the page, as the line above the button does.
              </Note>
            }
          >
            <CheckboxAndRadioMenu />
          </UseCase>
          <UseCase
            id="know-why-it-closed"
            title="Know why it closed"
            why="Keep the open state yourself when the page needs to react to it. onOpenChange says why it changed. With open set, closing is a request: you decide whether to close."
            code={sources['controlled']}
            propsUsed={[
              { part: 'Menu.Root', prop: 'open' },
              { part: 'Menu.Root', prop: 'onOpenChange' },
            ]}
            note={
              <Note kind="tip">
                Put a confirmation in an element that is always on the page, such as an{' '}
                <code>&lt;output&gt;</code>, never inside the menu: the menu is gone when the action
                has run.
              </Note>
            }
          >
            <ControlledMenu />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Put <code>Menu.Popup</code> right after <code>Menu.Trigger</code>, in the same
                parent. Otherwise Tab and Shift+Tab don’t leave the menu as described under Keyboard
                (2.4.3 Focus Order).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Menu, useMenu } from '@kvirn-ui/react'"
          parts={parts}
          hook={useMenuHook}
        />
      }
    />
  )
}
