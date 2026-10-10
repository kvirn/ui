import { messages } from '../messages/en.ts'
import { contentTypePreviews } from './gallery/previews/content-types.tsx'
import { PageWithContents } from './page-contents.tsx'
import { contentTypePages } from './site-sections.ts'

const text = messages.docs.contentTypes

export type ContentTypeSlug = keyof typeof text.blocks

/** A minimal page per content type: what is on it and where it sits in the shell (Plan 0100 G6a). */
export function ContentTypePage({ slug }: { slug: ContentTypeSlug }) {
  const page = contentTypePages.find((contentType) => contentType.href.endsWith(`/${slug}`))
  if (page === undefined) {
    throw new Error(`No content type "${slug}" in site-sections.ts.`)
  }
  return (
    <PageWithContents
      title={page.label}
      lead={page.summary}
      sections={[
        {
          id: 'what-is-on-it',
          label: text.whatIsOnIt,
          content: (
            <ul>
              {text.blocks[slug].map((block) => (
                <li key={block}>{block}</li>
              ))}
            </ul>
          ),
        },
        {
          id: 'where-it-sits',
          label: text.whereItSits,
          content: (
            <>
              <p>{text.shell({ name: page.label })}</p>
              <div className="docs-gallery-preview" aria-hidden="true">
                {contentTypePreviews[slug]}
              </div>
            </>
          ),
        },
      ]}
    />
  )
}
