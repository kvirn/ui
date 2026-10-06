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
  itemAttributes,
  itemRows,
  linkAttributes,
  linkRows,
  listAttributes,
  listRows,
  rootAttributes,
  rootRows,
  titleAttributes,
  titleRows,
  useErrorSummaryHook,
} from '../content/error-summary.api.ts'
import { DefaultErrorSummary } from '../examples/error-summary/default.tsx'
import { FailedSubmit } from '../examples/error-summary/failed-submit.tsx'
import { GroupError } from '../examples/error-summary/group-error.tsx'
import { PageTitle } from '../examples/error-summary/page-title.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type ErrorSummaryExampleSources = Record<
  'default' | 'failed-submit' | 'group-error' | 'page-title',
  string
>

const parts: ApiPart[] = [
  {
    name: 'ErrorSummary.Root',
    renders: (
      <>
        An <Link href="/components/alert">Alert.Danger</Link>: a <code>&lt;div&gt;</code> with the
        role <code>group</code>, named by the Title, and <code>tabindex=&quot;-1&quot;</code>, so it
        takes focus from script and is not a Tab stop. It has no live region. It takes every
        attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. Also exported as{' '}
        <code>ErrorSummaryRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes,
  },
  {
    name: 'ErrorSummary.Title',
    renders: (
      <>
        <code>&lt;h2&gt;</code> with the role <code>heading</code>, level 2, from Alert.Title. The
        status word “Error:” comes first. Without children it reads <code>errorSummary.title</code>.
        Also exported as <code>ErrorSummaryTitle</code>.
      </>
    ),
    props: titleRows,
    attributes: titleAttributes,
  },
  {
    name: 'ErrorSummary.List',
    renders: (
      <>
        <code>&lt;ul&gt;</code> with the role <code>list</code>, one Item per problem. Also exported
        as <code>ErrorSummaryList</code>.
      </>
    ),
    props: listRows,
    attributes: listAttributes,
  },
  {
    name: 'ErrorSummary.Item',
    renders: (
      <>
        <code>&lt;li&gt;</code> with the role <code>listitem</code>, holding one Link. Also exported
        as <code>ErrorSummaryItem</code>.
      </>
    ),
    props: itemRows,
    attributes: itemAttributes,
  },
  {
    name: 'ErrorSummary.Link',
    renders: (
      <>
        <code>&lt;a href=&quot;#controlId&quot;&gt;</code> with the role <code>link</code>. Its text
        is the field’s own error text. A click or Enter focuses the control and scrolls its label
        into view; with a modifier key, or when no element has the id, the browser handles it. It
        takes every attribute of an <code>&lt;a&gt;</code> except <code>href</code>, and passes{' '}
        <code>ref</code> to it. Also exported as <code>ErrorSummaryLink</code>.
      </>
    ),
    props: linkRows,
    attributes: linkAttributes,
  },
]

export function ErrorSummaryPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: ErrorSummaryExampleSources
}) {
  return (
    <ComponentPage
      title="ErrorSummary"
      lead="All the problems of a failed submit in one place at the top of the form, each a link to its field. It takes focus once, so the screen reader reads it and a keyboard user starts at the list."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it after a failed submit of a form with more than one field, or any form where the
            errors can be out of sight.
          </li>
          <li>
            Show it at the top of the page, only while there are errors. Pass the submit count as{' '}
            <code>focusKey</code>, so a second failed submit moves focus again.
          </li>
          <li>
            Write each link as the field’s own error, with what to do: “Enter your email address”,
            not “Invalid”. Keep the error under the field too.
          </li>
          <li>
            Not for a message that isn’t about a form: use an{' '}
            <Link href="/components/alert">Alert</Link>. Don’t update it while the user types.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultErrorSummary />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="failed-submit"
            title="A form that fails to send"
            why={
              <>
                On submit, check the answers, mark the fields invalid and show the summary. Each
                link and its field’s error say the same words, and each link points at the id you
                gave the field with <code>controlId</code>.
              </>
            }
            code={sources['failed-submit']}
            propsUsed={[
              { part: 'ErrorSummary.Root', prop: 'focusKey' },
              { part: 'ErrorSummary.Link', prop: 'controlId' },
            ]}
            note={
              <Note kind="reminder">
                Don’t forget the field error ids: set <code>controlId</code> on every{' '}
                <Link href="/components/field#api-field-root-controlid">Field.Root</Link> a link
                points at, and keep the <code>Field.ErrorMessage</code> under the control. A link to
                an id that isn’t on the page goes nowhere, and a development warning says so.
              </Note>
            }
          >
            <FailedSubmit />
          </UseCase>
          <UseCase
            id="group-error"
            title="An error on a group of fields"
            why={
              <>
                When the question is the group, such as first and last name, the error belongs to
                the <Link href="/components/fieldset">Fieldset</Link>. Link to the first field of
                the group: the link focuses it and scrolls the legend into view, so the question
                shows with the field. A group of radio buttons links to its first option in the same
                way.
              </>
            }
            code={sources['group-error']}
            propsUsed={[{ part: 'ErrorSummary.Link', prop: 'controlId' }]}
          >
            <GroupError />
          </UseCase>
          <UseCase
            id="page-title"
            title="Say it in the page title too"
            why="The tab and the window title are the first thing a screen reader reads on a new page. With prefixDocumentTitle the title starts with “Error:” while the summary is shown, and it is restored when you remove it."
            code={sources['page-title']}
            propsUsed={[{ part: 'ErrorSummary.Root', prop: 'prefixDocumentTitle' }]}
            note={
              <Note kind="recipe">
                If a router owns the title, leave the prop off and add the word from{' '}
                <code>errorSummary.titlePrefix</code> there.
              </Note>
            }
          >
            <PageTitle />
          </UseCase>
        </>
      }
      contract={
        <>
          <ContractSectionsView contract={contract} linkToStrings />
          <Note kind="tip">
            The summary has no live region on purpose: the focus move is the announcement. Adding{' '}
            <code>role=&quot;alert&quot;</code> or an announcer message as well would read it twice.
          </Note>
        </>
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { ErrorSummary, useErrorSummary } from '@kvirn-ui/react'"
          parts={parts}
          hook={useErrorSummaryHook}
          strings={
            <StringsBlock
              namespace="errorSummary"
              component="ErrorSummary"
              keys={[
                {
                  key: 'title',
                  meaning: 'The default text of the Title. It names the focused group.',
                },
                {
                  key: 'titlePrefix',
                  meaning:
                    'Put before the page title while the summary is shown, with prefixDocumentTitle.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
