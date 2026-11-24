import type { KvirnMessages } from '@kvirn/i18n'
import { en as enMessages } from '@kvirn/i18n/en'
import { fi as fiMessages } from '@kvirn/i18n/fi'
import { nb as nbMessages } from '@kvirn/i18n/nb'
import { nn as nnMessages } from '@kvirn/i18n/nn'
import { sv as svMessages } from '@kvirn/i18n/sv'
import { KvirnProvider } from '@kvirn/ui'
import type { Decorator } from '@storybook/react-vite'

// Story fixture for Components/Pagination: the library's own strings follow the locale toolbar through a
// provider, like an app's would.

const catalogs: Record<string, KvirnMessages> = {
  sv: svMessages,
  fi: fiMessages,
  nb: nbMessages,
  nn: nnMessages,
  en: enMessages,
}

export const withLocale: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  return (
    <KvirnProvider locale={locale} messages={catalogs[locale] ?? svMessages}>
      <Story />
    </KvirnProvider>
  )
}
