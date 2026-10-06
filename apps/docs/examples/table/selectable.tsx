'use client'
import {
  Table,
  createColumnHelper,
  createLocaleSortFn,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useFormat,
  useTable,
} from '@kvirn-ui/react'
import { useMemo } from 'react'
import { cases } from './cases.ts'
import type { CaseRecord } from './cases.ts'
import { useTableTexts } from './texts.ts'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { locale: createLocaleSortFn('sv') },
  rowSelectionFeature,
})

export function SelectableCases() {
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
    ])
  }, [texts, format])
  const list = useTable({
    features,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
    initialState: { rowSelection: { c1: true, c3: true } },
  })
  return (
    <Table.ScrollRegion table={list} lang={textLang}>
      <Table.Root table={list}>
        <Table.Caption>{texts.casesCaption}</Table.Caption>
        <Table.Head>
          {list.table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
              <Table.ColumnHeader>
                <Table.SelectAllCheckbox />
              </Table.ColumnHeader>
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
              <Table.Cell>
                <Table.SelectCheckbox row={row} />
              </Table.Cell>
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
