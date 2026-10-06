'use client'
import {
  Table,
  createColumnHelper,
  createExpandedRowModel,
  rowExpandingFeature,
  tableFeatures,
  useFormat,
  useTable,
} from '@kvirn-ui/react'
import { useMemo } from 'react'
import { cases } from './cases.ts'
import type { CaseRecord } from './cases.ts'
import { useTableTexts } from './texts.ts'

const features = tableFeatures({
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
})

export function ExpandableCases() {
  const { texts, textLang } = useTableTexts()
  const format = useFormat()
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof features, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name }),
      column.accessor('caseNumber', { header: texts.caseNumber }),
      column.accessor('amount', {
        header: texts.amount,
        cell: (info) => format.number(info.getValue()),
      }),
    ])
  }, [texts, format])
  const list = useTable({
    features,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    getRowCanExpand: () => true,
    rowHeader: 'name',
    initialState: { expanded: { c2: true } },
  })
  return (
    <Table.ScrollRegion table={list} lang={textLang}>
      <Table.Root table={list}>
        <Table.Caption>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <span className="kv-table-visually-hidden">{list.expandButtonText}</span>
              </Table.ColumnHeader>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
                  }
                />
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>
          {(row) => {
            const record = list.table.getRow(row.id).original
            return (
              <>
                <Table.Row key={row.id} row={row}>
                  <Table.Cell>
                    <Table.ExpandButton row={row} />
                  </Table.Cell>
                  {row.getAllCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      cell={cell}
                      className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                    />
                  ))}
                </Table.Row>
                <Table.DetailRow row={row}>
                  <dl>
                    <dt>{texts.handlerLabel}</dt>
                    <dd>{record.handler}</dd>
                    <dt>{texts.decisionLabel}</dt>
                    <dd>{record.decision}</dd>
                  </dl>
                </Table.DetailRow>
              </>
            )
          }}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}
