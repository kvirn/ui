import { AlertBody, AlertInfo, AlertTitle, Link } from '@kvirn-ui/react'
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
  addressInputCountryAttributes,
  addressInputCountryRows,
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
import { AddressInPostalArea } from '../examples/address-input/address-in-postal-area.tsx'
import { AddressLookup } from '../examples/address-input/address-lookup.tsx'
import { AddressNotFound } from '../examples/address-input/address-not-found.tsx'
import { DefaultAddressInput } from '../examples/address-input/default.tsx'
import { ErrorsPerBox } from '../examples/address-input/errors-per-box.tsx'
import { KnownAddress } from '../examples/address-input/known-address.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type AddressInputExampleSources = Record<
  | 'default'
  | 'errors-per-box'
  | 'address-lookup'
  | 'address-in-postal-area'
  | 'address-not-found'
  | 'address-abroad'
  | 'known-address',
  string
>

const lookupNotice = (
  <AlertInfo>
    <AlertTitle as="p">Good to know</AlertTitle>
    <AlertBody>What you type is sent to Kvirn’s map service to find the address.</AlertBody>
  </AlertInfo>
)

const boxRenders = (what: ReactNode) => (
  <>
    {what} An <code>&lt;input type=&quot;text&quot;&gt;</code> (a TextInput) with the role{' '}
    <code>textbox</code>. Put it in its own <code>Field</code> with a visible{' '}
    <code>Field.Label</code>: the label, help text and error are wired to it. It takes the props of
    a <Link href="/components/text-input">TextInput</Link> and passes <code>ref</code> to it. You
    cannot set <code>type</code>. The street, line 2 and city boxes also take no <code>mask</code>{' '}
    or <code>announceRejections</code>. Only the street box takes <code>messages</code>, to change
    the texts of the lookup.
  </>
)

const parts: ApiPart[] = [
  {
    name: 'AddressInput.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role. It holds the boxes, the country they share and the
        address lookup. Put it in a plain <code>Fieldset</code> (not a <code>group</code> one) whose
        legend names the address. It takes every attribute of a <code>&lt;div&gt;</code> and passes{' '}
        <code>ref</code> to it. Also exported as <code>AddressInputRoot</code>. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: addressInputRootRows,
    attributes: addressInputRootAttributes,
  },
  {
    name: 'AddressInput.Country',
    renders: (
      <>
        A native <code>&lt;select&gt;</code> (role <code>combobox</code>) of every country, named in
        the language of the page, with the Root’s country first. Put it first in the Root, in its
        own <code>Field</code> with a visible <code>Field.Label</code> and a <code>name</code>. It
        sets the shape of the postal code and the country the lookup searches in. A suggestion in
        another country sets it too. It never changes what the user typed. It takes every attribute
        of a <code>&lt;select&gt;</code> except <code>children</code> and passes <code>ref</code> to
        it. Also exported as AddressInputCountry.
      </>
    ),
    props: addressInputCountryRows,
    attributes: addressInputCountryAttributes,
  },
  {
    name: 'AddressInput.Line1',
    renders: (
      <>
        {boxRenders('The street address. Also exported as AddressInputLine1.')} With a{' '}
        <code>geocoder</code> on the Root it is an <code>&lt;input&gt;</code> with the role{' '}
        <code>combobox</code> instead, and it stays free text. By default it comes with a privacy
        notice above it, a Clear button, a Search button when the search runs on request, the list
        of suggestions, a help text and, after a choice, a note. It keeps your{' '}
        <code>Field.Label</code>, its <code>name</code> and its autofill purpose.
      </>
    ),
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
      'The postal code. It follows the country: the Root’s, or the one in AddressInput.Country when there is one. SE, FI and NO get a mask, a number keypad and a box as wide as the code. Any other country gets no mask: the box takes what is typed, asks phone keyboards for capital letters and is ten characters wide. Also exported as AddressInputPostalCode.',
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
      lead="The postal code takes its shape from the country, such as Sweden or Norway. Give the Root a geocoder (a service that finds addresses) and the street box suggests addresses, still as free text. AddressInput never moves focus by itself when a box is full."
      whenToUse={
        <ul>
          <li>
            Use it to ask for a postal address in separate boxes: street, line 2, postal code and
            city, in the Nordic order. Each box says what it is for, so a browser can fill in the
            whole address in one step (autofill). Put the boxes in a plain{' '}
            <Link href="/components/fieldset">Fieldset</Link> with a legend such as “Your address”,
            and each box in its own <Link href="/components/field">Field</Link> with a visible
            label.
          </li>
          <li>
            Set the <code>country</code>. It decides the shape of the postal code. Add{' '}
            <code>AddressInput.Country</code>, first in the Root, when the service takes addresses
            outside that country: the person picks the country, and the postal code and the search
            follow it. Without it, the suggestions offer only the Root’s country.
          </li>
          <li>
            Give the Root a <code>geocoder</code> when a choice from a list should fill in the
            postal code and city, for example in a change-of-address form. The street box stays free
            text, so a resident can ignore the list or add a house number that it does not have.
            Geocoders come from <code>@kvirn-ui/map</code>. <code>kvirnGeocoder</code> is built for
            the Kvirn map service, which Kvirn hosts in the EU.
          </li>
          <li>
            Leave the <code>geocoder</code> out when you have no address service that you can name
            in your privacy notice: the text typed in the street box is sent to it. A choice from
            the list is not a check, so validate the address as you would without it.
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
            The examples set <code>country</code> on the Root, such as <code>&quot;SE&quot;</code>.
            English implies no country, so without one the postal code box has no mask.
          </Note>
        </>
      }
      useCases={
        <>
          <UseCase
            id="errors-per-box"
            title="Fix the boxes that are wrong"
            why={
              <>
                Each box has its own error text. The{' '}
                <Link href="/components/error-summary">error summary</Link> at the top has one link
                per wrong box, and each link moves focus to its box.
              </>
            }
            code={sources['errors-per-box']}
            note={
              <Note kind="reminder">
                Say what is wrong and how to fix it, with the format: “Enter a postal code with 5
                digits, like 123 45” (3.3.1 Error Identification, Level A; 3.3.3 Error Suggestion,
                Level AA).
              </Note>
            }
          >
            <ErrorsPerBox />
          </UseCase>
          <UseCase
            id="address-lookup"
            notice={lookupNotice}
            title="Report a change of address with address autocomplete"
            why={
              <>
                A resident in Sweden reports a new address. They start typing their street, and the
                address service autocompletes the address. Type “Drottninggatan 6, Stockholm” in the
                street box. Suggestions appear as you type, and the first is “Drottninggatan 6, 111
                51 Stockholm”. Choose it, and the street, postal code and town are filled in. Line 2
                is never filled in. Type the town too: “Drottninggatan 6” alone matches that address
                in many towns. The street box stays free text, so the resident can ignore the list
                and type on. Enter, with no suggestion chosen, searches for the whole text and never
                sends the form. After a choice, a screen reader says one polite message, such as
                “Chosen: Drottninggatan 6, 111 51 Stockholm. The address is filled in below. Check
                it before you continue.” All the messages are in{' '}
                <Link href="#announcements">Announcements</Link>. In this example, the text you type
                in the street box goes to Kvirn’s map service. The suggested addresses come from
                OpenStreetMap: ©{' '}
                <Link href="https://www.openstreetmap.org/copyright">
                  OpenStreetMap contributors
                </Link>
                .
              </>
            }
            code={sources['address-lookup']}
            propsUsed={[
              { part: 'AddressInput.Root', prop: 'geocoder' },
              { part: 'AddressInput.Root', prop: 'country' },
              { part: 'AddressInput.Line1', prop: 'privacyNotice' },
            ]}
            note={
              <Note kind="reminder">
                Name the address service in your privacy notice: the text typed in the street box
                and the visitor’s IP address reach it. If it handles that data for you, GDPR Article
                28 needs a written agreement with its operator. By default, the notice above the
                street box says where the text goes, and it is read before anyone types. These
                examples turn off the notice above the street box (
                <code>privacyNotice={'{false}'}</code>) and the credit (
                <code>attribution: null</code>). If you do, add both yourself: say where the text
                goes in the street box’s help text, so it’s still read when the box gets focus, and
                credit the address data, such as © OpenStreetMap contributors, on the page.
              </Note>
            }
          >
            <AddressLookup />
          </UseCase>
          <UseCase
            id="address-in-postal-area"
            notice={lookupNotice}
            title="Autocomplete a street inside a postal code"
            why={
              <>
                A resident knows the postal code and the town, and is not sure how the street is
                spelled. They start typing the street, and the address service autocompletes it
                inside that postal code and town. Type 66530 in Postal code (it shows as 665 30) and
                Kil in Town. Then type “Storg” in the street box. The list shows only addresses in
                that postal code and town, such as “Storgatan 41, 665 30 Kil”. Empty the two boxes
                and type “Storgatan”: the list now shows Storgatan in towns all over Sweden. Filling
                in the two boxes starts no search. The street box sends their values with its next
                search. Enter, with no suggestion chosen, searches the same way. If the resident
                picks a street that has no house numbers, the box asks for the number. The resident
                types it after the street, and the box asks the service for that exact house and
                fills in what it finds.
              </>
            }
            code={sources['address-in-postal-area']}
            propsUsed={[
              { part: 'AddressInput.Root', prop: 'geocoder' },
              { part: 'AddressInput.Root', prop: 'country' },
              { part: 'AddressInput.Line1', prop: 'privacyNotice' },
            ]}
            note={
              <Note kind="reminder">
                These examples turn off the notice and the credit: see{' '}
                <Link href="#address-lookup">
                  Report a change of address with address autocomplete
                </Link>{' '}
                for what to add instead.
              </Note>
            }
          >
            <AddressInPostalArea />
          </UseCase>
          <UseCase
            id="address-abroad"
            notice={lookupNotice}
            title="Register a move to another Nordic country with address autocomplete"
            why={
              <>
                A resident registers a move to Norway. They start typing their street, and the
                address service autocompletes the address in the country they chose. The form starts
                with Norway. Add <code>AddressInput.Country</code> first in the Root, in a Field of
                its own. The postal code and the search follow the country. Type “Karl Johans gate
                14”: the first suggestion is “Karl Johans gate 14, 0154 Oslo”. Change the country to
                Sweden, and the postal code box takes the Swedish shape, like 123 45. Or leave
                Norway chosen and type “Storgatan 8”. The first suggestion is in Sweden, and
                choosing it sets the country box to Sweden and says so. The service in this example
                holds addresses in Sweden and Norway. A country other than SE, FI and NO has no
                mask, so the postal code box takes letters and digits.
              </>
            }
            code={sources['address-abroad']}
            propsUsed={[
              { part: 'AddressInput.Root', prop: 'geocoder' },
              { part: 'AddressInput.Root', prop: 'country' },
              { part: 'AddressInput.Line1', prop: 'privacyNotice' },
              { part: 'AddressInput.Country', prop: 'value' },
              { part: 'AddressInput.Country', prop: 'onChange' },
            ]}
            note={
              <>
                <Note kind="tip">
                  Ask for the country first, and preselect your service’s own country. If the
                  country changes after a postal code is typed, the code is kept as typed: check it
                  when the form is sent.
                </Note>
                <Note kind="reminder">
                  These examples turn off the notice and the credit: see{' '}
                  <Link href="#address-lookup">
                    Report a change of address with address autocomplete
                  </Link>{' '}
                  for what to add instead.
                </Note>
              </>
            }
          >
            <AddressAbroad />
          </UseCase>
          <UseCase
            id="address-not-found"
            title="The service can’t find the address"
            why="Every box is filled in, but the address is not found. This is one error about the whole address: it goes on the Fieldset, and the summary links to the first box. A choice from the suggestions is not a check either: validate the address in the same way."
            code={sources['address-not-found']}
          >
            <AddressNotFound />
          </UseCase>
          <UseCase
            id="known-address"
            title="An address the service already holds"
            why="Show the address with a link to change it, not in read-only boxes."
            code={sources['known-address']}
            note={
              <Note kind="reminder">
                Don’t make people enter again what they gave earlier in the same process (3.3.7
                Redundant Entry, Level A).
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
                3.3.2 Labels or Instructions, both Level A).
              </Note>
            ),
            keyboard: (
              <Note kind="tip">
                With a geocoder, Enter in the street box searches and does not send the form. In the
                other boxes Enter sends it as usual. Keep a visible submit button, so the form can
                always be sent with the keyboard.
              </Note>
            ),
            focus: (
              <Note kind="reminder">
                If your site has a sticky header, add <code>scroll-padding</code> so a focused box
                and the error under it are not hidden behind the header (2.4.11 Focus Not Obscured
                (Minimum), Level AA).
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
          importLine={`import { AddressInput, useAddressInput } from '@kvirn-ui/react'
import { kvirnGeocoder } from '@kvirn-ui/map/kvirn' // only for the address lookup`}
          parts={parts}
          hook={useAddressInputHook}
          strings={
            <>
              <StringsBlock
                namespace="addressInput"
                component="AddressInput"
                keys={[
                  {
                    key: 'lookupHelpSuggest',
                    meaning:
                      'The help text under the street box when the search runs as you type. The line about the country follows it.',
                    values: { min: 3 },
                  },
                  {
                    key: 'lookupHelpRequest',
                    meaning:
                      'The help text when the search runs on request (Enter or Search). The line about the country follows it.',
                  },
                  {
                    key: 'lookupScope',
                    meaning: 'The country that is searched, added after the help text.',
                    values: { country: 'Sweden' },
                  },
                  {
                    key: 'lookupNoResults',
                    meaning: 'Shown in the list and announced when nothing is found.',
                    values: { query: 'Storgatn' },
                  },
                  {
                    key: 'lookupError',
                    meaning: 'Shown and announced when the search fails or takes too long.',
                  },
                  {
                    key: 'lookupOffline',
                    meaning: 'Shown and announced when the visitor is offline. No request is sent.',
                  },
                  {
                    key: 'noAddressDetails',
                    meaning:
                      'Shown and announced when a choice has no postal address, such as a park. Nothing is filled in.',
                  },
                  {
                    key: 'filledNote',
                    meaning:
                      'The note under the street box after a choice that filled in the boxes.',
                  },
                  {
                    key: 'missingPostalCode',
                    meaning:
                      'Added to the note and the announcement when the choice has no postal code.',
                  },
                  {
                    key: 'missingCity',
                    meaning: 'Added to the note and the announcement when the choice has no town.',
                  },
                  {
                    key: 'missingHouseNumber',
                    meaning:
                      'Added to the note and the announcement when the choice is a street with no house number.',
                  },
                  {
                    key: 'countryChanged',
                    meaning:
                      'Added to the note and the announcement when a choice is in another country than the country box showed.',
                    values: { country: 'Finland' },
                  },
                ]}
              >
                <p>
                  The boxes hold no text: the labels, help texts and errors are yours, in your own
                  translations. The lookup has the texts below, and <code>messages</code> on{' '}
                  <code>AddressInput.Line1</code> replaces them for one box.
                </p>
              </StringsBlock>
              <StringsBlock
                namespace="addressSearch"
                keys={[
                  {
                    key: 'submit',
                    meaning:
                      'The name of the Search button, which shows only when the search runs on request.',
                  },
                  {
                    key: 'privacy',
                    meaning: 'The notice above the street box, with the name of the service.',
                    values: { service: 'the Kvirn map service' },
                  },
                  {
                    key: 'privacyUnnamed',
                    meaning: 'The notice when the geocoder has no name.',
                  },
                  {
                    key: 'tooShort',
                    meaning:
                      'Shown and announced when the search runs on request and the text is too short.',
                    values: { min: 3 },
                  },
                  {
                    key: 'searching',
                    meaning:
                      'Shown and announced when a request is on its way. It is left out when the answer is quick.',
                  },
                  {
                    key: 'resultCount',
                    meaning: 'Announced with the number of addresses found.',
                    values: { count: 2 },
                  },
                  {
                    key: 'pickedFilled',
                    meaning:
                      'Announced after a choice, with the sentences for what is missing after it.',
                    values: { label: 'Drottninggatan 6, 111 51 Stockholm' },
                  },
                ]}
              >
                <p>
                  These texts belong to the address search that AddressInput shares with
                  AddressSearch, so the same keys work on <code>AddressInput.Line1</code>’s{' '}
                  <code>messages</code> and on <code>KvirnProvider</code>.
                </p>
              </StringsBlock>
              <StringsBlock
                namespace="mask"
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
                  The postal code announces the mask’s strings, and <code>messages</code> on{' '}
                  <code>AddressInput.PostalCode</code> replaces them for one box.
                </p>
              </StringsBlock>
            </>
          }
        />
      }
    />
  )
}
