'use client'
import { Button, Heading, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useRouteFocusTexts } from './texts.ts'

export function HashChange() {
  const { texts, textLang } = useRouteFocusTexts()
  const [location, setLocation] = useState({ path: '/start', search: '', hash: '' })
  const pageRef = useRef<HTMLDivElement>(null)
  // The key is the path plus the search. The hash is left out, so a jump to a section moves nothing.
  useRouteFocus({ key: location.path + location.search, containerRef: pageRef, selector: 'h4' })
  return (
    <div lang={textLang}>
      <p>
        <Button onClick={() => setLocation({ path: '/services', search: '', hash: '' })}>
          {texts.toServices}
        </Button>{' '}
        <Button onClick={() => setLocation({ ...location, hash: '#details' })}>
          {texts.toDetails}
        </Button>
      </p>
      <div ref={pageRef}>
        <Heading level={4}>
          {location.path === '/start' ? texts.start.title : texts.services.title}
        </Heading>
        <p>{location.path === '/start' ? texts.start.body : texts.services.body}</p>
        {location.hash === '#details' && <p>{texts.details}</p>}
      </div>
    </div>
  )
}
