'use client'
import { Address, Heading, Link } from '@kvirn-ui/react'
import { useId } from 'react'
import { useAddressTexts } from './texts.ts'

export function ArticleContact() {
  const { texts } = useAddressTexts()
  const headingId = useId()
  return (
    <article aria-labelledby={headingId} className="kv-prose">
      <Heading as="h4" id={headingId}>
        {texts.articleHeading}
      </Heading>
      <p>{texts.articleText}</p>
      <Address>
        <strong>{texts.articleContactLabel}</strong>
        <br />
        {texts.articleOffice}
        <br />
        <Link href={texts.phoneHref}>{texts.phone}</Link>
        <br />
        <Link href={texts.emailHref}>{texts.email}</Link>
      </Address>
    </article>
  )
}
