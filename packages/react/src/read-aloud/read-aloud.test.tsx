import type { ReadAloudEngine, ReadAloudHandlers, ReadAloudUtterance } from '@kvirn-ui/core'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { readAloud, readAnnouncements } from '@kvirn-ui/testing/read-aloud'
import { createRef, useRef } from 'react'
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { ReadAloud } from './read-aloud.tsx'
import { useReadAloud } from './use-read-aloud.ts'
import type { UseReadAloudOptions } from './use-read-aloud.ts'

// Contract: read-aloud.a11y.md. A fake engine is injected, so nothing is ever spoken.

const englishVoice = { voiceURI: 'en-one', name: 'English One', lang: 'en-US', localService: true }
const secondEnglishVoice = {
  voiceURI: 'en-two',
  name: 'English Two',
  lang: 'en-GB',
  localService: true,
}
const swedishVoice = { voiceURI: 'sv-one', name: 'Svenska', lang: 'sv-SE', localService: true }

function createFakeEngine({
  supported = true,
  voices = [englishVoice],
  allVoiceCount,
}: { supported?: boolean; voices?: (typeof englishVoice)[]; allVoiceCount?: number } = {}) {
  const spoken: ReadAloudUtterance[] = []
  let handlers: ReadAloudHandlers | undefined
  const cancel = vi.fn<() => void>()
  const engine: ReadAloudEngine = {
    isSupported: () => supported,
    getVoices: () => voices,
    ...(allVoiceCount === undefined ? {} : { getAllVoiceCount: () => allVoiceCount }),
    onVoicesChanged: () => () => {},
    speak: (utterance, nextHandlers) => {
      spoken.push(utterance)
      handlers = nextHandlers
    },
    cancel,
  }
  return {
    engine,
    spoken,
    cancel,
    endUtterance: () => handlers?.onEnd(),
    failUtterance: () => handlers?.onError(),
  }
}

type Fake = ReturnType<typeof createFakeEngine>

function Player({
  fake,
  withVoice = false,
  spacer = false,
  inner,
  locale,
  contentLang = 'en',
  ...options
}: {
  fake: Fake
  withVoice?: boolean
  spacer?: boolean
  inner?: { lang: string; text: string }
  locale?: string
  contentLang?: string
} & Partial<UseReadAloudOptions>) {
  const contentRef = useRef<HTMLElement>(null)
  return (
    <KvirnProvider {...(locale === undefined ? {} : { locale })}>
      <ReadAloud.Root contentRef={contentRef} engine={fake.engine} {...options}>
        <ReadAloud.Play />
        <ReadAloud.Previous />
        <ReadAloud.Next />
        <ReadAloud.Stop />
        <ReadAloud.Rate />
        {withVoice ? <ReadAloud.Voice /> : null}
        <ReadAloud.Status />
        <ReadAloud.SelectionTrigger />
      </ReadAloud.Root>
      <article ref={contentRef} lang={contentLang}>
        <p>First sentence.</p>
        {spacer ? <div style={{ height: 4000 }} /> : null}
        <p id="second">Second sentence.</p>
        {inner === undefined ? null : (
          <p id="inner" lang={inner.lang}>
            {inner.text}
          </p>
        )}
      </article>
    </KvirnProvider>
  )
}

const noVoiceMessage =
  'This device has no voice for English. You can add one in the device’s speech settings.'
const play = () => page.getByRole('button', { name: 'Listen', exact: true })
const pause = () => page.getByRole('button', { name: 'Pause' })
const listenToSelection = () => page.getByRole('button', { name: 'Listen to selected text' })
const previous = () => page.getByRole('button', { name: 'Previous sentence' })
const next = () => page.getByRole('button', { name: 'Next sentence' })
const stop = () => page.getByRole('button', { name: 'Stop' })
const politeRegion = () =>
  page.elementLocator(document.querySelector('output[aria-live="polite"]') as HTMLElement)
const assertiveRegion = () => page.getByRole('alert')
const highlightedText = () => {
  const highlight = CSS.highlights.get('kv-read-aloud')
  return highlight === undefined ? undefined : [...highlight].map(String).join('')
}

async function selectSecondSentence() {
  const range = document.createRange()
  range.selectNodeContents(document.querySelector('#second') as Element)
  const selection = document.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  await expect.element(listenToSelection()).toBeVisible()
}

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  consoleWarn.mockRestore()
  document.getSelection()?.removeAllRanges()
  CSS.highlights.delete('kv-read-aloud')
})

describe('names and roles', () => {
  test('the root is a group named by readAloud.label', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await expect
      .element(page.getByRole('group', { name: 'Listen to this text' }))
      .toHaveAttribute('data-status', 'idle')
  })

  test('the play name goes Listen, Pause, Listen', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await expect.element(play()).toBeVisible()
    await userEvent.click(play())
    await expect.element(pause()).toHaveAttribute('data-playing', '')
    await userEvent.click(pause())
    await expect.element(play()).toBeVisible()
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'paused')
  })

  test('a per-instance message overrides the play name', async () => {
    await render(<Player fake={createFakeEngine()} messages={{ play: 'Lyssna nu' }} />)
    await expect.element(page.getByRole('button', { name: 'Lyssna nu' })).toBeVisible()
  })

  test('the status shows the sentence position while reading', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await expect.element(page.getByText('Sentence 1 of 2')).toBeVisible()
  })

  test('the status says where it will continue while paused', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await userEvent.click(pause())
    await expect.element(page.getByText('Paused at sentence 1 of 2')).toBeVisible()
  })

  test('the rate options are formatted numbers with a times sign', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await expect.element(page.getByRole('option', { name: '1.5×' })).toBeInTheDocument()
  })
})

describe('keyboard', () => {
  test('Tab moves through Play, Previous, Next, Stop and Speed', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.keyboard('{Tab}')
    await expect.element(play()).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(previous()).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(next()).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(stop()).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByLabelText('Speed')).toHaveFocus()
  })

  test('Tab also reaches the voice select when there are two voices', async () => {
    await render(
      <Player fake={createFakeEngine({ voices: [englishVoice, secondEnglishVoice] })} withVoice />,
    )
    await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}{Tab}{Tab}')
    await expect.element(page.getByLabelText('Voice')).toHaveFocus()
  })

  test('Shift+Tab moves focus back to the previous control', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.keyboard('{Tab}{Tab}')
    await expect.element(previous()).toHaveFocus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(play()).toHaveFocus()
  })

  test('Enter on Play starts reading and keeps focus', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.keyboard('{Tab}{Enter}')
    await expect.element(pause()).toHaveFocus()
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual(['First sentence.'])
  })

  test('Space on Play starts reading and keeps focus', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.keyboard('{Tab} ')
    await expect.element(pause()).toHaveFocus()
    expect(fake.spoken).toHaveLength(1)
  })

  test('Escape inside the player stops reading and keeps focus', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.keyboard('{Tab}{Enter}')
    await userEvent.keyboard('{Escape}')
    await expect.element(play()).toHaveFocus()
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'idle')
  })

  test('Enter on Previous, Next and Stop while idle does nothing and keeps focus', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.keyboard('{Tab}')
    for (const control of [previous(), next(), stop()]) {
      await userEvent.keyboard('{Tab}{Enter}')
      await expect.element(control).toHaveFocus()
    }
    expect(fake.spoken).toHaveLength(0)
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'idle')
  })

  test('Escape while idle is not prevented', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.keyboard('{Tab}')
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    play().element().dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('controls', () => {
  test('Previous, Next and Stop are aria-disabled but focusable while idle', async () => {
    await render(<Player fake={createFakeEngine()} />)
    for (const control of [previous(), next(), stop()]) {
      await expect.element(control).toHaveAttribute('aria-disabled', 'true')
    }
  })

  test('Previous, Next and Stop are active while reading', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    for (const control of [previous(), next(), stop()]) {
      await expect.element(control).not.toHaveAttribute('aria-disabled')
    }
  })

  test('Next reads the next sentence and Stop ends the reading', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    await userEvent.click(next())
    expect(fake.spoken.at(-1)?.text).toBe('Second sentence.')
    await userEvent.click(stop())
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'idle')
    await expect.element(page.getByText('Sentence 2 of 2')).not.toBeInTheDocument()
  })

  test('resume after pause restarts the sentence', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    await userEvent.click(pause())
    await userEvent.click(play())
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual([
      'First sentence.',
      'First sentence.',
    ])
  })

  test('a speed change is applied to what is spoken', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    await userEvent.selectOptions(page.getByLabelText('Speed'), '1.5')
    expect(fake.spoken.at(-1)?.rate).toBe(1.5)
  })

  test('a voice change is applied to what is spoken', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, secondEnglishVoice] })
    await render(<Player fake={fake} withVoice />)
    await userEvent.click(play())
    await userEvent.selectOptions(page.getByLabelText('Voice'), 'en-two')
    expect(fake.spoken.at(-1)?.voiceURI).toBe('en-two')
  })

  test('the voice select is not rendered for a single voice', async () => {
    await render(<Player fake={createFakeEngine()} withVoice />)
    await expect.element(page.getByLabelText('Voice')).not.toBeInTheDocument()
  })

  test('only voices for the content language are listed', async () => {
    await render(
      <Player
        fake={createFakeEngine({ voices: [englishVoice, swedishVoice, secondEnglishVoice] })}
        withVoice
      />,
    )
    await expect.element(page.getByRole('option', { name: 'Svenska' })).not.toBeInTheDocument()
    await expect.element(page.getByRole('option', { name: 'English Two' })).toBeInTheDocument()
  })

  test('the language option picks the voice', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, swedishVoice] })
    await render(<Player fake={fake} lang="sv" />)
    await userEvent.click(play())
    expect(fake.spoken[0]).toMatchObject({ language: 'sv', voiceURI: 'sv-one' })
  })

  test('onStatusChange reports the status', async () => {
    const onStatusChange = vi.fn<(status: string) => void>()
    await render(<Player fake={createFakeEngine()} onStatusChange={onStatusChange} />)
    await userEvent.click(play())
    await expect.poll(() => onStatusChange.mock.calls).toEqual([['playing']])
  })
})

describe('reading', () => {
  test('speak is called synchronously in the click', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    const button = play().element() as HTMLButtonElement
    button.click()
    expect(fake.spoken).toHaveLength(1)
  })

  test('nothing is read on render', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    expect(fake.spoken).toHaveLength(0)
  })

  test('unmounting cancels the speech', async () => {
    const fake = createFakeEngine()
    const { unmount } = await render(<Player fake={fake} />)
    await userEvent.click(play())
    const before = fake.cancel.mock.calls.length
    await unmount()
    expect(fake.cancel.mock.calls.length).toBeGreaterThan(before)
  })

  test('pagehide cancels the speech', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    const before = fake.cancel.mock.calls.length
    window.dispatchEvent(new Event('pagehide'))
    expect(fake.cancel.mock.calls.length).toBeGreaterThan(before)
  })
})

describe('selection', () => {
  test('a selection inside the content renames Play and reads only the selection', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await selectSecondSentence()
    await userEvent.click(listenToSelection())
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual(['Second sentence.'])
  })

  test('the selection survives Tab to Play', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await selectSecondSentence()
    await userEvent.keyboard('{Tab}')
    await expect.element(listenToSelection()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual(['Second sentence.'])
  })

  test('reading a selection collapses it, so the highlight shows', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectSecondSentence()
    await userEvent.click(listenToSelection())
    await expect.element(pause()).toBeVisible()
    expect(document.getSelection()?.isCollapsed).toBe(true)
    expect(highlightedText()).toBe('Second sentence.')
  })

  test('a selection outside the content is not captured', async () => {
    await render(<Player fake={createFakeEngine()} />)
    const range = document.createRange()
    range.selectNodeContents(page.getByRole('group').element())
    document.getSelection()?.addRange(range)
    await new Promise((resolve) => setTimeout(resolve, 50))
    await expect.element(play()).toBeVisible()
  })

  test('the selection is gone when it collapses outside the player', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectSecondSentence()
    document.getSelection()?.removeAllRanges()
    await expect.element(play()).toBeVisible()
  })
})

describe('selection trigger', () => {
  const triggerElement = () => document.querySelector<HTMLElement>('[popover]')

  async function selectWithPointer() {
    const paragraph = document.querySelector('#second') as Element
    const range = document.createRange()
    range.selectNodeContents(paragraph)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)
    paragraph.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
  }

  test('is shown after a pointer selection and named playSelection', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    expect(triggerElement()?.textContent).toBe('Listen to selected text')
    expect(triggerElement()?.matches(':popover-open')).toBe(true)
  })

  test('is not shown after a keyboard selection', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectSecondSentence()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(triggerElement()).toBeNull()
  })

  test('is not in the Tab order and is not hidden from assistive technology', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    expect(triggerElement()?.getAttribute('tabindex')).toBe('-1')
    expect(triggerElement()?.closest('[aria-hidden="true"]')).toBeNull()
  })

  test('pointerdown keeps the selection and focus', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
    triggerElement()?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(document.getSelection()?.isCollapsed).toBe(false)
  })

  test('click reads only the selection, collapses it and dismisses the trigger', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    triggerElement()?.click()
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual(['Second sentence.'])
    await expect.poll(triggerElement).toBeNull()
    expect(document.getSelection()?.isCollapsed).toBe(true)
  })

  test('is dismissed when the selection collapses', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    document.getSelection()?.removeAllRanges()
    await expect.poll(triggerElement).toBeNull()
  })

  test('is dismissed by Escape', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    await userEvent.keyboard('{Escape}')
    await expect.poll(triggerElement).toBeNull()
  })

  test('is dismissed on scroll', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    window.dispatchEvent(new Event('scroll'))
    await expect.poll(triggerElement).toBeNull()
  })

  test('is dismissed on resize', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    window.dispatchEvent(new Event('resize'))
    await expect.poll(triggerElement).toBeNull()
  })

  test('is dismissed by Stop', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    await userEvent.click(stop())
    await expect.poll(triggerElement).toBeNull()
  })

  test('is removed on unmount', async () => {
    const { unmount } = await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    await unmount()
    expect(triggerElement()).toBeNull()
  })

  test('has no axe violations while shown', async () => {
    const { container } = await render(<Player fake={createFakeEngine()} />)
    await selectWithPointer()
    await expect.poll(triggerElement).not.toBeNull()
    await expectNoA11yViolations(container)
  })
})

describe('highlight', () => {
  test('the highlight follows the sentence being read', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    await expect.poll(highlightedText).toBe('First sentence.')
    fake.endUtterance()
    await expect.poll(highlightedText).toBe('Second sentence.')
  })

  test('the highlight is cleared on stop', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await expect.poll(highlightedText).toBe('First sentence.')
    await userEvent.click(stop())
    await expect.poll(highlightedText).toBeUndefined()
  })

  test('the highlight is cleared on unmount', async () => {
    const { unmount } = await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await expect.poll(highlightedText).toBe('First sentence.')
    await unmount()
    expect(highlightedText()).toBeUndefined()
  })

  test('highlight false sets no highlight', async () => {
    await render(<Player fake={createFakeEngine()} highlight={false} />)
    await userEvent.click(play())
    await expect.element(pause()).toBeVisible()
    expect(highlightedText()).toBeUndefined()
  })
})

describe('errors and announcements', () => {
  test('announces nothing on play, pause, next, stop or the end of the content', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    await userEvent.click(pause())
    await userEvent.click(play())
    await userEvent.click(next())
    fake.endUtterance()
    await userEvent.click(play())
    await userEvent.click(stop())
    await expect.element(play()).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(assertiveRegion()).toHaveTextContent('')
  })

  test('no voice for the language shows the text, announces it once and speaks nothing', async () => {
    const fake = createFakeEngine({ voices: [swedishVoice] })
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    const message = noVoiceMessage
    await expect.element(page.getByText(message, { exact: true }).first()).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent(message)
    expect(fake.spoken).toHaveLength(0)
  })

  test('an unsupported browser shows only the group and the status text', async () => {
    await render(<Player fake={createFakeEngine({ supported: false })} />)
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'unsupported')
    await expect.element(page.getByText('This browser can’t read text aloud.')).toBeVisible()
    await expect.element(page.getByRole('button')).not.toBeInTheDocument()
    await expect.element(page.getByRole('combobox')).not.toBeInTheDocument()
  })
})

describe('useReadAloud', () => {
  test('gives prop objects for your own markup', async () => {
    const fake = createFakeEngine()
    function Own() {
      const contentRef = useRef<HTMLParagraphElement>(null)
      const reader = useReadAloud({ contentRef, engine: fake.engine })
      return (
        <KvirnProvider>
          <div {...reader.rootProps}>
            <button {...reader.playProps}>{reader.playLabel}</button>
          </div>
          <p ref={contentRef} lang="en">
            Hello there.
          </p>
        </KvirnProvider>
      )
    }
    await render(<Own />)
    await userEvent.click(play())
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual(['Hello there.'])
  })
})

describe('accessibility', () => {
  test('has no axe violations idle, playing, paused, without a voice and unsupported', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, secondEnglishVoice] })
    const { container } = await render(<Player fake={fake} withVoice />)
    await expectNoA11yViolations(container)
    await userEvent.click(play())
    await expect.element(pause()).toBeVisible()
    await expectNoA11yViolations(container)
    await userEvent.click(pause())
    await expect.element(play()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('has no axe violations without a voice', async () => {
    const { container } = await render(<Player fake={createFakeEngine({ voices: [] })} />)
    await userEvent.click(play())
    await expect.element(page.getByText(noVoiceMessage).first()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('has no axe violations when unsupported', async () => {
    const { container } = await render(<Player fake={createFakeEngine({ supported: false })} />)
    await expect.element(page.getByText('This browser can’t read text aloud.')).toBeVisible()
    await expectNoA11yViolations(container)
  })
})

describe('read aloud', () => {
  const firstFive = (phrases: string[]) => phrases.slice(0, 5)

  test('idle reading order: the group, Listen, the three disabled buttons, then the content', async () => {
    const { container } = await render(<Player fake={createFakeEngine()} />)
    const phrases = await readAloud(container)
    expect(firstFive(phrases)).toEqual([
      'group, Listen to this text',
      'button, Listen',
      'button, Previous sentence, disabled',
      'button, Next sentence, disabled',
      'button, Stop, disabled',
    ])
    expect(phrases).toContain('First sentence.')
  })

  test('the Play name reads Listen, then Pause, then Listen after pause', async () => {
    const { container } = await render(<Player fake={createFakeEngine()} />)
    expect((await readAloud(container))[1]).toBe('button, Listen')
    await userEvent.click(play())
    expect((await readAloud(container))[1]).toBe('button, Pause')
    expect(await readAloud(container)).toContain('Sentence 1 of 2')
    await userEvent.click(pause())
    expect((await readAloud(container))[1]).toBe('button, Listen')
    expect(await readAloud(container)).toContain('Paused at sentence 1 of 2')
  })

  test('the Play name reads Listen to selected text while a selection is captured', async () => {
    const { container } = await render(<Player fake={createFakeEngine()} />)
    await selectSecondSentence()
    expect((await readAloud(container))[1]).toBe('button, Listen to selected text')
  })

  test('no voice is announced politely with the language and the next step', async () => {
    const { container } = await render(
      <Player fake={createFakeEngine({ voices: [swedishVoice] })} />,
    )
    const announced = await readAnnouncements(container, () =>
      (play().element() as HTMLButtonElement).click(),
    )
    expect(announced).toEqual([`polite: ${noVoiceMessage}`])
  })

  test('a speech error is announced politely', async () => {
    const fake = createFakeEngine()
    const { container } = await render(<Player fake={fake} />)
    await userEvent.click(play())
    const announced = await readAnnouncements(container, () => fake.failUtterance())
    expect(announced).toEqual(['polite: The text could not be read aloud. Try again.'])
  })

  test('play, pause and stop announce nothing', async () => {
    const { container } = await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await userEvent.click(pause())
    await userEvent.click(play())
    await userEvent.click(stop())
    await expect.element(play()).toBeVisible()
    await expect(readAnnouncements(container, () => {}, { timeout: 200 })).rejects.toThrow(
      'No live-region announcement',
    )
  })
})

describe('errors', () => {
  const speechErrorMessage = 'The text could not be read aloud. Try again.'

  test('a speech error shows the text and announces it politely once', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    fake.failUtterance()
    await expect.element(page.getByText(speechErrorMessage).first()).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent(speechErrorMessage)
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'idle')
  })

  test('a speech error leaves no axe violations', async () => {
    const fake = createFakeEngine()
    const { container } = await render(<Player fake={fake} />)
    await userEvent.click(play())
    fake.failUtterance()
    await expect.element(page.getByText(speechErrorMessage).first()).toBeVisible()
    await expectNoA11yViolations(container)
  })

  test('no voice is announced on every Listen press', async () => {
    const { container } = await render(
      <Player fake={createFakeEngine({ voices: [swedishVoice] })} />,
    )
    const first = await readAnnouncements(container, () =>
      (play().element() as HTMLButtonElement).click(),
    )
    expect(first).toHaveLength(1)
    await new Promise((resolve) => setTimeout(resolve, 3100))
    const second = await readAnnouncements(container, () =>
      (play().element() as HTMLButtonElement).click(),
    )
    expect(second).toHaveLength(1)
  })
})

describe('own words', () => {
  test('content that contains the player speaks none of its words', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, secondEnglishVoice] })
    function Inside() {
      const contentRef = useRef<HTMLElement>(null)
      return (
        <KvirnProvider>
          <article ref={contentRef} lang="en">
            <ReadAloud.Root contentRef={contentRef} engine={fake.engine}>
              <ReadAloud.Play />
              <ReadAloud.Rate />
              <ReadAloud.Voice />
              <ReadAloud.Status />
              <ReadAloud.SelectionTrigger />
            </ReadAloud.Root>
            <p>Only this.</p>
          </article>
        </KvirnProvider>
      )
    }
    await render(<Inside />)
    await userEvent.click(play())
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual(['Only this.'])
  })
})

describe('status', () => {
  test('the status is findable by role and silent', async () => {
    await render(<Player fake={createFakeEngine()} />)
    const status = document.querySelector('.kv-read-aloud-status')
    expect(status?.getAttribute('role')).toBe('status')
    expect(status?.getAttribute('aria-live')).toBe('off')
  })

  test('as changes the Status to a paragraph or a div, and keeps role, class and ref', async () => {
    const ref = createRef<HTMLElement>()
    await render(
      <ReadAloud.Root contentRef={createRef<HTMLElement>()} engine={createFakeEngine().engine}>
        <ReadAloud.Status as="p" ref={ref} className="egen" data-testid="paragraph" />
        <ReadAloud.Status as="div" data-testid="division" />
      </ReadAloud.Root>,
    )
    const paragraph = page.getByTestId('paragraph').element()
    expect(paragraph.tagName).toBe('P')
    expect(paragraph.getAttribute('role')).toBe('status')
    expect(paragraph.className).toBe('egen kv-read-aloud-status')
    expect(ref.current).toBe(paragraph)
    expect(page.getByTestId('division').element().tagName).toBe('DIV')
  })

  test('an element outside the Status list warns once and renders a span', async () => {
    const notAllowed = 'h2' as 'span'
    await render(
      <ReadAloud.Root contentRef={createRef<HTMLElement>()} engine={createFakeEngine().engine}>
        <ReadAloud.Status as={notAllowed} data-testid="status" />
      </ReadAloud.Root>,
    )
    expect(page.getByTestId('status').element().tagName).toBe('SPAN')
    expect(
      consoleWarn.mock.calls.filter((call) => String(call[0]).includes('ReadAloud.Status as="h2"')),
    ).toHaveLength(1)
  })
})

describe('language', () => {
  test('content without a lang uses the provider locale', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, swedishVoice] })
    const documentLanguage = document.documentElement.getAttribute('lang')
    document.documentElement.removeAttribute('lang')
    onTestFinished(() => {
      if (documentLanguage !== null) {
        document.documentElement.setAttribute('lang', documentLanguage)
      }
    })
    const { container } = await render(<Player fake={fake} locale="sv" contentLang="" />)
    container.querySelector('article')?.removeAttribute('lang')
    await userEvent.click(page.getByRole('button', { name: 'Listen' }))
    expect(fake.spoken[0]).toMatchObject({ voiceURI: 'sv-one' })
  })
})

describe('scroll', () => {
  afterEach(() => vi.restoreAllMocks())

  async function readSecondSentence(prefersReducedMotion: boolean) {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) =>
        ({
          matches: prefersReducedMotion,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )
    const scrollIntoView = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => {})
    await render(<Player fake={createFakeEngine()} spacer />)
    await userEvent.click(play())
    await userEvent.click(next())
    await expect.poll(highlightedText).toBe('Second sentence.')
    return scrollIntoView
  }

  test('follows a sentence that is out of view', async () => {
    const scrollIntoView = await readSecondSentence(false)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  test('does not scroll under prefers-reduced-motion', async () => {
    const scrollIntoView = await readSecondSentence(true)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})

describe('remote voices', () => {
  function stubSpeechSynthesis() {
    const spoken: { text: string; voice: { voiceURI: string } | null }[] = []
    const remoteVoice = {
      voiceURI: 'remote-en',
      name: 'Remote',
      lang: 'en-US',
      localService: false,
    }
    class FakeUtterance {
      voice: { voiceURI: string } | null = null
      lang = ''
      rate = 1
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(public text: string) {}
    }
    const synthesis = {
      getVoices: () => [remoteVoice],
      addEventListener: () => {},
      removeEventListener: () => {},
      speak: (utterance: FakeUtterance) => spoken.push(utterance),
      cancel: () => {},
    }
    const original = {
      synthesis: Object.getOwnPropertyDescriptor(window, 'speechSynthesis'),
      utterance: Object.getOwnPropertyDescriptor(window, 'SpeechSynthesisUtterance'),
    }
    Object.defineProperty(window, 'speechSynthesis', { value: synthesis, configurable: true })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: FakeUtterance,
      configurable: true,
    })
    onTestFinished(() => {
      for (const [name, descriptor] of [
        ['speechSynthesis', original.synthesis],
        ['SpeechSynthesisUtterance', original.utterance],
      ] as const) {
        if (descriptor === undefined) {
          Reflect.deleteProperty(window, name)
        } else {
          Object.defineProperty(window, name, descriptor)
        }
      }
    })
    return spoken
  }

  function Reader({ allowRemoteVoices }: { allowRemoteVoices: boolean }) {
    const contentRef = useRef<HTMLElement>(null)
    return (
      <KvirnProvider>
        <ReadAloud.Root contentRef={contentRef} allowRemoteVoices={allowRemoteVoices}>
          <ReadAloud.Play />
          <ReadAloud.Status />
        </ReadAloud.Root>
        <article ref={contentRef} lang="en">
          <p>First sentence.</p>
        </article>
      </KvirnProvider>
    )
  }

  test('allowRemoteVoices switched on after mount makes a remote voice usable', async () => {
    const spoken = stubSpeechSynthesis()
    const { rerender } = await render(<Reader allowRemoteVoices={false} />)
    await userEvent.click(play())
    await expect.element(page.getByText(noVoiceMessage).first()).toBeVisible()
    expect(spoken).toHaveLength(0)
    await rerender(<Reader allowRemoteVoices />)
    await userEvent.click(play())
    await expect.element(page.getByRole('button', { name: 'Pause' })).toBeVisible()
    expect(spoken.map((utterance) => utterance.voice?.voiceURI)).toEqual(['remote-en'])
    await expect.element(page.getByText(noVoiceMessage)).not.toBeInTheDocument()
  })
})

describe('developer warnings', () => {
  const warnedWith = (text: string) =>
    consoleWarn.mock.calls.filter((call) => String(call[0]).includes(text))

  test('warns once that the browser has no Web Speech API', async () => {
    await render(<Player fake={createFakeEngine({ supported: false })} />)
    await expect.poll(() => warnedWith('no Web Speech API')).toHaveLength(1)
    await render(<Player fake={createFakeEngine({ supported: false })} />)
    expect(warnedWith('no Web Speech API')).toHaveLength(1)
  })

  test('warns once with the counts when no voice is usable', async () => {
    const fake = createFakeEngine({ voices: [], allVoiceCount: 3 })
    await render(<Player fake={fake} />)
    await userEvent.click(play())
    await userEvent.click(play())
    await expect.poll(() => warnedWith('no usable voice')).toHaveLength(1)
    const message = String(warnedWith('no usable voice')[0]?.[0])
    expect(message).toContain('reports 3 voice(s), 0 are offered')
    expect(message).toContain('allowRemoteVoices')
    expect(message).toContain('speech-dispatcher and espeak-ng')
  })

  test('warns once per language with the voice languages that exist', async () => {
    await render(<Player fake={createFakeEngine({ voices: [swedishVoice] })} />)
    await userEvent.click(play())
    await userEvent.click(play())
    await expect.poll(() => warnedWith('no voice for the language')).toHaveLength(1)
    const message = String(warnedWith('no voice for the language')[0]?.[0])
    expect(message).toContain('"en"')
    expect(message).toContain('sv-SE')
    expect(warnedWith('no usable voice')).toHaveLength(0)
  })

  test('warns about nothing when everything works', async () => {
    await render(<Player fake={createFakeEngine()} />)
    await userEvent.click(play())
    await expect.element(pause()).toBeVisible()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

describe('languages inside the content', () => {
  const swedishParagraph = { lang: 'sv', text: 'Svensk mening.' }
  const swedishNoVoiceMessage =
    'This device has no voice for Swedish. You can add one in the device’s speech settings.'

  test('each sentence is spoken with a voice for its own language', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, swedishVoice] })
    await render(<Player fake={fake} inner={swedishParagraph} />)
    await userEvent.click(play())
    fake.endUtterance()
    fake.endUtterance()
    await expect.poll(() => fake.spoken.length).toBe(3)
    expect(fake.spoken.map(({ text, language, voiceURI }) => [text, language, voiceURI])).toEqual([
      ['First sentence.', 'en', 'en-one'],
      ['Second sentence.', 'en', 'en-one'],
      ['Svensk mening.', 'sv', 'sv-one'],
    ])
  })

  test('a sentence in a language with no voice stops the reading and names the language', async () => {
    const fake = createFakeEngine({ voices: [englishVoice] })
    await render(<Player fake={fake} inner={swedishParagraph} />)
    await userEvent.click(play())
    fake.endUtterance()
    fake.endUtterance()
    await expect.element(page.getByText(swedishNoVoiceMessage).first()).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent(swedishNoVoiceMessage)
    expect(fake.spoken.map((utterance) => utterance.text)).toEqual([
      'First sentence.',
      'Second sentence.',
    ])
    await expect.element(page.getByRole('group')).toHaveAttribute('data-status', 'idle')
  })

  test('a selection inside the Swedish paragraph is spoken with the Swedish voice', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, swedishVoice] })
    await render(<Player fake={fake} inner={swedishParagraph} />)
    const range = document.createRange()
    range.selectNodeContents(document.querySelector('#inner') as Element)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)
    await expect.element(listenToSelection()).toBeVisible()
    await userEvent.click(listenToSelection())
    expect(fake.spoken[0]).toMatchObject({
      text: 'Svensk mening.',
      language: 'sv',
      voiceURI: 'sv-one',
    })
  })

  test('the lang option is the default for unmarked text and an inner lang attribute wins', async () => {
    const fake = createFakeEngine({ voices: [englishVoice, swedishVoice] })
    await render(
      <Player
        fake={fake}
        lang="sv"
        contentLang=""
        inner={{ lang: 'en', text: 'English inner.' }}
      />,
    )
    await userEvent.click(play())
    fake.endUtterance()
    fake.endUtterance()
    await expect.poll(() => fake.spoken.length).toBe(3)
    expect(fake.spoken.map(({ language, voiceURI }) => [language, voiceURI])).toEqual([
      ['sv', 'sv-one'],
      ['sv', 'sv-one'],
      ['en', 'en-one'],
    ])
  })
})

describe('selection with real pointer input', () => {
  const triggerElement = () => document.querySelector<HTMLElement>('[popover]')
  const spokenTexts = (fake: Fake) => fake.spoken.map((utterance) => utterance.text)

  test('a double-clicked word is the only thing read', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    // Near the left edge, so the double-click lands on the word "First" and not on the space after it.
    await userEvent.dblClick(page.getByText('First sentence.'), { position: { x: 4, y: 4 } })
    await expect.element(listenToSelection().first()).toBeVisible()
    await userEvent.click(listenToSelection().first())
    expect(spokenTexts(fake)).toHaveLength(1)
    expect(spokenTexts(fake)[0]).toMatch(/^(First|sentence\.?)$/)
  })

  test('a triple-clicked paragraph is read as that paragraph', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.tripleClick(page.getByText('Second sentence.'))
    await expect.element(listenToSelection().first()).toBeVisible()
    await userEvent.click(listenToSelection().first())
    expect(spokenTexts(fake)).toEqual(['Second sentence.'])
  })

  test('a drag across two paragraphs reads both and nothing else', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.dragAndDrop(
      page.getByText('First sentence.'),
      page.getByText('Second sentence.'),
    )
    await expect.element(listenToSelection().first()).toBeVisible()
    await userEvent.click(listenToSelection().first())
    expect(spokenTexts(fake).join(' ')).toContain('Second')
    expect(spokenTexts(fake)[0]).not.toBe('')
  })

  test('clicking Listen with the mouse after a mouse selection reads the selection', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.tripleClick(page.getByText('Second sentence.'))
    await expect
      .element(page.getByRole('button', { name: 'Listen to selected text' }).first())
      .toBeVisible()
    await userEvent.click(page.getByRole('button', { name: 'Listen to selected text' }).first())
    expect(spokenTexts(fake)).toEqual(['Second sentence.'])
  })

  test('the selection trigger appears after a mouse selection and reads only it', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    await userEvent.tripleClick(page.getByText('Second sentence.'))
    await expect.poll(triggerElement).not.toBeNull()
    await userEvent.click(page.elementLocator(triggerElement() as HTMLElement))
    expect(spokenTexts(fake)).toEqual(['Second sentence.'])
  })

  test('a Shift+Arrow selection then Tab to Listen reads the selection', async () => {
    const fake = createFakeEngine()
    await render(<Player fake={fake} />)
    const paragraph = document.querySelector('#second') as HTMLElement
    const range = document.createRange()
    range.setStart(paragraph.firstChild as Text, 0)
    range.collapse(true)
    document.getSelection()?.removeAllRanges()
    document.getSelection()?.addRange(range)
    document.getSelection()?.modify('extend', 'forward', 'word')
    await expect.element(listenToSelection()).toBeVisible()
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    expect(spokenTexts(fake)).toHaveLength(1)
    expect(spokenTexts(fake)[0]).toMatch(/^Second/)
  })
})
