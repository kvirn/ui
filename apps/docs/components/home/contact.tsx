'use client'
import { arrowForward } from '@kvirn-ui/icons'
import { CardBody, CardRoot, Grid, Heading, Icon, Link, LinkIcon, Stack } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { Band } from './band.tsx'

const text = homeMessages.contact

/** Three doors, none a dead end. Each leads to the contact page, where the address is. */
export function Contact() {
  const cards = [text.decide, text.build, text.licence]
  return (
    <Band tone="canvas" id="contact">
      <Heading as="h2" size="heading-1">
        {text.heading}
      </Heading>
      <Grid.Root className="kv-grid--fit-md">
        {cards.map((card) => (
          <CardRoot key={card.heading}>
            <CardBody>
              <Stack className="kv-stack--gap-4">
                <Heading as="h3" size="heading-3">
                  {card.heading}
                </Heading>
                <p>{card.body}</p>
                <p>
                  <Link href="/contact" className="kv-link--service">
                    <LinkIcon>
                      <Icon icon={arrowForward} size="24" />
                    </LinkIcon>
                    {card.link}
                  </Link>
                </p>
              </Stack>
            </CardBody>
          </CardRoot>
        ))}
      </Grid.Root>
    </Band>
  )
}
