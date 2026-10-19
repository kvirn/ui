'use client'
import { Button, TopBar } from '@kvirn-ui/react'
import { useTopBarTexts } from './texts.ts'

export function ButtonTool() {
  const { texts } = useTopBarTexts()
  return (
    <TopBar>
      <p>{texts.hours}</p>
      <Button className="kv-button--link" onClick={() => window.print()}>
        {texts.print}
      </Button>
    </TopBar>
  )
}
