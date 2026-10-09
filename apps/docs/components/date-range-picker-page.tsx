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
  dateRangePickerPopupAttributes,
  dateRangePickerRootRows,
  dateRangePickerTitleAttributes,
  dateRangePickerTitleRows,
  dateRangePickerTriggerAttributes,
  useDateRangePickerHook,
} from '../content/date-range-picker.api.ts'
import { BookedDays } from '../examples/date-range-picker/booked-days.tsx'
import { StayDates } from '../examples/date-range-picker/default.tsx'
import { LimitedStay } from '../examples/date-range-picker/nights-limit.tsx'
import { TitledStay } from '../examples/date-range-picker/own-title.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type DateRangePickerExampleSources = Record<
  'default' | 'nights-limit' | 'booked-days' | 'own-title',
  string
>

const parts: ApiPart[] = [
  {
    name: 'DateRangePicker.Root',
    renders: (
      <>
        No element. It owns the open state, the draft range and the limits, and gives the Dialog its
        context. Put the From and To fields, one <code>DateRangePicker.Trigger</code> after both,
        and <code>DateRangePicker.Popup</code> inside it, and the fields’ group Fieldset inside it
        too. The default theme is described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: dateRangePickerRootRows,
  },
  {
    name: 'DateRangePicker.Trigger',
    renders: (
      <>
        A <code>&lt;button type=&quot;button&quot;&gt;</code> named “Choose dates” (
        <code>dateRangePicker.trigger</code>) with a decorative calendar icon. It takes every
        attribute of a <code>&lt;button&gt;</code> and passes <code>ref</code> to it. If you pass
        children, the visible text must stay its name.
      </>
    ),
    attributes: dateRangePickerTriggerAttributes,
  },
  {
    name: 'DateRangePicker.Popup',
    renders: (
      <>
        A modal <code>&lt;dialog&gt;</code>, a <Link href="/components/dialog">Dialog</Link> popup.
        With no children it holds the Title, a Close button and the range Calendar, which is mounted
        only while the dialog is open. It takes every attribute of a <code>&lt;dialog&gt;</code> and
        passes <code>ref</code> to it.
      </>
    ),
    attributes: dateRangePickerPopupAttributes,
  },
  {
    name: 'DateRangePicker.Title',
    renders: (
      <>
        An <code>&lt;h2&gt;</code> that names the dialog, “Choose the dates” (
        <code>dateRangePicker.title</code>). It takes every attribute of a heading and passes{' '}
        <code>ref</code> to it.
      </>
    ),
    props: dateRangePickerTitleRows,
    attributes: dateRangePickerTitleAttributes,
  },
  {
    name: 'DateRangePicker.Calendar',
    renders: (
      <>
        A <Link href="/components/calendar">Calendar.Root</Link> in range mode with the picker’s
        draft and limits set, and the month buttons, both headings, the range hint and both grids
        inside it (the second month shows from 64rem). It takes the attributes of a{' '}
        <code>&lt;div&gt;</code>, not the Calendar’s options: those come from the picker. Give it
        children to compose your own.
      </>
    ),
  },
]

export function DateRangePickerPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: DateRangePickerExampleSources
}) {
  return (
    <ComponentPage
      title="DateRangePicker"
      lead="One button after a From and a To date that opens a modal dialog with a range Calendar. Typing always works: the picker is the slower path, not a replacement."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it for a start and an end near today, such as a stay or a leave, with a typed field
            for each end. You keep the form state: the picker takes both fields’ dates and gives
            back the finished range.
          </li>
          <li>
            Use it in forms for residents and for staff. Put the two fields in a group Fieldset
            whose legend names the range.
          </li>
          <li>
            Not for one date: use <Link href="/components/date-picker">DatePicker</Link>.
          </li>
          <li>
            Not as a section of the page: use a <Link href="/components/calendar">Calendar</Link>{' '}
            with <code>mode=&quot;range&quot;</code>.
          </li>
        </ul>
      }
      example={
        <ExampleFrame headingId="example" code={sources['default']}>
          <StayDates />
        </ExampleFrame>
      }
      useCases={
        <>
          <UseCase
            id="nights-limit"
            title="A longest stay"
            why={
              <>
                Set <code>maximumDays</code> and say the limit in your own unit in the group’s help
                text. The days count both ends, so a booking of 14 nights is 15. The dialog writes
                the limit in days as well. <code>today</code> is fixed in this example so the dates
                are the same on any day.
              </>
            }
            code={sources['nights-limit']}
            propsUsed={[
              { part: 'DateRangePicker.Root', prop: 'maximumDays' },
              { part: 'DateRangePicker.Root', prop: 'minimum' },
              { part: 'DateRangePicker.Root', prop: 'today' },
            ]}
            note={
              <Note kind="reminder">
                The picker never validates what is typed. Check that the end is on or after the
                start and inside the limit in your form, and say what is wrong. See{' '}
                <Link href="#what-you-need-to-do">What you need to do</Link>.
              </Note>
            }
          >
            <LimitedStay />
          </UseCase>
          <UseCase
            id="booked-days"
            title="Days that are taken"
            why={
              <>
                A day that can’t be chosen stays focusable, struck through, with the reason in its
                name. By default a range cannot pass over it; set{' '}
                <code>allowUnavailableInRange</code> when it can, such as a leave across a holiday.
              </>
            }
            code={sources['booked-days']}
            propsUsed={[
              { part: 'DateRangePicker.Root', prop: 'isDateUnavailable' },
              { part: 'DateRangePicker.Root', prop: 'getDateDescription' },
              { part: 'DateRangePicker.Root', prop: 'allowUnavailableInRange' },
            ]}
          >
            <BookedDays />
          </UseCase>
          <UseCase
            id="own-title"
            title="Naming the dialog after the question"
            why="The default title says “Choose the dates”. A title that repeats the group’s question tells the user which dates they are choosing."
            code={sources['own-title']}
            propsUsed={[{ part: 'DateRangePicker.Root', prop: 'messages' }]}
            note={
              <Note kind="tip">
                To change the text for your whole app, pass <code>messages</code> to{' '}
                <code>KvirnProvider</code> instead.
              </Note>
            }
          >
            <TitledStay />
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
          importLine="import { DateRangePicker, useDateRangePicker } from '@kvirn-ui/react'"
          parts={parts}
          hook={useDateRangePickerHook}
          strings={
            <StringsBlock
              namespace="dateRangePicker"
              component="DateRangePicker"
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
