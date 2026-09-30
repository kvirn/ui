import { createMessageFormat } from '@kvirn-ui/core'
import type { MessageFormatter, ResolvedMessages } from '@kvirn-ui/core'
import type { KvirnMessages, MessageFormat, MessageFunction } from '@kvirn-ui/i18n'
import type { ComponentType } from 'react'
import { describe, expectTypeOf, it } from 'vite-plus/test'
import type {
  KvirnProviderProps,
  RegisteredLinkComponent,
  UseLocaleResult,
  UseThemeResult,
} from '../index.ts'
import type { LinkComponentOf } from './register.ts'
import type { useMessages } from './use-messages.ts'

// Type tests: they run in `vp check` (tsgolint). A wrong type is a type error, not a runtime failure.

describe('core ↔ i18n glue (Plan 0002)', () => {
  it("core's formatter satisfies i18n's MessageFormat, both ways", () => {
    expectTypeOf<MessageFormatter>().toExtend<MessageFormat>()
    expectTypeOf<MessageFormat>().toExtend<MessageFormatter>()
    expectTypeOf(createMessageFormat).returns.toExtend<MessageFormat>()
  })

  it('resolved text keys are strings', () => {
    expectTypeOf<ReturnType<typeof useMessages<'link'>>>().toEqualTypeOf<
      ResolvedMessages<KvirnMessages['link']>
    >()
    expectTypeOf<ResolvedMessages<KvirnMessages['link']>>().toEqualTypeOf<{
      readonly newTabNotice: string
    }>()
  })

  it('resolved function keys take exactly their values', () => {
    type Resolved = ResolvedMessages<{ resultCount: MessageFunction<{ count: number }> }>
    expectTypeOf<Resolved['resultCount']>().toEqualTypeOf<(values: { count: number }) => string>()
    expectTypeOf<{}>().not.toExtend<Parameters<Resolved['resultCount']>[0]>()
    expectTypeOf<{ total: number }>().not.toExtend<Parameters<Resolved['resultCount']>[0]>()
  })

  it('useMessages rejects unknown namespaces and keys', () => {
    expectTypeOf<'lnik'>().not.toExtend<Parameters<typeof useMessages>[0]>()
    expectTypeOf<{ newTabNotise: string }>().not.toExtend<
      Parameters<typeof useMessages<'link'>>[1]
    >()
  })
})

describe('Register (ADR-0005)', () => {
  it('falls back to a native <a> when the app registers nothing', () => {
    expectTypeOf<RegisteredLinkComponent>().toEqualTypeOf<'a'>()
    expectTypeOf<KvirnProviderProps['linkComponent']>().toEqualTypeOf<
      RegisteredLinkComponent | undefined
    >()
  })

  it('uses the registered component when the app augments Register', () => {
    type RouterLink = ComponentType<{ to: string }>
    expectTypeOf<LinkComponentOf<{ linkComponent: RouterLink }>>().toEqualTypeOf<RouterLink>()
    expectTypeOf<LinkComponentOf<{}>>().toEqualTypeOf<'a'>()
  })
})

describe('hook results', () => {
  it('useLocale exposes localeProps for lang and dir', () => {
    expectTypeOf<UseLocaleResult['localeProps']>().toEqualTypeOf<{
      lang: string
      dir: 'ltr' | 'rtl'
    }>()
  })

  it('useTheme exposes preferences, resolved values and verb actions', () => {
    expectTypeOf<UseThemeResult['colorScheme']>().toEqualTypeOf<'light' | 'dark' | 'system'>()
    expectTypeOf<UseThemeResult['contrast']>().toEqualTypeOf<'standard' | 'more' | 'system'>()
    expectTypeOf<UseThemeResult['resolvedColorScheme']>().toEqualTypeOf<'light' | 'dark'>()
    expectTypeOf<UseThemeResult['resolvedContrast']>().toEqualTypeOf<'standard' | 'more'>()
    expectTypeOf<UseThemeResult['selectColorScheme']>()
      .parameter(0)
      .toEqualTypeOf<'light' | 'dark' | 'system'>()
    expectTypeOf<UseThemeResult>().not.toHaveProperty('setColorScheme')
  })
})
