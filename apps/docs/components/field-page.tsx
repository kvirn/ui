import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { apiHookPart } from './api-ids.ts'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  fieldErrorMessageAttributes,
  fieldHelpTextAttributes,
  fieldLabelAttributes,
  fieldLabelRows,
  fieldProseAttributes,
  fieldRootAttributes,
  fieldRootRows,
  useFieldHook,
} from '../content/field.api.ts'
import { DefaultField } from '../examples/field/default.tsx'
import { DescriptionAndHelpText } from '../examples/field/description-and-help-text.tsx'
import { DisabledWithReason } from '../examples/field/disabled.tsx'
import { ErrorOnSubmit } from '../examples/field/error-on-submit.tsx'
import { RequiredAndOptional } from '../examples/field/required-and-optional.tsx'
import { OwnElements } from '../examples/field/use-field.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type FieldExampleSources = Record<
  | 'default'
  | 'required-and-optional'
  | 'description-and-help-text'
  | 'error-on-submit'
  | 'disabled'
  | 'use-field',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Field.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It makes the ids and tells its
        label, description, help text, error and control about each other. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: fieldRootRows,
    attributes: fieldRootAttributes,
  },
  {
    name: 'Field.Label',
    renders: (
      <>
        <code>&lt;label for&gt;</code>. It names the control. It ends with the optional text when
        the field is not required, unless <code>marker=&quot;none&quot;</code> or the Field is in a
        group Fieldset.
      </>
    ),
    props: fieldLabelRows,
    attributes: fieldLabelAttributes,
  },
  {
    name: 'Field.Prose',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-prose&quot;&gt;</code>, the description. Anywhere inside a
        Field it registers itself, gets an id and is listed in the control’s{' '}
        <code>aria-describedby</code>. It is the same <Link href="/components/prose">Prose</Link> as
        outside a Field.
      </>
    ),
    attributes: fieldProseAttributes,
  },
  {
    name: 'Field.HelpText',
    renders: (
      <>
        <code>&lt;p&gt;</code>, the help text. It registers like a description and is listed in DOM
        order, then the error. Outside a Field or Fieldset it renders a plain paragraph with no id
        and warns in development.
      </>
    ),
    attributes: fieldHelpTextAttributes,
  },
  {
    name: 'Field.ErrorMessage',
    renders: (
      <>
        <code>&lt;p&gt;</code>, rendered only while the field is invalid. It starts with a
        decorative error icon and the <code>field.errorPrefix</code> text, which the default theme
        hides from sight but not from screen readers. It is not a live region.
      </>
    ),
    attributes: fieldErrorMessageAttributes,
  },
]

export function FieldPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: FieldExampleSources
}) {
  return (
    <ComponentPage
      title="Field"
      lead="It holds no form state and never validates: you decide when a field is invalid."
      whenToUse={
        <ul>
          <li>
            Use a Field for every control that asks one question, in a resident form or a staff
            tool, so the control is never without a visible label.
          </li>
          <li>
            Put what people must read before answering in the description, and a format, an example
            or a limit in the help text under the control.
          </li>
          <li>
            Set <code>required</code> and <code>invalid</code> from your own form logic. Field only
            shows the state: the validation is yours.
          </li>
          <li>
            On a form with several fields, add an{' '}
            <Link href="/components/error-summary">ErrorSummary</Link> that lists the errors with a
            link to each field.
          </li>
          <li>
            Not for one question answered with several controls, such as a date or a group of
            options: use a <Link href="/components/fieldset">Fieldset</Link> with a legend.
          </li>
          <li>
            Not for text that belongs to no control: use <Link href="/components/prose">Prose</Link>
            .
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultField />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="required-and-optional"
            title="Say which questions are optional"
            why="Mark required fields required, and the label of every other field ends with “(optional)”. Required fields carry no visible marker. Where the optional text is wrong, such as a lone search field, turn it off."
            code={sources['required-and-optional']}
            propsUsed={[
              { part: 'Field.Root', prop: 'required' },
              { part: 'Field.Label', prop: 'marker' },
            ]}
            note={
              <Note kind="tip">
                Field sets <code>aria-required</code>, not native <code>required</code>, so the
                browser shows no validation bubbles in its own words. For native validation, pass{' '}
                <code>required</code> on the control too, and keep it on the Field so the label
                doesn’t say “(optional)”.
              </Note>
            }
          >
            <RequiredAndOptional />
          </UseCase>
          <UseCase
            id="description-and-help-text"
            title="Explain the question and show the format"
            why="A description is what people must read before answering, so it goes above the control and may hold a few short paragraphs. A help text is a short instruction, example or limit, so it goes under the control. Both are linked to the control, so a screen reader can read them when the control gets focus, in the order they appear."
            code={sources['description-and-help-text']}
            note={
              <Note kind="recipe">
                Keep a help text to plain text of one or two sentences: no link, list or heading. A
                screen reader reads the description and the help text as flat text, so anything with
                structure goes outside the Field.
              </Note>
            }
          >
            <DescriptionAndHelpText />
          </UseCase>
          <UseCase
            id="error-on-submit"
            title="Show an error after the form is sent"
            why="Validate when the form is sent, not on every key. Set invalid, render the error message and move focus to the field, so the error is read with it. Say what is wrong and how to fix it, and repeat the format."
            code={sources['error-on-submit']}
            propsUsed={[{ part: 'Field.Root', prop: 'invalid' }]}
            note={
              <Note kind="reminder">
                Field never moves focus. When the form is sent, move it to the first invalid field
                or to an <Link href="/components/error-summary">ErrorSummary</Link>. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <ErrorOnSubmit />
          </UseCase>
          <UseCase
            id="disabled-with-reason"
            title="A field that can’t be changed"
            why="Disabling a field disables its control natively and marks every part. A disabled control can’t take focus, so avoid it in a resident form. Where you can’t, say why in the help text. A read-only control stays reachable with the keyboard if people only need to read the value."
            code={sources['disabled']}
            propsUsed={[{ part: 'Field.Root', prop: 'disabled' }]}
          >
            <DisabledWithReason />
          </UseCase>
          <UseCase
            id="own-elements"
            title="Wire your own elements"
            why="For a control KvirnUI doesn’t have, or markup of your own, useField gives the ids, aria-describedby and state attributes to spread. Name the descriptions from the first render, so server-rendered markup is complete."
            code={sources['use-field']}
            propsUsed={[
              {
                part: apiHookPart('useField', 'options'),
                prop: 'descriptions',
                label: 'useField (options)',
              },
            ]}
          >
            <OwnElements />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every control a visible label. A placeholder is not a label: it is gone once
                people type (3.3.2 Labels or Instructions).
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Field, useField } from '@kvirn-ui/react'"
          parts={parts}
          hook={useFieldHook}
          strings={
            <StringsBlock
              namespace="field"
              component="Field"
              keys={[
                {
                  key: 'optional',
                  meaning: 'The text that ends the label of a field that is not required.',
                },
                { key: 'errorPrefix', meaning: 'The text that starts the Field.ErrorMessage.' },
              ]}
            />
          }
        />
      }
    />
  )
}
