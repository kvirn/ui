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
  dateInputBoxAttributes,
  dateInputBoxRows,
  dateInputRootAttributes,
  dateInputRootRows,
  useDateInputHook,
} from '../content/date-input.api.ts'
import { BirthDate } from '../examples/date-input/default.tsx'
import { ControlledDate } from '../examples/date-input/controlled.tsx'
import { NoAutoAdvance } from '../examples/date-input/no-auto-advance.tsx'
import { VisitDate } from '../examples/date-input/not-a-birthday.tsx'
import { PaperFormOrder } from '../examples/date-input/paper-form-order.tsx'
import { PlainForm } from '../examples/date-input/plain-form.tsx'
import { WrongYear } from '../examples/date-input/wrong-box.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DateInputExampleSources = Record<
  | 'default'
  | 'not-a-birthday'
  | 'wrong-box'
  | 'paper-form-order'
  | 'controlled'
  | 'plain-form'
  | 'no-auto-advance',
  string
>

const boxPart = (name: 'Day' | 'Month' | 'Year'): ApiPart => ({
  name: `DateInput.${name}`,
  renders: (
    <>
      A <code>&lt;div class=&quot;kv-field&quot;&gt;</code> with a visible label (
      <code>dateInput.{name.toLowerCase()}</code>) and a text <code>&lt;input&gt;</code>. It takes
      the props of a <code>TextInput</code> except <code>type</code>, <code>value</code>,{' '}
      <code>defaultValue</code>, <code>onValueChange</code>, <code>mask</code>,{' '}
      <code>announceRejections</code>, <code>messages</code> and <code>part</code>: the Root gives
      it its name, value and autocomplete. The props and <code>ref</code> go to the input.
    </>
  ),
  props: dateInputBoxRows,
  attributes: dateInputBoxAttributes,
})

const parts: ApiPart[] = [
  {
    name: 'DateInput.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code> with no role, then the auto-advance hint. It takes every attribute
        of a <code>&lt;div&gt;</code> and passes <code>ref</code> to it. Put it inside a{' '}
        <code>Fieldset.Root</code> with a <code>Fieldset.Legend</code>. Without children it renders
        Day, Month and Year in the locale’s order. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: dateInputRootRows,
    attributes: dateInputRootAttributes,
  },
  boxPart('Day'),
  boxPart('Month'),
  boxPart('Year'),
]

export function DateInputPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DateInputExampleSources
}) {
  return (
    <ComponentPage
      title="DateInput"
      lead="Each box has a visible label, so autofill, dictation and screen readers (software that reads the screen aloud) all work. It never parses or checks the date: that is your form’s job."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a date the user knows by heart or reads off a document, such as a date of
            birth. Put it in a <code>Fieldset</code> whose legend asks the question.
          </li>
          <li>
            Use it in forms for residents and for staff, wherever the date is typed rather than
            picked. For a date near today, add a{' '}
            <Link href="/components/date-picker">DatePicker</Link> button after the boxes: typing
            still works.
          </li>
          <li>
            For most other dates, one <Link href="/components/text-input">TextInput</Link> with a
            date mask is shorter: one box and one Tab stop instead of three.
          </li>
          <li>
            Not for a time or a month alone: use a{' '}
            <Link href="/components/text-input">TextInput</Link> with a mask or a{' '}
            <Link href="/components/listbox">Listbox</Link>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <BirthDate />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="not-a-birthday"
            title="A date that isn’t a birthday, and is optional"
            why={
              <>
                Leave <code>autoComplete</code> off: the token would offer the user’s own birthday
                (1.3.5 Identify Input Purpose). In a <code>group</code> Fieldset that isn’t
                required, the legend ends with “(optional)” and no box does.
              </>
            }
            code={sources['not-a-birthday']}
            propsUsed={[{ part: 'DateInput.Root', prop: 'name' }]}
          >
            <VisitDate />
          </UseCase>
          <UseCase
            id="wrong-box"
            title="Saying which box is wrong"
            why={
              <>
                The date has one message, the Fieldset’s, and <code>invalid</code> goes on the wrong
                boxes only: “must include a year” marks Year, “must be a real date” marks all three.
                A box never has its own error message.
              </>
            }
            code={sources['wrong-box']}
            propsUsed={[
              { part: 'DateInput.Root', prop: 'invalidParts' },
              { part: 'DateInput.Root', prop: 'defaultValue' },
            ]}
            note={
              <Note kind="reminder">
                Keep the format example under the boxes when the error shows, and say how to fix it.
                See <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <WrongYear />
          </UseCase>
          <UseCase
            id="controlled"
            title="In your own form state"
            why={
              <>
                Pass <code>value</code> and <code>onValueChange</code> from your form logic. The
                Root reports the whole date as the boxes show it: three strings, never padded or
                parsed. Checking it is your job, for example with <code>checks.date</code>.
              </>
            }
            code={sources['controlled']}
            propsUsed={[
              { part: 'DateInput.Root', prop: 'value' },
              { part: 'DateInput.Root', prop: 'onValueChange' },
            ]}
          >
            <ControlledDate />
          </UseCase>
          <UseCase
            id="plain-form"
            title="In a plain form"
            why={
              <>
                Without <code>value</code> the browser keeps the text. <code>name</code> is a
                prefix, so a submit sends <code>birth-day</code>, <code>birth-month</code> and{' '}
                <code>birth-year</code>.
              </>
            }
            code={sources['plain-form']}
            propsUsed={[
              { part: 'DateInput.Root', prop: 'name' },
              { part: 'DateInput.Root', prop: 'autoComplete' },
            ]}
          >
            <PlainForm />
          </UseCase>
          <UseCase
            id="paper-form-order"
            title="Matching a paper form"
            why="The order follows the region. When the service must match a paper form, write Day, Month and Year as children in the order you want, and write the example under the boxes in that order."
            code={sources['paper-form-order']}
          >
            <PaperFormOrder />
          </UseCase>
          <UseCase
            id="no-auto-advance"
            title="Typing never moves focus"
            why="By default, focus moves to the next box when typing fills one, and a visible hint says so before anyone types. If your service follows the stricter reading of 3.2.2 On Input, turn it off: the hint goes too."
            code={sources['no-auto-advance']}
            propsUsed={[{ part: 'DateInput.Root', prop: 'autoAdvance' }]}
          >
            <NoAutoAdvance />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          linkToStrings
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Ask the question in the legend and write an example under the boxes, in the order
                the boxes are in. Without them the three boxes have no shared name and nobody knows
                the format (1.3.1 Info and Relationships, 3.3.2 Labels or Instructions).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                If a screen reader does not read the group’s error when only one box is wrong, list
                it in your accessibility statement with its workaround. Test it with the screen
                readers your users have.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { DateInput, Fieldset, useDateInput } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDateInputHook}
          strings={
            <StringsBlock
              namespace="dateInput"
              component="DateInput"
              keys={[
                { key: 'day', meaning: 'The visible label of the Day box.' },
                { key: 'month', meaning: 'The visible label of the Month box.' },
                { key: 'year', meaning: 'The visible label of the Year box.' },
                {
                  key: 'autoAdvanceHint',
                  meaning: 'The hint under the boxes that says focus moves on when a box is full.',
                },
              ]}
            />
          }
        />
      }
    />
  )
}
