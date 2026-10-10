import { Heading, Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { CodeBlock } from '../../components/code-block.tsx'
import { PageWithContents } from '../../components/page-contents.tsx'
import { messages } from '../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.getStarted }),
}

const text = messages.docs.getStartedPage

export default function GetStartedPage() {
  return (
    <PageWithContents
      title={messages.docs.nav.getStarted}
      lead={text.lead}
      intro={<p id="status">{text.status}</p>}
      sections={[
        {
          id: 'what-you-get',
          label: text.whatYouGet.label,
          content: <p>{text.whatYouGet.body}</p>,
        },
        {
          id: 'components',
          label: text.components.label,
          content: (
            <p>
              <Link href="/components/button">{text.components.readAboutButton}</Link>
            </p>
          ),
        },
        {
          id: 'start-here',
          label: text.startHere.label,
          content: (
            <>
              <Heading as="h3" id="installation">
                {text.startHere.installation}
              </Heading>
              <CodeBlock code="pnpm add @kvirn-ui/react @kvirn-ui/i18n" />
              <p>
                {text.startHere.themeBefore} <code>@kvirn-ui/theme</code>{' '}
                {text.startHere.themeMiddle} <code>theme.css</code> {text.startHere.themeAfter}{' '}
                <Link href="/foundation/theming">{text.startHere.themingLink}</Link>{' '}
                {text.startHere.themingAfter}
              </p>
              <CodeBlock
                code={`pnpm add @kvirn-ui/theme

import '@kvirn-ui/theme/theme.css'`}
              />
              <p>{text.startHere.importHint}</p>
            </>
          ),
        },
        {
          id: 'what-wcag-means',
          label: text.whatWcagMeans.label,
          content: <p>{text.whatWcagMeans.body}</p>,
        },
      ]}
    />
  )
}
