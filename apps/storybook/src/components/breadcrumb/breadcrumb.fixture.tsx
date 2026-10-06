import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en as enMessages } from '@kvirn-ui/i18n/en'
import { fi as fiMessages } from '@kvirn-ui/i18n/fi'
import { nb as nbMessages } from '@kvirn-ui/i18n/nb'
import { nn as nnMessages } from '@kvirn-ui/i18n/nn'
import { se as seMessages } from '@kvirn-ui/i18n/se'
import { sv as svMessages } from '@kvirn-ui/i18n/sv'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'

// Story fixture for Components/Breadcrumb: the library's own strings follow the locale toolbar through a
// provider, like an app's would.

const catalogs: Record<string, KvirnMessages> = {
  sv: svMessages,
  fi: fiMessages,
  nb: nbMessages,
  nn: nnMessages,
  se: seMessages,
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
