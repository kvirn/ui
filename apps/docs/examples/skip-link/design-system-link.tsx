'use client'
import { SkipLink } from '@kvirn-ui/react'
import type { ComponentPropsWithRef } from 'react'
import { useSkipLinkTexts } from './texts.ts'

// Stands in for your design system's link: it adds its own class and passes on every prop and the ref.
function MunicipalityLink({ className, children, ...anchorProps }: ComponentPropsWithRef<'a'>) {
  return (
    <a {...anchorProps} className={['municipality-link', className].filter(Boolean).join(' ')}>
      {children}
    </a>
  )
}

export function DesignSystemLink() {
  const { texts } = useSkipLinkTexts()
  return (
    <div>
      <p>
        <small>{texts.hint}</small>
      </p>
      <SkipLink as={MunicipalityLink} href="#skip-link-design-system" />
      <p>{texts.header}</p>
      <div id="skip-link-design-system">
        <p>{texts.designSystem}</p>
      </div>
    </div>
  )
}
