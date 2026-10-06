'use client'
import { Button, Heading, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useRouteFocusTexts } from './texts.ts'

export function ChangePage() {
  const { texts, textLang } = useRouteFocusTexts()
  const [page, setPage] = useState<'start' | 'services'>('start')
  const pageRef = useRef<HTMLDivElement>(null)
  // The docs page already has an h1, so this example uses an h4. On your pages the default is h1.
  useRouteFocus({ key: page, containerRef: pageRef, selector: 'h4' })
  return (
    <div lang={textLang}>
      <p>
        <Button onClick={() => setPage('start')}>{texts.toStart}</Button>{' '}
        <Button onClick={() => setPage('services')}>{texts.toServices}</Button>
      </p>
      <div ref={pageRef}>
        <Heading level={4}>{texts[page].title}</Heading>
        <p>{texts[page].body}</p>
      </div>
    </div>
  )
}
