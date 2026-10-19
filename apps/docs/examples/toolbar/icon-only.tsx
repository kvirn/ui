'use client'
import { bold, image, italic, link, underline } from '@kvirn-ui/icons'
import { Icon, Toolbar } from '@kvirn-ui/react'
import { useToolbarTexts } from './texts.ts'

export function IconOnly() {
  const { texts } = useToolbarTexts()
  return (
    <Toolbar.Root aria-label={texts.formatting}>
      <Toolbar.Group aria-label={texts.textStyle}>
        <Toolbar.Toggle className="kv-button--icon-only" aria-label={texts.bold} defaultPressed>
          <Icon icon={bold} />
        </Toolbar.Toggle>
        <Toolbar.Toggle className="kv-button--icon-only" aria-label={texts.italic}>
          <Icon icon={italic} />
        </Toolbar.Toggle>
        <Toolbar.Toggle className="kv-button--icon-only" aria-label={texts.underline}>
          <Icon icon={underline} />
        </Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Group aria-label={texts.insert}>
        <Toolbar.Button className="kv-button--icon-only" aria-label={texts.link}>
          <Icon icon={link} />
        </Toolbar.Button>
        <Toolbar.Button className="kv-button--icon-only" aria-label={texts.image}>
          <Icon icon={image} />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar.Root>
  )
}
