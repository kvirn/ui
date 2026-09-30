import { describe, expect, expectTypeOf, it } from 'vite-plus/test'
import { defineMessages } from './define-messages.ts'
import { en } from './locales/en.ts'
import { sv } from './locales/sv.ts'
import type {
  KvirnMessages,
  MessageFormat,
  MessageFunction,
  PartialMessages,
  TextMessage,
} from './types.ts'

describe('defineMessages', () => {
  it('overrides only the given keys and keeps the rest of the base catalog', () => {
    const messages = defineMessages(sv, { link: { newTabNotice: '(öppnas i nytt fönster)' } })
    expect(messages.link.newTabNotice).toBe('(öppnas i nytt fönster)')
    expect(sv.link.newTabNotice).toBe('(öppnas i en ny flik)')
  })

  it('returns an equal copy for empty overrides', () => {
    expect(defineMessages(en, {})).toEqual(en)
    expect(defineMessages(en, {})).not.toBe(en)
  })

  it('accepts function values for external i18n systems (ADR-0007)', () => {
    const translate = (key: string) => `translated:${key}`
    const messages = defineMessages(sv, {
      link: { newTabNotice: () => translate('kvirn.link.newTabNotice') },
    })
    expect(messages.link.newTabNotice).toBeTypeOf('function')
  })

  it('is typed: full catalog in, full catalog out', () => {
    expectTypeOf(defineMessages).parameter(0).toEqualTypeOf<KvirnMessages>()
    expectTypeOf(defineMessages).parameter(1).toEqualTypeOf<PartialMessages>()
    expectTypeOf(defineMessages).returns.toEqualTypeOf<KvirnMessages>()
  })
})

describe('catalog types (ADR-0007)', () => {
  it('every shipped catalog is a complete KvirnMessages', () => {
    expectTypeOf(en).toExtend<KvirnMessages>()
    expectTypeOf(sv).toExtend<KvirnMessages>()
  })

  it('rejects a catalog with a missing key', () => {
    expectTypeOf<{ link: {} }>().not.toExtend<KvirnMessages>()
    expectTypeOf<{}>().not.toExtend<KvirnMessages>()
  })

  it('accepts partial overrides at namespace and key level', () => {
    expectTypeOf<{}>().toExtend<PartialMessages>()
    expectTypeOf<{ link: {} }>().toExtend<PartialMessages>()
    expectTypeOf<{ link: { newTabNotice: string } }>().toExtend<PartialMessages>()
  })

  it('rejects key typos in overrides', () => {
    expectTypeOf<{ lnik: { newTabNotice: string } }>().not.toExtend<PartialMessages>()
    expectTypeOf<{ link: { newTabNotise: string } }>().not.toExtend<PartialMessages>()
  })

  it('rejects the wrong value type', () => {
    expectTypeOf<{ link: { newTabNotice: number } }>().not.toExtend<PartialMessages>()
    expectTypeOf<{
      link: { newTabNotice: (count: number) => string }
    }>().not.toExtend<PartialMessages>()
  })

  it('text keys are strings or parameterless functions', () => {
    expectTypeOf<TextMessage>().toEqualTypeOf<string | (() => string)>()
  })

  it('function keys receive their values and the format helper', () => {
    type ResultCount = MessageFunction<{ count: number }>
    expectTypeOf<ResultCount>().parameter(0).toEqualTypeOf<{ count: number }>()
    expectTypeOf<ResultCount>().parameter(1).toEqualTypeOf<MessageFormat>()
    expectTypeOf<ResultCount>().returns.toEqualTypeOf<string>()
  })

  it('rejects a function override that expects a missing or renamed parameter', () => {
    type ResultCount = MessageFunction<{ count: number }>
    expectTypeOf<(values: { total: number }) => string>().not.toExtend<ResultCount>()
    expectTypeOf<(values: { count: number; query: string }) => string>().not.toExtend<ResultCount>()
    expectTypeOf<
      (values: { count: number }, format: MessageFormat) => string
    >().toExtend<ResultCount>()
    expectTypeOf<() => string>().toExtend<ResultCount>()
  })
})
