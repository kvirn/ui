import { LanguageLinks, MainMenu, SiteFooter, SiteHeader } from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import {
  Address,
  Button,
  Columns,
  Field,
  Heading,
  Link,
  List,
  Stack,
  SummaryList,
  TextInput,
} from '@kvirn-ui/react'
import { expect, within } from 'storybook/test'

// The header, footer and docs header the shell decorator (shell.tsx) puts around every
// content-type story. The Site header and Site footer stories spell the parts out; this is the
// same composition, written once. Story-only.

export function KvirnbyHeader({ current }: { current?: 'page' | undefined }) {
  return (
    <SiteHeader.Root>
      <SiteHeader.Topbar>
        <SiteHeader.Brand href="#start" current={current}>
          <SiteHeader.Logo src={kvirnbyMark} />
          Kvirnby municipality
        </SiteHeader.Brand>
        <LanguageLinks.Root label="Language">
          <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
            Svenska
          </LanguageLinks.Link>
          <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
            English
          </LanguageLinks.Link>
        </LanguageLinks.Root>
        <SiteHeader.Utility label="Shortcuts">
          <SiteHeader.UtilityLink href="#contact">Contact us</SiteHeader.UtilityLink>
          <SiteHeader.UtilityLink href="#e-services">E-services</SiteHeader.UtilityLink>
          <SiteHeader.UtilityLink href="#my-pages">My pages</SiteHeader.UtilityLink>
        </SiteHeader.Utility>
      </SiteHeader.Topbar>
      <SiteHeader.Search action="#search">
        <Field.Root className="kv-site-header-search-field">
          <Field.Label marker="none">Search the site</Field.Label>
          <TextInput type="search" name="q" autoComplete="off" />
        </Field.Root>
        <Button type="submit">Search</Button>
      </SiteHeader.Search>
      <SiteHeader.Menu>
        <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
        <SiteHeader.MenuPanel>
          <MainMenu.Root label="Main menu">
            <MainMenu.Topic>
              <MainMenu.TopicButton>Children and education</MainMenu.TopicButton>
              <MainMenu.TopicPanel>
                <MainMenu.Overview href="#children">
                  All about children and education
                </MainMenu.Overview>
                <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
                <MainMenu.Link href="#primary">Primary school</MainMenu.Link>
                <MainMenu.Link href="#upper-secondary">Upper secondary school</MainMenu.Link>
              </MainMenu.TopicPanel>
            </MainMenu.Topic>
            <MainMenu.Topic>
              <MainMenu.TopicButton>Support and care</MainMenu.TopicButton>
              <MainMenu.TopicPanel>
                <MainMenu.Overview href="#care">All about support and care</MainMenu.Overview>
                <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
                <MainMenu.Link href="#disability">Disability support</MainMenu.Link>
              </MainMenu.TopicPanel>
            </MainMenu.Topic>
            <MainMenu.Link href="#living">Living and environment</MainMenu.Link>
            <MainMenu.Link href="#culture">Culture and leisure</MainMenu.Link>
            <MainMenu.Link href="#business">Business and work</MainMenu.Link>
          </MainMenu.Root>
        </SiteHeader.MenuPanel>
      </SiteHeader.Menu>
    </SiteHeader.Root>
  )
}

export function KvirnbyFooter() {
  return (
    <SiteFooter.Root>
      <Columns className="kv-columns--min-sm kv-columns--gap-8">
        <Stack className="kv-stack--gap-4">
          <Heading as="h2" size="heading-3">
            Contact us
          </Heading>
          <p>
            <strong>Contact centre</strong>
          </p>
          <SummaryList.Root>
            <SummaryList.Row>
              <SummaryList.Key>Phone</SummaryList.Key>
              <SummaryList.Value>
                <Link.Root href="tel:+46000000000">0000-00 00 00</Link.Root>
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Email</SummaryList.Key>
              <SummaryList.Value>
                <Link.Root href="mailto:contact@kvirnby.example">contact@kvirnby.example</Link.Root>
              </SummaryList.Value>
            </SummaryList.Row>
            <SummaryList.Row>
              <SummaryList.Key>Phone hours</SummaryList.Key>
              <SummaryList.Value>Weekdays 8.00–17.00</SummaryList.Value>
            </SummaryList.Row>
          </SummaryList.Root>
          <Address>
            Municipal building
            <br />
            Storgatan 1
            <br />
            123 45 Kvirnby
          </Address>
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
  )
}

export function KvirnUIDocsHeader() {
  return (
    <SiteHeader.Root>
      <SiteHeader.Topbar>
        <SiteHeader.Brand href="#home">KvirnUI</SiteHeader.Brand>
      </SiteHeader.Topbar>
      <SiteHeader.Search action="#search">
        <Field.Root className="kv-site-header-search-field">
          <Field.Label marker="none">Search the documentation</Field.Label>
          <TextInput type="search" name="q" autoComplete="off" />
        </Field.Root>
        <Button type="submit">Search</Button>
      </SiteHeader.Search>
      <SiteHeader.Menu>
        <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
        <SiteHeader.MenuPanel>
          <MainMenu.Root label="Main menu">
            <MainMenu.Link href="#docs">Docs</MainMenu.Link>
            <MainMenu.Link href="#components">Components</MainMenu.Link>
            <MainMenu.Link href="#content-types">Content types</MainMenu.Link>
            <MainMenu.Link href="#theming">Theming</MainMenu.Link>
          </MainMenu.Root>
        </SiteHeader.MenuPanel>
      </SiteHeader.Menu>
    </SiteHeader.Root>
  )
}

export async function expectPageOutline(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await expect(canvas.getAllByRole('banner')).toHaveLength(1)
  await expect(canvas.getAllByRole('main')).toHaveLength(1)
  await expect(canvas.getAllByRole('contentinfo')).toHaveLength(1)
  await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
}
