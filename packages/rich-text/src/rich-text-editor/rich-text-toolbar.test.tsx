import { Field, KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { Mark } from '@tiptap/core'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { defaultExtensions } from '../extensions/default-extensions.ts'
import { RichTextEditor } from './rich-text-editor.tsx'
import type { RichTextEditorRootProps } from './rich-text-editor.tsx'

// Plan 0036 phase B, contract: rich-text-editor.a11y.md. The toolbar, its controls, the block type
// picker and the Table group. The link and image forms are in link-image-forms.test.tsx, and the
// keys of the text in ../extensions/kvirn-keymap.test.tsx. Real Tiptap, in a real browser.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

const kvirnWarnings = () =>
  consoleWarn.mock.calls
    .map(([message]) => String(message))
    .filter((m) => m.startsWith('[KvirnUI]'))

const status = () => page.getByRole('status')
const textbox = () => page.getByRole('textbox', { name: 'Beskrivning' })
const toolbar = () => page.getByRole('toolbar')
const button = (name: string) => page.getByRole('button', { name, exact: true })

// Tiptap reads the extensions when it creates the editor: keep them stable.
const withoutUnderline = defaultExtensions({ starterKit: { underline: false } })
const withoutTables = defaultExtensions({ table: false, image: false })
const headings234 = defaultExtensions({ heading: { levels: [2, 3, 4] } })

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    marker: {
      toggleMarker: () => ReturnType
    }
  }
}

/** A custom mark, to prove a toolbar can be extended with the ordinary Tiptap API. */
const Marker = Mark.create({
  name: 'marker',
  parseHTML: () => [{ tag: 'mark' }],
  renderHTML: () => ['mark', 0],
  addCommands() {
    return {
      toggleMarker:
        () =>
        ({ commands }) =>
          commands.toggleMark('marker'),
    }
  },
})
const withMarker = [...defaultExtensions(), Marker]

type EditorOptions = Partial<RichTextEditorRootProps> & { toolbar?: ReactNode }

function Editor({ toolbar: toolbarContent, ...props }: EditorOptions) {
  return (
    <KvirnProvider locale="sv" messages={sv}>
      <button type="button">Före</button>
      <Field.Root required>
        <Field.Label>Beskrivning</Field.Label>
        <RichTextEditor.Root name="description" {...props}>
          {toolbarContent ?? <RichTextEditor.Toolbar />}
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>
      <button type="button">Efter</button>
    </KvirnProvider>
  )
}

const defaultNames = [
  'Ångra',
  'Gör om',
  'Texttyp',
  'Fetstil',
  'Kursiv',
  'Understrykning',
  'Genomstrykning',
  'Kod',
  'Punktlista',
  'Numrerad lista',
  'Öka indrag',
  'Minska indrag',
  'Länk',
  'Bild',
  'Tabell',
  'Ta bort formatering',
]

/** The accessible names of the toolbar's controls, in order. */
function controlNames(): string[] {
  const element = toolbar().element()
  return [...element.querySelectorAll<HTMLElement>('button, [role="combobox"]')].map(
    (control) => control.getAttribute('aria-label') ?? control.textContent ?? '',
  )
}

describe('the toolbar', () => {
  test('is named "Formatering" and the Field’s label, controls the text, and says its shortcut', async () => {
    const { container } = await render(<Editor />)
    const bar = page.getByRole('toolbar', { name: 'Formatering Beskrivning' })
    await expect.element(bar).toBeInTheDocument()
    await expect.element(textbox()).toBeInTheDocument()
    await expect.element(bar).toHaveAttribute('aria-controls', textbox().element().id)
    await expect.element(bar).toHaveAttribute('aria-keyshortcuts', 'Alt+F10')
    await expectNoA11yViolations(container)
  })

  test('outside a Field its name stands alone', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <RichTextEditor.Root>
          <RichTextEditor.Toolbar />
          <RichTextEditor.Content aria-label="Nyhetstext" />
        </RichTextEditor.Root>
      </KvirnProvider>,
    )
    await expect.element(page.getByRole('toolbar', { name: 'Formatering' })).toBeInTheDocument()
  })

  test('has the default controls, in the groups and the order of the design', async () => {
    await render(<Editor />)
    await expect.element(toolbar()).toBeInTheDocument()
    await vi.waitFor(() => expect(controlNames()).toEqual(defaultNames))
    const groups = [...toolbar().element().querySelectorAll('[role="group"]')].map((group) =>
      group.getAttribute('aria-label'),
    )
    expect(groups).toEqual(['Ångra och gör om', 'Textstil', 'Listor', 'Infoga'])
  })

  test('include and exclude choose controls, and a control the extensions lack is left out', async () => {
    await render(
      <Editor
        extensions={withoutUnderline}
        toolbar={
          <RichTextEditor.Toolbar>
            <RichTextEditor.DefaultControls exclude={['table', 'image', 'code']} />
          </RichTextEditor.Toolbar>
        }
      />,
    )
    await expect.element(toolbar()).toBeInTheDocument()
    await vi.waitFor(() => {
      expect(controlNames()).toEqual(
        defaultNames.filter((name) => !['Tabell', 'Bild', 'Kod', 'Understrykning'].includes(name)),
      )
    })
  })

  test('include limits it to the named controls', async () => {
    await render(
      <Editor
        toolbar={
          <RichTextEditor.Toolbar>
            <RichTextEditor.DefaultControls include={['bold', 'italic', 'link']} />
          </RichTextEditor.Toolbar>
        }
      />,
    )
    await vi.waitFor(() => expect(controlNames()).toEqual(['Fetstil', 'Kursiv', 'Länk']))
  })

  test('without tables and images, there is no Table, Image or Table group', async () => {
    await render(<Editor extensions={withoutTables} />)
    await expect.element(toolbar()).toBeInTheDocument()
    await vi.waitFor(() => {
      expect(controlNames()).toEqual(defaultNames.filter((n) => !['Tabell', 'Bild'].includes(n)))
    })
  })

  test('is not rendered while the text is read-only, where there is nothing to format', async () => {
    await render(<Editor readOnly defaultValue="<p>Sparad</p>" />)
    await expect.element(textbox()).toBeInTheDocument()
    await expect.element(toolbar()).not.toBeInTheDocument()
  })

  test('is disabled with the editor: natively disabled controls, out of the Tab order', async () => {
    await render(<Editor disabled />)
    await expect.element(toolbar()).toBeInTheDocument()
    await expect.element(button('Fetstil')).toBeDisabled()
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })
})

describe('Tab, Alt+F10 and Escape between the toolbar and the text', () => {
  test('Tab goes to the toolbar (one stop), then the text, then the next field; Shift+Tab goes back', async () => {
    await render(<Editor />)
    await expect.element(textbox()).toBeInTheDocument()
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await userEvent.keyboard('{Tab}')
    // The first control, Ångra, is unavailable but focusable.
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(textbox()).toHaveFocus()
    await userEvent.keyboard('{Escape}{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(textbox()).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(button('Ångra')).toHaveFocus()
  })

  test('Alt+F10 in the text moves to the toolbar’s remembered control', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Alt>}{F10}{/Alt}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    await expect.element(button('Fetstil')).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(textbox()).toHaveFocus()
    await userEvent.keyboard('{Alt>}{F10}{/Alt}')
    await expect.element(button('Fetstil')).toHaveFocus()
  })

  test('Escape on the toolbar hides an open tooltip first, then goes back to the text at the selection', async () => {
    await render(<Editor defaultValue="<p>Hej världen</p>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{End}{/Control}{Alt>}{F10}{/Alt}')
    // Arrow keys to Fetstil, so focus comes from the keyboard however Alt+F10 got there.
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    await expect.element(button('Fetstil')).toHaveFocus()
    // Keyboard focus opens the control's tooltip at once.
    await expect.element(page.getByRole('tooltip')).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument()
    await expect.element(button('Fetstil')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect.element(textbox()).toHaveFocus()
    // At the selection: the caret was at the end.
    await userEvent.keyboard('!')
    await expect.element(textbox()).toHaveTextContent('Hej världen!')
  })

  test('the arrows wrap, and Home and End go to the ends', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Alt>}{F10}{/Alt}')
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Ta bort formatering')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Ångra')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect.element(button('Ta bort formatering')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect.element(button('Ångra')).toHaveFocus()
  })
})

describe('icon controls, names and tooltips', () => {
  test('an icon control has its name as aria-label and its shortcut for the platform in aria-keyshortcuts', async () => {
    await render(<Editor />)
    await expect.element(button('Fetstil')).toHaveAttribute('aria-keyshortcuts', 'Control+B')
    await expect.element(button('Kursiv')).toHaveAttribute('aria-keyshortcuts', 'Control+I')
    await expect.element(button('Understrykning')).toHaveAttribute('aria-keyshortcuts', 'Control+U')
    await expect.element(button('Ångra')).toHaveAttribute('aria-keyshortcuts', 'Control+Z')
    await expect
      .element(button('Gör om'))
      .toHaveAttribute('aria-keyshortcuts', 'Control+Shift+Z Control+Y')
    await expect.element(button('Länk')).toHaveAttribute('aria-keyshortcuts', 'Control+K')
    await expect.element(button('Genomstrykning')).not.toHaveAttribute('aria-keyshortcuts')
  })

  test('keyboard focus shows a tooltip with the name, and the shortcut is the control’s description', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Alt>}{F10}{/Alt}{ArrowRight}{ArrowRight}{ArrowRight}')
    const bold = button('Fetstil')
    await expect.element(bold).toHaveFocus()
    // Only the focused control's tooltip is open.
    const tooltip = page.getByRole('tooltip')
    await expect.element(tooltip).toBeVisible()
    expect(tooltip.element().textContent).toContain('Fetstil')
    expect(tooltip.element().textContent).toContain('Ctrl')
    // The name is heard once (from the button), the shortcut once (as its description).
    await expect.element(bold).toHaveAccessibleDescription(/Ctrl\s*B/)
    expect(bold.element().getAttribute('aria-describedby')).not.toBeNull()
  })

  test('labels="icon-and-text" shows each name as the visible text, with no aria-label', async () => {
    await render(<Editor labels="icon-and-text" />)
    const bold = button('Fetstil')
    await expect.element(bold).toBeInTheDocument()
    await expect.element(bold).toHaveTextContent('Fetstil')
    await expect.element(bold).not.toHaveAttribute('aria-label')
    await expect.element(toolbar()).toHaveClass('kv-toolbar--labels')
    // Without a shortcut a control with a visible name has no tooltip at all.
    await userEvent.click(textbox())
    await userEvent.keyboard('{Alt>}{F10}{/Alt}{End}')
    await expect.element(button('Ta bort formatering')).toHaveFocus()
    await expect.element(page.getByRole('tooltip')).not.toBeInTheDocument()
  })

  test('tooltips={false} renders no tooltips, and icon-only controls then warn', async () => {
    await render(<Editor tooltips={false} />)
    await expect.element(toolbar()).toBeInTheDocument()
    expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(0)
    await vi.waitFor(() => {
      expect(kvirnWarnings().join('\n')).toContain('icon-only controls and no tooltips')
    })
  })

  test('the Toolbar’s own labels and tooltips beat the Root’s', async () => {
    await render(
      <Editor
        labels="icon"
        toolbar={<RichTextEditor.Toolbar labels="icon-and-text" tooltips={false} />}
      />,
    )
    await expect.element(button('Fetstil')).toHaveTextContent('Fetstil')
  })
})

describe('toggles and commands', () => {
  test('Bold, Italic and Underline are aria-pressed, follow the caret, and toggle the format', async () => {
    await render(<Editor defaultValue="<p>Vanlig <strong>fet</strong> text</p>" />)
    const bold = button('Fetstil')
    await expect.element(bold).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    await expect.element(bold).toHaveAttribute('aria-pressed', 'false')
    // Into the bold word: ArrowRight past "Vanlig " and one letter in.
    await userEvent.keyboard('{ArrowRight}'.repeat(9))
    await expect.element(bold).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.click(button('Kursiv'))
    await expect.element(button('Kursiv')).toHaveAttribute('aria-pressed', 'true')
    await expect.element(textbox()).toHaveFocus()
    expect(textbox().element().innerHTML).toContain('<em>')
  })

  test('a pointer press keeps focus and the selection in the text', async () => {
    await render(<Editor defaultValue="<p>Text</p>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.click(button('Fetstil'))
    await expect.element(textbox()).toHaveFocus()
    expect(textbox().element().innerHTML).toContain('<strong>Text</strong>')
  })

  test('a keyboard press keeps focus on the button, so several formats can be set in a row; nothing is announced', async () => {
    await render(<Editor defaultValue="<p>Text</p>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}a{/Control}{Alt>}{F10}{/Alt}')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{Enter}')
    await expect.element(button('Fetstil')).toHaveFocus()
    await expect.element(button('Fetstil')).toHaveAttribute('aria-pressed', 'true')
    await userEvent.keyboard('{ArrowRight}{Space}')
    await expect.element(button('Kursiv')).toHaveFocus()
    await expect.element(button('Kursiv')).toHaveAttribute('aria-pressed', 'true')
    await expect.element(status()).toBeEmptyDOMElement()
  })

  test('Undo and Redo are unavailable (aria-disabled, still focusable) until they can act, and announce', async () => {
    await render(<Editor defaultValue="<p>Hej</p>" />)
    await expect.element(button('Ångra')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{End}{/Control}a')
    await expect.element(button('Ångra')).not.toHaveAttribute('aria-disabled')
    await userEvent.click(button('Ångra'))
    await expect.element(textbox()).toHaveTextContent('Hej')
    await expect.element(textbox()).not.toHaveTextContent('Heja')
    await expect.element(status()).toHaveTextContent('Ångrat.')
    await expect.element(button('Gör om')).not.toHaveAttribute('aria-disabled')
    await userEvent.click(button('Gör om'))
    await expect.element(textbox()).toHaveTextContent('Heja')
    await expect.element(status()).toHaveTextContent('Gjort om.')
  })

  test('Increase and Decrease indent do what Tab and Shift+Tab do, are unavailable where they cannot act, and announce the level', async () => {
    await render(<Editor defaultValue="<ul><li><p>Ett</p></li><li><p>Två</p></li></ul>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    // The first item has nothing above it, and is not nested.
    await expect.element(button('Öka indrag')).toHaveAttribute('aria-disabled', 'true')
    await expect.element(button('Minska indrag')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(button('Öka indrag')).not.toHaveAttribute('aria-disabled')
    await userEvent.click(button('Öka indrag'))
    expect(textbox().element().querySelectorAll('ul ul li')).toHaveLength(1)
    await expect.element(status()).toHaveTextContent('Nivå 2')
    await expect.element(button('Minska indrag')).not.toHaveAttribute('aria-disabled')
    await userEvent.click(button('Minska indrag'))
    expect(textbox().element().querySelectorAll('ul ul')).toHaveLength(0)
    await expect.element(status()).toHaveTextContent('Nivå 1')
  })

  test('Clear formatting is unavailable with nothing to clear, and announces', async () => {
    await render(<Editor defaultValue="<p>Vanlig <strong>fet</strong></p>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    await expect.element(button('Ta bort formatering')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.click(button('Ta bort formatering'))
    expect(textbox().element().innerHTML).not.toContain('<strong>')
    await expect.element(status()).toHaveTextContent('Formateringen är borttagen.')
  })

  test('a custom CommandToggle gets the Tiptap editor, and is pressed where the mark is', async () => {
    await render(
      <Editor
        extensions={withMarker}
        defaultValue="<p>Text</p>"
        toolbar={
          <RichTextEditor.Toolbar>
            <RichTextEditor.Group aria-label="Markering">
              <RichTextEditor.CommandToggle
                label="Markera"
                icon={<RichTextEditor.Icon name="bold" />}
                isPressed={(editor) => editor.isActive('marker')}
                onPress={(editor) => {
                  editor.chain().toggleMarker().run()
                }}
              />
              <RichTextEditor.CommandButton
                label="Rensa"
                onPress={(editor) => {
                  editor.chain().unsetMark('marker').run()
                }}
              />
              <RichTextEditor.CommandButton label="Inget" onPress={() => {}} />
            </RichTextEditor.Group>
          </RichTextEditor.Toolbar>
        }
      />,
    )
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.click(button('Markera'))
    await expect.element(button('Markera')).toHaveAttribute('aria-pressed', 'true')
    expect(textbox().element().innerHTML).toContain('<mark>')
    // A control without an icon is a text button.
    await expect.element(button('Rensa')).toHaveTextContent('Rensa')
    await userEvent.click(button('Rensa'))
    expect(textbox().element().innerHTML).not.toContain('<mark>')
  })
})

describe('the block type picker', () => {
  test('shows the type at the caret, applies a chosen one, and puts focus back in the text', async () => {
    await render(<Editor defaultValue="<p>Text</p>" />)
    const picker = page.getByRole('combobox', { name: 'Texttyp' })
    await expect.element(picker).toHaveTextContent('Vanlig text')
    await userEvent.click(textbox())
    await userEvent.click(picker)
    await userEvent.click(page.getByRole('option', { name: 'Rubrik 2' }))
    await expect.element(picker).toHaveTextContent('Rubrik 2')
    expect(textbox().element().querySelectorAll('h2')).toHaveLength(1)
    await vi.waitFor(() => expect(document.activeElement).toBe(textbox().element()))
  })

  test('offers the configured heading levels, a quote and a code block, and no H1', async () => {
    await render(<Editor extensions={headings234} />)
    await userEvent.click(page.getByRole('combobox', { name: 'Texttyp' }))
    await vi.waitFor(() => {
      const options = page
        .getByRole('option')
        .elements()
        .map((element) => element.textContent)
      expect(options).toEqual([
        'Vanlig text',
        'Rubrik 2',
        'Rubrik 3',
        'Rubrik 4',
        'Citat',
        'Kodblock',
      ])
    })
  })

  test('says "Flera typer" when the selection spans different types', async () => {
    await render(<Editor defaultValue="<h2>Rubrik</h2><p>Stycke</p>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}a{/Control}')
    await expect
      .element(page.getByRole('combobox', { name: 'Texttyp' }))
      .toHaveTextContent('Flera typer')
  })

  test('is a toolbar item reached by the arrows, and a closed picker keeps ArrowLeft and ArrowRight for the toolbar', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Alt>}{F10}{/Alt}{ArrowRight}{ArrowRight}')
    await expect.element(page.getByRole('combobox', { name: 'Texttyp' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    await expect.element(button('Fetstil')).toHaveFocus()
  })
})

describe('the Table group', () => {
  test('Tabell inserts a 3×3 table with a header row, moves focus into its first cell and announces it', async () => {
    await render(<Editor />)
    await userEvent.click(textbox())
    // No table, no Table group.
    expect(page.getByRole('group', { name: 'Tabell' }).elements()).toHaveLength(0)
    await userEvent.click(button('Tabell'))
    expect(textbox().element().querySelectorAll('table th')).toHaveLength(3)
    expect(textbox().element().querySelectorAll('tr')).toHaveLength(3)
    await expect.element(textbox()).toHaveFocus()
    await expect.element(status()).toHaveTextContent('Tabell med 3 kolumner och 3 rader tillagd.')
    await expect.element(page.getByRole('group', { name: 'Tabell' })).toBeInTheDocument()
    await expect.element(button('Rubrikrad')).toHaveAttribute('aria-pressed', 'true')
  })

  test('its buttons are available in a table and unavailable outside one, without the toolbar changing', async () => {
    await render(
      <Editor defaultValue="<p>Före</p><table><tbody><tr><th><p>A</p></th></tr><tr><td><p>B</p></td></tr></tbody></table><p>Efter</p>" />,
    )
    await expect.element(page.getByRole('group', { name: 'Tabell' })).toBeInTheDocument()
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    const addRow = button('Lägg till rad nedanför')
    await expect.element(addRow).toHaveAttribute('aria-disabled', 'true')
    const group = page.getByRole('group', { name: 'Tabell' }).element()
    await userEvent.click(textbox().getByText('A', { exact: true }))
    await expect.element(addRow).not.toHaveAttribute('aria-disabled')
    // The group stays: only its buttons' availability changed, so the toolbar never jumps (3.2.1).
    expect(page.getByRole('group', { name: 'Tabell' }).element()).toBe(group)
  })

  test('Add row adds one and announces it; Delete row is unavailable with one row', async () => {
    await render(<Editor defaultValue="<table><tbody><tr><td><p>A</p></td></tr></tbody></table>" />)
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    await expect.element(button('Ta bort raden')).toHaveAttribute('aria-disabled', 'true')
    await expect.element(button('Ta bort kolumnen')).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(button('Lägg till rad nedanför'))
    expect(textbox().element().querySelectorAll('tr')).toHaveLength(2)
    await expect.element(status()).toHaveTextContent('Raden är tillagd.')
    await expect.element(button('Ta bort raden')).not.toHaveAttribute('aria-disabled')
  })

  test('Add column to the left is the column before in left-to-right text, and after in right-to-left', async () => {
    await render(
      <div dir="rtl">
        <Editor defaultValue="<table><tbody><tr><td><p>أ</p></td><td><p>ب</p></td></tr></tbody></table>" />
      </div>,
    )
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    // The table inherits the right-to-left page, so the first cell is on the right, and the
    // left of it is the "after" side: the new cell is not first.
    await userEvent.click(button('Lägg till kolumn till vänster'))
    const cells = [...textbox().element().querySelectorAll('td')].map((cell) => cell.textContent)
    expect(cells).toEqual(['أ', '', 'ب'])
  })

  test('Delete table removes it, announces how to undo, puts focus in the text, and the group goes', async () => {
    await render(
      <Editor defaultValue="<p>Före</p><table><tbody><tr><td><p>A</p></td></tr><tr><td><p>B</p></td></tr></tbody></table>" />,
    )
    await userEvent.click(textbox())
    await userEvent.click(textbox().getByText('B', { exact: true }))
    await userEvent.click(button('Ta bort tabellen'))
    expect(textbox().element().querySelectorAll('table')).toHaveLength(0)
    await expect.element(textbox()).toHaveFocus()
    await expect.element(status()).toHaveTextContent('Tabellen är borttagen. Ångra med Ctrl+Z.')
    await vi.waitFor(() => {
      expect(page.getByRole('group', { name: 'Tabell' }).elements()).toHaveLength(0)
    })
  })

  test('with the keyboard: focus never lands on body when the focused button goes with the group', async () => {
    await render(
      <Editor defaultValue="<table><tbody><tr><td><p>A</p></td></tr><tr><td><p>B</p></td></tr></tbody></table>" />,
    )
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}{Alt>}{F10}{/Alt}{End}')
    await expect.element(button('Rubrikrad')).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect.element(button('Ta bort tabellen')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect.element(textbox()).toHaveFocus()
  })

  test('the Header row toggle switches the first row between header cells and cells', async () => {
    await render(
      <Editor defaultValue="<table><tbody><tr><th><p>A</p></th></tr><tr><td><p>B</p></td></tr></tbody></table>" />,
    )
    await userEvent.click(textbox())
    await userEvent.keyboard('{Control>}{Home}{/Control}')
    await expect.element(button('Rubrikrad')).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(button('Rubrikrad'))
    await expect.element(button('Rubrikrad')).toHaveAttribute('aria-pressed', 'false')
    expect(textbox().element().querySelectorAll('th')).toHaveLength(0)
  })
})
