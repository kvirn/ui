import {
  AlertBody,
  AlertInfo,
  AlertTitle,
  CardBody,
  CardRoot,
  GridRoot,
  Heading,
  Icon,
  LinkIcon,
  LinkRoot,
  Stack,
} from '@kvirn-ui/react'
import { arrowBack } from '@kvirn-ui/icons'
import { PageFrameMain } from '@kvirn-ui/patterns'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { referenceEserviceMessages } from '../../../../../../../messages/reference-eservice.ts'
import { isReferenceLocale } from '../../../../../../../messages/reference.ts'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return isReferenceLocale(locale) ? { title: referenceEserviceMessages[locale].signIn.title } : {}
}

// P5 in the T4 layout, composed the way the Login entry recipe is. No sign-in happens: each method links to the next step.
export default async function ReferenceDisabledParkingPermitSignInPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isReferenceLocale(locale)) {
    notFound()
  }
  const text = referenceEserviceMessages[locale].signIn
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <>
      <PageFrameMain size="form">
        <Stack className="kv-stack--gap-8">
          <LinkRoot href={href('parking/disabled-parking-permit')}>
            <LinkIcon>
              <Icon icon={arrowBack} size="24" />
            </LinkIcon>
            {text.back}
          </LinkRoot>
          <Heading as="h1">{text.heading}</Heading>
          <AlertInfo>
            <AlertTitle as="p">{text.noticeTitle}</AlertTitle>
            <AlertBody>
              <p>{text.notice}</p>
            </AlertBody>
          </AlertInfo>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.choose}
            </Heading>
            <GridRoot as="ul" className="kv-grid--fit-sm">
              {text.methods.map((method) => (
                <CardRoot as="li" key={method}>
                  <CardBody>
                    <Heading as="h3" size="heading-4">
                      <LinkRoot href={href('parking/disabled-parking-permit/apply')}>
                        {method}
                      </LinkRoot>
                    </Heading>
                  </CardBody>
                </CardRoot>
              ))}
            </GridRoot>
          </Stack>
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3">
              {text.otherHeading}
            </Heading>
            <p>
              {text.otherBody} <LinkRoot href={href('contact')}>{text.contact}</LinkRoot>
            </p>
          </Stack>
        </Stack>
      </PageFrameMain>
    </>
  )
}
