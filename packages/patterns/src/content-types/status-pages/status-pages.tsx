'use client'

import { Heading, Link, List, Stack } from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { SiteSearch } from '../../site-chrome/site-search/site-search.tsx'

export interface StatusPagesProps {
  /** `not-found` is the 404, `server-error` the 500, `unavailable` a service that is closed until a set time. Default `not-found`. */
  status?: 'not-found' | 'server-error' | 'unavailable' | undefined
}

/**
 * An error or closed-service page, the slot between header and footer: no breadcrumb, one narrow
 * column. The 500 has no search and no script: it must render when the data layer fails. Example
 * text is English and fictional (Kvirnby municipality).
 */
export function StatusPages({ status = 'not-found' }: StatusPagesProps) {
  return (
    <PageFrame.Main size="form">
      <Stack className="kv-stack--gap-8">
        {status === 'not-found' ? (
          <>
            <Heading as="h1">Page not found</Heading>
            <p className="kv-lead">
              The address may be mistyped, or the page may have moved or been removed.
            </p>
            <Stack className="kv-stack--gap-3">
              <Heading as="h2" size="heading-3">
                What you can do
              </Heading>
              <List.Root>
                <List.Item>Check that the address is spelled correctly.</List.Item>
                <List.Item>Search for the page.</List.Item>
                <List.Item>Go to the start page and look for it there.</List.Item>
              </List.Root>
              <SiteSearch action="#search" label="Search for a page">
                Search
              </SiteSearch>
            </Stack>
            <Stack className="kv-stack--gap-3">
              <Heading as="h2" size="heading-3">
                Other places to go
              </Heading>
              <List.Root>
                <List.Item>
                  <Link.Root href="#start">Start page</Link.Root>
                </List.Item>
                <List.Item>
                  <Link.Root href="#contact">Contact us</Link.Root>
                </List.Item>
              </List.Root>
            </Stack>
          </>
        ) : null}
        {status === 'server-error' ? (
          <>
            <Heading as="h1">Something went wrong on our side</Heading>
            <p className="kv-lead">
              The page could not be shown. Nothing you did caused this. Try again in a few minutes.
            </p>
            <Stack className="kv-stack--gap-3">
              <Heading as="h2" size="heading-3">
                If it is urgent
              </Heading>
              <p>
                Call the contact centre on <a href="tel:+46000000000">000 000 00 00</a>, Monday to
                Friday, 8 to 16.
              </p>
            </Stack>
          </>
        ) : null}
        {status === 'unavailable' ? (
          <>
            <Heading as="h1">The service is closed for maintenance</Heading>
            <p className="kv-lead">
              You can use it again from{' '}
              <time dateTime="2026-10-13T08:00">Tuesday 13 October 2026 at 08:00</time>.
            </p>
            <Stack className="kv-stack--gap-3">
              <Heading as="h2" size="heading-3">
                Other ways to do it
              </Heading>
              <List.Root>
                <List.Item>
                  <Link.Root href="#paper-form">Use the paper form</Link.Root>
                </List.Item>
                <List.Item>
                  <Link.Root href="#contact">Contact us</Link.Root>
                </List.Item>
              </List.Root>
            </Stack>
          </>
        ) : null}
      </Stack>
    </PageFrame.Main>
  )
}
