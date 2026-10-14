'use client'
import { Button, Heading, useRouteFocus } from '@kvirn-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useRouteFocusTexts } from './texts.ts'

export function AnnouncedPage() {
  const { texts } = useRouteFocusTexts()
  const [page, setPage] = useState<'start' | 'services'>('start')
  const [said, setSaid] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)

  // Only for this docs page: put the page's own title back when the example goes away.
  useEffect(() => {
    const original = document.title
    return () => {
      document.title = original
    }
  }, [])

  useRouteFocus({
    key: page,
    containerRef: pageRef,
    selector: 'h4',
    announce: true,
    messages: { navigated: ({ title }) => texts.navigated(title) },
  })

  const goTo = (next: 'start' | 'services') => {
    // The hook says document.title, so set it before the key changes.
    document.title = texts[next].title
    setSaid(texts.navigated(texts[next].title))
    setPage(next)
  }

  return (
    <div>
      <p>
        <Button onClick={() => goTo('start')}>{texts.toStart}</Button>{' '}
        <Button onClick={() => goTo('services')}>{texts.toServices}</Button>
      </p>
      <div ref={pageRef}>
        <Heading as="h4">{texts[page].title}</Heading>
        <p>{texts[page].body}</p>
      </div>
      {said !== '' && (
        <p>
          {texts.saidAloud} {said}
        </p>
      )}
    </div>
  )
}
