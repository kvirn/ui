'use client'
import { KvirnProvider, Link, useDateSettings, useFormat, useLocale } from '@kvirn-ui/react'
import { useKvirnProviderTexts } from './texts.ts'

function Settings() {
  const { texts, textLang } = useKvirnProviderTexts()
  const { locale, dir, country } = useLocale()
  const { timeZone } = useDateSettings()
  const format = useFormat()
  return (
    <div lang={textLang}>
      <dl>
        <dt>{texts.language}</dt>
        <dd>{locale}</dd>
        <dt>{texts.direction}</dt>
        <dd>{dir}</dd>
        <dt>{texts.country}</dt>
        <dd>{country ?? texts.noCountry}</dd>
        <dt>{texts.timeZone}</dt>
        <dd>{timeZone}</dd>
        <dt>{texts.decisionDate}</dt>
        <dd>{format.date('2026-10-14', { dateStyle: 'long' })}</dd>
      </dl>
      <p>
        <Link.Root href="https://www.digg.se/" target="_blank">
          {texts.newTab} <Link.NewTabNotice />
        </Link.Root>
      </p>
    </div>
  )
}

export function LanguageAndDates() {
  return (
    <KvirnProvider timeZone="Europe/Stockholm">
      <Settings />
    </KvirnProvider>
  )
}
