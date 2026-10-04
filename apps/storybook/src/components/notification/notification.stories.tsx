import { Card, Icon, KvirnProvider, Notification } from '@kvirn-ui/react'
import contract from '../../../../../packages/react/src/notification/notification.a11y.md?raw'
import guide from '../../../../../packages/react/src/notification/notification.md?raw'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { showSource, usageGuide } from '../../docs-source.ts'
import { expectNoHorizontalOverflow } from '../theme-story-assertions.ts'
import {
  ConsequenceNotification,
  DeadlineNotification,
  DynamicStatusExample,
  FocusTargetExample,
  localeOf,
  PermitNotification,
  SavedExample,
  SavedNotification,
  SendFailedExample,
  SendFailedNotification,
  textsFor,
  withNotificationLocale,
} from './notification.fixture.tsx'
import type { NotificationFixtureLocale } from './notification.fixture.tsx'

// Components/Notification: the headless Notification, styled by @kvirn-ui/theme/theme.css
// (design spec docs/design/notification.md). notification.e2e.ts runs its
// keyboard rows, focus-ring, forced-colours and reflow checks against WithActions, SendFailed,
// FocusTarget, Announced, LongFinnishText, AllExamples and ForcedColors. There is no Keyboard
// story: a notification has no focusable part of its own.

// The Docs page opens with the package docs: how to use it, and how to build your own.
const description = usageGuide(guide)

const meta = {
  title: 'Components/Notification',
  component: Notification.Info,
  argTypes: {
    announce: {
      control: false,
      description:
        '`polite` or `assertive`: the Title and Body text go to the shared Announcer once, when the notification mounts. Set it only on a notification inserted after an action, never on one present at load. Needs a `KvirnProvider`.',
    },
    messages: {
      control: false,
      description:
        'Per-instance override of this root’s status word, such as `{ infoPrefix: "Viktigt:" }`. It changes the word, never the status.',
    },
    className: {
      control: 'text',
      description:
        'Your own classes, added to `kv-notification` and the status class. A status class of another status warns in development.',
    },
    render: { control: false },
  },
  globals: { locale: 'sv' },
  decorators: [withNotificationLocale],
  parameters: { a11yContract: contract, docs: { description: { component: description } } },
} satisfies Meta<typeof Notification.Info>

export default meta
type Story = StoryObj<typeof meta>

/** Example A: an info notification present when the page loads. It is content: not announced. */
export const Default: Story = {
  parameters: showSource('notification/notification.fixture.tsx', 'DeadlineNotification'),
  render: (args, { globals }) => (
    <div className="kv-story-notification-column">
      <DeadlineNotification {...args} locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 2 })
    // The status word is the first text in the heading, so a screen reader says it first.
    await expect(heading.textContent).toMatch(/^Information: Sista dag att ansöka är /)
    await expect(heading.closest('.kv-notification')).not.toBeNull()
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
  },
}

/** The four ready-made roots, each labelled with its component name, with the same title. */
function FourStatuses({ locale }: { locale: NotificationFixtureLocale }) {
  const { text, lang } = textsFor(locale)
  return (
    <div className="kv-story-notification-column" lang={lang}>
      {(
        [
          ['Notification.Info', Notification.Info],
          ['Notification.Success', Notification.Success],
          ['Notification.Warning', Notification.Warning],
          ['Notification.Danger', Notification.Danger],
        ] as const
      ).map(([name, Root]) => (
        <div key={name}>
          <p>
            <code>{name}</code>
          </p>
          <Root>
            <Notification.Title>{text.sample.title}</Notification.Title>
          </Root>
        </div>
      ))}
    </div>
  )
}

/**
 * The four ready-made roots with the same title, so the icon and the colour are the only visual
 * difference. Each brings its status class, its icon (a square, a circle, a triangle, an octagon)
 * and its status word from one table. Review it in forced colours: the icon's shape carries the
 * status there.
 */
export const Statuses: Story = {
  parameters: showSource('notification/notification.stories.tsx', 'FourStatuses'),
  render: (_args, { globals }) => <FourStatuses locale={localeOf(globals)} />,
  play: async ({ canvas, canvasElement }) => {
    for (const word of ['Information:', 'Klart:', 'Varning:', 'Fel:']) {
      await expect(
        canvas.getByRole('heading', { level: 2, name: `${word} Något du bör veta` }),
      ).toBeVisible()
    }
    // No box has a role: the status is text. The only live regions are the Announcer's.
    await expect(canvasElement.querySelectorAll('.kv-notification[role]')).toHaveLength(0)
    await expect(canvasElement.querySelectorAll('.kv-notification [aria-live]')).toHaveLength(0)
  },
}

/**
 * Examples B and C2: one sentence needs no heading, so the Title is a paragraph
 * (`render={<p />}`). The status word is still first.
 */
export const TitleOnly: Story = {
  parameters: showSource(
    'notification/notification.fixture.tsx',
    'SavedNotification',
    'ConsequenceNotification',
  ),
  render: (_args, { globals }) => (
    <div className="kv-story-notification-column">
      <SavedNotification locale={localeOf(globals)} />
      <ConsequenceNotification locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('saved').textContent).toBe('Klart: Dina ändringar är sparade')
    await expect(canvas.queryByRole('heading')).toBeNull()
  },
}

/**
 * Examples C and D: actions. Links for navigation, Buttons for actions, at most two. The
 * notification is skipped by Tab, and its actions are reached in DOM order.
 */
export const WithActions: Story = {
  parameters: showSource(
    'notification/notification.fixture.tsx',
    'PermitNotification',
    'SendFailedNotification',
  ),
  render: (_args, { globals }) => (
    <div className="kv-story-notification-column">
      <PermitNotification locale={localeOf(globals)} />
      <SendFailedNotification locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    const permit = within(canvas.getByTestId('permit'))
    await expect(permit.getByRole('link', { name: 'Förnya parkeringstillstånd' })).toBeVisible()
    const failed = within(canvas.getByTestId('send-failed-notification'))
    await expect(failed.getByRole('button', { name: 'Försök igen' })).toBeVisible()
  },
}

/**
 * Example B: success, inserted after Save. The Save button keeps focus, and the notification is
 * announced politely, once, in the shared live region. The start-page notification above it was
 * present at load, so it put nothing there.
 */
export const Announced: Story = {
  parameters: showSource('notification/notification.fixture.tsx', 'SavedExample'),
  render: (_args, { globals }) => (
    <div className="kv-story-notification-column">
      <DeadlineNotification locale={localeOf(globals)} />
      <SavedExample locale={localeOf(globals)} />
    </div>
  ),
  play: async ({ canvas }) => {
    // The live region exists before any text, and a notification present at load adds none.
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
  parameters: showSource('notification/notification.fixture.tsx', 'SendFailedExample'),
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
 * A notification focused once when it mounts, with `tabIndex={-1}`: the arrival pattern, and the
 * mechanics of the later error summary. It isn't announced (focus already reads it), shows the
 * focus ring, and Tab from it goes to its first action.
 */
export const FocusTarget: Story = {
  parameters: showSource('notification/notification.fixture.tsx', 'FocusTargetExample'),
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
  parameters: showSource('notification/notification.fixture.tsx', 'DynamicStatusExample'),
  render: (_args, { globals }) => <DynamicStatusExample locale={localeOf(globals)} />,
  play: async ({ canvas }) => {
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Status' }), 'danger')
    await expect(canvas.getByRole('heading', { level: 2 }).textContent).toBe(
      'Fel: Något du bör veta',
    )
  },
}

/**
 * Restyle with two tokens, or drop our class. The first notification has
 * `--kv-notification-background` and `--kv-notification-accent` set in unlayered CSS. The second
 * drops `kv-notification` through the `render` function form, and a class of your own styles it.
 * Both keep the icon and the status word.
 */
export const RestyleWithTokens: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-notification-column" lang={lang}>
        <div className="kv-story-notification-rebrand">
          <Notification.Warning data-testid="rebranded">
            <Notification.Title>{text.sample.title}</Notification.Title>
          </Notification.Warning>
        </div>
        <Notification.Warning
          render={(rootProps) => (
            <div {...rootProps} className="kv-story-my-warning" data-testid="own-class" />
          )}
        >
          <Notification.Title>{text.sample.title}</Notification.Title>
        </Notification.Warning>
      </div>
    )
  },
  play: async ({ canvas }) => {
    for (const testId of ['rebranded', 'own-class']) {
      const notification = canvas.getByTestId(testId)
      await expect(notification.querySelector('svg.kv-notification-icon')).not.toBeNull()
      await expect(notification.querySelector('.kv-notification-status')?.textContent).toBe(
        'Varning:',
      )
    }
    await expect(canvas.getByTestId('own-class').className).toBe('kv-story-my-warning')
  },
}

/**
 * Your own look, icon and word: the plain `Notification.Root`, a class that sets the two tokens,
 * your own `<Icon>` first and your own `kv-notification-status` span first in the Title. You own
 * the agreement between the colour, the icon and the word.
 */
export const BringYourOwn: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-notification-column" lang={lang}>
        <Notification.Root className="kv-story-my-notice" data-testid="own">
          <Icon name="info" className="kv-notification-icon" />
          <Notification.Title>
            <span className="kv-notification-status">{text.ownStatus.word}</span>{' '}
            {text.sample.title}
          </Notification.Title>
        </Notification.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    const own = canvas.getByTestId('own')
    await expect(own.className).toBe('kv-story-my-notice kv-notification')
    await expect(canvas.getByRole('heading', { level: 2 }).textContent).toBe(
      'Observera: Något du bör veta',
    )
  },
}

/**
 * `messages` change the status word, never the status: one Danger with `dangerPrefix` on the
 * instance, and a Warning below a provider that overrides `notification.warningPrefix`.
 */
export const MessagesOverride: Story = {
  render: (_args, { globals }) => {
    const { text, lang } = textsFor(localeOf(globals))
    return (
      <div className="kv-story-notification-column" lang={lang}>
        <Notification.Danger messages={{ dangerPrefix: text.override.danger }}>
          <Notification.Title>{text.override.dangerTitle}</Notification.Title>
        </Notification.Danger>
        <KvirnProvider messages={{ notification: { warningPrefix: text.override.warning } }}>
          <Notification.Warning>
            <Notification.Title>{text.override.warningTitle}</Notification.Title>
          </Notification.Warning>
        </KvirnProvider>
      </div>
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
 * In prose and in a Card. A notification is a prose boundary like a card: its title isn't styled
 * as a prose heading, and `kv-prose` on its Body turns prose on inside it. It may sit in a Card
 * body. Never a Card or a Section inside a Notification.
 */
export const InProseAndCard: Story = {
  render: (_args, { globals }) => {
    const { text, lang, formatLocale } = textsFor(localeOf(globals))
    const closes = new Intl.DateTimeFormat(formatLocale, {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2026, 7, 31)))
    return (
      <div className="kv-story-notification-column" lang={lang}>
        <article className="kv-prose">
          <h2>{text.prose.heading}</h2>
          <p>{text.permit.body}</p>
          <Notification.Info data-testid="in-prose">
            <Notification.Title render={(props) => <h3 {...props}>{props.children}</h3>}>
              {text.deadline.title(closes)}
            </Notification.Title>
            <Notification.Body className="kv-prose">
              <p>{text.permit.body}</p>
              <ul>
                <li>{text.saved.title}</li>
                <li>{text.consequence.title}</li>
              </ul>
            </Notification.Body>
          </Notification.Info>
          <p>{text.consequence.title}</p>
        </article>
        <Card.Root>
          <Card.Body>
            <h2>{text.prose.heading}</h2>
            <Notification.Warning data-testid="in-card">
              <Notification.Title render={(props) => <h3 {...props}>{props.children}</h3>}>
                {text.sample.title}
              </Notification.Title>
            </Notification.Warning>
          </Card.Body>
        </Card.Root>
      </div>
    )
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('in-prose').querySelectorAll('li')).toHaveLength(2)
    await expect(canvas.getByTestId('in-card').closest('.kv-card')).not.toBeNull()
  },
}

/** Examples B and D in `kv-compact`: less padding from 64rem, the title at 16px. Staff tools. */
export const Compact: Story = {
  render: (_args, { globals }) => (
    <div className="kv-compact kv-story-notification-column">
      <SavedNotification locale={localeOf(globals)} />
      <SendFailedNotification locale={localeOf(globals)} />
    </div>
  ),
}

/** Finnish text in a narrow column: the title hyphenates or wraps instead of overflowing (1.4.10). */
export const LongFinnishText: Story = {
  globals: { locale: 'fi' },
  render: () => {
    const { text } = textsFor('fi')
    return (
      <div className="kv-story-narrow" data-testid="narrow" lang="fi">
        <Notification.Info>
          <Notification.Title>{text.longFinnish.title}</Notification.Title>
          <Notification.Body>
            <p>{text.permit.body}</p>
          </Notification.Body>
          <Notification.Actions>
            <a href="#renew">{text.permit.renew}</a>
          </Notification.Actions>
        </Notification.Info>
      </div>
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

/** Every example on one page. */
function AllExamplesPage({ locale }: { locale: NotificationFixtureLocale }) {
  return (
    <div className="kv-story-notification-column">
      <DeadlineNotification locale={locale} />
      <PermitNotification locale={locale} />
      <ConsequenceNotification locale={locale} />
      <SavedExample locale={locale} />
      <SendFailedExample locale={locale} />
    </div>
  )
}

/** Examples A, B, C, C2 and D together: the design spec's uses of a notification on one page. */
export const AllExamples: Story = {
  render: (_args, { globals }) => <AllExamplesPage locale={localeOf(globals)} />,
}

/** Right to left, in English: the bar and the icon sit on the right, and the icons never mirror. */
export const RTL: Story = {
  globals: { dir: 'rtl', locale: 'en' },
  render: () => <AllExamplesPage locale="en" />,
}

/**
 * The box and its bar survive forced colours, and all four statuses share one colour, so the
 * icon's shape and the status word carry the status. The e2e suite checks it with real emulation.
 */
export const ForcedColors: Story = {
  globals: { forcedColors: 'active' },
  render: (_args, { globals }) => (
    <div className="kv-story-notification-column">
      <FourStatuses locale={localeOf(globals)} />
      <AllExamplesPage locale={localeOf(globals)} />
    </div>
  ),
}
