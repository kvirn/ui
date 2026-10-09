import { localeCodes } from '@kvirn-ui/i18n'
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
import { CodeBlock } from './code-block.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { PageWithContents } from './page-contents.tsx'
import { Formatting } from '../examples/locales/formatting.tsx'
import { InstanceMessages } from '../examples/locales/instance-messages.tsx'
import { messages } from '../messages/en.ts'

const languageNames = messages.docs.example.languages

const catalogImport = `import { KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'

<KvirnProvider locale="sv-SE" messages={sv}>`

const adjustCatalog = `import { defineMessages } from '@kvirn-ui/i18n'
import { sv } from '@kvirn-ui/i18n/sv'

const messages = defineMessages(sv, {
  link: { newTabNotice: '(öppnas i nytt fönster)' },
})`

const nestedOverride = `<KvirnProvider locale="sv-SE" messages={messages}>
  <KvirnProvider messages={{ link: { newTabNotice: '(extern tjänst, ny flik)' } }}>
    {/* only this section */}
  </KvirnProvider>
</KvirnProvider>`

const ownI18n = `const messages = defineMessages(sv, {
  link: { newTabNotice: () => t('kvirn.link.newTabNotice') },
})`

const withParameters = `resultCount: ({ count }, format) =>
  format.plural(count, { one: '1 träff', other: \`\${format.number(count)} träffar\` })`

const localeProps = `const { localeProps } = useLocale() // { lang: 'fi-FI', dir: 'ltr' }

<section {...localeProps}>…</section>`

const hookUse = `import { useFormat } from '@kvirn-ui/react'

const format = useFormat()
format.date(date, { dateStyle: 'long' })
format.number(amount, { style: 'currency', currency: 'SEK' })`

const serverFormat = `import { createMessageFormat } from '@kvirn-ui/react/server'

const format = createMessageFormat({ locale: 'sv-SE', timeZone: 'Europe/Stockholm' })`

const formatMethods = [
  {
    method: 'format.number(value, options?)',
    formats:
      'Intl.NumberFormat: decimals, percent, currency ({ style: "currency", currency: "SEK" }) and units.',
  },
  {
    method: 'format.date(value, options?)',
    formats:
      'Intl.DateTimeFormat: { dateStyle: "long" }, { timeStyle: "short" }, { month: "long" }.',
  },
  {
    method: 'format.list(items, options?)',
    formats: 'Intl.ListFormat: "sv, fi och en", or { type: "disjunction" } for "or".',
  },
  {
    method: 'format.plural(count, forms)',
    formats:
      "The form for the locale's plural rules: { one, other }, and zero for exactly 0. other is required.",
  },
]

export function LocalesPage({
  sources,
}: {
  sources: { formatting: string; instanceMessages: string }
}) {
  return (
    <PageWithContents
      title="Locales and strings"
      lead="KvirnUI ships its texts in six languages, and every text can be replaced for your whole app, a part of the page or a single component."
      sections={[
        {
          id: 'languages',
          label: 'The six languages',
          content: (
            <>
              <p>
                All six are first-class, and English is built in as the fallback. Import the catalog
                you need from its own path and only the catalogs you import are bundled.
              </p>
              <TableScrollRegion aria-labelledby="languages">
                <TableRoot aria-labelledby="languages">
                  <TableHead>
                    <TableRow>
                      <TableColumnHeader>Code</TableColumnHeader>
                      <TableColumnHeader>Language</TableColumnHeader>
                      <TableColumnHeader>Import</TableColumnHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {localeCodes.map((code) => (
                      <TableRow key={code}>
                        <TableRowHeader>
                          <code>{code}</code>
                        </TableRowHeader>
                        <TableCell lang={code}>{languageNames[code]}</TableCell>
                        <TableCell>
                          <code>{`@kvirn-ui/i18n/${code}`}</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </TableScrollRegion>
              <Note kind="tip">
                Northern Sámi (<code>se</code>) is not translated yet. Most of its strings are
                English placeholders, apart from the Alert and Combobox texts, which a native
                speaker should still review. Under <code>lang=&quot;se&quot;</code> those strings
                are read as English, a known issue in each contract. If a service needs Northern
                Sámi, pass your own texts for the keys you use.
              </Note>
            </>
          ),
        },
        {
          id: 'use-a-language',
          label: 'Use a language',
          content: (
            <>
              <p>
                Pass the catalog as <code>messages</code> and the matching <code>locale</code> to
                the <Link href="/foundation/kvirn-provider">KvirnProvider</Link>. Without a catalog,
                English strings are shown under a non-English <code>lang</code>, and in development
                a warning names each key.
              </p>
              <CodeBlock code={catalogImport} />
              <p>
                Set <code>&lt;html lang&gt;</code> to the same language yourself: the provider
                renders no element to carry it.
              </p>
            </>
          ),
        },
        {
          id: 'change-the-text',
          label: 'Change the text',
          content: (
            <>
              <p>The first match wins, from the most specific to the built-in text:</p>
              <ol>
                <li>
                  The children of a text part, such as{' '}
                  <code>{'<Link.NewTabNotice>(nytt fönster)</Link.NewTabNotice>'}</code>.
                </li>
                <li>
                  The component&apos;s own <code>messages</code> prop (per instance).
                </li>
                <li>
                  The nearest provider&apos;s <code>messages</code>, then its ancestors&apos;.
                </li>
                <li>Built-in English.</li>
              </ol>
              <Heading as="h3" id="per-provider">
                For the whole app or a section
              </Heading>
              <p>
                <code>defineMessages</code> builds an adjusted catalog once, with typed keys. A
                nested provider with a partial object changes only its section. A misspelt key or
                namespace is a type error.
              </p>
              <CodeBlock code={adjustCatalog} />
              <CodeBlock code={nestedOverride} />
              <Heading as="h3" id="per-instance">
                For one component
              </Heading>
              <p>
                Pass <code>messages</code> to the component. It takes the keys of that component
                only.
              </p>
              <ExampleFrame headingId="per-instance" code={sources.instanceMessages}>
                <InstanceMessages />
              </ExampleFrame>
              <Note kind="reminder">
                An empty or whitespace-only text is ignored, with a development warning, and the
                next level is used, so a name is never empty. When you change a string that is part
                of a name, keep it consistent with the visible label (WCAG 2.5.3).
              </Note>
            </>
          ),
        },
        {
          id: 'own-i18n',
          label: 'Your own translation system',
          content: (
            <>
              <p>
                Any key can be a function, so the text can come from your translation system. The
                provider re-renders when you pass new messages, for example after a language change.
              </p>
              <CodeBlock code={ownI18n} />
              <p>
                A key with parameters is always a function. It receives its values and a{' '}
                <code>format</code> helper for the active locale, the same one{' '}
                <code>useFormat()</code> returns.
              </p>
              <CodeBlock code={withParameters} />
            </>
          ),
        },
        {
          id: 'lang-on-parts',
          label: 'Parts in another language',
          content: (
            <>
              <p>
                Put <code>lang</code> on any text that is in another language than the page, so a
                screen reader switches voice (WCAG 3.1.2). Inside a provider, spread{' '}
                <code>useLocale().localeProps</code> on the element that starts the section: it
                holds the provider&apos;s <code>lang</code> and <code>dir</code>. A nested provider
                that changes language also needs that language&apos;s catalog.
              </p>
              <CodeBlock code={localeProps} />
              <p>
                This site does the same: each example sets <code>lang=&quot;en&quot;</code> on text
                that fell back to English.
              </p>
            </>
          ),
        },
        {
          id: 'formatting',
          label: 'Numbers, dates and lists',
          content: (
            <>
              <p>
                <code>useFormat()</code> writes numbers, dates, lists and plurals the way the
                nearest provider&apos;s <code>locale</code> does. You build no <code>Intl</code>{' '}
                object and keep no locale map. It is the same <code>format</code> that messages
                receive, so a number reads the same in a message and in a table cell.
              </p>
              <ExampleFrame headingId="formatting" code={sources.formatting}>
                <Formatting />
              </ExampleFrame>
              <CodeBlock code={hookUse} />
              <TableScrollRegion aria-labelledby="formatting">
                <TableRoot aria-labelledby="formatting">
                  <TableHead>
                    <TableRow>
                      <TableColumnHeader>Method</TableColumnHeader>
                      <TableColumnHeader>Formats</TableColumnHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formatMethods.map((row) => (
                      <TableRow key={row.method}>
                        <TableRowHeader>
                          <code>{row.method}</code>
                        </TableRowHeader>
                        <TableCell>{row.formats}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </TableScrollRegion>
              <ul>
                <li>
                  A <code>Date</code> or milliseconds is an instant, shown in the provider&apos;s{' '}
                  <code>timeZone</code>, or in UTC when there is none. <code>options.timeZone</code>{' '}
                  wins. Set the zone on the provider so the server and the browser agree.
                </li>
                <li>
                  A string written <code>YYYY-MM-DD</code> is a calendar date, such as a date of
                  birth: it is shown on that day in every zone. Any other string throws a{' '}
                  <code>RangeError</code>, so check a missing value yourself.
                </li>
                <li>
                  The <code>format</code> object stays the same until the locale or the time zone
                  changes, so it is safe in a dependency list. Without a provider it uses{' '}
                  <code>en</code>.
                </li>
              </ul>
              <p>
                In a server component a hook can&apos;t run. Build the same object with{' '}
                <code>createMessageFormat</code> from <code>@kvirn-ui/react/server</code>. See{' '}
                <Link href="/foundation/rendering">Rendering: server and client</Link>.
              </p>
              <CodeBlock code={serverFormat} />
            </>
          ),
        },
      ]}
    />
  )
}
