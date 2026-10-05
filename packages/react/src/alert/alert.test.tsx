import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, StrictMode } from 'react'
import type { Ref } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Icon } from '../icon/icon.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import {
  Alert,
  AlertActions,
  AlertBody,
  AlertClose,
  AlertDanger,
  AlertInfo,
  AlertRoot,
  AlertSuccess,
  AlertTitle,
  AlertWarning,
} from './alert.tsx'
import type {
  AlertActionsProps,
  AlertBodyProps,
  AlertCloseProps,
  AlertRootProps,
  AlertState,
  AlertStatusRootProps,
  AlertTitleProps,
} from './alert.tsx'
import { useAlert } from './use-alert.ts'
import type { AlertVariant, UseAlertOptions, UseAlertResult } from './use-alert.ts'

// Contract: alert.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/alert/alert.e2e.ts.

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
    Root: Alert.Info,
    className: 'kv-alert--info',
    iconName: 'info',
    word: 'Information:',
    svWord: 'Information:',
    fiWord: 'Tiedoksi:',
    messageKey: 'infoPrefix',
  },
  {
    variant: 'success',
    Root: Alert.Success,
    className: 'kv-alert--success',
    iconName: 'success',
    word: 'Success:',
    svWord: 'Klart:',
    fiWord: 'Valmis:',
    messageKey: 'successPrefix',
  },
  {
    variant: 'warning',
    Root: Alert.Warning,
    className: 'kv-alert--warning',
    iconName: 'warning',
    word: 'Warning:',
    svWord: 'Varning:',
    fiWord: 'Varoitus:',
    messageKey: 'warningPrefix',
  },
  {
    variant: 'danger',
    Root: Alert.Danger,
    className: 'kv-alert--danger',
    iconName: 'error',
    word: 'Error:',
    svWord: 'Fel:',
    fiWord: 'Virhe:',
    messageKey: 'dangerPrefix',
  },
] as const

const allStatusClasses = statuses.map((status) => status.className)

/** Example C from the design spec: a warning with a title, text and a link. */
function PermitWarning(props: AlertStatusRootProps) {
  return (
    <Alert.Warning data-testid="alert" {...props}>
      <Alert.Title>Your parking permit expires on 12 November 2026</Alert.Title>
      <Alert.Body>
        <p>Renew it before then, or you may get a parking fine.</p>
      </Alert.Body>
      <Alert.Actions>
        <a href="#renew">Renew parking permit</a>
      </Alert.Actions>
    </Alert.Warning>
  )
}

const classesOf = (element: Element | null | undefined) => [...(element?.classList ?? [])]

const iconPaths = (svg: Element | null) =>
  Array.from(svg?.querySelectorAll('path') ?? [], (path) => path.getAttribute('d')).join('|')

describe('rendering', () => {
  test('Alert.Root renders one element with the kv-alert class and no status class, icon or word', async () => {
    const { container } = await render(
      <Alert.Root data-testid="alert">
        <Alert.Title>Observera</Alert.Title>
      </Alert.Root>,
    )
    const root = page.getByTestId('alert').element()
    expect(root.className).toBe('kv-alert')
    expect(root.querySelector('svg')).toBeNull()
    expect(root.querySelector('.kv-alert-status')).toBeNull()
    expect(page.getByRole('heading', { level: 2 }).element().textContent).toBe('Observera')
    expect(container.children).toHaveLength(1)
  })

  test.each(statuses)(
    'Alert.$variant renders its status class, its icon first and its status word first in the Title',
    async ({ Root, className, iconName, word }) => {
      await render(
        <main>
          <Root data-testid="alert">
            <Alert.Title>Your application was not sent</Alert.Title>
          </Root>
          <Icon name={iconName} data-testid="expected-icon" />
        </main>,
      )
      const root = page.getByTestId('alert').element()
      expect(root.className).toBe(`kv-alert ${className}`)
      // The icon comes first, is decorative, and has the shape of this status.
      const icon = root.firstElementChild
      expect(classesOf(icon)).toEqual(expect.arrayContaining(['kv-alert-icon', 'kv-icon']))
      expect(icon?.getAttribute('aria-hidden')).toBe('true')
      expect(iconPaths(icon)).toBe(iconPaths(page.getByTestId('expected-icon').element()))
      expect(iconPaths(icon)).not.toBe('')
      // The word comes first in the Title, then a normal space, then the consumer's text.
      const title = page.getByRole('heading', { level: 2 }).element()
      expect(classesOf(title.firstElementChild)).toContain('kv-alert-status')
      expect(title.firstElementChild?.textContent).toBe(word)
      expect(title.textContent).toBe(`${word} Your application was not sent`)
    },
  )

  test('the four ready-made roots use four different icons and four different classes', async () => {
    await render(
      <main>
        {statuses.map(({ variant, Root }) => (
          <Root key={variant} data-testid={variant}>
            <Alert.Title>Same title</Alert.Title>
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
        <Alert.Warning>
          <Alert.Title>Your parking permit expires on 12 November 2026</Alert.Title>
        </Alert.Warning>
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
    ['Root', Alert.Root],
    ['Info', Alert.Info],
    ['Success', Alert.Success],
    ['Warning', Alert.Warning],
    ['Danger', Alert.Danger],
  ] as const

  test.each(roots)('Alert.%s adds no role, live region or tabindex', async (_name, Root) => {
    await render(
      <Root data-testid="alert">
        <Alert.Title>Title</Alert.Title>
        <Alert.Body>Body</Alert.Body>
        <Alert.Actions>
          <a href="#next">Next</a>
        </Alert.Actions>
      </Root>,
    )
    const elements = [
      page.getByTestId('alert').element(),
      ...document.querySelectorAll(
        '.kv-alert-title, .kv-alert-body, .kv-alert-actions, .kv-alert-status, .kv-alert-icon',
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

  test('Title, Body and Actions each have their part class', async () => {
    await render(<PermitWarning />)
    const title = page.getByRole('heading', { level: 2 }).element()
    expect(title.className).toBe('kv-alert-title')
    const body = document.querySelector('.kv-alert-body')
    const actions = document.querySelector('.kv-alert-actions')
    expect(body?.className).toBe('kv-alert-body')
    expect(actions?.className).toBe('kv-alert-actions')
  })

  test('the children come after the icon in DOM order: icon, title, body, actions', async () => {
    await render(<PermitWarning />)
    const root = page.getByTestId('alert').element()
    expect(
      Array.from(root.children, (child) => child.getAttribute('class')?.split(' ')[0]),
    ).toEqual(['kv-alert-icon', 'kv-alert-title', 'kv-alert-body', 'kv-alert-actions'])
  })

  test('the Title can be any heading level, or a paragraph, with render', async () => {
    await render(
      <main>
        <h2>Mina sidor</h2>
        <Alert.Success>
          <Alert.Title
            render={(props) => (
              <h3 {...props} data-testid="level-3">
                {props.children}
              </h3>
            )}
          >
            Saved
          </Alert.Title>
        </Alert.Success>
        <Alert.Success>
          <Alert.Title render={<p data-testid="paragraph" />}>Saved again</Alert.Title>
        </Alert.Success>
      </main>,
    )
    await expect
      .element(page.getByRole('heading', { level: 3, name: 'Success: Saved' }))
      .toBeVisible()
    const paragraph = page.getByTestId('paragraph').element()
    expect(paragraph.tagName).toBe('P')
    expect(paragraph.textContent).toBe('Success: Saved again')
    expect(page.getByRole('heading', { level: 2 }).elements()).toHaveLength(1)
  })

  test('passes attributes through: id, lang and title on the consumer’s element', async () => {
    await render(
      <Alert.Info data-testid="alert" id="deadline" lang="en" title="Info">
        <Alert.Title id="deadline-title" lang="sv">
          Sista dag
        </Alert.Title>
      </Alert.Info>,
    )
    const root = page.getByTestId('alert')
    await expect.element(root).toHaveAttribute('id', 'deadline')
    await expect.element(root).toHaveAttribute('lang', 'en')
    await expect.element(root).toHaveAttribute('title', 'Info')
    await expect.element(page.getByRole('heading')).toHaveAttribute('id', 'deadline-title')
    await expect.element(page.getByRole('heading')).toHaveAttribute('lang', 'sv')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(
      <Alert.Danger data-testid="alert" className="mitt-meddelande">
        <Alert.Title className="min-rubrik">Title</Alert.Title>
        <Alert.Body className="min-text">Body</Alert.Body>
        <Alert.Actions className="mina-knappar">
          <a href="#next">Next</a>
        </Alert.Actions>
      </Alert.Danger>,
    )
    await expect
      .element(page.getByTestId('alert'))
      .toHaveClass('kv-alert', 'kv-alert--danger', 'mitt-meddelande')
    await expect.element(page.getByRole('heading')).toHaveClass('kv-alert-title', 'min-rubrik')
    expect(classesOf(document.querySelector('.kv-alert-body'))).toContain('min-text')
    expect(classesOf(document.querySelector('.kv-alert-actions'))).toContain('mina-knappar')
  })

  test.each(statuses)(
    'Alert.$variant keeps its class and icon when a render element sets another class',
    async ({ Root, className }) => {
      await render(
        <Root render={<section className="annat" aria-labelledby="t" data-testid="alert" />}>
          <Alert.Title id="t">Title</Alert.Title>
        </Root>,
      )
      const root = page.getByTestId('alert').element()
      expect(root.tagName).toBe('SECTION')
      expect(classesOf(root)).toEqual(expect.arrayContaining(['kv-alert', className, 'annat']))
      expect(root.querySelector('svg')).not.toBeNull()
      expect(root.querySelector('.kv-alert-status')).not.toBeNull()
    },
  )

  test('the render function form can replace the class: the icon and the word stay', async () => {
    await render(
      <Alert.Warning
        render={(rootProps) => <div {...rootProps} className="my-warning" data-testid="own" />}
      >
        <Alert.Title>Check your answers</Alert.Title>
      </Alert.Warning>,
    )
    const root = page.getByTestId('own').element()
    expect(root.className).toBe('my-warning')
    expect(root.querySelector('svg.kv-alert-icon')).not.toBeNull()
    expect(page.getByRole('heading').element().textContent).toBe('Warning: Check your answers')
    // Our own class was dropped on purpose: that is not a conflict.
    expect(warnings()).toEqual([])
  })

  test('the render function gets the part props and an empty state', async () => {
    const seen: AlertState[] = []
    await render(
      <Alert.Actions
        render={(actionsProps, state) => {
          seen.push(state)
          return <div {...actionsProps} data-testid="actions" />
        }}
      >
        <a href="#next">Next</a>
      </Alert.Actions>,
    )
    await expect.element(page.getByTestId('actions')).toBeVisible()
    expect(seen.at(-1)).toEqual({})
  })

  test('the named exports are the compound parts', () => {
    expect(AlertRoot).toBe(Alert.Root)
    expect(AlertInfo).toBe(Alert.Info)
    expect(AlertSuccess).toBe(Alert.Success)
    expect(AlertWarning).toBe(Alert.Warning)
    expect(AlertDanger).toBe(Alert.Danger)
    expect(AlertTitle).toBe(Alert.Title)
    expect(AlertBody).toBe(Alert.Body)
    expect(AlertActions).toBe(Alert.Actions)
  })

  test('the plain Root renders the same box, so the compound has no status of its own', async () => {
    await render(
      <Alert.Root className="kv-alert--custom" data-testid="alert">
        <Alert.Title>Title</Alert.Title>
      </Alert.Root>,
    )
    expect(page.getByTestId('alert').element().className).toBe('kv-alert--custom kv-alert')
  })

  test.each(statuses)('Alert.$variant has no axe violations', async ({ Root }) => {
    const { container } = await render(
      <main>
        <h1>Mina sidor</h1>
        <Root>
          <Alert.Title>Your parking permit expires on 12 November 2026</Alert.Title>
          <Alert.Body>
            <p>Renew it before then.</p>
          </Alert.Body>
          <Alert.Actions>
            <a href="#renew">Renew parking permit</a>
          </Alert.Actions>
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
        <Alert.Root className="my-notice">
          <Icon name="info" className="kv-alert-icon" />
          <Alert.Title>
            <span className="kv-alert-status">Observera:</span> Kontoret är stängt på fredag
          </Alert.Title>
        </Alert.Root>
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
      <Alert.Danger ref={rootRef} data-testid="alert">
        <Alert.Title ref={titleRef}>Title</Alert.Title>
        <Alert.Body ref={bodyRef}>Body</Alert.Body>
        <Alert.Actions ref={actionsRef}>
          <a href="#next">Next</a>
        </Alert.Actions>
      </Alert.Danger>,
    )
    expect(rootRef.current).toBe(page.getByTestId('alert').element())
    expect(titleRef.current).toBe(page.getByRole('heading').element())
    expect(bodyRef.current).toBe(document.querySelector('.kv-alert-body'))
    expect(actionsRef.current).toBe(document.querySelector('.kv-alert-actions'))
  })

  test('both the consumer’s ref and a render element’s ref get the element', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Alert.Info ref={partRef} render={<aside ref={elementRef} data-testid="alert" />}>
        <Alert.Title>Title</Alert.Title>
      </Alert.Info>,
    )
    const element = page.getByTestId('alert').element()
    expect(partRef.current).toBe(element)
    expect(elementRef.current).toBe(element)
  })
})

describe('the status word (i18n)', () => {
  test.each(statuses)(
    'Alert.$variant says "$word" in en without a provider, "$svWord" in sv and "$fiWord" in fi',
    async ({ Root, word, svWord, fiWord }) => {
      const english = await render(
        <Root>
          <Alert.Title>Title</Alert.Title>
        </Root>,
      )
      await expect.element(page.getByRole('heading')).toHaveTextContent(`${word} Title`)
      await english.unmount()

      const swedish = await render(
        <KvirnProvider locale="sv-SE" messages={sv}>
          <Root>
            <Alert.Title>Rubrik</Alert.Title>
          </Root>
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('heading')).toHaveTextContent(`${svWord} Rubrik`)
      await swedish.unmount()

      await render(
        <KvirnProvider locale="fi-FI" messages={fi}>
          <Root>
            <Alert.Title>Otsikko</Alert.Title>
          </Root>
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('heading')).toHaveTextContent(`${fiWord} Otsikko`)
    },
  )

  test('the status words of every shipped locale are filled in and end with a colon', () => {
    for (const catalog of [sv, fi]) {
      const words = Object.entries(catalog.alert).filter(([key]) => key.endsWith('Prefix'))
      expect(words).toHaveLength(4)
      for (const [, text] of words) {
        expect(typeof text === 'string' ? text.trim() : '').toMatch(/:$/)
      }
    }
  })

  test('a per-instance message overrides the word, and the provider’s comes next', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{ alert: { dangerPrefix: 'Viktigt:' } }}>
          <Alert.Danger>
            <Alert.Title>Vi kunde inte skicka</Alert.Title>
          </Alert.Danger>
          <Alert.Warning>
            <Alert.Title>Förnya</Alert.Title>
          </Alert.Warning>
          <Alert.Danger messages={{ dangerPrefix: 'Stopp:' }}>
            <Alert.Title>Inte sparat</Alert.Title>
          </Alert.Danger>
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
      <Alert.Warning messages={{ dangerPrefix: 'Viktigt:', infoPrefix: 'Notis:' }}>
        <Alert.Title>Title</Alert.Title>
      </Alert.Warning>,
    )
    await expect.element(page.getByRole('heading')).toHaveTextContent('Warning: Title')
  })

  test('an override changes the word, never the status class or the icon', async () => {
    await render(
      <Alert.Danger messages={{ dangerPrefix: 'Viktigt:' }} data-testid="alert">
        <Alert.Title>Title</Alert.Title>
      </Alert.Danger>,
    )
    const root = page.getByTestId('alert').element()
    expect(classesOf(root)).toContain('kv-alert--danger')
    expect(root.querySelector('.kv-alert-icon')).not.toBeNull()
    await expect.element(page.getByRole('heading')).toHaveTextContent('Viktigt: Title')
  })

  test('an empty or whitespace-only override falls through and warns', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Alert.Danger messages={{ dangerPrefix: ' ' }}>
          <Alert.Title>Rubrik</Alert.Title>
        </Alert.Danger>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('heading')).toHaveTextContent('Fel: Rubrik')
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('alert.dangerPrefix')
  })

  test('the plain Root uses none of the four keys', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Alert.Root>
          <Alert.Title>Observera</Alert.Title>
        </Alert.Root>
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
          <Alert.Success announce="polite">
            <Alert.Title render={<p />}>Dina ändringar är sparade</Alert.Title>
            <Alert.Body>
              <p>Du får ett beslut inom 4 veckor.</p>
              <p>Du behöver inte göra något mer.</p>
            </Alert.Body>
            <Alert.Actions>
              <a href="#next">Gå vidare</a>
            </Alert.Actions>
          </Alert.Success>
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
          <Alert.Danger announce="assertive">
            <Alert.Title>Connection lost</Alert.Title>
            <Alert.Body>What you type now is not saved.</Alert.Body>
          </Alert.Danger>
        </main>
      </KvirnProvider>,
    )

    await expect
      .element(assertiveRegion())
      .toHaveTextContent('Error: Connection lost What you type now is not saved.')
    await expect.element(politeRegion()).toBeEmptyDOMElement()
  })

  test.each([
    ['Root', Alert.Root, 'Observera Kontoret är stängt'],
    ['Info', Alert.Info, 'Information: Observera Kontoret är stängt'],
    ['Success', Alert.Success, 'Success: Observera Kontoret är stängt'],
    ['Warning', Alert.Warning, 'Warning: Observera Kontoret är stängt'],
    ['Danger', Alert.Danger, 'Error: Observera Kontoret är stängt'],
  ] as const)(
    'Alert.%s takes announce and announces its visible text',
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
              <Alert.Title>Observera</Alert.Title>
              <Alert.Body>Kontoret är stängt</Alert.Body>
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
          <Alert.Info>
            <Alert.Title>Applications close on 31 August</Alert.Title>
          </Alert.Info>
        </main>
      </KvirnProvider>,
    )
    const { seen, stop } = watch(politeRegion)
    await view.rerender(
      <KvirnProvider>
        <main>
          <Alert.Info>
            <Alert.Title>Applications close on 31 August</Alert.Title>
          </Alert.Info>
          <Alert.Danger>
            <Alert.Title>We couldn’t send your application</Alert.Title>
          </Alert.Danger>
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
          <Alert.Danger key={key} announce="polite">
            <Alert.Title>{text}</Alert.Title>
          </Alert.Danger>
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

    // A new key is a new alert: it announces itself again, even with the same text.
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
            <Alert.Success announce="polite">
              <Alert.Title>Saved</Alert.Title>
            </Alert.Success>
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
      <Alert.Info announce="polite">
        <Alert.Title>Saved</Alert.Title>
      </Alert.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('KvirnProvider')
  })

  test('without announce and without a provider there is no warning', async () => {
    await render(
      <Alert.Info>
        <Alert.Title>Saved</Alert.Title>
      </Alert.Info>,
    )
    expect(warnings()).toEqual([])
  })
})

describe('development warnings', () => {
  test('a root without a Title warns that it needs one', async () => {
    await render(
      <Alert.Info>
        <Alert.Body>Text without a title</Alert.Body>
      </Alert.Info>,
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
        <Alert.Title>Loose title</Alert.Title>
        <Alert.Body>Loose body</Alert.Body>
        <Alert.Actions>Loose actions</Alert.Actions>
      </>,
    )
    const messages = warnings()
    expect(messages).toHaveLength(3)
    expect(messages.some((message) => message.includes('Alert.Title'))).toBe(true)
    expect(messages.some((message) => message.includes('Alert.Body'))).toBe(true)
    expect(messages.some((message) => message.includes('Alert.Actions'))).toBe(true)
    // They still render, and have no status word.
    await expect.element(page.getByText('Loose title')).toBeVisible()
    expect(document.querySelector('.kv-alert-status')).toBeNull()
  })

  test.each([
    ['role="alert"', { role: 'alert' }],
    ['role="status"', { role: 'status' }],
    ['aria-live', { 'aria-live': 'polite' }],
  ] as const)('a root given %s warns that the Announcer already does it', async (_name, props) => {
    await render(
      <Alert.Info {...props}>
        <Alert.Title>Title</Alert.Title>
      </Alert.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('Announcer')
  })

  test('a root with tabindex and announce warns that it would be read twice', async () => {
    await render(
      <KvirnProvider>
        <main>
          <Alert.Danger tabIndex={-1} announce="polite">
            <Alert.Title>Title</Alert.Title>
          </Alert.Danger>
        </main>
      </KvirnProvider>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('tabindex and announce')
  })

  test('a root with tabindex and no announce does not warn', async () => {
    await render(
      <Alert.Danger tabIndex={-1}>
        <Alert.Title>Title</Alert.Title>
      </Alert.Danger>,
    )
    expect(warnings()).toEqual([])
  })

  test('a render element with aria-live warns the same way', async () => {
    await render(
      <Alert.Info render={<section aria-live="polite" />}>
        <Alert.Title>Title</Alert.Title>
      </Alert.Info>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('Announcer')
  })

  test.each([
    ['Info', Alert.Info],
    ['Success', Alert.Success],
  ] as const)('announce="assertive" on Alert.%s warns', async (_name, Root) => {
    await render(
      <KvirnProvider>
        <Root announce="assertive">
          <Alert.Title>Title</Alert.Title>
        </Root>
      </KvirnProvider>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('assertive')
  })

  test.each([
    ['Warning', Alert.Warning],
    ['Danger', Alert.Danger],
  ] as const)('announce="assertive" on Alert.%s does not warn', async (_name, Root) => {
    await render(
      <KvirnProvider>
        <Root announce="assertive">
          <Alert.Title>Title</Alert.Title>
        </Root>
      </KvirnProvider>,
    )
    expect(warnings()).toEqual([])
  })

  test('a ready-made root with another status class in className warns that the colour would disagree', async () => {
    await render(
      <Alert.Warning className="kv-alert--danger">
        <Alert.Title>Title</Alert.Title>
      </Alert.Warning>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('kv-alert--danger')
    expect(warnings()[0]).toContain('Alert.Danger')
  })

  test('a ready-made root with another status class on a render element warns too', async () => {
    await render(
      <Alert.Success render={<div className="kv-alert--warning" />}>
        <Alert.Title>Title</Alert.Title>
      </Alert.Success>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('kv-alert--warning')
  })

  test('a ready-made root with its own status class again does not warn', async () => {
    await render(
      <Alert.Warning className="kv-alert--warning">
        <Alert.Title>Title</Alert.Title>
      </Alert.Warning>,
    )
    expect(warnings()).toEqual([])
  })

  test('the plain Root with one of our status classes warns that the icon and the word are missing', async () => {
    await render(
      <Alert.Root className="kv-alert--danger">
        <Alert.Title>Title</Alert.Title>
      </Alert.Root>,
    )
    expect(warnings()).toHaveLength(1)
    expect(warnings()[0]).toContain('Alert.Danger')
  })

  test('the plain Root with your own class does not warn', async () => {
    await render(
      <Alert.Root className="my-notice kv-alert--custom">
        <Alert.Title>Title</Alert.Title>
      </Alert.Root>,
    )
    expect(warnings()).toEqual([])
  })
})

describe('useAlert', () => {
  function HookAlert({ options }: { options?: UseAlertOptions }) {
    const alert = useAlert(options)
    return (
      <div {...alert.rootProps} data-testid="alert">
        {alert.iconProps === undefined ? null : <Icon {...alert.iconProps} />}
        <h2 {...alert.titleProps}>
          {alert.statusProps === undefined ? null : (
            <>
              <span {...alert.statusProps} />{' '}
            </>
          )}
          Din ansökan
        </h2>
        <div {...alert.bodyProps}>Text</div>
        <div {...alert.actionsProps}>
          <a href="#next">Nästa</a>
        </div>
      </div>
    )
  }

  test('without variant it is the plain Root: only the classes, no icon and no word', async () => {
    function Probe() {
      const alert = useAlert()
      return (
        <pre data-testid="result">
          {JSON.stringify({
            root: alert.rootProps.className,
            title: alert.titleProps.className,
            body: alert.bodyProps.className,
            actions: alert.actionsProps.className,
            hasIcon: alert.iconProps !== undefined,
            hasStatus: alert.statusProps !== undefined,
          })}
        </pre>
      )
    }
    await render(<Probe />)
    expect(JSON.parse(page.getByTestId('result').element().textContent)).toEqual({
      root: 'kv-alert',
      title: 'kv-alert-title',
      body: 'kv-alert-body',
      actions: 'kv-alert-actions',
      hasIcon: false,
      hasStatus: false,
    })
  })

  test.each(statuses)(
    'with variant "$variant" it returns the class, the icon and the word of Alert.$variant',
    async ({ variant, className, iconName, word }) => {
      await render(
        <main>
          <HookAlert options={{ variant }} />
          <Icon name={iconName} data-testid="expected-icon" />
        </main>,
      )
      const root = page.getByTestId('alert').element()
      expect(root.className).toBe(`kv-alert ${className}`)
      expect(iconPaths(root.querySelector('svg'))).toBe(
        iconPaths(page.getByTestId('expected-icon').element()),
      )
      expect(classesOf(root.querySelector('svg'))).toContain('kv-alert-icon')
      expect(root.querySelector('.kv-alert-status')?.textContent).toBe(word)
      expect(page.getByRole('heading').element().textContent).toBe(`${word} Din ansökan`)
      expect(warnings()).toEqual([])
    },
  )

  test('the hook’s `messages` and the provider’s change the word', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <HookAlert options={{ variant: 'warning' }} />
        <HookAlert options={{ variant: 'warning', messages: { warningPrefix: 'Obs:' } }} />
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
          <HookAlert options={{ variant: 'danger', announce: 'polite' }} />
        </main>
      </KvirnProvider>,
    )
    await expect.element(politeRegion()).toHaveTextContent('Error: Din ansökan Text')
  })

  test('closeProps give a named button of its own: the class, the type and the resolved name', async () => {
    function Probe() {
      const alert = useAlert()
      return <button {...alert.closeProps} data-testid="close" />
    }
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Probe />
      </KvirnProvider>,
    )
    const button = page.getByRole('button', { name: 'Stäng meddelandet' })
    await expect.element(button).toHaveAttribute('type', 'button')
    expect(button.element().className).toBe('kv-alert-close')
  })

  test('returns the same objects for the same options', async () => {
    const seen = new Set<UseAlertResult>()
    function Probe({ tick }: { tick: number }) {
      seen.add(useAlert({ variant: 'info' }))
      return <p>{tick}</p>
    }
    const view = await render(<Probe tick={1} />)
    await view.rerender(<Probe tick={2} />)
    expect(seen.size).toBe(1)
  })
})

describe('Alert.Close', () => {
  const closeIconPaths = () =>
    iconPaths(document.querySelector('[data-testid="expected-close-icon"]'))

  test('is a native button of type button with the decorative close icon, named by alert.close', async () => {
    await render(
      <main>
        <Alert.Info>
          <Alert.Title>Title</Alert.Title>
          <Alert.Close />
        </Alert.Info>
        <Icon name="close" data-testid="expected-close-icon" />
      </main>,
    )
    const button = page.getByRole('button', { name: 'Close message' })
    await expect.element(button).toHaveAttribute('type', 'button')
    expect(button.element().tagName).toBe('BUTTON')
    expect(button.element().className).toBe('kv-alert-close')
    const icon = button.element().querySelector('svg')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(iconPaths(icon)).toBe(closeIconPaths())
    expect(iconPaths(icon)).not.toBe('')
    expect(button.element().textContent).toBe('')
  })

  test('the alert box stays without a role, a live region, a tabindex or a name of its own', async () => {
    await render(
      <Alert.Warning data-testid="alert">
        <Alert.Title>Title</Alert.Title>
        <Alert.Close />
      </Alert.Warning>,
    )
    const root = page.getByTestId('alert').element()
    expect(
      root
        .getAttributeNames()
        .filter((name) =>
          [
            'role',
            'aria-live',
            'aria-atomic',
            'aria-label',
            'aria-labelledby',
            'tabindex',
          ].includes(name),
        ),
    ).toEqual([])
    expect(page.getByRole('alert').elements()).toHaveLength(0)
    expect(page.getByRole('status').elements()).toHaveLength(0)
  })

  test('a plain Alert.Root takes a close button too', async () => {
    await render(
      <Alert.Root>
        <Alert.Title>Title</Alert.Title>
        <Alert.Close />
      </Alert.Root>,
    )
    await expect.element(page.getByRole('button', { name: 'Close message' })).toBeVisible()
    expect(warnings()).toEqual([])
  })

  test('is exported by its flat name and as a part of the Alert namespace', () => {
    expect(AlertClose).toBe(Alert.Close)
    expect(Alert.Close.displayName).toBe('Alert.Close')
  })

  test.each([
    ['sv-SE', sv, 'Stäng meddelandet'],
    ['fi-FI', fi, 'Sulje ilmoitus'],
    ['en', en, 'Close message'],
  ] as const)('its name follows the locale (%s)', async (locale, messages, name) => {
    await render(
      <KvirnProvider locale={locale} messages={messages}>
        <Alert.Danger>
          <Alert.Title>Title</Alert.Title>
          <Alert.Close />
        </Alert.Danger>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('button', { name })).toBeVisible()
  })

  test('every shipped locale has a non-empty name for it', () => {
    for (const catalog of [sv, fi, nb, nn, se, en]) {
      expect(typeof catalog.alert.close === 'string' ? catalog.alert.close.trim() : '').not.toBe('')
    }
  })

  test('the name can be overridden per provider, per alert and per button, the closest first', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <KvirnProvider messages={{ alert: { close: 'Dölj' } }}>
          <Alert.Info>
            <Alert.Title>Provider</Alert.Title>
            <Alert.Close />
          </Alert.Info>
          <Alert.Info messages={{ close: 'Göm' }}>
            <Alert.Title>Alert</Alert.Title>
            <Alert.Close />
          </Alert.Info>
          <Alert.Info messages={{ close: 'Göm' }}>
            <Alert.Title>Button</Alert.Title>
            <Alert.Close messages={{ close: 'Avfärda' }} />
          </Alert.Info>
        </KvirnProvider>
      </KvirnProvider>,
    )
    expect(
      page
        .getByRole('button')
        .elements()
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Dölj', 'Göm', 'Avfärda'])
  })

  test('an empty override falls through to the locale text and warns', async () => {
    await render(
      <KvirnProvider locale="sv-SE" messages={sv}>
        <Alert.Info>
          <Alert.Title>Title</Alert.Title>
          <Alert.Close messages={{ close: ' ' }} />
        </Alert.Info>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('button', { name: 'Stäng meddelandet' })).toBeVisible()
    expect(warnings().some((message) => message.includes('alert.close'))).toBe(true)
  })

  test('the consumer’s aria-label replaces ours, and visible children name the button instead', async () => {
    await render(
      <Alert.Info>
        <Alert.Title>Title</Alert.Title>
        <Alert.Close aria-label="Stäng rutan" />
        <Alert.Close>Dölj</Alert.Close>
        <Alert.Close>{null}</Alert.Close>
        <Alert.Close>{false}</Alert.Close>
      </Alert.Info>,
    )
    // Children that render nothing leave the icon and the name in place (4.1.2).
    expect(page.getByRole('button', { name: 'Close message' }).elements()).toHaveLength(2)
    await expect.element(page.getByRole('button', { name: 'Stäng rutan' })).toBeVisible()
    const labelled = page.getByRole('button', { name: 'Dölj' })
    await expect.element(labelled).toBeVisible()
    await expect.element(labelled).not.toHaveAttribute('aria-label')
    expect(labelled.element().querySelector('svg')).toBeNull()
  })

  test('onClick runs on click, and the alert owns no state: it stays until you remove it', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <Alert.Info data-testid="alert">
        <Alert.Title>Title</Alert.Title>
        <Alert.Close onClick={onClick} />
      </Alert.Info>,
    )
    const button = page.getByRole('button', { name: 'Close message' })
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    await expect.element(page.getByTestId('alert')).toBeVisible()
  })

  test('dismissing does not change politeness: announce reads the Title and Body, never the button', async () => {
    await render(
      <KvirnProvider>
        <Alert.Success announce="polite">
          <Alert.Title>Sparat</Alert.Title>
          <Alert.Body>Dina ändringar är sparade</Alert.Body>
          <Alert.Close />
        </Alert.Success>
      </KvirnProvider>,
    )
    await expect
      .element(politeRegion())
      .toHaveTextContent('Success: Sparat Dina ändringar är sparade')
    await expect.element(politeRegion()).not.toHaveTextContent('Close message')
    await expect.element(assertiveRegion()).toBeEmptyDOMElement()
  })

  test('disabled is native: no handler on click, skipped by Tab', async () => {
    const onClick = vi.fn<() => void>()
    await render(
      <>
        <Alert.Info>
          <Alert.Title>Title</Alert.Title>
          <Alert.Close disabled onClick={onClick} />
        </Alert.Info>
        <button type="button">After</button>
      </>,
    )
    const button = page.getByRole('button', { name: 'Close message' })
    await expect.element(button).toBeDisabled()
    await expect.element(button).toHaveAttribute('data-disabled', '')
    await userEvent.click(button, { force: true })
    expect(onClick).not.toHaveBeenCalled()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus()
  })

  test('a render element keeps its attributes, and its own onClick is gated by disabled', async () => {
    const elementClick = vi.fn<() => void>()
    const propClick = vi.fn<() => void>()
    await render(
      <Alert.Info>
        <Alert.Title>Title</Alert.Title>
        <Alert.Close
          onClick={propClick}
          render={
            <button data-testid="own" className="mitt" onClick={elementClick} aria-label="Own" />
          }
        />
        <Alert.Close
          disabled
          onClick={propClick}
          render={<button data-testid="own-disabled" onClick={elementClick} aria-label="Own" />}
        />
      </Alert.Info>,
    )
    const own = page.getByTestId('own')
    expect(own.element().className).toBe('kv-alert-close mitt')
    await userEvent.click(own)
    expect(elementClick).toHaveBeenCalledTimes(1)
    expect(propClick).toHaveBeenCalledTimes(1)
    await userEvent.click(page.getByTestId('own-disabled'), { force: true })
    expect(elementClick).toHaveBeenCalledTimes(1)
    expect(propClick).toHaveBeenCalledTimes(1)
  })

  test('the function form of render gets the button props and the state', async () => {
    await render(
      <Alert.Info>
        <Alert.Title>Title</Alert.Title>
        <Alert.Close
          render={(props, state) => (
            <button {...props} data-testid="own" data-state={String(state.isDisabled)} />
          )}
        />
      </Alert.Info>,
    )
    const own = page.getByTestId('own')
    await expect.element(own).toHaveAttribute('aria-label', 'Close message')
    await expect.element(own).toHaveAttribute('data-state', 'false')
    expect(own.element().className).toBe('kv-alert-close')
  })

  test('forwards its ref to the button, merged with a render element’s ref', async () => {
    const partRef = createRef<HTMLButtonElement>()
    const elementRef = createRef<HTMLButtonElement>()
    await render(
      <Alert.Info>
        <Alert.Title>Title</Alert.Title>
        <Alert.Close
          ref={partRef}
          render={<button ref={elementRef} data-testid="own" aria-label="Own" />}
        />
      </Alert.Info>,
    )
    const element = page.getByTestId('own').element()
    expect(partRef.current).toBe(element)
    expect(elementRef.current).toBe(element)
  })

  test('warns once outside an Alert root, and when render is not a button', async () => {
    await render(
      <>
        <Alert.Close />
        <Alert.Info>
          <Alert.Title>Title</Alert.Title>
          <Alert.Close render={<div />} />
        </Alert.Info>
      </>,
    )
    expect(warnings().filter((message) => message.includes('Alert.Close is outside'))).toHaveLength(
      1,
    )
    expect(warnings().some((message) => message.includes('must render a <button>'))).toBe(true)
  })

  test.each(statuses)(
    'Alert.$variant with a close button has no axe violations',
    async ({ Root }) => {
      const { container } = await render(
        <main>
          <h1>Mina sidor</h1>
          <Root>
            <Alert.Title>Your parking permit expires on 12 November 2026</Alert.Title>
            <Alert.Body>
              <p>Renew it before then.</p>
            </Alert.Body>
            <Alert.Actions>
              <a href="#renew">Renew parking permit</a>
            </Alert.Actions>
            <Alert.Close />
          </Root>
        </main>,
      )
      await expect.element(page.getByRole('button', { name: 'Close message' })).toBeVisible()
      await expectNoA11yViolations(container)
    },
  )

  test('renders to a string on the server', () => {
    const html = renderToString(
      <Alert.Info>
        <Alert.Title>Din ansökan</Alert.Title>
        <Alert.Close />
      </Alert.Info>,
    )
    expect(html).toContain('aria-label="Close message"')
    expect(html).toContain('type="button"')
  })
})

describe('server rendering', () => {
  test('renders every part to a string without touching the page', () => {
    const html = renderToString(
      <Alert.Warning className="mitt">
        <Alert.Title>Din ansökan</Alert.Title>
        <Alert.Body>Text</Alert.Body>
        <Alert.Actions />
      </Alert.Warning>,
    ).replaceAll('<!-- -->', '')
    expect(html).toContain('Warning:')
    expect(html).toContain('Din ansökan')
    expect(html).toContain('>Text<')
    expect(html).toContain('aria-hidden="true"')
  })

  test('renders the plain Root to a string with no icon and no word', () => {
    const html = renderToString(
      <Alert.Root>
        <Alert.Title>Observera</Alert.Title>
      </Alert.Root>,
    )
    expect(html).toContain('Observera')
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('aria-hidden')
  })
})

describe('types', () => {
  test('exports the variant, hook and part prop types', () => {
    expectTypeOf<AlertVariant>().toEqualTypeOf<'info' | 'success' | 'warning' | 'danger'>()
    expectTypeOf<UseAlertOptions['variant']>().toEqualTypeOf<AlertVariant | undefined>()
    expectTypeOf<UseAlertOptions['announce']>().toEqualTypeOf<'polite' | 'assertive' | undefined>()
    expectTypeOf<AlertRootProps['announce']>().toEqualTypeOf<'polite' | 'assertive' | undefined>()
    expectTypeOf<AlertStatusRootProps>().toExtend<AlertRootProps>()
    expectTypeOf<AlertStatusRootProps['messages']>().not.toBeNever()
    expectTypeOf<AlertState>().toEqualTypeOf<Record<string, never>>()
  })

  test('every part takes HTML attributes, a ref to any element and render', () => {
    for (const props of [
      {} as AlertRootProps,
      {} as AlertStatusRootProps,
      {} as AlertTitleProps,
      {} as AlertBodyProps,
      {} as AlertActionsProps,
    ]) {
      expectTypeOf(props.className).toEqualTypeOf<string | undefined>()
      expectTypeOf(props.ref).toEqualTypeOf<Ref<HTMLElement> | undefined>()
      expectTypeOf(props.render).not.toBeNever()
    }
  })

  test('the close button takes button attributes, a button ref, messages and render', () => {
    const props = {} as AlertCloseProps
    expectTypeOf(props.onClick).not.toBeNever()
    expectTypeOf(props.disabled).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(props.ref).not.toBeNever()
    expectTypeOf(props.messages).not.toBeNever()
    expectTypeOf(props.render).not.toBeNever()
    expectTypeOf<AlertCloseProps>().not.toHaveProperty('type')
  })

  test('a status prop does not exist: choose the status by the component', () => {
    expectTypeOf<AlertStatusRootProps>().not.toHaveProperty('variant')
    expectTypeOf<AlertRootProps>().not.toHaveProperty('variant')
  })
})
