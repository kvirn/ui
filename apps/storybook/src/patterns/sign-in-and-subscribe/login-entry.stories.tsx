import { en } from '@kvirn-ui/i18n/en'
import { kvirnbySignInMethods } from '@kvirn-ui/patterns/fixtures'
import { Alert, Card, Grid, Heading, KvirnProvider, Link } from '@kvirn-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import contract from '../../../../../packages/patterns/src/sign-in-and-subscribe/login-entry/login-entry.a11y.md?raw'
import { expect } from 'storybook/test'
import { expectNoHorizontalOverflow } from '../../components/theme-story-assertions.ts'
import { chromeViewports, narrowGlobals, wideGlobals } from '../patterns-story-support.tsx'

// Patterns/Sign-in and subscribe/Login entry (docs/design/storybook-patterns-t5.md S8).
// Story-only: a list of cards with a link each. The link target is the app's.

const description = `Choose an e-identification. A page \`h1\` "Sign in", then a \`Grid.Root as="ul"\` of \`Card.Root as="li"\`: each method is a \`Heading\` that holds the one \`Link\` (rule R4: no clickable card). The methods look the same: no method is primary, and there is no service link, since signing in is not the service. The list is a real \`ul\`, so the count is announced (R3).

A method that is unavailable has no card: an \`Alert.Warning\` says which and when it is back, in words (R9), above the list. A cancelled sign-in is an \`Alert.Info\` above the list, not an error, and the page does not take focus. There is no CAPTCHA and no puzzle, so 3.3.8 is met. Method names here are generic; name your own. My pages (S12) uses this page.

## Parts and gaps

Parts used: \`Heading\`, \`Grid.Root as="ul"\`, \`Card.Root as="li"\`, \`Card.Body\`, \`Link\`, \`Alert.Warning\`, \`Alert.Info\`. No gap.
`

const meta = {
  title: 'Patterns/Sign-in and subscribe/Login entry',
  globals: { locale: 'en' },
  parameters: {
    a11yContract: contract,
    layout: 'padded',
    docs: { description: { component: description } },
    viewport: { options: chromeViewports },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function LoginEntry({
  count,
  unavailable,
  cancelled,
}: {
  count: 2 | 3
  unavailable?: boolean
  cancelled?: boolean
}) {
  const methods = kvirnbySignInMethods.slice(0, count)
  return (
    <KvirnProvider locale="en" messages={en}>
      <div lang="en" className="kv-stack">
        <Heading as="h1" size="heading-1">
          Sign in
        </Heading>
        {cancelled ? (
          <Alert.Info>
            <Alert.Title as="p">Sign-in cancelled</Alert.Title>
            <Alert.Body>You were not signed in. Choose a method to try again.</Alert.Body>
          </Alert.Info>
        ) : null}
        {unavailable ? (
          <Alert.Warning>
            <Alert.Title as="p">E-identification, example three is not available</Alert.Title>
            <Alert.Body>
              It is being serviced. Use another method, or try again tomorrow.
            </Alert.Body>
          </Alert.Warning>
        ) : null}
        <Heading as="h2" size="heading-3">
          Choose how to sign in
        </Heading>
        <Grid.Root as="ul" className="kv-grid--fit-sm">
          {methods.map((method) => (
            <Card.Root as="li" key={method}>
              <Card.Body>
                <Heading as="h3" size="heading-4">
                  <Link.Root href="#sign-in">{method}</Link.Root>
                </Heading>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid.Root>
        <Heading as="h2" size="heading-3">
          Other ways to apply
        </Heading>
        <div className="kv-prose">
          <p>
            You can also <Link.Root href="#contact">contact us</Link.Root> or visit the service
            centre. We help you fill in the form.
          </p>
        </div>
      </div>
    </KvirnProvider>
  )
}

/** Three methods, one link each, none primary. */
export const ThreeMethods: Story = {
  render: () => <LoginEntry count={3} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.getAllByRole('link', { name: /E-identification/ })).toHaveLength(3)
    for (const item of canvasElement.querySelectorAll('li')) {
      await expect(item.querySelectorAll('a')).toHaveLength(1)
    }
  },
}

/** Two methods. */
export const TwoMethods: Story = {
  render: () => <LoginEntry count={2} />,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}

/** One method unavailable: a warning says so in words, and it has no card. */
export const MethodUnavailable: Story = {
  render: () => <LoginEntry count={2} unavailable />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/is not available/)).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2)
  },
}

/** Sign-in cancelled: information, not an error. */
export const Cancelled: Story = {
  render: () => <LoginEntry count={3} cancelled />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Sign-in cancelled')).toBeVisible()
  },
}

/** 320px: one column; nothing scrolls sideways. */
export const Narrow: Story = {
  ...ThreeMethods,
  globals: { ...narrowGlobals },
  play: async ({ canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement)
  },
}

/** 80rem. */
export const Wide: Story = {
  ...ThreeMethods,
  globals: { ...wideGlobals },
}

/** Try the keys: Tab visits one link per method, in the order on screen. */
export const Keyboard: Story = { ...Narrow }

/** Right to left. */
export const RTL: Story = {
  ...ThreeMethods,
  globals: { dir: 'rtl', locale: 'en' },
}

/** Forced colours: the warning keeps its icon and status word. */
export const ForcedColors: Story = {
  ...MethodUnavailable,
  globals: { forcedColors: 'active' },
}
