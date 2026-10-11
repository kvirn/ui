import { getLanguage } from '@kvirn-ui/core'
import type { LocaleCode } from '@kvirn-ui/i18n'
import { useLocale } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

// Example text for the docs site examples, in English. This is fixture text, not
// library text: library strings (`link.newTabNotice`) come from @kvirn-ui/i18n through the
// provider.

export interface ExampleTexts {
  heading: { buttons: string; links: string }
  button: {
    sendApplication: string
    saveDraft: string
    deleteDraft: string
    saveLong: string
    disabledReason: string
    dangerNote: string
    closeLabel: string
    saving: string
    applicantName: string
  }
  variant: { primary: string; secondary: string; danger: string }
  state: { default: string; disabled: string; focusableDisabled: string }
  density: { comfortable: string; compact: string }
  link: {
    applyInText: string
    /** Each locale decides where the link goes in the sentence. */
    sentence: (parts: { link: ReactNode }) => ReactNode
    navLabel: string
    navOverview: string
    navApply: string
    navContact: string
    guidelines: string
  }
}

const en: ExampleTexts = {
  heading: { buttons: 'Buttons', links: 'Links' },
  button: {
    sendApplication: 'Send application',
    saveDraft: 'Save draft',
    deleteDraft: 'Delete draft',
    saveLong: 'Save building permit application draft',
    disabledReason: 'Fill in all required fields before you send.',
    dangerNote:
      'Delete buttons always need a confirmation step. They are shown together here only so you can compare them.',
    closeLabel: 'Close',
    saving: 'Saving draft…',
    applicantName: 'Your name',
  },
  variant: { primary: 'Primary', secondary: 'Secondary', danger: 'Danger' },
  state: { default: 'Default', disabled: 'Disabled', focusableDisabled: 'Disabled but focusable' },
  density: { comfortable: 'Comfortable (default)', compact: 'Compact' },
  link: {
    applyInText: 'apply for a parking permit',
    sentence: ({ link }) => <>You can {link} online.</>,
    navLabel: 'Parking permits',
    navOverview: 'Overview',
    navApply: 'Apply',
    navContact: 'Contact us',
    guidelines: 'Read the accessibility guidelines',
  },
}

export const exampleTexts: Partial<Record<LocaleCode, ExampleTexts>> = { en }

export interface ExampleTextsResult {
  texts: ExampleTexts
  /** `'en'` when the texts fell back to English: put it on every element that shows them. */
  textLang: string | undefined
}

const isLocaleCode = (language: string): language is LocaleCode => language in exampleTexts

/** The example texts for a locale, falling back to English with `lang="en"`. */
export function getExampleTexts(locale: string): ExampleTextsResult {
  const language = getLanguage(locale)
  const texts = isLocaleCode(language) ? exampleTexts[language] : undefined
  return texts === undefined
    ? { texts: en, textLang: language === 'en' ? undefined : 'en' }
    : { texts, textLang: undefined }
}

/** The example texts for the nearest provider's locale. */
export function useExampleTexts(): ExampleTextsResult {
  return getExampleTexts(useLocale().locale)
}
