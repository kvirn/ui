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
import { textInputAttributes, textInputRows, useTextInputHook } from '../content/text-input.api.ts'
import { Controlled } from '../examples/text-input/controlled.tsx'
import { DefaultTextInput } from '../examples/text-input/default.tsx'
import { InputTypes } from '../examples/text-input/input-types.tsx'
import { MaskedCode } from '../examples/text-input/masked-code.tsx'
import { OwnInput } from '../examples/text-input/own-input.tsx'
import { PlainForm } from '../examples/text-input/plain-form.tsx'
import { Widths } from '../examples/text-input/width.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type TextInputExampleSources = Record<
  'default' | 'input-types' | 'width' | 'controlled' | 'plain-form' | 'masked-code' | 'own-input',
  string
>

const parts: ApiPart[] = [
  {
    name: 'TextInput',
    renders: (
      <>
        <code>&lt;input type=&quot;text&quot;&gt;</code> with the role <code>textbox</code>, or{' '}
        <code>searchbox</code> for <code>type=&quot;search&quot;</code>. It takes every attribute of
        an <code>&lt;input&gt;</code> and passes <code>ref</code> to it. Inside a Field, the Field’s{' '}
        <code>id</code> wins over yours. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: textInputRows,
    attributes: textInputAttributes,
  },
]

export function TextInputPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: TextInputExampleSources
}) {
  return (
    <ComponentPage
      title="TextInput"
      lead="Inside a Field, its label, help text and error are read with the box. It can shape what is typed with a mask. It keeps no form state of its own: your code or your form library holds the value."
      whenToUse={
        <ul>
          <li>
            Use it for a short answer typed as text: a name, an email address, a phone number or a
            code. Put it in a <Link href="/components/field">Field</Link> with a visible label.
          </li>
          <li>
            Choose the <code>type</code> and <code>autoComplete</code> that fit the question, so the
            keyboard and autofill help the user.
          </li>
          <li>
            A code that keeps its leading zeros, such as a postal code or a case number, is a
            TextInput, with a <code>mask</code> where its shape matters.
          </li>
          <li>
            Not for a quantity or an amount: use{' '}
            <Link href="/components/number-input">NumberInput</Link>. Not for a longer answer: use{' '}
            <Link href="/components/textarea">Textarea</Link>. Not for a date: use{' '}
            <Link href="/components/date-input">DateInput</Link>.
          </li>
          <li>
            For a unit or an icon inside the box, use{' '}
            <Link href="/components/input-group">InputGroup</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultTextInput />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="input-types"
            title="Contact details with the right keyboard"
            why={
              <>
                The <code>type</code> gives phones the right keyboard for an email address or a
                phone number. Add <code>autoComplete</code> wherever the question asks for the
                user’s own data, so the browser can fill it in. <code>type=&quot;number&quot;</code>{' '}
                and <code>type=&quot;date&quot;</code> are not accepted. A number box drops leading
                zeros and changes on scroll, so use{' '}
                <Link href="/components/number-input">NumberInput</Link>. For a date, use{' '}
                <Link href="/components/date-input">DateInput</Link>.
              </>
            }
            code={sources['input-types']}
            propsUsed={[{ part: 'TextInput', prop: 'type' }]}
            note={
              <Note kind="reminder">
                Set <code>autoComplete</code> on every box that asks for the user’s own data, such
                as <code>name</code>, <code>email</code>, <code>tel</code> or{' '}
                <code>postal-code</code> (1.3.5 Identify Input Purpose). Never block paste or
                autofill (3.3.8 Accessible Authentication (Minimum)).
              </Note>
            }
          >
            <InputTypes />
          </UseCase>
          <UseCase
            id="width"
            title="Address details with a width that fits each answer"
            why="A box as wide as the expected answer tells the user how much to write. The width classes are 2, 4, 6, 10 and 20 characters, and never limit what can be typed."
            code={sources['width']}
          >
            <Widths />
          </UseCase>
          <UseCase
            id="controlled"
            title="Use the text while the user types"
            why={
              <>
                Pass <code>value</code> and <code>onValueChange</code> when your code needs the text
                as it changes, for example to check it or show it elsewhere. The value then lives in
                your state, or in your form library’s. TextInput shows what it is given and only
                reports changes.
              </>
            }
            code={sources['controlled']}
            propsUsed={[
              { part: 'TextInput', prop: 'value' },
              { part: 'TextInput', prop: 'onValueChange' },
            ]}
          >
            <Controlled />
          </UseCase>
          <UseCase
            id="plain-form"
            title="A form that is sent as a whole"
            why={
              <>
                Without <code>value</code> the native input keeps the text, and sending the form
                sends it by <code>name</code>. Start it with <code>defaultValue</code>, for example
                with something the user already told you, so they don’t type it twice (3.3.7
                Redundant Entry). Read the values from <code>FormData</code>. KvirnUI checks
                nothing: after sending, say what is missing in a <code>Field.ErrorMessage</code> and
                move focus to the first box with an error. For a longer form, add an{' '}
                <Link href="/components/error-summary">ErrorSummary</Link>.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[{ part: 'TextInput', prop: 'defaultValue' }]}
            note={
              <Note kind="recipe">
                A form library’s props and <code>ref</code> pass through to the input, so its
                spreads and registers work next to <code>TextInput</code>.
              </Note>
            }
          >
            <PlainForm />
          </UseCase>
          <UseCase
            id="masked-code"
            title="A code with a fixed shape"
            why="A mask shapes what is typed and puts the space in. A character it can’t take is left out and announced politely. The country comes from the language set on KvirnProvider unless you pass it. The mask never says a value is wrong: you check it after the form is sent."
            code={sources['masked-code']}
            propsUsed={[
              { part: 'TextInput', prop: 'mask' },
              { part: 'TextInput', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="reminder">
                A mask doesn’t explain its format: say it with an example in a Field.HelpText under
                the box. The announcements need a KvirnProvider around your app, see{' '}
                <Link href="#announcements">Announcements</Link>.
              </Note>
            }
          >
            <MaskedCode />
          </UseCase>
          <UseCase
            id="own-input"
            title="Your own input element"
            why={
              <>
                For markup of your own, <code>useTextInput</code> gives the class, the type, the
                Field’s id and aria attributes, and the handlers to spread on a native input. It
                reads the nearest Field too.
              </>
            }
            code={sources['own-input']}
            propsUsed={[
              {
                part: apiHookPart('useTextInput', 'options'),
                prop: 'type',
                label: 'useTextInput (options)',
              },
            ]}
          >
            <OwnInput />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          messageNamespace="mask"
          linkToStrings
          notes={{
            focus: (
              <Note kind="reminder">
                If your page has a header that stays at the top while scrolling, add{' '}
                <code>scroll-padding</code> so it never covers the focused box (2.4.11 Focus Not
                Obscured (Minimum)).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you restyle the box, keep its edge at 3:1 contrast against the surface (1.4.11
                Non-text Contrast), keep a visible focus ring (2.4.7 Focus Visible), keep it at
                least 24 CSS pixels tall (2.5.8 Target Size (Minimum)), and show an invalid box by
                more than colour (1.4.1 Use of Color).
              </Note>
            ),
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every box a visible label in a Field. A placeholder is not a label: it
                disappears when the user types (3.3.2 Labels or Instructions). Without a name a
                screen reader says only that there is a text box (4.1.2 Name, Role, Value).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If one of these affects your service, put it in your accessibility statement, with
                the workaround.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { TextInput, useTextInput } from '@kvirn-ui/react'"
          parts={parts}
          hook={useTextInputHook}
          strings={
            <StringsBlock
              namespace="mask"
              component="TextInput"
              keys={[
                {
                  key: 'characterNotAllowed',
                  meaning: 'Announced when the mask leaves out a character.',
                  values: { allowed: 'digits' },
                },
                {
                  key: 'maximumLength',
                  meaning: 'Announced when a character is left out because the mask is full.',
                  values: { length: 12 },
                },
                {
                  key: 'maximumDecimals',
                  meaning: 'Announced when a digit is left out because the decimals are full.',
                },
              ]}
            >
              <p>
                A TextInput has strings only with a <code>mask</code>: the announcements. The label
                and error texts are the <Link href="/components/field#api-strings">Field’s</Link>.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
