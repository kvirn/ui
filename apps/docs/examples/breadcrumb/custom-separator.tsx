'use client'
import { Breadcrumb, Icon } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'
import { InEnglishWhenFallback } from '../../components/example-language.tsx'

export function CustomSeparator() {
  const { texts, isFallback } = useBreadcrumbTexts()
  return (
    <InEnglishWhenFallback isFallback={isFallback}>
      <Breadcrumb.Root label={texts.separatorLabel} separator={<Icon name="chevron-forward" />}>
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
    </InEnglishWhenFallback>
  )
}
