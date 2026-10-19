'use client'
import { sv } from '@kvirn-ui/i18n/sv'
import {
  DefinitionList,
  KvirnProvider,
  useDateSettings,
  useFormat,
  useLocale,
} from '@kvirn-ui/react'
import { useKvirnProviderTexts } from './texts.ts'

export function DefaultKvirnProvider() {
  return (
    <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm" weekStart={1}>
      <Settings />
    </KvirnProvider>
  )
}

// A Monday, so the weekday name below is the name of the first day of the week.
const aMonday = Date.UTC(2026, 9, 12)
const aDay = 24 * 60 * 60 * 1000

function Settings() {
  const { texts } = useKvirnProviderTexts()
  const { locale, dir, localeProps } = useLocale()
  const { timeZone, weekStart } = useDateSettings()
  const format = useFormat()
  // The values are written in Swedish, so each one carries the lang of the provider.
  return (
    <DefinitionList.Root>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.language}</DefinitionList.Term>
        <DefinitionList.Description>
          <code>{locale}</code>
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.direction}</DefinitionList.Term>
        <DefinitionList.Description>
          <code>{dir}</code>
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.timeZone}</DefinitionList.Term>
        <DefinitionList.Description>
          <code>{timeZone}</code>
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.firstWeekday}</DefinitionList.Term>
        <DefinitionList.Description>
          <span {...localeProps}>
            {format.date(aMonday + (weekStart - 1) * aDay, { weekday: 'long', timeZone: 'UTC' })}
          </span>
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.decisionDate}</DefinitionList.Term>
        <DefinitionList.Description>
          <span {...localeProps}>{format.date('2026-10-14', { dateStyle: 'long' })}</span>
        </DefinitionList.Description>
      </DefinitionList.Row>
      <DefinitionList.Row>
        <DefinitionList.Term>{texts.fee}</DefinitionList.Term>
        <DefinitionList.Description>
          <span {...localeProps}>
            {format.number(1250.5, { style: 'currency', currency: 'SEK' })}
          </span>
        </DefinitionList.Description>
      </DefinitionList.Row>
    </DefinitionList.Root>
  )
}
