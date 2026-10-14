'use client'

import { Breadcrumb, Card, Container, DefinitionList, Heading, Link, Stack } from '@kvirn-ui/react'
import { PageFrame } from '../../page-frame/page-frame.tsx'
import { PageTools } from '../../site-chrome/page-tools/page-tools.tsx'

/**
 * A page in easy-to-read language, the slot between header and footer: short sentences, one idea
 * each, `h2` questions and lists, in large text. Nothing is hidden or dense, so no Accordion,
 * Table or contents list. Example text is English and fictional (Kvirnby municipality); an adopter
 * writes easy-to-read text in its own language and has people from the target group read it.
 */
export function EasyToReadPage() {
  return (
    <>
      <Container size="reading">
        <Breadcrumb.Root label="You are here">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Preschool in easy-to-read</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">Preschool in easy-to-read</Heading>
          <div className="kv-prose kv-prose--large">
            <p>Preschool is a place for children. Children play and learn there.</p>
            <h2>Who can go to preschool?</h2>
            <p>Children from 1 year old can go. The child must live in Kvirnby.</p>
            <h2>How do I ask for a place?</h2>
            <ol className="kv-steps">
              <li>Log in to My pages.</li>
              <li>Choose the preschools you like.</li>
              <li>Send your application.</li>
            </ol>
            <p>You get an answer by letter.</p>
            <h2>What does it cost?</h2>
            <p>
              It depends on how much money your home gets. It also depends on how many children you
              have.
            </p>
            <p>The most you pay is 1 645 kronor a month for one child.</p>
            <h2>Who can I ask?</h2>
            <p>You can call or write to us. We help you.</p>
          </div>
          <Card.Root>
            <Card.Body className="kv-prose kv-prose--large">
              <Heading as="h2" size="heading-3">
                Call or write to us
              </Heading>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:preschool@kvirnby.example">
                      preschool@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone hours</DefinitionList.Term>
                  <DefinitionList.Description>
                    Monday to Thursday 9.00–11.00
                  </DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
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
