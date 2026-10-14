'use client'
import { MainMenu, SiteAlert, SiteFooter, SiteHeader, SiteSearch } from '@kvirn-ui/patterns'
import {
  Address,
  DefinitionList,
  Grid,
  Heading,
  Link,
  List,
  Navigation,
  Stack,
} from '@kvirn-ui/react'
import type { ReactNode } from 'react'
import { referenceMessages } from '../../../../messages/reference.ts'
import type { ReferenceLocale } from '../../../../messages/reference.ts'
import { ReferenceLanguageLinks, ReferenceLogo } from './reference-header-parts.tsx'

function SiteMainMenu({ locale }: { locale: ReferenceLocale }) {
  const text = referenceMessages[locale].chrome
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <MainMenu.Root label={text.mainMenu}>
      {text.topics.map((topic) => (
        <MainMenu.Topic key={topic.slug}>
          <MainMenu.TopicButton>{topic.label}</MainMenu.TopicButton>
          <MainMenu.TopicPanel>
            <MainMenu.Overview href={href(topic.slug)}>{topic.overview}</MainMenu.Overview>
            {topic.groups.map((group) => (
              <MainMenu.Group key={group.slug}>
                <MainMenu.GroupLink href={href(group.slug)}>{group.label}</MainMenu.GroupLink>
                <Navigation.List>
                  {group.links.map((link) => (
                    <MainMenu.Link key={link.slug} href={href(link.slug)}>
                      {link.label}
                    </MainMenu.Link>
                  ))}
                </Navigation.List>
              </MainMenu.Group>
            ))}
            {topic.links.map((link) => (
              <MainMenu.Link key={link.slug} href={href(link.slug)}>
                {link.label}
              </MainMenu.Link>
            ))}
          </MainMenu.TopicPanel>
        </MainMenu.Topic>
      ))}
    </MainMenu.Root>
  )
}

/** The footer of both layouts: the accessibility statement, the feedback route and the contact details. */
export function ReferenceFooter({ locale }: { locale: ReferenceLocale }) {
  const text = referenceMessages[locale].chrome.footer
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <SiteFooter.Root>
      <Grid.Root className="kv-grid--fit-sm kv-grid--gap-8">
        <Stack className="kv-stack--gap-4">
          <Heading as="h2" size="heading-3">
            {text.contact}
          </Heading>
          <p>
            <strong>{text.contactCentre}</strong>
          </p>
          <DefinitionList.Root>
            <DefinitionList.Row>
              <DefinitionList.Term>{text.phone}</DefinitionList.Term>
              <DefinitionList.Description>
                <Link href="tel:+46000000000">{text.phoneNumber}</Link>
              </DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>{text.email}</DefinitionList.Term>
              <DefinitionList.Description>
                <Link href="mailto:contact@kvirnby.example">contact@kvirnby.example</Link>
              </DefinitionList.Description>
            </DefinitionList.Row>
            <DefinitionList.Row>
              <DefinitionList.Term>{text.phoneHours}</DefinitionList.Term>
              <DefinitionList.Description>{text.phoneHoursValue}</DefinitionList.Description>
            </DefinitionList.Row>
          </DefinitionList.Root>
          <Address>
            {text.address.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </Address>
        </Stack>
        <nav aria-labelledby="footer-about">
          <Stack className="kv-stack--gap-4">
            <Heading as="h2" size="heading-3" id="footer-about">
              {text.about}
            </Heading>
            <List.Root className="kv-list--gap-2">
              <List.Item>
                <Link href={href('accessibility')}>{text.accessibility}</Link>
              </List.Item>
              <List.Item>
                <Link href={href('accessibility/report')}>{text.reportProblem}</Link>
              </List.Item>
              <List.Item>
                <Link href={href('contact')}>{text.contact}</Link>
              </List.Item>
              <List.Item>
                <Link href={href('privacy')}>{text.privacy}</Link>
              </List.Item>
              <List.Item>
                <Link href={href('cookies')}>{text.cookies}</Link>
              </List.Item>
              <List.Item>
                <Link href={href('easy-to-read')}>{text.easyToRead}</Link>
              </List.Item>
            </List.Root>
          </Stack>
        </nav>
      </Grid.Root>
      <SiteFooter.Organisation>{text.organisation}</SiteFooter.Organisation>
    </SiteFooter.Root>
  )
}

/**
 * T1, the site shell: the banner (the notice row, brand, language links, shortcuts, search and the
 * mega main menu behind "Meny"), an optional site alert, the page, and the footer. The search box
 * leads to the search results page.
 */
export function SiteLayout({
  locale,
  pathname,
  notice,
  siteAlert = false,
  children,
}: {
  locale: ReferenceLocale
  pathname: string
  notice: ReactNode
  siteAlert?: boolean | undefined
  children: ReactNode
}) {
  const text = referenceMessages[locale].chrome
  const href = (slug: string) => `/reference/${locale}/${slug}`
  return (
    <>
      <SiteHeader.Root>
        {notice}
        <SiteHeader.Masthead>
          <ReferenceLogo
            locale={locale}
            current={pathname === `/reference/${locale}` ? 'page' : undefined}
          />
          <ReferenceLanguageLinks locale={locale} pathname={pathname} />
          <SiteHeader.Utility label={text.shortcuts}>
            <SiteHeader.UtilityLink href={href('contact')}>{text.contact}</SiteHeader.UtilityLink>
            <SiteHeader.UtilityLink href={href('parking/disabled-parking-permit')}>
              {text.eServices}
            </SiteHeader.UtilityLink>
            <SiteHeader.UtilityLink href={href('my-pages')}>{text.myPages}</SiteHeader.UtilityLink>
          </SiteHeader.Utility>
          <SiteSearch action={href('search')} label={text.searchLabel}>
            {text.search}
          </SiteSearch>
        </SiteHeader.Masthead>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>{text.menu}</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <SiteMainMenu locale={locale} />
          </SiteHeader.MenuPanel>
        </SiteHeader.Menu>
      </SiteHeader.Root>
      {siteAlert ? (
        <SiteAlert.Root>
          <SiteAlert.Title>{text.alert.title}</SiteAlert.Title>
          <SiteAlert.Body>{text.alert.body}</SiteAlert.Body>
          <SiteAlert.Link href={href('news')}>{text.alert.link}</SiteAlert.Link>
        </SiteAlert.Root>
      ) : null}
      {children}
      <ReferenceFooter locale={locale} />
    </>
  )
}
