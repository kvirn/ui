import { defineMessages } from '@kvirn-ui/i18n'
import { sv } from '@kvirn-ui/i18n/sv'
import {
  Button,
  ButtonGroup,
  CharacterCount,
  KvirnProvider,
  KvirnThemeScript,
  useTheme,
} from '@kvirn-ui/react'
import type { StoredThemePreference, ThemeStorageAdapter } from '@kvirn-ui/react'
import { useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Fixtures for Foundation/KvirnProvider. The texts are Swedish and carry `lang="sv"`, so they
// match the story's default language (3.1.2). Each story's "Show code" prints these functions
// (`showSource`), so they read the way an adopter writes the provider.

/**
 * Picks the colour scheme and shows what the store did. A theme change moves no focus and
 * announces nothing, so the result is plain text and not a live region.
 */
export function ThemeChoice({ stored }: { stored: StoredThemePreference | undefined }) {
  const theme = useTheme()
  const schemes = [
    ['light', 'Ljust'],
    ['dark', 'Mörkt'],
  ] as const
  return (
    <section lang="sv" aria-labelledby="theme-choice">
      <h2 id="theme-choice">Tema</h2>
      <ButtonGroup aria-label="Färgschema">
        {schemes.map(([value, label]) => (
          <Button
            key={value}
            aria-pressed={theme.colorScheme === value}
            onClick={() => theme.selectColorScheme(value)}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>
      <p>
        Används nu: {theme.resolvedColorScheme}, {theme.resolvedContrast}
      </p>
      <p>Sparat val: {stored === undefined ? 'inget' : JSON.stringify(stored)}</p>
    </section>
  )
}

/**
 * The provider's `theme` options: the defaults used until the user chooses, and where a choice is
 * kept. A `storage` adapter takes `read` and `write`, such as a cookie, and `write` gets only the
 * axes that differ from your defaults (`undefined` when none). `'local'` is the default and
 * `'none'` keeps the choice in memory. The theme is read once for a whole document, so this example
 * gives the provider an `env` of its own (a document of its own) and the page you're reading keeps
 * its theme; an app leaves `env` out.
 */
export function ThemedApp() {
  const [stored, setStored] = useState<StoredThemePreference | undefined>()
  const storage = useMemo<ThemeStorageAdapter>(
    () => ({ read: () => undefined, write: setStored }),
    [],
  )
  const [env] = useState(() => ({
    window,
    document: document.implementation.createHTMLDocument(''),
  }))
  return (
    <KvirnProvider
      locale="sv-SE"
      messages={sv}
      theme={{ defaultColorScheme: 'dark', defaultContrast: 'more', storage }}
      env={env}
    >
      <ThemeChoice stored={stored} />
    </KvirnProvider>
  )
}

/**
 * Your own strings, three ways. `defineMessages` builds an adjusted catalog once, with typed keys.
 * A key may be a function: parameterised keys get their values and a `format` built on `Intl` for
 * the locale (`plural`, `number`). A nested provider with a partial object changes only its own
 * section, and the rest comes from its parent.
 */
export function TranslatedApp() {
  const messages = defineMessages(sv, {
    characterCount: {
      remaining: ({ count }, format) =>
        format.plural(count, {
          one: 'Ett tecken kvar av ditt utrymme.',
          other: `${format.number(count)} tecken kvar av ditt utrymme.`,
        }),
    },
  })
  return (
    <KvirnProvider locale="sv-SE" messages={messages}>
      <div lang="sv">
        <CharacterCount value="Hej" limit={1500} />
        <KvirnProvider messages={{ characterCount: { remaining: () => 'Skriv gärna lite till.' } }}>
          <CharacterCount value="Hej" limit={20} />
        </KvirnProvider>
      </div>
    </KvirnProvider>
  )
}

/**
 * What `KvirnThemeScript` puts in a server-rendered `<head>`: a blocking inline script with your
 * CSP `nonce`, and the same defaults as the provider's `theme`. React never runs it in the
 * browser, so this shows the markup a server would send, rendered to a string. An app renders
 * `<KvirnThemeScript nonce={nonce} />` in its document and puts `suppressHydrationWarning` on
 * `<html>`.
 */
export function ServerHead() {
  const markup = renderToStaticMarkup(
    <KvirnThemeScript nonce="abc123" defaultColorScheme="dark" defaultContrast="more" />,
  )
  const openingTag = markup.slice(0, markup.indexOf('>') + 1)
  const defaultsLine = markup.split('\n').find((line) => line.includes('var defaults')) ?? ''
  return (
    <pre>
      {openingTag}
      {'\n'}
      {defaultsLine.trim()}
    </pre>
  )
}
