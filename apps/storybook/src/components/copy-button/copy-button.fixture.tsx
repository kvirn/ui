import { KvirnProvider } from '@kvirn-ui/react'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Decorator } from '@storybook/react-vite'

// Story fixture for Components/CopyButton and Components/CodeBlock. The library's own words
// ("Kopiera", "Copy") follow the locale toolbar through a provider, like an app's would. The
// provider also renders the live regions the copy result is announced through.
const catalogs = { sv, fi, en }

export const withCopyMessages: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  const catalog = locale === 'fi' ? fi : locale === 'en' ? en : sv
  return (
    <KvirnProvider locale={locale in catalogs ? locale : 'sv'} messages={catalog}>
      <Story />
    </KvirnProvider>
  )
}
