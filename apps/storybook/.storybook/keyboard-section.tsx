import { Heading, useOf } from '@storybook/addon-docs/blocks'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import {
  parseKeyboardSection,
  splitKeyCell,
} from '../../../tooling/keyboard-docs/parse-keyboard-section.ts'
import type { KeyboardSection as ParsedSection } from '../../../tooling/keyboard-docs/parse-keyboard-section.ts'

// The Keyboard section of a Docs page. It renders the `## Keyboard`
// section of the contract that the stories file passes as `parameters.a11yContract` (a `?raw`
// import of the `<name>.a11y.md`), so the table is written once, in the contract, and tested in
// its component test. Docs strings are English, like the rest of the Docs pages: they aren't component strings.

/** `code` between backticks becomes `<code>`. */
function withInlineCode(text: string): ReactNode {
  return text
    .split('`')
    .map((part, index) =>
      index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>,
    )
}

/** `Tab / Shift+Tab` as `<kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd>`. */
function Keys({ cell }: { cell: string }) {
  return splitKeyCell(cell).map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? ' / ' : null}
      {'keys' in part
        ? part.keys.map((key, keyIndex) => (
            <Fragment key={keyIndex}>
              {keyIndex > 0 ? '+' : null}
              <kbd>{key}</kbd>
            </Fragment>
          ))
        : part.text}
    </Fragment>
  ))
}

const focusLines = [
  ['Focus strategy', 'focusStrategy'],
  ['Selection follows focus', 'selectionFollowsFocus'],
  ['Arrows wrap', 'arrowsWrap'],
  ['Shortcuts', 'shortcuts'],
] as const

/** The Keyboard section for an already parsed contract. Exported for the stories-free check of the Docs page. */
export function KeyboardSectionView({
  section,
  title = 'Keyboard',
}: {
  section: ParsedSection
  title?: string
}) {
  return (
    <div className="kv-docs-keyboard">
      <Heading>{title}</Heading>
      {section.noKeys ? (
        <p>This component has no focusable parts and handles no keys.</p>
      ) : (
        <ul>
          {focusLines.map(([label, property]) => (
            <li key={property}>
              <strong>{label}:</strong> {withInlineCode(section[property] ?? '')}
            </li>
          ))}
        </ul>
      )}
      {section.rows.length > 0 ? (
        <table>
          <caption>Keys and what they do</caption>
          <thead>
            <tr>
              <th scope="col">Key</th>
              <th scope="col">Context</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Keys cell={row.key} />
                </td>
                <td>{withInlineCode(row.context)}</td>
                <td>{withInlineCode(row.action)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

/** Added to the Docs template after Controls. Nothing when the meta has no contract. */
export function KeyboardSection() {
  const { preparedMeta } = useOf('meta', ['meta'])
  const contract: unknown = preparedMeta.parameters['a11yContract']
  if (typeof contract !== 'string') {
    return null
  }
  const { section } = parseKeyboardSection(contract)
  return section === undefined ? null : <KeyboardSectionView section={section} />
}

/** The Keyboard section of a contract given as text, for a Docs page that shows more than one (Foundation/Focus). */
export function ContractKeyboard({ contract, title }: { contract: string; title?: string }) {
  const { section } = parseKeyboardSection(contract)
  return section === undefined ? null : <KeyboardSectionView section={section} title={title} />
}
