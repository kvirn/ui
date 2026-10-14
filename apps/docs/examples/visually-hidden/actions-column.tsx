'use client'
import { Button, VisuallyHidden } from '@kvirn-ui/react'
import { useVisuallyHiddenTexts } from './texts.ts'

export function ActionsColumn() {
  const { texts } = useVisuallyHiddenTexts()
  return (
    <table className="kv-table">
      <thead>
        <tr>
          <th scope="col">{texts.decisionHeader}</th>
          <th scope="col">{texts.dateHeader}</th>
          {/* The column holds only buttons, so it has no visible title. The header cell still
              needs text: without it a screen reader user has no name for the column. */}
          <th scope="col">
            <VisuallyHidden>{texts.actionsHeader}</VisuallyHidden>
          </th>
        </tr>
      </thead>
      <tbody>
        {texts.decisions.map((decision) => (
          <tr key={decision.id}>
            <th scope="row">{decision.title}</th>
            <td>{decision.date}</td>
            <td>
              <Button>
                {texts.download}
                <VisuallyHidden> {decision.title}</VisuallyHidden>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
