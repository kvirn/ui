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
import { QuestionPage } from '../examples/stepper/question-page.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type StepperExampleSources = Record<'default' | 'question-page' | 'own-markup', string>

const parts: ApiPart[] = [
  {
    name: 'Stepper',
    renders: (
      <>
        <code>&lt;p&gt;</code> with no role of its own, or a <code>&lt;div&gt;</code> with{' '}
        <code>as</code>. The text is the message, so it takes no children. It takes every attribute
        of a <code>&lt;p&gt;</code> and passes <code>ref</code> to it. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
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
      lead="It is orientation, not navigation: it has no links and is not a Tab stop."
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
          <li>Not on a start page, a confirmation page, an exit page or a form with one page.</li>
          <li>
            Not for moving between steps: it has no links. Going back is a Back link, made with a{' '}
            <Link href="/components/link">Link</Link>. The check-answers page can use a{' '}
            <Link href="/components/definition-list">DefinitionList</Link> with a Change link for
            each answer.
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
            id="question-page"
            title="A page with a question in an application"
            why="A step is a section, and a section can take more than one page. This is the second page of “Your vehicle”, so it still says step 2 of 5. The name is optional: without one the text is “Step 2 of 5”."
            code={sources['question-page']}
            propsUsed={[
              { part: 'Stepper', prop: 'current' },
              { part: 'Stepper', prop: 'total' },
              { part: 'Stepper', prop: 'name' },
            ]}
          >
            <QuestionPage />
          </UseCase>
          <UseCase
            id="own-markup"
            title="With your own element"
            why="When the markup is yours, spread the props from the hook on your own element and use the text from the hook. You can use the same text in the page title."
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
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Put the Stepper directly after the page heading, as its own element. Inside a
                heading, label or legend its text becomes part of that name (1.3.1 Info and
                Relationships, level A). A development warning says so.
              </Note>
            ),
          }}
        />
      }
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
