'use client'
import { PageFrame, PageTools, SectionNav, ServiceLink } from '@kvirn-ui/patterns'
import {
  Accordion,
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
import {
  easyToReadSwedish,
  referenceContentMessages,
} from '../../../../messages/reference-content.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'

function PageToolsFooter({ locale }: { locale: ReferenceLocale }) {
  const text = referenceContentMessages[locale]
  return (
    <PageTools.Root>
      <p className="kv-page-tools-updated">
        {text.lastUpdated} <time dateTime={text.updatedIso}>{text.updatedDate}</time>
      </p>
      <PageTools.CopyLink>{text.copyLink}</PageTools.CopyLink>
      <PageTools.Print>{text.print}</PageTools.Print>
    </PageTools.Root>
  )
}

function ContentsList({
  locale,
  items,
}: {
  locale: ReferenceLocale
  items: readonly { id: string; label: string; level: number }[]
}) {
  return (
    <Stack className="kv-stack--gap-4">
      <Heading as="h2" size="heading-4" id="contents-title">
        {referenceContentMessages[locale].contents}
      </Heading>
      <TableOfContents.Root aria-labelledby="contents-title" items={items} />
    </Stack>
  )
}

function Breadcrumbs({
  locale,
  parent,
  current,
}: {
  locale: ReferenceLocale
  parent?: { href: string; label: string } | undefined
  current: string
}) {
  const text = referenceContentMessages[locale]
  return (
    <Breadcrumb.Root label={text.youAreHere}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href={`/reference/${locale}`}>{text.start}</Breadcrumb.Link>
        </Breadcrumb.Item>
        {parent === undefined ? null : (
          <Breadcrumb.Item>
            <Breadcrumb.Link href={parent.href}>{parent.label}</Breadcrumb.Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>
          <Breadcrumb.Current>{current}</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}

export function PreschoolPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceContentMessages[locale]
  const page = text.preschool
  const office = text.preschoolOffice
  const href = (slug: string) => `/reference/${locale}/${slug}`
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Container>
        <Breadcrumbs
          locale={locale}
          parent={{ href: href('children-and-education'), label: page.parent }}
          current={page.title}
        />
      </Container>
      <PageFrame.Body>
        <PageFrame.Sidebar>
          <SectionNav.Root label={page.sectionNav}>
            <SectionNav.Trigger>{page.sectionNav}</SectionNav.Trigger>
            <SectionNav.Panel>
              <SectionNav.Link href={href('children-and-education')}>
                {page.nav.parent}
              </SectionNav.Link>
              <SectionNav.Group>
                <SectionNav.GroupLink href={href('preschool')} current="page">
                  {page.title}
                </SectionNav.GroupLink>
                <SectionNav.GroupItems>
                  <SectionNav.Link href={href('preschool/apply')}>{page.nav.apply}</SectionNav.Link>
                </SectionNav.GroupItems>
              </SectionNav.Group>
              <SectionNav.Group>
                <SectionNav.GroupLink href={href('compulsory-school')}>
                  {page.nav.primary}
                </SectionNav.GroupLink>
                <SectionNav.GroupItems>
                  <SectionNav.Link href={href('compulsory-school/primary')}>
                    {page.nav.primary}
                  </SectionNav.Link>
                </SectionNav.GroupItems>
              </SectionNav.Group>
              <SectionNav.Link href={href('upper-secondary')}>
                {page.nav.upperSecondary}
              </SectionNav.Link>
            </SectionNav.Panel>
          </SectionNav.Root>
        </PageFrame.Sidebar>
        <PageFrame.Main>
          <Stack className="kv-stack--gap-8">
            <Heading as="h1">{page.title}</Heading>
            <PageTools.Top contentRef={contentRef} />
            <div ref={contentRef}>
              <Stack className="kv-stack--gap-8">
                <p className="kv-lead">{page.lead}</p>
                <ContentsList
                  locale={locale}
                  items={[
                    { id: 'who', label: page.toc.who, level: 2 },
                    { id: 'apply', label: page.toc.apply, level: 2 },
                    { id: 'fees', label: page.toc.fees, level: 2 },
                    { id: 'faq', label: page.toc.faq, level: 2 },
                    { id: 'contact', label: page.toc.contact, level: 2 },
                    { id: 'related', label: page.toc.related, level: 2 },
                  ]}
                />
                <Prose>
                  <h2 id="who">{page.toc.who}</h2>
                  <p>{page.whoText}</p>
                  <h2 id="apply">{page.toc.apply}</h2>
                  <ol className="kv-steps">
                    {page.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <ServiceLink.Root>
                    <ServiceLink.Link href={href('preschool/apply')}>
                      {page.serviceLink}
                    </ServiceLink.Link>
                    <ServiceLink.Alternative>
                      <p>
                        {page.alternativeBefore}
                        <Link href={href('contact')}>{page.alternativeLink}</Link>
                        {page.alternativeAfter}
                      </p>
                    </ServiceLink.Alternative>
                  </ServiceLink.Root>
                  <h2 id="fees">{page.toc.fees}</h2>
                  <p>{page.feesText}</p>
                  <h2 id="faq">{page.toc.faq}</h2>
                  <Accordion.Root>
                    {page.faq.map((item) => (
                      <Accordion.Item key={item.question}>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>{item.question}</Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>{item.answer}</Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </Prose>
              </Stack>
            </div>
            <Card.Root>
              <Card.Body className="kv-prose">
                <Heading as="h2" size="heading-3" id="contact">
                  {page.toc.contact}
                </Heading>
                <p>{office.name}</p>
                <DefinitionList.Root>
                  <DefinitionList.Row>
                    <DefinitionList.Term>{text.phone}</DefinitionList.Term>
                    <DefinitionList.Description>
                      <Link href="tel:+46000000001">{office.phone}</Link>
                    </DefinitionList.Description>
                  </DefinitionList.Row>
                  <DefinitionList.Row>
                    <DefinitionList.Term>{text.email}</DefinitionList.Term>
                    <DefinitionList.Description>
                      <Link href={`mailto:${office.email}`}>{office.email}</Link>
                    </DefinitionList.Description>
                  </DefinitionList.Row>
                  <DefinitionList.Row>
                    <DefinitionList.Term>{text.phoneHours}</DefinitionList.Term>
                    <DefinitionList.Description>
                      {office.phoneHoursValue}
                    </DefinitionList.Description>
                  </DefinitionList.Row>
                </DefinitionList.Root>
              </Card.Body>
            </Card.Root>
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3" id="related">
                {page.toc.related}
              </Heading>
              <List.Root className="kv-list--gap-2">
                <List.Item>
                  <Link href={href('preschool/apply')}>{page.related.apply}</Link>
                </List.Item>
                <List.Item>
                  <Link href={href('compulsory-school/primary')}>{page.related.primary}</Link>
                </List.Item>
                <List.Item>
                  <Link href={href('contact')}>{page.related.contact}</Link>
                </List.Item>
              </List.Root>
            </Stack>
            <PageToolsFooter locale={locale} />
          </Stack>
        </PageFrame.Main>
      </PageFrame.Body>
    </>
  )
}

export function PrivacyPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceContentMessages[locale]
  const page = text.privacy
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Container size="reading">
        <Breadcrumbs locale={locale} current={page.title} />
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">{page.title}</Heading>
          <PageTools.Top contentRef={contentRef} />
          <div ref={contentRef}>
            <Stack className="kv-stack--gap-8">
              <p className="kv-lead">{page.lead}</p>
              <ContentsList
                locale={locale}
                items={[
                  { id: 'responsible', label: page.toc.responsible, level: 2 },
                  { id: 'collect', label: page.toc.collect, level: 2 },
                  { id: 'share', label: page.toc.share, level: 2 },
                  { id: 'rights', label: page.toc.rights, level: 2 },
                  { id: 'officer', label: page.toc.officer, level: 2 },
                  { id: 'complain', label: page.toc.complain, level: 2 },
                ]}
              />
              <Prose>
                <h2 id="responsible">{page.toc.responsible}</h2>
                <p>{page.responsibleText}</p>
                <h2 id="collect">{page.toc.collect}</h2>
                <p>{page.collectText}</p>
                <Table.Root>
                  <Table.Caption>{page.tableCaption}</Table.Caption>
                  <Table.Head>
                    <Table.Row>
                      <Table.ColumnHeader>{page.purposeColumn}</Table.ColumnHeader>
                      <Table.ColumnHeader>{page.basisColumn}</Table.ColumnHeader>
                      <Table.ColumnHeader>{page.keptColumn}</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {page.purposes.map(({ purpose, legalBasis, keptFor }) => (
                      <Table.Row key={purpose}>
                        <Table.RowHeader>{purpose}</Table.RowHeader>
                        <Table.Cell>{legalBasis}</Table.Cell>
                        <Table.Cell>{keptFor}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
                <h2 id="share">{page.toc.share}</h2>
                <p>{page.shareText}</p>
                <h2 id="rights">{page.toc.rights}</h2>
                <p>{page.rightsLead}</p>
                <List.Root>
                  {page.rights.map((right) => (
                    <List.Item key={right}>{right}</List.Item>
                  ))}
                </List.Root>
              </Prose>
            </Stack>
          </div>
          <Card.Root>
            <Card.Body className="kv-prose">
              <Heading as="h2" size="heading-3" id="officer">
                {page.toc.officer}
              </Heading>
              <p>{page.officerText}</p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>{text.email}</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link href={`mailto:${page.officerEmail}`}>{page.officerEmail}</Link>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>{text.phone}</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link href="tel:+46000000002">{page.officerPhone}</Link>
                  </DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
          <Prose>
            <h2 id="complain">{page.toc.complain}</h2>
            {/* TODO(legal-verify): name the supervisory authority and how to complain, checked by a lawyer */}
            <p>{page.complainText}</p>
          </Prose>
          <PageToolsFooter locale={locale} />
        </Stack>
      </PageFrame.Main>
    </>
  )
}

export function CookiesPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceContentMessages[locale]
  const page = text.cookies
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Container size="reading">
        <Breadcrumbs locale={locale} current={page.title} />
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">{page.title}</Heading>
          <PageTools.Top contentRef={contentRef} />
          <div ref={contentRef}>
            <Prose>
              <p className="kv-lead">{page.lead}</p>
              <h2>{page.storeHeading}</h2>
              <p>{page.storeText}</p>
              <p>{page.noTrackingText}</p>
              <h2>{page.changeHeading}</h2>
              <p>{page.changeText}</p>
            </Prose>
          </div>
          <PageToolsFooter locale={locale} />
        </Stack>
      </PageFrame.Main>
    </>
  )
}

export function EasyToReadPage({ locale }: { locale: ReferenceLocale }) {
  const text = referenceContentMessages[locale]
  const page = text.easyToRead
  const office = text.preschoolOffice
  if (locale !== 'sv') {
    return (
      <>
        <Container size="reading">
          <Breadcrumbs locale={locale} current={page.title} />
        </Container>
        <PageFrame.Main size="reading">
          <Stack className="kv-stack--gap-8">
            <Heading as="h1">{page.onlySwedish}</Heading>
            <Prose>
              <p className="kv-lead">{page.onlySwedishBody}</p>
              <List.Root>
                <List.Item>
                  <Link href="/reference/sv/easy-to-read" hrefLang="sv">
                    {page.swedishLink}
                  </Link>
                </List.Item>
                <List.Item>
                  <Link href={`/reference/${locale}/preschool`}>{page.preschoolLink}</Link>
                </List.Item>
              </List.Root>
            </Prose>
          </Stack>
        </PageFrame.Main>
      </>
    )
  }
  const easy = easyToReadSwedish
  return (
    <>
      <Container size="reading">
        <Breadcrumbs locale={locale} current={page.title} />
      </Container>
      <PageFrame.Main size="reading">
        <Stack className="kv-stack--gap-8">
          <Heading as="h1">{page.title}</Heading>
          <div className="kv-prose kv-prose--large">
            <p>{easy.lead}</p>
            <h2>{easy.who.heading}</h2>
            <p>{easy.who.text}</p>
            <h2>{easy.ask.heading}</h2>
            <ol className="kv-steps">
              {easy.ask.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p>{easy.ask.after}</p>
            <h2>{easy.cost.heading}</h2>
            {easy.cost.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <h2>{easy.help.heading}</h2>
            <p>{easy.help.text}</p>
          </div>
          <Card.Root>
            <Card.Body className="kv-prose kv-prose--large">
              <Heading as="h2" size="heading-3">
                {easy.help.card}
              </Heading>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>{text.phone}</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link href="tel:+46000000001">{office.phone}</Link>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>{text.email}</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link href={`mailto:${office.email}`}>{office.email}</Link>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>{text.phoneHours}</DefinitionList.Term>
                  <DefinitionList.Description>{office.phoneHoursValue}</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
            </Card.Body>
          </Card.Root>
          <PageToolsFooter locale={locale} />
        </Stack>
      </PageFrame.Main>
    </>
  )
}
