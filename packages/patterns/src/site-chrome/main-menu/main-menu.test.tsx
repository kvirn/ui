import { afterEach, describe, expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { MainMenu } from './main-menu.tsx'

// Contract: main-menu.a11y.md. Component tests load no theme: the viewport decides narrow or wide.

const narrowViewport = { width: 414, height: 896 }
const wideViewport = { width: 1280, height: 800 }

afterEach(async () => {
  await page.viewport(narrowViewport.width, narrowViewport.height)
})

function Example() {
  return (
    <>
      <button type="button">Before</button>
      {/* Space around the targets, so the axe target-size rule has room without the theme. */}
      <style>{'a, button { display: inline-block; padding: 8px; margin: 4px; }'}</style>
      <div style={{ padding: 24 }}>
        <MainMenu.Root label="Main menu">
          <MainMenu.Topic>
            <MainMenu.TopicButton>Children and education</MainMenu.TopicButton>
            <MainMenu.TopicPanel>
              <MainMenu.Overview href="#children">
                All about children and education
              </MainMenu.Overview>
              <MainMenu.Link href="#preschool">Preschool</MainMenu.Link>
              <MainMenu.Link href="#school">School</MainMenu.Link>
            </MainMenu.TopicPanel>
          </MainMenu.Topic>
          <MainMenu.Topic>
            <MainMenu.TopicButton>Care and support</MainMenu.TopicButton>
            <MainMenu.TopicPanel>
              <MainMenu.Overview href="#care">All about care and support</MainMenu.Overview>
              <MainMenu.Link href="#elderly">Elderly care</MainMenu.Link>
            </MainMenu.TopicPanel>
          </MainMenu.Topic>
          <MainMenu.Link href="#contact">Contact us</MainMenu.Link>
        </MainMenu.Root>
      </div>
      <button type="button">After</button>
    </>
  )
}

const topicButton = (name: string) => page.getByRole('button', { name, exact: true })
const topicElement = (name: string) => topicButton(name).element() as HTMLButtonElement
const firstTopic = 'Children and education'
const activeElement = () => document.activeElement
const isOpen = (name: string) => topicElement(name).getAttribute('aria-expanded') === 'true'

async function goWide() {
  await page.viewport(wideViewport.width, wideViewport.height)
}

describe('keyboard', () => {
  test('Escape in an open panel closes it and returns focus to its topic button', async () => {
    await render(<Example />)
    topicElement(firstTopic).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await userEvent.keyboard('{Escape}')
    expect(isOpen(firstTopic)).toBe(false)
    expect(activeElement()).toBe(topicElement(firstTopic))
  })
})

describe('wide', () => {
  test('focus leaving the nav closes the open panel', async () => {
    await goWide()
    await render(<Example />)
    topicElement(firstTopic).focus()
    await userEvent.keyboard('{Enter}')
    ;(page.getByRole('button', { name: 'After' }).element() as HTMLElement).focus()
    await expect.poll(() => isOpen(firstTopic)).toBe(false)
  })

  test('a press outside the nav closes the open panel', async () => {
    await goWide()
    await render(<Example />)
    topicElement(firstTopic).focus()
    await userEvent.keyboard('{Enter}')
    await page.getByRole('button', { name: 'After' }).click()
    expect(isOpen(firstTopic)).toBe(false)
  })
})
