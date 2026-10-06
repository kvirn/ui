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
      lead="One yes-or-no answer, such as a declaration or a consent. It is a native checkbox, so the browser gives it the Space key, the label click and form submission, and it holds no form state."
      status="alpha-candidate"
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
            out of several, or for a question that needs both a yes and a no: use a RadioGroup.
          </li>
          <li>
            Not for an action or a setting that takes effect at once: use a{' '}
            <Link href="/components/button">Button</Link> or a switch.
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
            why="A declaration or a consent is one box the user has to tick before sending. Mark the Field as required, so the label has no “(optional)” and the box is announced as required. Validate on submit, set invalid and say what to do."
            code={sources['declaration']}
            propsUsed={[
              { part: 'Checkbox', prop: 'checked' },
              { part: 'Checkbox', prop: 'onCheckedChange' },
            ]}
            note={
              <Note kind="reminder">
                Set <code>invalid</code> and render the <code>Field.ErrorMessage</code> together,
                and move focus to the first invalid field on submit. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
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
                Without <code>checked</code> the browser keeps the state, and a form submit sends
                the <code>name</code> and <code>value</code> of a ticked box. Use{' '}
                <code>defaultChecked</code> for a box that starts ticked.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Checkbox', prop: 'name' },
              { part: 'Checkbox', prop: 'value' },
              { part: 'Checkbox', prop: 'defaultChecked' },
            ]}
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
                A help text is plain text: no link, list or heading, because a screen reader reads
                it as one flat string and a link in it can’t be followed from the box.
              </Note>
            }
          >
            <WithHelpText />
          </UseCase>
          <UseCase
            id="select-all"
            title="Select all, with a mixed state"
            why="A “select all” box is mixed while only some rows are chosen. You pass indeterminate from your data and clear it once the user has chosen: the browser doesn’t."
            code={sources['select-all']}
            propsUsed={[
              { part: 'Checkbox', prop: 'checked' },
              { part: 'Checkbox', prop: 'indeterminate' },
              { part: 'Checkbox', prop: 'onCheckedChange' },
            ]}
          >
            <SelectAll />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
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
