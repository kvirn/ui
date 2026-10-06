'use client'
import { Alert, Button } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAlertTexts } from './texts.ts'

export function Announced() {
  const { texts, textLang } = useAlertTexts()
  const [saveCount, setSaveCount] = useState(0)
  return (
    <div lang={textLang}>
      {saveCount === 0 ? null : (
        <Alert.Success key={saveCount} announce="polite">
          <Alert.Title render={<p />}>{texts.saved.title}</Alert.Title>
        </Alert.Success>
      )}
      <Button className="kv-button--primary" onClick={() => setSaveCount(saveCount + 1)}>
        {texts.saved.save}
      </Button>
    </div>
  )
}
