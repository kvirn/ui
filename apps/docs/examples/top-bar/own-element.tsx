'use client'
import { Link, Navigation, useTopBar } from '@kvirn-ui/react'
import { useTopBarTexts } from './texts.ts'

export function OwnElement() {
  const { texts } = useTopBarTexts()
  const topBar = useTopBar({ variant: 'secondary' })
  return (
    <div {...topBar.topBarProps}>
      <p>{texts.intro}</p>
      <Navigation.Root label={texts.toolsOwn} className="kv-navigation--horizontal">
        <Navigation.List>
          <Navigation.Item>
            <Link.Root href="#contact">{texts.contact}</Link.Root>
          </Navigation.Item>
        </Navigation.List>
      </Navigation.Root>
    </div>
  )
}
