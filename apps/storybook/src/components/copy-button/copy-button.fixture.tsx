import { KvirnProvider } from '@kvirn/ui'
import { en } from '@kvirn/i18n/en'
import { fi } from '@kvirn/i18n/fi'
import { sv } from '@kvirn/i18n/sv'
import type { Decorator } from '@storybook/react-vite'

// Story fixture for Components/CopyButton and Components/CodeBlock. The library's own words
// follow the locale toolbar through a provider, like an app's would. The
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
