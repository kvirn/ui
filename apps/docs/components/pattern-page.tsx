import { messages } from '../messages/en.ts'
import { patternPreviews } from './gallery/previews/patterns.tsx'
import { PageWithContents } from './page-contents.tsx'
import { patternPages } from './site-sections.ts'

const text = messages.docs.patterns

export type PatternSlug = keyof typeof text.elements

/** A minimal page per shipped pattern: what it is built from and a picture of it (Plan 0100 G5). */
export function PatternPage({ slug }: { slug: PatternSlug }) {
  const page = patternPages.find((pattern) => pattern.href.endsWith(`/${slug}`))
  if (page === undefined) {
    throw new Error(`No pattern "${slug}" in site-sections.ts.`)
  }
  return (
    <PageWithContents
      title={page.label}
      lead={page.summary}
      sections={[
        {
          id: 'built-from',
          label: text.builtFrom,
          content: (
            <>
              <p>{text.builtFromLead}</p>
              <ul>
                {text.elements[slug].map((element) => (
                  <li key={element}>{element}</li>
                ))}
              </ul>
            </>
          ),
        },
        {
          id: 'what-it-looks-like',
          label: text.whatItLooksLike,
          content: (
            <div className="docs-gallery-preview" aria-hidden="true">
              {patternPreviews[slug]}
            </div>
          ),
        },
      ]}
    />
  )
}
