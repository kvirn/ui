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
})
