import type { KvirnMessages } from '@kvirn/i18n'
import { en } from '@kvirn/i18n/en'
import { fi } from '@kvirn/i18n/fi'
import { nb } from '@kvirn/i18n/nb'
import { nn } from '@kvirn/i18n/nn'
import { sv } from '@kvirn/i18n/sv'
import { KvirnProvider } from '@kvirn/ui'
import type { Decorator } from '@storybook/react-vite'

// The library's own strings follow the locale toolbar, through a provider with the catalog like
// an app's would. The visible fixture text is English, or the story's own language.

const catalogs: Record<string, KvirnMessages> = { sv, fi, nb, nn, en }

export const withDefinitionListLocale: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  return (
    <KvirnProvider locale={locale} messages={catalogs[locale] ?? en}>
      <Story />
    </KvirnProvider>
  )
}
