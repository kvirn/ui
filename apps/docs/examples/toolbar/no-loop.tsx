'use client'
import { Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function NoLoop() {
  const { texts } = useToolbarTexts()
  return (
    <div>
      <Toolbar.Root aria-label={texts.viewer} loop={false}>
        <Toolbar.Button>{texts.zoomOut}</Toolbar.Button>
        <Toolbar.Button>{texts.zoomIn}</Toolbar.Button>
        <Toolbar.Button>{texts.resetView}</Toolbar.Button>
        <Toolbar.Button>{texts.fullScreen}</Toolbar.Button>
      </Toolbar.Root>
      <p>{texts.endsNote}</p>
    </div>
  )
}
