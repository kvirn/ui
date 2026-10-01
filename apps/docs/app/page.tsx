import { Link } from '@kvirn-ui/react'
import { PageHeading } from '../components/page-heading.tsx'

// A placeholder home page for the Phase 1 prototype. Plan 0005 task C4 writes the real one.
export default function HomePage() {
  return (
    <>
      <PageHeading className="docs-display">KvirnUI</PageHeading>
      <p data-kv-lead>
        Accessible React components for public services in the Nordics and the EU. You write the
        markup and styles. KvirnUI gives you the behaviour, keyboard support and screen reader
        support, designed and tested to meet WCAG 2.2 AA.
      </p>
      <p>
        This is a pre-alpha version. The API will change. Don’t use KvirnUI in a live service yet.
      </p>
      <p>
        <Link href="/components/button">Read about Button</Link>
      </p>
    </>
  )
}
