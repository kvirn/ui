import { allIcons } from '@kvirn-ui/icons/all'
import { Icon, Link, LinkIcon } from '@kvirn-ui/react'
import catalog from '../../../packages/icons/catalog.json'
import { messages } from '../messages/en.ts'
import { DocsPage } from './docs-page.tsx'
import { IconLibrary } from './icon-library.tsx'
import type { IconLibraryCategory } from './icon-library.tsx'

const text = messages.docs.icons

const categories: IconLibraryCategory[] = catalog.categories
  .map((category) => ({
    ...category,
    icons: catalog.icons
      .filter((icon) => icon.category === category.id && Object.hasOwn(allIcons, icon.name))
      .map(({ name, aliases, tags, meaning, mirrorInRtl, label }) => ({
        name,
        aliases,
        tags,
        meaning,
        mirrorInRtl,
        hasLabel: label !== null,
      })),
  }))
  .filter((category) => category.icons.length > 0)

export const iconCount = categories.reduce((total, category) => total + category.icons.length, 0)

export function IconLibraryPage({
  query,
  category,
}: {
  query: string
  category: string | undefined
}) {
  return (
    <DocsPage
      wide
      title={messages.docs.nav.sections.icons}
      lead={text.allLead({ count: iconCount })}
      afterFacts={
        <>
          <p>
            <Link href="/foundation/icons" className="kv-link--service">
              <LinkIcon>
                <Icon name="arrow-forward" size="24" />
              </LinkIcon>
              {text.howToUse}
            </Link>
          </p>
          <p>
            {text.notDone} <Link href="/foundation/icons#not-done">{text.notDoneLink}</Link>
          </p>
        </>
      }
    >
      <IconLibrary
        categories={categories}
        initialQuery={query}
        initialCategory={categories.find(({ id }) => id === category)?.id ?? 'all'}
      />
    </DocsPage>
  )
}
