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
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { messages } from '../messages/en.ts'
import { apiHookPart, apiPartId, apiRowId, apiStringsId } from './api-ids.ts'
import { CodeBlock } from './code-block.tsx'

const text = messages.docs.api

export interface PropRow {
  type: string
  /** Omit for a required prop. */
  default?: string
  description: string
}

/**
 * The rows of a part's own props, typed by the prop type: a prop missing from the rows, or one
 * that isn't a prop, is a type error. Pass the part's props minus the element's attributes.
 */
export function propRows<OwnProps extends object>(rows: Record<keyof OwnProps & string, PropRow>) {
  return rows
}

export interface AttributeRow {
  name: string
  values: string
  meaning: string
}

export interface ApiPart {
  /** `Tabs.Tab`: also gives the anchors (`api-tabs-tab`, `api-tabs-tab-selected`). */
  name: string
  renders: ReactNode
  props?: Readonly<Record<string, PropRow>>
  attributes?: readonly AttributeRow[]
}

/** A hook with an options table, a result table or both (a hook with no options has no table). */
export interface ApiHook {
  name: string
  /** A sentence under the heading: what the hook takes and returns when the tables don't say. */
  intro?: ReactNode
  options?: Readonly<Record<string, PropRow>>
  result?: Readonly<Record<string, PropRow>>
}

export function PropTable({
  headingId,
  rows,
  part,
}: {
  headingId: string
  rows: Readonly<Record<string, PropRow>>
  part: string
}) {
  return (
    <TableScrollRegion aria-labelledby={headingId}>
      <TableRoot aria-labelledby={headingId}>
        <TableHead>
          <TableRow>
            <TableColumnHeader>{text.prop}</TableColumnHeader>
            <TableColumnHeader>{text.type}</TableColumnHeader>
            <TableColumnHeader>{text.default}</TableColumnHeader>
            <TableColumnHeader>{text.description}</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(rows).map(([prop, row]) => (
            <TableRow key={prop}>
              <TableRowHeader id={apiRowId(part, prop)}>
                <code>{prop}</code>
              </TableRowHeader>
              <TableCell>
                <code>{row.type}</code>
              </TableCell>
              <TableCell>
                {row.default === undefined ? text.required : <code>{row.default}</code>}
              </TableCell>
              <TableCell>{row.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
  )
}

function AttributeTable({ headingId, rows }: { headingId: string; rows: readonly AttributeRow[] }) {
  return (
    <TableScrollRegion aria-labelledby={headingId}>
      <TableRoot aria-labelledby={headingId}>
        <TableHead>
          <TableRow>
            <TableColumnHeader>{text.attribute}</TableColumnHeader>
            <TableColumnHeader>{text.values}</TableColumnHeader>
            <TableColumnHeader>{text.meaning}</TableColumnHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableRowHeader>
                <code>{row.name}</code>
              </TableRowHeader>
              <TableCell>{row.values}</TableCell>
              <TableCell>{row.meaning}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </TableScrollRegion>
  )
}

/**
 * The content of the API section (docs-component-page.md §4.3): the import, one `h3` per part
 * in tree order (a child component is a part like any other), then the hook and Strings. The
 * page's `h2` comes from `ComponentPage`.
 */
export function ApiBlock({
  importLine,
  parts,
  hook,
  hooks = hook ? [hook] : [],
  strings,
}: {
  importLine: string
  parts: readonly ApiPart[]
  hook?: ApiHook
  /** Two or more hooks (`useRadioGroup` and `useRadio`): one `h3` each, in this order. */
  hooks?: readonly ApiHook[]
  strings?: ReactNode
}) {
  return (
    <>
      <CodeBlock code={importLine} />
      {parts.map((part) => {
        const headingId = apiPartId(part.name)
        return (
          <Fragment key={part.name}>
            <Heading as="h3" id={headingId}>
              {part.name}
            </Heading>
            <p>
              {text.rendersLabel} {part.renders}
            </p>
            {part.props && <PropTable headingId={headingId} rows={part.props} part={part.name} />}
            {part.attributes && <AttributeTable headingId={headingId} rows={part.attributes} />}
          </Fragment>
        )
      })}
      {hooks.map((hookApi) => (
        <Fragment key={hookApi.name}>
          <Heading as="h3" id={apiPartId(hookApi.name)}>
            {hookApi.name}
          </Heading>
          {hookApi.intro && <p>{hookApi.intro}</p>}
          {hookApi.options && (
            <>
              <p>{text.options}</p>
              <PropTable
                headingId={apiPartId(hookApi.name)}
                rows={hookApi.options}
                part={apiHookPart(hookApi.name, 'options')}
              />
            </>
          )}
          {hookApi.result && (
            <>
              <p>{text.result}</p>
              <PropTable
                headingId={apiPartId(hookApi.name)}
                rows={hookApi.result}
                part={apiHookPart(hookApi.name, 'result')}
              />
            </>
          )}
        </Fragment>
      ))}
      {strings && (
        <>
          <Heading as="h3" id={apiStringsId}>
            {text.strings}
          </Heading>
          {strings}
        </>
      )}
    </>
  )
}
