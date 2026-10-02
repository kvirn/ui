import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, StrictMode } from 'react'
import type { Ref } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  Notification,
  NotificationActions,
  NotificationBody,
  NotificationDanger,
  NotificationInfo,
  NotificationRoot,
  NotificationSuccess,
  NotificationTitle,
  NotificationWarning,
} from './notification.tsx'
import type {
  NotificationActionsProps,
  NotificationBodyProps,
  NotificationRootProps,
  NotificationState,
  NotificationStatusRootProps,
  NotificationTitleProps,
} from './notification.tsx'
import { useNotification } from './use-notification.ts'
import type {
  NotificationVariant,
  UseNotificationOptions,
  UseNotificationResult,
} from './use-notification.ts'

// Contract: notification.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/notification/notification.e2e.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const politeRegion = () => page.getByRole('status')
const assertiveRegion = () => page.getByRole('alert')
const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))

/** The one internal table, written out: the class, the icon and the English word per status. */
const statuses = [
  {
    variant: 'info',
    Root: Notification.Info,
    className: 'kv-notification--info',
    iconName: 'info',
    word: 'Information:',
    svWord: 'Information:',
    fiWord: 'Tiedoksi:',
    messageKey: 'infoPrefix',
  },
  {
    variant: 'success',
    Root: Notification.Success,
    className: 'kv-notification--success',
    iconName: 'success',
    word: 'Success:',
    svWord: 'Klart:',
    fiWord: 'Valmis:',
    messageKey: 'successPrefix',
  },
  {
    variant: 'warning',
    Root: Notification.Warning,
    className: 'kv-notification--warning',
    iconName: 'warning',
    word: 'Warning:',
    svWord: 'Varning:',
    fiWord: 'Varoitus:',
    messageKey: 'warningPrefix',
  },
  {
    variant: 'danger',
    Root: Notification.Danger,
    className: 'kv-notification--danger',
    iconName: 'error',
    word: 'Error:',
    svWord: 'Fel:',
    fiWord: 'Virhe:',
    messageKey: 'dangerPrefix',
  },
] as const

const allStatusClasses = statuses.map((status) => status.className)

/** Example C from the design spec: a warning with a title, text and a link. */
function PermitWarning(props: NotificationStatusRootProps) {
  return (
    <Notification.Warning data-testid="notification" {...props}>
      <Notification.Title>Your parking permit expires on 12 November 2026</Notification.Title>
      <Notification.Body>
        <p>Renew it before then, or you may get a parking fine.</p>
      </Notification.Body>
      <Notification.Actions>
        <a href="#renew">Renew parking permit</a>
      </Notification.Actions>
    </Notification.Warning>
  )
}

const classesOf = (element: Element | null | undefined) => [...(element?.classList ?? [])]

const iconPaths = (svg: Element | null) =>
  Array.from(svg?.querySelectorAll('path') ?? [], (path) => path.getAttribute('d')).join('|')

describe('rendering', () => {
  test('Notification.Root renders one <div class="kv-notification"> with no status class, icon or word', async () => {
    const { container } = await render(
      <Notification.Root data-testid="notification">
        <Notification.Title>Observera</Notification.Title>
      </Notification.Root>,
    )
    const root = page.getByTestId('notification').element()
    expect(root.tagName).toBe('DIV')
    expect(root.className).toBe('kv-notification')
    expect(root.querySelector('svg')).toBeNull()
    expect(root.querySelector('.kv-notification-status')).toBeNull()
    expect(page.getByRole('heading', { level: 2 }).element().textContent).toBe('Observera')
    expect(container.children).toHaveLength(1)
  })

  test.each(statuses)(
    'Notification.$variant renders its status class, its icon first and its status word first in the Title',
    async ({ Root, className, iconName, word }) => {
      await render(
        <main>
          <Root data-testid="notification">
            <Notification.Title>Your application was not sent</Notification.Title>
          </Root>
          <Icon name={iconName} data-testid="expected-icon" />
        </main>,
      )
      const root = page.getByTestId('notification').element()
      expect(root.tagName).toBe('DIV')
      expect(classesOf(root)).toEqual(expect.arrayContaining(['kv-notification', className]))
      expect(root.className).toBe(`kv-notification ${className}`)
      // The icon comes first, is decorative, and has the shape of this status.
      const icon = root.firstElementChild
      expect(icon?.tagName.toLowerCase()).toBe('svg')
      expect(classesOf(icon)).toEqual(expect.arrayContaining(['kv-notification-icon', 'kv-icon']))
      expect(icon?.getAttribute('aria-hidden')).toBe('true')
      expect(iconPaths(icon)).toBe(iconPaths(page.getByTestId('expected-icon').element()))
      expect(iconPaths(icon)).not.toBe('')
      // The word comes first in the Title, then a normal space, then the consumer's text.
      const title = page.getByRole('heading', { level: 2 }).element()
      expect(classesOf(title.firstElementChild)).toContain('kv-notification-status')
      expect(title.firstElementChild?.textContent).toBe(word)
      expect(title.textContent).toBe(`${word} Your application was not sent`)
    },
  )

  test('the four ready-made roots use four different icons and four different classes', async () => {
    await render(
      <main>
        {statuses.map(({ variant, Root }) => (
          <Root key={variant} data-testid={variant}>
            <Notification.Title>Same title</Notification.Title>
          </Root>
        ))}
      </main>,
    )
    const shapes = statuses.map(({ variant }) =>
      iconPaths(page.getByTestId(variant).element().querySelector('svg')),
    )
    expect(new Set(shapes).size).toBe(4)
    for (const { variant, className } of statuses) {
      const classNames = [...page.getByTestId(variant).element().classList]
      expect(allStatusClasses.filter((name) => classNames.includes(name))).toEqual([className])
    }
  })

  test('the heading name starts with the status word', async () => {
    await render(
      <main>
        <Notification.Warning>
          <Notification.Title>Your parking permit expires on 12 November 2026</Notification.Title>
        </Notification.Warning>
      </main>,
    )
    await expect
      .element(
        page.getByRole('heading', {
          level: 2,
          name: 'Warning: Your parking permit expires on 12 November 2026',
        }),
      )
      .toBeVisible()
  })

  const roots = [
    ['Root', Notification.Root],
    ['Info', Notification.Info],
    ['Success', Notification.Success],
    ['Warning', Notification.Warning],
    ['Danger', Notification.Danger],
  ] as const

  test.each(roots)('Notification.%s adds no role, live region or tabindex', async (_name, Root) => {
    await render(
      <Root data-testid="notification">
        <Notification.Title>Title</Notification.Title>
        <Notification.Body>Body</Notification.Body>
        <Notification.Actions>
          <a href="#next">Next</a>
        </Notification.Actions>
      </Root>,
    )
    const elements = [
      page.getByTestId('notification').element(),
      ...document.querySelectorAll(
        '.kv-notification-title, .kv-notification-body, .kv-notification-actions, .kv-notification-status, .kv-notification-icon',
      ),
    ]
    expect(elements.length).toBeGreaterThanOrEqual(4)
    for (const element of elements) {
      const names = element.getAttributeNames()
      expect(
        names.filter((name) =>
          ['role', 'aria-live', 'aria-atomic', 'aria-label', 'aria-labelledby'].includes(name),
        ),
      ).toEqual([])
      expect(names).not.toContain('tabindex')
    }
    expect(page.getByRole('alert').elements()).toHaveLength(0)
    expect(page.getByRole('status').elements()).toHaveLength(0)
  })

  test('Title is an h2, Body and Actions are divs, each with its class', async () => {
    await render(<PermitWarning />)
    const title = page.getByRole('heading', { level: 2 }).element()
    expect(title.tagName).toBe('H2')
    expect(title.className).toBe('kv-notification-title')
    const body = document.querySelector('.kv-notification-body')
    const actions = document.querySelector('.kv-notification-actions')
    expect(body?.tagName).toBe('DIV')
    expect(actions?.tagName).toBe('DIV')
    expect(body?.className).toBe('kv-notification-body')
    expect(actions?.className).toBe('kv-notification-actions')
  })

  test('the children come after the icon in DOM order: icon, title, body, actions', async () => {
    await render(<PermitWarning />)
    const root = page.getByTestId('notification').element()
    expect(
      Array.from(root.children, (child) => child.getAttribute('class')?.split(' ')[0]),
    ).toEqual([
      'kv-notification-icon',
      'kv-notification-title',
      'kv-notification-body',
      'kv-notification-actions',
    ])
  })

  test('the Title can be any heading level, or a paragraph, with render', async () => {
    await render(
      <main>
        <h2>Mina sidor</h2>
        <Notification.Success>
          <Notification.Title
            render={(props) => (
              <h3 {...props} data-testid="level-3">
                {props.children}
              </h3>
            )}
          >
            Saved
          </Notification.Title>
        </Notification.Success>
        <Notification.Success>
          <Notification.Title render={<p data-testid="paragraph" />}>
            Saved again
          </Notification.Title>
        </Notification.Success>
      </main>,
    )
    await expect
      .element(page.getByRole('heading', { level: 3, name: 'Success: Saved' }))
      .toBeVisible()
    const level3 = page.getByTestId('level-3').element()
    expect(classesOf(level3)).toContain('kv-notification-title')
    expect(classesOf(level3.firstElementChild)).toContain('kv-notification-status')
    const paragraph = page.getByTestId('paragraph').element()
    expect(paragraph.tagName).toBe('P')
    expect(classesOf(paragraph)).toContain('kv-notification-title')
    expect(paragraph.textContent).toBe('Success: Saved again')
    expect(page.getByRole('heading', { level: 2 }).elements()).toHaveLength(1)
  })

  test('passes attributes through: id, lang and title on the consumer’s element', async () => {
    await render(
      <Notification.Info data-testid="notification" id="deadline" lang="en" title="Info">
        <Notification.Title id="deadline-title" lang="sv">
          Sista dag
        </Notification.Title>
      </Notification.Info>,
    )
    const root = page.getByTestId('notification')
    await expect.element(root).toHaveAttribute('id', 'deadline')
    await expect.element(root).toHaveAttribute('lang', 'en')
    await expect.element(root).toHaveAttribute('title', 'Info')
    await expect.element(page.getByRole('heading')).toHaveAttribute('id', 'deadline-title')
    await expect.element(page.getByRole('heading')).toHaveAttribute('lang', 'sv')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(
      <Notification.Danger data-testid="notification" className="mitt-meddelande">
        <Notification.Title className="min-rubrik">Title</Notification.Title>
        <Notification.Body className="min-text">Body</Notification.Body>
        <Notification.Actions className="mina-knappar">
          <a href="#next">Next</a>
        </Notification.Actions>
      </Notification.Danger>,
    )
    await expect
      .element(page.getByTestId('notification'))
      .toHaveClass('kv-notification', 'kv-notification--danger', 'mitt-meddelande')
    await expect
      .element(page.getByRole('heading'))
      .toHaveClass('kv-notification-title', 'min-rubrik')
    expect(classesOf(document.querySelector('.kv-notification-body'))).toContain('min-text')
    expect(classesOf(document.querySelector('.kv-notification-actions'))).toContain('mina-knappar')
  })

  test.each(statuses)(
    'Notification.$variant keeps its class and icon when a render element sets another class',
    async ({ Root, className }) => {
      await render(
        <Root render={<section className="annat" aria-labelledby="t" data-testid="notification" />}>
          <Notification.Title id="t">Title</Notification.Title>
        </Root>,
      )
      const root = page.getByTestId('notification').element()
      expect(root.tagName).toBe('SECTION')
      expect(classesOf(root)).toEqual(
        expect.arrayContaining(['kv-notification', className, 'annat']),
      )
      expect(root.querySelector('svg')).not.toBeNull()
      expect(root.querySelector('.kv-notification-status')).not.toBeNull()
    },
  )

  test('the render function form can replace the class: the icon and the word stay', async () => {
    await render(
      <Notification.Warning
        render={(rootProps) => <div {...rootProps} className="my-warning" data-testid="own" />}
      >
        <Notification.Title>Check your answers</Notification.Title>
      </Notification.Warning>,
    )
    const root = page.getByTestId('own').element()
    expect(root.className).toBe('my-warning')
    expect(root.querySelector('svg.kv-notification-icon')).not.toBeNull()
    expect(page.getByRole('heading').element().textContent).toBe('Warning: Check your answers')
    // Our own class was dropped on purpose: that is not a conflict.
    expect(warnings()).toEqual([])
  })

  test('the render function gets the part props and an empty state', async () => {
    const seen: NotificationState[] = []
    await render(
      <Notification.Actions
        className="knappar"
        render={(actionsProps, state) => {
          seen.push(state)
          return <div {...actionsProps} data-testid="actions" />
        }}
      >
        <a href="#next">Next</a>
      </Notification.Actions>,
    )
    await expect
      .element(page.getByTestId('actions'))
      .toHaveClass('kv-notification-actions', 'knappar')
    expect(seen.at(-1)).toEqual({})
  })

  test('the named exports are the compound parts', () => {
    expect(NotificationRoot).toBe(Notification.Root)
    expect(NotificationInfo).toBe(Notification.Info)
    expect(NotificationSuccess).toBe(Notification.Success)
    expect(NotificationWarning).toBe(Notification.Warning)
    expect(NotificationDanger).toBe(Notification.Danger)
    expect(NotificationTitle).toBe(Notification.Title)
    expect(NotificationBody).toBe(Notification.Body)
    expect(NotificationActions).toBe(Notification.Actions)
  })

  test('the plain Root renders the same box, so the compound has no status of its own', async () => {
    await render(
      <Notification.Root className="kv-notification--custom" data-testid="notification">
        <Notification.Title>Title</Notification.Title>
      </Notification.Root>,
    )
    expect(page.getByTestId('notification').element().className).toBe(
      'kv-notification--custom kv-notification',
    )
  })

  test.each(statuses)('Notification.$variant has no axe violations', async ({ Root }) => {
    const { container } = await render(
      <main>
        <h1>Mina sidor</h1>
        <Root>
          <Notification.Title>Your parking permit expires on 12 November 2026</Notification.Title>
          <Notification.Body>
            <p>Renew it before then.</p>
          </Notification.Body>
          <Notification.Actions>
            <a href="#renew">Renew parking permit</a>
          </Notification.Actions>
        </Root>
      </main>,
    )
    await expect.element(page.getByRole('heading', { level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('the plain Root with its own icon and word has no axe violations', async () => {
    const { container } = await render(
      <main>
        <h1>Mina sidor</h1>
        <Notification.Root className="my-notice">
          <Icon name="info" className="kv-notification-icon" />
          <Notification.Title>
            <span className="kv-notification-status">Observera:</span> Kontoret är stängt på fredag
          </Notification.Title>
        </Notification.Root>
      </main>,
    )
    await expect.element(page.getByRole('heading', { level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('refs', () => {
  test('forwards the ref of every part to its element', async () => {
    const rootRef = createRef<HTMLElement>()
    const titleRef = createRef<HTMLElement>()
    const bodyRef = createRef<HTMLElement>()
    const actionsRef = createRef<HTMLElement>()
    await render(
      <Notification.Danger ref={rootRef} data-testid="notification">
        <Notification.Title ref={titleRef}>Title</Notification.Title>
        <Notification.Body ref={bodyRef}>Body</Notification.Body>
        <Notification.Actions ref={actionsRef}>
          <a href="#next">Next</a>
        </Notification.Actions>
      </Notification.Danger>,
    )
    expect(rootRef.current).toBe(page.getByTestId('notification').element())
    expect(titleRef.current).toBe(page.getByRole('heading').element())
    expect(bodyRef.current).toBe(document.querySelector('.kv-notification-body'))
    expect(actionsRef.current).toBe(document.querySelector('.kv-notification-actions'))
  })

  test('both the consumer’s ref and a render element’s ref get the element', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Notification.Info
        ref={partRef}
        render={<aside ref={elementRef} data-testid="notification" />}
      >
        <Notification.Title>Title</Notification.Title>
      </Notification.Info>,
    )
    const element = page.getByTestId('notification').element()
    expect(partRef.current).toBe(element)
    expect(elementRef.current).toBe(element)
  })
})

describe('the status word (i18n)', () => {
  test.each(statuses)(
    'Notification.$variant says "$word" in en without a provider, "$svWord" in sv and "$fiWord" in fi',
    async ({ Root, word, svWord, fiWord }) => {
      const english = await render(
        <Root>
          <Notification.Title>Title</Notification.Title>
        </Root>,
      )
      await expect.element(page.getByRole('heading')).toHaveTextContent(`${word} Title`)
      await english.unmount()

      const swedish = await render(
        <KvirnProvider locale="sv-SE" messages={sv}>
          <Root>
            <Notification.Title>Rubrik</Notification.Title>
          </Root>
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('heading')).toHaveTextContent(`${svWord} Rubrik`)
      await swedish.unmount()

      await render(
        <KvirnProvider locale="fi-FI" messages={fi}>
          <Root>
            <Notification.Title>Otsikko</Notification.Title>
          </Root>
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('heading')).toHaveTextContent(`${fiWord} Otsikko`)
    },
  )

  test('the status words of every shipped locale are filled in and end with a colon', () => {
    for (const catalog of [sv, fi]) {
      for (const text of Object.values(catalog.notification)) {
        expect(typeof text === 'string' ? text.trim() : '').toMatch(/:$/)
      }
    }
  })

  test('a per-instance message overrides the word, and the provider’s comes next (ADR-0007)', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{ notification: { dangerPrefix: 'Viktigt:' } }}>
          <Notification.Danger>
            <Notification.Title>Vi kunde inte skicka</Notification.Title>
          </Notification.Danger>
          <Notification.Warning>
            <Notification.Title>Förnya</Notification.Title>
          </Notification.Warning>
          <Notification.Danger messages={{ dangerPrefix: 'Stopp:' }}>
            <Notification.Title>Inte sparat</Notification.Title>
          </Notification.Danger>
        </KvirnProvider>
      </KvirnProvider>,
    )
    const headings = page.getByRole('heading').elements()
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Viktigt: Vi kunde inte skicka',
      'Varning: Förnya',
      'Stopp: Inte sparat',
    ])
  })

  test('each ready-made root reads only its own key', async () => {
    await render(
      <Notification.Warning messages={{ dangerPrefix: 'Viktigt:', infoPrefix: 'Notis:' }}>
        <Notification.Title>Title</Notification.Title>
      </Notification.Warning>,
    )
    await expect.element(page.getByRole('heading')).toHaveTextContent('Warning: Title')
  })

  test('an override changes the word, never the status class or the icon', async () => {
    await render(
      <Notification.Danger messages={{ dangerPrefix: 'Viktigt:' }} data-testid="notification">
        <Notification.Title>Title</Notification.Title>
      </Notification.Danger>,
    )
    const root = page.getByTestId('notification').element()
    expect(classesOf(root)).toContain('kv-notification--danger')
    expect(root.querySelector('.kv-notification-icon')).not.toBeNull()
    await expect.element(page.getByRole('heading')).toHaveTextContent('Viktigt: Title')
  })

  test('an empty or whitespace-only override falls through and warns', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Notification.Danger messages={{ dangerPrefix: ' ' }}>
          <Notification.Title>Rubrik</Notification.Title>
        </Notification.Danger>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('heading')).toHaveTextContent('Fel: Rubrik')
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('notification.dangerPrefix')
  })

  test('the plain Root uses none of the four keys', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Notification.Root>
          <Notification.Title>Observera</Notification.Title>
        </Notification.Root>
      </KvirnProvider>,
    )
    expect(page.getByRole('heading').element().textContent).toBe('Observera')
  })
})

describe('announce', () => {
  /** Records every text the polite region holds, so "once" and "never" can be asserted. */
  function watch(region: () => ReturnType<typeof politeRegion>) {
    const seen: string[] = []
    const observer = new MutationObserver(() => {
      seen.push(region().element().textContent)
    })
    observer.observe(region().element(), { childList: true, characterData: true, subtree: true })
    return { seen, stop: () => observer.disconnect() }
  }

  const settle = () => new Promise((resolve) => setTimeout(resolve, 250))

  test('a root with announce="polite" puts its Title and Body text in the polite region once', async () => {
    const view = await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <main />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    const { seen, stop } = watch(politeRegion)

    await view.rerender(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <main>
          <Notification.Success announce="polite">
            <Notification.Title render={<p />}>Dina ändringar är sparade</Notification.Title>
            <Notification.Body>
              <p>Du får ett beslut inom 4 veckor.</p>
              <p>Du behöver inte göra något mer.</p>
            </Notification.Body>
            <Notification.Actions>
              <a href="#next">Gå vidare</a>
            </Notification.Actions>
          </Notification.Success>
        </main>
      </KvirnProvider>,
    )

    await expect
      .element(politeRegion())
      .toHaveTextContent(
        'Klart: Dina ändringar är sparade Du får ett beslut inom 4 veckor. Du behöver inte göra något mer.',
      )
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()
    await settle()
    stop()
    // Actions aren't announced, and the text is set once.
    expect(seen.filter((text) => text !== '')).toHaveLength(1)
    expect(politeRegion().element().textContent).not.toContain('Gå vidare')
  })

  test('announce="assertive" goes to the alert region', async () => {
    const view = await render(
      <KvirnProvider>
        <main />
      </KvirnProvider>,
    )
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()

    await view.rerender(
      <KvirnProvider>
        <main>
          <Notification.Danger announce="assertive">
            <Notification.Title>Connection lost</Notification.Title>
            <Notification.Body>What you type now is not saved.</Notification.Body>
          </Notification.Danger>
        </main>
      </KvirnProvider>,
    )

    await expect
      .element(assertiveRegion())
      .toHaveTextContent('Error: Connection lost What you type now is not saved.')
    await expect.element(politeRegion()).toBeEmptyDOMElement()
  })

  test.each([
    ['Root', Notification.Root, 'Observera Kontoret är stängt'],
    ['Info', Notification.Info, 'Information: Observera Kontoret är stängt'],
    ['Success', Notification.Success, 'Success: Observera Kontoret är stängt'],
    ['Warning', Notification.Warning, 'Warning: Observera Kontoret är stängt'],
    ['Danger', Notification.Danger, 'Error: Observera Kontoret är stängt'],
  ] as const)(
    'Notification.%s takes announce and announces its visible text',
    async (_name, Root, expected) => {
      const view = await render(
        <KvirnProvider>
          <main />
        </KvirnProvider>,
      )
      await expect.element(politeRegion()).toBeEmptyDOMElement()
      await view.rerender(
        <KvirnProvider>
          <main>
            <Root announce="polite">
              <Notification.Title>Observera</Notification.Title>
              <Notification.Body>Kontoret är stängt</Notification.Body>
            </Root>
          </main>
        </KvirnProvider>,
      )
      await expect.element(politeRegion()).toHaveTextContent(expected)
    },
  )

  test('nothing is announced without announce, whether present at load or inserted later', async () => {
    const view = await render(
      <KvirnProvider>
        <main>
          <Notification.Info>
            <Notification.Title>Applications close on 31 August</Notification.Title>
          </Notification.Info>
        </main>
      </KvirnProvider>,
    )
    const { seen, stop } = watch(politeRegion)
    await view.rerender(
      <KvirnProvider>
        <main>
          <Notification.Info>
            <Notification.Title>Applications close on 31 August</Notification.Title>
          </Notification.Info>
          <Notification.Danger>
            <Notification.Title>We couldn’t send your application</Notification.Title>
          </Notification.Danger>
        </main>
      </KvirnProvider>,
    )
    await settle()
    stop()
    expect(seen).toEqual([])
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()
  })

  test('a re-render does not announce again, and a remount with a new key does', async () => {
    const view = await render(
      <KvirnProvider>
        <main />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    const { seen, stop } = watch(politeRegion)
    const example = (key: string, text: string) => (
      <KvirnProvider>
        <main>
          <Notification.Danger key={key} announce="polite">
            <Notification.Title>{text}</Notification.Title>
          </Notification.Danger>
        </main>
      </KvirnProvider>
    )

    await view.rerender(example('first', 'We couldn’t send your application'))
    await expect
      .element(politeRegion())
      .toHaveTextContent('Error: We couldn’t send your application')

    // The same instance with new text: still one announcement.
    await view.rerender(example('first', 'We couldn’t send your application'))
    await view.rerender(example('first', 'Something else'))
    await settle()
    expect(seen.filter((text) => text !== '')).toEqual(['Error: We couldn’t send your application'])

    // A new key is a new notification: it announces itself again, even with the same text.
    await view.rerender(example('second', 'We couldn’t send your application'))
    await vi.waitFor(() => {
      expect(seen.filter((text) => text !== '')).toHaveLength(2)
    })
    stop()
  })

  test('announce reads the text once even in Strict Mode’s double effect', async () => {
    const view = await render(
      <StrictMode>
        <KvirnProvider>
          <main />
        </KvirnProvider>
      </StrictMode>,
    )
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    const { seen, stop } = watch(politeRegion)
    await view.rerender(
      <StrictMode>
        <KvirnProvider>
          <main>
            <Notification.Success announce="polite">
              <Notification.Title>Saved</Notification.Title>
            </Notification.Success>
          </main>
        </KvirnProvider>
      </StrictMode>,
    )
    await expect.element(politeRegion()).toHaveTextContent('Success: Saved')
    await settle()
    stop()
    expect(seen.filter((text) => text !== '')).toEqual(['Success: Saved'])
  })

  test('without a KvirnProvider the announcement is dropped and one warning says why', async () => {
    await render(
      <Notification.Info announce="polite">
        <Notification.Title>Saved</Notification.Title>
      </Notification.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('KvirnProvider')
  })

  test('without announce and without a provider there is no warning', async () => {
    await render(
      <Notification.Info>
        <Notification.Title>Saved</Notification.Title>
      </Notification.Info>,
    )
    expect(warnings()).toEqual([])
  })
})

describe('development warnings', () => {
  test('a root without a Title warns that it needs one', async () => {
    await render(
      <Notification.Info>
        <Notification.Body>Text without a title</Notification.Body>
      </Notification.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('needs a Title')
  })

  test('a root with a Title does not warn', async () => {
    await render(<PermitWarning />)
    expect(warnings()).toEqual([])
  })

  test('a Title, Body or Actions outside a root each warn once', async () => {
    await render(
      <>
        <Notification.Title>Loose title</Notification.Title>
        <Notification.Body>Loose body</Notification.Body>
        <Notification.Actions>Loose actions</Notification.Actions>
      </>,
    )
    const messages = warnings()
    expect(messages).toHaveLength(3)
    expect(messages.some((message) => message.includes('Notification.Title'))).toBe(true)
    expect(messages.some((message) => message.includes('Notification.Body'))).toBe(true)
    expect(messages.some((message) => message.includes('Notification.Actions'))).toBe(true)
    // They still render, with their class, and no status word.
    expect(document.querySelector('.kv-notification-title')).not.toBeNull()
    expect(document.querySelector('.kv-notification-status')).toBeNull()
  })

  test.each([
    ['role="alert"', { role: 'alert' }],
    ['role="status"', { role: 'status' }],
    ['aria-live', { 'aria-live': 'polite' }],
  ] as const)('a root given %s warns that the Announcer already does it', async (_name, props) => {
    await render(
      <Notification.Info {...props}>
        <Notification.Title>Title</Notification.Title>
      </Notification.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('Announcer')
  })

  test('a root with tabindex and announce warns that it would be read twice', async () => {
    await render(
      <KvirnProvider>
        <main>
          <Notification.Danger tabIndex={-1} announce="polite">
            <Notification.Title>Title</Notification.Title>
          </Notification.Danger>
        </main>
      </KvirnProvider>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('tabindex and announce')
  })

  test('a root with tabindex and no announce does not warn', async () => {
    await render(
      <Notification.Danger tabIndex={-1}>
        <Notification.Title>Title</Notification.Title>
      </Notification.Danger>,
    )
    expect(warnings()).toEqual([])
  })

  test('a render element with aria-live warns the same way', async () => {
    await render(
      <Notification.Info render={<section aria-live="polite" />}>
        <Notification.Title>Title</Notification.Title>
      </Notification.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('Announcer')
  })

  test.each([
    ['Info', Notification.Info],
    ['Success', Notification.Success],
  ] as const)('announce="assertive" on Notification.%s warns', async (_name, Root) => {
    await render(
      <KvirnProvider>
        <Root announce="assertive">
          <Notification.Title>Title</Notification.Title>
        </Root>
      </KvirnProvider>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('assertive')
  })

  test.each([
    ['Warning', Notification.Warning],
    ['Danger', Notification.Danger],
  ] as const)('announce="assertive" on Notification.%s does not warn', async (_name, Root) => {
    await render(
      <KvirnProvider>
        <Root announce="assertive">
          <Notification.Title>Title</Notification.Title>
        </Root>
      </KvirnProvider>,
    )
    expect(warnings()).toEqual([])
  })

  test('a ready-made root with another status class in className warns that the colour would disagree', async () => {
    await render(
      <Notification.Warning className="kv-notification--danger">
        <Notification.Title>Title</Notification.Title>
      </Notification.Warning>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('kv-notification--danger')
    expect(warnings()[0]).toContain('Notification.Danger')
  })

  test('a ready-made root with another status class on a render element warns too', async () => {
    await render(
      <Notification.Success render={<div className="kv-notification--warning" />}>
        <Notification.Title>Title</Notification.Title>
      </Notification.Success>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('kv-notification--warning')
  })

  test('a ready-made root with its own status class again does not warn', async () => {
    await render(
      <Notification.Warning className="kv-notification--warning">
        <Notification.Title>Title</Notification.Title>
      </Notification.Warning>,
    )
    expect(warnings()).toEqual([])
  })

  test('the plain Root with one of our status classes warns that the icon and the word are missing', async () => {
    await render(
      <Notification.Root className="kv-notification--danger">
        <Notification.Title>Title</Notification.Title>
      </Notification.Root>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('Notification.Danger')
  })

  test('the plain Root with your own class does not warn', async () => {
    await render(
      <Notification.Root className="my-notice kv-notification--custom">
        <Notification.Title>Title</Notification.Title>
      </Notification.Root>,
    )
    expect(warnings()).toEqual([])
  })
})

describe('useNotification', () => {
  function HookNotification({ options }: { options?: UseNotificationOptions }) {
    const notification = useNotification(options)
    return (
      <div {...notification.rootProps} data-testid="notification">
        {notification.iconProps === undefined ? null : <Icon {...notification.iconProps} />}
        <h2 {...notification.titleProps}>
          {notification.statusProps === undefined ? null : (
            <>
              <span {...notification.statusProps} />{' '}
            </>
          )}
          Din ansökan
        </h2>
        <div {...notification.bodyProps}>Text</div>
        <div {...notification.actionsProps}>
          <a href="#next">Nästa</a>
        </div>
      </div>
    )
  }

  test('without variant it is the plain Root: only the classes, no icon and no word', async () => {
    function Probe() {
      const notification = useNotification()
      return (
        <pre data-testid="result">
          {JSON.stringify({
            root: notification.rootProps.className,
            title: notification.titleProps.className,
            body: notification.bodyProps.className,
            actions: notification.actionsProps.className,
            hasIcon: notification.iconProps !== undefined,
            hasStatus: notification.statusProps !== undefined,
          })}
        </pre>
      )
    }
    await render(<Probe />)
    expect(JSON.parse(page.getByTestId('result').element().textContent)).toEqual({
      root: 'kv-notification',
      title: 'kv-notification-title',
      body: 'kv-notification-body',
      actions: 'kv-notification-actions',
      hasIcon: false,
      hasStatus: false,
    })
  })

  test.each(statuses)(
    'with variant "$variant" it returns the class, the icon and the word of Notification.$variant',
    async ({ variant, className, iconName, word }) => {
      await render(
        <main>
          <HookNotification options={{ variant }} />
          <Icon name={iconName} data-testid="expected-icon" />
        </main>,
      )
      const root = page.getByTestId('notification').element()
      expect(root.className).toBe(`kv-notification ${className}`)
      expect(iconPaths(root.querySelector('svg'))).toBe(
        iconPaths(page.getByTestId('expected-icon').element()),
      )
      expect(classesOf(root.querySelector('svg'))).toContain('kv-notification-icon')
      expect(root.querySelector('.kv-notification-status')?.textContent).toBe(word)
      expect(page.getByRole('heading').element().textContent).toBe(`${word} Din ansökan`)
      expect(warnings()).toEqual([])
    },
  )

  test('the hook’s `messages` and the provider’s change the word', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <HookNotification options={{ variant: 'warning' }} />
        <HookNotification options={{ variant: 'warning', messages: { warningPrefix: 'Obs:' } }} />
      </KvirnProvider>,
    )
    expect(
      page
        .getByRole('heading')
        .elements()
        .map((heading) => heading.textContent),
    ).toEqual(['Varning: Din ansökan', 'Obs: Din ansökan'])
  })

  test('the hook announces too, with the Title and Body it is attached to', async () => {
    const view = await render(
      <KvirnProvider>
        <main />
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toBeEmptyDOMElement()
    await view.rerender(
      <KvirnProvider>
        <main>
          <HookNotification options={{ variant: 'danger', announce: 'polite' }} />
        </main>
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toHaveTextContent('Error: Din ansökan Text')
  })

  test('returns the same objects for the same options', async () => {
    const seen = new Set<UseNotificationResult>()
    function Probe({ tick }: { tick: number }) {
      seen.add(useNotification({ variant: 'info' }))
      return <p>{tick}</p>
    }
    const view = await render(<Probe tick={1} />)
    await view.rerender(<Probe tick={2} />)
    expect(seen.size).toBe(1)
  })
})

describe('server rendering', () => {
  test('renders every part to a string without touching the page', () => {
    const html = renderToString(
      <Notification.Warning className="mitt">
        <Notification.Title>Din ansökan</Notification.Title>
        <Notification.Body>Text</Notification.Body>
        <Notification.Actions />
      </Notification.Warning>,
    ).replaceAll('<!-- -->', '')
    expect(html).toContain('<div class="mitt kv-notification kv-notification--warning">')
    expect(html).toContain(
      '<h2 class="kv-notification-title"><span class="kv-notification-status">Warning:</span> Din ansökan</h2>',
    )
    expect(html).toContain('<div class="kv-notification-body">Text</div>')
    expect(html).toContain('<div class="kv-notification-actions"></div>')
    expect(html).toContain('aria-hidden="true"')
  })

  test('renders the plain Root to a string with no icon and no word', () => {
    const html = renderToString(
      <Notification.Root>
        <Notification.Title>Observera</Notification.Title>
      </Notification.Root>,
    )
    expect(html).toBe(
      '<div class="kv-notification"><h2 class="kv-notification-title">Observera</h2></div>',
    )
  })
})

describe('types', () => {
  test('exports the variant, hook and part prop types', () => {
    expectTypeOf<NotificationVariant>().toEqualTypeOf<'info' | 'success' | 'warning' | 'danger'>()
    expectTypeOf<UseNotificationOptions['variant']>().toEqualTypeOf<
      NotificationVariant | undefined
    >()
    expectTypeOf<UseNotificationOptions['announce']>().toEqualTypeOf<
      'polite' | 'assertive' | undefined
    >()
    expectTypeOf<NotificationRootProps['announce']>().toEqualTypeOf<
      'polite' | 'assertive' | undefined
    >()
    expectTypeOf<NotificationStatusRootProps>().toExtend<NotificationRootProps>()
    expectTypeOf<NotificationStatusRootProps['messages']>().not.toBeNever()
    expectTypeOf<NotificationState>().toEqualTypeOf<Record<string, never>>()
  })

  test('every part takes HTML attributes, a ref to any element and render', () => {
    for (const props of [
      {} as NotificationRootProps,
      {} as NotificationStatusRootProps,
      {} as NotificationTitleProps,
      {} as NotificationBodyProps,
      {} as NotificationActionsProps,
    ]) {
      expectTypeOf(props.className).toEqualTypeOf<string | undefined>()
      expectTypeOf(props.ref).toEqualTypeOf<Ref<HTMLElement> | undefined>()
      expectTypeOf(props.render).not.toBeNever()
    }
  })

  test('a status prop does not exist: choose the status by the component', () => {
    expectTypeOf<NotificationStatusRootProps>().not.toHaveProperty('variant')
    expectTypeOf<NotificationRootProps>().not.toHaveProperty('variant')
  })
})
