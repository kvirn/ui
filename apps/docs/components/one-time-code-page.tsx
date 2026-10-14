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
  oneTimeCodeRootAttributes,
  oneTimeCodeRootRows,
  oneTimeCodeSlotAttributes,
  oneTimeCodeSlotRows,
  useOneTimeCodeHook,
} from '../content/one-time-code.api.ts'
import { CheckedAsEntered } from '../examples/one-time-code/checked-as-entered.tsx'
import { SmsCode } from '../examples/one-time-code/default.tsx'
import { NewCode } from '../examples/one-time-code/new-code.tsx'
import { PlainForm } from '../examples/one-time-code/plain-form.tsx'
import { RefusedCharacters } from '../examples/one-time-code/refused-characters.tsx'
import { TwoGroups } from '../examples/one-time-code/two-groups.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type OneTimeCodeExampleSources = Record<
  | 'default'
  | 'two-groups'
  | 'checked-as-entered'
  | 'plain-form'
  | 'new-code'
  | 'refused-characters',
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
      lead="It is one native text box drawn as boxes, so paste, undo and the screen reader work as in any text box. The box carries the attribute browsers use to offer a code from a text message."
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
            title="Sign in without BankID with a code from an email"
            why={
              <>
                Write the pattern the way the email groups the code: <code>{'&&&&-&&&&'}</code> for
                “ABCD-1234”. The dash is part of the value the boxes show, so read{' '}
                <code>unmaskedValue</code> when your service wants the code without it. Make your
                service leave out look-alike characters (0 and O, 1 and I), so nobody has to guess
                what they read.
              </>
            }
            code={sources['two-groups']}
            propsUsed={[
              { part: 'OneTimeCode.Root', prop: 'pattern' },
              { part: 'OneTimeCode.Root', prop: 'onComplete' },
              { part: 'OneTimeCode.Slot', prop: 'index' },
            ]}
            note={
              <Note kind="tip">
                Render one <code>OneTimeCode.Slot</code> for every position of the pattern,
                separators included. With fewer, a character is typed that nobody sees, and a
                development warning says so.
              </Note>
            }
          >
            <TwoGroups />
          </UseCase>
          <UseCase
            id="checked-as-entered"
            title="Confirm your mobile number as soon as the code is complete"
            why={
              <>
                <code>onComplete</code> starts your check. Use <code>readOnly</code> while it runs,
                not <code>disabled</code>, so focus stays, and keep the code in the field after a
                wrong-code error so the user can fix one digit. Focus stays in the field, so the
                example says “Checking the code” and then the error aloud.
              </>
            }
            code={sources['checked-as-entered']}
            propsUsed={[
              { part: 'OneTimeCode.Root', prop: 'value' },
              { part: 'OneTimeCode.Root', prop: 'onValueChange' },
              { part: 'OneTimeCode.Root', prop: 'onComplete' },
            ]}
            note={
              <Note kind="reminder">
                Tell the user in the description, before they type, that the code is checked as soon
                as it is complete, and keep the submit button (3.2.2 On Input). Announcements need a{' '}
                <code>KvirnProvider</code> around your app. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <CheckedAsEntered />
          </UseCase>
          <UseCase
            id="plain-form"
            title="Confirm your mobile number in a plain form"
            why={
              <>
                Without <code>value</code> the native input keeps the code, and sending the form
                posts it under the input’s <code>name</code>, with its dash. Check it when the form
                is sent, move focus to the box and say what to do: “Enter all 6 digits of the code”.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[{ part: 'OneTimeCode.Root', prop: 'onValueChange' }]}
          >
            <PlainForm />
          </UseCase>
          <UseCase
            id="new-code"
            title="Send a new code without losing the page"
            why={
              <>
                A text message can arrive late or not at all. Put “Send a new code” next to the
                field as one action that keeps the page and what the user has typed. Say in the
                description how long a code works, and say aloud that a new one is on its way.
              </>
            }
            code={sources['new-code']}
            note={
              <Note kind="reminder">
                Say how long a code is valid, and never end the session or clear the form when it
                runs out (2.2.1 Timing Adjustable). Countdowns and “Send a new code” are not part of
                OneTimeCode: you build them, as here. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <NewCode />
          </UseCase>
          <UseCase
            id="refused-characters"
            title="Show why a character did not appear"
            why={
              <>
                A letter in a digits code is left out, and a screen reader says so politely. Someone
                who sees the boxes gets no sign unless you add one. <code>onValueChange</code> lists
                what was left out in <code>details.rejected</code>, so you can show the same words
                that <code>messages</code> announces.
              </>
            }
            code={sources['refused-characters']}
            propsUsed={[
              { part: 'OneTimeCode.Root', prop: 'onValueChange' },
              { part: 'OneTimeCode.Root', prop: 'messages' },
            ]}
            note={
              <Note kind="tip">
                Keep the announcement on. The words you show are plain text, not a live region, so
                they are not announced a second time. Turn the announcement off with{' '}
                <code>announceRejections</code> only when you give the message yourself.
              </Note>
            }
          >
            <RefusedCharacters />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="mask"
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Write a visible label that says where the code is, and a description with its length
                and groups. The boxes are hidden from screen readers, so the description is the only
                place they learn the length (2.5.3 Label in Name, 3.3.2 Labels or Instructions).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you restyle the boxes, keep their edges at least 3:1 against the background and
                keep the plain field that shows when the boxes don’t fit, so nothing scrolls
                sideways at 320px (1.4.11 Non-text Contrast, 1.4.10 Reflow).
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
