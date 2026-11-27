import { Link } from '@kvirn/ui'
import { messages } from '../messages/en.ts'
import { CodeBlock } from './code-block.tsx'
import { iconCount } from './icon-library-page.tsx'
import { PageWithContents } from './page-contents.tsx'

const text = messages.docs.icons

export function IconUsagePage() {
  return (
    <PageWithContents
      title="Icons"
      lead="Outline icons drawn for public-sector services. Each one is hidden from screen readers unless you give it a name."
      sections={[
        {
          id: 'use-an-icon',
          label: 'Use an icon',
          content: (
            <>
              <p>
                Every icon in the <code>@kvirn/icons</code> package is a React component, such as{' '}
                <code>SearchIcon</code>. It works with or without KvirnUI, and in a Server Component
                too. You import only the icons you use, so you ship only those (your bundle, the
                code you send to the browser).
              </p>
              <CodeBlock
                code={`import { SearchIcon } from '@kvirn/icons/react'

<SearchIcon />                  // decorative: hidden from screen readers
<SearchIcon size={20} />
<SearchIcon className="size-4" />
<SearchIcon title="Search" />   // named: an image with an accessible name`}
              />
              <p>
                The <Link href="/icons">icon gallery</Link> shows each name in kebab-case, such as{' '}
                <code>chevron-down</code>. The component is the same name in PascalCase with “Icon”
                after it, such as <code>ChevronDownIcon</code>.
              </p>
              <ul>
                <li>
                  An icon is decorative by default. Put it beside a word that says the same thing
                  and leave the name out.
                </li>
                <li>
                  Give it a <code>title</code> or <code>aria-label</code> only when it stands alone
                  and carries meaning, and take the text from your app’s translations. Then draw it
                  at 20 pixels or larger: 16 pixels is for decoration only.
                </li>
                <li>
                  An icon that does something goes inside a <code>&lt;button&gt;</code> or{' '}
                  <code>&lt;a&gt;</code>, and the name goes on that control, not on the icon.{' '}
                  <code>tabIndex</code>, <code>onClick</code> and <code>aria-describedby</code> do
                  not pass through to the icon for this reason. <code>size</code>,{' '}
                  <code>className</code>, <code>title</code> and the other SVG props do.
                </li>
                <li>
                  Icons that stand alone, such as a status or a place, have a translated label. Get
                  it with <code>useIconLabel</code>; the <Link href="/icons">icon gallery</Link>{' '}
                  marks them.
                </li>
                <li>
                  Variants such as <code>-add</code>, <code>-remove</code> and <code>-off</code>{' '}
                  share their host drawing with the plain icon, and add a small badge or a slash.
                  They are separate names, so pick one for its meaning, not its look.
                </li>
              </ul>
              <p>
                <Link href="/icons">{text.seeAll({ count: iconCount })}</Link>
              </p>
            </>
          ),
        },
        {
          id: 'with-kvirnui',
          label: 'With KvirnUI’s theme',
          content: (
            <>
              <p>
                Inside KvirnUI, register the icons you use once in <code>KvirnProvider</code>, then
                draw them by name with the <Link href="/components/icon">Icon</Link> component. The
                name is a string, so it works in a Server Component too. A misspelt name is a type
                error.
              </p>
              <CodeBlock
                code={`import { arrowForward, search } from '@kvirn/icons'

const icons = defineIcons({ search, 'arrow-forward': arrowForward })

<KvirnProvider icons={icons}>
  <Icon name="search" />
  <Icon name="search" label="Search" size="24" variant="primary" />
  <Icon name="arrow-forward" />
</KvirnProvider>`}
              />
              <p>
                Icon adds the theme’s sizes (<code>size="24"</code>, which follows the reader’s own
                text size), the colours <code>variant</code> picks, and a <code>label</code> that
                names the icon. A directional icon, such as <code>arrow-forward</code>, flips in
                right-to-left text by itself. You can also register icons from Lucide or another
                set.
              </p>
              <p>
                Register only the icons you need. <code>allIcons</code> from{' '}
                <code>@kvirn/icons/all</code> registers the whole set, but it adds every icon to
                your bundle.
              </p>
            </>
          ),
        },
        {
          id: 'colour-and-direction',
          label: 'Colour and right-to-left',
          content: (
            <>
              <p>
                Keep <code>currentColor</code>, the default, so the icon follows the text colour and
                high-contrast modes. Do not hard-code a <code>fill</code> or <code>stroke</code>.
              </p>
              <p>
                Icons that point along the reading direction should flip in right-to-left text. The{' '}
                <Link href="/icons">icon gallery</Link> marks them, and each icon’s{' '}
                <code>mirrorInRtl</code> says it (<code>arrowForward.mirrorInRtl</code> from{' '}
                <code>@kvirn/icons</code>). Icons you register as data flip by themselves in{' '}
                <code>Icon</code>. The bare icon components do not flip, so your code decides.
              </p>
              <p>
                For a bare component, a flip is one rule, for example{' '}
                <code>
                  .my-icon:dir(rtl) {'{'} transform: scaleX(-1) {'}'}
                </code>
                .
              </p>
            </>
          ),
        },
        {
          id: 'picked-at-runtime',
          label: 'An icon picked at runtime',
          content: (
            <>
              <p>
                To draw an icon whose name you only know while the app runs, use{' '}
                <code>SvgIcon</code> with <code>allIcons[name]</code> from{' '}
                <code>@kvirn/icons/all</code>. That file holds every icon, so keep it for pickers
                and galleries.
              </p>
              <CodeBlock
                code={`import { allIcons, type LibraryIconName } from '@kvirn/icons/all'
import { SvgIcon } from '@kvirn/icons/react'

function PickedIcon({ name }: { name: LibraryIconName }) {
  return <SvgIcon icon={allIcons[name]} />
}`}
              />
            </>
          ),
        },
        {
          id: 'without-kvirnui',
          label: 'Without KvirnUI or React',
          content: (
            <p>
              The icons are free for any use, commercial and public-sector use included, under the
              MIT licence, and the package depends on nothing else. Each icon is also plain drawing
              data, such as <code>arrowForward.shapes</code> from <code>@kvirn/icons</code>, so any
              framework can draw it. <code>@kvirn/icons/all</code> exports every icon and the list
              of names, but it cannot be trimmed down to the icons you use.
            </p>
          ),
        },
        {
          id: 'not-done',
          label: 'Limits',
          content: (
            <p>
              The {iconCount} icons are checked by automated tests. Before you launch, test that
              your users recognise the icons you use, have a native speaker review the labels you
              give them in each language you ship, and try them with your users’ assistive
              technology.
            </p>
          ),
        },
      ]}
    />
  )
}
