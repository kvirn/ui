import { Link } from '@kvirn-ui/react'
import { messages } from '../messages/en.ts'
import type { SitePage } from './site-sections.ts'

const text = messages.docs.pager

function PagerLink({ page, direction }: { page: SitePage; direction: 'previous' | 'next' }) {
  return (
    <li className={direction === 'next' ? 'docs-pager-next' : undefined}>
      <Link href={page.href} rel={direction === 'next' ? 'next' : 'prev'}>
        <small>{text[direction]}</small> <strong>{page.label}</strong>
      </Link>
    </li>
  )
}

/** Previous and next within the section (docs-shell-mega-menu.md §3): the card's name is the direction and the title. */
export function SitePager({
  previous,
  next,
}: {
  previous?: SitePage | undefined
  next?: SitePage | undefined
}) {
  if (previous === undefined && next === undefined) {
    return null
  }
  return (
    <nav className="docs-pager" aria-label={text.label}>
      <ul role="list">
        {previous === undefined ? null : <PagerLink page={previous} direction="previous" />}
        {next === undefined ? null : <PagerLink page={next} direction="next" />}
      </ul>
    </nav>
  )
}
