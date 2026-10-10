'use client'
import { Columns, Heading, Icon, Link, LinkIcon, Stack } from '@kvirn-ui/react'
import { homeMessages } from '../../messages/home.ts'
import { CodeBlock } from '../code-block.tsx'
import { Band } from './band.tsx'

const text = homeMessages.start

export function Start() {
  return (
    <Band tone="surface" id="start" className="home-start">
      <Stack className="kv-stack--gap-4">
        <Heading as="h2" size="heading-1">
          {text.heading}
        </Heading>
        <p className="kv-lead home-lead">{text.lead}</p>
      </Stack>
      <Columns className="kv-columns--gap-8">
        <Stack className="kv-stack--gap-4">
          <Heading as="h3" size="heading-3">
            {text.hookHeading}
          </Heading>
          <CodeBlock code={text.hookCode} language="tsx" />
        </Stack>
        <Stack className="kv-stack--gap-4">
          <Heading as="h3" size="heading-3">
            {text.componentHeading}
          </Heading>
          <CodeBlock code={text.componentCode} language="tsx" />
        </Stack>
      </Columns>
      <p className="home-lead">{text.body}</p>
      <CodeBlock code={text.install} language="bash" />
      <div className="home-actions">
        <Link href="/docs" className="kv-link--service">
          <LinkIcon>
            <Icon name="arrow-forward" size="24" />
          </LinkIcon>
          {text.links.getStarted}
        </Link>
        <Link href="/components">{text.links.components}</Link>
        <Link href="/foundation/theming">{text.links.theming}</Link>
        <Link href="#contact">{text.links.contact}</Link>
      </div>
    </Band>
  )
}
