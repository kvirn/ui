'use client'

import { Address, Grid, Heading, Link, List, Stack, DefinitionList, TopBar } from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { kvirnbyMark } from '../../fixtures/images.ts'
import { ApplicationLogo } from '../../site-chrome/application-logo/application-logo.tsx'
import { LanguageLinks } from '../../site-chrome/language-links/language-links.tsx'
import { MainMenu } from '../../site-chrome/main-menu/main-menu.tsx'
import { SiteFooter } from '../../site-chrome/site-footer/site-footer.tsx'
import { SiteHeader } from '../../site-chrome/site-header/site-header.tsx'
import { SiteSearch } from '../../site-chrome/site-search/site-search.tsx'

// The header, footer and docs header of the content-type shell (shell.tsx): the Site header and Site
// footer stories spell the parts out, this is the same composition written once.

function HeaderNotice({ children }: { children?: ReactNode }) {
  return children === undefined ? null : <TopBar variant="accent">{children}</TopBar>
}

export function KvirnbyHeader({
  current,
  notice,
}: {
  current?: 'page' | undefined
  notice?: ReactNode
}) {
  return (
    <SiteHeader.Root>
      <HeaderNotice>{notice}</HeaderNotice>
      <SiteHeader.Masthead>
        <ApplicationLogo.Root href="#start" current={current}>
          <ApplicationLogo.Logo src={kvirnbyMark} />
          <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
        </ApplicationLogo.Root>
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
        <SiteSearch action="#search" label="Search the site">
          Search
        </SiteSearch>
      </SiteHeader.Masthead>
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

export function KvirnbyTransactionHeader({ notice }: { notice?: ReactNode }) {
  return (
    <SiteHeader.Root>
      <HeaderNotice>{notice}</HeaderNotice>
      <SiteHeader.Masthead>
        <ApplicationLogo.Root href="#start">
          <ApplicationLogo.Logo src={kvirnbyMark} />
          <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
        </ApplicationLogo.Root>
        <span>Report an accessibility problem</span>
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
        </SiteHeader.Utility>
      </SiteHeader.Masthead>
    </SiteHeader.Root>
  )
}

export function KvirnbyFooter() {
  return (
    <SiteFooter.Root>
      <Grid.Root className="kv-grid--fit-sm kv-grid--gap-8">
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
                <Link.Root href="mailto:contact@kvirnby.example">contact@kvirnby.example</Link.Root>
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
      </Grid.Root>
      <SiteFooter.Organisation>
        Kvirnby municipality, Storgatan 1, 123 45 Kvirnby
      </SiteFooter.Organisation>
    </SiteFooter.Root>
  )
}

export function KvirnUIDocsHeader({ notice }: { notice?: ReactNode }) {
  return (
    <SiteHeader.Root>
      <HeaderNotice>{notice}</HeaderNotice>
      <SiteHeader.Masthead>
        <ApplicationLogo.Root href="#home">
          <ApplicationLogo.Name>KvirnUI</ApplicationLogo.Name>
        </ApplicationLogo.Root>
        <SiteSearch action="#search" label="Search the documentation">
          Search
        </SiteSearch>
      </SiteHeader.Masthead>
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
