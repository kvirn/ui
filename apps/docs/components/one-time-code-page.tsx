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
  oneTimeCodeInputAttributes,
  oneTimeCodeInputRows,
  oneTimeCodeRootAttributes,
  oneTimeCodeRootRows,
  oneTimeCodeSlotAttributes,
  oneTimeCodeSlotRows,
  useOneTimeCodeHook,
} from '../content/one-time-code.api.ts'
import { CheckedAsEntered } from '../examples/one-time-code/checked-as-entered.tsx'
import { SmsCode } from '../examples/one-time-code/default.tsx'
import { PlainForm } from '../examples/one-time-code/plain-form.tsx'
import { TwoGroups } from '../examples/one-time-code/two-groups.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type OneTimeCodeExampleSources = Record<
  'default' | 'two-groups' | 'checked-as-entered' | 'plain-form',
  string
>

const parts: ApiPart[] = [
  {
    name: 'OneTimeCode.Root',
    renders: (
      <>
        <code>&lt;div class=&quot;kv-one-time-code&quot;&gt;</code> with no role: it holds one
        control, and an unnamed group would only add noise. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. Put it in a <code>Field</code>{' '}
        with a label and a <code>Field.Prose</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: oneTimeCodeRootRows,
    attributes: oneTimeCodeRootAttributes,
  },
  {
    name: 'OneTimeCode.Input',
    renders: (
      <>
        <code>&lt;input type=&quot;text&quot;&gt;</code> with the role <code>textbox</code>: the one
        native input, which takes the typing, paste, autofill and dictation. It takes every
        attribute of an <code>&lt;input&gt;</code> except <code>type</code>, <code>value</code> and{' '}
        <code>defaultValue</code>, and passes <code>ref</code> to it. Inside a Field it is named by
        the label and described by the Field’s text, and its own <code>id</code> is ignored.
      </>
    ),
    props: oneTimeCodeInputRows,
    attributes: oneTimeCodeInputAttributes,
  },
  {
    name: 'OneTimeCode.Slot',
    renders: (
      <>
        <code>&lt;span aria-hidden=&quot;true&quot;&gt;</code>: one drawn cell of the pattern. It is
        never focusable, and a press on it focuses the input. It takes every attribute of a{' '}
        <code>&lt;span&gt;</code> and passes <code>ref</code> to it.
      </>
    ),
    props: oneTimeCodeSlotRows,
    attributes: oneTimeCodeSlotAttributes,
  },
]

export function OneTimeCodePage({
  contract,
  sources,
}: {
  contract: Contract
  sources: OneTimeCodeExampleSources
}) {
  return (
    <ComponentPage
      title="OneTimeCode"
      lead="A field for a code sent to the user by text message, email or an authenticator app. It is one native input drawn as boxes, so SMS autofill, paste, dictation and undo keep working."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a short code the user receives and types once: a code from a text message, an
            email or an authenticator app, when signing in or confirming an action.
          </li>
          <li>
            Write a label that says where the code is, in the user’s words (“Code from the text
            message”), and a description above the boxes with the length, the groups and where to
            find it.
          </li>
          <li>
            Keep a submit button. If you check the code as it is entered, say so before the user
            types.
          </li>
          <li>
            Not for a password or a PIN the user keeps: use a{' '}
            <Link href="/components/text-input">TextInput</Link> with{' '}
            <code>type=&quot;password&quot;</code>. A OneTimeCode is never a password field, so the
            user can see what they entered.
          </li>
          <li>
            Not for a long identifier such as a personal identity number: use a TextInput with a
            mask.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <SmsCode />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="two-groups"
            title="A code with letters and digits in groups"
            why="Write the pattern the way the message groups the code: &&&&-&&&& for “ABCD-1234”. The dash is drawn but is not part of the code, so read unmaskedValue when your service wants the code without it."
            code={sources['two-groups']}
            propsUsed={[
              { part: 'OneTimeCode.Root', prop: 'pattern' },
              { part: 'OneTimeCode.Root', prop: 'onComplete' },
              { part: 'OneTimeCode.Slot', prop: 'index' },
            ]}
            note={
              <Note kind="tip">
                Render one <code>OneTimeCode.Slot</code> for every position of the pattern,
                separators included: the theme counts the slots to draw the row.
              </Note>
            }
          >
            <TwoGroups />
          </UseCase>
          <UseCase
            id="checked-as-entered"
            title="Checking the code as soon as it is complete"
            why="onComplete starts your check. Use readOnly while it runs, not disabled, so focus stays, and keep the code in the field after a wrong-code error so the user can fix one digit. Tell the user in the description that the code is checked as soon as they enter it (3.2.2)."
            code={sources['checked-as-entered']}
            propsUsed={[
              { part: 'OneTimeCode.Root', prop: 'value' },
              { part: 'OneTimeCode.Root', prop: 'onValueChange' },
              { part: 'OneTimeCode.Root', prop: 'onComplete' },
            ]}
            note={
              <Note kind="reminder">
                Announcements, such as “Checking the code”, need a <code>KvirnProvider</code> around
                your app. The submit button stays. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <CheckedAsEntered />
          </UseCase>
          <UseCase
            id="plain-form"
            title="In a plain form, with a message when it is incomplete"
            why={
              <>
                Without <code>value</code> the native input keeps the code, and a form submit sends
                it under the input’s <code>name</code>, with its separators. Validate on submit and
                say what to do: “Enter all 6 digits of the code”.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[{ part: 'OneTimeCode.Root', prop: 'onValueChange' }]}
          >
            <PlainForm />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} messageNamespace="mask" linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { OneTimeCode, Field, useOneTimeCode } from '@kvirn-ui/react'"
          parts={parts}
          hook={useOneTimeCodeHook}
          strings={
            <StringsBlock
              namespace="mask"
              component="OneTimeCode"
              keys={[
                {
                  key: 'characterNotAllowed',
                  meaning:
                    'Announced when a character the pattern refuses is typed, shown here for a digits code.',
                  values: { allowed: 'digits' },
                },
                {
                  key: 'maximumLength',
                  meaning: 'Announced when a character is refused because the code is complete.',
                  values: { length: 6 },
                },
              ]}
            >
              <p>
                OneTimeCode has no strings of its own. It announces the mask’s, and{' '}
                <code>messages</code> replaces them for one code.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
