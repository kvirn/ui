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
  numberInputAttributes,
  numberInputRows,
  useNumberInputHook,
} from '../content/number-input.api.ts'
import { Amount } from '../examples/number-input/amount.tsx'
import { DefaultNumberInput } from '../examples/number-input/default.tsx'
import { Negative } from '../examples/number-input/negative.tsx'
import { PlainTextBox } from '../examples/number-input/plain-text-box.tsx'
import { Range } from '../examples/number-input/range.tsx'
import { UnitInBox } from '../examples/number-input/unit-in-box.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type NumberInputExampleSources = Record<
  'default' | 'amount' | 'range' | 'negative' | 'unit-in-box' | 'plain-text-box',
  string
>

const parts: ApiPart[] = [
  {
    name: 'NumberInput',
    renders: (
      <>
        <code>&lt;input type=&quot;text&quot;&gt;</code> with the role <code>textbox</code>, never{' '}
        <code>type=&quot;number&quot;</code> and never a spin button. It takes every attribute of an{' '}
        <code>&lt;input&gt;</code> except <code>type</code>, <code>min</code> and <code>max</code>,
        and passes <code>ref</code> to it. Put it in a <code>Field</code>: the label, help text and
        error are wired to it. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: numberInputRows,
    attributes: numberInputAttributes,
  },
]

export function NumberInputPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: NumberInputExampleSources
}) {
  return (
    <ComponentPage
      title="NumberInput"
      lead="It accepts digits and the decimal mark of the page’s language, leaves out other characters and says so, and never changes the number with the arrow keys."
      whenToUse={
        <ul>
          <li>
            Use a NumberInput for a quantity or an amount the user types: a number of people in a
            booking, hours per week, a rent. A number mask (a rule for which characters the box
            accepts) leaves out letters and signs the number can’t have.
          </li>
          <li>
            Put it in a <code>Field</code> with a visible label. Put the unit in the label, and with
            decimals put the format and an example in a help text under the box.
          </li>
          <li>
            Choose a width that fits the answer, from <code>kv-input--width-2</code> up to{' '}
            <code>kv-input--width-20</code>. A width is a hint, not a limit.
          </li>
          <li>
            Not for a code that keeps its leading zeros, such as a postcode, a case number or a
            personal identity number: use a <Link href="/components/text-input">TextInput</Link>{' '}
            with a <code>mask</code>, or a number would drop the zeros.
          </li>
          <li>
            Not for a date: use a <Link href="/components/date-input">DateInput</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultNumberInput />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="amount"
            title="Working hours per week, with a decimal"
            why="Some answers have a decimal mark, and it depends on the language of the page: a comma in Swedish, a point in English. The box writes the mark the way the page does, and a typed comma or point is read as the mark. Under the box, the example shows the plain number your form should send."
            code={sources['amount']}
            propsUsed={[
              { part: 'NumberInput', prop: 'decimals' },
              { part: 'NumberInput', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="reminder">
                The box doesn’t explain the decimal mark. Say it in a help text under the box, with
                an example, as here (3.3.2 Labels or Instructions). Send{' '}
                <code>details.unmaskedValue</code> to your server: with the number mask it is the
                plain number, such as <code>37.5</code>, whatever the page shows.
              </Note>
            }
          >
            <Amount />
          </UseCase>
          <UseCase
            id="range"
            title="Number of people in a booking, 1 to 8"
            why={
              <>
                A quantity has limits, but the box never clamps or corrects what the user typed. It
                reports whether the number is inside <code>min</code> and <code>max</code>. Your
                form decides when the user sends it, writes the error and moves focus to the box.
              </>
            }
            code={sources['range']}
            propsUsed={[
              { part: 'NumberInput', prop: 'min' },
              { part: 'NumberInput', prop: 'max' },
              { part: 'NumberInput', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="reminder">
                The range is never announced, so say it in a help text under the box, as here (3.3.2
                Labels or Instructions). The error then says what to enter (3.3.3 Error Suggestion).
                See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <Range />
          </UseCase>
          <UseCase
            id="negative"
            title="Business profit or loss last year"
            why={
              <>
                A result can be below zero: a loss. <code>allowNegative</code> accepts a leading
                minus sign, and a minus sign pasted from a document, also the typographic minus (−),
                is read too. Phones then show the text keyboard, because the number keyboard on
                iPhone has no minus sign, so say in the help text how to write it.
              </>
            }
            code={sources['negative']}
            propsUsed={[{ part: 'NumberInput', prop: 'allowNegative' }]}
          >
            <Negative />
          </UseCase>
          <UseCase
            id="unit-in-the-box"
            title="A monthly rent in whole kronor, with the unit in the box"
            why={
              <>
                A unit such as “kr” can sit inside the box, in an{' '}
                <Link href="/components/input-group">InputGroup</Link> addon. Screen readers
                (software that reads the screen aloud) skip the addon, so the label still says the
                unit: “Monthly rent in kronor”. <code>grouping</code> writes the digits in threes,
                so a long amount is easier to read.
              </>
            }
            code={sources['unit-in-box']}
            propsUsed={[{ part: 'NumberInput', prop: 'grouping' }]}
          >
            <UnitInBox />
          </UseCase>
          <UseCase
            id="plain-text-box"
            title="Total project costs pasted from a budget"
            why={
              <>
                Sometimes the mask is in the way: an amount pasted from a spreadsheet, or a figure
                in a format the mask doesn’t know. With <code>{'mask={false}'}</code> the box is a
                plain numeric text box. Nothing is left out or announced, and{' '}
                <code>onValueChange</code> reports no mask details, so you read and check the value
                yourself.
              </>
            }
            code={sources['plain-text-box']}
            propsUsed={[{ part: 'NumberInput', prop: 'mask' }]}
          >
            <PlainTextBox />
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
            'what-you-need-to-do': (
              <Note kind="reminder">
                Give every NumberInput a visible label in a <code>Field</code>. Without a name a
                screen reader user can’t tell what the box is for, and a placeholder is gone as soon
                as the user types (4.1.2 Name, Role, Value; 3.3.2 Labels or Instructions).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you restyle the box, keep a focus ring with at least 3:1 contrast against what is
                next to it, and keep an invalid box recognisable by more than colour: the error text
                carries it (2.4.7 Focus Visible, 1.4.1 Use of Color).
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
          importLine="import { NumberInput, useNumberInput } from '@kvirn-ui/react'"
          parts={parts}
          hook={useNumberInputHook}
          strings={
            <StringsBlock
              namespace="mask"
              component="NumberInput"
              keys={[
                {
                  key: 'characterNotAllowed',
                  meaning: 'Announced when a character is left out.',
                  values: { allowed: 'digits' },
                },
                {
                  key: 'maximumDecimals',
                  meaning: 'Announced when a digit is left out because the decimals are full.',
                },
                {
                  key: 'maximumLength',
                  meaning:
                    'Announced by a pattern or RegExp mask of your own when a character is left out because it is full. The number mask never uses it.',
                  values: { length: 12 },
                },
              ]}
            >
              <p>
                NumberInput has no strings of its own. It announces the mask’s, and{' '}
                <code>messages</code> replaces them for one box.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
