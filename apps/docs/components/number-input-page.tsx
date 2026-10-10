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
      lead="It takes digits and the decimal mark of the page’s language, leaves out everything else and says so, and never changes the number with the arrow keys."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a NumberInput for a quantity or an amount the user types: a number of children, a
            rent, a balance.
          </li>
          <li>
            Put it in a <code>Field</code> with a visible label. Put the unit in the label, and with
            decimals put the format and an example in a help text under the box.
          </li>
          <li>
            Choose a width that fits the answer (<code>kv-input--width-2</code> to <code>-20</code>
            ). A width is a hint, not a limit.
          </li>
          <li>
            Not for a code that keeps its leading zeros, such as a postcode, a case number or a
            personal identity number: use a <code>TextInput</code> with a <code>mask</code>, or a
            number would drop the zeros. Not for a date: use three date boxes.
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
            title="An amount with decimals"
            why="Money has a decimal mark, and the mark depends on the language of the page: a comma in Swedish, a point in English. The box writes the groups and the mark the way the page does, and a typed comma or point is read as the mark. The mark is not explained by the box, so say it in a help text with an example."
            code={sources['amount']}
            propsUsed={[
              { part: 'NumberInput', prop: 'decimals' },
              { part: 'NumberInput', prop: 'grouping' },
              { part: 'NumberInput', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="tip">
                The box shows the number as the page writes it, <code>1 250,50</code> in Swedish.
                Send <code>details.unmaskedValue</code> to your server: it is always the machine
                form, <code>1250.5</code>.
              </Note>
            }
          >
            <Amount />
          </UseCase>
          <UseCase
            id="range"
            title="A number with a range"
            why="A quantity has limits, but the box never clamps or corrects what the user typed. It reports whether the number is inside min and max, and your form decides on submit, writes the message and moves focus to the input."
            code={sources['range']}
            propsUsed={[
              { part: 'NumberInput', prop: 'min' },
              { part: 'NumberInput', prop: 'max' },
              { part: 'NumberInput', prop: 'onValueChange' },
            ]}
            note={
              <Note kind="reminder">
                The range is never announced. Say it in a help text under the box, as here. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <Range />
          </UseCase>
          <UseCase
            id="negative"
            title="A number below zero"
            why="A balance or a difference can be negative. allowNegative accepts a leading minus sign. The on-screen keyboard then shows text, because the numeric keyboards on iOS have no minus sign, so show in the help text how to write it."
            code={sources['negative']}
            propsUsed={[{ part: 'NumberInput', prop: 'allowNegative' }]}
          >
            <Negative />
          </UseCase>
          <UseCase
            id="unit-in-the-box"
            title="A unit in the box"
            why={
              <>
                A unit such as “kr” can sit inside the box, in an{' '}
                <Link href="/components/input-group">InputGroup</Link> addon. The addon is hidden
                from screen readers, so the label still says the unit: “Monthly rent in kronor”.
              </>
            }
            code={sources['unit-in-box']}
          >
            <UnitInBox />
          </UseCase>
          <UseCase
            id="plain-text-box"
            title="An amount you read yourself"
            why="Sometimes the mask is in the way: an amount pasted from a spreadsheet, or a figure in a format the mask doesn’t know. mask false makes the box a plain numeric text box. Nothing is left out or announced, and onValueChange reports no mask details, so you parse the value."
            code={sources['plain-text-box']}
            propsUsed={[{ part: 'NumberInput', prop: 'mask' }]}
          >
            <PlainTextBox />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} messageNamespace="mask" linkToStrings />}
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
                  meaning: 'Announced when a character is left out because the mask is full.',
                  values: { length: 12 },
                },
              ]}
            />
          }
        />
      }
    />
  )
}
