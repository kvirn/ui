import { Link } from '@kvirn-ui/react'
import type { Metadata } from 'next'
import { ButtonVariants, DisabledWithReason } from '../../../components/button-examples.tsx'
import { CodeBlock } from '../../../components/code-block.tsx'
import { ComponentPage } from '../../../components/component-page.tsx'
import { ExampleFrame } from '../../../components/example-frame.tsx'
import { messages } from '../../../messages/en.ts'

// The first page on the template (Plan 0005, C2). Accessibility, Strings and the API
// reference are derived from source files in Phase 2 (C3, C4).

const text = messages.docs.template

export const metadata: Metadata = { title: messages.docs.meta.title({ page: 'Button' }) }

const variantsCode = `import { Button } from '@kvirn-ui/react'
import '@kvirn-ui/theme/theme.css'

<div data-kv-button-group>
  <Button data-variant="primary">Send application</Button>
  <Button>Save draft</Button>
  <Button data-variant="danger">Delete draft</Button>
</div>`

const disabledCode = `<p id="send-reason">Fill in all required fields before you send.</p>
<Button
  data-variant="primary"
  disabled
  focusableWhenDisabled
  aria-describedby="send-reason"
>
  Send application
</Button>`

export default function ButtonPage() {
  return (
    <ComponentPage
      title="Button"
      summary="A button that does something, such as sending a form or saving a draft. It never sends a form by accident, and it can stay reachable by keyboard when it’s disabled."
      status="alpha"
    >
      <h2 id="example">{text.example}</h2>
      <ExampleFrame caption="Primary, secondary and danger buttons" code={variantsCode}>
        <ButtonVariants />
      </ExampleFrame>

      <h2 id="when-to-use">{text.whenToUse}</h2>
      <ul>
        <li>Use a button when the user does something: sends, saves, deletes or opens.</li>
        <li>Write the label as a verb that says what will happen: “Send application”, not “OK”.</li>
        <li>Use one primary button per page, for the main next step.</li>
        <li>Deleting and other actions that can’t be undone need a confirmation step.</li>
      </ul>
      <h3 id="when-not-to-use">{text.whenNotToUse}</h3>
      <p>
        To go to another page, use a <Link href="/components/link">Link</Link>. Don’t make a link
        look like a button, or a button look like a link.
      </p>

      <h2 id="installation">{text.installation}</h2>
      <CodeBlock code="pnpm add @kvirn-ui/react @kvirn-ui/i18n" />
      <p>
        For the default look, also add <code>@kvirn-ui/theme</code> and import{' '}
        <code>theme.css</code> once, for example in your root layout. Every Button is then styled.
        Remove the import, and it’s unstyled again: KvirnUI never loads CSS for you.
      </p>
      <CodeBlock
        code={`pnpm add @kvirn-ui/theme

import '@kvirn-ui/theme/theme.css'`}
      />

      <h2 id="usage">{text.usage}</h2>
      <h3 id="usage-action">A button that does something</h3>
      <p>
        <code>type=&quot;button&quot;</code> is the default, so a Button never sends a form by
        accident.
      </p>
      <CodeBlock code={'<Button onClick={saveDraft}>Save draft</Button>'} />

      <h3 id="usage-form">Sending a form</h3>
      <p>
        Use <code>type=&quot;submit&quot;</code> for the one button that sends the form.
      </p>
      <CodeBlock
        code={`<form onSubmit={sendApplication}>
  {/* fields */}
  <Button type="submit" data-variant="primary">
    Send application
  </Button>
</form>`}
      />

      <h3 id="usage-disabled">Disabled buttons</h3>
      <p>
        Try not to disable buttons. Let people press them and then explain what’s missing. If you
        must disable one, use <code>focusableWhenDisabled</code> so keyboard and screen reader users
        can still find it, and show the reason next to it.
      </p>
      <ExampleFrame caption="Disabled with a reason" code={disabledCode}>
        <DisabledWithReason />
      </ExampleFrame>

      <h3 id="usage-render">Using your own button component</h3>
      <p>
        Use <code>render</code> to change the element. It must still render a{' '}
        <code>&lt;button&gt;</code>. To go somewhere, use Link.
      </p>
      <CodeBlock code={'<Button render={<MyStyledButton />}>Save draft</Button>'} />

      <h3 id="usage-hook">The hook: useButton</h3>
      <p>
        Build your own button with the same behaviour. Pass your click handler to the hook, so it
        stays blocked while the button is disabled.
      </p>
      <CodeBlock
        code={`const button = useButton({ disabled: isSaving, focusableWhenDisabled: true, onClick: save })

<button {...button.buttonProps}>Save draft</button>`}
      />

      <h2 id="styling">{text.styling}</h2>
      <p>
        Button renders <code>data-kv=&quot;button&quot;</code>, and its state as{' '}
        <code>data-disabled</code> and <code>data-focus-visible</code>. The default theme styles
        those attributes. Choose how much of it you want.
      </p>

      <h3 id="styling-theme">1. Use the default theme</h3>
      <p>
        Import <code>@kvirn-ui/theme/theme.css</code>. A Button is secondary by default. Pass{' '}
        <code>data-variant=&quot;primary&quot;</code> for the one main action on the page, or{' '}
        <code>data-variant=&quot;danger&quot;</code> for an action that deletes something. Put{' '}
        <code>data-kv-density=&quot;compact&quot;</code> on a container for smaller buttons in staff
        tools.
      </p>
      <CodeBlock code={'<Button data-variant="primary">Send application</Button>'} />

      <h3 id="styling-variables">2. Override variables</h3>
      <p>
        The theme is role scales (<code>--kv-primary-500</code>, <code>--kv-neutral-50</code>),
        named for what they do and not for their hue, and semantic tokens that point at them (
        <code>--kv-color-primary</code>). Set either in your own CSS. Everything in{' '}
        <code>theme.css</code> is in <code>@layer kv</code>, so your CSS always wins.
      </p>
      <CodeBlock
        code={`/* Rebrand: give the primary scale your brand's colours. All four themes follow. */
:root {
  --kv-primary-50: #edfafa;
  --kv-primary-100: #cdf0f0;
  --kv-primary-200: #9be0e2;
  --kv-primary-300: #5fc6cb;
  --kv-primary-400: #26a4ac;
  --kv-primary-500: #007d86;
  --kv-primary-600: #00707a;
  --kv-primary-700: #005a62;
  --kv-primary-800: #00474e;
  --kv-primary-900: #003a40;
  --kv-primary-950: #00262a;
}`}
      />
      <p>
        A secondary Button&apos;s edge uses the secondary scale, which is the neutral steps by
        default. Give <code>--kv-secondary-*</code> your own 11 steps to colour it.
      </p>
      <p>
        Each theme uses different steps, so a swapped scale can break contrast. Check your colours
        with <code>checkThemeCss()</code> from <code>@kvirn-ui/theme</code> on your customised copy.
        It measures every text, control and focus pair in all four themes.
      </p>

      <h3 id="styling-own">3. Replace it or skip it</h3>
      <p>
        <code>theme.css</code> is one readable file. Copy it from{' '}
        <code>node_modules/@kvirn-ui/theme/theme.css</code> into your project, edit it, and import
        your copy instead. Or skip it, and style the attributes with Tailwind or your own CSS.
      </p>
      <CodeBlock
        code={`<Button className="rounded-md border px-4 py-2 data-disabled:border-dashed data-focus-visible:outline-2">
  Save draft
</Button>`}
      />
    </ComponentPage>
  )
}
