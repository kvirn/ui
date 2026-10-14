'use client'

import { en } from '@kvirn-ui/i18n/en'
import {
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  DateRangePicker,
  DefinitionList,
  Field,
  Fieldset,
  Heading,
  Link,
  List,
  Pagination,
  Stack,
  TextInput,
  isoDateToMaskedDate,
  maskedDateToIsoDate,
  masks,
  useAnnouncer,
  useFormat,
  useLocale,
} from '@kvirn-ui/react'
import type { TextMessage } from '@kvirn-ui/i18n'
import { useState } from 'react'
import {
  kvirnbyEventCategories,
  kvirnbyEventCategoryLabels,
} from '../../fixtures/units-and-events.ts'
import type { KvirnbyEventCategory } from '../../fixtures/units-and-events.ts'
import { kvirnbyEvents } from '../../fixtures/news-events-and-notices.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { EventTimeSpan } from '../event/event-time.tsx'
import { NewsDate } from '../news-list/news-date.tsx'

export interface EventListPageProps {
  /** `filtered` starts with one category applied; `empty` has no upcoming events, so no filters. Default `upcoming`. */
  state?: 'upcoming' | 'filtered' | 'empty' | undefined
}

const text = (message: TextMessage) => (typeof message === 'function' ? message() : message)

const categories = Object.keys(kvirnbyEventCategoryLabels) as KvirnbyEventCategory[]
const totalEvents = 14
const totalPages = 3

/**
 * The events archive, the slot between header and footer: breadcrumb, `h1`, the filters (category
 * and a date range), the result count, the event list and the pagination. The filters change the
 * list in place and say the new count once, politely. Example text is English and fictional
 * (Kvirnby municipality); the filter words come from `filters.*` in English.
 */
export function EventListPage({ state = 'upcoming' }: EventListPageProps) {
  const format = useFormat()
  const { locale } = useLocale()
  const { announce } = useAnnouncer()
  const [applied, setApplied] = useState<string[]>(state === 'filtered' ? ['family'] : [])
  const [texts, setTexts] = useState({ start: '', end: '' })
  const range = {
    start: maskedDateToIsoDate(texts.start, locale),
    end: maskedDateToIsoDate(texts.end, locale),
  }

  const matching = (nextApplied: string[], nextRange: { start: string; end: string }) =>
    kvirnbyEvents.filter((event) => {
      const day = event.startsAt.slice(0, 10)
      return (
        (nextApplied.length === 0 ||
          nextApplied.includes(kvirnbyEventCategories[event.href] ?? '')) &&
        (nextRange.start === '' || day >= nextRange.start) &&
        (nextRange.end === '' || day <= nextRange.end)
      )
    })
  const events = matching(applied, range)
  const isFiltered = applied.length > 0 || range.start !== '' || range.end !== ''
  const count = isFiltered ? events.length : totalEvents
  const shown = state === 'empty' ? [] : events

  // A typed date filters once it is complete, so that is when the new count is said, once.
  const typeDate = (next: { start: string; end: string }) => {
    setTexts(next)
    const nextRange = {
      start: maskedDateToIsoDate(next.start, locale),
      end: maskedDateToIsoDate(next.end, locale),
    }
    if (nextRange.start !== range.start || nextRange.end !== range.end) {
      announce(en.filters.resultCount({ count: matching(applied, nextRange).length }, format))
    }
  }

  const example = `For example, ${masks.date().withLocale(locale).format('2026-10-27')}`

  return (
    <>
      <Container>
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Events</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">Events</Heading>
          {state === 'empty' ? (
            <div className="kv-empty-state">
              <Heading as="h2" size="heading-3" className="kv-empty-state-title">
                There are no upcoming events
              </Heading>
              <p className="kv-empty-state-body">
                Check back soon, or read the <Link.Root href="#news">latest news</Link.Root>.
              </p>
            </div>
          ) : (
            <>
              <form aria-labelledby="event-filter-heading">
                <Stack className="kv-stack--gap-4">
                  <Heading as="h2" size="heading-3" id="event-filter-heading">
                    {text(en.filters.heading)}
                  </Heading>
                  <CheckboxGroup.Root
                    name="category"
                    value={applied}
                    onValueChange={(next) => {
                      setApplied(next)
                      announce(
                        en.filters.resultCount({ count: matching(next, range).length }, format),
                      )
                    }}
                  >
                    <CheckboxGroup.Legend>Category</CheckboxGroup.Legend>
                    {categories.map((value) => (
                      <Field.Root key={value}>
                        <Checkbox value={value} />
                        <Field.Label>{kvirnbyEventCategoryLabels[value]}</Field.Label>
                      </Field.Root>
                    ))}
                  </CheckboxGroup.Root>
                  <DateRangePicker.Root
                    today="2026-10-12"
                    value={range}
                    onValueChange={(next) => {
                      setTexts({
                        start: isoDateToMaskedDate(next.start, locale),
                        end: isoDateToMaskedDate(next.end, locale),
                      })
                      announce(
                        en.filters.resultCount({ count: matching(applied, next).length }, format),
                      )
                    }}
                  >
                    <Fieldset.Root group>
                      <Fieldset.Legend>Dates</Fieldset.Legend>
                      <div className="kv-date-range-row">
                        <Field.Root>
                          <Field.Label>From</Field.Label>
                          <TextInput
                            name="from"
                            mask={masks.date()}
                            className="kv-input--width-10"
                            value={texts.start}
                            onValueChange={(start) => typeDate({ ...texts, start })}
                          />
                          <Field.HelpText>{example}</Field.HelpText>
                        </Field.Root>
                        <Field.Root>
                          <Field.Label>To</Field.Label>
                          <TextInput
                            name="to"
                            mask={masks.date()}
                            className="kv-input--width-10"
                            value={texts.end}
                            onValueChange={(end) => typeDate({ ...texts, end })}
                          />
                          <Field.HelpText>{example}</Field.HelpText>
                        </Field.Root>
                        <DateRangePicker.Trigger />
                      </div>
                    </Fieldset.Root>
                    <DateRangePicker.Popup />
                  </DateRangePicker.Root>
                  <div>
                    <Button type="submit">{text(en.filters.apply)}</Button>
                  </div>
                </Stack>
              </form>
              <Heading as="h2" size="heading-3">
                {en.filters.resultCount({ count }, format)}
              </Heading>
              {shown.length === 0 ? (
                <div className="kv-empty-state">
                  <Heading as="h3" size="heading-4" className="kv-empty-state-title">
                    {text(en.filters.noResults)}
                  </Heading>
                  <p className="kv-empty-state-body">{text(en.filters.noResultsHint)}</p>
                </div>
              ) : (
                <List.Root className="kv-list--gap-8">
                  {shown.map((event) => {
                    const cancelled = event.status === 'cancelled'
                    return (
                      <List.Item key={event.href}>
                        <Stack className="kv-stack--gap-2">
                          <Heading as="h3" size="heading-4">
                            <Link.Root href={event.href}>
                              {cancelled ? `Cancelled: ${event.title}` : event.title}
                            </Link.Root>
                          </Heading>
                          {cancelled ? <Badge variant="danger">Cancelled</Badge> : null}
                          {event.status === 'moved' && event.movedTo !== undefined ? (
                            <p>
                              <Badge variant="warning">Moved</Badge> Moved to{' '}
                              <NewsDate isoDate={event.movedTo} />
                            </p>
                          ) : null}
                          {event.status === 'fullyBooked' ? <p>Fully booked</p> : null}
                          <DefinitionList.Root>
                            <DefinitionList.Row>
                              <DefinitionList.Term>When</DefinitionList.Term>
                              <DefinitionList.Description>
                                <EventTimeSpan startsAt={event.startsAt} endsAt={event.endsAt} />
                              </DefinitionList.Description>
                            </DefinitionList.Row>
                            <DefinitionList.Row>
                              <DefinitionList.Term>Where</DefinitionList.Term>
                              <DefinitionList.Description>{event.where}</DefinitionList.Description>
                            </DefinitionList.Row>
                            <DefinitionList.Row>
                              <DefinitionList.Term>Cost</DefinitionList.Term>
                              <DefinitionList.Description>{event.cost}</DefinitionList.Description>
                            </DefinitionList.Row>
                          </DefinitionList.Root>
                        </Stack>
                      </List.Item>
                    )
                  })}
                </List.Root>
              )}
              {!isFiltered ? (
                <Pagination.Root>
                  <Pagination.List>
                    {[1, 2, 3].map((number) => (
                      <Pagination.Item key={number}>
                        <Pagination.Link
                          page={number}
                          href={`?page=${number}`}
                          current={number === 1}
                        />
                      </Pagination.Item>
                    ))}
                    <Pagination.Item>
                      <Pagination.Status page={1} total={totalPages} />
                    </Pagination.Item>
                    <Pagination.Item>
                      <Pagination.Next href="?page=2" />
                    </Pagination.Item>
                  </Pagination.List>
                </Pagination.Root>
              ) : null}
            </>
          )}
        </Stack>
      </PageFrame.Main>
    </>
  )
}
