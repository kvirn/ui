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

// Contract: card.a11y.md. The keyboard rows are also covered end to end in card.e2e.ts.

const parts = [
  ['Root', Card.Root, 'card'],
  ['Header', Card.Header, 'card-header'],
  ['Body', Card.Body, 'card-body'],
  ['Footer', Card.Footer, 'card-footer'],
] as const

/** Example B from the design spec, in Swedish: image, heading, text and two actions. */
function ServiceCard() {
  return (
    <Card.Root>
      <Card.Header data-padding="none">
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
      </Card.Header>
      <Card.Body>
        <h2>Sophämtning vid Storgatan 12</h2>
        <p>Matavfall och restavfall töms varannan vecka.</p>
      </Card.Body>
      <Card.Footer data-kv-button-group="">
        <Button data-variant="primary">Beställ extra tömning</Button>
        <Button>Pausa hämtningen</Button>
      </Card.Footer>
    </Card.Root>
  )
}

describe('rendering', () => {
  test.each(parts)('Card.%s renders one <div> with its data-kv', async (_name, Part, dataKv) => {
    const { container } = await render(<Part data-testid="part">Innehåll</Part>)
    const part = page.getByTestId('part')
    expect(part.element().tagName).toBe('DIV')
    await expect.element(part).toHaveAttribute('data-kv', dataKv)
    await expect.element(part).toHaveTextContent('Innehåll')
    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild).toBe(part.element())
  })

  test('adds no role, ARIA or tabindex', async () => {
    await render(<ServiceCard />)
    const cardElements = [...document.querySelectorAll('[data-kv^="card"]')]
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
            <Link href="#atervinning">Nya öppettider på återvinningscentralen</Link>
          </h3>
        </Card.Body>
        <Card.Footer data-kv-button-group="">
          <Button data-variant="primary">Beställ extra tömning</Button>
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

  test('passes attributes through: variants, id, lang and aria on the consumer’s element', async () => {
    await render(
      <Card.Root
        data-testid="card"
        data-surface="surface"
        data-radius="md"
        data-padding="sm"
        data-dividers=""
        id="kontakt"
        lang="en"
        title="Kort"
      >
        <Card.Body data-padding="none">Contact us</Card.Body>
      </Card.Root>,
    )
    const card = page.getByTestId('card')
    await expect.element(card).toHaveAttribute('data-surface', 'surface')
    await expect.element(card).toHaveAttribute('data-radius', 'md')
    await expect.element(card).toHaveAttribute('data-padding', 'sm')
    await expect.element(card).toHaveAttribute('data-dividers', '')
    await expect.element(card).toHaveAttribute('id', 'kontakt')
    await expect.element(card).toHaveAttribute('lang', 'en')
    await expect.element(card).toHaveAttribute('title', 'Kort')
    await expect.element(page.getByText('Contact us')).toHaveAttribute('data-padding', 'none')
  })

  test('keeps its own data-kv: a consumer value doesn’t replace the part name', async () => {
    await render(
      <Card.Root data-testid="card" data-kv="annat">
        Text
      </Card.Root>,
    )
    await expect.element(page.getByTestId('card')).toHaveAttribute('data-kv', 'card')
  })

  test.each(parts)(
    'Card.%s keeps its own data-kv when a render element sets another one',
    async (_name, Part, dataKv) => {
      await render(<Part render={<section data-kv="annat" data-testid="part" />}>Text</Part>)
      await expect.element(page.getByTestId('part')).toHaveAttribute('data-kv', dataKv)
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

describe('refs, className and style', () => {
  test.each(parts)('Card.%s forwards its ref to the element', async (_name, Part) => {
    const ref = createRef<HTMLElement>()
    await render(
      <Part ref={ref} data-testid="part">
        Text
      </Part>,
    )
    expect(ref.current).toBe(page.getByTestId('part').element())
  })

  test('forwards className and style', async () => {
    await render(
      <Card.Root data-testid="card" className="kort" style={{ maxInlineSize: '20rem' }}>
        Text
      </Card.Root>,
    )
    const card = page.getByTestId('card')
    await expect.element(card).toHaveClass('kort')
    await expect.element(card).toHaveStyle({ maxInlineSize: '20rem' })
  })

  test('merges className and style with a render element, and both refs get the element', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Card.Root
        ref={partRef}
        className="kort"
        style={{ maxInlineSize: '20rem', color: 'rgb(0, 0, 0)' }}
        render={
          <article
            ref={elementRef}
            className="nyhet"
            style={{ color: 'rgb(1, 2, 3)' }}
            data-testid="card"
          />
        }
      >
        Text
      </Card.Root>,
    )
    const card = page.getByTestId('card')
    await expect.element(card).toHaveClass('kort nyhet')
    await expect.element(card).toHaveStyle({ maxInlineSize: '20rem', color: 'rgb(1, 2, 3)' })
    expect(partRef.current).toBe(card.element())
    expect(elementRef.current).toBe(card.element())
  })
})

describe('render', () => {
  test('an element changes the element and keeps the part name and children', async () => {
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
    await expect.element(card).toHaveAttribute('data-kv', 'card')
    const body = card.element().firstElementChild
    expect(body?.getAttribute('data-kv')).toBe('card-body')
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
    const region = page.getByRole('region', { name: 'Kontakta oss' })
    await expect.element(region).toHaveAttribute('data-kv', 'card')
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
    const items = page.getByRole('listitem').elements()
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.getAttribute('data-kv')).toBe('card')
    }
    await expectNoA11yViolations(container)
  })

  test('a function receives the part props and an empty state', async () => {
    const seenStates: CardState[] = []
    await render(
      <Card.Footer
        className="sidfot"
        render={(footerProps, state) => {
          seenStates.push(state)
          return <div {...footerProps} data-testid="footer" data-own="" />
        }}
      >
        Text
      </Card.Footer>,
    )
    const footer = page.getByTestId('footer')
    await expect.element(footer).toHaveAttribute('data-kv', 'card-footer')
    await expect.element(footer).toHaveAttribute('data-own', '')
    await expect.element(footer).toHaveClass('sidfot')
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

  test('gives the part names for your own elements', async () => {
    const { container } = await render(
      <main>
        <HookCard />
      </main>,
    )
    await expect
      .element(page.getByRole('region', { name: 'Senaste händelse' }))
      .toHaveAttribute('data-kv', 'card')
    await expect.element(page.getByTestId('header')).toHaveAttribute('data-kv', 'card-header')
    await expect.element(page.getByTestId('body')).toHaveAttribute('data-kv', 'card-body')
    await expect.element(page.getByTestId('footer')).toHaveAttribute('data-kv', 'card-footer')
    await expectNoA11yViolations(container)
  })

  test('returns only data-kv, the same props the components render', () => {
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
      rootProps: { 'data-kv': 'card' },
      headerProps: { 'data-kv': 'card-header' },
      bodyProps: { 'data-kv': 'card-body' },
      footerProps: { 'data-kv': 'card-footer' },
    })
  })
})

describe('server rendering', () => {
  test('renders every part to a string without touching the page', () => {
    const html = renderToString(
      <Card.Root data-surface="surface">
        <Card.Header data-padding="none" />
        <Card.Body>Text</Card.Body>
        <Card.Footer />
      </Card.Root>,
    )
    expect(html).toBe(
      '<div data-surface="surface" data-kv="card"><div data-padding="none" data-kv="card-header"></div><div data-kv="card-body">Text</div><div data-kv="card-footer"></div></div>',
    )
  })
})

describe('types', () => {
  test('exports the part, hook and state types', () => {
    expectTypeOf<CardPartProps<'card'>>().toEqualTypeOf<{ 'data-kv': 'card' }>()
    expectTypeOf<UseCardResult['rootProps']['data-kv']>().toEqualTypeOf<'card'>()
    expectTypeOf<UseCardResult['headerProps']['data-kv']>().toEqualTypeOf<'card-header'>()
    expectTypeOf<UseCardResult['bodyProps']['data-kv']>().toEqualTypeOf<'card-body'>()
    expectTypeOf<UseCardResult['footerProps']['data-kv']>().toEqualTypeOf<'card-footer'>()
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
