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
  phoneInputCountryAttributes,
  phoneInputCountryRows,
  phoneInputNumberAttributes,
  phoneInputNumberRows,
  phoneInputRootAttributes,
  phoneInputRootRows,
  usePhoneInputHook,
  usePhoneInputRootHook,
} from '../content/phone-input.api.ts'
import { CheckAfterSending } from '../examples/phone-input/check-after-sending.tsx'
import { DefaultPhoneInput } from '../examples/phone-input/default.tsx'
import { OnlyPhoneCharacters } from '../examples/phone-input/only-phone-characters.tsx'
import { SomeoneElsesNumber } from '../examples/phone-input/someone-elses-number.tsx'
import { WithCountry } from '../examples/phone-input/with-country.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type PhoneInputExampleSources = Record<
  | 'default'
  | 'check-after-sending'
  | 'with-country'
  | 'someone-elses-number'
  | 'only-phone-characters',
  string
>

const parts: ApiPart[] = [
  {
    name: 'PhoneInput.Number',
    renders: (
      <>
        <code>&lt;input type=&quot;tel&quot;&gt;</code> with the role <code>textbox</code>. It takes
        every attribute of an <code>&lt;input&gt;</code> except <code>type</code>, and passes{' '}
        <code>ref</code> to it. Put it in a <code>Field</code>: the label, help text and error are
        wired to it. It holds no form state: pass <code>value</code> and <code>onValueChange</code>,
        or <code>defaultValue</code> and <code>name</code>. Also exported as{' '}
        <code>PhoneInputNumber</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: phoneInputNumberRows,
    attributes: phoneInputNumberAttributes,
  },
  {
    name: 'PhoneInput.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. Use it when you add a <code>PhoneInput.Country</code>
        : it holds the country that the select and the number share. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. Put it in a{' '}
        <code>Fieldset</code> whose legend names the pair. Also exported as{' '}
        <code>PhoneInputRoot</code>.
      </>
    ),
    props: phoneInputRootRows,
    attributes: phoneInputRootAttributes,
  },
  {
    name: 'PhoneInput.Country',
    renders: (
      <>
        A native <code>&lt;select&gt;</code> of calling codes, such as “Sweden (+46)”: the country’s
        name in the page’s language and its calling code, the Root’s country first and the rest in
        alphabetical order. There are no flags. It holds no text of its own, so put it in its own{' '}
        <code>Field</code> with a <code>Field.Label</code>, or give it <code>aria-label</code>. It
        takes every attribute of a <code>&lt;select&gt;</code> except <code>value</code>,{' '}
        <code>defaultValue</code> and <code>children</code>. Also exported as{' '}
        <code>PhoneInputCountry</code>.
      </>
    ),
    props: phoneInputCountryRows,
    attributes: phoneInputCountryAttributes,
  },
]

export function PhoneInputPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: PhoneInputExampleSources
}) {
  return (
    <ComponentPage
      title="PhoneInput"
      lead="It keeps the number exactly as the person wrote or pasted it. It never formats the number, and by default it never refuses what is typed."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a phone number the person types, in a <code>Field</code> with a visible
            label. It sets the phone keypad, switches off spell check, keeps the number left to
            right and tells autofill that this is a phone number.
          </li>
          <li>
            It never formats, limits or checks the number. Check it in your form, and turn it into
            the international form (E.164, such as +46701740605) on the server.
          </li>
          <li>
            For numbers from other countries, say in the help text to start with the country code.
            Or add a <code>PhoneInput.Country</code> select.
          </li>
          <li>
            Not for a code sent by text message: use a{' '}
            <Link href="/components/one-time-code">OneTimeCode</Link>. Not for a quantity or an
            amount: use a <Link href="/components/number-input">NumberInput</Link>. Not for an
            identity or case number: use a <Link href="/components/text-input">TextInput</Link> with
            a mask.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultPhoneInput />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="check-after-sending"
            title="Check the number after sending"
            why="The form checks the number on send. An error summary and an error under the box say how to fix it, and the number stays as written."
            code={sources['check-after-sending']}
            note={
              <Note kind="reminder">
                Say what is wrong and how to fix it, with an example, never only “invalid”. Show the
                error in text next to the box (3.3.1 Error Identification, 3.3.3 Error Suggestion).
              </Note>
            }
          >
            <CheckAfterSending />
          </UseCase>
          <UseCase
            id="with-country"
            title="A number from another country"
            why="The person picks the country. Changing it never prefixes or rewrites the number."
            code={sources['with-country']}
            propsUsed={[
              { part: 'PhoneInput.Root', prop: 'defaultCountry' },
              { part: 'PhoneInput.Root', prop: 'onCountryChange' },
            ]}
            note={
              <Note kind="reminder">
                Give the country select its own label, or a screen reader user cannot tell what it
                is for (4.1.2 Name, Role, Value). Say in the help text whether the number goes with
                or without the country code.
              </Note>
            }
          >
            <WithCountry />
          </UseCase>
          <UseCase
            id="someone-elses-number"
            title="The phone number of the other guardian"
            why="Switch autofill off for another person’s number, or the browser fills in the user’s own."
            code={sources['someone-elses-number']}
            propsUsed={[{ part: 'PhoneInput.Number', prop: 'autoComplete' }]}
          >
            <SomeoneElsesNumber />
          </UseCase>
          <UseCase
            id="only-phone-characters"
            title="Leave out letters and stray signs"
            why={
              <>
                <code>mask=&quot;telephone&quot;</code> accepts digits, spaces, dashes, brackets and
                a plus sign, leaves out the rest and says so politely. Digits from other scripts,
                such as Eastern Arabic, are refused: see{' '}
                <Link href="#known-issues">Known issues</Link>.
              </>
            }
            code={sources['only-phone-characters']}
            propsUsed={[{ part: 'PhoneInput.Number', prop: 'mask' }]}
            note={
              <Note kind="reminder">
                Wrap the page in a <code>KvirnProvider</code>. Without one, nothing says that a
                character was left out (4.1.3 Status Messages).
              </Note>
            }
          >
            <OnlyPhoneCharacters />
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
                Give every phone box a visible label in a <code>Field</code>. A placeholder is gone
                once the person types (4.1.2 Name, Role, Value; 3.3.2 Labels or Instructions).
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
          importLine="import { PhoneInput, usePhoneInput, usePhoneInputRoot } from '@kvirn-ui/react'"
          parts={parts}
          hooks={[usePhoneInputHook, usePhoneInputRootHook]}
          strings={
            <StringsBlock
              namespace="mask"
              component="PhoneInput"
              keys={[
                {
                  key: 'characterNotAllowed',
                  meaning: 'Announced when a mask leaves out a character.',
                  values: { allowed: 'other' },
                },
                {
                  key: 'maximumLength',
                  meaning:
                    'Announced when a mask of your own leaves out a character because the box is full.',
                  values: { length: 12 },
                },
              ]}
            >
              <p>
                PhoneInput has no strings of its own, and no keys. Without a mask it announces
                nothing. With one it announces the mask’s strings, and <code>messages</code>{' '}
                replaces them for one box. The label, help text and errors are yours, in your own
                translations.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
