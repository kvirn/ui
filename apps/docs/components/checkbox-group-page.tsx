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
  checkboxGroupErrorMessageAttributes,
  checkboxGroupHelpTextAttributes,
  checkboxGroupLegendAttributes,
  checkboxGroupLegendRows,
  checkboxGroupOptionAttributes,
  checkboxGroupOptionRows,
  checkboxGroupProseAttributes,
  checkboxGroupRootAttributes,
  checkboxGroupRootRows,
  useCheckboxGroupHook,
} from '../content/checkbox-group.api.ts'
import { ControlledCheckboxGroup } from '../examples/checkbox-group/controlled.tsx'
import { DefaultCheckboxGroup } from '../examples/checkbox-group/default.tsx'
import { DisabledCheckboxGroup } from '../examples/checkbox-group/disabled.tsx'
import { ErrorOnSubmitCheckboxGroup } from '../examples/checkbox-group/error-on-submit.tsx'
import { OptionHelpTextCheckboxGroup } from '../examples/checkbox-group/option-help-text.tsx'
import { PlainFormCheckboxGroup } from '../examples/checkbox-group/plain-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type CheckboxGroupExampleSources = Record<
  'default' | 'controlled' | 'plain-form' | 'option-help-text' | 'error-on-submit' | 'disabled',
  string
>

const parts: ApiPart[] = [
  {
    name: 'CheckboxGroup.Root',
    renders: (
      <>
        <code>&lt;fieldset&gt;</code>, which a screen reader announces as a group. It is a{' '}
        <code>Fieldset.Root</code> with <code>group</code> set, takes every attribute of a{' '}
        <code>&lt;fieldset&gt;</code> and passes <code>ref</code> to it. Its options are{' '}
        <code>CheckboxGroup.Option</code> parts, each with a{' '}
        <Link href="/components/checkbox">Checkbox</Link> and its label. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: checkboxGroupRootRows,
    attributes: checkboxGroupRootAttributes,
  },
  {
    name: 'CheckboxGroup.Option',
    renders: (
      <>
        <code>&lt;div&gt;</code> (or <code>&lt;li&gt;</code>) around one answer: its checkbox, its{' '}
        <code>Field.Label</code> and its <code>Field.HelpText</code>. It has no “(optional)” marker
        and no error message of its own: those belong to the question.
      </>
    ),
    props: checkboxGroupOptionRows,
    attributes: checkboxGroupOptionAttributes,
  },
  {
    name: 'CheckboxGroup.Legend',
    renders: (
      <>
        <code>&lt;legend&gt;</code>, the question and the group’s name. Put it first.
      </>
    ),
    props: checkboxGroupLegendRows,
    attributes: checkboxGroupLegendAttributes,
  },
  {
    name: 'CheckboxGroup.Prose',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the class <code>kv-prose</code>: the description, read before
        answering, above the options. It is listed in the group’s <code>aria-describedby</code>.
      </>
    ),
    attributes: checkboxGroupProseAttributes,
  },
  {
    name: 'CheckboxGroup.HelpText',
    renders: (
      <>
        <code>&lt;p&gt;</code>: a short instruction under the options. It is listed in the group’s{' '}
        <code>aria-describedby</code>. A help text for one option is a <code>Field.HelpText</code>{' '}
        in that option’s <code>CheckboxGroup.Option</code>.
      </>
    ),
    attributes: checkboxGroupHelpTextAttributes,
  },
  {
    name: 'CheckboxGroup.ErrorMessage',
    renders: (
      <>
        <code>&lt;p&gt;</code> that starts with the error icon and the hidden prefix. It renders
        only while the group is <code>invalid</code>, is the last item in the group’s{' '}
        <code>aria-describedby</code>, and is not a live region. Render one per group.
      </>
    ),
    attributes: checkboxGroupErrorMessageAttributes,
  },
]

export function CheckboxGroupPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: CheckboxGroupExampleSources
}) {
  return (
    <ComponentPage
      title="CheckboxGroup"
      lead="It names the group with a legend. It keeps no state of its own: the checked values are yours."
      pattern="APG Checkbox (in a labelled group)"
      whenToUse={
        <ul>
          <li>
            Use it for one question where the user can choose none, one or several options: contact
            preferences, which services a notification covers, which documents are attached.
          </li>
          <li>
            Ask the question in the legend, and say how many answers are allowed above the options.
          </li>
          <li>
            Keep the list short. Past about 15 options, a search or another pattern is easier to
            use, such as a <Link href="/components/combobox">Combobox</Link> that takes several
            choices. Don’t use <code>&lt;select multiple&gt;</code>.
          </li>
          <li>
            Not for one yes or no answer, such as “I confirm the details are correct”: use a single{' '}
            <Link href="/components/checkbox">Checkbox</Link> in a Field.
          </li>
          <li>
            Not for exactly one answer out of several: use a{' '}
            <Link href="/components/radio-group">RadioGroup</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultCheckboxGroup />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="plain-form"
            title="A plain form with no state"
            why="Without value the checkboxes are native and uncontrolled. Set which boxes start checked with defaultValue, and give the group a name. A form submit then sends every checked box under that name."
            code={sources['plain-form']}
            propsUsed={[
              { part: 'CheckboxGroup.Root', prop: 'defaultValue' },
              { part: 'CheckboxGroup.Root', prop: 'name' },
            ]}
            note={
              <Note kind="tip">
                Read all the checked values with <code>FormData.getAll(&quot;contact&quot;)</code>.
                Every Checkbox in the group needs its own <code>value</code>.
              </Note>
            }
          >
            <PlainFormCheckboxGroup />
          </UseCase>
          <UseCase
            id="controlled"
            title="Keep the choice in your form state"
            why="Your form library or reducer owns the values. Give the group the checked values and store the next ones it reports. The group never stores them, so if you don’t update value, the boxes stay as they were."
            code={sources['controlled']}
            propsUsed={[
              { part: 'CheckboxGroup.Root', prop: 'value' },
              { part: 'CheckboxGroup.Root', prop: 'onValueChange' },
              { part: 'CheckboxGroup.Root', prop: 'name' },
            ]}
          >
            <ControlledCheckboxGroup />
          </UseCase>
          <UseCase
            id="error-on-submit"
            title="Say what is wrong when nothing is chosen"
            why={
              <>
                Check the answer when the user sends the form. Set <code>invalid</code> and render a{' '}
                <code>CheckboxGroup.ErrorMessage</code> that says what to do. The error is read as
                part of the group’s description. <code>required</code> removes “(optional)” from the
                legend, but a group can’t be announced as required, so the text above the options
                must say it, as this example does.
              </>
            }
            code={sources['error-on-submit']}
            propsUsed={[
              { part: 'CheckboxGroup.Root', prop: 'invalid' },
              { part: 'CheckboxGroup.Root', prop: 'required' },
              { part: 'CheckboxGroup.Root', prop: 'value' },
            ]}
            note={
              <Note kind="reminder">
                The group never moves focus. After a failed submit, move it to the first checkbox or
                to an <Link href="/components/error-summary">ErrorSummary</Link>. The error is read
                only when focus enters the group, so without the move a screen reader user isn’t
                told what went wrong (3.3.1 Error Identification).
              </Note>
            }
          >
            <ErrorOnSubmitCheckboxGroup />
          </UseCase>
          <UseCase
            id="option-help-text"
            title="Explain one option"
            why={
              <>
                A short text about one option goes in that option’s{' '}
                <code>CheckboxGroup.Option</code> as a <code>Field.HelpText</code>, directly under
                its label, and is read with that checkbox. Text about the whole group goes in{' '}
                <code>CheckboxGroup.HelpText</code> under the options. A description to read before
                answering goes in <code>CheckboxGroup.Prose</code> above them.
              </>
            }
            code={sources['option-help-text']}
          >
            <OptionHelpTextCheckboxGroup />
          </UseCase>
          <UseCase
            id="disabled"
            title="A group that can’t be changed now"
            why="Disabling the group disables every checkbox natively, so Tab skips them. Say why in a help text, because a disabled control can’t explain itself."
            code={sources['disabled']}
            propsUsed={[{ part: 'CheckboxGroup.Root', prop: 'disabled' }]}
          >
            <DisabledCheckboxGroup />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Start the group with a <code>CheckboxGroup.Legend</code> that asks the question.
                Without it, a screen reader user hears the options with no question to answer (1.3.1
                Info and Relationships; 3.3.2 Labels or Instructions).
              </Note>
            ),
            'known-issues': (
              <Note kind="reminder">
                A required group is not announced as required. Write that an answer is needed in the
                legend or in the text above the options (3.3.2 Labels or Instructions).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Checkbox, CheckboxGroup, Field, useCheckboxGroup } from '@kvirn-ui/react'"
          parts={parts}
          hook={useCheckboxGroupHook}
          strings={
            <StringsBlock
              namespace="field"
              component="CheckboxGroup"
              keys={[
                { key: 'optional', meaning: 'The legend’s marker when the group is not required.' },
                {
                  key: 'errorPrefix',
                  meaning: 'Read before the error message, so it is not mistaken for help.',
                },
              ]}
            >
              <p>These are the Field strings, because the legend and the error use them.</p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
