import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { switchAttributes, switchRows, useSwitchHook } from '../content/switch.api.ts'
import { ControlledSetting } from '../examples/switch/controlled-setting.tsx'
import { DefaultSwitch } from '../examples/switch/default.tsx'
import { WithHelpText } from '../examples/switch/help-text.tsx'
import { PlainForm } from '../examples/switch/plain-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SwitchExampleSources = Record<
  'default' | 'controlled-setting' | 'plain-form' | 'help-text',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Switch',
    renders: (
      <>
        <code>&lt;input type=&quot;checkbox&quot; role=&quot;switch&quot;&gt;</code>. It takes every
        attribute of an <code>&lt;input&gt;</code> except <code>type</code>, <code>role</code>,{' '}
        <code>required</code> and <code>indeterminate</code>, and passes <code>ref</code> to it. Put
        it directly in a <code>Field.Root</code>, before the <code>Field.Label</code>. The label,
        help text and error are the Field’s parts, and the switch has no strings of its own. Write{' '}
        <code>marker=&quot;none&quot;</code> on the <code>Field.Label</code>: a switch has no
        required state, so “(optional)” beside a setting is noise. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: switchRows,
    attributes: switchAttributes,
  },
]

export function SwitchPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SwitchExampleSources
}) {
  return (
    <ComponentPage
      title="Switch"
      lead="It is a native checkbox with the role switch, so the browser gives it the Space key, the label click and form submission, and it holds no state of its own."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a switch for a setting that takes effect at once, with no Save or Send button, and
            where both on and off are safe to try. One setting per switch, each independent.
          </li>
          <li>
            Name the setting with a noun phrase: “Text message reminders”. It must read correctly
            with “on” or “off” after it. Never write the action (“Turn on reminders”), a question,
            or “On” and “Off”, and never change the label with the state.
          </li>
          <li>
            Not for an answer that is sent with a form, a declaration or a consent, or a required
            choice: use a <Link href="/components/checkbox">Checkbox</Link>. A switch has no{' '}
            <code>required</code>. A “Yes / No” question is a{' '}
            <Link href="/components/radio-group">RadioGroup</Link>.
          </li>
          <li>
            Not for a tool in a toolbar or a view you show and hide, such as “Show map”: use a{' '}
            <Link href="/components/toggle">Toggle</Link>. Not for an action: use a{' '}
            <Link href="/components/button">Button</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultSwitch />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="controlled-setting"
            title="A setting that is saved at once"
            why="A switch has no Save button, so the page must say that the change is saved straight away, and confirm it. Keep a message region such as an output in the page from the start and fill it after the save, so a screen reader announces it. If the save fails, restore the previous state, show an error under the switch and keep focus on it."
            code={sources['controlled-setting']}
            propsUsed={[
              { part: 'Switch', prop: 'checked' },
              { part: 'Switch', prop: 'onCheckedChange' },
            ]}
            note={
              <Note kind="reminder">
                Never disable the switch while it saves: a disabled element loses focus (WCAG
                2.4.3). A switch never navigates, reloads or moves focus (3.2.2).
              </Note>
            }
          >
            <ControlledSetting />
          </UseCase>
          <UseCase
            id="plain-form"
            title="In a plain form, with no form logic"
            why={
              <>
                Without <code>checked</code> the browser keeps the state, and a form submit sends
                the <code>name</code> and <code>value</code> of an on switch and nothing for an off
                one. Use <code>defaultChecked</code> for a switch that starts on. A setting that
                takes effect at once is the main use of a switch, and a plain form is the secondary
                case. For an answer in a submitted e-service form, use a Checkbox or a RadioGroup
                instead.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Switch', prop: 'name' },
              { part: 'Switch', prop: 'value' },
              { part: 'Switch', prop: 'defaultChecked' },
            ]}
          >
            <PlainForm />
          </UseCase>
          <UseCase
            id="help-text"
            title="A setting with a short explanation"
            why="Say in a Field.HelpText what happens when the switch is on. The screen reader reads it as the switch’s description. For a disabled switch, say why and what to do, never in a tooltip."
            code={sources['help-text']}
            note={
              <Note kind="tip">
                A help text is plain text: no link, list or heading, because a screen reader reads
                it as one flat string.
              </Note>
            }
          >
            <WithHelpText />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Field, Switch, useSwitch } from '@kvirn-ui/react'"
          parts={parts}
          hook={useSwitchHook}
        />
      }
    />
  )
}
