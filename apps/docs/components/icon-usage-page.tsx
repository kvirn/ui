import { Link } from '@kvirn-ui/react'
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
          id: 'use-them',
          label: 'How to use them',
          content: (
            <>
              <p>
                The icons are in the <code>@kvirn-ui/icons</code> package. KvirnUI has no icons of
                its own to fall back on: you import the ones you use, so you ship only those (your
                bundle, the code you send to the browser). Pass an icon to the{' '}
                <Link href="/components/icon">Icon</Link> component as <code>icon</code>, with or
                without a <code>KvirnProvider</code>:
              </p>
              <CodeBlock
                code={`import { search } from '@kvirn-ui/icons'

<Icon icon={search} />`}
              />
              <p>
                The <Link href="/icons">icon gallery</Link> shows each name in kebab-case, such as{' '}
                <code>chevron-down</code>. The import is the same name in camelCase, such as{' '}
                <code>chevronDown</code>. Two names end in “Icon”, <code>deleteIcon</code> and{' '}
                <code>newIcon</code>, because <code>delete</code> and <code>new</code> are reserved
                words in JavaScript.
              </p>
              <p>
                To use icons by name, register them once in <code>KvirnProvider</code>. You can also
                register icons from Lucide or another set there.
              </p>
              <CodeBlock
                code={`import { bus, cityHall } from '@kvirn-ui/icons'

const icons = defineIcons({ bus, 'city-hall': cityHall })

<KvirnProvider icons={icons}>
  <Icon name="bus" />
</KvirnProvider>`}
              />
              <p>
                <code>allIcons</code> from <code>@kvirn-ui/icons/all</code> registers the whole set,
                but it adds every icon to your bundle. Register only the ones you need.
              </p>
              <ul>
                <li>
                  An icon is decorative by default. Put it beside a word that says the same thing
                  and leave the name out.
                </li>
                <li>
                  Give it a <code>label</code> only when it stands alone and carries meaning. Then
                  draw it at 20 pixels or larger: 16 pixels is for decoration only.
                </li>
                <li>
                  With the <code>Icon</code> component, icons that point along the reading direction
                  flip in right-to-left text. The <Link href="/icons">icon gallery</Link> marks
                  them.
                </li>
                <li>
                  Icons that stand alone, such as a status or a place, have a translated label. Get
                  it with <code>useIconLabel</code>; the <Link href="/icons">icon gallery</Link>{' '}
                  marks them. See the <Link href="/components/icon">Icon</Link> page.
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
          id: 'without-kvirnui',
          label: 'Use them without KvirnUI',
          content: (
            <>
              <p>
                The icons are free for any use, commercial and public-sector use included, under the
                MIT licence. The package depends on nothing else. Each icon is plain drawing data,
                so any app can use it. For React, <code>@kvirn-ui/icons/react</code> has a small{' '}
                <code>SvgIcon</code> component that works in a Server Component too (React is the
                only thing it needs):
              </p>
              <CodeBlock
                code={`import { search } from '@kvirn-ui/icons'
import { SvgIcon } from '@kvirn-ui/icons/react'

<SvgIcon icon={search} />                  // decorative: hidden from screen readers
<SvgIcon icon={search} title="Search" />   // named: an image with an accessible name`}
              />
              <p>
                Keep <code>currentColor</code>, the default, so the icon follows the text colour and
                high-contrast modes. Do not hard-code a <code>fill</code> or <code>stroke</code>.
              </p>
              <p>
                <code>SvgIcon</code> does not flip icons in right-to-left text. Each icon says
                whether it should, and your code decides.
              </p>
            </>
          ),
        },
        {
          id: 'not-done',
          label: 'What is not done yet',
          content: (
            <p>
              The {iconCount} icons are drawn and checked by tests and agents. Recognition tests, a
              native-speaker review of the labels (Swedish, Finnish, Norwegian Bokmål, Norwegian
              Nynorsk and English), checks with real assistive technology and a sensitivity review
              have not been done yet.
            </p>
          ),
        },
      ]}
    />
  )
}
