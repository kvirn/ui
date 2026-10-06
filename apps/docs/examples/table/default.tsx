'use client'
import { Table, useFormat } from '@kvirn-ui/react'
import { useId } from 'react'
import { useTableTexts } from './texts.ts'

const payments = [
  { id: 'p1', month: 'january', date: '2026-01-23', amount: 1050 },
  { id: 'p2', month: 'february', date: '2026-02-25', amount: 1050 },
  { id: 'p3', month: 'march', date: '2026-03-25', amount: 1050 },
] as const

export function DefaultTable() {
  const { texts, textLang } = useTableTexts()
  const format = useFormat()
  const captionId = useId()
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)
  return (
    <Table.ScrollRegion aria-labelledby={captionId} lang={textLang}>
      <Table.Root>
        <Table.Caption id={captionId}>{texts.paymentsCaption}</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.ColumnHeader>{texts.month}</Table.ColumnHeader>
            <Table.ColumnHeader>{texts.payoutDate}</Table.ColumnHeader>
            <Table.ColumnHeader className="kv-table-column-header--numeric">
              {texts.amountPaid}
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {payments.map((payment) => (
            <Table.Row key={payment.id}>
              <Table.RowHeader>{texts[payment.month]}</Table.RowHeader>
              <Table.Cell>{format.date(payment.date, { dateStyle: 'short' })}</Table.Cell>
              <Table.Cell className="kv-table-cell--numeric">
                {format.number(payment.amount)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.RowHeader>{texts.total}</Table.RowHeader>
            <Table.Cell />
            <Table.Cell className="kv-table-cell--numeric">{format.number(total)}</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table.Root>
    </Table.ScrollRegion>
  )
}
