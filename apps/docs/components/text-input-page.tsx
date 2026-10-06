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
      lead="A native text box for a short answer such as a name, an email address or a case number. Inside a Field its label, help text and error are read with it. It holds no form state."
      status="alpha-candidate"
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
            <Link href="/components/textarea">Textarea</Link>. Not for a date: use DateInput, three
            boxes in a Fieldset.
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
            title="The right keyboard for the answer"
            why="The type gives phones the right keyboard and lets the browser check the shape. Add autoComplete wherever the question asks for the user’s own data, so the browser can fill it in."
            code={sources['input-types']}
            propsUsed={[{ part: 'TextInput', prop: 'type' }]}
            note={
              <Note kind="tip">
                <code>type=&quot;number&quot;</code> and <code>type=&quot;date&quot;</code> are not
                accepted, and a development warning says so. A number drops leading zeros and
                changes on scroll: use NumberInput.
              </Note>
            }
          >
            <InputTypes />
          </UseCase>
          <UseCase
            id="width"
            title="A width that fits the answer"
            why="A box as wide as the expected answer tells the user how much to write. The width classes are 2, 4, 6, 10 and 20, and never limit what can be typed."
            code={sources['width']}
          >
            <Widths />
          </UseCase>
          <UseCase
            id="controlled"
            title="Keep the value in your form state"
            why="Pass value and onValueChange and the value lives in your state, or in your form library’s. TextInput renders what it is given and only reports changes."
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
            title="A plain form that reads its values"
            why="Without value the native input keeps the value and a form submit sends it by name. Start it with defaultValue, and read it from FormData."
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
            why="A mask shapes what is typed and puts the space in. A character it can’t take is left out and announced politely. The country comes from the language unless you pass it, and the mask never says a value is wrong: you validate after submit."
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
            why="For markup of your own, useTextInput gives the class, type, the Field’s id and aria attributes, and the handlers to spread on a native input. It reads the nearest Field too."
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
      contract={<ContractSectionsView contract={contract} messageNamespace="mask" linkToStrings />}
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
