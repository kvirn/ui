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
import { stepperAttributes, stepperRows, useStepperHook } from '../content/stepper.api.ts'
import { DefaultStepper } from '../examples/stepper/default.tsx'
import { OwnMarkup } from '../examples/stepper/own-markup.tsx'
import { WithoutName } from '../examples/stepper/without-name.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type StepperExampleSources = Record<'default' | 'without-name' | 'own-markup', string>

const parts: ApiPart[] = [
  {
    name: 'Stepper',
    renders: (
      <>
        <code>&lt;p&gt;</code> with no role of its own. The text is the message, so it takes no
        children. It takes every attribute of a <code>&lt;p&gt;</code> and passes <code>ref</code>{' '}
        to it. The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: stepperRows,
    attributes: stepperAttributes,
  },
]

export function StepperPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: StepperExampleSources
}) {
  return (
    <ComponentPage
      title="Stepper"
      lead="It is orientation, not navigation."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it at the top of each page of a form that takes several pages, directly after the
            page heading.
          </li>
          <li>
            Count sections, not pages, so an answer that adds a page never changes the total. If you
            can’t count the sections reliably, leave it out: never “Step 3 of ?”.
          </li>
          <li>
            Not for moving between pages: it has no links. Use{' '}
            <Link href="/components/navigation">Navigation</Link> or a{' '}
            <Link href="/components/breadcrumb">Breadcrumb</Link> for that, and a{' '}
            <Link href="/components/definition-list">DefinitionList</Link> for the last check.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultStepper />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="without-name"
            title="Without a section name"
            why="Leave out the name when the heading already says it. The text is then “Step 1 of 3”. A blank name counts as none."
            code={sources['without-name']}
            propsUsed={[
              { part: 'Stepper', prop: 'current' },
              { part: 'Stepper', prop: 'total' },
            ]}
            note={
              <Note kind="reminder">
                Put it after the heading as its own element, never inside a heading, label, legend
                or button, or its text joins that name. A development warning says so. See{' '}
                <Link href="#what-you-need-to-do">what you need to do</Link>.
              </Note>
            }
          >
            <WithoutName />
          </UseCase>
          <UseCase
            id="own-markup"
            title="With your own element"
            why="When the markup is yours, spread the class on your own element and use the text from the hook. The same text is useful in the page title."
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useStepper', 'result'),
                label: 'useStepper (result)',
                prop: 'rootProps',
              },
            ]}
          >
            <OwnMarkup />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Stepper, useStepper } from '@kvirn-ui/react'"
          parts={parts}
          hook={useStepperHook}
          strings={
            <StringsBlock
              namespace="stepper"
              component="Stepper"
              keys={[
                {
                  key: 'status',
                  meaning: 'The text without a name. Each language owns its word order.',
                  values: { current: 2, total: 5 },
                },
                {
                  key: 'statusWithName',
                  meaning: 'The text with the section’s name.',
                  values: { current: 2, total: 5, name: 'Your vehicle' },
                },
              ]}
            />
          }
        />
      }
    />
  )
}
