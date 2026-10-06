import { Link, useRouteFocus } from '@kvirn-ui/react'
import { useRef, useState } from 'react'

// Story fixture for useRouteFocus. Two fake routes stand in for a router: the `key` is the
// route plus the search, and the hash is kept apart, so a link to a section never moves focus.
// The text is fixture text, in sv and en.

type Route = 'start' | 'tjanster'

const texts = {
  sv: {
    start: { title: 'Välkommen', body: 'Det här är startsidan.' },
    tjanster: { title: 'Våra tjänster', body: 'Det här är sidan om tjänsterna.' },
    toStart: 'Till startsidan',
    toServices: 'Till tjänster',
    toSection: 'Hoppa till avsnittet längre ner',
    section: 'Ett avsnitt längre ner',
    search: 'Sök',
    firstLink: 'Första länken på sidan',
  },
  en: {
    start: { title: 'Welcome', body: 'This is the start page.' },
    tjanster: { title: 'Our services', body: 'This is the services page.' },
    toStart: 'To the start page',
    toServices: 'To services',
    toSection: 'Jump to the section further down',
    section: 'A section further down',
    search: 'Search',
    firstLink: 'First link on the page',
  },
}

export type RouteFocusFixtureLocale = keyof typeof texts

export function RouteFocusPage({
  locale,
  announce = false,
}: {
  locale: RouteFocusFixtureLocale
  announce?: boolean
}) {
  const text = texts[locale]
  const [route, setRoute] = useState<Route>('start')
  const [, setHash] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus({ key: route, containerRef: mainRef, announce })

  return (
    <>
      <header>
        <nav aria-label={locale === 'sv' ? 'Huvudmeny' : 'Main menu'}>
          <Link.Root
            href="/start"
            onClick={(event) => {
              event.preventDefault()
              setRoute('start')
            }}
          >
            {text.toStart}
          </Link.Root>{' '}
          <Link.Root
            href="/tjanster"
            onClick={(event) => {
              event.preventDefault()
              setRoute('tjanster')
            }}
          >
            {text.toServices}
          </Link.Root>{' '}
          <Link.Root
            href="#avsnitt"
            onClick={(event) => {
              event.preventDefault()
              setHash('#avsnitt')
            }}
          >
            {text.toSection}
          </Link.Root>
        </nav>
      </header>
      <main ref={mainRef}>
        <h1>{text[route].title}</h1>
        <p>{text[route].body}</p>
        <p>
          <Link.Root href="#forsta">{text.firstLink}</Link.Root>
        </p>
        <h2 id="avsnitt">{text.section}</h2>
      </main>
    </>
  )
}
