import { sv } from '@kvirn-ui/i18n/sv'
import { KvirnProvider } from './kvirn-provider.tsx'
import { ThemeSwitcherFixture } from './kvirn-provider.fixture.tsx'
import { KvirnThemeScript } from './kvirn-theme-script.tsx'

/** The tree the header-CSP test renders on the server and hydrates in the page. */
export function CspApp({ nonce }: { nonce: string }) {
  return (
    <KvirnProvider locale="sv-SE" messages={sv} timeZone="Europe/Stockholm">
      <KvirnThemeScript nonce={nonce} />
      <ThemeSwitcherFixture />
    </KvirnProvider>
  )
}
