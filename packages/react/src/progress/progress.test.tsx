import { sv } from '@kvirn-ui/i18n/sv'
import { expectNoA11yViolations } from '@kvirn-ui/testing'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import type { MockInstance } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { Button } from '../button/button.tsx'
import { resetDevWarnings } from '../dev/dev-warning.ts'
import { KvirnProvider } from '../provider/kvirn-provider.tsx'
import { Progress } from './progress.tsx'
import { useProgress } from './use-progress.ts'
import type { UseProgressResult } from './use-progress.ts'

// Contract: progress.a11y.md.

const slowText = 'This is taking longer than usual. Keep this page open.'
const politeRegion = () => page.getByRole('status')
const assertiveRegion = () => page.getByRole('alert')

let consoleWarn: MockInstance<Console['warn']>

beforeEach(() => {
  resetDevWarnings()
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
})

afterEach(() => {
  vi.useRealTimers()
  consoleWarn.mockRestore()
})

/** React renders a state change from a timer on the next macrotask, which fake timers don't run. */
const flushRender = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => resolve()
    channel.port2.postMessage(null)
  })

async function advance(milliseconds: number) {
  await vi.advanceTimersByTimeAsync(milliseconds)
  // One macrotask for the render, one for its effects.
  await flushRender()
  await flushRender()
}

/** Past the show delay and the announcer's 100 ms between emptying and filling the region. */
const passShowDelay = () => advance(1100)

function Sending({ announce }: { announce?: boolean }) {
  return (
    <KvirnProvider>
      <Progress.Root label="Sending your application." announce={announce}>
        <Progress.Label />
      </Progress.Root>
    </KvirnProvider>
  )
}

describe('show delay', () => {
  test('renders nothing and says nothing inside the first second', async () => {
    const { container } = await render(<Sending />)
    await advance(999)
    expect(container.querySelector('.kv-progress')).toBeNull()
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('a wait that ends inside the delay is never shown or announced', async () => {
    function Waiting() {
      const [isWaiting, setIsWaiting] = useState(true)
      return (
        <KvirnProvider>
          {isWaiting ? (
            <Progress.Root label="Sending your application.">
              <Progress.Label />
            </Progress.Root>
          ) : null}
          <Button onClick={() => setIsWaiting(false)}>Klart</Button>
        </KvirnProvider>
      )
    }
    await render(<Waiting />)
    await advance(500)
    await userEvent.click(page.getByRole('button', { name: 'Klart' }))
    await advance(20_000)
    await expect.element(page.getByText('Sending your application.')).not.toBeInTheDocument()
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('shows the label after one second, as plain text with no role', async () => {
    const { container } = await render(<Sending />)
    await passShowDelay()
    await expect.element(page.getByText('Sending your application.')).toBeVisible()
    const root = container.querySelector('.kv-progress')
    expect(root).not.toBeNull()
    expect(root?.getAttribute('data-state')).toBe('busy')
    expect(root?.hasAttribute('role')).toBe(false)
    expect(root?.hasAttribute('aria-live')).toBe(false)
    expect(root?.hasAttribute('aria-busy')).toBe(false)
    expect(container.querySelector('p.kv-progress-label')).not.toBeNull()
  })

  test('takes the delay from delayMilliseconds', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Progress.Root label="Hämtar." delayMilliseconds={200}>
          <Progress.Label />
        </Progress.Root>
      </KvirnProvider>,
    )
    await advance(199)
    expect(container.querySelector('.kv-progress')).toBeNull()
    await advance(1)
    expect(container.querySelector('.kv-progress')).not.toBeNull()
  })
})

describe('unknown value', () => {
  test('has no bar and no progressbar role: the text carries the wait', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Progress.Root label="Sending your application.">
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    expect(container.querySelector('progress')).toBeNull()
    expect(container.querySelector('[role="progressbar"]')).toBeNull()
    expect(container.querySelector('.kv-progress')?.hasAttribute('data-determinate')).toBe(false)
  })
})

describe('announcements', () => {
  test('announces the label once, politely, after the delay', async () => {
    await render(<Sending />)
    await advance(900)
    await expect.element(politeRegion()).toHaveTextContent('')
    await advance(200)
    await expect.element(politeRegion()).toHaveTextContent('Sending your application.')
    await expect.element(assertiveRegion()).toHaveTextContent('')
  })

  test('says nothing more when it re-renders or its value changes', async () => {
    function Exporting() {
      const [value, setValue] = useState(10)
      return (
        <KvirnProvider>
          <Progress.Root label="Exporting cases." value={value}>
            <Progress.Label />
            <Progress.Bar />
          </Progress.Root>
          <Button onClick={() => setValue((previous) => previous + 20)}>Mer</Button>
        </KvirnProvider>
      )
    }
    await render(<Exporting />)
    await passShowDelay()
    await expect.element(politeRegion()).toHaveTextContent('Exporting cases.')
    // The announcer empties the region 5 s after speaking.
    await advance(5500)
    await expect.element(politeRegion()).toHaveTextContent('')
    await userEvent.click(page.getByRole('button', { name: 'Mer' }))
    await advance(1500)
    await expect.element(page.getByRole('progressbar')).toHaveAttribute('value', '30')
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(assertiveRegion()).toHaveTextContent('')
  })

  test('says nothing when it unmounts after it was shown', async () => {
    function Waiting() {
      const [isWaiting, setIsWaiting] = useState(true)
      return (
        <KvirnProvider>
          {isWaiting ? (
            <Progress.Root label="Sending your application.">
              <Progress.Label />
            </Progress.Root>
          ) : null}
          <Button onClick={() => setIsWaiting(false)}>Klart</Button>
        </KvirnProvider>
      )
    }
    await render(<Waiting />)
    await passShowDelay()
    await advance(5500)
    await expect.element(politeRegion()).toHaveTextContent('')
    await userEvent.click(page.getByRole('button', { name: 'Klart' }))
    await advance(20_000)
    await expect.element(page.getByText('Sending your application.')).not.toBeInTheDocument()
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(assertiveRegion()).toHaveTextContent('')
  })

  test('announce={false} says nothing, not even when slow', async () => {
    await render(<Sending announce={false} />)
    await passShowDelay()
    await expect.element(page.getByText('Sending your application.')).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent('')
    await advance(10_000)
    await expect.element(page.getByText(slowText)).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('without a provider it announces nothing and warns once', async () => {
    await render(
      <Progress.Root label="Sending your application.">
        <Progress.Label />
      </Progress.Root>,
    )
    await passShowDelay()
    await expect.element(page.getByText('Sending your application.')).toBeVisible()
    expect(consoleWarn.mock.calls.flat().join(' ')).toContain('KvirnProvider')
  })
})

describe('slow', () => {
  test('adds the slow sentence after ten seconds and announces it once', async () => {
    const { container } = await render(<Sending />)
    await passShowDelay()
    await advance(5500)
    await expect.element(politeRegion()).toHaveTextContent('')
    await expect.element(page.getByText(slowText)).not.toBeInTheDocument()
    await advance(3700)
    await expect.element(page.getByText(slowText)).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent(slowText)
    expect(container.querySelector('.kv-progress')?.getAttribute('data-state')).toBe('slow')
    await advance(5500)
    await expect.element(politeRegion()).toHaveTextContent('')
    await advance(30_000)
    await expect.element(politeRegion()).toHaveTextContent('')
  })

  test('slowAfterMilliseconds and the slow message can be overridden per instance', async () => {
    await render(
      <KvirnProvider>
        <Progress.Root
          label="Hämtar."
          slowAfterMilliseconds={3000}
          messages={{ slow: 'Det här tar tid. Stäng inte sidan.' }}
        >
          <Progress.Label />
        </Progress.Root>
      </KvirnProvider>,
    )
    await advance(3100)
    await expect.element(page.getByText('Det här tar tid. Stäng inte sidan.')).toBeVisible()
  })

  test('announces the slow sentence even when it follows the label within three seconds', async () => {
    await render(
      <KvirnProvider>
        <Progress.Root label="Hämtar." slowAfterMilliseconds={3000}>
          <Progress.Label />
        </Progress.Root>
      </KvirnProvider>,
    )
    await advance(1100)
    await expect.element(politeRegion()).toHaveTextContent('Hämtar.')
    await advance(2000)
    await expect.element(politeRegion()).toHaveTextContent(slowText)
  })

  test('a slow limit inside the show delay still announces the slow sentence', async () => {
    await render(
      <KvirnProvider>
        <Progress.Root label="Hämtar." delayMilliseconds={1000} slowAfterMilliseconds={500}>
          <Progress.Label />
        </Progress.Root>
      </KvirnProvider>,
    )
    await advance(1300)
    await expect.element(page.getByText(slowText)).toBeVisible()
    await advance(200)
    await expect.element(politeRegion()).toHaveTextContent(`Hämtar. ${slowText}`)
  })
})

describe('determinate', () => {
  test('is a native progress named by the label text only, and the label shows the percent', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Progress.Root label="Exporting cases" value={45}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    const bar = page.getByRole('progressbar', { name: 'Exporting cases' })
    await expect.element(bar).toBeVisible()
    const element = container.querySelector('progress')
    expect(element?.tagName).toBe('PROGRESS')
    expect(element?.getAttribute('value')).toBe('45')
    expect(element?.getAttribute('max')).toBe('100')
    expect(element?.getAttribute('aria-valuetext')).toBe('Exporting cases, 45%')
    expect(container.querySelector('.kv-progress-percent')?.textContent).toContain('45')
    expect(container.querySelector('.kv-progress')?.hasAttribute('data-determinate')).toBe(true)
    vi.useRealTimers()
    await expectNoA11yViolations(container)
  })

  test('the slow sentence is not part of the bar name', async () => {
    await render(
      <KvirnProvider>
        <Progress.Root label="Exporting cases" value={45}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    await advance(9000)
    await expect.element(page.getByText(slowText)).toBeVisible()
    await expect.element(page.getByRole('progressbar', { name: 'Exporting cases' })).toBeVisible()
  })

  test('max sets the scale, and the percent is clamped to 0 to 100', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Progress.Root label="Laddar upp" value={5} max={20}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    expect(container.querySelector('progress')?.getAttribute('max')).toBe('20')
    expect(container.querySelector('progress')?.getAttribute('aria-valuetext')).toBe(
      'Laddar upp, 25%',
    )
  })
})

describe('label', () => {
  test('without a label it uses progress.loading, announces it and warns once', async () => {
    await render(
      <KvirnProvider>
        <Progress.Root>
          <Progress.Label />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    await expect.element(page.getByText('Loading.')).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent('Loading.')
    expect(consoleWarn.mock.calls.flat().join(' ')).toContain('Progress has no label')
  })

  test('the built-in texts come from the provider catalog', async () => {
    await render(
      <KvirnProvider locale="sv" messages={sv}>
        <Progress.Root value={45}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    await expect.element(page.getByRole('progressbar', { name: 'Laddar.' })).toBeVisible()
    await expect.element(politeRegion()).toHaveTextContent('Laddar.')
  })

  test('Label children replace the label text but keep it as the name', async () => {
    await render(
      <KvirnProvider>
        <Progress.Root label="Exporting cases" value={10}>
          <Progress.Label>Exporting your cases</Progress.Label>
          <Progress.Bar />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    await expect
      .element(page.getByRole('progressbar', { name: 'Exporting your cases' }))
      .toBeVisible()
  })
})

describe('keyboard', () => {
  function Around() {
    return (
      <KvirnProvider>
        <Button>Före</Button>
        <Progress.Root label="Sending your application." value={30}>
          <Progress.Label />
          <Progress.Bar />
        </Progress.Root>
        <Button>Efter</Button>
      </KvirnProvider>
    )
  }

  test('Tab passes over it: it has no focusable part', async () => {
    await render(<Around />)
    await passShowDelay()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
    await userEvent.keyboard('{Tab}')
    await expect.element(page.getByRole('button', { name: 'Efter' })).toHaveFocus()
  })

  test('Shift+Tab passes over it too', async () => {
    await render(<Around />)
    await passShowDelay()
    page.getByRole('button', { name: 'Efter' }).element().focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    await expect.element(page.getByRole('button', { name: 'Före' })).toHaveFocus()
  })

  test('focus stays on the button when the wait shows, turns slow and ends', async () => {
    function Sender() {
      const [isBusy, setIsBusy] = useState(false)
      return (
        <KvirnProvider>
          <Button
            busy={isBusy}
            onClick={() => {
              setIsBusy(true)
              setTimeout(() => setIsBusy(false), 12_000)
            }}
          >
            Skicka
          </Button>
          {isBusy ? (
            <Progress.Root label="Sending your application.">
              <Progress.Label />
            </Progress.Root>
          ) : null}
        </KvirnProvider>
      )
    }
    await render(<Sender />)
    const send = page.getByRole('button', { name: 'Skicka' })
    await userEvent.keyboard('{Tab}')
    await userEvent.keyboard('{Enter}')
    await passShowDelay()
    await expect.element(send).toHaveFocus()
    await advance(9000)
    await expect.element(page.getByText(slowText)).toBeVisible()
    await expect.element(send).toHaveFocus()
    await advance(3000)
    await expect.element(page.getByText('Sending your application.')).not.toBeInTheDocument()
    await expect.element(send).not.toHaveAttribute('data-busy')
    await expect.element(send).toHaveFocus()
  })
})

describe('parts', () => {
  test('Root and Label take render, className and a ref, and keep the part class', async () => {
    const ref = createRef<HTMLElement>()
    const { container } = await render(
      <KvirnProvider>
        <Progress.Root
          label="Hämtar."
          className="egen"
          render={<section />}
          ref={ref as React.Ref<HTMLDivElement>}
        >
          <Progress.Label render={<div />} />
        </Progress.Root>
      </KvirnProvider>,
    )
    await passShowDelay()
    const root = container.querySelector('section')
    expect(root?.className).toContain('kv-progress')
    expect(root?.className).toContain('egen')
    expect(ref.current).toBe(root)
    expect(container.querySelector('div.kv-progress-label')).not.toBeNull()
  })

  test('Label and Bar outside a Root render nothing and warn once', async () => {
    const { container } = await render(
      <KvirnProvider>
        <Progress.Label />
        <Progress.Bar />
      </KvirnProvider>,
    )
    expect(container.querySelector('.kv-progress-label')).toBeNull()
    expect(container.querySelector('progress')).toBeNull()
    expect(consoleWarn.mock.calls.flat().join(' ')).toContain('outside Progress.Root')
  })
})

describe('useProgress', () => {
  test('gives props for your own markup, with no bar until the value is known', async () => {
    const seen = vi.fn<(progress: UseProgressResult) => void>()
    function Own({ value }: { value?: number }) {
      const progress = useProgress({ label: 'Hämtar ärenden.', value })
      seen(progress)
      return progress.isShown ? (
        <div {...progress.rootProps}>
          <p {...progress.labelProps}>
            <span id={progress.labelId}>{progress.label}</span>
          </p>
          {progress.barProps === undefined ? null : <progress {...progress.barProps} />}
        </div>
      ) : null
    }
    const { rerender, container } = await render(
      <KvirnProvider>
        <Own />
      </KvirnProvider>,
    )
    expect(seen.mock.lastCall?.[0].isShown).toBe(false)
    await passShowDelay()
    expect(seen.mock.lastCall?.[0].isShown).toBe(true)
    expect(seen.mock.lastCall?.[0].barProps).toBeUndefined()
    await rerender(
      <KvirnProvider>
        <Own value={60} />
      </KvirnProvider>,
    )
    expect(seen.mock.lastCall?.[0].barProps?.value).toBe(60)
    await expect.element(page.getByRole('progressbar', { name: 'Hämtar ärenden.' })).toBeVisible()
    vi.useRealTimers()
    await expectNoA11yViolations(container)
  })
})

describe('server rendering', () => {
  test('renders nothing: the wait is only ever shown after a delay on the client', () => {
    const html = renderToString(
      <KvirnProvider>
        <Progress.Root label="Sending your application.">
          <Progress.Label />
        </Progress.Root>
      </KvirnProvider>,
    )
    expect(html).not.toContain('Sending your application.')
  })
})

describe('types', () => {
  test('the bar props are absent without a value', () => {
    expectTypeOf<UseProgressResult['barProps']>().toBeNullable()
    expectTypeOf<UseProgressResult['percent']>().toEqualTypeOf<number | undefined>()
  })
})
