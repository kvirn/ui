import { Link } from '@kvirn-ui/react'
import { ApiBlock } from './api-block.tsx'
import type { ApiPart } from './api-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { UseCase } from './use-case.tsx'
import { sliderAttributes, sliderRows, useSliderHook } from '../content/slider.api.ts'
import { DefaultSlider } from '../examples/slider/default.tsx'
import { PlainForm } from '../examples/slider/plain-form.tsx'
import { WithNumberInput } from '../examples/slider/with-number-input.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SliderExampleSources = Record<'default' | 'plain-form' | 'with-number-input', string>

const parts: ApiPart[] = [
  {
    name: 'Slider',
    renders: (
      <>
        <code>&lt;input type=&quot;range&quot;&gt;</code>. It takes every attribute of an{' '}
        <code>&lt;input&gt;</code> except <code>type</code>, <code>role</code> and{' '}
        <code>required</code>, and passes <code>ref</code> to it. Put it in a{' '}
        <code>Field.Root</code>, after the <code>Field.Label</code>. The label, help text and error
        are the Field’s parts, and the slider has no strings of its own. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: sliderRows,
    attributes: sliderAttributes,
  },
]

export function SliderPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: SliderExampleSources
}) {
  return (
    <ComponentPage
      title="Slider"
      lead="One approximate number in a range, such as a search distance or a volume. It is a native range input, so the browser gives it the arrow keys, Home, End, PageUp, PageDown, the drag and form submission."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use a slider for an approximate value over a small range with a coarse step, where
            seeing the position helps.
          </li>
          <li>
            Name the quantity and its unit in the label, state the ends of the range in the help
            text, and give <code>valueText</code> the unit so a screen reader says “15 km”, not
            “15”.
          </li>
          <li>
            Not for an exact value, such as an amount or an age: use a{' '}
            <Link href="/components/number-input">NumberInput</Link>. A slider is never the only way
            to enter a number that matters: put a NumberInput beside it.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <DefaultSlider />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="plain-form"
            title="In a plain form, with no form logic"
            why={
              <>
                Without <code>value</code> the browser keeps the number, and a form submit sends the{' '}
                <code>name</code> and the number as a string. A form reset restores{' '}
                <code>defaultValue</code>.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[
              { part: 'Slider', prop: 'name' },
              { part: 'Slider', prop: 'defaultValue' },
              { part: 'Slider', prop: 'valueText' },
            ]}
          >
            <PlainForm />
          </UseCase>
          <UseCase
            id="with-number-input"
            title="A slider beside a number box"
            why="Dragging is hard for some users and imprecise for everyone, so give an exact way in. The NumberInput owns the Field, so the label click and the error land on it. The Slider takes aria-labelledby and aria-describedby, which opts it out of the Field. The Field’s label and help text take no id, so put a span with an id inside each and point at it."
            code={sources['with-number-input']}
            propsUsed={[
              { part: 'Slider', prop: 'value' },
              { part: 'Slider', prop: 'onValueChange' },
              { part: 'Slider', prop: 'aria-labelledby' },
            ]}
            note={
              <Note kind="reminder">
                Give only the NumberInput a <code>name</code>, so the form sends the value once.
              </Note>
            }
          >
            <WithNumberInput />
          </UseCase>
        </>
      }
      contract={<ContractSectionsView contract={contract} />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { Field, Slider, useSlider } from '@kvirn-ui/react'"
          parts={parts}
          hook={useSliderHook}
        />
      }
    />
  )
}
