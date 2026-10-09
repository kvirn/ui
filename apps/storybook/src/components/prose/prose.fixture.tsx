import { Button, Link, Navigation, Prose } from '@kvirn-ui/react'
import { useId } from 'react'
import type { CSSProperties } from 'react'
import { articleFor, updatedDate } from '../../foundation/foundations.fixture.tsx'
import type { FixtureLocale } from '../../foundation/foundations.fixture.tsx'
import { scrollRegionTabIndex } from '../../foundation/foundation-helpers.tsx'
import { caseNumberSample } from '../../foundation/typography-helpers.tsx'

// Fixtures for Components/Prose: each function is one example, and the story's "Show code" prints
// it (`showSource`), so it reads the way an adopter writes it: a `<Prose>` around plain HTML. The
// article text is the fixture of docs/design/foundations-and-prose.md §4, in the locale of the
// toolbar: a fictional municipality's guidance page that uses every element prose styles.

const smsCode = `BAB ${caseNumberSample}`

/**
 * A bathroom plan as a real `<img>`, so the prose `img` rules are what the story shows. Mid grey
 * lines keep 3:1 or more on every theme's canvas (1.4.11): 3.95:1 on white, 5.3:1 on near-black.
 */
const bathroomPlanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300">
<g fill="none" stroke="gray" stroke-width="3">
<rect x="10" y="10" width="460" height="280"/>
<rect x="20" y="20" width="150" height="260" stroke-dasharray="8 6"/>
<rect x="40" y="180" width="80" height="60"/>
<line x1="30" y1="60" x2="30" y2="160" stroke-width="6"/>
<line x1="180" y1="30" x2="280" y2="30" stroke-width="6"/>
<path d="M 340 290 L 340 200 A 90 90 0 0 1 430 290" stroke-dasharray="4 4"/>
<rect x="360" y="40" width="90" height="60"/>
<circle cx="260" cy="220" r="36"/>
</g>
</svg>`
const bathroomPlanSource = `data:image/svg+xml,${encodeURIComponent(bathroomPlanSvg)}`

/**
 * An article: `<Prose>` as an `<article>` (`as`), with the elements prose styles inside it. Add
 * `kv-prose--large` through `className` for long resident-facing text.
 */
export function GuidanceArticle({
  locale,
  className,
}: {
  locale: FixtureLocale
  className?: string
}) {
  const { text, lang } = articleFor(locale)
  const formatLocale = lang ?? locale
  const number = new Intl.NumberFormat(formatLocale)
  const date = new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long' })
  const ids = useId()
  return (
    <Prose as="article" className={className} lang={lang}>
      <h1>{text.title}</h1>
      <p className="kv-lead">{text.lead}</p>
      <div className="kv-inset">
        <p>
          <strong>{text.inset.lead}</strong> {text.inset.text}
        </p>
      </div>

      <h2>{text.who.heading}</h2>
      <p>{text.who.intro}</p>
      <ul>
        {text.who.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
        <li>
          {text.who.tenure.intro}
          <ul>
            {text.who.tenure.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </li>
      </ul>

      <h2>{text.what.heading}</h2>
      <p>{text.what.intro}</p>
      <ul>
        {text.what.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <figure>
        <img src={bathroomPlanSource} width={480} height={300} alt={text.what.figureLabel} />
        <figcaption>{text.what.figureCaption}</figcaption>
      </figure>
      <p>{text.steps.longDescription}</p>

      <h2>{text.how.heading}</h2>
      <ol>
        <li>
          <p>{text.how.steps[0]}</p>
        </li>
        <li>
          <p>{text.how.steps[1]}</p>
          <ol>
            {text.how.quoteSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </li>
        <li>
          <p>{text.how.steps[2]}</p>
        </li>
        <li>
          <p>{text.how.steps[3]}</p>
        </li>
      </ol>
      <p>{text.how.keyboard(<kbd lang="en">Tab</kbd>)}</p>

      <h3>{text.attach.heading}</h3>
      <dl>
        {text.attach.items.map(([term, description]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>

      <h3>{text.paper.heading}</h3>
      <p>{text.paper.text}</p>
      <h4>{text.send.heading}</h4>
      <p>
        {text.send.address.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>

      <h2>{text.times.heading}</h2>
      <p>{text.times.intro}</p>
      <p>{text.caseNumber(<code>{caseNumberSample}</code>)}</p>
      <p>{text.sms}</p>
      <pre>
        <code>{smsCode}</code>
      </pre>
      <section
        className="kv-scroll-region"
        aria-labelledby={`${ids}-times`}
        tabIndex={scrollRegionTabIndex}
      >
        <table>
          <caption id={`${ids}-times`}>{text.times.caption}</caption>
          <thead>
            <tr>
              {text.times.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {text.times.rows.map(([adaptation, weeks, grants]) => (
              <tr key={adaptation}>
                <th scope="row">{adaptation}</th>
                <td>{number.format(weeks)}</td>
                <td>{number.format(grants)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <figure>
        <blockquote>
          <p>{text.quote}</p>
        </blockquote>
        <figcaption>{text.quoteSource}</figcaption>
      </figure>

      <h2>{text.steps.heading}</h2>
      <ol className="kv-steps">
        {text.steps.items.map(([heading, body]) => (
          <li key={heading}>
            <h3>{heading}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>

      <hr />
      <h2>{text.contact.heading}</h2>
      <p>
        {text.contact.body((linkText) => (
          <a href="https://kvirnby.example/e-tjanst">{linkText}</a>
        ))}
      </p>
      <p>
        <a href="https://kvirnby.example/latt-las">{text.easyRead}</a>
      </p>
      <p>
        <a href="https://kvirnby.example/se" lang="se" hrefLang="se">
          {text.otherLanguage}
        </a>
      </p>
      <div className="kv-not-prose">
        <div className="kv-button-group">
          <Button className="kv-button--primary">{text.apply}</Button>
        </div>
      </div>
      <p>
        <small>{text.updated(<time dateTime="2026-09-14">{date.format(updatedDate)}</time>)}</small>
      </p>
    </Prose>
  )
}

/** A `mark` in prose: it loses its background in forced colours, so the theme gives it an outline. */
export function HighlightProse() {
  return (
    <Prose>
      <p>
        A <mark>highlight</mark> loses its background in forced colours.
      </p>
    </Prose>
  )
}

/** The backgrounds prose sits on. The class and style are only the panel the story draws. */
const surfaces: readonly { name: string; className: string; style?: CSSProperties }[] = [
  {
    name: 'On surface',
    className: 'kv-story-panel',
    style: { backgroundColor: 'var(--kv-color-surface)' },
  },
  {
    name: 'On surface-raised',
    className: 'kv-story-panel',
    style: { backgroundColor: 'var(--kv-color-surface-raised)' },
  },
  {
    name: 'On a warning panel (warning-subtle, with a warning bar)',
    className: 'kv-story-panel kv-story-warning-panel',
  },
]

/**
 * Short prose blocks on surface, surface-raised and a warning panel: the link, muted text, code
 * and blockquote bar on each background (§6.5). Each is a `<section>` named by its heading. The
 * surface names are English maintainer text; the prose is fixture text in the locale.
 */
export function ProseOnSurfaces({ locale }: { locale: FixtureLocale }) {
  const { text, lang } = articleFor(locale)
  const contentLang = lang ?? locale
  const date = new Intl.DateTimeFormat(contentLang, { dateStyle: 'long' })
  const ids = useId()
  return (
    <>
      {surfaces.map((surface, index) => (
        <div key={surface.name}>
          <h2 id={`${ids}-${index}`}>{surface.name}</h2>
          <Prose
            as="section"
            lang={contentLang}
            className={surface.className}
            style={surface.style}
            aria-labelledby={`${ids}-${index}`}
          >
            <h3>{text.paper.heading}</h3>
            <p>{text.paper.text}</p>
            <p>{text.caseNumber(<code>{caseNumberSample}</code>)}</p>
            <blockquote>
              <p>{text.quote}</p>
            </blockquote>
            <div className="kv-inset">
              <p>
                <strong>{text.inset.lead}</strong> {text.inset.text}
              </p>
            </div>
            <p>
              {text.contact.body((linkText) => (
                <a href="https://kvirnby.example/e-tjanst">{linkText}</a>
              ))}
            </p>
            <p>
              <small>
                {text.updated(<time dateTime="2026-09-14">{date.format(updatedDate)}</time>)}
              </small>
            </p>
          </Prose>
        </div>
      ))}
    </>
  )
}

/**
 * Prose never styles a component part, so a Link, a Navigation and a button group keep their own
 * look inside an article. Wrap anything else prose shouldn't touch, such as a card or your own
 * widget, in `kv-not-prose`: it then only gets prose's block spacing. Maintainer text, in English.
 */
export function ComponentsInProse() {
  return (
    <Prose as="article">
      <h1>Components inside prose</h1>
      <p>
        Prose never styles a component part, such as kv-button or kv-link, so KvirnUI components
        keep their own look anywhere in an article. Navigation and kv-button-group are never prose
        either. Wrap anything else prose shouldn’t touch, such as a card or your own widget, in
        kv-not-prose: it then only gets prose’s block spacing.
      </p>
      <section aria-labelledby="not-prose-without">
        <h2 id="not-prose-without">Without kv-not-prose</h2>
        <p>
          Before you apply,{' '}
          <Link.Root href="#guidance">read the guidance on housing adaptation</Link.Root>.
        </p>
        <Navigation.Root label="Example navigation, Without kv-not-prose">
          <Navigation.List>
            <Navigation.Item>
              <Link.Root href="#apply">Apply</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#your-cases">Your cases</Link.Root>
            </Navigation.Item>
            <Navigation.Item>
              <Link.Root href="#contact">Contact</Link.Root>
            </Navigation.Item>
          </Navigation.List>
        </Navigation.Root>
        <div className="kv-button-group">
          <Button className="kv-button--primary">Apply online</Button>
          <Button>Save draft</Button>
        </div>
        <ul>
          <li>This list is in prose, so it gets prose’s markers and indent.</li>
        </ul>
      </section>
      <section aria-labelledby="not-prose-with">
        <h2 id="not-prose-with">With kv-not-prose</h2>
        <div className="kv-not-prose">
          <p>
            Before you apply,{' '}
            <Link.Root href="#guidance">read the guidance on housing adaptation</Link.Root>.
          </p>
          <Navigation.Root label="Example navigation, With kv-not-prose">
            <Navigation.List>
              <Navigation.Item>
                <Link.Root href="#apply">Apply</Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#your-cases">Your cases</Link.Root>
              </Navigation.Item>
              <Navigation.Item>
                <Link.Root href="#contact">Contact</Link.Root>
              </Navigation.Item>
            </Navigation.List>
          </Navigation.Root>
          <div className="kv-button-group">
            <Button className="kv-button--primary">Apply online</Button>
            <Button>Save draft</Button>
          </div>
          <ul>
            <li>This list is inside kv-not-prose, so it keeps the browser’s own style.</li>
          </ul>
        </div>
      </section>
    </Prose>
  )
}
