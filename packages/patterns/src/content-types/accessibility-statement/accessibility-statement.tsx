'use client'

import {
  Breadcrumb,
  Container,
  Heading,
  Link,
  List,
  Prose,
  Stack,
  useFormat,
} from '@kvirn-ui/react'
import { kvirnbyKnownProblems, kvirnbyStatementDates } from '../../fixtures/accessibility.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { PageTools } from '../../site-chrome/page-tools/page-tools.tsx'

export interface AccessibilityStatementProps {
  /** Whose rules the statement follows: `se` (Digg), `fi` (Traficom), `no` (uustatus.no) or `eu` (the European Accessibility Act). Default `se`. */
  country?: 'se' | 'fi' | 'no' | 'eu' | undefined
}

/**
 * The accessibility statement, the slot between header and footer: breadcrumb, then in a reading
 * column how accessible the website is, what is not, how it was tested, how to report a problem and
 * who supervises. The conformance status is a fill-in box: the adopter writes it, the example never
 * claims one. Example text is English and fictional (Kvirnby municipality).
 */
export function AccessibilityStatement({ country = 'se' }: AccessibilityStatementProps) {
  const format = useFormat()
  const published = format.date(new Date(kvirnbyStatementDates.published), {
    dateStyle: 'long',
    timeZone: 'UTC',
  })
  const reviewed = format.date(new Date(kvirnbyStatementDates.reviewed), {
    dateStyle: 'long',
    timeZone: 'UTC',
  })
  return (
    <>
      <Container size="reading">
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Accessibility</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">Accessibility of the Kvirnby website</Heading>
          <p className="kv-lead">
            {country === 'eu'
              ? 'This is the accessibility information for the services on this website, as the European Accessibility Act asks. We want everyone to be able to use them.'
              : 'Kvirnby municipality wants everyone to be able to use this website. This statement says how accessible it is, what is not yet, and how to tell us.'}
          </p>
          {country === 'fi' ? (
            <p>
              This statement is also available in{' '}
              <Link.Root href="#saavutettavuusseloste" lang="fi" hrefLang="fi">
                suomi
              </Link.Root>{' '}
              and{' '}
              <Link.Root href="#tillganglighetsredogorelse" lang="sv" hrefLang="sv">
                svenska
              </Link.Root>
              .
            </p>
          ) : null}
          {country === 'no' ? (
            <Prose>
              <h2>Our accessibility statement</h2>
              <p>
                Kvirnby municipality publishes its <span lang="nb">tilgjengelighetserklæring</span>{' '}
                in the Norwegian Digitalisation Agency&apos;s reporting tool, so this page does not
                repeat it.
              </p>
              <p>
                <Link.Root href="https://uustatus.no">Read the statement at uustatus.no</Link.Root>
              </p>
            </Prose>
          ) : (
            <Prose>
              <h2>How accessible the website is</h2>
              <div className="kv-inset">
                <p>
                  <strong>Fill in:</strong> write how well the website meets the requirements
                  (fully, partly or not), the standard and version you tested against, and the date.
                  The example never states a status.
                </p>
              </div>
              <h2>What is not accessible</h2>
              <p>These parts do not yet meet the requirements.</p>
              <List.Root>
                {kvirnbyKnownProblems.map((entry) => (
                  <List.Item key={entry.problem}>
                    {entry.problem} {entry.reason} {entry.fixed}
                  </List.Item>
                ))}
              </List.Root>
              <h2>How we tested</h2>
              <p>
                We tested the website with a keyboard, with a screen reader and at 400 % zoom, and
                checked it with automated tools. A person with a disability took part in the test.
              </p>
            </Prose>
          )}
          <Prose>
            <h2>Report a problem</h2>
            <p>Can&apos;t use something on this website? Tell us and we will help you or fix it.</p>
            <List.Root>
              <List.Item>
                <Link.Root href="#report-a-problem">Report an accessibility problem</Link.Root>
              </List.Item>
              <List.Item>
                Or ask the <Link.Root href="#contact">contact centre</Link.Root>.
              </List.Item>
            </List.Root>
            <h2>Supervisory authority</h2>
            {/* TODO(legal-verify): PTS takes over supervision from 2027-01-01 (regulations skill) */}
            {country === 'se' ? (
              <p>
                If you are not satisfied with our answer, you can report it to the{' '}
                <Link.Root href="#digg">Agency for Digital Government (Digg)</Link.Root>, which
                supervises the requirements. From 1 January 2027 the Post and Telecom Authority
                (PTS) is the supervisor.
              </p>
            ) : null}
            {country === 'fi' ? (
              <p>
                If you are not satisfied with our answer, you can report it to the{' '}
                <Link.Root href="#traficom">
                  Finnish Transport and Communications Agency (Traficom)
                </Link.Root>
                , which supervises the requirements.
              </p>
            ) : null}
            {country === 'no' ? (
              <p>
                If you are not satisfied with our answer, you can report it to the{' '}
                <Link.Root href="#uutilsynet">Norwegian Digitalisation Agency (Digdir)</Link.Root>,
                which supervises the requirements.
              </p>
            ) : null}
            {country === 'eu' ? (
              <p>
                If you are not satisfied with our answer, you can report it to the market
                surveillance authority in your country. Fill in the name and the address of the
                authority that supervises you.
              </p>
            ) : null}
          </Prose>
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Published: <time dateTime={kvirnbyStatementDates.published}>{published}</time>.
              Reviewed: <time dateTime={kvirnbyStatementDates.reviewed}>{reviewed}</time>.
            </p>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
