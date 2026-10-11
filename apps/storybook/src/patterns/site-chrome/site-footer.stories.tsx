import { en } from '@kvirn-ui/i18n/en'
import { PageFrame, SiteFooter } from '@kvirn-ui/patterns'
import {
  Address,
  Columns,
  Heading,
  KvirnProvider,
  Link,
  List,
  Stack,
  DefinitionList,
} from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import contract from '../../../../../packages/patterns/src/site-chrome/site-footer/site-footer.a11y.md?raw'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Site chrome/Site footer (docs/design/storybook-patterns.md section 5.3). Each story is
// the code an adopter copies: literal JSX, literal text. A page frame around it gives the
// provider's language and a `main`.

const description = `The \`contentinfo\` landmark on every page: who to contact, the links about the website that the law and good practice ask for, and the organisation. Every group has an \`h2\`, and every list of links is a \`nav\` named by its heading.

Use it on every page after \`main\`. It has no back-to-top link (nothing is sticky, and Home scrolls up) and no social feeds: a link to the municipality's page is a plain link.

The footer holds no text of its own and owns only its frame. Everything inside is a shipped part, written as literal JSX: the contact column is a \`Heading\`, a [DefinitionList](?path=/docs/components-data-and-behaviour-definitionlist--docs) for phone, email and hours, and an [Address](?path=/docs/components-content-address--docs); each other group is a \`nav\` named by its heading around a [List](?path=/docs/components-content-list--docs) of links; the groups sit in [Columns](?path=/docs/components-layout-columns--docs).

## API

| Part | Element | Props |
| ---- | ------- | ----- |
| \`SiteFooter.Root\` | \`<footer>\` (contentinfo) with a \`Container\` | The \`<footer>\` props |
| \`SiteFooter.Organisation\` | \`<p>\` | The organisation's name and address as text |

Each part is also a flat export (\`SiteFooterRoot\`, \`SiteFooterOrganisation\`).

## Parts and gaps

Parts used: \`Section as="footer"\`, \`Container\`, \`Columns\`, \`Heading\`, \`DefinitionList\`, \`Address\`, \`Link\`, \`List\`. Gap: a Site footer block in \`@kvirn-ui/react\`.
`

const meta = {
  title: 'Patterns/Site chrome/Site footer',
  component: SiteFooter.Root,
  argTypes: {
    className: { control: false, description: 'Joins `kv-site-footer`.' },
  },
  globals: { locale: 'en' },
  parameters: {
    layout: 'fullscreen',
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta<typeof SiteFooter.Root>

export default meta
type Story = StoryObj<typeof meta>

/** The main example at the desktop width: three groups in columns and the organisation line under them. */
export const Default: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <SiteFooter.Root>
          <Columns className="kv-columns--min-sm kv-columns--gap-8">
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                Contact us
              </Heading>
              <p>
                <strong>Contact centre</strong>
              </p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:contact@kvirnby.example">
                      contact@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone hours</DefinitionList.Term>
                  <DefinitionList.Description>Weekdays 8.00–17.00</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
              <Address>
                Municipal building
                <br />
                Storgatan 1
                <br />
                123 45 Kvirnby
              </Address>
              <p>
                <Link.Root href="#report-a-fault">Report a fault</Link.Root>
              </p>
            </Stack>
            <nav aria-labelledby="footer-about">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-about">
                  About the website
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#accessibility">Accessibility statement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#report-accessibility">
                      Report an accessibility problem
                    </Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#privacy">Personal data</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#cookies">Cookies</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
            <nav aria-labelledby="footer-follow">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-follow">
                  Follow Kvirnby
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#newsletter">Newsletter</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#social-media">Kvirnby on social media</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
          </Columns>
          <SiteFooter.Organisation>
            Kvirnby municipality, Storgatan 1, 123 45 Kvirnby
          </SiteFooter.Organisation>
        </SiteFooter.Root>
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('contentinfo')).toBeVisible()
    await expect(canvas.getByRole('heading', { name: 'Contact us' })).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'About the website' })).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'Follow Kvirnby' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Report a fault' })).toBeVisible()
  },
}

/** At 320px the groups stack in DOM order, one column. */
export const Narrow: Story = {
  globals: { ...narrowGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <SiteFooter.Root>
          <Columns className="kv-columns--min-sm kv-columns--gap-8">
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                Contact us
              </Heading>
              <p>
                <strong>Contact centre</strong>
              </p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:contact@kvirnby.example">
                      contact@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone hours</DefinitionList.Term>
                  <DefinitionList.Description>Weekdays 8.00–17.00</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
              <Address>
                Municipal building
                <br />
                Storgatan 1
                <br />
                123 45 Kvirnby
              </Address>
              <p>
                <Link.Root href="#report-a-fault">Report a fault</Link.Root>
              </p>
            </Stack>
            <nav aria-labelledby="footer-about">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-about">
                  About the website
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#accessibility">Accessibility statement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#report-accessibility">
                      Report an accessibility problem
                    </Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#privacy">Personal data</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#cookies">Cookies</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
            <nav aria-labelledby="footer-follow">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-follow">
                  Follow Kvirnby
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#newsletter">Newsletter</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#social-media">Kvirnby on social media</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
          </Columns>
          <SiteFooter.Organisation>
            Kvirnby municipality, Storgatan 1, 123 45 Kvirnby
          </SiteFooter.Organisation>
        </SiteFooter.Root>
      </PageFrame.Root>
    </KvirnProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Try the keys (see Keyboard above): Tab and Shift+Tab move through the links in DOM order. */
export const Keyboard: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <SiteFooter.Root>
          <Columns className="kv-columns--min-sm kv-columns--gap-8">
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                Contact us
              </Heading>
              <p>
                <strong>Contact centre</strong>
              </p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:contact@kvirnby.example">
                      contact@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone hours</DefinitionList.Term>
                  <DefinitionList.Description>Weekdays 8.00–17.00</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
              <Address>
                Municipal building
                <br />
                Storgatan 1
                <br />
                123 45 Kvirnby
              </Address>
              <p>
                <Link.Root href="#report-a-fault">Report a fault</Link.Root>
              </p>
            </Stack>
            <nav aria-labelledby="footer-about">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-about">
                  About the website
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#accessibility">Accessibility statement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#report-accessibility">
                      Report an accessibility problem
                    </Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#privacy">Personal data</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#cookies">Cookies</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
            <nav aria-labelledby="footer-follow">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-follow">
                  Follow Kvirnby
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#newsletter">Newsletter</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#social-media">Kvirnby on social media</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
          </Columns>
          <SiteFooter.Organisation>
            Kvirnby municipality, Storgatan 1, 123 45 Kvirnby
          </SiteFooter.Organisation>
        </SiteFooter.Root>
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/** Right to left: the groups start at the right and the phone number and address keep their order. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <SiteFooter.Root>
          <Columns className="kv-columns--min-sm kv-columns--gap-8">
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                Contact us
              </Heading>
              <p>
                <strong>Contact centre</strong>
              </p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:contact@kvirnby.example">
                      contact@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone hours</DefinitionList.Term>
                  <DefinitionList.Description>Weekdays 8.00–17.00</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
              <Address>
                Municipal building
                <br />
                Storgatan 1
                <br />
                123 45 Kvirnby
              </Address>
              <p>
                <Link.Root href="#report-a-fault">Report a fault</Link.Root>
              </p>
            </Stack>
            <nav aria-labelledby="footer-about">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-about">
                  About the website
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#accessibility">Accessibility statement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#report-accessibility">
                      Report an accessibility problem
                    </Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#privacy">Personal data</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#cookies">Cookies</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
            <nav aria-labelledby="footer-follow">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-follow">
                  Follow Kvirnby
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#newsletter">Newsletter</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#social-media">Kvirnby on social media</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
          </Columns>
          <SiteFooter.Organisation>
            Kvirnby municipality, Storgatan 1, 123 45 Kvirnby
          </SiteFooter.Organisation>
        </SiteFooter.Root>
      </PageFrame.Root>
    </KvirnProvider>
  ),
}

/** Forced colours: the footer keeps its border and links are `LinkText`. */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active', ...wideGlobals },
  render: () => (
    <KvirnProvider locale="en" messages={en}>
      <PageFrame.Root>
        <PageFrame.Main>
          <h1>Welcome to Kvirnby</h1>
        </PageFrame.Main>
        <SiteFooter.Root>
          <Columns className="kv-columns--min-sm kv-columns--gap-8">
            <Stack className="kv-stack--gap-4">
              <Heading as="h2" size="heading-3">
                Contact us
              </Heading>
              <p>
                <strong>Contact centre</strong>
              </p>
              <DefinitionList.Root>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Email</DefinitionList.Term>
                  <DefinitionList.Description>
                    <Link.Root href="mailto:contact@kvirnby.example">
                      contact@kvirnby.example
                    </Link.Root>
                  </DefinitionList.Description>
                </DefinitionList.Row>
                <DefinitionList.Row>
                  <DefinitionList.Term>Phone hours</DefinitionList.Term>
                  <DefinitionList.Description>Weekdays 8.00–17.00</DefinitionList.Description>
                </DefinitionList.Row>
              </DefinitionList.Root>
              <Address>
                Municipal building
                <br />
                Storgatan 1
                <br />
                123 45 Kvirnby
              </Address>
              <p>
                <Link.Root href="#report-a-fault">Report a fault</Link.Root>
              </p>
            </Stack>
            <nav aria-labelledby="footer-about">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-about">
                  About the website
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#accessibility">Accessibility statement</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#report-accessibility">
                      Report an accessibility problem
                    </Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#privacy">Personal data</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#cookies">Cookies</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
            <nav aria-labelledby="footer-follow">
              <Stack className="kv-stack--gap-4">
                <Heading as="h2" size="heading-3" id="footer-follow">
                  Follow Kvirnby
                </Heading>
                <List.Root className="kv-list--gap-2">
                  <List.Item>
                    <Link.Root href="#newsletter">Newsletter</Link.Root>
                  </List.Item>
                  <List.Item>
                    <Link.Root href="#social-media">Kvirnby on social media</Link.Root>
                  </List.Item>
                </List.Root>
              </Stack>
            </nav>
          </Columns>
          <SiteFooter.Organisation>
            Kvirnby municipality, Storgatan 1, 123 45 Kvirnby
          </SiteFooter.Organisation>
        </SiteFooter.Root>
      </PageFrame.Root>
    </KvirnProvider>
  ),
}
