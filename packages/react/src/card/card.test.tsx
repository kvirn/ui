import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useId } from 'react'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { Link } from '../link/link.tsx'
import { Card, CardBody, CardFooter, CardHeader, CardRoot } from './card.tsx'
import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardRootProps,
  CardState,
} from './card.tsx'
import { useCard } from './use-card.ts'
import type { CardPartProps, UseCardResult } from './use-card.ts'

// Contract: card.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/card/card.e2e.ts.

const parts = [
  ['Root', Card.Root, 'kv-card'],
  ['Header', Card.Header, 'kv-card-header'],
  ['Body', Card.Body, 'kv-card-body'],
  ['Footer', Card.Footer, 'kv-card-footer'],
] as const

/** Example B from the design spec, in Swedish: image, heading, text and two actions. */
function ServiceCard() {
  return (
    <Card.Root>
      <Card.Header className="kv-card-header--padding-none">
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
      </Card.Header>
      <Card.Body>
        <h2>Sophämtning vid Storgatan 12</h2>
        <p>Matavfall och restavfall töms varannan vecka.</p>
      </Card.Body>
      <Card.Footer className="kv-button-group">
        <Button className="kv-button--primary">Beställ extra tömning</Button>
        <Button>Pausa hämtningen</Button>
      </Card.Footer>
    </Card.Root>
  )
}

describe('rendering', () => {
  test.each(parts)(
    'Card.%s renders one element with its part class',
    async (_name, Part, className) => {
      const { container } = await render(<Part data-testid="part">Innehåll</Part>)
      const part = page.getByTestId('part')
      expect(part.element().className).toBe(className)
      await expect.element(part).not.toHaveAttribute('data-kv')
      await expect.element(part).toHaveTextContent('Innehåll')
      expect(container.children).toHaveLength(1)
      expect(container.firstElementChild).toBe(part.element())
    },
  )

  test('adds no role, ARIA or tabindex', async () => {
    await render(<ServiceCard />)
    const cardElements = [
      ...document.querySelectorAll('.kv-card, .kv-card-header, .kv-card-body, .kv-card-footer'),
    ]
    expect(cardElements).toHaveLength(4)
    for (const element of cardElements) {
      const attributeNames = element.getAttributeNames()
      expect(attributeNames.filter((name) => name === 'role' || name.startsWith('aria-'))).toEqual(
        [],
      )
      expect(attributeNames).not.toContain('tabindex')
      expect(attributeNames).not.toContain('inert')
    }
  })

  test('Header and Footer are never banner or contentinfo landmarks', async () => {
    const { container } = await render(
      <main>
        <ServiceCard />
      </main>,
    )
    expect(container.querySelector('header, footer')).toBeNull()
    expect(page.getByRole('banner').elements()).toHaveLength(0)
    expect(page.getByRole('contentinfo').elements()).toHaveLength(0)
  })

  test('renders no text of its own: children are exactly what the consumer passes', async () => {
    await render(
      <Card.Root data-testid="card">
        <Card.Header data-testid="header" />
        <Card.Body data-testid="body" />
        <Card.Footer data-testid="footer" />
      </Card.Root>,
    )
    await expect.element(page.getByTestId('card')).toHaveTextContent('')
    for (const testId of ['header', 'body', 'footer']) {
      expect(page.getByTestId(testId).element().childNodes).toHaveLength(0)
    }
  })

  test('the card is skipped by Tab: focus goes through its children in DOM order', async () => {
    await render(
      <Card.Root>
        <Card.Body>
          <h3>
            <Link.Root href="#atervinning">Nya öppettider på återvinningscentralen</Link.Root>
          </h3>
        </Card.Body>
        <Card.Footer className="kv-button-group">
          <Button className="kv-button--primary">Beställ extra tömning</Button>
          <Button>Pausa hämtningen</Button>
        </Card.Footer>
      </Card.Root>,
    )
    await userEvent.keyboard('{Tab}')
    await expect
      .element(page.getByRole('link', { name: 'Nya öppettider på återvinningscentralen' }))
      .toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Beställ extra tömning' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Pausa hämtningen' })).toHaveFocus()
  })

  test('passes attributes through: id, lang and title on the consumer’s element', async () => {
    await render(
      <Card.Root data-testid="card" id="kontakt" lang="en" title="Kort">
        <Card.Body>Contact us</Card.Body>
      </Card.Root>,
    )
    const card = page.getByTestId('card')
    await expect.element(card).toHaveAttribute('id', 'kontakt')
    await expect.element(card).toHaveAttribute('lang', 'en')
    await expect.element(card).toHaveAttribute('title', 'Kort')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(
      <Card.Root data-testid="card" className="annat">
        Text
      </Card.Root>,
    )
    await expect.element(page.getByTestId('card')).toHaveClass('kv-card', 'annat')
  })

  test.each(parts)(
    'Card.%s keeps its own class when a render element sets another one',
    async (_name, Part, className) => {
      await render(
        <Part className="fran-prop" render={<section className="annat" data-testid="part" />}>
          Text
        </Part>,
      )
      await expect.element(page.getByTestId('part')).toHaveClass(className, 'fran-prop', 'annat')
    },
  )

  test.each(parts)(
    'Card.%s keeps its own class when a render element’s className is empty',
    async (_name, Part, className) => {
      await render(<Part render={<section className="" data-testid="part" />}>Text</Part>)
      expect(page.getByTestId('part').element().className).toBe(className)
    },
  )

  test('the named exports are the compound parts', () => {
    expect(CardRoot).toBe(Card.Root)
    expect(CardHeader).toBe(Card.Header)
    expect(CardBody).toBe(Card.Body)
    expect(CardFooter).toBe(Card.Footer)
  })

  test('has no axe violations as a service card', async () => {
    const { container } = await render(
      <main>
        <ServiceCard />
      </main>,
    )
    await expect
      .element(page.getByRole('heading', { name: 'Sophämtning vid Storgatan 12', level: 2 }))
      .toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('refs and style', () => {
  test.each(parts)('Card.%s forwards its ref to the element', async (_name, Part) => {
    const ref = createRef<HTMLElement>()
    await render(
      <Part ref={ref} data-testid="part">
        Text
      </Part>,
    )
    expect(ref.current).toBe(page.getByTestId('part').element())
  })

  test('merges style with a render element, and both refs get the element', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Card.Root
        ref={partRef}
        style={{ maxInlineSize: '20rem', color: 'rgb(0, 0, 0)' }}
        render={<article ref={elementRef} style={{ color: 'rgb(1, 2, 3)' }} data-testid="card" />}
      >
        Text
      </Card.Root>,
    )
    const card = page.getByTestId('card')
    await expect.element(card).toHaveStyle({ maxInlineSize: '20rem', color: 'rgb(1, 2, 3)' })
    expect(partRef.current).toBe(card.element())
    expect(elementRef.current).toBe(card.element())
  })
})

describe('render', () => {
  test('an element changes the element and keeps the children', async () => {
    const { container } = await render(
      <main>
        <Card.Root render={<article />}>
          <Card.Body render={<div data-own="" />}>
            <h2>Nyheter</h2>
          </Card.Body>
        </Card.Root>
      </main>,
    )
    const card = page.getByRole('article')
    const body = card.element().firstElementChild
    expect(body?.hasAttribute('data-own')).toBe(true)
    await expect.element(page.getByRole('heading', { name: 'Nyheter', level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('<section aria-labelledby> makes the card a named region', async () => {
    function ContactSection() {
      const headingId = useId()
      return (
        <Card.Root render={<section aria-labelledby={headingId} />}>
          <h2 id={headingId}>Kontakta oss</h2>
          <p>Ring kundcenter på 0123-45 67 89.</p>
        </Card.Root>
      )
    }
    const { container } = await render(
      <main>
        <ContactSection />
      </main>,
    )
    await expect.element(page.getByRole('region', { name: 'Kontakta oss' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('<li> cards make a list with one item per card', async () => {
    const { container } = await render(
      <ul>
        <Card.Root render={<li />}>Nya öppettider</Card.Root>
        <Card.Root render={<li />}>Vinterväghållning</Card.Root>
        <Card.Root render={<li />}>Föreningsbidrag</Card.Root>
      </ul>,
    )
    expect(page.getByRole('listitem').elements()).toHaveLength(3)
    await expectNoA11yViolations(container)
  })

  test('a function receives the part props and an empty state', async () => {
    const seenStates: CardState[] = []
    await render(
      <Card.Footer
        render={(footerProps, state) => {
          seenStates.push(state)
          return <div {...footerProps} data-testid="footer" data-own="" />
        }}
      >
        Text
      </Card.Footer>,
    )
    const footer = page.getByTestId('footer')
    await expect.element(footer).toHaveAttribute('data-own', '')
    await expect.element(footer).toHaveTextContent('Text')
    expect(seenStates.at(-1)).toEqual({})
  })

  test('a function’s props include the ref', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Card.Root ref={ref} render={(rootProps) => <aside {...rootProps} data-testid="card" />}>
        Text
      </Card.Root>,
    )
    expect(ref.current).toBe(page.getByTestId('card').element())
    expect(ref.current?.tagName).toBe('ASIDE')
  })
})

describe('useCard', () => {
  function HookCard() {
    const card = useCard()
    const headingId = useId()
    return (
      <section {...card.rootProps} aria-labelledby={headingId} data-testid="card">
        <div {...card.headerProps} data-testid="header" />
        <div {...card.bodyProps} data-testid="body">
          <h2 id={headingId}>Senaste händelse</h2>
        </div>
        <div {...card.footerProps} data-testid="footer" />
      </section>
    )
  }

  test('gives the part classes for your own elements', async () => {
    const { container } = await render(
      <main>
        <HookCard />
      </main>,
    )
    await expect
      .element(page.getByRole('region', { name: 'Senaste händelse' }))
      .toHaveClass('kv-card')
    await expect.element(page.getByTestId('header')).toHaveClass('kv-card-header')
    await expect.element(page.getByTestId('body')).toHaveClass('kv-card-body')
    await expect.element(page.getByTestId('footer')).toHaveClass('kv-card-footer')
    await expectNoA11yViolations(container)
  })

  test('returns only the class, the same props the components render', () => {
    function CardPropsAsText() {
      return <pre>{JSON.stringify(useCard())}</pre>
    }
    const html = renderToString(<CardPropsAsText />)
    const result: unknown = JSON.parse(
      html
        .replace(/^<pre>/, '')
        .replace(/<\/pre>$/, '')
        .replaceAll('&quot;', '"'),
    )
    expect(result).toEqual({
      rootProps: { className: 'kv-card' },
      headerProps: { className: 'kv-card-header' },
      bodyProps: { className: 'kv-card-body' },
      footerProps: { className: 'kv-card-footer' },
    })
  })
})

describe('server rendering', () => {
  test('renders every part to a string without touching the page', () => {
    const html = renderToString(
      <Card.Root className="kv-card--radius-md">
        <Card.Header className="kv-card-header--padding-none" />
        <Card.Body>Text</Card.Body>
        <Card.Footer />
      </Card.Root>,
    )
    expect(html).toBe(
      '<div class="kv-card--radius-md kv-card"><div class="kv-card-header--padding-none kv-card-header"></div><div class="kv-card-body">Text</div><div class="kv-card-footer"></div></div>',
    )
  })
})

describe('types', () => {
  test('exports the part, hook and state types', () => {
    expectTypeOf<CardPartProps<'card'>>().toEqualTypeOf<{ className: 'kv-card' }>()
    expectTypeOf<UseCardResult['rootProps']['className']>().toEqualTypeOf<'kv-card'>()
    expectTypeOf<UseCardResult['headerProps']['className']>().toEqualTypeOf<'kv-card-header'>()
    expectTypeOf<UseCardResult['bodyProps']['className']>().toEqualTypeOf<'kv-card-body'>()
    expectTypeOf<UseCardResult['footerProps']['className']>().toEqualTypeOf<'kv-card-footer'>()
    expectTypeOf<CardState>().toEqualTypeOf<Record<string, never>>()
  })

  test('every part takes HTML attributes, a ref to any element, and render', () => {
    for (const props of [
      {} as CardRootProps,
      {} as CardHeaderProps,
      {} as CardBodyProps,
      {} as CardFooterProps,
    ]) {
      expectTypeOf(props).toHaveProperty('render')
      expectTypeOf(props).toHaveProperty('className')
      expectTypeOf(props).toHaveProperty('aria-labelledby')
      expectTypeOf(createRef<HTMLLIElement>()).toExtend<NonNullable<typeof props.ref>>()
    }
  })
})
