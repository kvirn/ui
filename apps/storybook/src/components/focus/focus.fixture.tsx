import { Button, FocusScope, Stack, useFocus } from '@kvirn-ui/react'
import type { UseFocusOptions } from '@kvirn-ui/react'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { FormLocale } from '../form/form.fixture.tsx'

// Fixtures for Foundation/Focus: each function is one example, and the story's "Show
// code" prints it (`showSource`). The words are example content, in sv and en; the other locales
// show the English text.

export type FocusFixtureLocale = 'sv' | 'en'

export const focusLocaleOf = (locale: FormLocale): FocusFixtureLocale =>
  locale === 'sv' ? 'sv' : 'en'

const say = (locale: FocusFixtureLocale, sv: string, en: string) => (locale === 'sv' ? sv : en)

const drawerStyle = { border: '1px solid currentColor', padding: '1rem' } as const

/** A native modal `<dialog>`: the browser holds focus, makes the page inert and returns focus. No hook. */
export function NativeDialog({ locale }: { locale: FocusFixtureLocale }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  return (
    <>
      <Button onClick={() => dialogRef.current?.showModal()}>
        {say(locale, 'Öppna dialogrutan', 'Open the dialog')}
      </Button>
      <dialog ref={dialogRef} aria-labelledby="native-dialog-title">
        <h2 id="native-dialog-title">{say(locale, 'Native dialogruta', 'Native dialog')}</h2>
        <p>{say(locale, 'Webbläsaren sköter fokus.', 'The browser handles focus.')}</p>
        <form method="dialog">
          <Button type="submit">{say(locale, 'Stäng', 'Close')}</Button>
        </form>
      </dialog>
    </>
  )
}

function Drawer({
  locale,
  options,
  title,
  children,
}: {
  locale: FocusFixtureLocale
  options: UseFocusOptions
  title: string
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { scopeProps } = useFocus({
    ...options,
    active: open,
    onEscape: options.onEscape === undefined ? undefined : () => setOpen(false),
  })
  return (
    <Stack className="kv-stack--gap-4">
      <div>
        <Button onClick={() => setOpen(true)}>{say(locale, 'Öppna filter', 'Open filters')}</Button>
      </div>
      <aside {...scopeProps} aria-label={title} hidden={!open} style={drawerStyle}>
        <Stack className="kv-stack--gap-4">
          {children}
          <div>
            <Button onClick={() => setOpen(false)}>{say(locale, 'Stäng', 'Close')}</Button>
          </div>
        </Stack>
      </aside>
      <div>
        <Button>{say(locale, 'Efter drawern', 'After the drawer')}</Button>
      </div>
    </Stack>
  )
}

function FilterFields({ locale }: { locale: FocusFixtureLocale }) {
  return (
    <div>
      <label>
        {say(locale, 'Sök', 'Search')} <input id="filter-search" type="text" />
      </label>{' '}
      <Button>{say(locale, 'Använd', 'Apply')}</Button>
    </div>
  )
}

/** `useFocus({ active })`: focus moves in when the drawer opens and returns to the button when it closes. */
export function RestoreDrawer({ locale }: { locale: FocusFixtureLocale }) {
  return (
    <Drawer locale={locale} title={say(locale, 'Filter', 'Filters')} options={{}}>
      <FilterFields locale={locale} />
    </Drawer>
  )
}

/** `contain: 'loop'`: Tab wraps at the ends. `onEscape` is the way out (2.1.2). */
export function LoopDrawer({ locale }: { locale: FocusFixtureLocale }) {
  return (
    <Drawer
      locale={locale}
      title={say(locale, 'Filter', 'Filters')}
      options={{ contain: 'loop', onEscape: () => {} }}
    >
      <FilterFields locale={locale} />
    </Drawer>
  )
}

/** `contain: 'inert'`: the rest of the page is `inert` while the drawer is open. */
export function InertDrawer({ locale }: { locale: FocusFixtureLocale }) {
  return (
    <Drawer
      locale={locale}
      title={say(locale, 'Filter', 'Filters')}
      options={{ contain: 'inert', onEscape: () => {} }}
    >
      <FilterFields locale={locale} />
    </Drawer>
  )
}

type InitialFocusChoice = 'first' | 'container' | 'selector' | 'none'

/** `initialFocus`: the first stop (default), the container, a selector or nowhere. */
export function InitialFocusChoices({ locale }: { locale: FocusFixtureLocale }) {
  const [choice, setChoice] = useState<InitialFocusChoice>('first')
  const choices: InitialFocusChoice[] = ['first', 'container', 'selector', 'none']
  return (
    <Stack className="kv-stack--gap-4">
      <fieldset>
        <legend>{say(locale, 'Fokus när drawern öppnas', 'Focus when the drawer opens')}</legend>
        {choices.map((value) => (
          <label key={value} style={{ display: 'block' }}>
            <input
              type="radio"
              name="initial-focus"
              value={value}
              checked={choice === value}
              onChange={() => setChoice(value)}
            />{' '}
            {value === 'selector' ? '"#filter-search"' : `'${value}'`}
          </label>
        ))}
      </fieldset>
      <Drawer
        key={choice}
        locale={locale}
        title={say(locale, 'Filter', 'Filters')}
        options={{ initialFocus: choice === 'selector' ? '#filter-search' : choice }}
      >
        <Button>{say(locale, 'Rensa', 'Clear')}</Button>
        <FilterFields locale={locale} />
      </Drawer>
    </Stack>
  )
}

/** `moveOn`: a wizard step. When the step changes, focus goes to its heading, and Tab continues from it. */
export function WizardStep({ locale }: { locale: FocusFixtureLocale }) {
  const [step, setStep] = useState(1)
  const stepRef = useRef<HTMLDivElement>(null)
  useFocus({ moveOn: { key: String(step), selector: 'h2', containerRef: stepRef } })
  return (
    <Stack className="kv-stack--gap-4">
      <div>
        <Button onClick={() => setStep(step + 1)}>{say(locale, 'Nästa steg', 'Next step')}</Button>
      </div>
      <div ref={stepRef}>
        <h2>
          {say(locale, 'Steg', 'Step')} {step}
        </h2>
        <p>{say(locale, 'Innehållet i steget.', 'The content of the step.')}</p>
        <Button>{say(locale, 'Första i steget', 'First in the step')}</Button>
      </div>
    </Stack>
  )
}

/** `moveOn` on a route, as `useRouteFocus` does: the key is the route, the target is the page's `h1`. */
export function RouteMove({ locale }: { locale: FocusFixtureLocale }) {
  const [route, setRoute] = useState<'start' | 'services'>('start')
  const mainRef = useRef<HTMLElement>(null)
  useFocus({ moveOn: { key: route, containerRef: mainRef } })
  return (
    <>
      <nav aria-label={say(locale, 'Huvudmeny', 'Main menu')}>
        <Button onClick={() => setRoute('services')}>
          {say(locale, 'Till tjänster', 'To services')}
        </Button>
      </nav>
      <main ref={mainRef}>
        <h1>
          {route === 'start'
            ? say(locale, 'Välkommen', 'Welcome')
            : say(locale, 'Våra tjänster', 'Our services')}
        </h1>
        <Button>{say(locale, 'Första knappen på sidan', 'First button on the page')}</Button>
      </main>
    </>
  )
}

/** `FocusScope`: the hook and the element in one part, with `as`. */
export function ScopePart({ locale }: { locale: FocusFixtureLocale }) {
  const [open, setOpen] = useState(false)
  return (
    <Stack className="kv-stack--gap-4">
      <div>
        <Button onClick={() => setOpen(true)}>{say(locale, 'Öppna filter', 'Open filters')}</Button>
      </div>
      <FocusScope
        active={open}
        contain="loop"
        onEscape={() => setOpen(false)}
        hidden={!open}
        as="aside"
        aria-label={say(locale, 'Filter', 'Filters')}
        style={drawerStyle}
      >
        <FilterFields locale={locale} />
        <Button onClick={() => setOpen(false)}>{say(locale, 'Stäng', 'Close')}</Button>
      </FocusScope>
    </Stack>
  )
}
