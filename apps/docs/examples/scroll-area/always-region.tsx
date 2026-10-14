'use client'
import { ScrollArea } from '@kvirn-ui/react'
import { useScrollAreaTexts } from './texts.ts'

export function AlwaysRegion() {
  const { texts } = useScrollAreaTexts()
  return (
    <ScrollArea aria-label={texts.shortLabel} region="always">
      <table className="kv-table">
        <thead>
          <tr>
            {texts.shortHeaders.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {texts.shortRows.map(([size, fee]) => (
            <tr key={size}>
              <th scope="row">{size}</th>
              <td>{fee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}
