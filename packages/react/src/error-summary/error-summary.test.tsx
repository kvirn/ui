import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, StrictMode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import {
  ErrorSummary,
  ErrorSummaryItem,
  ErrorSummaryLink,
  ErrorSummaryList,
  ErrorSummaryRoot,
  ErrorSummaryTitle,
} from './error-summary.tsx'
import type { ErrorSummaryLinkProps, ErrorSummaryRootProps } from './error-summary.tsx'
import { useErrorSummary } from './use-error-summary.ts'
import type { ErrorSummaryLinkPartProps } from './use-error-summary.ts'

// Contract: error-summary.a11y.md. How it looks is the theme's, proved in the stories.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
  history.replaceState(null, '', window.location.pathname + window.location.search)
})

const warnings = () => consoleWarn.mock.calls.map(([message]) => String(message))
const summary = () => page.getByRole('group', { name: /There is a problem/ })

/** The summary above two fields and a group, like a failed submit on a question page. */
function Form({
  focusKey,
  prefixDocumentTitle,
  showSummary = true,
  rootProps,
}: {
  focusKey?: number
  prefixDocumentTitle?: boolean
  showSummary?: boolean
  rootProps?: Partial<ErrorSummaryRootProps>
}) {
  return (
    <>
      {/* Unstyled links: a 24px minimum keeps them clear of axe's target-size rule (2.5.8). */}
      <style>{'a { display: inline-block; min-block-size: 24px; }'}</style>
      <a href="/back">Tillbaka</a>
      {showSummary ? (
        <ErrorSummary.Root
          focusKey={focusKey}
          prefixDocumentTitle={prefixDocumentTitle}
          {...rootProps}
        >
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId="email">Ange din e-postadress</ErrorSummary.Link>
            </ErrorSummary.Item>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId="kontakt-epost">Välj hur vi når dig</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      ) : null}
      <form>
        <Field.Root controlId="email" invalid>
          <Field.Label>E-post</Field.Label>
          <TextInput />
          <Field.ErrorMessage>Ange din e-postadress</Field.ErrorMessage>
        </Field.Root>
        <Fieldset.Root>
          <Fieldset.Legend>Hur når vi dig?</Fieldset.Legend>
          <label>
            <input type="radio" name="kontakt" id="kontakt-epost" /> E-post
          </label>
          <label>
            <input type="radio" name="kontakt" id="kontakt-telefon" /> Telefon
          </label>
        </Fieldset.Root>
        <button type="submit">Skicka</button>
      </form>
    </>
  )
}

describe('rendering', () => {
  test('it is an Alert.Danger group named by its title, with a list of links', async () => {
    const { container } = await render(<Form />)
    const root = container.querySelector('.kv-error-summary')
    expect(root?.className).toBe('kv-error-summary kv-alert kv-alert--danger')
    expect(root?.getAttribute('role')).toBe('group')
    const title = page.getByRole('heading', { level: 2 })
    await expect.element(title).toHaveTextContent('Error: There is a problem')
    expect(root?.getAttribute('aria-labelledby')).toBe(title.element().id)
    await expect.element(summary()).toBeInTheDocument()
    expect(page.getByRole('list').element().className).toBe('kv-error-summary-list')
    expect(
      page
        .getByRole('listitem')
        .elements()
        .map((item) => item.className),
    ).toEqual(['kv-error-summary-item', 'kv-error-summary-item'])
  })

  test('it has no live region, no role alert and no announce of its own', async () => {
    const { container } = await render(<Form />)
    const root = container.querySelector('.kv-error-summary')
    expect(root?.hasAttribute('aria-live')).toBe(false)
    expect(root?.getAttribute('role')).not.toBe('alert')
    expect(root?.getAttribute('tabindex')).toBe('-1')
  })

  test('the title takes a heading level and your own text', async () => {
    await render(
      <ErrorSummary.Root>
        <ErrorSummary.Title as="h3">Rätta det här</ErrorSummary.Title>
        <ErrorSummary.List />
      </ErrorSummary.Root>,
    )
    await expect
      .element(page.getByRole('heading', { level: 3 }))
      .toHaveTextContent('Error: Rätta det här')
  })

  test('each part forwards its ref, its attributes and its class', async () => {
    const rootRef = createRef<HTMLElement>()
    const linkRef = createRef<HTMLAnchorElement>()
    await render(
      <ErrorSummary.Root ref={rootRef} className="egen" data-testid="root">
        <ErrorSummary.Title />
        <ErrorSummary.List className="egen">
          <ErrorSummary.Item className="egen">
            <ErrorSummary.Link ref={linkRef} className="egen" controlId="x">
              Fel
            </ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary.Root>,
    )
    expect(rootRef.current?.className).toBe('egen kv-error-summary kv-alert kv-alert--danger')
    expect(linkRef.current?.className).toBe('egen kv-link kv-error-summary-link')
    expect(linkRef.current?.getAttribute('href')).toBe('#x')
    expect(page.getByRole('list').element().className).toBe('egen kv-error-summary-list')
  })

  test('the flat aliases are the compound parts', () => {
    expect(ErrorSummary.Root).toBe(ErrorSummaryRoot)
    expect(ErrorSummary.Title).toBe(ErrorSummaryTitle)
    expect(ErrorSummary.List).toBe(ErrorSummaryList)
    expect(ErrorSummary.Item).toBe(ErrorSummaryItem)
    expect(ErrorSummary.Link).toBe(ErrorSummaryLink)
    expect(ErrorSummaryLink.displayName).toBe('ErrorSummary.Link')
  })

  test('it renders on the server with the group, the title id and no focus attribute but tabindex', () => {
    const html = renderToString(<Form />)
    expect(html).toContain('role="group"')
    expect(html).toContain('tabindex="-1"')
    expect(html).toContain('href="#email"')
  })
})

describe('links', () => {
  test('each link goes to its control id and reads the field error text', async () => {
    await render(<Form />)
    await expect
      .element(page.getByRole('link', { name: 'Ange din e-postadress' }))
      .toHaveAttribute('href', '#email')
    await expect
      .element(page.getByRole('link', { name: 'Välj hur vi når dig' }))
      .toHaveAttribute('href', '#kontakt-epost')
  })

  test('a link moves focus to the field and keeps the address', async () => {
    await render(<Form />)
    await userEvent.click(page.getByRole('link', { name: 'Ange din e-postadress' }))
    expect(document.activeElement).toBe(document.getElementById('email'))
    expect(window.location.hash).toBe('')
  })

  test('a link to a group focuses its first option', async () => {
    await render(<Form />)
    await userEvent.click(page.getByRole('link', { name: 'Välj hur vi når dig' }))
    expect(document.activeElement).toBe(document.getElementById('kontakt-epost'))
  })

  test('a Ctrl click is left to the browser', async () => {
    await render(<Form />)
    await userEvent.click(page.getByRole('link', { name: 'Ange din e-postadress' }), {
      modifiers: ['Control'],
    })
    expect(document.activeElement).not.toBe(document.getElementById('email'))
  })

  test('a link whose control is missing is left to the browser and warns once', async () => {
    await render(
      <ErrorSummary.Root>
        <ErrorSummary.Title />
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link controlId="finns-inte">Fel</ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary.Root>,
    )
    await userEvent.click(page.getByRole('link', { name: 'Fel' }))
    expect(window.location.hash).toBe('#finns-inte')
    expect(warnings()).toEqual([expect.stringContaining('no element with the id "finns-inte"')])
    await userEvent.click(page.getByRole('link', { name: 'Fel' }))
    expect(warnings()).toHaveLength(1)
  })

  test('a link whose control cannot take focus is left to the browser and warns once', async () => {
    await render(
      <>
        <div id="dold" />
        <ErrorSummary.Root>
          <ErrorSummary.Title />
          <ErrorSummary.List>
            <ErrorSummary.Item>
              <ErrorSummary.Link controlId="dold">Fel</ErrorSummary.Link>
            </ErrorSummary.Item>
          </ErrorSummary.List>
        </ErrorSummary.Root>
      </>,
    )
    await userEvent.click(page.getByRole('link', { name: 'Fel' }))
    expect(window.location.hash).toBe('#dold')
    expect(warnings()).toEqual([expect.stringContaining("can't take focus")])
    await userEvent.click(page.getByRole('link', { name: 'Fel' }))
    expect(warnings()).toHaveLength(1)
  })

  test("the consumer's onClick runs first and can cancel the move", async () => {
    await render(
      <ErrorSummary.Root>
        <ErrorSummary.Title />
        <ErrorSummary.List>
          <ErrorSummary.Item>
            <ErrorSummary.Link controlId="email" onClick={(event) => event.preventDefault()}>
              Fel
            </ErrorSummary.Link>
          </ErrorSummary.Item>
        </ErrorSummary.List>
      </ErrorSummary.Root>,
    )
    await userEvent.click(page.getByRole('link', { name: 'Fel' }))
    expect(document.activeElement).not.toBe(document.getElementById('email'))
  })

  test('outside a root it is a plain link and warns', async () => {
    await render(<ErrorSummary.Link controlId="email">Fel</ErrorSummary.Link>)
    await expect.element(page.getByRole('link', { name: 'Fel' })).toHaveAttribute('href', '#email')
    expect(warnings()).toEqual([expect.stringContaining('ErrorSummary.Link is outside')])
  })
})

describe('focus', () => {
  test('moves focus to the summary on mount', async () => {
    await render(<Form />)
    await expect.element(summary()).toHaveFocus()
  })

  test('moves focus again when focusKey changes, even from a link inside it', async () => {
    function Harness() {
      const [submitCount, setSubmitCount] = useState(1)
      return (
        <>
          <button type="button" onClick={() => setSubmitCount(submitCount + 1)}>
            Skicka igen
          </button>
          <Form focusKey={submitCount} />
        </>
      )
    }
    await render(<Harness />)
    await expect.element(summary()).toHaveFocus()
    page.getByRole('link', { name: 'Ange din e-postadress' }).element().focus()
    await userEvent.click(page.getByRole('button', { name: 'Skicka igen' }))
    await expect.element(summary()).toHaveFocus()
  })

  test('does not move focus when something else re-renders with the same focusKey', async () => {
    const view = await render(<Form focusKey={1} />)
    await expect.element(summary()).toHaveFocus()
    page.getByRole('link', { name: 'Tillbaka' }).element().focus()
    await view.rerender(<Form focusKey={1} rootProps={{ className: 'annan' }} />)
    await expect.element(page.getByRole('link', { name: 'Tillbaka' })).toHaveFocus()
  })

  test('focuses once in Strict Mode and never moves again while typing', async () => {
    await render(
      <StrictMode>
        <Form />
      </StrictMode>,
    )
    await expect.element(summary()).toHaveFocus()
    page
      .getByRole('textbox', { name: /^E-post/ })
      .element()
      .focus()
    await userEvent.keyboard('anna')
    await expect.element(page.getByRole('textbox', { name: /^E-post/ })).toHaveFocus()
  })

  test('the summary is focusable by script but not a Tab stop', async () => {
    const { container } = await render(<Form />)
    const root = container.querySelector<HTMLElement>('.kv-error-summary')
    expect(root?.tabIndex).toBe(-1)
    page.getByRole('link', { name: 'Tillbaka' }).element().focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(
      page.getByRole('link', { name: 'Ange din e-postadress' }).element(),
    )
  })
})

describe('keyboard', () => {
  test('Tab from the summary moves to the first link', async () => {
    await render(<Form />)
    await expect.element(summary()).toHaveFocus()
    await userEvent.tab()
    expect(document.activeElement).toBe(
      page.getByRole('link', { name: 'Ange din e-postadress' }).element(),
    )
  })

  test('Tab moves through the links and then out of the summary', async () => {
    await render(<Form />)
    await userEvent.tab()
    await userEvent.tab()
    expect(document.activeElement).toBe(
      page.getByRole('link', { name: 'Välj hur vi når dig' }).element(),
    )
    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: /^E-post/ }).element())
  })

  test('Shift+Tab from the first link goes to the stop before the summary', async () => {
    await render(<Form />)
    await userEvent.tab()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(page.getByRole('link', { name: 'Tillbaka' }).element())
  })

  test('Enter on a link moves focus to its field', async () => {
    await render(<Form />)
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: /^E-post/ }).element())
  })
})

describe('announcements', () => {
  const settle = () => new Promise((resolve) => setTimeout(resolve, 250))

  test('nothing is said in the Announcer: the focus move is the announcement', async () => {
    const view = await render(
      <KvirnProvider>
        <main />
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
    await view.rerender(
      <KvirnProvider>
        <main>
          <Form />
        </main>
      </KvirnProvider>,
    )
    await expect.element(summary()).toHaveFocus()
    await settle()
    await expect.element(page.getByRole('status')).toBeEmptyDOMElement()
    expect(
      page
        .getByRole('alert')
        .elements()
        .every((region) => region.textContent === ''),
    ).toBe(true)
  })

  test('an element outside the Title’s allowed list warns once and renders an h2', async () => {
    const notAllowed = 'p' as 'h2'
    await render(
      <ErrorSummary.Root>
        <ErrorSummary.Title as={notAllowed}>Rätta det här</ErrorSummary.Title>
        <ErrorSummary.List />
      </ErrorSummary.Root>,
    )
    await expect.element(page.getByRole('heading', { level: 2 })).toBeVisible()
    expect(
      warnings().filter((message) => message.includes('ErrorSummary.Title as="p"')),
    ).toHaveLength(1)
  })

  test('the List takes ol, and an element outside its list warns once and renders a ul', async () => {
    const notAllowed = 'div' as 'ul'
    await render(
      <ErrorSummary.Root>
        <ErrorSummary.Title />
        <ErrorSummary.List as="ol" data-testid="ordered" />
        <ErrorSummary.List as={notAllowed} data-testid="fallback" />
      </ErrorSummary.Root>,
    )
    expect(page.getByTestId('ordered').element().tagName).toBe('OL')
    expect(page.getByTestId('fallback').element().tagName).toBe('UL')
    expect(
      warnings().filter((message) => message.includes('ErrorSummary.List as="div"')),
    ).toHaveLength(1)
  })
})

describe('document title', () => {
  test('prefixes the page title while shown and restores it on unmount', async () => {
    document.title = 'Steg 2 - Parkeringstillstånd'
    const view = await render(<Form prefixDocumentTitle />)
    expect(document.title).toBe('Error: Steg 2 - Parkeringstillstånd')
    await view.rerender(<Form prefixDocumentTitle showSummary={false} />)
    expect(document.title).toBe('Steg 2 - Parkeringstillstånd')
  })

  test('never doubles the prefix, in Strict Mode or on a second summary', async () => {
    document.title = 'Steg 2'
    await render(
      <StrictMode>
        <Form prefixDocumentTitle />
      </StrictMode>,
    )
    expect(document.title).toBe('Error: Steg 2')
  })

  test('is off by default', async () => {
    document.title = 'Steg 2'
    await render(<Form />)
    expect(document.title).toBe('Steg 2')
  })
})

describe('messages', () => {
  test.each([
    ['sv', sv, 'Fel: Det finns ett problem', 'Fel:'],
    ['en', en, 'Error: There is a problem', 'Error:'],
    ['fi', fi, 'Virhe: Lomakkeessa on virheitä', 'Virhe:'],
    ['nb', nb, 'Feil: Det er et problem', 'Feil:'],
    ['nn', nn, 'Feil: Det er eit problem', 'Feil:'],
  ] as const)(
    'the %s catalog gives the title and the page title prefix',
    async (locale, messages, heading, prefix) => {
      document.title = 'Sida'
      await render(
        <KvirnProvider locale={locale} messages={messages}>
          <ErrorSummary.Root prefixDocumentTitle>
            <ErrorSummary.Title />
          </ErrorSummary.Root>
        </KvirnProvider>,
      )
      await expect.element(page.getByRole('heading', { level: 2 })).toHaveTextContent(heading)
      expect(document.title).toBe(`${prefix} Sida`)
    },
  )

  test('messages override the title and the prefix per instance', async () => {
    document.title = 'Sida'
    await render(
      <ErrorSummary.Root
        prefixDocumentTitle
        messages={{ title: 'Rätta felen', titlePrefix: 'Problem:' }}
      >
        <ErrorSummary.Title />
      </ErrorSummary.Root>,
    )
    await expect
      .element(page.getByRole('heading', { level: 2 }))
      .toHaveTextContent('Error: Rätta felen')
    expect(document.title).toBe('Problem: Sida')
  })
})

describe('hook', () => {
  test('useErrorSummary returns the part props and the link props', async () => {
    function Probe() {
      const errorSummary = useErrorSummary()
      const linkProps: ErrorSummaryLinkPartProps = errorSummary.getLinkProps('email')
      return (
        <output data-testid="result">
          {JSON.stringify({
            title: errorSummary.title,
            list: errorSummary.listProps,
            item: errorSummary.itemProps,
            link: { className: linkProps.className, href: linkProps.href },
            root: {
              className: errorSummary.rootProps.className,
              role: errorSummary.rootProps.role,
              tabIndex: errorSummary.rootProps.tabIndex,
              labelledBy: errorSummary.rootProps['aria-labelledby'] === errorSummary.titleProps.id,
            },
          })}
        </output>
      )
    }
    await render(<Probe />)
    expect(JSON.parse(page.getByTestId('result').element().textContent)).toEqual({
      title: 'There is a problem',
      list: { className: 'kv-error-summary-list', role: 'list' },
      item: { className: 'kv-error-summary-item' },
      link: { className: 'kv-link kv-error-summary-link', href: '#email' },
      root: { className: 'kv-error-summary', role: 'group', tabIndex: -1, labelledBy: true },
    })
  })

  test('the types are exported', () => {
    expectTypeOf<ErrorSummaryLinkProps['controlId']>().toEqualTypeOf<string>()
    expectTypeOf<ErrorSummaryRootProps['focusKey']>().toEqualTypeOf<string | number | undefined>()
  })
})

describe('accessibility', () => {
  test('no axe violations with the summary focused', async () => {
    const { container } = await render(
      <main>
        <Form />
      </main>,
    )
    await expect.element(summary()).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('no axe violations with a link focused', async () => {
    const { container } = await render(
      <main>
        <Form />
      </main>,
    )
    await userEvent.tab()
    await expect.element(page.getByRole('link', { name: 'Ange din e-postadress' })).toHaveFocus()
    await expectNoA11yViolations(container)
  })
})
