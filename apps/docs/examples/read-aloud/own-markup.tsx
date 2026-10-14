'use client'
import { useReadAloud } from '@kvirn-ui/react'
import { useRef } from 'react'
import { useReadAloudTexts } from './texts.ts'

export function OwnPlayer() {
  const { texts } = useReadAloudTexts()
  const noticeRef = useRef<HTMLParagraphElement>(null)
  const reader = useReadAloud({ contentRef: noticeRef })
  return (
    <>
      <div {...reader.rootProps}>
        {/* Without speech in the browser, a Listen button could do nothing: render only the status. */}
        {reader.isSupported ? <button {...reader.playProps}>{reader.playLabel}</button> : null}
        <span {...reader.statusProps}>{reader.statusText}</span>
      </div>
      <p ref={noticeRef}>{texts.wasteNotice}</p>
    </>
  )
}
