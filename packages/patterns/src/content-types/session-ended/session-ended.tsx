'use client'

import { Heading, Stack } from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { ServiceLink } from '../../navigation-and-promotion/service-link/service-link.tsx'

export interface SessionEndedProps {
  /** Whether the answers survived the sign-out. Default `saved`. */
  answers?: 'saved' | 'not-saved' | undefined
}

/**
 * The page a resident lands on when the session ends, the slot between header and footer: `h1`,
 * whether the answers were saved, and a link to sign in again. No breadcrumb. Example text is
 * English and fictional (Kvirnby municipality).
 */
export function SessionEnded({ answers = 'saved' }: SessionEndedProps) {
  return (
    <PageFrame.Main size="reading">
      <Stack className="kv-stack--gap-6">
        <Heading as="h1">You have been signed out</Heading>
        <p className="kv-lead">
          {answers === 'saved'
            ? 'You were inactive for a while, so we signed you out to keep your information safe. Your answers are saved. Sign in again to carry on where you stopped.'
            : 'You were inactive for a while, so we signed you out to keep your information safe. Your latest answers were not saved. Sign in again and check the last page you filled in.'}
        </p>
        <ServiceLink.Root>
          <ServiceLink.Link href="#sign-in">Sign in again</ServiceLink.Link>
        </ServiceLink.Root>
      </Stack>
    </PageFrame.Main>
  )
}
