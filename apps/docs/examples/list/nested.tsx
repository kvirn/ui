'use client'
import { Heading, Link, List } from '@kvirn-ui/react'
import { useId } from 'react'
import { useListTexts } from './texts.ts'

export function Nested() {
  const { texts } = useListTexts()
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <Heading as="h4" id={headingId}>
        {texts.topicsHeading}
      </Heading>
      <List.Root className="kv-list--bullet">
        <List.Item>
          <Link href="#housing">{texts.topicHousing}</Link>
          <List.Root className="kv-list--bullet kv-list--gap-2">
            <List.Item>
              <Link href="#building-permits">{texts.topicPermits}</Link>
            </List.Item>
            <List.Item>
              <Link href="#housing-adaptation-grant">{texts.topicAdaptation}</Link>
            </List.Item>
          </List.Root>
        </List.Item>
        <List.Item>
          <Link href="#schools">{texts.topicSchool}</Link>
          <List.Root className="kv-list--bullet kv-list--gap-2">
            <List.Item>
              <Link href="#school-transport">{texts.topicTransport}</Link>
            </List.Item>
            <List.Item>
              <Link href="#school-meals">{texts.topicMeals}</Link>
            </List.Item>
          </List.Root>
        </List.Item>
      </List.Root>
    </section>
  )
}
