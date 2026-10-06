'use client'
import {
  Table,
  createColumnHelper,
  createLocaleSortFn,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useFormat,
  useTable,
} from '@kvirn-ui/react'
import { useMemo } from 'react'
import { cases } from './cases.ts'
import type { CaseRecord } from './cases.ts'
import { useTableTexts } from './texts.ts'

// The names are Swedish, so å, ä and ö sort after z.
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
})

export function SortableCases() {
  const { texts, textLang } = useTableTexts()
  const format = useFormat()
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof features, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name, sortFn: 'locale' }),
      column.accessor('caseNumber', { header: texts.caseNumber }),
      column.accessor('amount', {
        header: texts.amount,
        cell: (info) => format.number(info.getValue()),
      }),
      column.accessor('handler', { header: texts.handler, enableSorting: false }),
    ])
  }, [texts, format])
  const list = useTable({
    features,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    initialState: { sorting: [{ id: 'name', desc: false }] },
  })
  return (
    <Table.ScrollRegion table={list} lang={textLang}>
      <Table.Root table={list}>
        <Table.Caption>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  header={header}
                  className={
                    header.column.id === 'amount' ? 'kv-table-column-header--numeric' : undefined
                  }
                >
                  {header.column.getCanSort() ? <Table.SortButton header={header} /> : null}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Head>
        <Table.Body>
          {(row) => (
            <Table.Row key={row.id} row={row}>
              {row.getAllCells().map((cell) => (
                <Table.Cell
                  key={cell.id}
                  cell={cell}
                  className={cell.column.id === 'amount' ? 'kv-table-cell--numeric' : undefined}
                />
              ))}
            </Table.Row>
          )}
        </Table.Body>
        <Table.Empty />
      </Table.Root>
    </Table.ScrollRegion>
  )
}
