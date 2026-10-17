# SkipPanel

> **Draft** (Plan 0132). The accessibility contract is [skip-panel.a11y.md](skip-panel.a11y.md). Visual details: `docs/design/skip-panel.md`.

A skip panel: on the first Tab, a card lists where to skip to and which keyboard shortcuts the site offers. Each shortcut runs from the card or by its chord. For a skip link that stays in the page flow, use [SkipLink](../skip-link/skip-link.md).

- Parts: `Root`, `Group`, `Label`, `List`, `Item`, `Link`, `Shortcut`, `Hint`. Hooks: `useSkipPanel(options)` for the Root, and `useSkipPanelGroup`, `useSkipPanelLink`, `useSkipPanelShortcut`, `useSkipPanelHint` for the parts that need more than a class.
- Options on Root: `reopenShortcut` (a chord that opens the list again, no default), `shortcutsEnabled` (default `true`; `false` adds no listener and drops the key caps and `aria-keyshortcuts`).
- A chord is `{ key: 's', alt: true, shift: true }`. The library ships none. Use Alt or Option with Shift and a letter; never a bare letter (2.1.4 Character Key Shortcuts covers printable-character shortcuts, so a bare letter is in scope and Alt or Ctrl chords are not) and never Ctrl+Alt (AltGr). A dev warning flags both. Offer `shortcutsEnabled` as a setting anyway: chords clash with the browser and screen reader.
- A chord is ignored in an editable target, with AltGr, and with an extra Ctrl or Meta. A handled chord calls `preventDefault` and `click()`s its row, so the chord, the button and the link do the same thing.
- `Link` focuses its target, as `SkipLink` does. Its default text is the message `skipPanel.mainContent`.
- `Label`: default text is `skipPanel.skipToLabel`; `kind="shortcuts"` gives `skipPanel.shortcutsLabel`, or `skipPanel.actionsLabel` ("Quick links") while `shortcutsEnabled` is `false`. Children replace it.
- `Shortcut`: a `<button type="button">`, or `as` a link or router link. It renders its children, then the key caps as nested `Kbd`. The key names come from the `keys.*` messages: Option and Command on Apple platforms.
- `Hint`: always the arrow-key sentence (`skipPanel.arrowHint`), which describes the first Link; then "Press {keys} to open this list again." (`skipPanel.reopenHint`) with a `reopenShortcut` and `shortcutsEnabled`. Without a Hint a development warning (`skip-panel-hint-missing`) says the first Link has no description.
- One Tab stop: ArrowDown and ArrowUp move between the items across all groups (no wrap), Home and End go to the first and last. Only one item has `tabindex="0"`, and it resets to the first Link when focus leaves. Add an item linking to your accessibility statement's keyboard section ("Keyboard help").
- Classes: `kv-skip-panel` and `kv-skip-panel__group|label|list|item|link|shortcut|hint`. State: `data-collapsed` (Escape on the floating list) and `data-reopened`.
- Headless: no CSS. Messages: `skipPanel.*` and `keys.*`, in all five locales.

## Component

```tsx
import { SkipPanel } from '@kvirn-ui/react'

;<SkipPanel.Root reopenShortcut={{ key: 'k', alt: true, shift: true }}>
  <SkipPanel.Group>
    <SkipPanel.Label />
    <SkipPanel.List>
      <SkipPanel.Item>
        <SkipPanel.Link href="#main" />
      </SkipPanel.Item>
    </SkipPanel.List>
  </SkipPanel.Group>
  <SkipPanel.Group>
    <SkipPanel.Label kind="shortcuts" />
    <SkipPanel.List>
      <SkipPanel.Item>
        <SkipPanel.Shortcut shortcut={{ key: 's', alt: true, shift: true }} onClick={focusSearch}>
          Search
        </SkipPanel.Shortcut>
      </SkipPanel.Item>
    </SkipPanel.List>
  </SkipPanel.Group>
  <SkipPanel.Hint />
</SkipPanel.Root>
```

## Accessibility

See the contract: [skip-panel.a11y.md](skip-panel.a11y.md).
