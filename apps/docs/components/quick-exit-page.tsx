import { CardBody, CardHeader, CardRoot, Heading, Link } from '@kvirn-ui/react'
import { AnchoredHeading } from './anchored-heading.tsx'
import type { ApiPart } from './api-block.tsx'
import { ApiBlock } from './api-block.tsx'
import { apiHookPart, apiRowId } from './api-ids.ts'
import { CodeBlock } from './code-block.tsx'
import { ComponentPage } from './component-page.tsx'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'
import { ExampleFrame } from './example-frame.tsx'
import { Note } from './note.tsx'
import { StringsBlock } from './strings-block.tsx'
import { UseCase } from './use-case.tsx'
import {
  quickExitLinkAttributes,
  quickExitHintAttributes,
  quickExitHintRows,
  quickExitLinkRows,
  quickExitRootAttributes,
  quickExitRootRows,
  useQuickExitHook,
} from '../content/quick-exit.api.ts'
import { DefaultQuickExit } from '../examples/quick-exit/default.tsx'
import { EndSession } from '../examples/quick-exit/end-session.tsx'
import { NoShortcut } from '../examples/quick-exit/no-shortcut.tsx'
import { OwnMarkup } from '../examples/quick-exit/own-markup.tsx'
import { SupportPage } from '../examples/quick-exit/support-page.tsx'
import type { Contract } from '../lib/contract-parser.ts'

export type QuickExitExampleSources = Record<
  'default' | 'support-page' | 'end-session' | 'no-shortcut' | 'own-markup',
  string
>

// The server side of the "end the session" case: the endpoint is the adopter's code, so it is
// shown as text and never runs on this site.
const endSessionCode = `// GET /api/quick-exit, on your own site
export function GET() {
  // Also end the session on your side here, for example in your session store.
  const headers = new Headers({ Location: 'https://www.smhi.se' })
  headers.append('Set-Cookie', 'session=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax')
  return new Response(null, { status: 303, headers })
}`

// The code of the "make the exit fast" block goes in the adopter's own page head or server, so it
// is shown as text and never runs on this site.
const prefetchLinkCode = `<link rel="prefetch" href="/neutral" />`

const speculationRulesCode = `<script type="speculationrules">
  { "prefetch": [{ "urls": ["/neutral"] }] }
</script>`

const serviceWorkerCode = `// sw.js, served from your own origin over HTTPS
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('neutral-v1').then((cache) => cache.add('/neutral')))
})

self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).pathname === '/neutral') {
    event.respondWith(caches.match('/neutral').then((hit) => hit ?? fetch(event.request)))
  }
})`

const serviceWorkerRegisterCode = `navigator.serviceWorker.register('/sw.js')`

const preconnectCode = `<link rel="preconnect" href="https://www.smhi.se" />
<link rel="dns-prefetch" href="https://www.smhi.se" />`

const parts: ApiPart[] = [
  {
    name: 'QuickExit.Root',
    renders: (
      <>
        <code>&lt;div&gt;</code>, the row that holds the link. It takes every attribute of a{' '}
        <code>&lt;div&gt;</code> and passes <code>ref</code> to it. It owns the key listener and the
        announcement, and sets <code>data-state</code>. Put it as a direct child of{' '}
        <code>&lt;body&gt;</code>, and mount one with the shortcut on per page. The default theme is
        described on <Link href="/foundation/theming">Theming</Link>.
      </>
    ),
    props: quickExitRootRows,
    attributes: quickExitRootAttributes,
  },
  {
    name: 'QuickExit.Link',
    renders: (
      <>
        <code>&lt;a href&gt;</code> with the role <code>link</code>. It takes every attribute of an{' '}
        <code>&lt;a&gt;</code> and passes <code>ref</code> to it. It must be inside{' '}
        <code>QuickExit.Root</code>: outside it, it throws an error. While a modal dialog is open
        the page is inert, so the link can’t be reached and only the shortcut works. In a signed-in
        service, point <code>href</code> at an endpoint that ends the session:{' '}
        <Link href="#end-the-session">End the session too</Link>.
      </>
    ),
    props: quickExitLinkRows,
    attributes: quickExitLinkAttributes,
  },
  {
    name: 'QuickExit.Hint',
    renders: (
      <>
        <code>&lt;p&gt;</code> with the sentence “Or press Shift 3 times.” Put it inside{' '}
        <code>QuickExit.Root</code> after the link, so sighted keyboard users learn about the
        shortcut and the link is described by it. It renders nothing when the Root has{' '}
        <code>shortcut={'{false}'}</code>. With the shortcut on and no Hint, a warning appears once
        in development. It must be inside <code>QuickExit.Root</code>: outside it, it throws an
        error.
      </>
    ),
    props: quickExitHintRows,
    attributes: quickExitHintAttributes,
  },
]

export function QuickExitPage({
  contract,
  sources,
}: {
  contract: Contract
  sources: QuickExitExampleSources
}) {
  return (
    <ComponentPage
      title="QuickExit"
      lead="It swaps this page for a site you choose, so the Back button doesn’t lead straight back to it. It doesn’t clear the browser history."
      status="alpha-candidate"
      whenToUse={
        <ul>
          <li>
            Use it on pages where reading could put someone at risk if another person saw the
            screen: how to get help after domestic violence, how to report abuse, some health pages.
            Put it on every page of that service, near the top.
          </li>
          <li>
            What it does not do: it doesn’t clear the browser history, the browser’s saved copies of
            pages or other open tabs. The visit can still be found in the history, and pages the
            person opened earlier in the same tab are still behind the Back button. Say so in your
            own text, and never promise that a visit leaves no trace.
          </li>
          <li>
            Choose a neutral site that says nothing about what the person was reading, such as a
            weather service. The address must be an <code>https://</code> or <code>http://</code>{' '}
            address. A path on your own site works too. If people sign in, point the link at an
            endpoint of your own that ends the session:{' '}
            <Link href="#end-the-session">see End the session too</Link>.
          </li>
          <li>
            If the script hasn’t loaded, the link works as an ordinary link and Back returns to the
            page. If someone opens it in a new tab from the context menu (the menu on a
            right-click), the first tab keeps the page open. A web page can’t prevent that.
          </li>
          <li>
            Not for ordinary links to other sites: use a <Link href="/components/link">Link</Link>.
          </li>
        </ul>
      }
      example={
        <>
          <p>
            Press the link, or press Tab and then Enter. In the examples on this page,{' '}
            <code>navigate</code> only shows where the visitor would go, so nothing leaves this
            site. <code>useDemoLeave</code> is a helper for this page: on your site, leave{' '}
            <code>navigate</code> out and the page is replaced. The Shift shortcut starts off here,
            so this page stays quiet for people who use a screen reader. Tick the box to turn it on.
            The sentence from <code>QuickExit.Hint</code> then appears next to the link, so people
            who see the page learn about the shortcut.
          </p>
          <ExampleFrame headingId="example" code={sources['default']}>
            <DefaultQuickExit />
          </ExampleFrame>
        </>
      }
      useCases={
        <>
          <p>
            The cases below turn the Shift shortcut off with <code>shortcut={'{false}'}</code>, so
            that only the first example on this page listens for Shift. On your site, leave it on
            unless you have a reason, such as the case for screen reader users, and keep{' '}
            <code>QuickExit.Hint</code> after the link. It renders nothing while the shortcut is
            off.
          </p>
          <UseCase
            id="support-page"
            title="A page that explains how to get help after domestic violence"
            why={
              <>
                Someone reads about support while another person may be nearby. Put the row first in
                the page, after the skip link and before the header, so the link is the second stop
                when you press Tab. Make the row a direct child of <code>&lt;body&gt;</code>, and
                don’t hide the link in a menu or only in the footer: it must be one press away from
                anywhere.
              </>
            }
            code={sources['support-page']}
            propsUsed={[
              { part: 'QuickExit.Link', prop: 'href' },
              { part: 'QuickExit.Root', prop: 'shortcut' },
            ]}
            note={
              <Note kind="tip">
                Set a <code>Referrer-Policy: no-referrer</code> header on these pages. The link asks
                for no referrer (the address of the page the person came from), but the browser
                follows that only when it follows the link itself, not when the component takes over
                for a click or three presses of Shift.
              </Note>
            }
          >
            <SupportPage />
          </UseCase>
          <CardRoot className="kv-card--dividers">
            <CardHeader>
              <AnchoredHeading as="h3" id="end-the-session" label="End the session too">
                <span id="end-the-session-title">End the session too</span>
              </AnchoredHeading>
            </CardHeader>
            <CardBody>
              <p>
                In a service where people sign in, leaving the page is not enough: the session would
                stay open in this browser. Point <code>href</code> at an endpoint on your own site
                that ends the session and then redirects to the neutral site.
              </p>
              <p>Your endpoint must do four things:</p>
              <ul>
                <li>
                  End the session on your server, and clear the session cookie by setting it with{' '}
                  <code>Max-Age=0</code>. The cookie’s name, <code>Path</code> and{' '}
                  <code>Domain</code> must match the ones you set it with.
                </li>
                <li>
                  Redirect to the neutral page, for example with the status <code>303</code>.
                </li>
                <li>
                  Answer a plain <code>GET</code> request, so the link works without JavaScript.
                </li>
                <li>
                  Keep personal data out of the address you redirect to. The browser saves that
                  address in its history.
                </li>
              </ul>
              <p>
                The endpoint is your code, not the library’s. This is a sketch in the form of a web
                standard request handler:
              </p>
              <CodeBlock code={endSessionCode} language="ts" />
              <p>
                The link leaves in the same tab: a click, a Ctrl or Cmd click and a middle click all
                replace this page, and so does Shift three times when the shortcut is on. The
                example below has the shortcut off and uses{' '}
                <Link href={`#${apiRowId('QuickExit.Link', 'href')}`}>
                  <code>href</code>
                </Link>{' '}
                with a path on this site. As in every example on this page, <code>navigate</code>{' '}
                only reports where the visitor would go.
              </p>
            </CardBody>
          </CardRoot>
          <ExampleFrame headingId="end-the-session-title" code={sources['end-session']}>
            <EndSession />
          </ExampleFrame>
          <CardRoot className="kv-card--dividers">
            <CardHeader>
              <AnchoredHeading as="h3" id="make-the-exit-fast" label="Make the exit fast">
                <span id="make-the-exit-fast-title">Make the exit fast</span>
              </AnchoredHeading>
            </CardHeader>
            <CardBody>
              <p>
                QuickExit hides the page at once. Then the browser has to load the destination. The
                steps below make that load quick, safest first. Put the tags in the{' '}
                <code>&lt;head&gt;</code> of your page template (your layout) on every page that has
                the link, and set headers on your server. QuickExit itself adds nothing and sends
                nothing: it never contacts another site before someone leaves.
              </p>
              <Heading as="h4">1. Choose a light destination</Heading>
              <p>This costs nothing and tells nobody anything. Pick a destination that is:</p>
              <ul>
                <li>on your own origin (the same site address as the page), as one static page;</li>
                <li>
                  reached with no redirect chain. If the exit goes through your session-ending
                  endpoint, keep it to one redirect;
                </li>
                <li>free of heavy scripts, images and fonts;</li>
                <li>
                  cached: for example <code>Cache-Control: public, max-age=86400</code> on the
                  neutral page;
                </li>
                <li>
                  served over HTTP/2 or newer, which sends several requests over one connection.
                </li>
              </ul>
              <Heading as="h4">2. A neutral page on your own origin, loaded ahead of time</Heading>
              <p>
                You ask the browser to fetch the neutral page while the person reads. No other site
                is contacted, and the request shows only in your own logs. Two hints do this. Both
                are hints: a browser may ignore them.
              </p>
              <CodeBlock code={prefetchLinkCode} language="html" />
              <CodeBlock code={speculationRulesCode} language="html" />
              <p>
                Browsers differ in what they support: Chromium-based browsers such as Chrome and
                Edge support speculation rules. A browser that doesn’t know them ignores the script,
                and the exit still works, only without the head start. A{' '}
                <code>&quot;prerender&quot;</code> rule has the same shape, but it also runs the
                page’s JavaScript in the background, so use it only for a plain static page.
              </p>
              <p>
                The most dependable choice is a service worker that stores the neutral page itself,
                because the two hints above may be ignored. It also works offline. It needs HTTPS (
                <code>localhost</code> counts while you build).
              </p>
              <CodeBlock code={serviceWorkerCode} language="ts" />
              <CodeBlock code={serviceWorkerRegisterCode} language="ts" />
              <Heading as="h4">3. A destination on another site: connect ahead</Heading>
              <p>
                <code>preconnect</code> asks the browser to open the connection to that site early,
                and <code>dns-prefetch</code> does only the first step, finding the site’s address.
                Put them in your page head, so they run when the page loads.
              </p>
              <CodeBlock code={preconnectCode} language="html" />
              <p>
                <strong>This contacts that site.</strong> It happens from the moment someone opens
                the page, shows in network logs, and tells that site and the network that visitors
                of this page exist. The library never does it for you. If that is not acceptable,
                choose one of the two steps above.
              </p>
              <Heading as="h4">4. Test it</Heading>
              <p>
                Slow the network down in your browser’s developer tools, press the link and check
                two things: the tab goes blank at once, and the destination follows. Test in a
                browser without speculation rules too, such as Firefox: the exit must still work.
              </p>
            </CardBody>
          </CardRoot>
          <UseCase
            id="no-shortcut"
            title="A health page for people who use a screen reader"
            why={
              <>
                NVDA, a screen reader for Windows, uses the Shift key to pause speech. Three presses
                of Shift, each less than five seconds after the last, would then leave the page. In
                browse mode, the screen reader may also pass on a lone Shift when someone jumps back
                through headings. This has not been checked on real screen readers yet. If many of
                your readers use a screen reader, turn the shortcut off. The link stays, and
                keyboard and pointer users still reach it.
              </>
            }
            code={sources['no-shortcut']}
            propsUsed={[{ part: 'QuickExit.Root', prop: 'shortcut' }]}
          >
            <NoShortcut />
          </UseCase>
          <UseCase
            id="own-markup"
            title="Your own row and link"
            why={
              <>
                Your site already has its own markup for the row and the link. Spread the props from
                the hook on them and use the label and the hint from the hook. Give the link{' '}
                <code>aria-describedby</code> with the id of the hint, and show the hint only while
                the shortcut is on. The hook gives the same key listener, announcement and exit as
                the parts.
              </>
            }
            code={sources['own-markup']}
            propsUsed={[
              {
                part: apiHookPart('useQuickExit', 'options'),
                label: 'useQuickExit (options)',
                prop: 'href',
              },
            ]}
            note={
              <Note kind="tip">
                Spread <code>linkProps</code> on a real <code>&lt;a&gt;</code>. It keeps its
                address, so it still works as an ordinary link until the script has loaded.
              </Note>
            }
          >
            <OwnMarkup />
          </UseCase>
        </>
      }
      contract={
        <ContractSectionsView
          contract={contract}
          notes={{
            'what-you-need-to-do': (
              <Note kind="reminder">
                Wrap your app in a <code>KvirnProvider</code>. Without it the count of Shift presses
                is not announced, so a screen reader user gets no feedback while pressing Shift
                (4.1.3 Status Messages, level AA). The exit itself still works.
              </Note>
            ),
            keyboard: (
              <Note kind="tip">
                Three presses of Shift leave the page, as long as no more than five seconds pass
                between two presses. Any other key in between starts the count again. A Shift counts
                when it is released, and only if nothing else was pressed while it was down, so
                Shift+Tab or a capital letter in a form is not a press.
              </Note>
            ),
            'known-issues': (
              <Note kind="tip">
                <strong>What if the destination is slow?</strong> The page is hidden before the
                navigation starts, so a slow destination shows a blank tab, never the sensitive
                page. The fastest and most private choices are a destination on your own origin, or
                your own endpoint that ends the session and redirects. QuickExit does not preload or
                preconnect, because that would contact another site from a sensitive page: see{' '}
                <Link href="#make-the-exit-fast">Make the exit fast</Link> for what you can add
                yourself, and what each choice tells others.
              </Note>
            ),
            testing: (
              <Note kind="reminder">
                No person using assistive technology has checked this component yet, and the label
                “Leave this page” has not been tested with residents. Test both with your own users
                before you rely on it in a service that protects people.
              </Note>
            ),
          }}
        />
      }
      contractSections={contractSectionList(contract)}
      api={
        <ApiBlock
          importLine="import { QuickExit, useQuickExit } from '@kvirn-ui/react'"
          parts={parts}
          hook={useQuickExitHook}
          strings={
            <StringsBlock
              namespace="quickExit"
              component="QuickExit"
              keys={[
                {
                  key: 'label',
                  meaning:
                    'The link’s visible text and its name, when you give no children. It says what the link does.',
                },
                {
                  key: 'hint',
                  meaning:
                    'The sentence QuickExit.Hint shows next to the link while the shortcut is on. It names the shortcut.',
                },
                {
                  key: 'shortcutRemaining',
                  meaning:
                    'Announced politely after the first and the second Shift press: how many more presses leave the page.',
                  values: { remaining: 2 },
                },
              ]}
            >
              <p>
                The Finnish texts and both sets of Norwegian texts are drafts. They wait for a
                native speaker to review them.
              </p>
            </StringsBlock>
          }
        />
      }
    />
  )
}
