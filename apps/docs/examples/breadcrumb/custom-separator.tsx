'use client'
import { Breadcrumb, Icon } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'

export function CustomSeparator() {
  const { texts, textLang } = useBreadcrumbTexts()
  return (
    <Breadcrumb.Root
      label={texts.separatorLabel}
      separator={<Icon name="chevron-forward" />}
      lang={textLang}
    >
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#start">{texts.start}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#services">{texts.services}</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>{texts.homeCareFees}</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}
