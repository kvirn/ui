import { Heading, Link } from '@kvirn-ui/react'
import { CodeBlock } from '../components/code-block.tsx'
import { PageWithContents } from '../components/page-contents.tsx'

// A placeholder home page for the Phase 1 prototype. Plan 0005 task C4 writes the real one.
export default function HomePage() {
  return (
    <PageWithContents
      title="KvirnUI"
      titleSize="display"
      lead="Accessible React components for public services in the Nordics and the EU. You write the markup and styles. KvirnUI gives you the behaviour, keyboard support and screen reader support, designed and tested to meet WCAG 2.2 AA."
      intro={
        <p>
          This is a pre-alpha version. The API will change. Don’t use KvirnUI in a live service yet.
        </p>
      }
      sections={[
        {
          id: 'what-you-get',
          label: 'What you get',
          content: (
            <p>
              Behaviour, keyboard support and screen reader support in six languages. You keep the
              markup and the styles.
            </p>
          ),
        },
        {
          id: 'components',
          label: 'Components',
          content: (
            <p>
              <Link href="/components/button">Read about Button</Link>
            </p>
          ),
        },
        {
          id: 'start-here',
          label: 'Start here',
          content: (
            <>
              <Heading level={3} id="installation">
                Installation
              </Heading>
              <CodeBlock code="pnpm add @kvirn-ui/react @kvirn-ui/i18n" />
              <p>
                For the default look, also add <code>@kvirn-ui/theme</code> and import{' '}
                <code>theme.css</code> once, for example in your root layout. Every component is
                then styled. Remove the import, and it’s unstyled again: KvirnUI never loads CSS for
                you. <Link href="/foundation/theming">Theming</Link> shows how to change it.
              </p>
              <CodeBlock
                code={`pnpm add @kvirn-ui/theme

import '@kvirn-ui/theme/theme.css'`}
              />
              <p>Each component page shows the import it needs.</p>
            </>
          ),
        },
        {
          id: 'what-wcag-means',
          label: 'What “designed and tested to meet WCAG 2.2 AA” means',
          content: (
            <p>
              Every component is tested automatically and reviewed for accessibility. Whether your
              service meets WCAG 2.2 AA depends on how you build and test the whole service.
            </p>
          ),
        },
      ]}
    />
  )
}
