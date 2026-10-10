'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function InsetTextProse() {
  const { texts, textLang } = useProseTexts()
  return (
    <Prose lang={textLang}>
      <p>{texts.article.lead}</p>
      <div className="kv-inset">
        <p>
          <strong>{texts.inset.lead}</strong> {texts.inset.text}
        </p>
      </div>
    </Prose>
  )
}
