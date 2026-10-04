import { describe, expect, test } from 'vite-plus/test'
import * as internal from './internal.ts'
import * as publicApi from './index.ts'

// Plan 0036: `@kvirn-ui/react/internal` is for Kvirn packages (`@kvirn-ui/rich-text`). Its pieces
// are unstable, so they never leak into the public entry, where adopters would start to rely on them.

describe('@kvirn-ui/react/internal', () => {
  test('exports the pieces a Kvirn package needs', () => {
    expect(internal.useMessages).toBeTypeOf('function')
    expect(internal.useFocusVisible).toBeTypeOf('function')
    expect(internal.isKeyboardFocus).toBeTypeOf('function')
    expect(internal.trackModality).toBeTypeOf('function')
    expect(internal.useQuietAnnouncer).toBeTypeOf('function')
    expect(internal.useDescriptionPart).toBeTypeOf('function')
    expect(internal.renderPart).toBeTypeOf('function')
    expect(internal.useMergedRef).toBeTypeOf('function')
    expect(internal.warnOnce).toBeTypeOf('function')
    expect(internal.joinIds).toBeTypeOf('function')
    expect(internal.FieldContext).toBeDefined()
  })

  test('the public entry does not export any of them', () => {
    const publicNames = new Set(Object.keys(publicApi))
    for (const name of Object.keys(internal)) {
      expect(publicNames.has(name), `${name} must stay out of the public entry`).toBe(false)
    }
  })
})
