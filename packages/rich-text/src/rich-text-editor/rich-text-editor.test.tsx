import { Field, KvirnProvider } from '@kvirn-ui/react'
import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import type { JSONContent } from '@tiptap/core'
import { EditorContent } from '@tiptap/react'
import { createRef, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { useRichTextEditorContext } from './rich-text-editor-context.ts'
import { RichTextEditor } from './rich-text-editor.tsx'
import { useRichTextEditor } from './use-rich-text-editor.ts'
import type { RichTextChangeDetails } from './use-rich-text-editor.ts'

// Plan 0036, contract: rich-text-editor.a11y.md (the toolbar's rows follow with the toolbar). The
// keys of the text are proved in ../extensions/kvirn-keymap.test.tsx. Real Tiptap, in a browser.

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
})

/** Only KvirnUI's own developer warnings: Tiptap has its own. */
const kvirnWarnings = () =>
  consoleWarn.mock.calls
    .map(([message]) => String(message))
    .filter((m) => m.startsWith('[KvirnUI]'))

const status = () => page.getByRole('status')
const textbox = (name = 'Beskriv ärendet') => page.getByRole('textbox', { name })

function inSwedish(children: ReactNode) {
  return (
    <KvirnProvider locale="sv" messages={sv}>
      {children}
    </KvirnProvider>
  )
}

/** The texts an element is described by, in the order of its `aria-describedby`. */
function describedByTexts(element: Element): string[] {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter((id) => id !== '')
    .map((id) => document.getElementById(id)?.textContent ?? `(no element ${id})`)
}

function formText(container: Element, name: string): string {
  const value = formValue(container, name)
  return typeof value === 'string' ? value : ''
}

function formValue(container: Element, name: string): FormDataEntryValue | null {
  const form = container.querySelector('form')
  if (form === null) {
    throw new Error('No form to read.')
  }
  return new FormData(form).get(name)
}

describe('in a Field', () => {
  function Described() {
    return inSwedish(
      <Field.Root required invalid>
        <Field.Label>Beskriv ärendet</Field.Label>
        <Field.Prose>
          <p>Skriv så att vi förstår vad som hänt.</p>
        </Field.Prose>
        <RichTextEditor.Root name="description">
          <RichTextEditor.Content />
        </RichTextEditor.Root>
        <Field.HelpText>Du kan använda rubriker och listor.</Field.HelpText>
        <Field.ErrorMessage>Beskriv ärendet</Field.ErrorMessage>
      </Field.Root>,
    )
  }

  test('the Field’s label names the editable text, a multi-line textbox', async () => {
    const { container } = await render(<Described />)
    const box = textbox()
    await expect.element(box).toBeInTheDocument()
    await expect.element(box).toHaveAttribute('aria-multiline', 'true')
    await expect.element(box).toHaveAttribute('aria-required', 'true')
    await expect.element(box).toHaveAttribute('aria-invalid', 'true')
    // The label's `for` can't name a div, so the textbox points at the label itself.
    const label = container.querySelector('label')
    expect(box.element().getAttribute('id')).toBe(label?.getAttribute('for'))
    expect(box.element().getAttribute('aria-labelledby')).toBe(label?.getAttribute('id'))
    await expectNoA11yViolations(container)
    expect(kvirnWarnings()).toEqual([])
  })

  test('it is described by the description, the help text and the error, in that order', async () => {
    await render(<Described />)
    const box = textbox()
    await expect.element(box).toBeInTheDocument()
    expect(describedByTexts(box.element())).toEqual([
      'Skriv så att vi förstår vad som hänt.',
      'Du kan använda rubriker och listor.',
      expect.stringContaining('Beskriv ärendet'),
    ])
  })

  test('a click on the Field’s label focuses the editable text', async () => {
    await render(<Described />)
    await expect.element(textbox()).toBeInTheDocument()
    await userEvent.click(page.getByText('Beskriv ärendet', { exact: true }).first())
    await expect.element(textbox()).toHaveFocus()
  })

  test('a disabled Field disables the editor: aria-disabled, not editable, out of the Tab order, not submitted', async () => {
    const { container } = await render(
      inSwedish(
        <form>
          <button type="button">Före</button>
          <Field.Root disabled>
            <Field.Label>Beskriv ärendet</Field.Label>
            <RichTextEditor.Root name="description" defaultValue="<p>Sparad</p>">
              <RichTextEditor.Content />
            </RichTextEditor.Root>
          </Field.Root>
          <button type="button">Efter</button>
        </form>,
      ),
    )
    const box = textbox('Beskriv ärendet (valfritt)')
    await expect.element(box).toBeInTheDocument()
    await expect.element(box).toHaveAttribute('aria-disabled', 'true')
    await expect.element(box).toHaveAttribute('contenteditable', 'false')
    await expect.element(box).not.toHaveAttribute('tabindex')
    expect(formValue(container, 'description')).toBeNull()
    // Not editable: Tab works as everywhere else.
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })
})

describe('outside a Field', () => {
  test('the Content’s aria-label names it, and aria-describedby adds to what describes it', async () => {
    await render(
      inSwedish(
        <>
          <p id="extra">Fler ord.</p>
          <RichTextEditor.Root>
            <RichTextEditor.Content aria-label="Nyhetstext" aria-describedby="extra" />
          </RichTextEditor.Root>
        </>,
      ),
    )
    const box = textbox('Nyhetstext')
    await expect.element(box).toBeInTheDocument()
    expect(describedByTexts(box.element())).toEqual(['Fler ord.'])
    expect(kvirnWarnings()).toEqual([])
  })

  test('warns in development when the editable text has no name', async () => {
    await render(
      <RichTextEditor.Root>
        <RichTextEditor.Content />
      </RichTextEditor.Root>,
    )
    await vi.waitFor(() => {
      expect(kvirnWarnings().join('\n')).toContain('RichTextEditor has no accessible name')
    })
  })

  test('warns in development when a Field has no Field.Label', async () => {
    await render(
      <Field.Root>
        <RichTextEditor.Root>
          <RichTextEditor.Content />
        </RichTextEditor.Root>
      </Field.Root>,
    )
    await vi.waitFor(() => {
      expect(kvirnWarnings().join('\n')).toContain('has no Field.Label')
    })
  })
})

describe('the value', () => {
  test('is submitted with the form under name, and empty is "", never <p></p>', async () => {
    const { container } = await render(
      inSwedish(
        <form>
          <RichTextEditor.Root name="description" defaultValue="<p></p>">
            <RichTextEditor.Content aria-label="Text" />
          </RichTextEditor.Root>
        </form>,
      ),
    )
    await expect.element(textbox('Text')).toBeInTheDocument()
    expect(formValue(container, 'description')).toBe('')
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('Hej')
    await vi.waitFor(() => {
      expect(formText(container, 'description')).toContain('Hej')
    })
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}')
    await vi.waitFor(() => {
      expect(formValue(container, 'description')).toBe('')
    })
  })

  test('deleting all the text reports "" and isEmpty, even when an empty heading is left', async () => {
    const onValueChange = vi.fn<(value: unknown, details: RichTextChangeDetails) => void>()
    await render(
      inSwedish(
        <RichTextEditor.Root defaultValue="<h2>Rubrik</h2>" onValueChange={onValueChange}>
          <RichTextEditor.Content aria-label="Text" />
        </RichTextEditor.Root>,
      ),
    )
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
    await vi.waitFor(() => {
      expect(onValueChange).toHaveBeenLastCalledWith('', expect.objectContaining({ isEmpty: true }))
    })
  })

  test('a form reset goes back to the default value', async () => {
    const { container } = await render(
      inSwedish(
        <form>
          <RichTextEditor.Root name="description" defaultValue="<p>Start</p>">
            <RichTextEditor.Content aria-label="Text" />
          </RichTextEditor.Root>
          <button type="reset">Återställ</button>
        </form>,
      ),
    )
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Control>}{End}{/Control}tillagg')
    await vi.waitFor(() => {
      expect(formText(container, 'description')).toContain('Starttillagg')
    })
    await userEvent.click(page.getByRole('button', { name: 'Återställ' }))
    await vi.waitFor(() => {
      expect(formText(container, 'description')).not.toContain('tillagg')
    })
    expect(formText(container, 'description')).toContain('Start')
    await expect.element(textbox('Text')).toHaveTextContent('Start')
    await expect.element(textbox('Text')).not.toHaveTextContent('tillagg')
  })

  test('controlled: typing reports each change and never moves the caret, and a new value replaces the text', async () => {
    const details: RichTextChangeDetails[] = []
    function Controlled() {
      const [value, setValue] = useState('<p>Start</p>')
      return inSwedish(
        <>
          <button type="button" onClick={() => setValue('<p>Nytt</p>')}>
            Byt
          </button>
          <RichTextEditor.Root
            value={value}
            onValueChange={(next, change) => {
              setValue(next)
              details.push(change)
            }}
          >
            <RichTextEditor.Content aria-label="Text" />
          </RichTextEditor.Root>
        </>,
      )
    }
    await render(<Controlled />)
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Control>}{End}{/Control}ab')
    await expect.element(textbox('Text')).toHaveTextContent('Startab')
    expect(details.length).toBeGreaterThanOrEqual(2)
    expect(details.at(-1)?.isEmpty).toBe(false)
    await userEvent.click(page.getByRole('button', { name: 'Byt' }))
    await expect.element(textbox('Text')).toHaveTextContent('Nytt')
    await expect.element(textbox('Text')).not.toHaveTextContent('Start')
  })

  test('format="json": the value is Tiptap’s document, null when empty, and the form gets its text', async () => {
    const onValueChange = vi.fn<(value: unknown, details: RichTextChangeDetails) => void>()
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hej' }] }],
    }
    const { container } = await render(
      inSwedish(
        <form>
          <RichTextEditor.Root
            format="json"
            name="description"
            defaultValue={doc}
            onValueChange={onValueChange}
          >
            <RichTextEditor.Content aria-label="Text" />
          </RichTextEditor.Root>
        </form>,
      ),
    )
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Control>}{End}{/Control}a')
    await vi.waitFor(() => {
      const [value] = onValueChange.mock.lastCall ?? []
      expect(value).toMatchObject({ type: 'doc' })
      expect(JSON.stringify(value)).toContain('Heja')
    })
    expect(JSON.parse(formText(container, 'description'))).toMatchObject({ type: 'doc' })
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
    await vi.waitFor(() => {
      expect(onValueChange.mock.lastCall?.[0]).toBeNull()
    })
    expect(formValue(container, 'description')).toBe('')
  })
})

describe('read-only', () => {
  test('is focusable, selectable and not editable, with aria-readonly', async () => {
    await render(
      inSwedish(
        <>
          <button type="button">Före</button>
          <RichTextEditor.Root readOnly defaultValue="<p>Sparad text</p>">
            <RichTextEditor.Content aria-label="Text" />
          </RichTextEditor.Root>
        </>,
      ),
    )
    const box = textbox('Text')
    await expect.element(box).toHaveAttribute('aria-readonly', 'true')
    await expect.element(box).toHaveAttribute('contenteditable', 'false')
    await expect.element(box).toHaveAttribute('tabindex', '0')
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await userEvent.keyboard('{Tab}')
    await expect.element(box).toHaveFocus()
    await userEvent.keyboard('x')
    await expect.element(box).toHaveTextContent('Sparad text')
    await expect.element(box).not.toHaveTextContent('x')
  })
})

describe('focus', () => {
  test('a click sets data-focused only, and Tab adds data-focus-visible', async () => {
    await render(
      inSwedish(
        <>
          <button type="button">Före</button>
          <RichTextEditor.Root data-testid="root">
            <RichTextEditor.Content aria-label="Text" />
          </RichTextEditor.Root>
        </>,
      ),
    )
    const root = page.getByTestId('root')
    await userEvent.click(textbox('Text'))
    await expect.element(root).toHaveAttribute('data-focused', '')
    await expect.element(root).not.toHaveAttribute('data-focus-visible')
    await userEvent.click(page.getByRole('button', { name: 'Före' }))
    await expect.element(root).not.toHaveAttribute('data-focused')
    await userEvent.keyboard('{Tab}')
    await expect.element(textbox('Text')).toHaveFocus()
    await expect.element(root).toHaveAttribute('data-focus-visible', '')
  })

  test('Alt+F10 goes to the toolbar the Root’s parts registered', async () => {
    function ToolbarStub() {
      const { registerToolbar } = useRichTextEditorContext()
      const button = useRef<HTMLButtonElement>(null)
      useEffect(
        () =>
          registerToolbar(() => {
            button.current?.focus()
            return button.current !== null
          }),
        [registerToolbar],
      )
      return (
        <button type="button" ref={button}>
          Verktyg
        </button>
      )
    }
    await render(
      inSwedish(
        <RichTextEditor.Root>
          <ToolbarStub />
          <RichTextEditor.Content aria-label="Text" />
        </RichTextEditor.Root>,
      ),
    )
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Alt>}{F10}{/Alt}')
    await expect.element(page.getByRole('button', { name: 'Verktyg' })).toHaveFocus()
  })
})

describe('announcements', () => {
  test('a formatting shortcut says "on" and "off" politely, with the control’s name', async () => {
    await render(
      inSwedish(
        <RichTextEditor.Root defaultValue="<p>Text</p>">
          <RichTextEditor.Content aria-label="Text" />
        </RichTextEditor.Root>,
      ),
    )
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Control>}a{/Control}{Control>}b{/Control}')
    await expect.element(status()).toHaveTextContent('Fetstil på')
    await userEvent.keyboard('{Control>}b{/Control}')
    await expect.element(status()).toHaveTextContent('Fetstil av')
  })

  test('Tab in a list item says the new level', async () => {
    await render(
      inSwedish(
        <RichTextEditor.Root defaultValue="<ul><li><p>Ett</p></li><li><p>Två</p></li></ul>">
          <RichTextEditor.Content aria-label="Text" />
        </RichTextEditor.Root>,
      ),
    )
    await userEvent.click(textbox('Text'))
    await userEvent.keyboard('{Control>}{End}{/Control}{Tab}')
    await expect.element(status()).toHaveTextContent('Nivå 2')
  })
})

describe('character count', () => {
  function Counted() {
    const [value, setValue] = useState('')
    return inSwedish(
      <>
        <button type="button" onClick={() => setValue(`<p>${'a'.repeat(19)}</p>`)}>
          Sätt
        </button>
        <Field.Root>
          <Field.Label>Beskrivning</Field.Label>
          <RichTextEditor.Root value={value} onValueChange={setValue} maxLength={20} characterCount>
            <RichTextEditor.Content />
          </RichTextEditor.Root>
        </Field.Root>
      </>,
    )
  }

  test('counts the text under the box, describes it, and never blocks typing', async () => {
    await render(<Counted />)
    const box = textbox('Beskrivning (valfritt)')
    await expect.element(box).toBeInTheDocument()
    await expect.element(page.getByText('Du kan skriva högst 20 tecken.')).toBeVisible()
    await userEvent.click(box)
    await userEvent.keyboard('Hej')
    await expect.element(page.getByText('Du har 17 tecken kvar.')).toBeVisible()
    await userEvent.keyboard('a'.repeat(20))
    await expect.element(page.getByText('Du har 3 tecken för mycket.')).toBeVisible()
    expect(describedByTexts(box.element()).some((text) => text.includes('tecken för mycket'))).toBe(
      true,
    )
  })

  test('a text set from code is not announced, and typing in the editor is', async () => {
    await render(<Counted />)
    const box = textbox('Beskrivning (valfritt)')
    await expect.element(box).toBeInTheDocument()
    await userEvent.click(page.getByRole('button', { name: 'Sätt' }))
    await expect.element(page.getByText('Du har 1 tecken kvar.')).toBeVisible()
    // Longer than the pause after which the count would have been said.
    await new Promise((resolve) => setTimeout(resolve, 700))
    await expect.element(status()).toBeEmptyDOMElement()
    await userEvent.click(box)
    await userEvent.keyboard('xx')
    await expect.element(status()).toHaveTextContent('Du har 1 tecken för mycket.')
  })

  test('warns in development when there is a count but no limit', async () => {
    await render(
      <RichTextEditor.Root characterCount>
        <RichTextEditor.Content aria-label="Text" />
      </RichTextEditor.Root>,
    )
    await vi.waitFor(() => {
      expect(kvirnWarnings().join('\n')).toContain('has characterCount but no maxLength')
    })
  })
})

describe('the hook and the parts', () => {
  test('useRichTextEditor works with your own markup and Tiptap’s EditorContent', async () => {
    function Bare() {
      const richText = useRichTextEditor({ name: 'fritt', 'aria-label': 'Fritt' })
      return (
        <form>
          <div {...richText.rootProps}>
            <EditorContent editor={richText.editor} {...richText.contentProps} />
          </div>
          {richText.hiddenInputProps === undefined ? null : (
            <input {...richText.hiddenInputProps} />
          )}
        </form>
      )
    }
    const { container } = await render(<Bare />)
    const box = textbox('Fritt')
    await expect.element(box).toHaveAttribute('aria-multiline', 'true')
    await userEvent.click(box)
    await userEvent.keyboard('Hej')
    await vi.waitFor(() => {
      expect(formText(container, 'fritt')).toContain('Hej')
    })
  })

  test('renders on the server without an editor', () => {
    const html = renderToString(
      <RichTextEditor.Root>
        <RichTextEditor.Content aria-label="Text" />
      </RichTextEditor.Root>,
    )
    expect(html).not.toContain('contenteditable')
  })

  test('part classes, data-* state, ref, and the class of the editable text', async () => {
    const ref = createRef<HTMLDivElement>()
    await render(
      inSwedish(
        <RichTextEditor.Root
          ref={ref}
          data-testid="root"
          className="egen"
          defaultValue="<p>Hej</p>"
        >
          <RichTextEditor.Content aria-label="Text" />
        </RichTextEditor.Root>,
      ),
    )
    const root = page.getByTestId('root')
    await expect.element(root).toHaveClass('kv-rich-text', 'egen')
    expect(ref.current).toBe(root.element())
    await expect.element(textbox('Text')).toHaveClass('kv-rich-text-content', 'kv-prose')
    await expect.element(root).not.toHaveAttribute('data-empty')
  })

  test('a RichTextEditor part outside a Root says so', () => {
    const outside = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => renderToString(<RichTextEditor.Content aria-label="Text" />)).toThrow(
        /inside <RichTextEditor\.Root>/,
      )
    } finally {
      outside.mockRestore()
    }
  })
})
