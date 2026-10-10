'use client'
import { Prose } from '@kvirn-ui/react'
import { useProseTexts } from './texts.ts'

const zoneMap =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 160'%3E%3Crect width='320' height='160' fill='%23f2f2f2'/%3E%3Crect x='24' y='40' width='272' height='96' fill='none' stroke='%23333' stroke-width='3'/%3E%3Crect x='136' y='28' width='48' height='24' fill='%23333'/%3E%3C/svg%3E"

export function ImagesAndMediaProse() {
  const { texts, textLang } = useProseTexts()
  return (
    <Prose lang={textLang}>
      <figure>
        <img src={zoneMap} width={320} height={160} alt={texts.figure.alt} />
        <figcaption>{texts.figure.caption}</figcaption>
      </figure>
      <p>{texts.figure.description}</p>
    </Prose>
  )
}
