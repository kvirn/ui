'use client'
import { useAnnouncer } from '@kvirn-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuickExitTexts } from './texts.ts'

/**
 * Only for the examples on this page. QuickExit hides the page and empties its title before it
 * calls `navigate`, so this shows the page again and reports where the visitor would have gone.
 * Nothing leaves the docs site. Your own site leaves `navigate` out.
 */
export function useDemoLeave(): { navigate: (href: string) => void; report: ReactNode } {
  const { texts } = useQuickExitTexts()
  const { announce } = useAnnouncer()
  const [destination, setDestination] = useState<string | undefined>(undefined)
  const savedTitle = useRef('')

  useEffect(() => {
    savedTitle.current = document.title
    const observer = new MutationObserver(() => {
      if (document.title !== '') {
        savedTitle.current = document.title
      }
    })
    observer.observe(document.head, { subtree: true, childList: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  const navigate = useCallback(
    (href: string) => {
      document.documentElement.style.removeProperty('display')
      document.title = savedTitle.current
      setDestination(href)
      announce(`${texts.wouldLeave} ${href}`)
    },
    [announce, texts.wouldLeave],
  )

  const report =
    destination === undefined ? null : (
      <p>
        {texts.wouldLeave} <code>{destination}</code>
      </p>
    )
  return { navigate, report }
}
