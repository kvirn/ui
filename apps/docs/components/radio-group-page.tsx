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
  radioAttributes,
  radioGroupErrorMessageAttributes,
  radioGroupErrorMessageRows,
  radioGroupHelpTextAttributes,
  radioGroupHelpTextRows,
  radioGroupLegendAttributes,
  radioGroupLegendRows,
  radioGroupProseAttributes,
  radioGroupProseRows,
  radioGroupRootAttributes,
  radioGroupRootRows,
  radioRows,
  useRadioGroupHook,
  useRadioRows,
} from '../content/radio-group.api.ts'
import { ControlledRadioGroup } from '../examples/radio-group/controlled.tsx'
import { DefaultRadioGroup } from '../examples/radio-group/default.tsx'
import { DisabledOptionRadioGroup } from '../examples/radio-group/disabled-option.tsx'
import { ErrorOnSubmitRadioGroup } from '../examples/radio-group/error-on-submit.tsx'
import { OptionHelpTextRadioGroup } from '../examples/radio-group/option-help-text.tsx'
import { PlainFormRadioGroup } from '../examples/radio-group/plain-form.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type RadioGroupExampleSources = Record<
  | 'default'
  | 'controlled'
  | 'plain-form'
  | 'option-help-text'
  | 'error-on-submit'
  | 'disabled-option',
  string
>

const parts: ApiPart[] = [
  {
    name: 'RadioGroup.Root',
    renders: (
      <>
        <code>&lt;fieldset&gt;</code>, which a screen reader announces as a group. It is a{' '}
        <code>Fieldset.Root</code> with <code>group</code> set, takes every attribute of a{' '}
        <code>&lt;fieldset&gt;</code> and passes <code>ref</code> to it. Its options are{' '}
        <code>RadioGroup.Radio</code> and Field parts. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: radioGroupRootRows,
    attributes: radioGroupRootAttributes,
  },
  {
    name: 'RadioGroup.Radio',
    renders: (
      <>
        <code>&lt;input type=&quot;radio&quot;&gt;</code> with the role <code>radio</code>. It takes
        every attribute of an <code>&lt;input&gt;</code> and passes <code>ref</code> to it. Put it
        directly in a <code>Field.Root</code>, before the label. It never has{' '}
        <code>aria-invalid</code> or <code>aria-required</code>: ARIA doesn’t support them on a
        radio.
      </>
    ),
    props: radioRows,
    attributes: radioAttributes,
  },
  {
    name: 'RadioGroup.Legend',
    renders: (
      <>
        <code>&lt;legend&gt;</code>, the question and the group’s name. Put it first.
      </>
    ),
    props: radioGroupLegendRows,
    attributes: radioGroupLegendAttributes,
  },
  {
    name: 'RadioGroup.Prose',
    renders: (
      <>
        <code>&lt;div&gt;</code> with the class <code>kv-prose</code>: the description, read before
        answering, above the options. It is listed in the group’s <code>aria-describedby</code>.
      </>
    ),
    props: radioGroupProseRows,
    attributes: radioGroupProseAttributes,
  },
  {
    name: 'RadioGroup.HelpText',
    renders: (
      <>
        <code>&lt;p&gt;</code>: a short instruction under the options. It is listed in the group’s{' '}
        <code>aria-describedby</code>. A help text for one option is a <code>Field.HelpText</code>{' '}
        in that option’s Field.
      </>
    ),
    props: radioGroupHelpTextRows,
    attributes: radioGroupHelpTextAttributes,
  },
  {
    name: 'RadioGroup.ErrorMessage',
    renders: (
      <>
        <code>&lt;p&gt;</code> that starts with the error icon and the hidden prefix. It renders
        only while the group is <code>invalid</code>, is the last item in the group’s{' '}
        <code>aria-describedby</code>, and is not a live region. Render one per group.
      </>
    ),
    props: radioGroupErrorMessageRows,
    attributes: radioGroupErrorMessageAttributes,
  },
]

export function RadioGroupPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: RadioGroupExampleSources
}) {
  return (
    <ComponentPage
      title="RadioGroup"
      lead="One question with exactly one answer, such as how long a permit should last. It names the group with a legend, and the browser’s own radio keys do the rest."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for one question where the user must choose exactly one option and the options
            fit on the screen together: a period, a delivery method, a yes or no that needs more
            than a checkbox.
          </li>
          <li>
            Ask the question in the legend. Offer an answer for everyone: if “none” or “I don’t
            know” is valid, make it an option.
          </li>
          <li>
            Preselect an option only when one answer is overwhelmingly common and harmless, because
            residents rarely change a default.
          </li>
          <li>
            Not for a long list. From about 7 options a{' '}
            <Link href="/components/listbox">Listbox</Link> is shorter to scan.
          </li>
          <li>
            Not for answers that can all be true: use a{' '}
            <Link href="/components/checkbox-group">CheckboxGroup</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultRadioGroup />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="controlled"
            title="Keep the choice in your form state"
            why="Your form library or reducer owns the value. Give the group the chosen value and store the one it reports. The group never stores it. Pass null, not undefined, to say the group is controlled and nothing is chosen yet."
            code={sources['controlled']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'value' },
              { part: 'RadioGroup.Root', prop: 'onValueChange' },
              { part: 'RadioGroup.Radio', prop: 'value' },
            ]}
            note={
              <Note kind="tip">
                The arrow keys check the radio they move to, so nothing slow or harmful may happen
                on change. Leave the page change, the save and the submit to a button.
              </Note>
            }
          >
            <ControlledRadioGroup />
          </UseCase>
          <UseCase
            id="plain-form"
            title="A plain form with no state"
            why="Without value the radios are native and uncontrolled. Set which one starts checked with defaultValue, and give the group a name. A form submit then sends the chosen value under that name."
            code={sources['plain-form']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'defaultValue' },
              { part: 'RadioGroup.Root', prop: 'name' },
            ]}
          >
            <PlainFormRadioGroup />
          </UseCase>
          <UseCase
            id="option-help-text"
            title="Explain one option"
            why={
              <>
                A short text about one option goes in that option’s Field as a{' '}
                <code>Field.HelpText</code>, directly under its label, and is read with that radio.
                Text about the whole group goes in <code>RadioGroup.HelpText</code> under the
                options. A description to read before answering goes in{' '}
                <code>RadioGroup.Prose</code> above them.
              </>
            }
            code={sources['option-help-text']}
          >
            <OptionHelpTextRadioGroup />
          </UseCase>
          <UseCase
            id="error-on-submit"
            title="Say what is wrong when nothing is chosen"
            why={
              <>
                Check the answer when the user sends the form. Set <code>invalid</code> and render a{' '}
                <code>RadioGroup.ErrorMessage</code> that says what to do. The error is read as part
                of the group’s description, because a radio can’t be marked invalid.{' '}
                <code>required</code> removes “(optional)” from the legend, but a group can’t be
                announced as required, so the legend or the description must say it.
              </>
            }
            code={sources['error-on-submit']}
            propsUsed={[
              { part: 'RadioGroup.Root', prop: 'invalid' },
              { part: 'RadioGroup.Root', prop: 'required' },
              { part: 'RadioGroup.Root', prop: 'value' },
            ]}
            note={
              <Note kind="reminder">
                The group never moves focus. After a failed submit, move it to the first radio or to
                an error summary, as in <Link href="#what-you-need-to-do">What you need to do</Link>
                .
              </Note>
            }
          >
            <ErrorOnSubmitRadioGroup />
          </UseCase>
          <UseCase
            id="disabled-option"
            title="One option isn’t available"
            why="A single disabled radio is skipped by Tab and by the arrow keys. Say why in its help text, because a disabled control can’t explain itself. To disable every option, set disabled on the group."
            code={sources['disabled-option']}
            propsUsed={[
              { part: 'RadioGroup.Radio', prop: 'disabled' },
              { part: 'RadioGroup.Root', prop: 'disabled' },
            ]}
          >
            <DisabledOptionRadioGroup />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Field, RadioGroup, useRadio, useRadioGroup } from '@kvirn-ui/react'"
          parts={parts}
          hooks={[
            useRadioGroupHook,
            {
              name: 'useRadio',
              intro: (
                <>
                  A hook that gives your own <code>&lt;input type=&quot;radio&quot;&gt;</code> the
                  same attributes, wired to the nearest Field and RadioGroup. It returns{' '}
                  <code>inputProps</code> to spread on the input, and <code>isChecked</code> (known
                  from props only), <code>isInvalid</code> and <code>isDisabled</code>. It has no
                  focus state: style focus with <code>:focus-visible</code>.
                </>
              ),
              options: useRadioRows,
            },
          ]}
          strings={
            <StringsBlock
              namespace="field"
              component="RadioGroup"
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
