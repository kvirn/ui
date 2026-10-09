'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

export function ArticleProse() {
  const { texts, textLang } = useProseTexts()
  return (
    <Prose as="article" lang={textLang}>
      <p className="kv-lead">{texts.article.lead}</p>
      <h2>{texts.article.heading}</h2>
      <p>{texts.article.intro}</p>
      <ul>
        {texts.article.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Prose>
  )
}
