'use client'
import {
  Table,
  columnSizingFeature,
  createColumnHelper,
  createLocaleSortFn,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useFormat,
  useTable,
} from '@kvirn-ui/react'
import { useMemo } from 'react'
import { manyCases } from './cases.ts'
import type { CaseRecord } from './cases.ts'
import { useTableTexts } from './texts.ts'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
  columnSizingFeature,
})

const data = manyCases(2000)

export function LargeTable() {
  const { texts, textLang } = useTableTexts()
  const format = useFormat()
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof features, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name, sortFn: 'locale', size: 240 }),
      column.accessor('caseNumber', { header: texts.caseNumber, size: 180 }),
      column.accessor('amount', {
        header: texts.amount,
        size: 140,
        cell: (info) => format.number(info.getValue()),
      }),
    ])
  }, [texts, format])
  const list = useTable({
    features,
    columns,
    data,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    virtualize: { estimateSize: 40, overscan: 8 },
  })
  return (
    <Table.ScrollRegion table={list} lang={textLang} style={{ maxBlockSize: '20rem' }}>
      <Table.Root table={list}>
        <Table.Caption>{texts.allCases}</Table.Caption>
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
      </Table.Root>
    </Table.ScrollRegion>
  )
}
