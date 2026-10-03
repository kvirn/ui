import { getLanguage } from '@kvirn-ui/core'
import type { LocaleCode } from '@kvirn-ui/i18n'
import { useLocale } from '@kvirn-ui/react'
import type { ReactNode } from 'react'

// Example text for the docs site examples, in all six languages. This is fixture text, not
// library text: library strings (`link.newTabNotice`) come from @kvirn-ui/i18n through the
// provider.
//
// The nb, nn and fi texts are the designer's drafts and need a native review before the docs
// site is public. The density labels are the engineer's drafts (Plan 0005, Phase 1).

export interface ExampleTexts {
  heading: { buttons: string; links: string }
  button: {
    sendApplication: string
    saveDraft: string
    deleteDraft: string
    saveLong: string
    disabledReason: string
    dangerNote: string
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

const sv: ExampleTexts = {
  heading: { buttons: 'Knappar', links: 'Länkar' },
  button: {
    sendApplication: 'Skicka ansökan',
    saveDraft: 'Spara utkast',
    deleteDraft: 'Ta bort utkast',
    saveLong: 'Spara utkast till bygglovsansökan',
    disabledReason: 'Fyll i alla obligatoriska fält innan du skickar.',
    dangerNote:
      'Knappar som tar bort något behöver alltid ett bekräftelsesteg. De visas tillsammans här bara för att kunna jämföras.',
  },
  variant: { primary: 'Primär', secondary: 'Sekundär', danger: 'Farlig' },
  state: {
    default: 'Standard',
    disabled: 'Inaktiverad',
    focusableDisabled: 'Inaktiverad men fokuserbar',
  },
  density: { comfortable: 'Bekväm (standard)', compact: 'Kompakt' },
  link: {
    applyInText: 'ansöka om parkeringstillstånd',
    sentence: ({ link }) => <>Du kan {link} på webben.</>,
    navLabel: 'Parkeringstillstånd',
    navOverview: 'Översikt',
    navApply: 'Ansök',
    navContact: 'Kontakta oss',
    guidelines: 'Läs riktlinjerna för tillgänglighet',
  },
}

const fi: ExampleTexts = {
  heading: { buttons: 'Painikkeet', links: 'Linkit' },
  button: {
    sendApplication: 'Lähetä hakemus',
    saveDraft: 'Tallenna luonnos',
    deleteDraft: 'Poista luonnos',
    saveLong: 'Tallenna rakennuslupahakemuksen luonnos',
    disabledReason: 'Täytä kaikki pakolliset kentät ennen lähettämistä.',
    dangerNote:
      'Poistopainikkeet tarvitsevat aina vahvistusvaiheen. Ne näytetään tässä yhdessä vain vertailun vuoksi.',
  },
  variant: { primary: 'Ensisijainen', secondary: 'Toissijainen', danger: 'Vaarallinen' },
  state: {
    default: 'Oletus',
    disabled: 'Pois käytöstä',
    focusableDisabled: 'Pois käytöstä mutta kohdistettavissa',
  },
  density: { comfortable: 'Väljä (oletus)', compact: 'Tiivis' },
  link: {
    applyInText: 'hakea pysäköintilupaa',
    sentence: ({ link }) => <>Voit {link} verkossa.</>,
    navLabel: 'Pysäköintiluvat',
    navOverview: 'Yleiskatsaus',
    navApply: 'Hae',
    navContact: 'Ota yhteyttä',
    guidelines: 'Lue saavutettavuusohjeet',
  },
}

const nb: ExampleTexts = {
  heading: { buttons: 'Knapper', links: 'Lenker' },
  button: {
    sendApplication: 'Send søknad',
    saveDraft: 'Lagre utkast',
    deleteDraft: 'Slett utkast',
    saveLong: 'Lagre utkast til byggesøknad',
    disabledReason: 'Fyll ut alle obligatoriske felt før du sender.',
    dangerNote:
      'Knapper som sletter noe, trenger alltid et bekreftelsestrinn. De vises sammen her bare for å kunne sammenlignes.',
  },
  variant: { primary: 'Primær', secondary: 'Sekundær', danger: 'Farlig' },
  state: {
    default: 'Standard',
    disabled: 'Deaktivert',
    focusableDisabled: 'Deaktivert, men kan få fokus',
  },
  density: { comfortable: 'Komfortabel (standard)', compact: 'Kompakt' },
  link: {
    applyInText: 'søke om parkeringstillatelse',
    sentence: ({ link }) => <>Du kan {link} på nett.</>,
    navLabel: 'Parkeringstillatelser',
    navOverview: 'Oversikt',
    navApply: 'Søk',
    navContact: 'Kontakt oss',
    guidelines: 'Les retningslinjene for universell utforming',
  },
}

const nn: ExampleTexts = {
  heading: { buttons: 'Knappar', links: 'Lenkjer' },
  button: {
    sendApplication: 'Send søknad',
    saveDraft: 'Lagre utkast',
    deleteDraft: 'Slett utkast',
    saveLong: 'Lagre utkast til byggjesøknad',
    disabledReason: 'Fyll ut alle obligatoriske felt før du sender.',
    dangerNote:
      'Knappar som slettar noko, treng alltid eit stadfestingssteg. Dei blir viste saman her berre for å kunne samanliknast.',
  },
  variant: { primary: 'Primær', secondary: 'Sekundær', danger: 'Farleg' },
  state: {
    default: 'Standard',
    disabled: 'Deaktivert',
    focusableDisabled: 'Deaktivert, men kan få fokus',
  },
  density: { comfortable: 'Komfortabel (standard)', compact: 'Kompakt' },
  link: {
    applyInText: 'søkje om parkeringsløyve',
    sentence: ({ link }) => <>Du kan {link} på nett.</>,
    navLabel: 'Parkeringsløyve',
    navOverview: 'Oversikt',
    navApply: 'Søk',
    navContact: 'Kontakt oss',
    guidelines: 'Les retningslinjene for universell utforming',
  },
}

/**
 * Northern Sámi: TODO(native-review). Until a native speaker supplies the texts, `se` shows
 * the English ones with `lang="en"` (3.1.2) and the `samiPendingNote`.
 */
const se: ExampleTexts | undefined = undefined

export const exampleTexts: Record<LocaleCode, ExampleTexts | undefined> = {
  sv,
  fi,
  nb,
  nn,
  se,
  en,
}

/** Shown only for `se`, in English, because it can't be in Northern Sámi yet. */
export const samiPendingNote =
  'Some text in this example is in English until a native speaker has reviewed the Northern Sámi translation.'

export interface ExampleTextsResult {
  texts: ExampleTexts
  /** `'en'` when the texts fell back to English: put it on every element that shows them. */
  textLang: string | undefined
  isSamiPending: boolean
}

const isLocaleCode = (language: string): language is LocaleCode => language in exampleTexts

/** The example texts for a locale, falling back to English with `lang="en"`. */
export function getExampleTexts(locale: string): ExampleTextsResult {
  const language = getLanguage(locale)
  const texts = isLocaleCode(language) ? exampleTexts[language] : undefined
  return texts === undefined
    ? {
        texts: en,
        textLang: language === 'en' ? undefined : 'en',
        isSamiPending: language === 'se',
      }
    : { texts, textLang: undefined, isSamiPending: false }
}

/** The example texts for the nearest provider's locale. */
export function useExampleTexts(): ExampleTextsResult {
  return getExampleTexts(useLocale().locale)
}

/** The English-only note under examples whose Sámi texts aren't reviewed yet. */
export function SamiPendingNote({ className }: { className?: string | undefined }) {
  const { isSamiPending } = useExampleTexts()
  return isSamiPending ? (
    <p lang="en" className={className}>
      {samiPendingNote}
    </p>
  ) : null
}
