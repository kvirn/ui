'use client'
import { chevronUp } from '@kvirn-ui/icons'
import { Button, Icon } from '@kvirn-ui/react'
import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { messages } from '../messages/en.ts'

const text = messages.docs
const viewportHeightsBeforeShown = 1.5

export function BackToTop({ mainRef }: { mainRef: RefObject<HTMLElement | null> }) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  useEffect(() => {
    const update = () =>
      setIsVisible(window.scrollY > window.innerHeight * viewportHeightsBeforeShown)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const goToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    const main = mainRef.current
    if (main !== null) {
      if (!main.hasAttribute('tabindex')) {
        main.tabIndex = -1
      }
      main.focus({ preventScroll: true })
    }
  }

  return (
    <Button
      className="docs-back-to-top"
      hidden={!isVisible && !hasFocus}
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      onClick={goToTop}
    >
      {text.backToTop}
      <Icon icon={chevronUp} />
    </Button>
  )
}
