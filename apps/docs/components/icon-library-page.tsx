import { allIcons } from '@kvirn-ui/icons/all'
import { Link } from '@kvirn-ui/react'
import catalog from '../../../packages/icons/catalog.json'
import { DocsPage } from './docs-page.tsx'
import { IconLibrary } from './icon-library.tsx'
import type { IconLibraryCategory } from './icon-library.tsx'

const categories: IconLibraryCategory[] = catalog.categories
  .map((category) => ({
    ...category,
    icons: catalog.icons
      .filter((icon) => icon.category === category.id && Object.hasOwn(allIcons, icon.name))
      .map(({ name, aliases, tags, meaning, mirrorInRtl }) => ({
        name,
        aliases,
        tags,
        meaning,
        mirrorInRtl,
      })),
  }))
  .filter((category) => category.icons.length > 0)

const iconCount = categories.reduce((total, category) => total + category.icons.length, 0)

export function IconLibraryPage() {
  return (
    <DocsPage
      title="Icons"
      lead={`${iconCount} outline icons in ${categories.length} groups, drawn for public-sector services. Each one is hidden from screen readers unless you give it a name.`}
    >
      <p>
        <strong>What is not done yet.</strong> The {iconCount} icons are drawn and checked by tests
        and agents. Recognition tests, a native-speaker review of the labels (Swedish, Finnish,
        Norwegian Bokmål, Norwegian Nynorsk and English), checks with real assistive technology and
        a sensitivity review have not been done yet.
      </p>
      <h2 id="use-them">How to use them</h2>
      <p>
        The icons are in the <code>@kvirn-ui/icons</code> package. Register the whole set once, and
        then draw any icon by its name with the <Link href="/components/icon">Icon</Link> component:
      </p>
      <pre>
        <code>{`<KvirnProvider icons={allIcons}>
  <Icon name="search" />
</KvirnProvider>`}</code>
      </pre>
      <p>
        <code>allIcons</code> comes from <code>@kvirn-ui/icons/all</code>. To ship only the icons
        you use, import them one by one from <code>@kvirn-ui/icons</code> and register those.
      </p>
      <ul>
        <li>
          An icon is decorative by default. Put it beside a word that says the same thing and leave
          the name out.
        </li>
        <li>
          Give it a <code>label</code> only when it stands alone and carries meaning. Then draw it
          at 20 pixels or larger: 16 pixels is for decoration only.
        </li>
        <li>
          Icons that point along the reading direction flip in right-to-left text. The list marks
          them.
        </li>
        <li>
          Variants such as <code>-add</code>, <code>-remove</code> and <code>-off</code> share their
          host drawing with the plain icon, and add a small badge or a slash. They are separate
          names, so pick one for its meaning, not its look.
        </li>
      </ul>
      <h2 id="without-kvirnui">Use them without KvirnUI</h2>
      <p>
        The icons are free for any use, commercial and public-sector use included, under the MIT
        licence. The package depends on nothing else. Each icon is plain drawing data, so any app
        can use it. For React, <code>@kvirn-ui/icons/react</code> has a small <code>SvgIcon</code>{' '}
        component that works in a Server Component too (React is the only thing it needs):
      </p>
      <pre>
        <code>{`import { search } from '@kvirn-ui/icons'
import { SvgIcon } from '@kvirn-ui/icons/react'

<SvgIcon icon={search} />                  // decorative: hidden from screen readers
<SvgIcon icon={search} title="Search" />   // named: an image with an accessible name`}</code>
      </pre>
      <p>
        Keep <code>currentColor</code>, the default, so the icon follows the text colour and
        high-contrast modes. Do not hard-code a <code>fill</code> or <code>stroke</code>.
      </p>
      <p>
        <code>SvgIcon</code> does not flip icons in right-to-left text. Each icon says whether it
        should, and your code decides.
      </p>
      <h2 id="all-icons">All icons</h2>
      <IconLibrary categories={categories} />
    </DocsPage>
  )
}
