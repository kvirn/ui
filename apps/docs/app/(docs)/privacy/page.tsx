import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { PageWithContents } from '../../../components/page-contents.tsx'
import { messages } from '../../../messages/en.ts'
import { homeMessages } from '../../../messages/home.ts'

const text = messages.docs.privacyPage

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: text.title }),
}

export default function PrivacyPage() {
  return (
    <PageWithContents
      title={text.title}
      lead={text.lead}
      sections={[
        {
          id: 'controller',
          label: text.controller.label,
          content: (
            <>
              <p>{text.controller.body}</p>
              <p>
                {text.controller.emailPrefix}{' '}
                <Link href={`mailto:${homeMessages.contact.email}`}>
                  {homeMessages.contact.email}
                </Link>
              </p>
            </>
          ),
        },
        {
          id: 'does-not',
          label: text.doesNot.label,
          content: <p>{text.doesNot.body}</p>,
        },
        {
          id: 'device',
          label: text.device.label,
          content: (
            <>
              <p>{text.device.body}</p>
              <p>{text.device.reference}</p>
            </>
          ),
        },
        { id: 'logs', label: text.logs.label, content: <p>{text.logs.body}</p> },
        {
          id: 'mail',
          label: text.mail.label,
          content: (
            <>
              <p>{text.mail.body}</p>
              <p>
                {text.mail.legalBasis} <Link href={text.mail.linkHref}>{text.mail.link}</Link>
              </p>
            </>
          ),
        },
        {
          id: 'email',
          label: text.email.label,
          content: (
            <>
              <p>{text.email.body}</p>
              <p>{text.email.form}</p>
            </>
          ),
        },
        {
          id: 'rights',
          label: text.rights.label,
          content: (
            <p>
              {text.rights.body} <Link href={text.rights.imyHref}>{text.rights.imy}</Link>
            </p>
          ),
        },
        {
          id: 'updated',
          label: text.updated.label,
          content: <p>{text.updated.date}</p>,
        },
      ]}
    />
  )
}
