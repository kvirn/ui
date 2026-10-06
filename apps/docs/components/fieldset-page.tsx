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
  fieldsetErrorMessageRows,
  fieldsetHelpTextAttributes,
  fieldsetHelpTextRows,
  fieldsetLegendAttributes,
  fieldsetLegendRows,
  fieldsetProseAttributes,
  fieldsetProseRows,
  fieldsetRootAttributes,
  fieldsetRootRows,
  useFieldsetHook,
} from '../content/fieldset.api.ts'
import { DefaultFieldset } from '../examples/fieldset/default.tsx'
import { DisabledGroup } from '../examples/fieldset/disabled.tsx'
import { GroupError } from '../examples/fieldset/error-on-submit.tsx'
import { OneQuestion } from '../examples/fieldset/group.tsx'
import { OwnElements } from '../examples/fieldset/use-fieldset.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type FieldsetExampleSources = Record<
  'default' | 'group' | 'error-on-submit' | 'disabled' | 'use-fieldset',
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
        <code>&lt;legend&gt;</code>, the group’s name. Put it first in the fieldset.
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
    props: fieldsetProseRows,
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
    props: fieldsetHelpTextRows,
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
    props: fieldsetErrorMessageRows,
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
      lead="A native fieldset that groups related questions, or the controls of one question, under a legend that names the group. It holds no form state."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a Fieldset for one question answered with several controls, such as the options of a{' '}
            <Link href="/components/checkbox">checkbox</Link> or radio group, or a date in three
            boxes. Set <code>group</code>.
          </li>
          <li>
            Use a plain Fieldset to group related questions under one name, such as an address.
          </li>
          <li>
            Always write a legend that asks the question or names the group, and put it first.
          </li>
          <li>
            Don’t wrap every Field in a Fieldset: a fieldset announces itself, and nested ones get
            noisy.
          </li>
          <li>
            Not for a single control: use a <Link href="/components/field">Field</Link>, whose label
            names it.
          </li>
        </ul>
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
            why="When the boxes together make one answer, set group. The legend then takes the optional text if the group isn’t required, and the Fields inside never say “(optional)” on their own: a box is never optional by itself."
            code={sources['group']}
            propsUsed={[{ part: 'Fieldset.Root', prop: 'group' }]}
            note={
              <Note kind="recipe">
                Use a Fieldset only where controls belong together. A screen reader announces the
                legend each time focus enters the group.
              </Note>
            }
          >
            <OneQuestion />
          </UseCase>
          <UseCase
            id="group-error"
            title="Describe the group and report its error"
            why="The description is read before answering, so it goes above the controls. The help text goes under them, and the error last. All three are the group’s: screen reader users hear them when focus enters the group."
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
            id="disabled-group"
            title="A group that can’t be changed"
            why="Disabling a Fieldset disables every control inside it natively, and Tab skips them. Say why in the help text."
            code={sources['disabled']}
            propsUsed={[{ part: 'Fieldset.Root', prop: 'disabled' }]}
          >
            <DisabledGroup />
          </UseCase>
          <UseCase
            id="own-elements"
            title="Wire your own fieldset"
            why="For markup of your own, useFieldset gives the id, aria-describedby and state attributes to spread on a native fieldset and its legend. Name the descriptions from the first render, so server-rendered markup is complete."
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
                Every fieldset needs a legend as its first child, or the group has no name. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <OwnElements />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} messageNamespace="field" linkToStrings />}
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
