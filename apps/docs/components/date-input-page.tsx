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
import { OneFieldDate } from '../examples/date-input/one-field.tsx'
import { OwnWordingDate } from '../examples/date-input/own-wording.tsx'
import { ReadOnlyDate } from '../examples/date-input/read-only.tsx'
import { DateWithPicker } from '../examples/date-input/with-picker.tsx'
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
  | 'no-auto-advance'
  | 'one-field'
  | 'own-wording'
  | 'read-only'
  | 'with-picker',
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
      it its name, value, autocomplete and read-only state. The props and <code>ref</code> go to the
      input.
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
        A <code>&lt;div&gt;</code> with no role that holds the boxes. While <code>autoAdvance</code>{' '}
        is on, a <code>&lt;p&gt;</code> with the hint follows it. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to the div. Put it inside a{' '}
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
      lead="Each box has its own visible label, and a date of birth can be filled in by the browser. It never reads or checks the date: that is your form’s job."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a date the user knows by heart, such as a date of birth. Put it in a{' '}
            <code>Fieldset</code> whose legend asks the question. Each part then gets its own
            autofill token (1.3.5 Identify Input Purpose).
          </li>
          <li>
            Use it in forms for residents and for staff, wherever the date is typed rather than
            picked. For a date near today, add a{' '}
            <Link href="/components/date-picker">DatePicker</Link> button after the boxes: typing
            still works.
          </li>
          <li>
            For a date people read off a document, or most other dates, one{' '}
            <Link href="/components/text-input">TextInput</Link> with <code>masks.date()</code> is
            shorter: one box and one Tab stop instead of three. It only checks the shape, so check
            the date with <code>checks.date</code>. The calendar button and read-only examples below
            show it beside the boxes.
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
                parsed. Checking it is your job. Write the strings as <code>YYYY-MM-DD</code>, with
                two digits for day and month, and pass that to <code>checks.date</code>.
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
            id="one-field"
            title="A start date read off a document"
            why={
              <>
                When people copy the date from a letter or a decision, ask in one{' '}
                <Link href="/components/text-input">TextInput</Link> with <code>masks.date()</code>{' '}
                instead of three boxes. It has one Tab stop, and a pasted or autofilled date is
                reformatted. The mask follows the page’s locale, so write the example from the mask
                itself. The mask checks the shape only: check the date with <code>checks.date</code>
                .
              </>
            }
            code={sources['one-field']}
          >
            <OneFieldDate />
          </UseCase>
          <UseCase
            id="with-picker"
            title="Booking a time: type the date or pick it"
            why={
              <>
                For a date near today, put <code>DatePicker.Trigger</code> last in the row of boxes.
                Typing still works. The picker holds no date: give it the date as <code>value</code>{' '}
                and write the chosen day back, with <code>dateInputValueToIsoDate</code> and{' '}
                <code>isoDateToDateInputValue</code> for the boxes. The second field is the
                alternative described under “When to use it”: one <code>TextInput</code> with{' '}
                <code>masks.date()</code>, bridged with <code>maskedDateToIsoDate</code> and{' '}
                <code>isoDateToMaskedDate</code>.
              </>
            }
            code={sources['with-picker']}
            note={
              <Note kind="tip">
                Limits, closed days and the popup’s title are on the{' '}
                <Link href="/components/date-picker">DatePicker</Link> page.
              </Note>
            }
          >
            <DateWithPicker />
          </UseCase>
          <UseCase
            id="read-only"
            title="A date a case officer can see but not change"
            why={
              <>
                <code>readOnly</code> is for a staff tool that shows a date the user can’t change
                here. The boxes stay focusable and selectable, and a form submit still sends them.
                Say why in the help text. <code>disabled</code> (on the Root or the Fieldset) takes
                the boxes out of the Tab order and out of the submit, so use it only when nobody
                needs to read the value. In a resident form, avoid both and show the date as plain
                text. Turn auto-advance off: nothing can be typed, so its hint would only confuse.
              </>
            }
            code={sources['read-only']}
            propsUsed={[
              { part: 'DateInput.Root', prop: 'readOnly' },
              { part: 'DateInput.Root', prop: 'autoAdvance' },
            ]}
          >
            <ReadOnlyDate />
          </UseCase>
          <UseCase
            id="own-wording"
            title="Your own wording for one date"
            why={
              <>
                Replace a string for one instance with <code>messages</code>: here the year box says
                “Year of birth”. The one field takes the mask’s messages the same way, for the line
                announced when a character is refused. To change a string for the whole service, set
                it once in the provider instead.
              </>
            }
            code={sources['own-wording']}
            propsUsed={[{ part: 'DateInput.Root', prop: 'messages' }]}
          >
            <OwnWordingDate />
          </UseCase>
          <UseCase
            id="paper-form-order"
            title="Matching a paper form"
            why={
              <>
                The order follows the region. When the service must match a paper form, write Day,
                Month and Year as children in the order you want, and write the example under the
                boxes in that order.
              </>
            }
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
                the boxes are in. Without them the three boxes have no shared name and the format is
                unclear (1.3.1 Info and Relationships, 3.3.2 Labels or Instructions).
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                Anything on this list that your users may meet belongs in your accessibility
                statement, with its workaround.
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
