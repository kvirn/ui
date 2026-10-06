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
  actionsAttributes,
  actionsRows,
  changeAttributes,
  changeRows,
  keyAttributes,
  keyRows,
  rootAttributes,
  rootRows,
  rowAttributes,
  rowRows,
  useSummaryListHook,
  valueAttributes,
  valueRows,
} from '../content/summary-list.api.ts'
import { CaseCard } from '../examples/summary-list/case-card.tsx'
import { CheckYourAnswers } from '../examples/summary-list/check-your-answers.tsx'
import { DefaultSummaryList } from '../examples/summary-list/default.tsx'
import { MissingAnswer } from '../examples/summary-list/missing-answer.tsx'
import { OwnMarkup } from '../examples/summary-list/own-markup.tsx'
import { SeveralAnswers } from '../examples/summary-list/several-answers.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SummaryListExampleSources = Record<
  | 'default'
  | 'check-your-answers'
  | 'case-card'
  | 'missing-answer'
  | 'several-answers'
  | 'own-markup',
  string
>

const renderedElement = (tag: string) => (
  <>
    <code>&lt;{tag}&gt;</code> with no role of its own. It takes every attribute of a{' '}
    <code>&lt;{tag}&gt;</code> and passes <code>ref</code> to it.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'SummaryList.Root',
    renders: (
      <>
        {renderedElement('dl')} Its direct children are Rows. Also exported as{' '}
        <code>SummaryListRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'SummaryList.Row',
    renders: (
      <>
        {renderedElement('div')} It keeps one key with its values and gives the Key an id for the
        Change link. Also exported as <code>SummaryListRow</code>.
      </>
    ),
    props: rowRows,
    attributes: rowAttributes,
  },
  {
    name: 'SummaryList.Key',
    renders: (
      <>
        {renderedElement('dt')} The label. It needs text, because the Change link’s name is built
        from it. Also exported as <code>SummaryListKey</code>.
      </>
    ),
    props: keyRows,
    attributes: keyAttributes,
  },
  {
    name: 'SummaryList.Value',
    renders: (
      <>
        {renderedElement('dd')} The answer. A row can hold more than one. Also exported as{' '}
        <code>SummaryListValue</code>.
      </>
    ),
    props: valueRows,
    attributes: valueAttributes,
  },
  {
    name: 'SummaryList.Actions',
    renders: (
      <>
        {renderedElement('dd')} Holds the row’s links, such as Change. Also exported as{' '}
        <code>SummaryListActions</code>.
      </>
    ),
    props: actionsRows,
    attributes: actionsAttributes,
  },
  {
    name: 'SummaryList.Change',
    renders: (
      <>
        <code>&lt;a&gt;</code> with the role <code>link</code>. Its text is the message{' '}
        <code>summaryList.change</code> unless you pass children, and its name is that text plus the
        Key’s. Give it the <code>href</code> of the step where the answer is changed. It takes every
        attribute of an <code>&lt;a&gt;</code> and passes <code>ref</code> to it. Also exported as{' '}
        <code>SummaryListChange</code>.
      </>
    ),
    props: changeRows,
    attributes: changeAttributes,
  },
]

export function SummaryListPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SummaryListExampleSources
}) {
  return (
    <ComponentPage
      title="SummaryList"
      lead="Rows of a label, an answer and a link to change it, as one native description list. Every link says what it changes, because its name is built from the row’s label."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it to show what someone has already given or what a case contains: the last step
            before they send, a contact card, a case card.
          </li>
          <li>
            Put the Change link where the answer is changed, so people don’t have to start again.
            Leave it out when the value can’t be changed.
          </li>
          <li>
            Write a Key for every row, and a Value that says so when there is no answer: “Not
            provided”, not an empty row.
          </li>
          <li>
            Not for a value people edit in place: that is a{' '}
            <Link href="/components/field">Field</Link>. Not for data with several columns: use a{' '}
            <Link href="/components/table">Table</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultSummaryList />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="check-your-answers"
            title="Check your answers before sending"
            why="The last step of a form shows every answer with a link back to the step where it is changed. Each link reads, for example, “Change Name”, so a screen reader user who lists the links knows what each one does."
            code={sources['check-your-answers']}
            note={
              <Note kind="reminder">
                Give every row a Key. The link’s name is built from it, and without a Row and a Key
                it is only “Change” and a development warning says so.
              </Note>
            }
          >
            <CheckYourAnswers />
          </UseCase>
          <UseCase
            id="case-card"
            title="Details of a case, read only"
            why="A case card or a contact card shows facts and nothing to change. Leave out Actions, and put a link in a Value when the fact is a document."
            code={sources['case-card']}
            note={
              <Note kind="tip">
                The list takes its width from its container, so it fits a Card, a side column or the
                page. Below 40rem the rows stack with the key above the value.
              </Note>
            }
          >
            <CaseCard />
          </UseCase>
          <UseCase
            id="missing-answer"
            title="An answer that is missing"
            why="Say that nothing is given, and let the link say what to do. The word on the link comes from the messages, so “Add” still ends up as “Add Phone number”."
            code={sources['missing-answer']}
            propsUsed={[{ part: 'SummaryList.Change', prop: 'messages' }]}
          >
            <MissingAnswer />
          </UseCase>
          <UseCase
            id="several-answers"
            title="Several answers to one question"
            why="A row can hold more than one Value, for example the children in a household. They stay together with the Key, and the one link changes all of them."
            code={sources['several-answers']}
          >
            <SeveralAnswers />
          </UseCase>
          <UseCase
            id="own-markup"
            title="With your own elements"
            why="When the markup is yours, spread the props of the hook on a native description list. Give the Key an id and pass it to getChangeProps, and the link gets its name."
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useSummaryList', 'result'),
                label: 'useSummaryList (result)',
                prop: 'getChangeProps',
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
          importLine="import { SummaryList, useSummaryList } from '@kvirn-ui/react'"
          parts={parts}
          hook={useSummaryListHook}
          strings={
            <StringsBlock
              namespace="summaryList"
              component="SummaryList"
              keys={[
                {
                  key: 'change',
                  meaning:
                    'The visible text of the Change link. The row’s key is added to its accessible name.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
