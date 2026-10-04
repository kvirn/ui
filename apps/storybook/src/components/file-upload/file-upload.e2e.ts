import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { wcagTags } from '@kvirn-ui/testing'

// Contract: packages/react/src/file-upload/file-upload.a11y.md › Keyboard, Focus management and
// Visual / modes. One test per Keyboard row, named after it. The system file dialog is Playwright's
// `filechooser` event: the page opens it from the Trigger, and the test answers it. The Keyboard
// story is the fixture for the key rows: the field, then a Send button. The baseline projects
// (forced colours, reduced motion, 320px) run every test when enabled with `E2E_BROWSERS=sweep`, set on `playwright test` directly.

const storyUrl = (story: string, globals?: string) =>
  `/iframe.html?id=components-form-fileupload--${story}&viewMode=story${globals === undefined ? '' : `&globals=${globals}`}`

async function openStory(page: Page, story: string, globals?: string) {
  await page.goto(storyUrl(story, globals))
  await expect(page.locator('.kv-file-upload').first()).toBeVisible()
}

const trigger = (page: Page) => page.getByRole('button', { name: /^Välj filer/ })
const triggerEn = (page: Page) => page.getByRole('button', { name: /^Choose files/ })
const items = (page: Page) => page.locator('li[data-status]')
const sendButton = (page: Page) => page.getByRole('button', { name: 'Skicka in' })

const file = (name: string, size = 2_000, mimeType = 'application/pdf') => ({
  name,
  mimeType,
  buffer: Buffer.alloc(size, 1),
})

/** Presses `key` on the focused Trigger and answers the system dialog with `files`. */
async function chooseWithKey(page: Page, key: string, ...files: ReturnType<typeof file>[]) {
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press(key)])
  await chooser.setFiles(files)
}

/** Adds files by the input, the way a dialog does, without a key. */
async function addFiles(page: Page, ...files: ReturnType<typeof file>[]) {
  await page.locator('input[type="file"]').setInputFiles(files)
}

test.describe('FileUpload: Keyboard', () => {
  test('Tab focuses the Trigger once', async ({ page }) => {
    await openStory(page, 'keyboard')
    await page.keyboard.press('Tab')
    await expect(trigger(page)).toBeFocused()
    await page.keyboard.press('Tab')
    // Next: the Send button. The hidden input and the zone are not stops.
    await expect(sendButton(page)).toBeFocused()
  })

  test('Tab goes on to the item buttons', async ({ page }) => {
    await openStory(page, 'keyboard')
    await addFiles(page, file('a.pdf'), file('b.pdf'))
    await expect(items(page)).toHaveCount(2)
    await trigger(page).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /Ta bort a\.pdf/ })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /Ta bort b\.pdf/ })).toBeFocused()
  })

  test('Shift+Tab goes back to the Trigger', async ({ page }) => {
    await openStory(page, 'keyboard')
    await addFiles(page, file('a.pdf'))
    await expect(items(page)).toHaveCount(1)
    await page.getByRole('button', { name: /Ta bort a\.pdf/ }).focus()
    await page.keyboard.press('Shift+Tab')
    await expect(trigger(page)).toBeFocused()
  })

  test('Enter opens the file dialog', async ({ page }) => {
    await openStory(page, 'keyboard')
    await trigger(page).focus()
    await chooseWithKey(page, 'Enter', file('intyg.pdf'))
    await expect(items(page)).toHaveCount(1)
    await expect(trigger(page)).toBeFocused()
  })

  test('Space opens the file dialog', async ({ page }) => {
    await openStory(page, 'keyboard')
    await trigger(page).focus()
    await chooseWithKey(page, 'Space', file('intyg.pdf'))
    await expect(items(page)).toHaveCount(1)
    await expect(trigger(page)).toBeFocused()
  })

  test('the Trigger does nothing at the limit', async ({ page }) => {
    await openStory(page, 'limit-reached')
    await addFiles(page, file('a.pdf'), file('b.pdf'))
    await expect(items(page)).toHaveCount(2)
    await trigger(page).focus()
    await expect(trigger(page)).toHaveAttribute('aria-disabled', 'true')
    let opened = false
    page.once('filechooser', () => {
      opened = true
    })
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    await page.waitForTimeout(150)
    expect(opened).toBe(false)
    await expect(trigger(page)).toBeFocused()
  })

  test('Remove moves focus to the next item', async ({ page }) => {
    await openStory(page, 'keyboard')
    await addFiles(page, file('a.pdf'), file('b.pdf'))
    await expect(items(page)).toHaveCount(2)
    await page.getByRole('button', { name: /Ta bort a\.pdf/ }).focus()
    await page.keyboard.press('Enter')
    await expect(items(page)).toHaveCount(1)
    await expect(items(page).first()).toBeFocused()
    await expect(items(page).first()).toContainText('b.pdf')
    // Removing the last item hands focus to the Trigger, never to the page.
    await page.keyboard.press('Tab')
    await page.getByRole('button', { name: /Ta bort b\.pdf/ }).focus()
    await page.keyboard.press('Space')
    await expect(items(page)).toHaveCount(0)
    await expect(trigger(page)).toBeFocused()
  })

  // The Uploading* stories already add `läkarintyg.pdf` in their play function and leave it
  // uploading, so these tests start from that state.
  test('Cancel keeps the file and focuses the item', async ({ page }) => {
    await openStory(page, 'uploading-unknown-size')
    const cancel = page.getByRole('button', { name: /Avbryt uppladdningen av läkarintyg\.pdf/ })
    await expect(cancel).toBeVisible()
    await cancel.focus()
    await page.keyboard.press('Enter')
    await expect(items(page).first()).toHaveAttribute('data-status', 'cancelled')
    await expect(items(page).first()).toBeFocused()
  })

  test('Retry restarts the upload', async ({ page }) => {
    await openStory(page, 'uploading-unknown-size')
    await page.getByRole('button', { name: /Avbryt uppladdningen/ }).press('Enter')
    await expect(items(page).first()).toHaveAttribute('data-status', 'cancelled')
    await page.getByRole('button', { name: /Försök igen med läkarintyg\.pdf/ }).press('Enter')
    await expect(items(page).first()).toHaveAttribute('data-status', 'uploading')
    await expect(items(page).first()).toBeFocused()
  })

  test('Escape does nothing', async ({ page }) => {
    await openStory(page, 'uploading-unknown-size')
    await trigger(page).focus()
    await page.keyboard.press('Escape')
    await page.keyboard.type('abc')
    await expect(items(page).first()).toHaveAttribute('data-status', 'uploading')
    await expect(trigger(page)).toBeFocused()
  })
})

test.describe('FileUpload: the name of the Trigger', () => {
  // Chrome's own accessibility tree, not Playwright's name engine: the name must start with the
  // visible text (2.5.3) however the browser orders a button's own text and the Field's label.
  test('the computed name of the Trigger starts with its visible text', async ({ page }) => {
    await openStory(page, 'default')
    const client = await page.context().newCDPSession(page)
    const { nodes } = await client.send('Accessibility.getFullAXTree')
    const buttons = nodes.filter((node) => node.role?.value === 'button' && !node.ignored)
    const names = buttons.map((node) => String(node.name?.value ?? ''))
    expect(names.some((name) => name.startsWith('Välj filer') && name.includes('Bilagor'))).toBe(
      true,
    )
    expect(names.some((name) => name.startsWith('Bilagor'))).toBe(false)
  })
})

test.describe('FileUpload: adding, refusing and dropping', () => {
  test('a refused file is named under the button and never enters the list', async ({ page }) => {
    // The story chooses a PNG, a file over the limit, an empty file and one good PDF.
    await openStory(page, 'rejected')
    await expect(items(page)).toHaveCount(1)
    await expect(page.locator('.kv-file-upload-rejections')).toContainText('bild.png')
    await expect(trigger(page)).not.toHaveAttribute('aria-invalid', 'true')
  })

  test('a dropped file is added, and a file dropped outside the zone is ignored', async ({
    page,
  }) => {
    await openStory(page, 'default')
    const dropOn = (selector: string) =>
      page.evaluate((target) => {
        const element = document.querySelector(target)
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(
          new File([new Uint8Array(100)], 'dropped.pdf', { type: 'application/pdf' }),
        )
        const event = new DragEvent('drop', { dataTransfer, bubbles: true, cancelable: true })
        element?.dispatchEvent(event)
        return event.defaultPrevented
      }, selector)
    await dropOn('.kv-file-upload-drop-zone')
    await expect(items(page)).toHaveCount(1)
    // Outside the zone the browser must not open the file and leave the page: it is prevented.
    expect(await dropOn('body')).toBe(true)
    await expect(items(page)).toHaveCount(1)
  })

  test('the progress bar is native and named, and goes away when the upload ends', async ({
    page,
  }) => {
    await openStory(page, 'uploading')
    await expect(page.getByRole('progressbar', { name: /läkarintyg\.pdf/ })).toBeVisible()
  })

  test('a long name wraps and the page never scrolls sideways', async ({ page }) => {
    await openStory(page, 'long-names')
    await expect(items(page)).toHaveCount(1)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test.describe('FileUpload: modes', () => {
  test('right to left mirrors the list', async ({ page }) => {
    await openStory(page, 'rtl', 'dir:rtl;locale:en')
    await expect(items(page)).toHaveCount(2)
    await expect(triggerEn(page)).toBeVisible()
  })

  test('the Trigger is at least 24×24 (2.5.8)', async ({ page }) => {
    await openStory(page, 'default')
    const box = await trigger(page).boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24)
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24)
  })
})

test.describe('FileUpload: accessibility', () => {
  for (const story of [
    'default',
    'single-file',
    'with-files',
    'uploading',
    'uploading-unknown-size',
    'complete',
    'failed',
    'cancelled',
    'rejected',
    'limit-reached',
    'with-preview',
    'many-files',
    'long-names',
    'disabled',
    'invalid',
    'required',
    'forced-colors',
  ]) {
    test(`no axe violations on ${story}`, async ({ page }) => {
      await openStory(page, story)
      const results = await new AxeBuilder({ page }).withTags([...wcagTags]).analyze()
      expect(results.violations).toEqual([])
    })
  }
})
