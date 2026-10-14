'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function DefaultScrollArea() {
  const { texts } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.feesLabel}>
      <table className="kv-table">
        <thead>
          <tr>
            {texts.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {texts.rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={cell} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={texts.headers[index]}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}
