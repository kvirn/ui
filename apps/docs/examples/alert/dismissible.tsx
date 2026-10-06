'use client'
import { Alert, Button, Heading } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import { useAlertTexts } from './texts.ts'

export function Dismissible() {
  const { texts, textLang } = useAlertTexts()
  const [isShown, setIsShown] = useState(true)
  const headingRef = useRef<HTMLHeadingElement>(null)
  return (
    <div lang={textLang}>
      <Heading level={3} tabIndex={-1} ref={headingRef}>
        {texts.dismissible.heading}
      </Heading>
      {isShown ? (
        <Alert.Info>
          <Alert.Title render={<p />}>{texts.dismissible.title}</Alert.Title>
          <Alert.Body>
            <p>{texts.dismissible.body}</p>
          </Alert.Body>
          <Alert.Close
            onClick={() => {
              headingRef.current?.focus()
              setIsShown(false)
            }}
          />
        </Alert.Info>
      ) : null}
      <Button onClick={() => setIsShown(true)}>{texts.dismissible.showAgain}</Button>
    </div>
  )
}
