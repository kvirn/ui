'use client'
import { Table, createColumnHelper, tableFeatures, useTable } from '@kvirn-ui/react'
import { useMemo } from 'react'
import type { CaseRecord } from './cases.ts'
import { useTableTexts } from './texts.ts'

const features = tableFeatures({})

export function EmptyCases() {
  const { texts, textLang } = useTableTexts()
  const columns = useMemo(() => {
    const column = createColumnHelper<typeof features, CaseRecord>()
    return column.columns([
      column.accessor('name', { header: texts.name }),
      column.accessor('caseNumber', { header: texts.caseNumber }),
    ])
  }, [texts])
  const list = useTable({
    features,
    columns,
    data: [],
    getRowId: (record) => record.id,
    rowHeader: 'name',
  })
  return (
    <Table.ScrollRegion table={list} lang={textLang}>
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
        <Table.Body>{() => null}</Table.Body>
        <Table.Empty>{texts.emptyCases}</Table.Empty>
      </Table.Root>
    </Table.ScrollRegion>
  )
}
