import { Heading, Link, SkipPanel } from '@kvirn-ui/react'

// Fixtures for Components/SkipPanel. Each exported function is one example, written to be read: the
// stories show its source as "Show code" (`showSource`). The ids start with the story's name, since
// a Docs page shows every story in one document.

export function SkipPanelDefault() {
  return (
    <>
      <SkipPanel.Root>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#default-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#default-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="default-navigation" aria-label="Site">
        <Link.Root id="default-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="default-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="default-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelWithShortcuts() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#with-shortcuts-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#with-shortcuts-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('with-shortcuts-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('with-shortcuts-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="with-shortcuts-navigation" aria-label="Site">
        <Link.Root id="with-shortcuts-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="with-shortcuts-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="with-shortcuts-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelWithHelpLink() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#with-help-link-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#with-help-link-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'k', mod: true }}
                onClick={() => document.getElementById('with-help-link-search')?.focus()}
              >
                Search
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.HelpLink href="/keyboard-help" />
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="with-help-link-navigation" aria-label="Site">
        <Link.Root id="with-help-link-home" href="/">
          Home
        </Link.Root>{' '}
        <input id="with-help-link-search" type="search" aria-label="Search the site" />
      </nav>
      <main id="with-help-link-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelReopened() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#reopened-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#reopened-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('reopened-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('reopened-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="reopened-navigation" aria-label="Site">
        <Link.Root id="reopened-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="reopened-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="reopened-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelCollapsed() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#collapsed-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#collapsed-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('collapsed-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('collapsed-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="collapsed-navigation" aria-label="Site">
        <Link.Root id="collapsed-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="collapsed-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="collapsed-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelShortcutsDisabled() {
  return (
    <>
      <SkipPanel.Root
        shortcutsEnabled={false}
        reopenShortcut={{ key: 'k', alt: true, shift: true }}
      >
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#shortcuts-disabled-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#shortcuts-disabled-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('shortcuts-disabled-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('shortcuts-disabled-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="shortcuts-disabled-navigation" aria-label="Site">
        <Link.Root id="shortcuts-disabled-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="shortcuts-disabled-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="shortcuts-disabled-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelKeyboard() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#keyboard-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#keyboard-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('keyboard-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('keyboard-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="keyboard-navigation" aria-label="Site">
        <Link.Root id="keyboard-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="keyboard-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="keyboard-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelNarrow() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#narrow-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#narrow-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('narrow-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('narrow-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="narrow-navigation" aria-label="Site">
        <Link.Root id="narrow-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="narrow-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="narrow-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelRtl() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#rtl-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#rtl-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('rtl-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('rtl-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="rtl-navigation" aria-label="Site">
        <Link.Root id="rtl-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="rtl-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="rtl-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}

export function SkipPanelForcedColors() {
  return (
    <>
      <SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
        <SkipPanel.Group>
          <SkipPanel.Label />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Link href="#forced-colors-main">Main content</SkipPanel.Link>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Link href="#forced-colors-navigation">Site navigation</SkipPanel.Link>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Group>
          <SkipPanel.Label kind="shortcuts" />
          <SkipPanel.List>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'c', alt: true, shift: true }}
                onClick={() => document.getElementById('forced-colors-contact')?.focus()}
              >
                Contact us
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
            <SkipPanel.Item>
              <SkipPanel.Shortcut
                shortcut={{ key: 'h', alt: true, shift: true }}
                onClick={() => document.getElementById('forced-colors-home')?.focus()}
              >
                Home
              </SkipPanel.Shortcut>
            </SkipPanel.Item>
          </SkipPanel.List>
        </SkipPanel.Group>
        <SkipPanel.Hint />
      </SkipPanel.Root>
      <nav id="forced-colors-navigation" aria-label="Site">
        <Link.Root id="forced-colors-home" href="/">
          Home
        </Link.Root>{' '}
        <Link.Root id="forced-colors-contact" href="/contact">
          Contact us
        </Link.Root>
      </nav>
      <main id="forced-colors-main" tabIndex={-1}>
        <Heading as="h1">Building permits</Heading>
        <p>Press Tab to show the panel.</p>
      </main>
    </>
  )
}
