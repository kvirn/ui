import { PageFrameMain } from '@kvirn-ui/patterns'
import { Heading, Link, ListItem, ListRoot, Stack } from '@kvirn-ui/react'
import { referenceMessages } from '../../../../messages/reference.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'

/** The 404 and the closed-service page: one narrow column, no data and no script of their own (P22). `StatusPages` is English example text, so the reference site writes its own copy. */
export function ReferenceStatus({
  locale,
  status,
}: {
  locale: ReferenceLocale
  status: 'not-found' | 'service-unavailable'
}) {
  const text = referenceMessages[locale]
  const copy = status === 'not-found' ? text.notFound : text.serviceUnavailable
  return (
    <PageFrameMain size="form">
      <Stack className="kv-stack--gap-8">
        <Heading as="h1">{copy.title}</Heading>
        <p className="kv-lead">{copy.lead}</p>
        {status === 'not-found' ? (
          <Stack className="kv-stack--gap-3">
            <Heading as="h2" size="heading-3">
              {text.notFound.whatYouCanDo}
            </Heading>
            <ListRoot>
              {text.notFound.steps.map((step) => (
                <ListItem key={step}>{step}</ListItem>
              ))}
            </ListRoot>
          </Stack>
        ) : null}
        <Stack className="kv-stack--gap-3">
          <Heading as="h2" size="heading-3">
            {status === 'not-found' ? text.notFound.otherPlaces : text.serviceUnavailable.otherWays}
          </Heading>
          <ListRoot>
            <ListItem>
              <Link href={`/reference/${locale}`}>{copy.start}</Link>
            </ListItem>
            <ListItem>
              <Link href="/reference">{copy.index}</Link>
            </ListItem>
          </ListRoot>
        </Stack>
      </Stack>
    </PageFrameMain>
  )
}
