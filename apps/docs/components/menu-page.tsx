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
  menuSeparatorRows,
  menuTriggerAttributes,
  menuTriggerRows,
} from '../content/menu.api.ts'
import { CheckboxAndRadioMenu } from '../examples/menu/checkbox-and-radio.tsx'
import { ControlledMenu } from '../examples/menu/controlled.tsx'
import { DefaultMenu } from '../examples/menu/default.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type MenuExampleSources = Record<'default' | 'checkbox-and-radio' | 'controlled', string>

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
    props: menuSeparatorRows,
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
      lead="A button that opens a short list of actions. Menus are for actions, not navigation: for links to other pages, use Navigation or Disclosure."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Menus are for actions, not navigation. A list of links to pages is a{' '}
            <Link href="/components/navigation">Navigation</Link> or a{' '}
            <Link href="/components/disclosure">Disclosure</Link>, never a menu.
          </li>
          <li>
            Use a menu for several related actions on one thing, such as print, download and share
            on a case, or the view options of a table. It suits staff tools where space is tight.
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
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={<ApiBlock importLine="import { Menu } from '@kvirn-ui/react'" parts={parts} />}
    />
  )
}
