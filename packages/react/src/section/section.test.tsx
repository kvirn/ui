import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useId } from 'react'
import { describe, expect, expectTypeOf, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { renderToString } from 'react-dom/server'
import { render } from 'vitest-browser-react'
import { Card } from '../card/card.tsx'
import { Link } from '../link/link.tsx'
import { Section, SectionRoot } from './section.tsx'
import type { SectionElementProps, SectionRootProps, SectionState } from './section.tsx'
import { useSection } from './use-section.ts'
import type { SectionPartProps, UseSectionResult } from './use-section.ts'

// Contract: section.a11y.md. The keyboard rows are also covered end to end in
// apps/storybook/src/components/section/section.e2e.ts.

/** Example A from the design spec, in Swedish: a sidebar text block as a named aside. */
function ContactSection() {
  const headingId = useId()
  return (
    <Section render={<aside aria-labelledby={headingId} />} className="kv-section--padding-lg">
      <h2 id={headingId}>Kontakta oss</h2>
      <p>Ring kundcenter på 0123-45 67 89.</p>
      <p>
        <Link href="#epost">Mejla kundcenter</Link>
      </p>
    </Section>
  )
}

describe('rendering', () => {
  test('renders one <div> with its class and its children', async () => {
    const { container } = await render(<Section data-testid="section">Innehåll</Section>)
    const section = page.getByTestId('section')
    expect(section.element().tagName).toBe('DIV')
    expect(section.element().className).toBe('kv-section')
    await expect.element(section).not.toHaveAttribute('data-kv')
    await expect.element(section).toHaveTextContent('Innehåll')
    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild).toBe(section.element())
  })

  test('adds no role, ARIA or tabindex', async () => {
    await render(
      <main>
        <Section data-testid="section">
          <h2>Nyheter</h2>
        </Section>
        <ContactSection />
      </main>,
    )
    const sections = [...document.querySelectorAll('.kv-section')]
    expect(sections).toHaveLength(2)
    // The default section has nothing. The aside has only the name the consumer gave it.
    const attributeNames = sections[0]?.getAttributeNames() ?? []
    expect(attributeNames.filter((name) => name === 'role' || name.startsWith('aria-'))).toEqual([])
    for (const section of sections) {
      expect(section.getAttributeNames()).not.toContain('tabindex')
      expect(section.getAttributeNames()).not.toContain('inert')
      expect(section.getAttribute('role')).toBeNull()
    }
    expect(sections[1]?.getAttributeNames().filter((name) => name.startsWith('aria-'))).toEqual([
      'aria-labelledby',
    ])
  })

  test('a default section is no landmark', async () => {
    await render(
      <main>
        <Section>
          <h2>Nyheter</h2>
        </Section>
      </main>,
    )
    expect(page.getByRole('complementary').elements()).toHaveLength(0)
    expect(page.getByRole('region').elements()).toHaveLength(0)
    expect(page.getByRole('navigation').elements()).toHaveLength(0)
  })

  test('renders no text of its own: children are exactly what the consumer passes', async () => {
    await render(<Section data-testid="section" />)
    const section = page.getByTestId('section')
    await expect.element(section).toHaveTextContent('')
    expect(section.element().childNodes).toHaveLength(0)
  })

  test('the section is skipped by Tab: focus goes through its children in DOM order', async () => {
    await render(
      <Section>
        <Link href="#forsta">Första länken</Link>
        <Link href="#andra">Andra länken</Link>
      </Section>,
    )
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Första länken' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('link', { name: 'Andra länken' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('link', { name: 'Första länken' })).toHaveFocus()
  })

  test('passes attributes through: id, lang and title on the consumer’s element', async () => {
    await render(
      <Section data-testid="section" id="kontakt" lang="en" title="Section">
        Contact us
      </Section>,
    )
    const section = page.getByTestId('section')
    await expect.element(section).toHaveAttribute('id', 'kontakt')
    await expect.element(section).toHaveAttribute('lang', 'en')
    await expect.element(section).toHaveAttribute('title', 'Section')
  })

  test('keeps its own class: a consumer className joins it instead of replacing it', async () => {
    await render(
      <Section data-testid="section" className="kv-section--canvas annat">
        Text
      </Section>,
    )
    await expect
      .element(page.getByTestId('section'))
      .toHaveClass('kv-section', 'kv-section--canvas', 'annat')
  })

  test('keeps its own class when a render element sets another one', async () => {
    await render(
      <Section className="fran-prop" render={<section className="annat" data-testid="section" />}>
        Text
      </Section>,
    )
    await expect
      .element(page.getByTestId('section'))
      .toHaveClass('kv-section', 'fran-prop', 'annat')
  })

  test('keeps its own class when a render element’s className is empty', async () => {
    await render(<Section render={<section className="" data-testid="section" />}>Text</Section>)
    expect(page.getByTestId('section').element().className).toBe('kv-section')
  })

  test('Section, Section.Root and SectionRoot are the same component', () => {
    expect(Section.Root).toBe(SectionRoot)
    expect(Section).toBe(SectionRoot)
  })

  test('has no axe violations as a sidebar and as a band with a card', async () => {
    const { container } = await render(
      <main>
        <h1>Bygglov</h1>
        <ContactSection />
        <Section>
          <h2>Nyheter</h2>
          <ul>
            <Card.Root render={<li />}>Nya öppettider</Card.Root>
            <Card.Root render={<li />}>Vinterväghållning</Card.Root>
          </ul>
        </Section>
      </main>,
    )
    await expect.element(page.getByRole('heading', { name: 'Nyheter', level: 2 })).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('refs, className and style', () => {
  test('forwards its ref to the element', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Section ref={ref} data-testid="section">
        Text
      </Section>,
    )
    expect(ref.current).toBe(page.getByTestId('section').element())
  })

  test('forwards a ref to any element: <aside>, <section> and <li>', async () => {
    const asideRef = createRef<HTMLElement>()
    const itemRef = createRef<HTMLLIElement>()
    await render(
      <>
        <Section ref={asideRef} render={<aside aria-label="Sidosection" />}>
          Text
        </Section>
        <ul>
          <Section ref={itemRef} render={<li />}>
            Punkt
          </Section>
        </ul>
      </>,
    )
    expect(asideRef.current?.tagName).toBe('ASIDE')
    expect(itemRef.current?.tagName).toBe('LI')
  })

  test('forwards className and style', async () => {
    await render(
      <Section data-testid="section" className="sidosection" style={{ maxInlineSize: '20rem' }}>
        Text
      </Section>,
    )
    const section = page.getByTestId('section')
    await expect.element(section).toHaveClass('sidosection')
    await expect.element(section).toHaveStyle({ maxInlineSize: '20rem' })
  })

  test('merges className and style with a render element, and both refs get the element', async () => {
    const partRef = createRef<HTMLElement>()
    const elementRef = createRef<HTMLElement>()
    await render(
      <Section
        ref={partRef}
        className="sidosection"
        style={{ maxInlineSize: '20rem', color: 'rgb(0, 0, 0)' }}
        render={
          <aside
            ref={elementRef}
            className="kontakt"
            style={{ color: 'rgb(1, 2, 3)' }}
            aria-label="Kontakt"
            data-testid="section"
          />
        }
      >
        Text
      </Section>,
    )
    const section = page.getByTestId('section')
    await expect.element(section).toHaveClass('sidosection kontakt')
    await expect.element(section).toHaveStyle({ maxInlineSize: '20rem', color: 'rgb(1, 2, 3)' })
    expect(partRef.current).toBe(section.element())
    expect(elementRef.current).toBe(section.element())
  })
})

describe('render', () => {
  test('<aside aria-labelledby> makes the section a named complementary landmark', async () => {
    const { container } = await render(
      <main>
        <h1>Bygglov</h1>
        <ContactSection />
      </main>,
    )
    const section = page.getByRole('complementary', { name: 'Kontakta oss' })
    await expect.element(section).toBeVisible()
    await expect.element(section).toHaveClass('kv-section', 'kv-section--padding-lg')
    await expectNoA11yViolations(container)
  })

  test('<section aria-labelledby> makes the section a named region', async () => {
    function NewsBand() {
      const headingId = useId()
      return (
        <Section render={<section aria-labelledby={headingId} />}>
          <h2 id={headingId}>Nyheter</h2>
        </Section>
      )
    }
    const { container } = await render(
      <main>
        <NewsBand />
      </main>,
    )
    await expect.element(page.getByRole('region', { name: 'Nyheter' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('<nav aria-labelledby> makes the section a named navigation landmark', async () => {
    function CaseNavigation() {
      const headingId = useId()
      return (
        <Section render={<nav aria-labelledby={headingId} />}>
          <h2 id={headingId}>Ärenden</h2>
          <Link href="#aktuella">Aktuella ärenden</Link>
        </Section>
      )
    }
    const { container } = await render(
      <main>
        <CaseNavigation />
      </main>,
    )
    await expect.element(page.getByRole('navigation', { name: 'Ärenden' })).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('<li> sections make a list with one item per section', async () => {
    const { container } = await render(
      <ul>
        <Section render={<li />}>Nya öppettider</Section>
        <Section render={<li />}>Vinterväghållning</Section>
      </ul>,
    )
    expect(page.getByRole('listitem').elements()).toHaveLength(2)
    await expectNoA11yViolations(container)
  })

  test('a function receives the part props and an empty state', async () => {
    const seenStates: SectionState[] = []
    await render(
      <Section
        className="sidosection"
        render={(sectionProps, state) => {
          seenStates.push(state)
          return <div {...sectionProps} data-testid="section" data-own="" />
        }}
      >
        Text
      </Section>,
    )
    const section = page.getByTestId('section')
    await expect.element(section).toHaveClass('kv-section', 'sidosection')
    await expect.element(section).toHaveAttribute('data-own', '')
    await expect.element(section).toHaveTextContent('Text')
    expect(seenStates.at(-1)).toEqual({})
  })

  test('a function’s props include the ref', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <Section
        ref={ref}
        render={(sectionProps) => <aside {...sectionProps} data-testid="section" />}
      >
        Text
      </Section>,
    )
    expect(ref.current).toBe(page.getByTestId('section').element())
    expect(ref.current?.tagName).toBe('ASIDE')
  })
})

describe('useSection', () => {
  function HookSection() {
    const section = useSection()
    const headingId = useId()
    return (
      <nav {...section.rootProps} aria-labelledby={headingId} data-testid="section">
        <h2 id={headingId}>Ärenden</h2>
      </nav>
    )
  }

  test('gives the class for your own element', async () => {
    const { container } = await render(
      <main>
        <HookSection />
      </main>,
    )
    await expect
      .element(page.getByRole('navigation', { name: 'Ärenden' }))
      .toHaveClass('kv-section')
    await expectNoA11yViolations(container)
  })

  test('returns only the class, the same props the component renders', () => {
    function SectionPropsAsText() {
      return <pre>{JSON.stringify(useSection())}</pre>
    }
    const html = renderToString(<SectionPropsAsText />)
    const result: unknown = JSON.parse(
      html
        .replace(/^<pre>/, '')
        .replace(/<\/pre>$/, '')
        .replaceAll('&quot;', '"'),
    )
    expect(result).toEqual({ rootProps: { className: 'kv-section' } })
  })
})

describe('server rendering', () => {
  test('renders to a string without touching the page', () => {
    const html = renderToString(
      <Section className="kv-section--canvas">
        <p>Text</p>
      </Section>,
    )
    expect(html).toBe('<div class="kv-section--canvas kv-section"><p>Text</p></div>')
  })
})

describe('types', () => {
  test('exports the part, hook and state types', () => {
    expectTypeOf<SectionPartProps>().toEqualTypeOf<{ className: 'kv-section' }>()
    expectTypeOf<UseSectionResult['rootProps']['className']>().toEqualTypeOf<'kv-section'>()
    expectTypeOf<SectionState>().toEqualTypeOf<Record<string, never>>()
  })

  test('the root takes HTML attributes, a ref to any element, and render', () => {
    const props = {} as SectionRootProps
    expectTypeOf(props).toHaveProperty('render')
    expectTypeOf(props).toHaveProperty('className')
    expectTypeOf(props).toHaveProperty('aria-labelledby')
    expectTypeOf(createRef<HTMLLIElement>()).toExtend<NonNullable<typeof props.ref>>()
    expectTypeOf<SectionElementProps>().toHaveProperty('ref')
  })
})
