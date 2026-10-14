'use client'

import {
  Breadcrumb,
  Card,
  Container,
  DefinitionList,
  Heading,
  Link,
  List,
  Prose,
  Stack,
  Table,
  TableOfContents,
} from '@kvirn-ui/react'
import { useRef } from 'react'
import { kvirnbyPersonalDataPurposes } from '../../fixtures/prose-pages.ts'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { PageTools } from '../../site-chrome/page-tools/page-tools.tsx'

/**
 * A privacy notice, the slot between header and footer: breadcrumb, preamble, contents, `h2`
 * sections with a table of purposes, the data protection officer as a contact card and the page
 * tools. Example text is English and fictional (Kvirnby municipality). The supervisory authority
 * section is a placeholder until a lawyer checks it.
 */
export function PrivacyPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Container size="reading">
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>How we handle personal data</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">How we handle personal data</Heading>
          <PageTools.Top contentRef={contentRef} />
          <div ref={contentRef}>
            <Stack className="kv-stack--gap-8">
              <p className="kv-lead">
                Here you read which personal data Kvirnby municipality collects, why, who sees it
                and what you can ask us to do with it.
              </p>
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-4" id="contents-title">
                  Contents
                </Heading>
                <TableOfContents.Root
                  aria-labelledby="contents-title"
                  items={[
                    { id: 'responsible', label: 'Who is responsible', level: 2 },
                    { id: 'collect', label: 'What we collect and why', level: 2 },
                    { id: 'share', label: 'Who we share it with', level: 2 },
                    { id: 'rights', label: 'Your rights', level: 2 },
                    { id: 'officer', label: 'Data protection officer', level: 2 },
                    { id: 'complain', label: 'Complain to the supervisory authority', level: 2 },
                  ]}
                />
              </Stack>
              <Prose>
                <h2 id="responsible">Who is responsible</h2>
                <p>
                  Kvirnby municipality, through its municipal board, is responsible for the personal
                  data described on this page.
                </p>
                <h2 id="collect">What we collect and why</h2>
                <p>
                  We collect only what we need for the purposes below, and we keep it no longer than
                  the table says.
                </p>
                <Table.Root>
                  <Table.Caption>
                    Purposes for which Kvirnby municipality handles personal data
                  </Table.Caption>
                  <Table.Head>
                    <Table.Row>
                      <Table.ColumnHeader>Purpose</Table.ColumnHeader>
                      <Table.ColumnHeader>Legal basis</Table.ColumnHeader>
                      <Table.ColumnHeader>How long we keep it</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {kvirnbyPersonalDataPurposes.map(({ purpose, legalBasis, keptFor }) => (
                      <Table.Row key={purpose}>
                        <Table.RowHeader>{purpose}</Table.RowHeader>
                        <Table.Cell>{legalBasis}</Table.Cell>
                        <Table.Cell>{keptFor}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
                <h2 id="share">Who we share it with</h2>
                <p>
                  We share personal data only with those who need it to do their part of the work,
                  such as the preschool your child is offered a place in. We do not sell personal
                  data.
                </p>
                <h2 id="rights">Your rights</h2>
                <p>You have the right to:</p>
                <List.Root>
                  <List.Item>ask which personal data we hold about you</List.Item>
                  <List.Item>ask us to correct data that is wrong</List.Item>
                  <List.Item>ask us to delete data we no longer need</List.Item>
                  <List.Item>ask us to limit how we use your data</List.Item>
                  <List.Item>object to how we use your data</List.Item>
                </List.Root>
              </Prose>
            </Stack>
          </div>
          <Card.Root>
            <Card.Body className="kv-prose">
              <Heading as="h2" size="heading-3" id="officer">
                Data protection officer
              </Heading>
              <p>Ask the data protection officer about how we handle your data.</p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:dataprotection@kvirnby.example">
                      dataprotection@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000002">0000-00 00 02</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
          <Prose>
            <h2 id="complain">Complain to the supervisory authority</h2>
            {/* TODO(legal-verify): name the supervisory authority and how to complain, checked by a lawyer */}
            <p>
              If you think we handle your data wrongly, you can complain to the supervisory
              authority. The authority and how to contact it are named here once a lawyer has
              checked the text.
            </p>
          </Prose>
          <PageTools.Root>
            <p className="kv-page-tools-updated">
              Last updated: <time dateTime="2026-10-02">2 October 2026</time>
            </p>
            <PageTools.CopyLink>Copy link</PageTools.CopyLink>
            <PageTools.Print>Print</PageTools.Print>
          </PageTools.Root>
        </Stack>
      </PageFrame.Main>
    </>
  )
}
