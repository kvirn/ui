'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function ArticleProse() {
  const { texts, isFallback } = useProseTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Prose as="article">
        <p className="kv-lead">{texts.article.lead}</p>
        <h2>{texts.article.heading}</h2>
        <p>{texts.article.intro}</p>
        <ul>
          {texts.article.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Prose>
    </InEnglishWhenFallback>
  )
}
