'use client'
import { CardBody, CardRoot, Columns, Heading, Icon, Link, LinkIcon, Stack } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { Band } from './band.tsx'

const text = homeMessages.contact

const mailto = (subject: string) => `mailto:${text.email}?subject=${encodeURIComponent(subject)}`

/** Three doors, none a dead end. Email only: no form, no third-party service. */
export function Contact() {
  const cards = [text.decide, text.build, text.licence]
  return (
    <Band tone="canvas" id="contact">
      <Heading as="h2" size="heading-1">
        {text.heading}
      </Heading>
      <Columns minColumnWidth="md" gap="6">
        {cards.map((card) => (
          <CardRoot key={card.heading}>
            <CardBody>
              <Stack gap="4">
                <Heading as="h3" size="heading-3">
                  {card.heading}
                </Heading>
                <p>{card.body}</p>
                <p>
                  <Link href={mailto(card.subject)} className="kv-link--service">
                    <LinkIcon>
                      <Icon name="arrow-forward" size={6} />
                    </LinkIcon>
                    {card.link}
                  </Link>
                </p>
              </Stack>
            </CardBody>
          </CardRoot>
        ))}
      </Columns>
    </Band>
  )
}
