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
  termAttributes,
  termRows,
  rootAttributes,
  rootRows,
  rowAttributes,
  rowRows,
  useDefinitionListHook,
  valueAttributes,
  descriptionRows,
} from '../content/definition-list.api.ts'
import { CaseCard } from '../examples/definition-list/case-card.tsx'
import { CheckYourAnswers } from '../examples/definition-list/check-your-answers.tsx'
import { DefaultDefinitionList } from '../examples/definition-list/default.tsx'
import { MissingAnswer } from '../examples/definition-list/missing-answer.tsx'
import { OwnMarkup } from '../examples/definition-list/own-markup.tsx'
import { SeveralAnswers } from '../examples/definition-list/several-answers.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DefinitionListExampleSources = Record<
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
    name: 'DefinitionList.Root',
    renders: (
      <>
        {renderedElement('dl')} Its direct children are Rows. Also exported as{' '}
        <code>DefinitionListRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'DefinitionList.Row',
    renders: (
      <>
        {renderedElement('div')} It keeps one term with its descriptions and gives the Term an id
        for the Change link. Also exported as <code>DefinitionListRow</code>.
      </>
    ),
    props: rowRows,
    attributes: rowAttributes,
  },
  {
    name: 'DefinitionList.Term',
    renders: (
      <>
        {renderedElement('dt')} The label. It needs text, because the Change link’s name is built
        from it. Also exported as <code>DefinitionListTerm</code>.
      </>
    ),
    props: termRows,
    attributes: termAttributes,
  },
  {
    name: 'DefinitionList.Description',
    renders: (
      <>
        {renderedElement('dd')} The answer. A row can hold more than one. Also exported as{' '}
        <code>DefinitionListDescription</code>.
      </>
    ),
    props: descriptionRows,
    attributes: valueAttributes,
  },
  {
    name: 'DefinitionList.Actions',
    renders: (
      <>
        {renderedElement('dd')} Holds the row’s links, such as Change. Also exported as{' '}
        <code>DefinitionListActions</code>.
      </>
    ),
    props: actionsRows,
    attributes: actionsAttributes,
  },
  {
    name: 'DefinitionList.Change',
    renders: (
      <>
        <code>&lt;a&gt;</code> with the role <code>link</code>. Its text is the message{' '}
        <code>definitionList.change</code> unless you pass children, and its name is that text plus
        the Term’s. Give it the <code>href</code> of the step where the answer is changed. It takes
        every attribute of an <code>&lt;a&gt;</code> and passes <code>ref</code> to it. Also
        exported as <code>DefinitionListChange</code>.
      </>
    ),
    props: changeRows,
    attributes: changeAttributes,
  },
]

export function DefinitionListPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DefinitionListExampleSources
}) {
  return (
    <ComponentPage
      title="DefinitionList"
      lead="Every link says what it changes, because its name is built from the row’s label."
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
            Write a Term for every row, and a Description that says so when there is no answer: “Not
            provided”, not an empty row.
          </li>
          <li>
            Not for a description people edit in place: that is a{' '}
            <Link href="/components/field">Field</Link>. Not for data with several columns: use a{' '}
            <Link href="/components/table">Table</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultDefinitionList />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="check-your-answers"
            title="Check your answers before sending"
            why="The last step of a form shows every answer with a link back to the step where it is changed. Each link reads, for example, “Change Name”, so a screen reader user (who hears the page read aloud) can list the links and still know what each one does."
            code={sources['check-your-answers']}
            note={
              <Note kind="reminder">
                Give every row a Term. The link’s name is built from it, and without a Row and a
                Term it is only “Change” and a development warning says so.
              </Note>
            }
          >
            <CheckYourAnswers />
          </UseCase>
          <UseCase
            id="case-card"
            title="Details of a case, read only"
            why="A case card or a contact card shows facts and nothing to change. Leave out Actions, and put a link in a Description when the fact is a document."
            code={sources['case-card']}
            note={
              <Note kind="tip">
                The list takes its width from its container, so it fits a Card, a side column or the
                page. On screens narrower than 40rem the rows stack, with the term above the
                description.
              </Note>
            }
          >
            <CaseCard />
          </UseCase>
          <UseCase
            id="missing-answer"
            title="An answer that is missing"
            why="Say that nothing is given, and let the link say what to do. You change the word on the link with the messages prop, and the link’s name is still “Add Phone number”."
            code={sources['missing-answer']}
            propsUsed={[{ part: 'DefinitionList.Change', prop: 'messages' }]}
            note={
              <Note kind="tip">
                Write “Not provided” in the Description, so everyone knows the answer is missing and
                not lost. An empty Description leaves the reader with a label and no value.
              </Note>
            }
          >
            <MissingAnswer />
          </UseCase>
          <UseCase
            id="several-answers"
            title="Several answers to one question"
            why="A row can hold more than one Description, for example the children in a household. They stay together with the Term, and the one link changes all of them."
            code={sources['several-answers']}
          >
            <SeveralAnswers />
          </UseCase>
          <UseCase
            id="own-markup"
            title="With your own elements"
            why="When the markup is yours, take the class names and the link’s props from the hook and put them on a native description list. Give the Term an id and pass it to getChangeProps, and the link gets its name."
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useDefinitionList', 'result'),
                label: 'useDefinitionList (result)',
                prop: 'getChangeProps',
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
                After someone changes an answer, send them back to the summary with every other
                answer still filled in. 3.3.7 Redundant Entry (A) asks you not to make people enter
                the same information again.
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If an issue here affects your service, list it in your accessibility statement with
                its workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { DefinitionList, useDefinitionList } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDefinitionListHook}
          strings={
            <StringsBlock
              namespace="definitionList"
              component="DefinitionList"
              keys={[
                {
                  key: 'change',
                  meaning:
                    'The visible text of the Change link. The row’s term is added to its accessible name.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
