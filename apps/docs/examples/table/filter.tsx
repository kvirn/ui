'use client'
import {
  Field,
  Table,
  TextInput,
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  globalFilteringFeature,
  tableFeatures,
  useTable,
} from '@kvirn-ui/react'
import { useMemo } from 'react'
import { cases } from './cases.ts'
import type { CaseRecord } from './cases.ts'
import { useTableTexts } from './texts.ts'

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
})

export function FilterableCases() {
  const { texts } = useTableTexts()
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof features, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name }),
      column.accessor('caseNumber', { header: texts.caseNumber }),
      column.accessor('handler', { header: texts.handler }),
    ])
  }, [texts])
  const list = useTable({
    features,
    columns,
    data: cases,
    getRowId: (record) => record.id,
    rowHeader: 'name',
  })
  return (
    <>
      <Field.Root>
        <Field.Label>{texts.searchCases}</Field.Label>
        <TextInput type="search" onValueChange={(value) => list.table.setGlobalFilter(value)} />
      </Field.Root>
      <Table.ScrollRegion table={list}>
        <Table.Root table={list}>
          <Table.Caption>{texts.casesCaption}</Table.Caption>
          <Table.Head>
            {list.table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} headerGroup={headerGroup}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader key={header.id} header={header} />
                ))}
              </Table.Row>
            ))}
          </Table.Head>
          <Table.Body>
            {(row) => (
              <Table.Row key={row.id} row={row}>
                {row.getAllCells().map((cell) => (
                  <Table.Cell key={cell.id} cell={cell} />
                ))}
              </Table.Row>
            )}
          </Table.Body>
          <Table.Empty>{texts.noMatchingCases}</Table.Empty>
        </Table.Root>
      </Table.ScrollRegion>
    </>
  )
}
