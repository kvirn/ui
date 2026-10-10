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
  datePickerPopupAttributes,
  datePickerRootRows,
  datePickerTitleAttributes,
  datePickerTitleRows,
  datePickerTriggerAttributes,
  useDatePickerHook,
} from '../content/date-picker.api.ts'
import { ClosedVisitDays } from '../examples/date-picker/closed-days.tsx'
import { VisitDate } from '../examples/date-picker/default.tsx'
import { LimitedVisitDate } from '../examples/date-picker/limits.tsx'
import { MaskedVisitDate } from '../examples/date-picker/masked-field.tsx'
import { TitledVisitDate } from '../examples/date-picker/own-title.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DatePickerExampleSources = Record<
  'default' | 'masked-field' | 'limits' | 'closed-days' | 'own-title',
  string
>

const parts: ApiPart[] = [
  {
    name: 'DatePicker.Root',
    renders: (
      <>
        No element. It owns the open state and the picker’s limits, and gives the Dialog its
        context. Put the typed field, <code>DatePicker.Trigger</code> and{' '}
        <code>DatePicker.Popup</code> inside it, and the field’s Fieldset inside it too, so the
        trigger sits in the row of boxes. The default theme is described on{' '}
        <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: datePickerRootRows,
  },
  {
    name: 'DatePicker.Trigger',
    renders: (
      <>
        A <code>&lt;button type=&quot;button&quot;&gt;</code> named “Choose date” (
        <code>datePicker.trigger</code>) with a decorative calendar icon. It takes every attribute
        of a <code>&lt;button&gt;</code> and passes <code>ref</code> to it. If you pass children,
        the visible text must stay its name.
      </>
    ),
    attributes: datePickerTriggerAttributes,
  },
  {
    name: 'DatePicker.Popup',
    renders: (
      <>
        A modal <code>&lt;dialog&gt;</code>, a <Link href="/components/dialog">Dialog</Link> popup.
        With no children it holds the Title, a Close button and the Calendar, which is mounted only
        while the dialog is open. It takes every attribute of a <code>&lt;dialog&gt;</code> and
        passes <code>ref</code> to it.
      </>
    ),
    attributes: datePickerPopupAttributes,
  },
  {
    name: 'DatePicker.Title',
    renders: (
      <>
        An <code>&lt;h2&gt;</code> that names the dialog, “Choose a date” (
        <code>datePicker.title</code>). It takes every attribute of a heading and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    props: datePickerTitleRows,
    attributes: datePickerTitleAttributes,
  },
  {
    name: 'DatePicker.Calendar',
    renders: (
      <>
        A <Link href="/components/calendar">Calendar.Root</Link> with the picker’s value and limits
        set, and the month buttons, heading, range hint and grid inside it. It takes the attributes
        of a <code>&lt;div&gt;</code>, not the Calendar’s options: those come from the picker. Give
        it children to compose your own.
      </>
    ),
  },
]

export function DatePickerPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DatePickerExampleSources
}) {
  return (
    <ComponentPage
      title="DatePicker"
      lead="Typing always works: the picker is the slower path, not a replacement."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it as an add-on to a date field, a{' '}
            <Link href="/components/date-input">DateInput</Link> or one{' '}
            <Link href="/components/text-input">TextInput</Link> with a date mask, when the date is
            near today and easier to pick than to type: a booking, a visit, a start date.
          </li>
          <li>
            Use it in forms for residents and for staff. You keep the form state: the picker takes
            the field’s date and gives back the chosen day.
          </li>
          <li>
            Not for a start and an end: use{' '}
            <Link href="/components/date-range-picker">DateRangePicker</Link>.
          </li>
          <li>
            Not for a date the user knows by heart, such as a date of birth: use{' '}
            <Link href="/components/date-input">DateInput</Link> alone.
          </li>
          <li>
            Not as a section of the page: use a <Link href="/components/calendar">Calendar</Link>{' '}
            beside the field.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <VisitDate />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="masked-field"
            title="One field with a date mask"
            why={
              <>
                A single <code>TextInput</code> with <code>masks.date()</code> is the shortest
                field, and the trigger sits beside it in a row that wraps. Turn the text into an ISO
                date for the picker with <code>maskedDateToIsoDate</code>, and the chosen day back
                into the text with <code>isoDateToMaskedDate</code>.
              </>
            }
            code={sources['masked-field']}
            propsUsed={[
              { part: 'DatePicker.Root', prop: 'value' },
              { part: 'DatePicker.Root', prop: 'onValueChange' },
            ]}
          >
            <MaskedVisitDate />
          </UseCase>
          <UseCase
            id="limits"
            title="Only some dates can be chosen"
            why={
              <>
                Set <code>minimum</code> and <code>maximum</code>. The dialog writes them in words
                above the grid; say them in the field’s help text too, because the user sees that
                text first. <code>today</code> is fixed in this example so the dates are the same on
                any day.
              </>
            }
            code={sources['limits']}
            propsUsed={[
              { part: 'DatePicker.Root', prop: 'minimum' },
              { part: 'DatePicker.Root', prop: 'maximum' },
              { part: 'DatePicker.Root', prop: 'today' },
            ]}
            note={
              <Note kind="reminder">
                The picker never validates what is typed. Check the typed date against the same
                limits in your form, and say what is wrong. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <LimitedVisitDate />
          </UseCase>
          <UseCase
            id="closed-days"
            title="Days that are closed, with the reason"
            why="A day that can't be chosen stays focusable, struck through, with the reason in its name, so a keyboard or screen reader user can find it and read why."
            code={sources['closed-days']}
            propsUsed={[
              { part: 'DatePicker.Root', prop: 'isDateUnavailable' },
              { part: 'DatePicker.Root', prop: 'getDateDescription' },
            ]}
          >
            <ClosedVisitDays />
          </UseCase>
          <UseCase
            id="own-title"
            title="Naming the dialog after the question"
            why="The default title says “Choose a date”. A title that repeats the field’s question tells the user which date they are choosing."
            code={sources['own-title']}
            propsUsed={[{ part: 'DatePicker.Root', prop: 'messages' }]}
            note={
              <Note kind="tip">
                To change the text for your whole app, pass <code>messages</code> to{' '}
                <code>KvirnProvider</code> instead.
              </Note>
            }
          >
            <TitledVisitDate />
          </UseCase>
          <Note kind="reminder">
            Without a <code>timeZone</code> on <code>KvirnProvider</code>, the first paint uses the
            UTC date; a popup that opens after mount starts on the browser&apos;s date. Pass{' '}
            <code>timeZone</code> for the same day on the server and in the browser.
          </Note>
        </>
      }
      contract={<ContractSectionsView contract={contract} linkToStrings />}
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { DatePicker, useDatePicker } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDatePickerHook}
          strings={
            <StringsBlock
              namespace="datePicker"
              component="DatePicker"
              keys={[
                { key: 'trigger', meaning: 'The visible text and name of the trigger.' },
                { key: 'title', meaning: 'The default title of the dialog.' },
              ]}
            />
          }
        />
      }
    />
  )
}
