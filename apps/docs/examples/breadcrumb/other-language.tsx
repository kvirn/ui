'use client'
import { sv } from '@kvirn-ui/i18n/sv'
import { Breadcrumb, KvirnProvider, useLocale } from '@kvirn-ui/react'
import { useBreadcrumbTexts } from './texts.ts'

function SwedishTrail() {
  const { localeProps } = useLocale()
  const { texts } = useBreadcrumbTexts()
  return (
    <div {...localeProps}>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#start">{texts.start}</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#children">{texts.children}</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current>{texts.preschool}</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  )
}

// On a site that is in Swedish throughout, the one provider at the top has this locale and
// messages, and no nested provider is needed.
export function OtherLanguageBreadcrumb() {
  return (
    <KvirnProvider locale="sv-FI" messages={sv}>
      <SwedishTrail />
    </KvirnProvider>
  )
}
