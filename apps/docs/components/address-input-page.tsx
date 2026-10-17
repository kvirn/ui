import { Link } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  addressInputCityAttributes,
  addressInputCityRows,
  addressInputLine1Attributes,
  addressInputLine1Rows,
  addressInputLine2Attributes,
  addressInputLine2Rows,
  addressInputPostalCodeAttributes,
  addressInputPostalCodeRows,
  addressInputRootAttributes,
  addressInputRootRows,
  useAddressInputHook,
} from '../content/address-input.api.ts'
import { AddressAbroad } from '../examples/address-input/address-abroad.tsx'
import { AddressNotFound } from '../examples/address-input/address-not-found.tsx'
import { DefaultAddressInput } from '../examples/address-input/default.tsx'
import { ErrorsPerBox } from '../examples/address-input/errors-per-box.tsx'
import { KnownAddress } from '../examples/address-input/known-address.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AddressInputExampleSources = Record<
  'default' | 'errors-per-box' | 'address-not-found' | 'address-abroad' | 'known-address',
  string
>

const boxRenders = (what: ReactNode) => (
  <>
    {what} An <code>&lt;input type=&quot;text&quot;&gt;</code> (a TextInput) with the role{' '}
    <code>textbox</code>. Put it in its own <code>Field</code> with a visible{' '}
    <code>Field.Label</code>: the label, help text and error are wired to it. It takes every
    attribute of an <code>&lt;input&gt;</code> except <code>type</code> and <code>mask</code>, and
    passes <code>ref</code> to it.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'AddressInput.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It holds the boxes and the country they share. Put it
        in a plain <code>Fieldset</code> (not a <code>group</code> one) whose legend names the
        address. It takes every attribute of a <code>&lt;div&gt;</code> and passes <code>ref</code>{' '}
        to it. Also exported as <code>AddressInputRoot</code>. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: addressInputRootRows,
    attributes: addressInputRootAttributes,
  },
  {
    name: 'AddressInput.Line1',
    renders: boxRenders('The street address. Also exported as AddressInputLine1.'),
    props: addressInputLine1Rows,
    attributes: addressInputLine1Attributes,
  },
  {
    name: 'AddressInput.Line2',
    renders: boxRenders(
      'The second line, such as c/o and a name. Most services make it optional. Also exported as AddressInputLine2.',
    ),
    props: addressInputLine2Rows,
    attributes: addressInputLine2Attributes,
  },
  {
    name: 'AddressInput.PostalCode',
    renders: boxRenders(
      'The postal code. It follows the Root’s country: SE, FI and NO get a mask, a number keypad and a box as wide as the code. Any other country takes letters and digits, in upper case, in a box ten characters wide. Also exported as AddressInputPostalCode.',
    ),
    props: addressInputPostalCodeRows,
    attributes: addressInputPostalCodeAttributes,
  },
  {
    name: 'AddressInput.City',
    renders: boxRenders(
      'The town or city. It is never filled in from the postal code. Also exported as AddressInputCity.',
    ),
    props: addressInputCityRows,
    attributes: addressInputCityAttributes,
  },
]

export function AddressInputPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: AddressInputExampleSources
}) {
  return (
    <ComponentPage
      title="AddressInput"
      lead="The postal code takes its shape from the country. AddressInput looks nothing up and never moves focus when a box is full."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it to ask for a postal address in separate boxes: street, line 2, postal code and
            city, in the Nordic order. Each box has the autofill purpose browsers know.
          </li>
          <li>
            Put the boxes in a plain <Link href="/components/fieldset">Fieldset</Link> with a legend
            such as “Your address”, and each box in its own{' '}
            <Link href="/components/field">Field</Link> with a visible label.
          </li>
          <li>
            Set the <code>country</code>. It decides the shape of the postal code.
          </li>
          <li>
            Not for an address the service already holds: use a{' '}
            <Link href="/components/definition-list">DefinitionList</Link> with a change link. Not
            for the contact details of the page: use an{' '}
            <Link href="/components/address">Address</Link>. Not for a foreign address of unknown
            format: use a <Link href="/components/textarea">Textarea</Link>.
          </li>
        </ul>
      }
      example={
        <>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultAddressInput />
          </ExampleFrame>
          <Note kind="tip">
            The examples set <code>country=&quot;SE&quot;</code> on the Root. English implies no
            country, so without one the postal code box has no mask.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="errors-per-box"
            title="Fix the boxes that are wrong"
            why="Each box has its own error. The error summary has one link per wrong box, and each goes to its box."
            code={sources['errors-per-box']}
            note={
              <Note kind="reminder">
                Say what is wrong and how to fix it, with the format: “Enter a postal code with 5
                digits, like 123 45” (3.3.1 Error Identification, 3.3.3 Error Suggestion).
              </Note>
            }
          >
            <ErrorsPerBox />
          </UseCase>
          <UseCase
            id="address-not-found"
            title="The service can’t find the address"
            why="Every box is filled in, but the address is not found. This is one error about the whole address: it goes on the Fieldset, and the summary links to the first box."
            code={sources['address-not-found']}
          >
            <AddressNotFound />
          </UseCase>
          <UseCase
            id="address-abroad"
            title="An address in another country"
            why="Ask for the country in a Field of your own and pass its value as the Root’s country. A country with no mask takes letters and digits."
            code={sources['address-abroad']}
            propsUsed={[{ part: 'AddressInput.Root', prop: 'country' }]}
            note={
              <Note kind="tip">
                Ask for the country first, and preselect your service’s own country. If the country
                changes after a postal code is typed, the code is kept as typed: check it when the
                form is sent.
              </Note>
            }
          >
            <AddressAbroad />
          </UseCase>
          <UseCase
            id="known-address"
            title="An address the service already holds"
            why="Show the address with a link to change it, not in read-only boxes."
            code={sources['known-address']}
            note={
              <Note kind="reminder">
                Don’t make people enter again what they gave earlier in the same process (3.3.7
                Redundant Entry).
              </Note>
            }
          >
            <KnownAddress />
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
                Give the Fieldset a legend and every box a visible label. Without the legend,
                “Postal code” and “City” have no shared question (1.3.1 Info and Relationships,
                3.3.2 Labels or Instructions).
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
          importLine="import { AddressInput, useAddressInput } from '@kvirn-ui/react'"
          parts={parts}
          hook={useAddressInputHook}
          strings={
            <StringsBlock
              namespace="mask"
              component="AddressInput"
              keys={[
                {
                  key: 'characterNotAllowed',
                  meaning: 'Announced when the postal code mask leaves out a character.',
                  values: { allowed: 'digits' },
                },
                {
                  key: 'maximumLength',
                  meaning:
                    'Announced when the postal code mask leaves out a character because the box is full.',
                  values: { length: 5 },
                },
              ]}
            >
              <p>
                AddressInput has no strings of its own, and no keys. The postal code announces the
                mask’s strings, and <code>messages</code> on <code>AddressInput.PostalCode</code>{' '}
                replaces them for one box. The labels, help texts and errors are yours, in your own
                translations.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
