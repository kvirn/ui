import { Alert, Card, Icon, KvirnProvider } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/alert/alert.a11y.md?raw'
import guide from '../../../../../packages/react/src/alert/alert.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  CompactAlerts,
  ConsequenceAlert,
  DeadlineAlert,
  DynamicStatusExample,
  FocusTargetExample,
  FourStatuses,
  localeOf,
  PermitAlert,
  SavedExample,
  SavedAlert,
  SendFailedExample,
  SendFailedAlert,
  textsFor,
  withAlertColumn,
  withAlertLocale,
} from './alert.fixture.tsx'
import type { AlertFixtureLocale } from './alert.fixture.tsx'

// Components/Alert: the headless Alert, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/alert.md). alert.e2e.ts runs its
// keyboard rows, focus-ring, forced-colours and reflow checks against WithActions, SendFailed,
// FocusTarget, Announced, LongFinnishText, AllExamples and ForcedColors. There is no Keyboard
// story: an alert has no focusable part of its own.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Alert',
  component: Alert.Info,
  argTypes: {
    announce: {
      control: false,
      description:
        '`polite` or `assertive`: the Title and Body text go to the shared Announcer once, when the alert mounts. Set it only on an alert inserted after an action, never on one present at load. Needs a `KvirnProvider`.',
    },
    messages: {
      control: false,
      description:
        'Per-instance override of this root’s status word, such as `{ infoPrefix: "Viktigt:" }`. It changes the word, never the status.',
    },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-alert` and the status class. A status class of another status warns in development.',
    },
    render: { control: false },
  },
  globals: { locale: 'sv' },
  decorators: [withAlertColumn, withAlertLocale],
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Alert.Info>

export default meta
type Story = StoryObj<typeof meta>

/** Example A: an info alert present when the page loads. It is content: not announced. */
export const Default: Story = {
  render: (args) => (
    <Alert.Info {...args} data-testid="deadline">
      <Alert.Title>
        Sista dag att ansöka är <time dateTime="2026-08-31">31 augusti 2026</time>
      </Alert.Title>
      <Alert.Body>
        <p>
          Ansök senast då om du vill ha ett sommarjobb i kommunen. Vi svarar alla senast{' '}
          <time dateTime="2026-09-30">30 september 2026</time>.
        </p>
      </Alert.Body>
    </Alert.Info>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2 })
    // The status word is the first text in the heading, so a screen reader says it first.
    await expect(heading.textContent).toMatch(/^Information: Sista dag att ansöka är /)
    await expect(heading.closest('.kv-alert')).not.toBeNull()
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
  },
}

/**
 * The four ready-made roots with the same title, so the icon and the colour are the only visual
 * difference. Each brings its status class, its icon (a square, a circle, a triangle, an octagon)
 * and its status word from one table. Review it in forced colours: the icon's shape carries the
 * status there.
 */
export const Statuses: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'FourStatuses'),
  render: (_args, { globals }) => <FourStatuses locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    for (const word of ['Information:', 'Klart:', 'Varning:', 'Fel:']) {
      await expect(
        canvas.getByRole('heading', { level: 2, name: `${word} Något du bör veta` }),
      ).toBeVisible()
    }
    // No box has a role: the status is text. The only live regions are the Announcer's.
    await expect(canvasElement.querySelectorAll('.kv-alert[role]')).toHaveLength(0)
    await expect(canvasElement.querySelectorAll('.kv-alert [aria-live]')).toHaveLength(0)
  },
}

/**
 * Examples B and C2: one sentence needs no heading, so the Title is a paragraph
 * (`render={<p />}`). The status word is still first.
 */
export const TitleOnly: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'SavedAlert', 'ConsequenceAlert'),
  render: (_args, { globals }) => (
    <>
      <SavedAlert locale={localeOf(globals)} />
      <ConsequenceAlert locale={localeOf(globals)} />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('saved').textContent).toBe('Klart: Dina ändringar är sparade')
    await expect(canvas.queryByRole('heading')).toBeNull()
  },
}

/**
 * Examples C and D: actions. Links for navigation, Buttons for actions, at most two. The
 * alert is skipped by Tab, and its actions are reached in DOM order.
 */
export const WithActions: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'PermitAlert', 'SendFailedAlert'),
  render: (_args, { globals }) => (
    <>
      <PermitAlert locale={localeOf(globals)} />
      <SendFailedAlert locale={localeOf(globals)} />
    </>
  ),
  play: async ({ canvas }) => {
    const permit = within(canvas.getByTestId('permit'))
    await expect(permit.getByRole('link', { name: 'Förnya parkeringstillstånd' })).toBeVisible()
    const failed = within(canvas.getByTestId('send-failed-alert'))
    await expect(failed.getByRole('button', { name: 'Försök igen' })).toBeVisible()
  },
}

/**
 * Example B: success, inserted after Save. The Save button keeps focus, and the alert is
 * announced politely, once, in the shared live region. The start-page alert above it was
 * present at load, so it put nothing there.
 */
export const Announced: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'DeadlineAlert', 'SavedExample'),
  render: (_args, { globals }) => (
    <>
      <DeadlineAlert locale={localeOf(globals)} />
      <SavedExample locale={localeOf(globals)} />
    </>
  ),
  play: async ({ canvas }) => {
    // The live region exists before any text, and an alert present at load adds none.
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
    const save = canvas.getByRole('button', { name: 'Spara' })
    await userEvent.click(save)
    await waitFor(() =>
      expect(canvas.getByRole('status').textContent).toBe('Klart: Dina ändringar är sparade'),
    )
    await expect(canvas.getByRole('status')).not.toHaveTextContent('Sista dag')
    await expect(save).toHaveFocus()
    // The visible box has no role of its own: there is still one status region, the Announcer's.
    await expect(canvas.getAllByRole('status')).toHaveLength(1)
  },
}

/**
 * Example D: danger, inserted after Send fails, directly above Send. It is announced politely.
 * A second failure keeps the same instance and announces through `useAnnouncer()`, because
 * "Försök igen" is inside it and a remount would drop the focus. Shift+Tab from Send reaches
 * "Försök igen".
 */
export const SendFailed: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'SendFailedExample'),
  render: (_args, { globals }) => <SendFailedExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    const region = canvas.getByRole('status')
    await expect(region).toBeEmptyDOMElement()
    const announcements: string[] = []
    const observer = new MutationObserver(() => {
      const text = region.textContent ?? ''
      if (text !== '') {
        announcements.push(text)
      }
    })
    observer.observe(region, { childList: true, characterData: true, subtree: true })
    const send = canvas.getByRole('button', { name: 'Skicka ansökan' })
    await userEvent.click(send)
    await waitFor(() => expect(announcements).toHaveLength(1))
    await expect(announcements[0]).toMatch(/^Fel: Vi kunde inte skicka din ansökan /)
    await expect(send).toHaveFocus()
    await userEvent.click(send)
    await waitFor(() => expect(announcements).toHaveLength(2))
    observer.disconnect()
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(1)
  },
}

/**
 * An alert focused once when it mounts, with `tabIndex={-1}`: the arrival pattern, and the
 * mechanics of the later error summary. It isn't announced (focus already reads it), shows the
 * focus ring, and Tab from it goes to its first action.
 */
export const FocusTarget: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'FocusTargetExample'),
  render: (_args, { globals }) => <FocusTargetExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Skicka ansökan' }))
    const root = canvas.getByTestId('focus-target')
    await waitFor(() => expect(root).toHaveFocus())
    await expect(root).toHaveAttribute('tabindex', '-1')
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
  },
}

/**
 * A status that comes from data: a typed map from the status to the component, so the choice
 * stays visible in the code. There is no status prop.
 */
export const DynamicStatus: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'DynamicStatusExample'),
  render: (_args, { globals }) => <DynamicStatusExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Status' }), 'danger')
    await expect(canvas.getByRole('heading', { level: 2 }).textContent).toBe(
      'Fel: Något du bör veta',
    )
  },
}

/**
 * Restyle with two tokens, or drop our class. The first alert has
 * `--kv-alert-background` and `--kv-alert-accent` set in unlayered CSS. The second
 * drops `kv-alert` through the `render` function form, and a class of your own styles it.
 * Both keep the icon and the status word.
 */
export const RestyleWithTokens: Story = {
  render: (_args, { globals }) => {
    const { text } = textsFor(localeOf(globals))
    return (
      <>
        <div className="kv-story-alert-rebrand">
          <Alert.Warning data-testid="rebranded">
            <Alert.Title>{text.sample.title}</Alert.Title>
          </Alert.Warning>
        </div>
        <Alert.Warning
          render={(rootProps) => (
            <div {...rootProps} className="kv-story-my-warning" data-testid="own-class" />
          )}
        >
          <Alert.Title>{text.sample.title}</Alert.Title>
        </Alert.Warning>
      </>
    )
  },
  play: async ({ canvas }) => {
    for (const testId of ['rebranded', 'own-class']) {
      const alert = canvas.getByTestId(testId)
      await expect(alert.querySelector('svg.kv-alert-icon')).not.toBeNull()
      await expect(alert.querySelector('.kv-alert-status')?.textContent).toBe('Varning:')
    }
    await expect(canvas.getByTestId('own-class').className).toBe('kv-story-my-warning')
  },
}

/**
 * Your own look, icon and word: the plain `Alert.Root`, a class that sets the two tokens,
 * your own `<Icon>` first and your own `kv-alert-status` span first in the Title. You own
 * the agreement between the colour, the icon and the word.
 */
export const BringYourOwn: Story = {
  render: (_args, { globals }) => {
    const { text } = textsFor(localeOf(globals))
    return (
      <Alert.Root className="kv-story-my-notice" data-testid="own">
        <Icon name="info" className="kv-alert-icon" />
        <Alert.Title>
          <span className="kv-alert-status">{text.ownStatus.word}</span> {text.sample.title}
        </Alert.Title>
      </Alert.Root>
    )
  },
  play: async ({ canvas }) => {
    const own = canvas.getByTestId('own')
    await expect(own.className).toBe('kv-story-my-notice kv-alert')
    await expect(canvas.getByRole('heading', { level: 2 }).textContent).toBe(
      'Observera: Något du bör veta',
    )
  },
}

/**
 * `messages` change the status word, never the status: one Danger with `dangerPrefix` on the
 * instance, and a Warning below a provider that overrides `alert.warningPrefix`.
 */
export const MessagesOverride: Story = {
  render: (_args, { globals }) => {
    const { text } = textsFor(localeOf(globals))
    return (
      <>
        <Alert.Danger messages={{ dangerPrefix: text.override.danger }}>
          <Alert.Title>{text.override.dangerTitle}</Alert.Title>
        </Alert.Danger>
        <KvirnProvider messages={{ alert: { warningPrefix: text.override.warning } }}>
          <Alert.Warning>
            <Alert.Title>{text.override.warningTitle}</Alert.Title>
          </Alert.Warning>
        </KvirnProvider>
      </>
    )
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Viktigt: Vi kunde inte spara dina svar' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('heading', {
        level: 2,
        name: 'Obs: Kontrollera dina svar innan du skickar',
      }),
    ).toBeVisible()
  },
}

/**
 * In prose and in a Card. An alert is a prose boundary like a card: its title isn't styled
 * as a prose heading, and `kv-prose` on its Body turns prose on inside it. It may sit in a Card
 * body. Never a Card or a Section inside an Alert.
 */
export const InProseAndCard: Story = {
  render: (_args, { globals }) => {
    const { text, formatLocale } = textsFor(localeOf(globals))
    const closes = new Intl.DateTimeFormat(formatLocale, {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2026, 7, 31)))
    return (
      <>
        <article className="kv-prose">
          <h2>{text.prose.heading}</h2>
          <p>{text.permit.body}</p>
          <Alert.Info data-testid="in-prose">
            <Alert.Title render={(props) => <h3 {...props}>{props.children}</h3>}>
              {text.deadline.title(<time dateTime="2026-08-31">{closes}</time>)}
            </Alert.Title>
            <Alert.Body className="kv-prose">
              <p>{text.permit.body}</p>
              <ul>
                <li>{text.saved.title}</li>
                <li>{text.consequence.title}</li>
              </ul>
            </Alert.Body>
          </Alert.Info>
          <p>{text.consequence.title}</p>
        </article>
        <Card.Root>
          <Card.Body>
            <h2>{text.prose.heading}</h2>
            <Alert.Warning data-testid="in-card">
              <Alert.Title render={(props) => <h3 {...props}>{props.children}</h3>}>
                {text.sample.title}
              </Alert.Title>
            </Alert.Warning>
          </Card.Body>
        </Card.Root>
      </>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('in-prose').querySelectorAll('li')).toHaveLength(2)
    await expect(canvas.getByTestId('in-card').closest('.kv-card')).not.toBeNull()
  },
}

/** Examples B and D in `kv-compact`: less padding from 64rem, the title at 16px. Staff tools. */
export const Compact: Story = {
  parameters: showSource('alert/alert.fixture.tsx', 'CompactAlerts'),
  render: (_args, { globals }) => <CompactAlerts locale={localeOf(globals)} />,
}

/** Finnish text in a narrow column: the title hyphenates or wraps instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  decorators: [
    (Story) => (
      <div className="kv-story-narrow" data-testid="narrow" lang="fi">
        <Story />
      </div>
    ),
  ],
  render: () => {
    const { text } = textsFor('fi')
    return (
      <Alert.Info>
        <Alert.Title>{text.longFinnish.title}</Alert.Title>
        <Alert.Body>
          <p>{text.permit.body}</p>
        </Alert.Body>
        <Alert.Actions>
          <a href="#renew">{text.permit.renew}</a>
        </Alert.Actions>
      </Alert.Info>
    )
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', {
        level: 2,
        name: /^Tiedoksi: Asunnonmuutostyöavustushakemuksesi/,
      }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(canvas.getByTestId('narrow'))
  },
}

/** Every example on one page: layout only, for axe and e2e. */
function AllExamplesPage({ locale }: { locale: AlertFixtureLocale }) {
  return (
    <>
      <DeadlineAlert locale={locale} />
      <PermitAlert locale={locale} />
      <ConsequenceAlert locale={locale} />
      <SavedExample locale={locale} />
      <SendFailedExample locale={locale} />
    </>
  )
}

/** The functions the page is made of: the real parts of every example on it. */
const allExamplesSource = [
  'DeadlineAlert',
  'PermitAlert',
  'ConsequenceAlert',
  'SavedExample',
  'SendFailedExample',
] as const

/** Examples A, B, C, C2 and D together: the design spec's uses of an alert on one page. */
export const AllExamples: Story = {
  parameters: showSource('alert/alert.fixture.tsx', ...allExamplesSource),
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}

/** Right to left, in English: the bar and the icon sit on the right, and the icons never mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  parameters: showSource('alert/alert.fixture.tsx', ...allExamplesSource),
  render: () => <AllExamplesPage locale="en" />,
}

/**
 * The box and its bar survive forced colours, and all four statuses share one colour, so the
 * icon's shape and the status word carry the status. The e2e suite checks it with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  parameters: showSource('alert/alert.fixture.tsx', 'FourStatuses', ...allExamplesSource),
  render: (_args, { globals }) => (
    <>
      <FourStatuses locale={localeOf(globals)} />
      <AllExamplesPage locale={localeOf(globals)} />
    </>
  ),
}
