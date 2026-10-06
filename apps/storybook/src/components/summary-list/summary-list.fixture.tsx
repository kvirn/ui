import type { KvirnMessages } from '@kvirn-ui/i18n'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { nb } from '@kvirn-ui/i18n/nb'
import { nn } from '@kvirn-ui/i18n/nn'
import { se } from '@kvirn-ui/i18n/se'
import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider } from '@kvirn-ui/react'
import type { Decorator } from '@storybook/react-vite'

// The library's own strings follow the locale toolbar, through a provider with the catalog like
// an app's would. The visible fixture text is Swedish, or the story's own language.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, se, en }

export const withSummaryListLocale: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  return (
    <KvirnProvider locale={locale} messages={catalogs[locale] ?? en}>
      <Story />
    </KvirnProvider>
  )
}
