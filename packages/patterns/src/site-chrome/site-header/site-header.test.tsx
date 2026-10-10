import { describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { MainMenu } from '../main-menu/main-menu.tsx'
import { SiteHeader } from './site-header.tsx'

// Contract: site-header.a11y.md. Component tests load no theme; the default viewport is narrow.

function Header() {
  return (
    <SiteHeader.Root>
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
              </MainMenu.TopicPanel>
            </MainMenu.Topic>
            <MainMenu.Link href="#care">Care and support</MainMenu.Link>
          </MainMenu.Root>
        </SiteHeader.MenuPanel>
      </SiteHeader.Menu>
    </SiteHeader.Root>
  )
}

const menuButton = () =>
  page.getByRole('button', { name: 'Menu', exact: true }).element() as HTMLElement

describe('keyboard', () => {
  test('Escape in the open Menu closes it and returns focus to Menu', async () => {
    await render(<Header />)
    menuButton().focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    expect(document.activeElement?.closest('nav')?.getAttribute('aria-label')).toBe('Main menu')
    await userEvent.keyboard('{Escape}')
    expect(menuButton().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menuButton())
  })
})
