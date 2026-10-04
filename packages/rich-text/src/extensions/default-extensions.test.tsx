import type { Editor } from '@tiptap/core'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { focusEnd, mountEditor } from '../test-utils.ts'
import type { EditorFixture } from '../test-utils.ts'
import { defaultExtensions, isAllowedLinkAddress } from './default-extensions.ts'
import type { DefaultExtensionsOptions } from './default-extensions.ts'
import { isAllowedImageSource } from './image-sources.ts'

// Plan 0036: the extensions a Kvirn editor starts with. The keys (Tab, Escape, AltGr and the
// shortcuts) are proved in kvirn-keymap.test.tsx. Real Tiptap, in a real browser.

let fixture: EditorFixture | undefined

function create(content: string, options?: DefaultExtensionsOptions): Editor {
  fixture = mountEditor(defaultExtensions(options), content)
  return fixture.editor
}

afterEach(() => {
  fixture?.destroy()
  fixture = undefined
})

/** The `src` of every image node, as stored. */
function imageAddresses(editor: Editor): string[] {
  const addresses: string[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'image') {
      addresses.push(String(node.attrs['src']))
    }
  })
  return addresses
}

// A script address, written so that no tool mistakes this test file for one.
const scriptAddress = ['javascript', ':alert(1)'].join('')

describe('headings', () => {
  test('are levels 2 and 3: the page owns the H1, and H1 and H4 become paragraphs', () => {
    const editor = create('<h1>Ett</h1><h2>Två</h2><h3>Tre</h3><h4>Fyra</h4>')
    const html = editor.getHTML()
    expect(html).toContain('<h2>Två</h2>')
    expect(html).toContain('<h3>Tre</h3>')
    expect(html).not.toContain('<h1')
    expect(html).not.toContain('<h4')
  })

  test('the configured levels decide which headings exist', () => {
    const editor = create('<h4>Fyra</h4>', { heading: { levels: [2, 3, 4] } })
    expect(editor.getHTML()).toContain('<h4>Fyra</h4>')
  })

  test('heading: false leaves headings out', () => {
    const editor = create('<h2>Två</h2>', { heading: false })
    expect(editor.getHTML()).not.toContain('<h2')
  })
})

describe('links', () => {
  test('only https, http, mailto, tel and relative addresses can be set', () => {
    const editor = create('<p>Ansök här</p>')
    editor.commands.selectAll()
    const allowed = [
      'https://exempel.se/ansok',
      'http://exempel.se',
      'mailto:kontakt@exempel.se',
      'tel:+46701234567',
      '/hjalp',
      './hjalp',
      '#kontakt',
    ]
    const refused = [
      scriptAddress,
      // A tab inside the scheme is ignored by browsers, so it is no way around the check.
      ['java', 'script:alert(1)'].join('\t'),
      'data:text/html,<p>x</p>',
      'ftp://exempel.se/fil',
      'vbscript:x',
    ]
    // One comparison of address to result, so a failure names the address.
    const results = Object.fromEntries(
      [...allowed, ...refused].map((href) => [href, editor.commands.setLink({ href })]),
    )
    expect(results).toEqual({
      ...Object.fromEntries(allowed.map((href) => [href, true])),
      ...Object.fromEntries(refused.map((href) => [href, false])),
    })
  })

  test('a link has no target: the reader decides where it opens', () => {
    const editor = create('<p>Ansök här</p>')
    editor.commands.selectAll()
    editor.commands.setLink({ href: 'https://exempel.se/ansok' })
    const html = editor.getHTML()
    expect(html).toContain('<a href="https://exempel.se/ansok">')
    expect(html).not.toContain('target')
  })

  test('a stored link with an address that isn’t allowed is dropped, and the text stays', () => {
    const editor = create(
      '<p><a href="ftp://exempel.se/fil">Filen</a> och <a href="https://exempel.se">sidan</a></p>',
    )
    const html = editor.getHTML()
    expect(html).not.toContain('ftp:')
    expect(html).toContain('Filen')
    expect(html).toContain('href="https://exempel.se"')
  })

  test('a click on a link only puts the caret in it (the Link control edits it)', () => {
    const editor = create('<p><a href="https://exempel.se">sidan</a></p>')
    const link = editor.extensionManager.extensions.find((extension) => extension.name === 'link')
    expect(link?.options.openOnClick).toBe(false)
  })

  test('isAllowedLinkAddress follows the same rule, and extra protocols widen it', () => {
    expect(isAllowedLinkAddress('https://exempel.se')).toBe(true)
    expect(isAllowedLinkAddress('/relativ')).toBe(true)
    expect(isAllowedLinkAddress(scriptAddress)).toBe(false)
    expect(isAllowedLinkAddress('ftp://exempel.se')).toBe(false)
    expect(isAllowedLinkAddress('ftp://exempel.se', ['https', 'ftp'])).toBe(true)
  })

  test('link: false leaves links out', () => {
    const editor = create('<p><a href="https://exempel.se">sidan</a></p>', { link: false })
    expect(editor.getHTML()).not.toContain('<a ')
  })
})

describe('tables', () => {
  test('a new table has a header row, and columns can’t be dragged', () => {
    const editor = create('<p></p>')
    editor.commands.insertTable()
    const html = editor.getHTML()
    expect(html).toContain('<th')
    expect(editor.view.dom.querySelectorAll('tr')).toHaveLength(3)
    const table = editor.extensionManager.extensions.find((extension) => extension.name === 'table')
    expect(table?.options.resizable).toBe(false)
  })

  test('table: false leaves tables out', () => {
    const editor = create('<p></p>', { table: false })
    expect(editor.extensionManager.extensions.some((extension) => extension.name === 'table')).toBe(
      false,
    )
  })
})

describe('images', () => {
  test('come from this site by default: a relative or same-origin address is inserted, another origin is not', () => {
    const editor = create('<p></p>')
    // The nodes' own attributes: the address is kept as written, never normalised. Each insert
    // starts from a fresh document, because an inserted image stays selected and the next one
    // would replace it.
    const sources = () => imageAddresses(editor)
    expect(editor.commands.setImage({ src: '/bilder/karta.png', alt: 'Karta' })).toBe(true)
    expect(sources()).toEqual(['/bilder/karta.png'])
    editor.commands.setContent('<p></p>')
    const sameOrigin = `${location.origin}/bilder/plan.png`
    expect(editor.commands.setImage({ src: sameOrigin, alt: 'Plan' })).toBe(true)
    expect(sources()).toEqual([sameOrigin])
    editor.commands.setContent('<p></p>')
    expect(editor.commands.setImage({ src: 'https://annan.example/bild.png', alt: 'Bild' })).toBe(
      false,
    )
    expect(sources()).toEqual([])
  })

  test('imageSources adds origins, and * allows any http or https address', () => {
    const allowed = create('<p></p>', { imageSources: ['https://bilder.example.se'] })
    expect(allowed.commands.setImage({ src: 'https://bilder.example.se/a.png', alt: 'A' })).toBe(
      true,
    )
    expect(allowed.commands.setImage({ src: 'https://annan.example/a.png', alt: 'A' })).toBe(false)
    fixture?.destroy()
    const any = create('<p></p>', { imageSources: ['*'] })
    expect(any.commands.setImage({ src: 'https://annan.example/a.png', alt: 'A' })).toBe(true)
  })

  test('base64 and script addresses are never images', () => {
    const editor = create('<p></p>', { imageSources: ['*'] })
    expect(editor.commands.setImage({ src: 'data:image/png;base64,AAAA', alt: 'A' })).toBe(false)
    expect(editor.commands.setImage({ src: scriptAddress, alt: 'A' })).toBe(false)
  })

  test('a stored or pasted image from another origin is dropped, and the others stay', () => {
    const editor = create(
      '<p>Text</p><img src="https://annan.example/a.png" alt="Borta"><img src="/b.png" alt="Kvar">',
    )
    const html = editor.getHTML()
    expect(html).not.toContain('annan.example')
    expect(html).toContain('src="/b.png"')
  })

  test('a decorative image keeps its empty alt, which is not the same as no alt', () => {
    const editor = create('<p></p>')
    editor.commands.setImage({ src: '/dekor.png', alt: '' })
    expect(editor.getHTML()).toContain('alt=""')
  })

  test('image: false leaves images out', () => {
    const editor = create('<img src="/b.png" alt="Kvar">', { image: false })
    expect(editor.getHTML()).not.toContain('<img')
  })

  test('isAllowedImageSource: relative and same-origin pass, anything else is refused', () => {
    const baseUrl = 'https://kommun.example/sida/'
    expect(isAllowedImageSource('bild.png', { baseUrl })).toBe(true)
    expect(isAllowedImageSource('/bild.png', { baseUrl })).toBe(true)
    expect(isAllowedImageSource('https://kommun.example/bild.png', { baseUrl })).toBe(true)
    expect(isAllowedImageSource('https://cdn.example/bild.png', { baseUrl })).toBe(false)
    // A protocol-relative address names its own origin.
    expect(isAllowedImageSource('//cdn.example/bild.png', { baseUrl })).toBe(false)
    expect(isAllowedImageSource('blob:https://kommun.example/uuid', { baseUrl })).toBe(false)
    expect(isAllowedImageSource('data:image/png;base64,AAAA', { baseUrl })).toBe(false)
    expect(isAllowedImageSource('data:image/png;base64,AAAA', { baseUrl, allowBase64: true })).toBe(
      true,
    )
    expect(isAllowedImageSource('', { baseUrl })).toBe(false)
    expect(isAllowedImageSource(undefined, { baseUrl })).toBe(false)
    expect(
      isAllowedImageSource('https://cdn.example/bild.png', {
        baseUrl,
        sources: ['https://cdn.example'],
      }),
    ).toBe(true)
  })
})

describe('typing rules', () => {
  test('are off: ## and a space stay as typed, which a screen reader user would not be told about', async () => {
    const editor = create('<p></p>')
    focusEnd(editor)
    await userEvent.keyboard('## Rubrik')
    expect(editor.getHTML()).toBe('<p>## Rubrik</p>')
  })

  test('inputRules: true turns them on', async () => {
    const editor = create('<p></p>', { inputRules: true })
    focusEnd(editor)
    await userEvent.keyboard('## Rubrik')
    // Tiptap's TrailingNode adds an empty paragraph after a heading, so the caret has somewhere to go.
    expect(editor.getHTML()).toBe('<h2>Rubrik</h2><p></p>')
  })
})

describe('the Kvirn keymap', () => {
  test('is part of the set, and keymap: false leaves it out', () => {
    const editor = create('<p></p>')
    expect(editor.extensionManager.extensions.some((e) => e.name === 'kvirnKeymap')).toBe(true)
    fixture?.destroy()
    const without = create('<p></p>', { keymap: false })
    expect(without.extensionManager.extensions.some((e) => e.name === 'kvirnKeymap')).toBe(false)
  })

  test('starterKit passes any other StarterKit option through', () => {
    const editor = create('<p><u>Understruken</u></p>', { starterKit: { underline: false } })
    expect(editor.getHTML()).not.toContain('<u>')
  })
})
