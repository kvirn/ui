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
  fieldsetErrorMessageAttributes,
  fieldsetHelpTextAttributes,
  fieldsetLegendAttributes,
  fieldsetLegendRows,
  fieldsetProseAttributes,
  fieldsetRootAttributes,
  fieldsetRootRows,
  useFieldsetHook,
} from '../content/fieldset.api.ts'
import { DefaultFieldset } from '../examples/fieldset/default.tsx'
import { GroupError } from '../examples/fieldset/error-on-submit.tsx'
import { OneQuestion } from '../examples/fieldset/group.tsx'
import { QuestionAsHeading } from '../examples/fieldset/page-heading.tsx'
import { OwnElements } from '../examples/fieldset/use-fieldset.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type FieldsetExampleSources = Record<
  'default' | 'group' | 'page-heading' | 'error-on-submit' | 'use-fieldset',
  string
>

const parts: ApiPart[] = [
  {
    name: 'Fieldset.Root',
    renders: (
      <>
        <code>&lt;fieldset&gt;</code> with the role <code>group</code>. It takes every attribute of
        a <code>&lt;fieldset&gt;</code> and passes <code>ref</code> to it. Your own{' '}
        <code>aria-describedby</code> ids come after its. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: fieldsetRootRows,
    attributes: fieldsetRootAttributes,
  },
  {
    name: 'Fieldset.Legend',
    renders: (
      <>
        <code>&lt;legend&gt;</code>, the group’s name. It takes every attribute of a{' '}
        <code>&lt;legend&gt;</code> and passes <code>ref</code> to it. Put it first in the fieldset.
      </>
    ),
    props: fieldsetLegendRows,
    attributes: fieldsetLegendAttributes,
  },
  {
    name: 'Fieldset.Prose',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-prose&quot;&gt;</code>, the group’s description. Directly in a
        Fieldset, and not inside a Field in it, it registers itself and is listed in the fieldset’s{' '}
        <code>aria-describedby</code>.
      </>
    ),
    attributes: fieldsetProseAttributes,
  },
  {
    name: 'Fieldset.HelpText',
    renders: (
      <>
        <code>&lt;p&gt;</code>, the group’s help text. It is the same part as{' '}
        <Link href="/components/field#api-field-helptext">Field.HelpText</Link> under the group’s
        name, and goes under the controls.
      </>
    ),
    attributes: fieldsetHelpTextAttributes,
  },
  {
    name: 'Fieldset.ErrorMessage',
    renders: (
      <>
        <code>&lt;p&gt;</code>, rendered only while the fieldset is invalid, with the same icon and
        prefix as the Field’s. It is not a live region.
      </>
    ),
    attributes: fieldsetErrorMessageAttributes,
  },
]

export function FieldsetPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: FieldsetExampleSources
}) {
  return (
    <ComponentPage
      title="Fieldset"
      lead="It holds no form state, and it never moves focus."
      whenToUse={
        <>
          <ul>
            <li>
              Use a Fieldset when one question is answered in several boxes, such as a name in a
              first and a last name box. Set <code>group</code>.
            </li>
            <li>
              Use a plain Fieldset to put related questions under one name, such as an address.
            </li>
            <li>
              Write a legend that asks the question or names the group, and put it first. A screen
              reader (software that reads the screen aloud) uses it as the name of the group.
            </li>
            <li>
              Don’t wrap every Field in a Fieldset. A screen reader announces a fieldset when focus
              enters it, so nested ones get noisy.
            </li>
            <li>
              Not for one control: use a <Link href="/components/field">Field</Link>, whose label
              names it. Not for checkboxes, radio buttons or a date: a{' '}
              <Link href="/components/checkbox-group">CheckboxGroup</Link>, a{' '}
              <Link href="/components/radio-group">RadioGroup</Link> and a{' '}
              <Link href="/components/date-input">DateInput</Link> already include a fieldset.
            </li>
          </ul>
          <Note kind="tip">
            To show an answer that can’t be changed, show it as text, such as “Applicant: Anna
            Andersson”, not as a disabled group. A disabled control gets no keyboard focus, so
            people using a keyboard or a screen reader can’t reach it to read it (see the Keyboard
            table).
          </Note>
        </>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultFieldset />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="one-question"
            title="One question, several boxes"
            why="When the boxes together make one answer, set group. The legend then ends with “(optional)” if the group isn’t required, and the Fields inside never say “(optional)” on their own: one box of a name is never optional by itself."
            code={sources['group']}
            propsUsed={[{ part: 'Fieldset.Root', prop: 'group' }]}
          >
            <OneQuestion />
          </UseCase>
          <UseCase
            id="group-error"
            title="Describe the group and report its error"
            why={
              <>
                The description is read before answering, so it goes above the controls. The help
                text goes under them, and the error last. All three belong to the group and are
                linked to it, so a screen reader can read them when focus enters the group. Support
                differs between screen readers (see <Link href="#known-issues">Known issues</Link>).
                After a failed send, move focus to the first control that is wrong.
              </>
            }
            code={sources['error-on-submit']}
            propsUsed={[
              { part: 'Fieldset.Root', prop: 'invalid' },
              { part: 'Fieldset.Root', prop: 'required' },
            ]}
            note={
              <Note kind="tip">
                A Fieldset’s <code>invalid</code> marks only its own parts. Mark a Field inside with
                the Field’s own <code>invalid</code>, and give it its own error message.
              </Note>
            }
          >
            <GroupError />
          </UseCase>
          <UseCase
            id="question-as-heading"
            title="The question is the page heading"
            why={
              <>
                When a page asks one thing, the legend can be the page’s heading. Put the heading
                inside the legend and add the class <code>kv-fieldset-legend--heading</code>. Use{' '}
                <code>h1</code> if it is the page’s main heading: this example is in a page that
                already has one, so it uses <code>h2</code>.
              </>
            }
            code={sources['page-heading']}
          >
            <QuestionAsHeading />
          </UseCase>
          <UseCase
            id="own-elements"
            title="Wire your own fieldset"
            why={
              <>
                For markup of your own, <code>useFieldset</code> gives the id,{' '}
                <code>aria-describedby</code> and state attributes to spread on a native fieldset
                and its legend. Name the descriptions from the first render, so server-rendered
                markup is complete.
              </>
            }
            code={sources['use-fieldset']}
            propsUsed={[
              {
                part: apiHookPart('useFieldset', 'options'),
                prop: 'descriptions',
                label: 'useFieldset (options)',
              },
            ]}
            note={
              <Note kind="reminder">
                Every fieldset needs a legend as its first child, or the group has no name (1.3.1
                Info and Relationships, 4.1.2 Name, Role, Value). See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <OwnElements />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="field"
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Set <code>invalid</code> and render a <code>Fieldset.ErrorMessage</code> together,
                with text that says what is wrong and how to fix it. A group has no invalid state of
                its own, so without the text a screen reader user isn’t told anything is wrong
                (3.3.1 Error Identification, 3.3.3 Error Suggestion).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                Test with the screen readers your users have (see Testing), and read these items as
                reports, not results. Add what applies to your service to your accessibility
                statement, with the workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Fieldset, useFieldset } from '@kvirn-ui/react'"
          parts={parts}
          hook={useFieldsetHook}
          strings={
            <StringsBlock
              namespace="field"
              component="Fieldset"
              keys={[
                {
                  key: 'optional',
                  meaning: 'The text that ends the legend of a group that is not required.',
                },
                { key: 'errorPrefix', meaning: 'The text that starts the Fieldset.ErrorMessage.' },
              ]}
            >
              <p>
                A Fieldset uses the same two texts as a <Link href="/components/field">Field</Link>.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
