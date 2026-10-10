import { createMessageFormat } from '@kvirn-ui/core'
import { localeCodes } from '@kvirn-ui/i18n'
import type { KvirnMessages, LocaleCode, MessageFormat } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import {
  Heading,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { apiStringsId } from './api-ids.ts'

// The Strings h3 of the API (docs/design/docs-component-page.md §4.3). The catalogs are plain
// imports, so it renders in a server component with no file access.

const text = messages.docs.api
const languageNames = messages.docs.example.languages

const catalogs: Record<LocaleCode, KvirnMessages> = { sv, fi, nb, nn, en }

const formats = Object.fromEntries(
  localeCodes.map((code) => [code, createMessageFormat({ locale: code, timeZone: undefined })]),
) as Record<LocaleCode, MessageFormat>

export interface StringKeySpec<Namespace extends keyof KvirnMessages> {
  key: keyof KvirnMessages[Namespace] & string
  /** When the text is shown or announced. */
  meaning: string
  /** Sample values for a key with parameters, as the contract's example text uses them. */
  values?: Readonly<Record<string, string | number | boolean | readonly string[]>>
}

export interface StringEntry {
  namespace: string
  key: string
  /** The parameter names, empty for a key without any. */
  parameters: readonly string[]
  meaning: string
  texts: Readonly<Record<LocaleCode, string>>
}

/** One key's English text, for a page that shows an example message. */
export function stringText<Namespace extends keyof KvirnMessages>(
  namespace: Namespace,
  key: keyof KvirnMessages[Namespace] & string,
  values?: StringKeySpec<Namespace>['values'],
) {
  return stringsFromCatalog(namespace, [
    { key, meaning: '', ...(values === undefined ? {} : { values }) },
  ])[0]!.texts.en
}

/** Each key's text in all five languages, with parameters filled by core's `createMessageFormat`. */
export function stringsFromCatalog<Namespace extends keyof KvirnMessages>(
  namespace: Namespace,
  keys: readonly StringKeySpec<Namespace>[],
): StringEntry[] {
  return keys.map(({ key, meaning, values = {} }) => {
    const texts = Object.fromEntries(
      localeCodes.map((code) => {
        const message: unknown = (catalogs[code][namespace] as Record<string, unknown>)[key]
        const resolved =
          typeof message === 'function'
            ? (message as (values: object, format: MessageFormat) => string)(values, formats[code])
            : String(message)
        return [code, resolved]
      }),
    ) as Record<LocaleCode, string>
    return { namespace, key, parameters: Object.keys(values), meaning, texts }
  })
}

const stringId = (key: string) => `${apiStringsId}-${key.toLowerCase()}`

/** How to override a string: the `messages` prop on the provider or on the component. */
export function OverrideText({ component }: { component: string }) {
  const override = messages.docs.contract.announcements
  return (
    <p>
      {override.overrideWholeApp} <code>messages</code> {override.overrideTo}{' '}
      <code>KvirnProvider</code>. {override.overrideOne({ component })} <code>messages</code>{' '}
      {override.overrideProp}
    </p>
  )
}

function LanguageTable({ entry }: { entry: StringEntry }) {
  const headingId = stringId(entry.key)
  return (
    <TableScrollRegion aria-labelledby={headingId}>
      <TableRoot aria-labelledby={headingId}>
        <TableHead>
          <TableRow>
            <TableColumnHeader>{text.language}</TableColumnHeader>
            <TableColumnHeader>{text.defaultText}</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {localeCodes.map((code) => (
            <TableRow key={code}>
              <TableRowHeader lang={code}>{languageNames[code]}</TableRowHeader>
              <TableCell lang={code}>{entry.texts[code]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
  )
}

function CatalogTable({ entries }: { entries: readonly StringEntry[] }) {
  return (
    <TableScrollRegion aria-labelledby={apiStringsId}>
      <TableRoot aria-labelledby={apiStringsId}>
        <TableHead>
          <TableRow>
            <TableColumnHeader>{text.messageKey}</TableColumnHeader>
            <TableColumnHeader>{text.parameters}</TableColumnHeader>
            <TableColumnHeader>{text.englishText}</TableColumnHeader>
            <TableColumnHeader>{text.usedFor}</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.key}>
              <TableRowHeader id={stringId(entry.key)}>
                <code>{entry.key}</code>
              </TableRowHeader>
              <TableCell>
                {entry.parameters.length === 0
                  ? text.none
                  : entry.parameters.map((parameter, index) => (
                      <span key={parameter}>
                        {index > 0 ? ' ' : null}
                        <code>{parameter}</code>
                      </span>
                    ))}
              </TableCell>
              <TableCell lang="en">{entry.texts.en}</TableCell>
              <TableCell>{entry.meaning}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
  )
}

/**
 * The content of the Strings h3 (`ApiBlock`'s `strings`). `headings` gives an `h4` per key with a
 * Language and Default text table. `table` is one table of key, parameters, English text and meaning, for a large catalog.
 */
export function StringsBlock<Namespace extends keyof KvirnMessages>({
  namespace,
  keys,
  layout = 'headings',
  component,
  children,
}: {
  namespace: Namespace
  keys: readonly StringKeySpec<Namespace>[]
  layout?: 'headings' | 'table'
  /** The component's name, for the line on how to override the texts. */
  component?: string
  /** Page-specific advice that follows the intro. */
  children?: ReactNode
}) {
  const entries = stringsFromCatalog(namespace, keys)
  return (
    <>
      <p>{text.stringsIntro}</p>
      {component === undefined ? null : <OverrideText component={component} />}
      {children}
      {layout === 'table' ? (
        <CatalogTable entries={entries} />
      ) : (
        entries.map((entry) => (
          <section key={entry.key} aria-labelledby={stringId(entry.key)}>
            <Heading as="h4" id={stringId(entry.key)}>
              <code>
                {entry.namespace}.{entry.key}
              </code>
            </Heading>
            <p>{entry.meaning}</p>
            <LanguageTable entry={entry} />
          </section>
        ))
      )}
    </>
  )
}
