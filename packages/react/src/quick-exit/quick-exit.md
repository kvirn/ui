# QuickExit

A link that takes a person off a sensitive page at once, to a neutral site you choose. It is one `<div>` (`Root`) with one `<a href>` (`Link`).

- Activating the link, or pressing Shift three times (each pressed alone and within five seconds of the last; `windowMs` changes it), hides the page, empties the title and replaces the page with `href`, so Back doesn't return to it.
- `href` must be an `http(s)` URL, absolute or relative to the page. Anything else renders no `href`, warns in development and navigates nowhere.
- `QuickExit.Hint` is the visible sentence "Or press Shift 3 times." (`quickExit.hint`). Put it inside Root after the Link: the link is described by it. It renders nothing when `shortcut={false}`, and a development warning says when it is missing while the shortcut is on. Keep an overridden sentence short: more than 3 lines below 40rem, or 2 lines at 40rem and wider, makes the row taller than its scroll padding.
- `shortcut={false}` removes the Shift shortcut. Shift presses 1 and 2 are announced politely. The shortcut works in text fields too: Shift with a letter, Tab or a click is not a press, and key repeat is ignored.
- `navigate(href)` replaces `window.location.replace`, for a test. It must replace the history entry with a full navigation: a router push keeps the entry and leaves a blank page.
- Mount one QuickExit per page. While a modal dialog is open the page is inert, so only the shortcut works.
- The link carries `rel="noreferrer"` and `referrerpolicy="no-referrer"`, which apply when the browser follows the link itself (JavaScript off). A click and Shift ×3 use `location.replace`, which uses the page's own policy: set a `Referrer-Policy: no-referrer` header if the destination must not learn where the visitor came from.
- It swaps this page for the site you choose, so the Back button doesn't lead straight back to it, but it doesn't clear the browser history, cache or other tabs: a web page cannot.
- `data-state` is `idle`, `armed` or `leaving`.

```tsx
import { QuickExit } from '@kvirn-ui/react'

;<QuickExit.Root>
  <QuickExit.Link href="https://www.smhi.se" />
  <QuickExit.Hint />
</QuickExit.Root>
```

## Clearing the session

To also end the visitor's session, point `href` at your own endpoint that clears the session and then redirects to the neutral site. Set a `Referrer-Policy: no-referrer` header on your pages, so the destination doesn't learn where the visitor came from.

## A slow destination

The page is hidden before the navigation starts, so a slow destination shows a blank tab, never the sensitive page. QuickExit does not preload or preconnect: that would contact another site from a sensitive page. To make the exit fast, in your own page head, safest first:

1. Choose a light destination on your own origin: one static, cached page, no redirect chain.
2. Warm a same-origin neutral page ahead of time with `<link rel="prefetch" href="/neutral">`, a `speculationrules` prefetch rule (browsers without it ignore it), or a service worker that precaches it (HTTPS). No other site is contacted.
3. For a cross-origin destination, `<link rel="preconnect" href="https://…">`, knowing it tells that site and the network that visitors of this page exist.

Test it with the network throttled: the tab must go blank at once and the destination follow.

## Known issues

- Without the script loaded, the link still works as a plain link, but the Shift shortcut doesn't.
- Ctrl/Cmd, Shift and middle click are handled: they leave in the same tab. "Open in new tab" from the context menu can't be prevented, so it opens the destination in a new tab and leaves this page open.
- Unsaved form data on the page is lost on exit.
- A router push (a custom `navigate`) keeps the history entry, so Back returns to the page.
- NVDA uses Shift to pause speech, so the shortcut can fire by accident. `shortcut={false}` opts out. In NVDA and JAWS browse mode, backwards quick navigation (Shift+H, Shift+K, Shift+1 to 6) may reach the page as a lone Shift and count: three backwards heading jumps could leave the page. Check it on your own assistive technology.

## Hook

```tsx
const hintId = useId()
const quickExit = useQuickExit({ href: 'https://www.smhi.se', shortcut: true })

<div {...quickExit.rootProps}>
  <a {...quickExit.linkProps} aria-describedby={hintId}>
    {quickExit.label}
  </a>
  <p {...quickExit.hintProps} id={hintId}>
    {quickExit.hint}
  </p>
</div>
```

Render the hint only while `shortcut` is on, and point the link's `aria-describedby` at it only then. The hook can't see your markup, so it gives no missing-hint warning: `QuickExit.Root` does.
