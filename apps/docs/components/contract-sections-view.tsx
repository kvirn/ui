import {
  Kbd,
  Prose,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableRoot,
  TableRow,
  TableRowHeader,
  TableScrollRegion,
} from '@kvirn-ui/react'
import type { HeadingTag } from '@kvirn-ui/react'
import { AnchoredHeading } from './anchored-heading.tsx'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { keyCellParts } from '../lib/contract-parser.ts'
import type {
  Contract,
  ContractAnnouncementRow,
  ContractBlock,
  ContractKeyboardRow,
} from '../lib/contract-parser.ts'
import { messages } from '../messages/en.ts'
import { CodeBlock } from './code-block.tsx'
import { Note } from './note.tsx'
import type { PageSection } from './page-contents.tsx'
import { OverrideText } from './strings-block.tsx'

// The Accessibility, Keyboard and Announcements h2s of a component page, built from its parsed
// contract (docs/design/docs-component-page.md §2, §4.1, §4.2). No file access, so it renders in
// the browser tests too; `ContractSections` reads the contract on the server.

const text = messages.docs.contract

/** The contract's announcement rows, or the page's own when the contract describes them in prose. */
function announcementsOf(contract: Contract, extraRows: readonly ContractAnnouncementRow[] = []) {
  return contract.announcements.kind === 'none' && extraRows.length > 0
    ? ({ kind: 'rows', rows: [...extraRows] } as const)
    : contract.announcements
}

/** The sections that have content, in page order, for the page's contents list. */
export function contractSectionList(
  contract: Contract,
  extraAnnouncementRows?: readonly ContractAnnouncementRow[],
): PageSection[] {
  const announcements = announcementsOf(contract, extraAnnouncementRows)
  const keyboardHeadings =
    contract.keyboard.kind === 'keys'
      ? [...contract.keyboard.before, ...contract.keyboard.after].flatMap((block) =>
          block.type === 'heading' ? [{ id: `keyboard-${block.id}`, label: block.text }] : [],
        )
      : []
  return [
    ...(contract.accessibility.length === 0
      ? []
      : [
          {
            id: 'accessibility',
            label: text.sections.accessibility,
            children: contract.accessibility.map((section) => ({
              id: section.id,
              label: section.title,
            })),
          },
        ]),
    { id: 'keyboard', label: text.sections.keyboard, children: keyboardHeadings },
    ...(announcements.kind === 'none'
      ? []
      : [
          {
            id: 'announcements',
            label: text.sections.announcements,
            children: announcements.rows.some((row) => row.messageKeys.length > 0)
              ? [{ id: 'announcements-change-the-text', label: text.announcements.overrideHeading }]
              : [],
          },
        ]),
  ]
}

const inlinePattern = /(`[^`]+`|\*\*.+?\*\*(?!\*)|\[[^\]]+\]\([^)]+\))/g

/** `code`, **bold** and [links](https://…) of a contract's text. Relative links keep only their text. */
function Inline({ source }: { source: string }): ReactNode {
  return source.split(inlinePattern).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index}>
          <Inline source={part.slice(2, -2)} />
        </strong>
      )
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link !== null) {
      const [, label = '', href = ''] = link
      return /^https?:\/\//.test(href) ? (
        <a key={index} href={href}>
          {label}
        </a>
      ) : (
        <Fragment key={index}>{label}</Fragment>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function KeyCell({ cell }: { cell: string }) {
  return keyCellParts(cell).map((part, index) => {
    if ('text' in part) {
      return <Fragment key={index}>{part.text === '–' ? text.keyboard.noKey : part.text}</Fragment>
    }
    const [only] = part.keys
    return part.keys.length === 1 ? (
      <Kbd key={index}>{only}</Kbd>
    ) : (
      <Kbd key={index}>
        {part.keys.map((key, keyIndex) => (
          <Fragment key={keyIndex}>
            {keyIndex > 0 ? '+' : null}
            <Kbd>{key}</Kbd>
          </Fragment>
        ))}
      </Kbd>
    )
  })
}

const cells = (...content: ReactNode[]) => content

/** A table in its scroll region, both named by the heading above them. */
function DataTable({
  labelledBy,
  columns,
  rows,
}: {
  labelledBy: string
  columns: readonly string[]
  rows: readonly (readonly ReactNode[])[]
}) {
  return (
    <TableScrollRegion aria-labelledby={labelledBy}>
      <TableRoot aria-labelledby={labelledBy}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableColumnHeader key={index}>{column}</TableColumnHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((cells, rowIndex) => (
            <TableRow key={rowIndex}>
              {cells.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <TableRowHeader key={cellIndex}>{cell}</TableRowHeader>
                ) : (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
  )
}

function Blocks({
  blocks,
  labelledBy,
  headingTag,
  idPrefix,
}: {
  blocks: readonly ContractBlock[]
  labelledBy: string
  headingTag: HeadingTag
  idPrefix: string
}) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index}>
            <Inline source={block.text} />
          </p>
        )
      case 'list':
        return (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline source={item} />
              </li>
            ))}
          </ul>
        )
      case 'table':
        return (
          <DataTable
            key={index}
            labelledBy={labelledBy}
            columns={block.columns.map((column) => column.replace(/\s*\(`[^`]*`\)/, ''))}
            rows={block.rows.map((row) =>
              row.map((cell, cellIndex) => <Inline key={cellIndex} source={cell} />),
            )}
          />
        )
      case 'heading':
        return (
          <AnchoredHeading key={index} as={headingTag} id={`${idPrefix}-${block.id}`}>
            {block.text}
          </AnchoredHeading>
        )
    }
  })
}

function KeyboardTable({ rows }: { rows: readonly ContractKeyboardRow[] }) {
  return (
    <DataTable
      labelledBy="keyboard"
      columns={[text.keyboard.key, text.keyboard.where, text.keyboard.whatHappens]}
      rows={rows.map((row) =>
        cells(
          <KeyCell cell={row.key} />,
          <Inline source={row.where} />,
          <>
            <Inline source={row.action} />
            <br />
            {text.keyboard.test} <code>{row.test}</code>
          </>,
        ),
      )}
    />
  )
}

const politenessLabel = (politeness: ContractAnnouncementRow['politeness']) =>
  politeness === 'polite'
    ? text.announcements.polite
    : politeness === 'assertive'
      ? text.announcements.assertive
      : text.announcements.politeOrAssertive

const lowerFirst = (name: string) => `${name.charAt(0).toLowerCase()}${name.slice(1)}`

const quote = (value: string) => `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

/** The override of the first announced key, as a provider line. */
function overrideExample(row: ContractAnnouncementRow, namespace: string) {
  const [first = ''] = row.messageKeys
  const [keyNamespace, key] = first.includes('.') ? first.split('.') : [namespace, first]
  return `<KvirnProvider messages={{ ${keyNamespace}: { ${key}: ${quote(row.example ?? '…')} } }}>`
}

export function ContractSectionsView({
  contract,
  extraAnnouncementRows,
  messageNamespace = lowerFirst(contract.name),
  linkToStrings = false,
}: {
  contract: Contract
  /** The rows to show when the contract's Announcements is prose, built from the catalog keys. */
  extraAnnouncementRows?: readonly ContractAnnouncementRow[]
  /** The component's namespace in `@kvirn-ui/i18n`, when it isn't the contract name in camelCase. */
  messageNamespace?: string
  /** The page has a Strings section, so the table links to it. */
  linkToStrings?: boolean
}) {
  const { keyboard, accessibility } = contract
  const announcements = announcementsOf(contract, extraAnnouncementRows)
  const facts =
    keyboard.kind === 'keys'
      ? (
          [
            ['focusStrategy', keyboard.focusStrategy],
            ['selectionFollowsFocus', keyboard.selectionFollowsFocus],
            ['arrowsWrap', keyboard.arrowsWrap],
            ['shortcuts', keyboard.shortcuts],
          ] as const
        ).flatMap(([name, value]) => (value === undefined ? [] : [{ name, value }]))
      : []
  return (
    <>
      {accessibility.length === 0 ? null : (
        <section aria-labelledby="accessibility">
          <AnchoredHeading as="h2" id="accessibility">
            {text.sections.accessibility}
          </AnchoredHeading>
          <Prose>
            {accessibility.map((section) => (
              <Fragment key={section.id}>
                <AnchoredHeading as="h3" id={section.id}>
                  {section.title}
                </AnchoredHeading>
                <Blocks
                  blocks={section.body}
                  labelledBy={section.id}
                  headingTag="h4"
                  idPrefix={section.id}
                />
                {section.id === 'what-it-does-for-you' && announcements.kind === 'none' ? (
                  <p>{text.accessibility.announcesNothing}</p>
                ) : null}
              </Fragment>
            ))}
          </Prose>
        </section>
      )}
      <section aria-labelledby="keyboard">
        <AnchoredHeading as="h2" id="keyboard">
          {text.sections.keyboard}
        </AnchoredHeading>
        <Prose>
          {keyboard.kind === 'none' ? (
            <p>{text.keyboard.noKeys({ component: contract.name })}</p>
          ) : (
            <>
              {facts.length === 0 ? null : (
                <dl>
                  {facts.map(({ name, value }) => (
                    <Fragment key={name}>
                      <dt>{text.keyboard[name]}</dt>
                      <dd>
                        <Inline source={value} />
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              )}
              <Blocks
                blocks={keyboard.before}
                labelledBy="keyboard"
                headingTag="h3"
                idPrefix="keyboard"
              />
              <KeyboardTable rows={keyboard.rows} />
              <Blocks
                blocks={keyboard.after}
                labelledBy="keyboard"
                headingTag="h3"
                idPrefix="keyboard"
              />
            </>
          )}
        </Prose>
      </section>
      {announcements.kind === 'none' ? null : (
        <section aria-labelledby="announcements">
          <AnchoredHeading as="h2" id="announcements">
            {text.sections.announcements}
          </AnchoredHeading>
          <Prose>
            <p>{text.announcements.intro({ component: contract.name })}</p>
            <DataTable
              labelledBy="announcements"
              columns={[
                text.announcements.when,
                text.announcements.whatItSays,
                text.announcements.messageKey,
                text.announcements.politeness,
              ]}
              rows={announcements.rows.map((row) =>
                cells(
                  <Inline source={row.event} />,
                  row.example === undefined ? null : <span lang="en">{row.example}</span>,
                  row.messageKeys.map((key, index) => (
                    <Fragment key={key}>
                      {index > 0 ? ' ' : null}
                      <code>{key}</code>
                    </Fragment>
                  )),
                  politenessLabel(row.politeness),
                ),
              )}
            />
            {linkToStrings ? (
              <p>
                <a href="#api-strings">{text.announcements.allLanguages}</a>
              </p>
            ) : null}
            {announcements.rows.some((row) => row.messageKeys.length > 0) ? (
              <>
                <AnchoredHeading as="h3" id="announcements-change-the-text">
                  {text.announcements.overrideHeading}
                </AnchoredHeading>
                <OverrideText component={contract.name} />
                <CodeBlock
                  code={overrideExample(
                    announcements.rows.find((row) => row.messageKeys.length > 0) ??
                      announcements.rows[0]!,
                    messageNamespace,
                  )}
                />
              </>
            ) : null}
            <Note kind="reminder">{messages.docs.note.announcerProvider}</Note>
          </Prose>
        </section>
      )}
    </>
  )
}
