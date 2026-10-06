import { afterEach, describe, expect, it } from 'vite-plus/test'
import { collectText } from '@kvirn-ui/core'

// Needs a real DOM and computed styles, so it runs in the browser project; the code is in core.

function mount(html: string): HTMLElement {
  const root = document.createElement('div')
  root.innerHTML = html
  document.body.append(root)
  return root
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('collectText', () => {
  it.each([
    ['[hidden]', '<p>Seen</p><p hidden>Gone</p>'],
    ['aria-hidden="true"', '<p>Seen</p><p aria-hidden="true">Gone</p>'],
    ['script', '<p>Seen</p><script>Gone</script>'],
    ['style', '<p>Seen</p><style>.x{}</style>'],
    ['template', '<p>Seen</p><template>Gone</template>'],
    ['noscript', '<p>Seen</p><noscript>Gone</noscript>'],
    ['[data-kv-read-aloud-skip]', '<p>Seen</p><p data-kv-read-aloud-skip>Gone</p>'],
    ['display: none', '<p>Seen</p><p style="display: none">Gone</p>'],
    ['visibility: hidden', '<p>Seen</p><p style="visibility: hidden">Gone</p>'],
    ['a hidden ancestor', '<p>Seen</p><div hidden><p><b>Gone</b></p></div>'],
  ])('skips %s', (_name, html) => {
    expect(collectText(mount(html)).text).toBe('Seen')
  })

  it('keeps a visible child of a visibility: hidden parent', () => {
    const root = mount(
      '<div style="visibility: hidden">Gone <b style="visibility: visible">Seen</b></div>',
    )
    expect(collectText(root).text).toBe('Seen')
  })

  it('does not glue words from adjacent blocks together', () => {
    const root = mount(
      '<p>One</p><p>Two</p><ul><li>Three</li><li>Four</li></ul><table><tr><td>Five</td><td>Six</td></tr></table>',
    )
    expect(collectText(root).text).toBe('One Two Three Four Five Six')
  })

  it('keeps inline elements together and collapses whitespace', () => {
    const root = mount('<p>Hel<b>lo</b>\n   <em>wor</em>ld</p>')
    expect(collectText(root).text).toBe('Hello world')
  })

  it('maps rangeFor across two text nodes back to the original nodes', () => {
    const root = mount('<p>Hello <b>big</b> world</p>')
    const collected = collectText(root)
    expect(collected.text).toBe('Hello big world')
    const range = collected.rangeFor(3, 9)
    expect(range.toString()).toBe('lo big')
    expect(range.startContainer).toBe(root.querySelector('p')?.firstChild)
    expect(range.endContainer).toBe(root.querySelector('b')?.firstChild)
  })

  it('maps rangeFor across blocks and skipped content to the right text', () => {
    const root = mount('<p>First one.</p><p hidden>Gone</p><p>Second   one.</p>')
    const collected = collectText(root)
    const start = collected.text.indexOf('Second')
    expect(collected.rangeFor(start, collected.text.length).toString()).toBe('Second   one.')
    expect(collected.rangeFor(0, 5).toString()).toBe('First')
  })

  it('returns a collapsed range for an empty element', () => {
    const range = collectText(mount('<p hidden>Gone</p>')).rangeFor(0, 3)
    expect(range.collapsed).toBe(true)
  })

  it('records the nearest lang ancestor of each run, up to the element itself', () => {
    const root = mount('<p>Hej <span lang="en">Hello <b>there</b></span> igen</p>')
    root.setAttribute('lang', 'sv')
    const collected = collectText(root)
    expect(collected.languageRuns).toEqual([
      { start: 0, end: 4, language: 'sv' },
      { start: 4, end: 15, language: 'en' },
      { start: 15, end: 20, language: 'sv' },
    ])
  })

  it('splits language runs where the lang changes and ignores a lang above the element', () => {
    const outer = mount('<div><p>Hej <span lang="en">Hello <b>there</b></span> igen</p></div>')
    outer.setAttribute('lang', 'fi')
    const root = outer.firstElementChild as Element
    const collected = collectText(root)
    expect(collected.text).toBe('Hej Hello there igen')
    expect(collected.languageRuns).toEqual([{ start: 4, end: 15, language: 'en' }])
  })
})
