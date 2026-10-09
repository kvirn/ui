import type { KvirnMessages } from '@kvirn-ui/i18n'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { Field } from '../field/field.tsx'
import { Fieldset } from '../fieldset/fieldset.tsx'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { TextInput } from '../text-input/text-input.tsx'
import { CharacterCount } from './character-count.tsx'
import type { CharacterCountProps } from './character-count.tsx'
import { useCharacterCount } from './use-character-count.ts'
import type {
  CharacterCountPartProps,
  UseCharacterCountOptions,
  UseCharacterCountResult,
} from './use-character-count.ts'

// Contract: textarea.a11y.md › CharacterCount. The count has no keys of its own. The maths are in
// packages/core/src/character-count/character-count.test.ts.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** A box and its count, the way Textarea wires them, with the value in state. */
function Counted({
  initialValue = '',
  ...countProps
}: { initialValue?: string } & Partial<CharacterCountProps>) {
  const [value, setValue] = useState(initialValue)
  return (
    <>
      <label>
        Text
        <input value={value} onChange={(event) => setValue(event.currentTarget.value)} />
      </label>
      <CharacterCount
        value={value}
        limit={100}
        announcementDebounceMilliseconds={50}
        {...countProps}
      />
    </>
  )
}

const box = () => page.getByRole('textbox', { name: 'Text' })
const status = () => page.getByRole('status')

describe('rendering', () => {
  test('is a paragraph and not a live region', async () => {
    const { container } = await render(<CharacterCount value="" limit={500} />)
    const count = container.querySelector('p')
    expect(count).not.toBeNull()
    expect(count?.hasAttribute('aria-live')).toBe(false)
    expect(count?.hasAttribute('role')).toBe(false)
    await expectNoA11yViolations(container)
  })

  test('says the limit while empty, how many remain while typing, and how many are over', async () => {
    const { container } = await render(<Counted limit={20} />)
    const count = container.querySelector('p')
    expect(count?.textContent).toBe('You can enter up to 20 characters.')
    await userEvent.fill(box(), 'Hello')
    expect(count?.textContent).toBe('You have 15 characters remaining.')
    await userEvent.fill(box(), 'a'.repeat(19))
    expect(count?.textContent).toBe('You have 1 character remaining.')
    await userEvent.fill(box(), 'a'.repeat(20))
    expect(count?.textContent).toBe('You have 0 characters remaining.')
    await userEvent.fill(box(), 'a'.repeat(21))
    expect(count?.textContent).toBe('You have 1 character too many.')
    await userEvent.fill(box(), 'a'.repeat(32))
    expect(count?.textContent).toBe('You have 12 characters too many.')
  })

  test('data-near from the threshold and data-over past the limit, and the warning icon only when over', async () => {
    const { container } = await render(<Counted limit={100} />)
    const count = container.querySelector('p')
    expect(count?.hasAttribute('data-near')).toBe(false)
    expect(count?.hasAttribute('data-over')).toBe(false)
    await userEvent.fill(box(), 'a'.repeat(79))
    expect(count?.hasAttribute('data-near')).toBe(false)
    await userEvent.fill(box(), 'a'.repeat(80))
    expect(count?.hasAttribute('data-near')).toBe(true)
    expect(count?.hasAttribute('data-over')).toBe(false)
    expect(count?.querySelector('svg')).toBeNull()
    await userEvent.fill(box(), 'a'.repeat(101))
    expect(count?.hasAttribute('data-over')).toBe(true)
    // The icon is decorative: the words say it, so the shape is never the only cue (1.4.1).
    expect(count?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(count?.textContent).toBe('You have 1 character too many.')
    await expectNoA11yViolations(container)
  })

  test('counts what the user sees: a decomposed å and an emoji are one character each', async () => {
    const { container } = await render(<Counted limit={10} initialValue={'å\u{1F44D}'} />)
    expect(container.querySelector('p')?.textContent).toBe('You have 8 characters remaining.')
  })

  test('countCharacters counts the way the server does', async () => {
    const { container } = await render(
      <Counted limit={10} initialValue="abc" countCharacters={(value) => value.length * 2} />,
    )
    expect(container.querySelector('p')?.textContent).toBe('You have 4 characters remaining.')
  })

  test('forwards its ref, native props and a consumer’s class', async () => {
    const ref = createRef<HTMLParagraphElement>()
    const { container } = await render(
      <CharacterCount
        ref={ref}
        value=""
        limit={5}
        className="egen"
        data-testid="count"
        id="eget"
      />,
    )
    const count = container.querySelector('p')
    expect(ref.current).toBe(count)
    expect(count?.className).toBe('egen kv-field-help-text kv-character-count')
    expect(count?.getAttribute('id')).toBe('eget')
    expect(count?.getAttribute('data-testid')).toBe('count')
  })

  test('as changes the element to a div or a span and keeps the class and the text', async () => {
    const { container } = await render(
      <>
        <CharacterCount as="div" value="abcdefgh" limit={10} data-testid="division" />
        <CharacterCount as="span" value="abc" limit={10} data-testid="inline" />
      </>,
    )
    const division = container.querySelector('div.kv-character-count')
    expect(division?.getAttribute('data-testid')).toBe('division')
    expect(division?.className).toBe('kv-field-help-text kv-character-count')
    expect(container.querySelector('span.kv-character-count')).not.toBeNull()
  })

  test('an element outside the allowed list warns once and renders a p', async () => {
    const notAllowed = 'h2' as 'p'
    const { container } = await render(<CharacterCount as={notAllowed} value="" limit={5} />)
    expect(container.querySelector('p.kv-character-count')).not.toBeNull()
    expect(
      consoleWarn.mock.calls.filter((call) => String(call[0]).includes('CharacterCount as="h2"')),
    ).toHaveLength(1)
  })
})

describe('strings', () => {
  test('follow the provider’s locale: sv and fi, with plural forms', async () => {
    const { container } = await render(
      <>
        <KvirnProvider locale="sv" messages={sv}>
          <CharacterCount value="" limit={1000} />
          <CharacterCount value={'a'.repeat(880)} limit={1000} />
          <CharacterCount value={'a'.repeat(1012)} limit={1000} />
        </KvirnProvider>
        <KvirnProvider locale="fi" messages={fi}>
          <CharacterCount value={'a'.repeat(9)} limit={10} />
          <CharacterCount value={'a'.repeat(11)} limit={10} />
        </KvirnProvider>
      </>,
    )
    const texts = [...container.querySelectorAll('p')].map((count) => count.textContent)
    expect(texts).toEqual([
      // The limit is formatted for the locale: sv groups thousands with a no-break space.
      expect.stringMatching(/^Du kan skriva högst 1\s000 tecken\.$/),
      'Du har 120 tecken kvar.',
      'Du har 12 tecken för mycket.',
      'Sinulla on 1 merkki jäljellä.',
      'Sinulla on 1 merkki liikaa.',
    ])
  })

  test('an instance’s messages win over the provider’s', async () => {
    const messages: Partial<KvirnMessages['characterCount']> = {
      remaining: ({ count }) => `${count} kvar i rutan`,
    }
    const { container } = await render(
      <KvirnProvider locale="sv" messages={sv}>
        <CharacterCount value="abc" limit={10} messages={messages} />
      </KvirnProvider>,
    )
    expect(container.querySelector('p')?.textContent).toBe('7 kvar i rutan')
  })
})

describe('in a Field', () => {
  test('the control’s description lists the description, the count, the help text and the error, in DOM order', async () => {
    await render(
      <Field.Root required invalid>
        <Field.Label>Beskriv</Field.Label>
        <Field.Prose>
          <p>Skriv kort.</p>
        </Field.Prose>
        <TextInput />
        <CharacterCount value="abc" limit={10} />
        <Field.HelpText>Svenska eller engelska.</Field.HelpText>
        <Field.ErrorMessage>Beskriv ärendet</Field.ErrorMessage>
      </Field.Root>,
    )
    await expect
      .element(page.getByRole('textbox', { name: 'Beskriv' }))
      .toHaveAccessibleDescription(
        'Skriv kort. You have 7 characters remaining. Svenska eller engelska. Error: Beskriv ärendet',
      )
  })

  test('registers as a description: no dev warning for sitting in a Field or outside one', async () => {
    await render(
      <>
        <Field.Root>
          <Field.Label>Beskriv</Field.Label>
          <TextInput />
          <CharacterCount value="" limit={10} />
        </Field.Root>
        <CharacterCount value="" limit={10} />
      </>,
    )
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  test('directly in a Fieldset, a count keeps its own id and describes the box, not the fieldset', async () => {
    const { container } = await render(
      <Fieldset.Root>
        <Fieldset.Legend>Din situation</Fieldset.Legend>
        <textarea aria-label="Beskrivning" aria-describedby="antal" />
        <CharacterCount id="antal" value="abc" limit={10} />
      </Fieldset.Root>,
    )
    expect(container.querySelector('p')?.id).toBe('antal')
    await expect
      .element(page.getByRole('textbox', { name: 'Beskrivning' }))
      .toHaveAccessibleDescription('You have 7 characters remaining.')
    await expect
      .element(page.getByRole('group', { name: 'Din situation' }))
      .not.toHaveAccessibleDescription('You have 7 characters remaining.')
  })

  test('the count’s text updates in the description as the value changes', async () => {
    function Harness() {
      const [value, setValue] = useState('')
      return (
        <Field.Root>
          <Field.Label>Beskriv</Field.Label>
          <TextInput value={value} onValueChange={setValue} />
          <CharacterCount value={value} limit={10} />
        </Field.Root>
      )
    }
    await render(<Harness />)
    const input = page.getByRole('textbox', { name: 'Beskriv (optional)' })
    await expect.element(input).toHaveAccessibleDescription('You can enter up to 10 characters.')
    await userEvent.type(input, 'abc')
    await expect.element(input).toHaveAccessibleDescription('You have 7 characters remaining.')
  })
})

describe('announcements (4.1.3)', () => {
  const withProvider = (children: React.ReactNode) => (
    <KvirnProvider locale="sv" messages={sv}>
      {children}
    </KvirnProvider>
  )

  test('nothing is announced below 80% of the limit', async () => {
    await render(withProvider(<Counted limit={100} />))
    await userEvent.fill(box(), 'a'.repeat(40))
    await userEvent.fill(box(), 'a'.repeat(79))
    await new Promise((resolve) => setTimeout(resolve, 400))
    await expect.element(status()).toBeEmptyDOMElement()
  })

  test('from 80%, it is announced politely when typing pauses', async () => {
    await render(withProvider(<Counted limit={100} announcementDebounceMilliseconds={150} />))
    await userEvent.fill(box(), 'a'.repeat(80))
    // Not on every key: nothing yet, before the pause is over.
    await expect.element(status()).toBeEmptyDOMElement()
    await expect.element(status()).toHaveTextContent('Du har 20 tecken kvar.')
  })

  test('typing on restarts the pause, so only the last count is said', async () => {
    await render(withProvider(<Counted limit={100} announcementDebounceMilliseconds={300} />))
    await userEvent.fill(box(), 'a'.repeat(85))
    await new Promise((resolve) => setTimeout(resolve, 100))
    await userEvent.fill(box(), 'a'.repeat(90))
    await expect.element(status()).toHaveTextContent('Du har 10 tecken kvar.')
    expect(status().element().textContent).not.toContain('15')
  })

  test('crossing the limit is announced at once, without waiting for a pause', async () => {
    await render(withProvider(<Counted limit={100} announcementDebounceMilliseconds={60_000} />))
    await userEvent.fill(box(), 'a'.repeat(100))
    await expect.element(status()).toBeEmptyDOMElement()
    await userEvent.fill(box(), 'a'.repeat(101))
    await expect.element(status()).toHaveTextContent('Du har 1 tecken för mycket.')
  })

  test('announceChanges={false} keeps a change silent, and true says it', async () => {
    function Switched() {
      const [value, setValue] = useState('')
      const [isAnnouncing, setIsAnnouncing] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setValue('a'.repeat(100))}>
            Sätt
          </button>
          <button type="button" onClick={() => setIsAnnouncing(true)}>
            Lyssna
          </button>
          <button type="button" onClick={() => setValue('a'.repeat(101))}>
            Skriv
          </button>
          <CharacterCount
            value={value}
            limit={100}
            announcementDebounceMilliseconds={50}
            announceChanges={isAnnouncing}
          />
        </>
      )
    }
    await render(withProvider(<Switched />))
    await userEvent.click(page.getByRole('button', { name: 'Sätt' }))
    // Longer than the pause (50 ms) after which the count would have been said.
    await new Promise((resolve) => setTimeout(resolve, 300))
    await expect.element(status()).toBeEmptyDOMElement()
    await userEvent.click(page.getByRole('button', { name: 'Lyssna' }))
    await userEvent.click(page.getByRole('button', { name: 'Skriv' }))
    await expect.element(status()).toHaveTextContent('Du har 1 tecken för mycket.')
  })

  test('the same text is not said twice in a row', async () => {
    const seen: string[] = []
    await render(withProvider(<Counted limit={100} />))
    const region = document.querySelector('output[aria-live="polite"]')
    new MutationObserver(() => {
      const text = region?.textContent ?? ''
      if (text !== '') {
        seen.push(text)
      }
    }).observe(region ?? document.body, { childList: true, characterData: true, subtree: true })
    await userEvent.fill(box(), 'a'.repeat(90))
    await expect.element(status()).toHaveTextContent('Du har 10 tecken kvar.')
    // A new value with the same length, so the same count.
    await userEvent.fill(box(), 'b'.repeat(90))
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(seen.filter((text) => text === 'Du har 10 tecken kvar.')).toHaveLength(1)
  })

  test('without a KvirnProvider a count that should be announced warns once, and nothing breaks', async () => {
    await render(<Counted limit={100} />)
    await userEvent.fill(box(), 'a'.repeat(90))
    await vi.waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledTimes(1)
    })
    expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('KvirnProvider')
  })

  test('without a KvirnProvider a count that stays quiet does not warn', async () => {
    await render(<Counted limit={100} />)
    await userEvent.fill(box(), 'a'.repeat(10))
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('dev warnings', () => {
  test.each([0, -5, Number.NaN])(
    'a limit of %s warns once: a count needs a limit of at least 1',
    async (limit) => {
      await render(<CharacterCount value="" limit={limit} />)
      await vi.waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledTimes(1)
      })
      expect(String(consoleWarn.mock.calls[0]?.[0])).toContain('limit')
    },
  )
})

describe('useCharacterCount', () => {
  function Own({ value }: { value: string }) {
    const count = useCharacterCount({ value, limit: 10 })
    return <small {...count.countProps}>{count.text}</small>
  }

  test('gives the props and the text for your own element', async () => {
    const { container } = await render(<Own value="abc" />)
    const count = container.querySelector('small')
    expect(count?.textContent).toBe('You have 7 characters remaining.')
    expect(count?.id).not.toBe('')
  })

  test('reports the count', async () => {
    const seen: UseCharacterCountResult['count'][] = []
    function Probe() {
      const { count } = useCharacterCount({ value: 'abcdefghijkl', limit: 10 })
      seen.push(count)
      return null
    }
    await render(<Probe />)
    expect(seen.at(-1)).toMatchObject({ length: 12, excess: 2, isOver: true })
  })
})

describe('server rendering', () => {
  test('renders the text to a string without touching the page', () => {
    const html = renderToString(<CharacterCount value="abc" limit={10} />)
    expect(html).toContain('You have 7 characters remaining.')
  })
})

describe('types', () => {
  test('the props and the part props are exported', () => {
    expectTypeOf<
      CharacterCountPartProps['className']
    >().toEqualTypeOf<'kv-field-help-text kv-character-count'>()
    expectTypeOf<CharacterCountProps['value']>().toEqualTypeOf<string>()
    expectTypeOf<CharacterCountProps['limit']>().toEqualTypeOf<number>()
    expectTypeOf<UseCharacterCountOptions['limit']>().toEqualTypeOf<number>()
    expectTypeOf<CharacterCountProps['messages']>().toEqualTypeOf<
      Partial<KvirnMessages['characterCount']> | undefined
    >()
  })
})
