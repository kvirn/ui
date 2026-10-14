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
  actionsAttributes,
  actionsRows,
  bodyAttributes,
  bodyRows,
  closeAttributes,
  closeRows,
  readyMadeRootName,
  readyMadeRootRows,
  rootAttributes,
  rootRows,
  titleAttributes,
  titleRows,
  useAlertHook,
} from '../content/alert.api.ts'
import { Announced } from '../examples/alert/announced.tsx'
import { DefaultAlert } from '../examples/alert/default.tsx'
import { Dismissible } from '../examples/alert/dismissible.tsx'
import { Statuses } from '../examples/alert/statuses.tsx'
import { WithActions } from '../examples/alert/with-actions.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AlertExampleSources = Record<
  'default' | 'statuses' | 'with-actions' | 'announced' | 'dismissible',
  string
>

const renderedElement = (
  <>
    <code>&lt;div&gt;</code> with no role. It takes every attribute of a <code>&lt;div&gt;</code>{' '}
    and passes <code>ref</code> to it.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'Alert.Root',
    renders: (
      <>
        {renderedElement} It is the plain root: <code>kv-alert</code> only, with no status class,
        icon or status word, for your own design. You add a status word first in the Title and an
        icon with its own shape, and both agree with your colour. Also exported as{' '}
        <code>AlertRoot</code>.
      </>
    ),
    props: rootRows,
    attributes: rootAttributes.slice(0, 1),
  },
  {
    name: readyMadeRootName,
    renders: (
      <>
        {renderedElement} <code>Alert.Info</code>, <code>Alert.Success</code>,{' '}
        <code>Alert.Warning</code> and <code>Alert.Danger</code> take the same props. Each adds its
        status class, its icon and the status word that starts the Title, from one table, so the
        colour, the icon and the word can’t disagree. Also exported as <code>AlertInfo</code> and so
        on. The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: readyMadeRootRows,
    attributes: rootAttributes,
  },
  {
    name: 'Alert.Title',
    renders: (
      <>
        <code>&lt;h2&gt;</code> with the role <code>heading</code>, level 2. Required: it names the
        message. It takes every attribute of an <code>&lt;h2&gt;</code> and passes <code>ref</code>{' '}
        to it.
      </>
    ),
    props: titleRows,
    attributes: titleAttributes,
  },
  {
    name: 'Alert.Body',
    renders: (
      <>{renderedElement} Optional: what to do, and by when, in one to three short sentences.</>
    ),
    props: bodyRows,
    attributes: bodyAttributes,
  },
  {
    name: 'Alert.Actions',
    renders: (
      <>
        {renderedElement} Optional: up to two Links or Buttons, which keep their own roles and
        names. They aren’t announced.
      </>
    ),
    props: actionsRows,
    attributes: actionsAttributes,
  },
  {
    name: 'Alert.Close',
    renders: (
      <>
        <code>&lt;button type=&quot;button&quot;&gt;</code> with the role <code>button</code>, named
        by <code>alert.close</code>. Optional, and last in the root. It was added after the
        independent accessibility review and hasn’t had a review of its own. It owns no open or
        closed state. It takes every attribute of a <code>&lt;button&gt;</code> except{' '}
        <code>type</code> and <code>aria-disabled</code>.
      </>
    ),
    props: closeRows,
    attributes: closeAttributes,
  },
]

export function AlertPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AlertExampleSources
}) {
  return (
    <ComponentPage
      title="Alert"
      lead="It shows its status with an icon, a word and a colour, and it speaks only when you ask it to. The close button was added after the independent accessibility review and hasn’t had a review of its own."
      status="alpha"
      whenToUse={
        <ul>
          <li>
            Use it for a message about the state of the page or the result of an action: a deadline,
            a saved draft, a failed send.
          </li>
          <li>
            Choose the status by the component: <code>Alert.Info</code>, <code>Alert.Success</code>,{' '}
            <code>Alert.Warning</code> or <code>Alert.Danger</code>. Write the outcome in the user’s
            words, not only the status.
          </li>
          <li>
            Put it in the content, near what it is about. One that is there when the page loads
            needs nothing more: it is read in the page’s order. Use <code>announce</code> only on
            one that appears after the user did something.
          </li>
          <li>
            Not for a message that interrupts and needs an answer: use an{' '}
            <Link href="/components/alert-dialog">AlertDialog</Link>. Not for a short message in the
            corner after something worked: use a <Link href="/components/toast">Toast</Link>. Not
            for a field’s error: that belongs to the <Link href="/components/field">Field</Link>.
            Not for ordinary text: use a <Link href="/components/prose">Prose</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultAlert />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="statuses"
            title="Four statuses"
            why="Each status has its own component, with an icon, a word and a colour that always agree. A short, one-sentence alert uses a paragraph as its Title."
            code={sources['statuses']}
            propsUsed={[{ part: 'Alert.Title', prop: 'as' }]}
            note={
              <Note kind="reminder">
                The Title is an <code>h2</code> by default. Set <code>as</code> so it sits one level
                below the heading of the part of the page it is in, and never skip a level (1.3.1
                Info and Relationships, 2.4.6 Headings and Labels).
              </Note>
            }
          >
            <Statuses />
          </UseCase>
          <UseCase
            id="with-actions"
            title="With something to do"
            why="When the user can act on the message, put up to two verbs in Actions: Links to go somewhere, Buttons to do something. They are reached with Tab and aren’t announced."
            code={sources['with-actions']}
          >
            <WithActions />
          </UseCase>
          <UseCase
            id="announced-after-an-action"
            title="Heard after an action"
            why="An alert present at load is read in the page’s order. One inserted after the user pressed something is silent unless you ask: announce polite, and focus stays on the button."
            code={sources['announced']}
            propsUsed={[{ part: readyMadeRootName, prop: 'announce' }]}
            note={
              <Note kind="tip">
                Use <code>assertive</code> only for an <code>Alert.Danger</code> the user must act
                on right now. On Info or Success it gives a development warning.
              </Note>
            }
          >
            <Announced />
          </UseCase>
          <UseCase
            id="dismissible"
            title="One the user can close"
            why="Add Alert.Close to a message the user can safely be done with, such as a tip or a saved confirmation. Not to an error or a warning they still have to act on. The alert holds no open or closed state: remove it yourself and move focus first, because the button that had focus is gone with it."
            code={sources['dismissible']}
            propsUsed={[{ part: 'Alert.Close', prop: 'onClick' }]}
            note={
              <Note kind="reminder">
                Move focus to a sensible place in the same handler, such as the heading of that part
                of the page. See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <Dismissible />
          </UseCase>
        </>
      }
      contract={
        <>
          <ContractSectionsView
            contract={contract}
            notes={{
              'what-you-need-to-do': (
                <Note kind="reminder">
                  When an alert’s text is in another language than the page, set{' '}
                  <code>messages</code> on that alert, so the status word and the text agree (3.1.2
                  Language of Parts).
                </Note>
              ),
              'known-issues': (
                <Note kind="tip">
                  Manual testing with screen readers hasn’t confirmed that the announcement is heard
                  in time. If you use <code>announce</code>, listen to it with the screen readers
                  your users have.
                </Note>
              ),
            }}
          />
          <p>
            The text announced is the Alert’s own visible text, so you change the Title and Body,
            and the status word with the keys in Strings.
          </p>
        </>
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Alert, useAlert } from '@kvirn-ui/react'"
          parts={parts}
          hook={useAlertHook}
          strings={
            <StringsBlock
              namespace="alert"
              component="Alert"
              keys={[
                {
                  key: 'infoPrefix',
                  meaning: 'The status word that starts the Title of Alert.Info.',
                },
                {
                  key: 'successPrefix',
                  meaning: 'The status word that starts the Title of Alert.Success.',
                },
                {
                  key: 'warningPrefix',
                  meaning: 'The status word that starts the Title of Alert.Warning.',
                },
                {
                  key: 'dangerPrefix',
                  meaning: 'The status word that starts the Title of Alert.Danger.',
                },
                { key: 'close', meaning: 'The accessible name of Alert.Close.' },
              ]}
            />
          }
        />
      }
    />
  )
}
