import { KvirnProvider } from '@kvirn-ui/react'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Decorator } from '@storybook/react-vite'

// Story fixture for Components/QuickExit. The library's own words follow the locale toolbar
// through a provider, like an app's would, and the provider renders the live region the Shift
// count is announced through.
const catalogs = { sv, fi, en }

export const withQuickExitMessages: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  const catalog = locale === 'fi' ? fi : locale === 'en' ? en : sv
  return (
    <KvirnProvider locale={locale in catalogs ? locale : 'sv'} messages={catalog}>
      <Story />
    </KvirnProvider>
  )
}
