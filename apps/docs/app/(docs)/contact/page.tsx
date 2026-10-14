import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { ContactForm } from '../../../components/contact-form.tsx'
import { PageWithContents } from '../../../components/page-contents.tsx'
import { messages } from '../../../messages/en.ts'
import { homeMessages } from '../../../messages/home.ts'
import { sendMessage } from './actions.ts'

const text = messages.docs.contactPage
const contact = homeMessages.contact

export const metadata: Metadata = {
  title: messages.docs.meta.title({ page: text.title }),
}

export default function ContactPage() {
  return (
    <PageWithContents
      title={text.title}
      lead={text.lead}
      sections={[
        {
          id: 'form',
          label: text.form.label,
          content: <ContactForm action={sendMessage} />,
        },
        {
          id: 'address',
          label: text.address.label,
          content: (
            <p>
              {text.address.prefix} <strong>{contact.email}</strong>.{' '}
              <Link href={`mailto:${contact.email}`}>{text.address.link}</Link>
            </p>
          ),
        },
        {
          id: 'handling',
          label: text.handling.label,
          content: (
            <p>
              {text.handling.body} <Link href="/privacy">{text.handling.privacyLink}</Link>
            </p>
          ),
        },
      ]}
    />
  )
}
