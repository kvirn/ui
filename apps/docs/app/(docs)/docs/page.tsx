import {
  Heading,
  Link,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { CodeBlock } from '../../../components/code-block.tsx'
import { PageWithContents } from '../../../components/page-contents.tsx'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: messages.docs.nav.getStarted }),
}

const text = messages.docs.getStartedPage

const packageText = text.packages
const packageRows = [
  { name: '@kvirn-ui/react', purpose: packageText.react, install: packageText.withTheOthers },
  { name: '@kvirn-ui/i18n', purpose: packageText.i18n, install: packageText.withTheOthers },
  { name: '@kvirn-ui/theme', purpose: packageText.theme, install: packageText.withTheOthers },
  { name: '@kvirn-ui/core', purpose: packageText.core, install: packageText.comesWithReact },
]

export default function GetStartedPage() {
  return (
    <PageWithContents
      title={messages.docs.nav.getStarted}
      lead={text.lead}
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
          id: 'packages',
          label: packageText.label,
          content: (
            <>
              <p>{packageText.intro}</p>
              <TableScrollRegion aria-label={packageText.caption}>
                <TableRoot
                  className="kv-table--card kv-table--striped"
                  aria-label={packageText.caption}
                >
                  <TableHead>
                    <TableRow>
                      <TableColumnHeader>{packageText.package}</TableColumnHeader>
                      <TableColumnHeader>{packageText.purpose}</TableColumnHeader>
                      <TableColumnHeader>{packageText.install}</TableColumnHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packageRows.map((row) => (
                      <TableRow key={row.name}>
                        <TableRowHeader>
                          <code>{row.name}</code>
                        </TableRowHeader>
                        <TableCell>{row.purpose}</TableCell>
                        <TableCell>{row.install}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableRowHeader>
                        <code>@kvirn-ui/map</code>
                      </TableRowHeader>
                      <TableCell>
                        {packageText.map} <Link href="/components/map">{packageText.mapLink}</Link>
                      </TableCell>
                      <TableCell>
                        {packageText.separate}: <code>pnpm add @kvirn-ui/map</code>{' '}
                        {packageText.andMapEngine}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableRowHeader>
                        <code>@kvirn-ui/rich-text</code>
                      </TableRowHeader>
                      <TableCell>
                        {packageText.richText}{' '}
                        <Link href="/components/rich-text-editor">{packageText.richTextLink}</Link>
                      </TableCell>
                      <TableCell>
                        {packageText.separate}: <code>pnpm add @kvirn-ui/rich-text</code>{' '}
                        {packageText.andTiptap}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </TableRoot>
              </TableScrollRegion>
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
