import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { checkboxAttributes, checkboxRows, useCheckboxHook } from '../content/checkbox.api.ts'
import { Declaration } from '../examples/checkbox/declaration.tsx'
import { DefaultCheckbox } from '../examples/checkbox/default.tsx'
import { WithHelpText } from '../examples/checkbox/help-text.tsx'
import { PlainForm } from '../examples/checkbox/plain-form.tsx'
import { SelectAll } from '../examples/checkbox/select-all.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CheckboxExampleSources = Record<
  'default' | 'declaration' | 'plain-form' | 'help-text' | 'select-all',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Checkbox',
    renders: (
      <>
        <code>&lt;input type=&quot;checkbox&quot;&gt;</code> with the role <code>checkbox</code>. It
        takes every attribute of an <code>&lt;input&gt;</code> except <code>type</code>, and passes{' '}
        <code>ref</code> to it. Put it directly in a <code>Field.Root</code>, before the{' '}
        <code>Field.Label</code>. The label, help text and error are the Field’s parts. The default
        theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: checkboxRows,
    attributes: checkboxAttributes,
  },
]

export function CheckboxPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: CheckboxExampleSources
}) {
  return (
    <ComponentPage
      title="Checkbox"
      lead="It is a native checkbox, so the browser handles the Space key, clicking the label and sending the form. It keeps no form state of its own."
      pattern="APG Checkbox (two-state and mixed)"
      whenToUse={
        <ul>
          <li>
            Use a checkbox for one yes-or-no answer: a declaration, a consent, or a “select all” in
            a staff table.
          </li>
          <li>
            Write the label as a sentence that can be answered “yes”: “I confirm that the
            information is correct”.
          </li>
          <li>
            Not for several answers to one question: use a{' '}
            <Link href="/components/checkbox-group">CheckboxGroup</Link>. Not for exactly one answer
            out of several, or for a question that needs both a yes and a no: use a{' '}
            <Link href="/components/radio-group">RadioGroup</Link>.
          </li>
          <li>
            Not for an action or a setting that takes effect at once: use a{' '}
            <Link href="/components/button">Button</Link>, or a{' '}
            <Link href="/components/switch">Switch</Link> for a saved setting.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultCheckbox />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="declaration"
            title="A declaration that must be confirmed"
            why="A declaration or a consent is one box the user has to tick before sending. Mark the Field as required, so the label has no “(optional)” and a screen reader (software that reads the screen aloud) says the box is required. Check the answer when the user sends the form. Then set invalid and say what to do."
            code={sources['declaration']}
            propsUsed={[
              { part: 'Checkbox', prop: 'checked' },
              { part: 'Checkbox', prop: 'onCheckedChange' },
            ]}
            note={
              <Note kind="reminder">
                Set <code>invalid</code> and show the <code>Field.ErrorMessage</code> together, then
                move focus to the box after a failed send. An error is read only when its field gets
                focus, so without the move a screen reader user isn’t told what went wrong (3.3.1
                Error Identification).
              </Note>
            }
          >
            <Declaration />
          </UseCase>
          <UseCase
            id="plain-form"
            title="In a plain form, with no form logic"
            why={
              <>
                Without <code>checked</code> the browser keeps the state. A form submit sends the{' '}
                <code>name</code> and <code>value</code> of a ticked box, and nothing for an
                unticked one.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Checkbox', prop: 'name' },
              { part: 'Checkbox', prop: 'value' },
            ]}
            note={
              <Note kind="tip">
                <code>defaultChecked</code> starts a box ticked. Don’t use it for a consent: the
                GDPR says pre-ticked boxes don’t count as consent (recital 32).
              </Note>
            }
          >
            <PlainForm />
          </UseCase>
          <UseCase
            id="help-text"
            title="An option with a short explanation"
            why="A consent often needs one more sentence. Put it in a Field.HelpText under the label: the screen reader reads it as the box’s description when the box gets focus."
            code={sources['help-text']}
            note={
              <Note kind="tip">
                A help text is plain text: no link, list or heading. A screen reader reads it as one
                flat string, so a link or list in it would lose its meaning.
              </Note>
            }
          >
            <WithHelpText />
          </UseCase>
          <UseCase
            id="select-all"
            title="Select all, with a mixed state"
            why="A “select all” box shows a mixed state while only some rows are chosen: not all, and not none. You set indeterminate from your data. The browser does not clear it when the user clicks, so your data must."
            code={sources['select-all']}
            propsUsed={[
              { part: 'Checkbox', prop: 'checked' },
              { part: 'Checkbox', prop: 'indeterminate' },
              { part: 'Checkbox', prop: 'onCheckedChange' },
            ]}
            note={
              <Note kind="reminder">
                Give every row’s box its own visible label that tells the rows apart, such as the
                case number. Boxes that all read “Select” can’t be told apart (2.4.6 Headings and
                Labels; 4.1.2 Name, Role, Value).
              </Note>
            }
          >
            <SelectAll />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every checkbox a visible <code>Field.Label</code>. Without one, a screen reader
                says only “checkbox” and nobody knows what is being asked (4.1.2 Name, Role, Value;
                3.3.2 Labels or Instructions). A development warning says so.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Checkbox, Field, useCheckbox } from '@kvirn-ui/react'"
          parts={parts}
          hook={useCheckboxHook}
        />
      }
    />
  )
}
