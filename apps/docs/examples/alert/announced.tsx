'use client'
import { Alert, Button } from '@kvirn-ui/react'
import { useState } from 'react'
import { useAlertTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function Announced() {
  const { texts, isFallback } = useAlertTexts()
  const [saveCount, setSaveCount] = useState(0)
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <div>
        {saveCount === 0 ? null : (
          <Alert.Success key={saveCount} announce="polite">
            <Alert.Title as="p">{texts.saved.title}</Alert.Title>
          </Alert.Success>
        )}
        <Button className="kv-button--primary" onClick={() => setSaveCount(saveCount + 1)}>
          {texts.saved.save}
        </Button>
      </div>
    </InEnglishWhenFallback>
  )
}
