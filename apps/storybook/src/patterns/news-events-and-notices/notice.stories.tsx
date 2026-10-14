import { Alert, Container, Link } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'
import { DateText, ExampleProvider } from './news-events-support.tsx'
import contract from '../../../../../packages/patterns/src/news-events-and-notices/notice/notice.a11y.md?raw'

// Patterns/News, events and notices/Notice (docs/design/storybook-patterns-t5.md S9).
// Story-only: a shipped Alert, not announced on load.

const description = `A status inside the content. Use \`Alert.Info\` or \`Alert.Warning\` with the title as \`Alert.Title as="p"\` (or a heading when it belongs in the outline), a short body and at most one link. It is not dismissible in content and is not announced on load: no \`announce\`, no role, no focus. Status is words and an icon, never colour alone (R9). For a quiet aside that is not a status, use an Inset ([DESIGN.md](?path=/docs/foundation-design-principles--docs)).

## Parts and gaps

Parts used: \`Alert.Info\`, \`Alert.Warning\`, \`Alert.Title\`, \`Alert.Body\`, \`Link\`. No gap.
`

const meta = {
  title: 'Patterns/News, events and notices/Notice',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Information that is true now and useful to know. */
export const Info: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <ExampleProvider>
      <Container size="reading">
        <Alert.Info>
          <Alert.Title as="p">The library is open late on Thursdays</Alert.Title>
          <Alert.Body>
            <p>From November the library is open until 20.00 on Tuesdays and Thursdays.</p>
          </Alert.Body>
        </Alert.Info>
      </Container>
    </ExampleProvider>
  ),
  play: async ({ canvas }) => {
    const title = canvas.getByText('The library is open late on Thursdays')
    await expect(title.closest('[role], [aria-live]')).toBeNull()
    await expect(title).toBeVisible()
  },
}

/** A warning with a deadline written as a `<time>` with `useFormat`. */
export const WarningWithDeadline: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <ExampleProvider>
      <Container size="reading">
        <Alert.Warning>
          <Alert.Title as="p">Apply by 15 November</Alert.Title>
          <Alert.Body>
            <p>
              Applications for the spring term close on <DateText iso="2026-11-15" />.
            </p>
          </Alert.Body>
        </Alert.Warning>
      </Container>
    </ExampleProvider>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Apply by 15 November').closest('[role], [aria-live]')).toBeNull()
    await expect(canvasElement.querySelector('time')).toHaveAttribute('datetime', '2026-11-15')
  },
}

/** With one link, whose text makes sense alone. */
export const WithLink: Story = {
  globals: { ...wideGlobals },
  render: () => (
    <ExampleProvider>
      <Container size="reading">
        <Alert.Info>
          <Alert.Title as="p">Roadworks on Storgatan</Alert.Title>
          <Alert.Body>
            <p>
              Buses are diverted until the end of November.{' '}
              <Link.Root href="#roadworks">Read about the diversions</Link.Root>
            </p>
          </Alert.Body>
        </Alert.Info>
      </Container>
    </ExampleProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Read about the diversions' })).toBeVisible()
  },
}

/** 320px: text wraps, nothing scrolls sideways. */
export const Narrow: Story = {
  ...WithLink,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** Tab reaches the link in the notice. */
export const Keyboard: Story = { ...WithLink }

/** Right to left: the icon moves to the start. */
export const RTL: Story = {
  ...WithLink,
  globals: { dir: 'rtl', locale: 'en', ...wideGlobals },
}

/** Forced colours: the status is the icon and the word, with a border. */
export const ForcedColors: Story = {
  ...WithLink,
  globals: { forcedColors: 'active', ...wideGlobals },
}
