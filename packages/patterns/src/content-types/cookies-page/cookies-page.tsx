'use client'

import { Breadcrumb, Container, Heading, Link, Prose, Stack } from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { PageTools } from '../../site-chrome/page-tools/page-tools.tsx'

/**
 * A cookies page for a site with no tracking, the slot between header and footer: breadcrumb, what
 * is stored on your device and how to change it, page tools. There is no consent form: nothing
 * here needs consent. Example text is English and fictional (Kvirnby municipality).
 */
export function CookiesPage() {
  return (
    <>
      <Container size="reading">
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Cookies</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">Cookies</Heading>
          <div>
            <Prose>
              <p className="kv-lead">This website sets no cookies.</p>
              <h2>What we store on your device</h2>
              <p>
                If you choose a display setting, such as a larger text size or a darker colour
                scheme, your browser remembers your choice on your device. It is stored only after
                you choose it. It is never sent to us or to anyone else.
              </p>
              <p>
                We do not use analytics, advertising or any service from another company that tracks
                you, so there is nothing to accept or decline.
              </p>
              <h2>Change or remove it</h2>
              <p>
                <Link.Root href="#display-settings">Change your display settings</Link.Root> or
                reset them to the defaults. You can also clear the site data for this website in
                your browser.
              </p>
            </Prose>
          </div>
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Last updated: <time dateTime="2026-10-02">2 October 2026</time>
            </p>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
