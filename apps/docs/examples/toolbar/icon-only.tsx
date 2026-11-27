'use client'
import { BoldIcon, ImageIcon, ItalicIcon, LinkIcon, UnderlineIcon } from '@kvirn/icons/react'
import { Toolbar } from '@kvirn/ui'
import { useToolbarTexts } from './texts.ts'

export function IconOnly() {
  const { texts } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.formatting}>
      <Toolbar.Group aria-label={texts.textStyle}>
        <Toolbar.Toggle className="kv-button--icon-only" aria-label={texts.bold} defaultPressed>
          <BoldIcon />
        </Toolbar.Toggle>
        <Toolbar.Toggle className="kv-button--icon-only" aria-label={texts.italic}>
          <ItalicIcon />
        </Toolbar.Toggle>
        <Toolbar.Toggle className="kv-button--icon-only" aria-label={texts.underline}>
          <UnderlineIcon />
        </Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Group aria-label={texts.insert}>
        <Toolbar.Button className="kv-button--icon-only" aria-label={texts.link}>
          <LinkIcon />
        </Toolbar.Button>
        <Toolbar.Button className="kv-button--icon-only" aria-label={texts.image}>
          <ImageIcon />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}
