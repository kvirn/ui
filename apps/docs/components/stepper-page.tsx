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
import { ApplicationFlow } from '../examples/stepper/application-flow.tsx'
import { DefaultStepper } from '../examples/stepper/default.tsx'
import { OptionsPage } from '../examples/stepper/options-page.tsx'
import { OwnMarkup } from '../examples/stepper/own-markup.tsx'
import { QuestionPage } from '../examples/stepper/question-page.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type StepperExampleSources = Record<
  'default' | 'question-page' | 'application-flow' | 'options-page' | 'own-markup',
  string
>

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
            id="application-flow"
            title="An application that moves from section to section"
            why={
              <>
                The numbers come from your flow, so the text changes with each step and stays in the
                same place on every page. Focus moves to the new page’s heading, and the answers are
                kept when the person goes back. On the last step the example shows a page without a
                Stepper, as a confirmation should. Here Back is a button, because the example keeps
                its state on one page. On a real site it is a Back link.
              </>
            }
            code={sources['application-flow']}
            propsUsed={[
              { part: 'Stepper', prop: 'current' },
              { part: 'Stepper', prop: 'total' },
              { part: 'Stepper', prop: 'name' },
            ]}
            note={
              <Note kind="tip">
                Moving focus to the heading is the flow’s work, here with{' '}
                <Link href="/components/route-focus">useRouteFocus</Link>. The Stepper is not a Tab
                stop and says nothing by itself when the step changes (2.4.3 Focus Order, level A).
              </Note>
            }
          >
            <ApplicationFlow />
          </UseCase>
          <UseCase
            id="options-page"
            title="A page with a choice between options"
            why="When the question is a group of options, the legend is the page’s heading. Put the Stepper straight after the legend, outside it, so it is not read as part of the group’s name."
            code={sources['options-page']}
            propsUsed={[
              { part: 'Stepper', prop: 'current' },
              { part: 'Stepper', prop: 'total' },
              { part: 'Stepper', prop: 'name' },
            ]}
          >
            <OptionsPage />
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
