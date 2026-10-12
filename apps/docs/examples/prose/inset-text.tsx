'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function InsetTextProse() {
  const { texts, isFallback } = useProseTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Prose>
        <p>{texts.article.lead}</p>
        <div className="kv-inset">
          <p>
            <strong>{texts.inset.lead}</strong> {texts.inset.text}
          </p>
        </div>
      </Prose>
    </InEnglishWhenFallback>
  )
}
