import { Field, KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { Editor as TiptapEditor } from '@tiptap/core'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { defaultExtensions } from '../extensions/default-extensions.ts'
import { getImageAddressProblem } from './image-control.tsx'
import { getLinkAddressProblem } from './link-control.tsx'
import { RichTextEditor } from './rich-text-editor.tsx'
import type { RichTextEditorRootProps } from './rich-text-editor.tsx'

// Plan 0036 phase B, contract: rich-text-editor.a11y.md › Link and Image popovers. Real Tiptap, in
// a real browser.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const status = () => page.getByRole('status')
const textbox = () => page.getByRole('textbox', { name: 'Beskrivning' })
const button = (name: string) => page.getByRole('button', { name, exact: true })
const dialog = (name: string) => page.getByRole('dialog', { name })

const allowCdn = defaultExtensions({ imageSources: ['https://bilder.example.se'] })

function Editor(props: Partial<RichTextEditorRootProps>) {
  return (
    <KvirnProvider locale="sv" messages={sv}>
      <Field.Root required>
        <Field.Label>Beskrivning</Field.Label>
        <RichTextEditor.Root name="description" {...props}>
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>
    </KvirnProvider>
  )
}

// A script address, written so that no tool mistakes this test file for one.
const scriptAddress = ['javascript', ':alert(1)'].join('')

/**
 * What describes a field, as one text: its help text and its error. The error is "Fel: <message>" in a
 * `<p>` with the prefix in a span, which `getByText` doesn't match as one string.
 */
function descriptionOf(field: { element: () => Element }): string {
  return (field.element().getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
}

async function selectAllText() {
  await userEvent.click(textbox())
  await userEvent.keyboard('{Control>}a{/Control}')
}

describe('the Link popover', () => {
  test('opens a dialog named "Lägg till länk" with focus in "Webbadress", and has no link text field while text is selected', async () => {
    const { container } = await render(<Editor defaultValue="<p>Ansök här</p>" />)
    await selectAllText()
    await userEvent.click(button('Länk'))
    await expect.element(dialog('Lägg till länk')).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Webbadress' })).toHaveFocus()
    await expect.element(page.getByRole('textbox', { name: 'Länktext' })).not.toBeInTheDocument()
    await expect.element(button('Länk')).toHaveAttribute('aria-expanded', 'true')
    await expectNoA11yViolations(container)
  })

  test('adds the link to the selected text, announces it, closes, and puts focus back in the text', async () => {
    await render(<Editor defaultValue="<p>Ansök här</p>" />)
    await selectAllText()
    await userEvent.click(button('Länk'))
    await userEvent.fill(
      page.getByRole('textbox', { name: 'Webbadress' }),
      'https://exempel.se/ansok',
    )
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog('Lägg till länk')).not.toBeInTheDocument()
    expect(textbox().element().innerHTML).toContain('<a href="https://exempel.se/ansok">')
    await expect.element(status()).toHaveTextContent('Länken är tillagd.')
    await expect.element(textbox()).toHaveFocus()
  })

  test.each([
    ['nothing', '', 'Skriv en webbadress.'],
    ['a bare domain', 'www.exempel.se', 'Skriv webbadressen som https://www.exempel.se'],
    ['a script address', scriptAddress, 'Skriv webbadressen som https://www.exempel.se'],
    [
      'an address with a scheme that isn’t allowed',
      'ftp://exempel.se/fil',
      'Skriv webbadressen som https://www.exempel.se',
    ],
  ])(
    '%s is refused with an inline error, and the popover stays open with focus in the field',
    async (_name, address, message) => {
      await render(<Editor defaultValue="<p>Ansök här</p>" />)
      await selectAllText()
      await userEvent.click(button('Länk'))
      const field = page.getByRole('textbox', { name: 'Webbadress' })
      await userEvent.fill(field, address)
      await userEvent.keyboard('{Enter}')
      await vi.waitFor(() => expect(descriptionOf(field)).toContain(message))
      await expect.element(dialog('Lägg till länk')).toBeVisible()
      await expect.element(field).toHaveAttribute('aria-invalid', 'true')
      await expect.element(field).toHaveFocus()
      expect(textbox().element().innerHTML).not.toContain('<a ')
    },
  )

  test('Escape closes it without changes, and puts focus back in the text', async () => {
    await render(<Editor defaultValue="<p>Ansök här</p>" />)
    await selectAllText()
    await userEvent.click(button('Länk'))
    await userEvent.fill(page.getByRole('textbox', { name: 'Webbadress' }), 'https://exempel.se')
    await userEvent.keyboard('{Escape}')
    await expect.element(dialog('Lägg till länk')).not.toBeInTheDocument()
    await expect.element(textbox()).toHaveFocus()
    expect(textbox().element().innerHTML).not.toContain('<a ')
  })

  test('Avbryt does the same', async () => {
    await render(<Editor defaultValue="<p>Ansök här</p>" />)
    await selectAllText()
    await userEvent.click(button('Länk'))
    await userEvent.click(button('Avbryt'))
    await expect.element(dialog('Lägg till länk')).not.toBeInTheDocument()
    await expect.element(textbox()).toHaveFocus()
  })

  test('with nothing selected it asks for the link text too, so a link is never its bare address', async () => {
    await render(<Editor defaultValue="<p>Hej </p>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{End}{/Control}')
    await userEvent.click(button('Länk'))
    const text = page.getByRole('textbox', { name: 'Länktext' })
    await expect.element(text).toBeVisible()
    await userEvent.fill(page.getByRole('textbox', { name: 'Webbadress' }), 'https://exempel.se')
    await userEvent.keyboard('{Enter}')
    // The first problem is the missing text: the popover stays, with focus on it.
    await vi.waitFor(() => expect(descriptionOf(text)).toContain('Skriv en länktext.'))
    await expect.element(text).toHaveFocus()
    await userEvent.fill(text, 'Kommunens sida')
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog('Lägg till länk')).not.toBeInTheDocument()
    expect(textbox().element().innerHTML).toContain(
      '<a href="https://exempel.se">Kommunens sida</a>',
    )
  })

  test('on a link it is "Ändra länk" with its address, can save a change, and "Ta bort länk" removes it', async () => {
    await render(<Editor defaultValue='<p>Se <a href="https://gammal.example">sidan</a></p>' />)
    await userEvent.click(page.getByText('sidan'))
    await userEvent.click(button('Länk'))
    await expect.element(dialog('Ändra länk')).toBeVisible()
    const field = page.getByRole('textbox', { name: 'Webbadress' })
    await expect.element(field).toHaveValue('https://gammal.example')
    await userEvent.fill(field, 'https://ny.example')
    await userEvent.click(button('Spara'))
    expect(textbox().element().innerHTML).toContain('href="https://ny.example"')
    await expect.element(status()).toHaveTextContent('Länken är ändrad.')
    await userEvent.click(button('Länk'))
    await userEvent.click(button('Ta bort länk'))
    expect(textbox().element().innerHTML).not.toContain('<a ')
    expect(textbox().element().textContent).toContain('sidan')
    await expect.element(status()).toHaveTextContent('Länken är borttagen.')
  })

  test('Mod-k opens it from the text, with focus in "Webbadress"', async () => {
    await render(<Editor defaultValue="<p>Text</p>" />)
    await selectAllText()
    await userEvent.keyboard('{Control>}k{/Control}')
    await expect.element(dialog('Lägg till länk')).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Webbadress' })).toHaveFocus()
  })

  test('Enter on Länk opens the form with focus in its first field', async () => {
    await render(<Editor defaultValue="<p>Ansök här</p>" />)
    await selectAllText()
    await userEvent.keyboard('{Alt>}{F10}{/Alt}')
    button('Länk').element().focus()
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog('Lägg till länk')).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Webbadress' })).toHaveFocus()
  })

  test('getLinkAddressProblem: full allowed addresses and local paths pass', () => {
    const passing = [
      'https://a.se',
      'http://a.se/x?y=1',
      'mailto:a@a.se',
      'tel:+4670',
      '/hjalp',
      '#del',
    ]
    expect(passing.map((address) => getLinkAddressProblem(address))).toEqual(
      passing.map(() => undefined),
    )
    expect(getLinkAddressProblem('  ')).toBe('missing')
    expect(getLinkAddressProblem('a.se')).toBe('invalid')
  })
})

describe('the Image popover', () => {
  test('opens a dialog named "Lägg till bild" with focus in the address, and no axe violations', async () => {
    const { container } = await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.click(button('Bild'))
    await expect.element(dialog('Lägg till bild')).toBeVisible()
    await expect.element(page.getByRole('textbox', { name: 'Bildens webbadress' })).toHaveFocus()
    await expectNoA11yViolations(container)
  })

  test('refuses an image with no description, names both ways out, then adds it with its alt text', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.click(button('Bild'))
    await userEvent.fill(
      page.getByRole('textbox', { name: 'Bildens webbadress' }),
      '/bilder/karta.png',
    )
    await userEvent.keyboard('{Enter}')
    const alt = page.getByRole('textbox', { name: 'Vad visar bilden?' })
    await vi.waitFor(() =>
      expect(descriptionOf(alt)).toContain(
        'Beskriv vad bilden visar, eller kryssa i att den bara är dekoration.',
      ),
    )
    await expect.element(alt).toHaveFocus()
    await userEvent.fill(alt, 'Karta över centrum')
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog('Lägg till bild')).not.toBeInTheDocument()
    const image = textbox().element().querySelector('img')
    expect(image?.getAttribute('src')).toBe('/bilder/karta.png')
    expect(image?.getAttribute('alt')).toBe('Karta över centrum')
    await expect.element(status()).toHaveTextContent('Bilden är tillagd.')
    await expect.element(textbox()).toHaveFocus()
  })

  test('"Bilden är bara dekoration" disables the description, which is not cleared, and saves an empty alt', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.click(button('Bild'))
    await userEvent.fill(page.getByRole('textbox', { name: 'Bildens webbadress' }), '/dekor.png')
    const alt = page.getByRole('textbox', { name: 'Vad visar bilden?' })
    await userEvent.fill(alt, 'Behålls')
    await userEvent.click(page.getByRole('checkbox', { name: 'Bilden är bara dekoration' }))
    await expect.element(alt).toBeDisabled()
    await expect.element(alt).toHaveValue('Behålls')
    await userEvent.click(button('Lägg till bild'))
    await expect.element(dialog('Lägg till bild')).not.toBeInTheDocument()
    expect(textbox().element().querySelector('img')?.getAttribute('alt')).toBe('')
  })

  test('an address outside the allowed image sources is refused inline, and an allowed origin is accepted', async () => {
    await render(<Editor extensions={allowCdn} />)
    await userEvent.click(textbox())
    await userEvent.click(button('Bild'))
    const address = page.getByRole('textbox', { name: 'Bildens webbadress' })
    await userEvent.fill(address, 'https://annan.example/a.png')
    await userEvent.fill(page.getByRole('textbox', { name: 'Vad visar bilden?' }), 'En bild')
    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() =>
      expect(descriptionOf(address)).toContain(
        'Bilder från den adressen får inte användas här. Skriv en annan webbadress.',
      ),
    )
    await expect.element(address).toHaveFocus()
    await userEvent.fill(address, 'https://bilder.example.se/a.png')
    await userEvent.keyboard('{Enter}')
    await expect.element(dialog('Lägg till bild')).not.toBeInTheDocument()
    expect(textbox().element().querySelector('img')?.getAttribute('src')).toBe(
      'https://bilder.example.se/a.png',
    )
  })

  test('a selected image is "Ändra bild", can be changed, and "Ta bort bild" removes it', async () => {
    await render(<Editor defaultValue='<p>Före</p><img src="/a.png" alt="Gammal"><p>Efter</p>' />)
    const picture = textbox().element().querySelector('img')
    if (picture === null) {
      throw new Error('The image was not rendered.')
    }
    await userEvent.click(picture)
    await userEvent.click(button('Bild'))
    await expect.element(dialog('Ändra bild')).toBeVisible()
    const alt = page.getByRole('textbox', { name: 'Vad visar bilden?' })
    await expect.element(alt).toHaveValue('Gammal')
    await userEvent.fill(alt, 'Ny beskrivning')
    await userEvent.click(button('Spara'))
    expect(textbox().element().querySelector('img')?.getAttribute('alt')).toBe('Ny beskrivning')
    await expect.element(status()).toHaveTextContent('Bilden är ändrad.')
    await userEvent.click(button('Bild'))
    await userEvent.click(button('Ta bort bild'))
    expect(textbox().element().querySelector('img')).toBeNull()
    await expect.element(status()).toHaveTextContent('Bilden är borttagen.')
  })

  test('Escape closes it without changes, and puts focus back in the text', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.click(button('Bild'))
    await userEvent.keyboard('{Escape}')
    await expect.element(dialog('Lägg till bild')).not.toBeInTheDocument()
    await expect.element(textbox()).toHaveFocus()
  })

  test('getImageAddressProblem asks the editor, so the allowed sources decide', () => {
    // Used by the form: relative and same-origin pass, another origin is "not-allowed".
    const editor = new TiptapEditor({ extensions: defaultExtensions(), content: '<p></p>' })
    try {
      expect(getImageAddressProblem(editor, '')).toBe('missing')
      expect(getImageAddressProblem(editor, 'bild.png')).toBe('invalid')
      expect(getImageAddressProblem(editor, '/bild.png')).toBeUndefined()
      expect(getImageAddressProblem(editor, 'https://annan.example/b.png')).toBe('not-allowed')
    } finally {
      editor.destroy()
    }
  })
})
