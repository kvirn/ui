import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { CodeBlock } from '../../../components/code-block.tsx'
import { PageWithContents } from '../../../components/page-contents.tsx'
import { messages } from '../../../messages/en.ts'

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Theming' }) }

export default function ThemingPage() {
  return (
    <PageWithContents
      title="Theming"
      lead="Every component renders a stable class and its state as data attributes. The default theme styles them, and you choose how much of it you keep."
      sections={[
        {
          id: 'default-theme',
          label: 'Use the default theme',
          content: (
            <>
              <p>
                Import <code>@kvirn-ui/theme/theme.css</code> once. Every component is then styled.
                A Button is secondary by default. Add{' '}
                <code>className=&quot;kv-button--primary&quot;</code> for the one main action on the
                page, or <code>className=&quot;kv-button--danger&quot;</code> for an action that
                deletes something. Put <code>class=&quot;kv-compact&quot;</code> on a container for
                smaller controls in staff tools.
              </p>
              <CodeBlock
                code={'<Button className="kv-button--primary">Send application</Button>'}
              />
              <p>
                The colour scheme, contrast and motion follow the device until the user chooses. To
                avoid a flash of the wrong theme on a server-rendered page, see{' '}
                <Link href="/foundation/rendering#first-paint">Rendering: server and client</Link>.
              </p>
            </>
          ),
        },
        {
          id: 'override-variables',
          label: 'Override variables',
          content: (
            <>
              <p>
                The theme is role scales (<code>--kv-primary-500</code>,{' '}
                <code>--kv-neutral-50</code>), named for what they do and not for their hue, and
                semantic tokens that point at them (<code>--kv-color-primary</code>). Set either in
                your own CSS. Everything in <code>theme.css</code> is in <code>@layer kv</code>, so
                your CSS always wins.
              </p>
              <CodeBlock
                code={`/* Rebrand: give the primary scale your brand's colours. All four themes follow. */
:root {
  --kv-primary-50: #edfafa;
  --kv-primary-100: #cdf0f0;
  --kv-primary-200: #9be0e2;
  --kv-primary-300: #5fc6cb;
  --kv-primary-400: #1e9ca4;
  --kv-primary-500: #007d86;
  --kv-primary-600: #00707a;
  --kv-primary-700: #005a62;
  --kv-primary-800: #00474e;
  --kv-primary-900: #003a40;
  --kv-primary-950: #00262a;
}`}
              />
              <p>
                A secondary Button&apos;s edge uses the secondary scale, which is the neutral steps
                by default. Give <code>--kv-secondary-*</code> your own 11 steps to colour it.
              </p>
              <p>
                Each theme uses different steps, so a swapped scale can break contrast. Check your
                colours with <code>checkThemeCss()</code> from <code>@kvirn-ui/theme</code> on your
                customised copy. It measures every text, control and focus pair in all four themes.
              </p>
            </>
          ),
        },
        {
          id: 'replace-or-skip',
          label: 'Replace it or skip it',
          content: (
            <>
              <p>
                <code>theme.css</code> is one readable file. Copy it from{' '}
                <code>node_modules/@kvirn-ui/theme/theme.css</code> into your project, edit it, and
                import your copy instead. Or skip it, and style the part classes (such as{' '}
                <code>kv-button</code>) and the state attributes with Tailwind or your own CSS.
                Remove the import and every component is unstyled again: KvirnUI never loads CSS for
                you.
              </p>
              <CodeBlock
                code={`<Button className="rounded-md border px-4 py-2 data-disabled:border-dashed data-focus-visible:outline-2">
  Save draft
</Button>`}
              />
            </>
          ),
        },
        {
          id: 'moving-indicators',
          label: 'Moving indicators and WCAG 2.2.2',
          content: (
            <>
              <p>
                These move for as long as a wait lasts: the spinner and the bar sheen in Progress,
                the busy Button, the job Toast, the FileUpload track for an unknown size and the
                busy Table. The library honours <code>prefers-reduced-motion: reduce</code> and
                shows a still rest shape instead. The text, the percent and the slow sentence at 10
                seconds carry the wait.
              </p>
              <p>
                WCAG 2.2.2 (Pause, Stop, Hide) asks for a way on the page to stop content that moves
                for more than 5 seconds. The library ships no such control. To meet it, your app
                must offer a visible &quot;Reduce motion&quot; control before the content, keep the
                choice itself (a cookie or your user settings) and apply the stop CSS below.
              </p>
              <CodeBlock
                code={`/* After theme.css. The attribute name is yours: set it on <html> from your control. */
:root[data-reduce-motion='true'] .kv-spinner,
:root[data-reduce-motion='true'] .kv-spinner::before,
:root[data-reduce-motion='true'] .kv-progress-track,
:root[data-reduce-motion='true'] .kv-progress-track::before,
:root[data-reduce-motion='true'] .kv-progress-bar,
:root[data-reduce-motion='true'] .kv-table[data-busy] .kv-table-column-header,
:root[data-reduce-motion='true'] .kv-table[data-busy] .kv-table-head > tr:last-child::after {
  animation: none;
}

:root[data-reduce-motion='true'] .kv-button[data-busy] > .kv-spinner {
  animation: kv-spinner-reveal 1ms steps(1, end) 1000ms both;
}`}
              />
              <p>
                With the animation removed, each indicator shows its rest shape: a three-quarter
                arc, a hatched track and a plain gradient fill.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
