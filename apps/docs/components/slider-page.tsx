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
import { LiveResults } from '../examples/slider/live-results.tsx'
import { NotAvailable } from '../examples/slider/not-available.tsx'
import { PlainForm } from '../examples/slider/plain-form.tsx'
import { WithNumberInput } from '../examples/slider/with-number-input.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type SliderExampleSources = Record<
  'default' | 'plain-form' | 'with-number-input' | 'live-results' | 'not-available',
  string
>

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
      lead="It is the browser’s own range control, so the arrow keys, Home, End, Page Up, Page Down, dragging and sending a form work without extra code."
      pattern="APG Slider (single thumb)"
      whenToUse={
        <ul>
          <li>
            Use a slider for an approximate value over a small range with a coarse step, where
            seeing the position helps: a search distance, a volume.
          </li>
          <li>
            Name the quantity and its unit in the label, state the ends of the range in the help
            text, and give <code>valueText</code> the unit so a screen reader (software that reads
            the screen aloud) says “15 km”, not “15”.
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
            title="A search distance in a plain form"
            why={
              <>
                Use it when the form needs only the number. Without <code>value</code> the browser
                keeps the number, and sending the form posts it under the slider’s <code>name</code>
                . A form reset puts back <code>defaultValue</code>.
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
            title="A search distance with an exact box beside it"
            why="Dragging is hard for some people and imprecise for everyone, so give an exact way in: the slider for a rough choice, the number box for the exact distance. In the example the two stay in step."
            code={sources['with-number-input']}
            propsUsed={[
              { part: 'Slider', prop: 'value' },
              { part: 'Slider', prop: 'onValueChange' },
              { part: 'Slider', prop: 'aria-labelledby' },
            ]}
            note={
              <Note kind="recipe">
                Let the NumberInput own the Field, so a click on the label and the error land on it.
                Name and describe the slider with <code>aria-labelledby</code> and{' '}
                <code>aria-describedby</code>, pointing at a <code>span</code> with an id inside the
                label and the help text. Give only the NumberInput a <code>name</code>, so the form
                sends the value once.
              </Note>
            }
          >
            <WithNumberInput />
          </UseCase>
          <UseCase
            id="live-results"
            title="Recycling points that update as the distance changes"
            why={
              <>
                A list that changes while the thumb moves is a status message. The slider announces
                only its own value, so say the new count yourself, once, after the person stops.
              </>
            }
            code={sources['live-results']}
            propsUsed={[
              { part: 'Slider', prop: 'value' },
              { part: 'Slider', prop: 'onValueChange' },
              { part: 'Slider', prop: 'valueText' },
            ]}
            note={
              <Note kind="reminder">
                Announce the result with the <Link href="/components/announcer">Announcer</Link>,
                once and after a pause, never on every step (4.1.3 Status Messages, level AA). Don’t
                move focus or leave the page when the value changes (3.2.2 On Input, level A).
              </Note>
            }
          >
            <LiveResults />
          </UseCase>
          <UseCase
            id="not-available"
            title="A distance that is off for now"
            why="When another choice makes the slider meaningless, disable it and say why in the help text. A disabled Field disables the slider too, and Tab skips it."
            code={sources['not-available']}
            propsUsed={[{ part: 'Slider', prop: 'defaultValue' }]}
          >
            <NotAvailable />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Name the quantity and its unit in the label, and give <code>valueText</code> the
                unit. Without them a screen reader says only a bare number, and the user can’t tell
                what it measures (4.1.2 Name, Role, Value).
              </Note>
            ),
            'visual-and-modes': (
              <Note kind="reminder">
                If you restyle the slider, keep the thumb and the track edge at least 3:1 against
                their background, and keep the thumb and its hit area large enough to press (1.4.11
                Non-text Contrast, 2.5.8 Target Size (Minimum)).
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
          importLine="import { Field, Slider, useSlider } from '@kvirn-ui/react'"
          parts={parts}
          hook={useSliderHook}
        />
      }
    />
  )
}
