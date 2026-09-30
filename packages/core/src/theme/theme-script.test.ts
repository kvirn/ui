import { describe, expect, it } from 'vite-plus/test'
import { createThemeScriptSource } from './theme-script.ts'
import type { ThemeScriptOptions } from './theme-script.ts'
import { colorSchemeAttribute, contrastAttribute, themeStorageKey } from './theme-constants.ts'

// The script is executed against the store for every combination in the browser test
// (packages/react/src/provider/kvirn-theme-script.test.tsx). This file covers its text.
describe('createThemeScriptSource', () => {
  it('is a self-contained expression using the shared key and attribute names', () => {
    const source = createThemeScriptSource()
    expect(source).toContain(JSON.stringify(themeStorageKey))
    expect(source).toContain(JSON.stringify(colorSchemeAttribute))
    expect(source).toContain(JSON.stringify(contrastAttribute))
    expect(source.trim().startsWith('(function')).toBe(true)
  })

  it('embeds the configured defaults', () => {
    expect(
      createThemeScriptSource({ defaultColorScheme: 'dark', defaultContrast: 'more' }),
    ).toContain(JSON.stringify({ colorScheme: 'dark', contrast: 'more' }))
    expect(createThemeScriptSource()).toContain(
      JSON.stringify({ colorScheme: 'system', contrast: 'system' }),
    )
  })

  it('cannot close its own <script> element', () => {
    expect(createThemeScriptSource()).not.toMatch(/<\/?script/i)
  })

  it('ignores hostile defaults: falls back to `system` and embeds no `<`', () => {
    // Untyped input, as from plain JavaScript: the type system can't be relied on.
    const hostileOptions = JSON.parse(
      JSON.stringify({
        defaultColorScheme: '</script><script>alert(1)</script>',
        defaultContrast: '<!--',
      }),
    ) as ThemeScriptOptions
    const source = createThemeScriptSource(hostileOptions)
    expect(source).not.toContain('<')
    expect(source).not.toContain('alert')
    expect(source).toContain(JSON.stringify({ colorScheme: 'system', contrast: 'system' }))
  })
})
