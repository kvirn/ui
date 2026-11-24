import { afterEach, describe, expect, it } from 'vite-plus/test'
import { expectNoA11yViolations } from './expect-no-a11y-violations.ts'

const mount = (html: string) => {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('expectNoA11yViolations', () => {
  it('passes for a button with an accessible name', async () => {
    const container = mount('<button type="button">Skicka</button>')
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })

  it('fails with a readable report for a button without a name', async () => {
    const container = mount('<button type="button"></button>')
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/\[button-name\]/)
  })

  it('fails for an image without alternative text', async () => {
    const container = mount('<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">')
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/\[image-alt\]/)
  })

  it('passes a rich option named by its own option text with a visible second line', async () => {
    const container = mount(
      '<div role="listbox" aria-label="Country"><div role="option" id="o1" aria-selected="false" aria-labelledby="t1"><span id="t1" class="kv-listbox-option-text">Sweden</span><span>Stockholm</span></div></div>',
    )
    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined()
  })

  it('still fails an option whose aria-labelledby points outside it', async () => {
    const container = mount(
      '<span id="t2" class="kv-listbox-option-text">Sweden</span><div role="listbox" aria-label="Country"><div role="option" id="o2" aria-selected="false" aria-labelledby="t2"><span>Sweden</span><span>Stockholm</span></div></div>',
    )
    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /\[label-content-name-mismatch\]/,
    )
  })

  it('still fails a button named by its first line with a visible second line', async () => {
    const container = mount(
      '<button type="button" aria-labelledby="t3"><span id="t3">Sweden</span><span>Stockholm</span></button>',
    )
    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /\[label-content-name-mismatch\]/,
    )
  })

  it('still fails an option labelled by its own descendant without the option text class', async () => {
    const container = mount(
      '<div role="listbox" aria-label="Country"><div role="option" id="o4" aria-selected="false" aria-labelledby="t4"><span id="t4">Sweden</span><span>Stockholm</span></div></div>',
    )
    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /\[label-content-name-mismatch\]/,
    )
  })

  it('still fails an option labelled by its own option text and an element outside it', async () => {
    const container = mount(
      '<span id="t6">Visit</span><div role="listbox" aria-label="Country"><div role="option" id="o5" aria-selected="false" aria-labelledby="t5 t6"><span id="t5" class="kv-listbox-option-text">Sweden</span><span>Stockholm</span></div></div>',
    )
    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /\[label-content-name-mismatch\]/,
    )
  })
})
