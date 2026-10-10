import { en } from '@kvirn-ui/i18n/en'
import { PageFrame, SiteAlert } from '@kvirn-ui/patterns'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'
import { PlaceholderFooter } from '../patterns/patterns-story-support.tsx'
import { KvirnbyFooter, KvirnbyHeader, KvirnUIDocsHeader } from './kvirnby-chrome.tsx'

// The shell every content-type story shares (decision D12): skip link, header, optional site alert
// and footer. A story renders only the content type, which is what sits between header and footer.
// Story-only.

export type ShellParameters = {
  header?: 'kvirnby' | 'docs'
  current?: 'page'
  siteAlert?: boolean
}

export const withShell: Decorator = (Story, context) => {
  const {
    header = 'kvirnby',
    current,
    siteAlert = false,
  } = (context.parameters.shell ?? {}) as ShellParameters
  return (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        {header === 'docs' ? <KvirnUIDocsHeader /> : <KvirnbyHeader current={current} />}
        {siteAlert ? (
          <SiteAlert.Root>
            <SiteAlert.Title>
              Water shut off in North Kvirnby on Wednesday 14 October
            </SiteAlert.Title>
            <SiteAlert.Body>
              The water is off from 9 to 15 because of work on the water main. Fill containers in
              advance if you can.
            </SiteAlert.Body>
            <SiteAlert.Link href="#water-shut-off">
              Read more about the water shut-off
            </SiteAlert.Link>
          </SiteAlert.Root>
        ) : null}
        <Story />
        {header === 'docs' ? (
          <PlaceholderFooter>KvirnUI documentation</PlaceholderFooter>
        ) : (
          <KvirnbyFooter />
        )}
      </PageFrame.Root>
    </KvirnProvider>
  )
}
