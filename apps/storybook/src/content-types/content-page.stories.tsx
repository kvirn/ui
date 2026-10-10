import { PageFrame, PageTools, SectionNav, ServiceLink } from '@kvirn-ui/patterns'
import {
  Accordion,
  Breadcrumb,
  Card,
  Container,
  Heading,
  Link,
  List,
  Prose,
  Stack,
  SummaryList,
  TableOfContents,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef } from 'react'
import { expectNoHorizontalOverflow } from '../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns/patterns-story-support.tsx'
import { KvirnbyFooter, KvirnbyHeader, expectPageOutline } from './kvirnby-chrome.tsx'
// Content types/Content page: a whole page in the site chrome (docs/design/storybook-patterns.md section 7).
// Story-only: the page is literal JSX of the patterns, which an adopter copies. No data objects.

const description = `A page that answers one question: what it is, who it is for, how to do it, what it costs and who to ask. The section navigation sits beside \`main\` from \`64rem\` and above it, collapsed behind a button, below it. The \`h1\` is followed by read aloud, the preamble and a contents list; the prose has \`h2\` sections, with the FAQ as an Accordion of \`h3\` triggers.

Written as literal JSX from the patterns and shipped components: [Page frame](?path=/docs/patterns-site-chrome-page-frame--docs) with its sidebar, [Breadcrumb](?path=/docs/components-navigation-breadcrumb--docs), [Section nav](?path=/docs/patterns-navigation-and-promotion-section-nav--docs), [Page tools](?path=/docs/patterns-site-chrome-page-tools--docs), [Service link](?path=/docs/patterns-navigation-and-promotion-service-link--docs), [Contact card](?path=/docs/patterns-places-and-contacts-contact-card--docs), a group of related links (a \`Heading\` and a [List](?path=/docs/components-content-list--docs)), and the library's \`TableOfContents\`, \`Prose\` and \`Accordion\`. \`TableOfContents\` takes its headings as an \`items\` prop, so the entries are written inline and must match the \`id\`s of the headings.

**Page contract.** One \`banner\`, one \`main\`, one \`contentinfo\`; one \`h1\` and no skipped heading level; the skip link is first and targets \`main\`; the breadcrumb and the section navigation are named and distinct; nothing is sticky and the sidebar is first in the DOM, so reading, focus and visual order agree. Designed and tested to meet WCAG 2.2 AA.
`

const meta = {
  title: 'Content types/Content page',
  component: PageFrame.Root,
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof PageFrame.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The page with the e-service open: the Service link is the one next step, with the other ways to apply under it. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <PageFrame.Root locale="en">
        <KvirnbyHeader />
        <Container>
          <Breadcrumb.Root label="You are here">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#children">Children and education</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Current>Preschool</Breadcrumb.Current>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Container>
        <PageFrame.Body>
          <PageFrame.Sidebar>
            <SectionNav.Root label="In this section">
              <SectionNav.Trigger>In this section</SectionNav.Trigger>
              <SectionNav.Panel>
                <SectionNav.Link href="#children">Children and education</SectionNav.Link>
                <SectionNav.Link href="#preschool" current="page">
                  Preschool
                </SectionNav.Link>
                <SectionNav.Group>
                  <SectionNav.GroupLink href="#primary">Primary school</SectionNav.GroupLink>
                  <SectionNav.GroupItems>
                    <SectionNav.Link href="#enrol">Enrol your child</SectionNav.Link>
                    <SectionNav.Link href="#meals">School meals</SectionNav.Link>
                  </SectionNav.GroupItems>
                </SectionNav.Group>
                <SectionNav.Link href="#upper-secondary">Upper secondary school</SectionNav.Link>
                <SectionNav.Link href="#adult">Adult education</SectionNav.Link>
              </SectionNav.Panel>
            </SectionNav.Root>
          </PageFrame.Sidebar>
          <PageFrame.Main>
            <Stack gap="8">
              <Heading as="h1">Preschool</Heading>
              <PageTools.Top contentRef={contentRef} />
              <div ref={contentRef}>
                <Stack gap="8">
                  <p className="kv-lead">
                    Every child from the age of one has the right to a place in preschool. Here you
                    find who can get a place, how to apply and what it costs.
                  </p>
                  <Stack gap="4">
                    <Heading as="h2" size="heading-4" id="contents-title">
                      Contents
                    </Heading>
                    <TableOfContents.Root
                      aria-labelledby="contents-title"
                      items={[
                        { id: 'who', label: 'Who can get a place?', level: 2 },
                        { id: 'apply', label: 'How to apply', level: 2 },
                        { id: 'fees', label: 'Fees', level: 2 },
                        { id: 'faq', label: 'Frequently asked questions', level: 2 },
                        { id: 'contact', label: 'Contact us', level: 2 },
                        { id: 'related', label: 'Related pages', level: 2 },
                      ]}
                    />
                  </Stack>
                  <Prose>
                    <h2 id="who">Who can get a place?</h2>
                    <p>
                      Children who live in Kvirnby can get a place in preschool from the age of one.
                      Your child has a place within four months of your application.
                    </p>
                    <h2 id="apply">How to apply</h2>
                    <ol className="kv-steps">
                      <li>Log in to My pages with your BankID.</li>
                      <li>
                        Choose the preschools you would like and the date you want the place from.
                      </li>
                      <li>Send the application. You get an answer by letter.</li>
                    </ol>
                    <ServiceLink.Root>
                      <ServiceLink.Link href="#apply">Apply for a preschool place</ServiceLink.Link>
                      <ServiceLink.Alternative>
                        <p>
                          Other ways to apply: <a href="#form">download the form</a> and hand it in
                          to the preschool office.
                        </p>
                      </ServiceLink.Alternative>
                    </ServiceLink.Root>
                    <h2 id="fees">Fees</h2>
                    <p>
                      The fee depends on your household income and on how many children you have in
                      childcare. The highest fee for the first child is 1 645 kronor a month.
                    </p>
                    <h2 id="faq">Frequently asked questions</h2>
                    <Accordion.Root>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>
                            Can I apply before my child is born?
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          No. You can apply when your child has a personal identity number, and at
                          the earliest four months before you need the place.
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>
                            What happens if I do not answer the offer?
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          The offer is withdrawn after ten days, and you will need to apply again.
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>Can I choose a preschool?</Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          You can say which preschools you prefer. We try to offer one of them, but
                          cannot promise it.
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </Prose>
                </Stack>
              </div>
              <Card.Root>
                <Card.Body className="kv-prose">
                  <Heading as="h2" size="heading-3" id="contact">
                    Contact us
                  </Heading>
                  <p>Preschool office</p>
                  <SummaryList.Root>
                    <SummaryList.Row>
                      <SummaryList.Key>Phone</SummaryList.Key>
                      <SummaryList.Value>
                        <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
                      </SummaryList.Value>
                    </SummaryList.Row>
                    <SummaryList.Row>
                      <SummaryList.Key>Email</SummaryList.Key>
                      <SummaryList.Value>
                        <Link.Root href="mailto:preschool@kvirnby.example">
                          preschool@kvirnby.example
                        </Link.Root>
                      </SummaryList.Value>
                    </SummaryList.Row>
                    <SummaryList.Row>
                      <SummaryList.Key>Phone hours</SummaryList.Key>
                      <SummaryList.Value>Monday to Thursday 9.00–11.00</SummaryList.Value>
                    </SummaryList.Row>
                  </SummaryList.Root>
                </Card.Body>
              </Card.Root>
              <Stack gap="4">
                <Heading as="h2" size="heading-3" id="related">
                  Related pages
                </Heading>
                <List.Root gap="2">
                  <List.Item>
                    <Link.Root href="#fees-page">Preschool fees</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#queue">Queue and placement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#rules">Rules and routines</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
              <PageTools.Root>
                <p className="kv-page-tools-updated">
                  Last updated: <time dateTime="2026-10-02">2 October 2026</time>
                </p>
                <PageTools.CopyLink>Copy link</PageTools.CopyLink>
                <PageTools.Print>Print</PageTools.Print>
              </PageTools.Root>
            </Stack>
          </PageFrame.Main>
        </PageFrame.Body>
        <KvirnbyFooter />
      </PageFrame.Root>
    )
  },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** The e-service is closed: the Service link is replaced by the reason and the other ways to apply, still in the same place. */
export const ServiceLinkClosed: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <PageFrame.Root locale="en">
        <KvirnbyHeader />
        <Container>
          <Breadcrumb.Root label="You are here">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#children">Children and education</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Current>Preschool</Breadcrumb.Current>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Container>
        <PageFrame.Body>
          <PageFrame.Sidebar>
            <SectionNav.Root label="In this section">
              <SectionNav.Trigger>In this section</SectionNav.Trigger>
              <SectionNav.Panel>
                <SectionNav.Link href="#children">Children and education</SectionNav.Link>
                <SectionNav.Link href="#preschool" current="page">
                  Preschool
                </SectionNav.Link>
                <SectionNav.Group>
                  <SectionNav.GroupLink href="#primary">Primary school</SectionNav.GroupLink>
                  <SectionNav.GroupItems>
                    <SectionNav.Link href="#enrol">Enrol your child</SectionNav.Link>
                    <SectionNav.Link href="#meals">School meals</SectionNav.Link>
                  </SectionNav.GroupItems>
                </SectionNav.Group>
                <SectionNav.Link href="#upper-secondary">Upper secondary school</SectionNav.Link>
                <SectionNav.Link href="#adult">Adult education</SectionNav.Link>
              </SectionNav.Panel>
            </SectionNav.Root>
          </PageFrame.Sidebar>
          <PageFrame.Main>
            <Stack gap="8">
              <Heading as="h1">Preschool</Heading>
              <PageTools.Top contentRef={contentRef} />
              <div ref={contentRef}>
                <Stack gap="8">
                  <p className="kv-lead">
                    Every child from the age of one has the right to a place in preschool. Here you
                    find who can get a place, how to apply and what it costs.
                  </p>
                  <Stack gap="4">
                    <Heading as="h2" size="heading-4" id="contents-title">
                      Contents
                    </Heading>
                    <TableOfContents.Root
                      aria-labelledby="contents-title"
                      items={[
                        { id: 'who', label: 'Who can get a place?', level: 2 },
                        { id: 'apply', label: 'How to apply', level: 2 },
                        { id: 'fees', label: 'Fees', level: 2 },
                        { id: 'faq', label: 'Frequently asked questions', level: 2 },
                        { id: 'contact', label: 'Contact us', level: 2 },
                        { id: 'related', label: 'Related pages', level: 2 },
                      ]}
                    />
                  </Stack>
                  <Prose>
                    <h2 id="who">Who can get a place?</h2>
                    <p>
                      Children who live in Kvirnby can get a place in preschool from the age of one.
                      Your child has a place within four months of your application.
                    </p>
                    <h2 id="apply">How to apply</h2>
                    <ol className="kv-steps">
                      <li>Log in to My pages with your BankID.</li>
                      <li>
                        Choose the preschools you would like and the date you want the place from.
                      </li>
                      <li>Send the application. You get an answer by letter.</li>
                    </ol>
                    <ServiceLink.Root>
                      <ServiceLink.Closed>
                        The e-service is closed 1–3 November for maintenance.
                      </ServiceLink.Closed>
                      <ServiceLink.Alternative>
                        <p>
                          Until it opens, <a href="#form">download the form</a> and hand it in to
                          the preschool office.
                        </p>
                      </ServiceLink.Alternative>
                    </ServiceLink.Root>
                    <h2 id="fees">Fees</h2>
                    <p>
                      The fee depends on your household income and on how many children you have in
                      childcare. The highest fee for the first child is 1 645 kronor a month.
                    </p>
                    <h2 id="faq">Frequently asked questions</h2>
                    <Accordion.Root>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>
                            Can I apply before my child is born?
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          No. You can apply when your child has a personal identity number, and at
                          the earliest four months before you need the place.
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>
                            What happens if I do not answer the offer?
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          The offer is withdrawn after ten days, and you will need to apply again.
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>Can I choose a preschool?</Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          You can say which preschools you prefer. We try to offer one of them, but
                          cannot promise it.
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </Prose>
                </Stack>
              </div>
              <Card.Root>
                <Card.Body className="kv-prose">
                  <Heading as="h2" size="heading-3" id="contact">
                    Contact us
                  </Heading>
                  <p>Preschool office</p>
                  <SummaryList.Root>
                    <SummaryList.Row>
                      <SummaryList.Key>Phone</SummaryList.Key>
                      <SummaryList.Value>
                        <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
                      </SummaryList.Value>
                    </SummaryList.Row>
                    <SummaryList.Row>
                      <SummaryList.Key>Email</SummaryList.Key>
                      <SummaryList.Value>
                        <Link.Root href="mailto:preschool@kvirnby.example">
                          preschool@kvirnby.example
                        </Link.Root>
                      </SummaryList.Value>
                    </SummaryList.Row>
                    <SummaryList.Row>
                      <SummaryList.Key>Phone hours</SummaryList.Key>
                      <SummaryList.Value>Monday to Thursday 9.00–11.00</SummaryList.Value>
                    </SummaryList.Row>
                  </SummaryList.Root>
                </Card.Body>
              </Card.Root>
              <Stack gap="4">
                <Heading as="h2" size="heading-3" id="related">
                  Related pages
                </Heading>
                <List.Root gap="2">
                  <List.Item>
                    <Link.Root href="#fees-page">Preschool fees</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#queue">Queue and placement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#rules">Rules and routines</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
              <PageTools.Root>
                <p className="kv-page-tools-updated">
                  Last updated: <time dateTime="2026-10-02">2 October 2026</time>
                </p>
                <PageTools.CopyLink>Copy link</PageTools.CopyLink>
                <PageTools.Print>Print</PageTools.Print>
              </PageTools.Root>
            </Stack>
          </PageFrame.Main>
        </PageFrame.Body>
        <KvirnbyFooter />
      </PageFrame.Root>
    )
  },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** A longer page: more `h2` sections and an `h3`, so the contents list nests. Nothing is sticky; the list is reached by Tab like any other. */
export const LongPage: Story = {
  globals: { ...wideGlobals },
  render: function Render() {
    const contentRef = useRef<HTMLDivElement>(null)
    return (
      <PageFrame.Root locale="en">
        <KvirnbyHeader />
        <Container>
          <Breadcrumb.Root label="You are here">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#start">Start</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#children">Children and education</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Current>Preschool</Breadcrumb.Current>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Container>
        <PageFrame.Body>
          <PageFrame.Sidebar>
            <SectionNav.Root label="In this section">
              <SectionNav.Trigger>In this section</SectionNav.Trigger>
              <SectionNav.Panel>
                <SectionNav.Link href="#children">Children and education</SectionNav.Link>
                <SectionNav.Link href="#preschool" current="page">
                  Preschool
                </SectionNav.Link>
                <SectionNav.Group>
                  <SectionNav.GroupLink href="#primary">Primary school</SectionNav.GroupLink>
                  <SectionNav.GroupItems>
                    <SectionNav.Link href="#enrol">Enrol your child</SectionNav.Link>
                    <SectionNav.Link href="#meals">School meals</SectionNav.Link>
                  </SectionNav.GroupItems>
                </SectionNav.Group>
                <SectionNav.Link href="#upper-secondary">Upper secondary school</SectionNav.Link>
                <SectionNav.Link href="#adult">Adult education</SectionNav.Link>
              </SectionNav.Panel>
            </SectionNav.Root>
          </PageFrame.Sidebar>
          <PageFrame.Main>
            <Stack gap="8">
              <Heading as="h1">Preschool</Heading>
              <PageTools.Top contentRef={contentRef} />
              <div ref={contentRef}>
                <Stack gap="8">
                  <p className="kv-lead">
                    Every child from the age of one has the right to a place in preschool. Here you
                    find who can get a place, how to apply and what it costs.
                  </p>
                  <Stack gap="4">
                    <Heading as="h2" size="heading-4" id="contents-title">
                      Contents
                    </Heading>
                    <TableOfContents.Root
                      aria-labelledby="contents-title"
                      items={[
                        { id: 'who', label: 'Who can get a place?', level: 2 },
                        { id: 'apply', label: 'How to apply', level: 2 },
                        { id: 'fees', label: 'Fees', level: 2 },
                        { id: 'hours', label: 'Opening hours and holidays', level: 2 },
                        { id: 'meals', label: 'Meals and food', level: 2 },
                        { id: 'meals-diet', label: 'Special diets', level: 3 },
                        { id: 'moving', label: 'Moving or changing preschool', level: 2 },
                        { id: 'leaving', label: 'Ending your place', level: 2 },
                        { id: 'faq', label: 'Frequently asked questions', level: 2 },
                        { id: 'contact', label: 'Contact us', level: 2 },
                        { id: 'related', label: 'Related pages', level: 2 },
                      ]}
                    />
                  </Stack>
                  <Prose>
                    <h2 id="who">Who can get a place?</h2>
                    <p>
                      Children who live in Kvirnby can get a place in preschool from the age of one.
                      Your child has a place within four months of your application.
                    </p>
                    <h2 id="apply">How to apply</h2>
                    <ol className="kv-steps">
                      <li>Log in to My pages with your BankID.</li>
                      <li>
                        Choose the preschools you would like and the date you want the place from.
                      </li>
                      <li>Send the application. You get an answer by letter.</li>
                    </ol>
                    <ServiceLink.Root>
                      <ServiceLink.Link href="#apply">Apply for a preschool place</ServiceLink.Link>
                      <ServiceLink.Alternative>
                        <p>
                          Other ways to apply: <a href="#form">download the form</a> and hand it in
                          to the preschool office.
                        </p>
                      </ServiceLink.Alternative>
                    </ServiceLink.Root>
                    <h2 id="fees">Fees</h2>
                    <p>
                      The fee depends on your household income and on how many children you have in
                      childcare. The highest fee for the first child is 1 645 kronor a month.
                    </p>
                    <h2 id="hours">Opening hours and holidays</h2>
                    <p>
                      Preschools are open on weekdays from 6.30 to 18.30. Hours vary a little
                      between preschools, so check with the preschool you have been offered.
                    </p>
                    <p>
                      The preschool is closed on public holidays and on two planning days a year.
                      Your preschool tells you the dates in good time.
                    </p>
                    <h2 id="meals">Meals and food</h2>
                    <p>
                      Breakfast, lunch and a snack are included in the fee. If your child needs
                      special food for medical reasons, ask the preschool for the form for special
                      diets.
                    </p>
                    <h3 id="meals-diet">Special diets</h3>
                    <p>
                      A certificate from a doctor or a dietitian is needed for a diet for medical
                      reasons. Religious or ethical diets are met as far as the kitchen can.
                    </p>
                    <h2 id="moving">Moving or changing preschool</h2>
                    <p>
                      If you move within Kvirnby, you can ask to change preschool. Your place is
                      kept while the request is handled. If you move away, you can keep your place
                      until the end of the month.
                    </p>
                    <h2 id="leaving">Ending your place</h2>
                    <p>
                      Give notice at least two months before the day you want the place to end.
                      Notice is given on My pages or on the form.
                    </p>
                    <h2 id="faq">Frequently asked questions</h2>
                    <Accordion.Root>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>
                            Can I apply before my child is born?
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          No. You can apply when your child has a personal identity number, and at
                          the earliest four months before you need the place.
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>
                            What happens if I do not answer the offer?
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          The offer is withdrawn after ten days, and you will need to apply again.
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item>
                        <Accordion.Heading level={3}>
                          <Accordion.Trigger>Can I choose a preschool?</Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          You can say which preschools you prefer. We try to offer one of them, but
                          cannot promise it.
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </Prose>
                </Stack>
              </div>
              <Card.Root>
                <Card.Body className="kv-prose">
                  <Heading as="h2" size="heading-3" id="contact">
                    Contact us
                  </Heading>
                  <p>Preschool office</p>
                  <SummaryList.Root>
                    <SummaryList.Row>
                      <SummaryList.Key>Phone</SummaryList.Key>
                      <SummaryList.Value>
                        <Link.Root href="tel:+46000000001">0000-00 00 01</Link.Root>
                      </SummaryList.Value>
                    </SummaryList.Row>
                    <SummaryList.Row>
                      <SummaryList.Key>Email</SummaryList.Key>
                      <SummaryList.Value>
                        <Link.Root href="mailto:preschool@kvirnby.example">
                          preschool@kvirnby.example
                        </Link.Root>
                      </SummaryList.Value>
                    </SummaryList.Row>
                    <SummaryList.Row>
                      <SummaryList.Key>Phone hours</SummaryList.Key>
                      <SummaryList.Value>Monday to Thursday 9.00–11.00</SummaryList.Value>
                    </SummaryList.Row>
                  </SummaryList.Root>
                </Card.Body>
              </Card.Root>
              <Stack gap="4">
                <Heading as="h2" size="heading-3" id="related">
                  Related pages
                </Heading>
                <List.Root gap="2">
                  <List.Item>
                    <Link.Root href="#fees-page">Preschool fees</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#queue">Queue and placement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#rules">Rules and routines</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
              <PageTools.Root>
                <p className="kv-page-tools-updated">
                  Last updated: <time dateTime="2026-10-02">2 October 2026</time>
                </p>
                <PageTools.CopyLink>Copy link</PageTools.CopyLink>
                <PageTools.Print>Print</PageTools.Print>
              </PageTools.Root>
            </Stack>
          </PageFrame.Main>
        </PageFrame.Body>
        <KvirnbyFooter />
      </PageFrame.Root>
    )
  },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
  },
}

/** 320px: the section navigation is a button above `main`; one column, no sideways scroll. */
export const Narrow: Story = {
  ...Default,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectPageOutline(canvasElement)
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Right to left: the sidebar moves to the right of `main`; DOM order is unchanged. */
export const RTL: Story = {
  ...Default,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}
