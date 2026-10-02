import { useRef } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, expectTypeOf, test, vi } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { useDismissableLayer } from './use-dismissable-layer.ts'
import type { DismissReason, UseDismissableLayerOptions } from './use-dismissable-layer.ts'

// Contract: popover.a11y.md (Escape and outside press) and ADR-0046. The hook only reports:
// the owner closes the layer.

interface LayerProps {
  name: string
  open?: boolean
  onDismiss: (reason: DismissReason, event: Event) => void
  ignore?: UseDismissableLayerOptions['ignore']
  dismissOnEscape?: boolean
  dismissOnOutsidePress?: boolean
  children?: ReactNode
}

function Layer({ name, open = true, children, ...options }: LayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  useDismissableLayer({ open, ref, ...options })
  return (
    <section ref={ref} aria-label={name}>
      <span>{`Inside ${name}`}</span>
      {children}
    </section>
  )
}

const outside = () => page.getByText('Outside')

describe('Escape', () => {
  test('dismisses an open layer with the reason escape and the native event', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(<Layer name="A" onDismiss={onDismiss} />)
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledWith('escape', expect.any(KeyboardEvent))
  })

  test('does nothing for a closed layer', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(<Layer name="A" open={false} onDismiss={onDismiss} />)
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('ignores other keys', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(<Layer name="A" onDismiss={onDismiss} />)
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('a')
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('a key the page already handled (preventDefault) does not dismiss', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(
      <Layer name="A" onDismiss={onDismiss}>
        <input
          aria-label="Search"
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.preventDefault()
          }}
        />
      </Layer>,
    )
    page.getByRole('textbox', { name: 'Search' }).element().focus()
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('dismissOnEscape false keeps the layer open on Escape', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(<Layer name="A" dismissOnEscape={false} onDismiss={onDismiss} />)
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('only the top layer reacts, then the one below once it is gone', async () => {
    const dismissed: string[] = []
    function Stack({ showTop }: { showTop: boolean }) {
      return (
        <>
          <Layer name="bottom" onDismiss={() => dismissed.push('bottom')} />
          {showTop ? <Layer name="top" onDismiss={() => dismissed.push('top')} /> : null}
        </>
      )
    }
    const { rerender } = await render(<Stack showTop />)
    await userEvent.keyboard('{Escape}')
    expect(dismissed).toEqual(['top'])
    await rerender(<Stack showTop={false} />)
    await userEvent.keyboard('{Escape}')
    expect(dismissed).toEqual(['top', 'bottom'])
  })

  test('a layer that opens later is on top, whatever the render order', async () => {
    const dismissed: string[] = []
    function Pair({ topOpen }: { topOpen: boolean }) {
      return (
        <>
          <Layer name="first" onDismiss={() => dismissed.push('first')} />
          <Layer name="second" open={topOpen} onDismiss={() => dismissed.push('second')} />
        </>
      )
    }
    const { rerender } = await render(<Pair topOpen={false} />)
    await userEvent.keyboard('{Escape}')
    expect(dismissed).toEqual(['first'])
    await rerender(<Pair topOpen />)
    await userEvent.keyboard('{Escape}')
    expect(dismissed).toEqual(['first', 'second'])
  })

  test('a re-render does not change the order of the layers', async () => {
    const dismissed: string[] = []
    function Pair({ label }: { label: string }) {
      return (
        <>
          <Layer name="first" onDismiss={() => dismissed.push(`first ${label}`)} />
          <Layer name="second" onDismiss={() => dismissed.push(`second ${label}`)} />
        </>
      )
    }
    const { rerender } = await render(<Pair label="one" />)
    await rerender(<Pair label="two" />)
    await userEvent.keyboard('{Escape}')
    // The newest handler of the top layer is the one called.
    expect(dismissed).toEqual(['second two'])
  })
})

describe('outside press', () => {
  test('dismisses an open layer with the reason outside-press', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(
      <>
        <Layer name="A" onDismiss={onDismiss} />
        <p>Outside</p>
      </>,
    )
    await userEvent.click(outside())
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledWith('outside-press', expect.any(PointerEvent))
  })

  test('a press inside the layer does not dismiss it', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(<Layer name="A" onDismiss={onDismiss} />)
    await userEvent.click(page.getByText('Inside A'))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('does nothing for a closed layer', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(
      <>
        <Layer name="A" open={false} onDismiss={onDismiss} />
        <p>Outside</p>
      </>,
    )
    await userEvent.click(outside())
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('dismissOnOutsidePress false keeps the layer open', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    await render(
      <>
        <Layer name="A" dismissOnOutsidePress={false} onDismiss={onDismiss} />
        <p>Outside</p>
      </>,
    )
    await userEvent.click(outside())
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test('the ignore predicate makes a target outside the layer count as inside', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    function WithAnchor() {
      const anchorRef = useRef<HTMLButtonElement>(null)
      return (
        <>
          <button type="button" ref={anchorRef}>
            Anchor
          </button>
          <Layer
            name="A"
            onDismiss={onDismiss}
            ignore={[
              (target) => target instanceof Node && anchorRef.current?.contains(target) === true,
            ]}
          />
          <p>Outside</p>
        </>
      )
    }
    await render(<WithAnchor />)
    await userEvent.click(page.getByRole('button', { name: 'Anchor' }))
    expect(onDismiss).not.toHaveBeenCalled()
    await userEvent.click(outside())
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  test('only the top layer reacts, and a press in the lower layer is outside the top one', async () => {
    const dismissed: string[] = []
    function Stack({ showTop }: { showTop: boolean }) {
      return (
        <>
          <Layer name="bottom" onDismiss={() => dismissed.push('bottom')} />
          {showTop ? <Layer name="top" onDismiss={() => dismissed.push('top')} /> : null}
          <p>Outside</p>
        </>
      )
    }
    const { rerender } = await render(<Stack showTop />)
    await userEvent.click(outside())
    expect(dismissed).toEqual(['top'])
    dismissed.length = 0
    // A press inside the top layer dismisses nothing.
    await userEvent.click(page.getByText('Inside top'))
    expect(dismissed).toEqual([])
    // A press in the lower layer is outside the top layer: it dismisses the top layer only.
    await userEvent.click(page.getByText('Inside bottom'))
    expect(dismissed).toEqual(['top'])
    dismissed.length = 0
    await rerender(<Stack showTop={false} />)
    await userEvent.click(outside())
    expect(dismissed).toEqual(['bottom'])
  })

  test('stops reacting once it is unmounted', async () => {
    const onDismiss = vi.fn<(...args: unknown[]) => void>()
    const { unmount } = await render(
      <>
        <Layer name="A" onDismiss={onDismiss} />
        <p>Outside</p>
      </>,
    )
    await unmount()
    await userEvent.keyboard('{Escape}')
    expect(onDismiss).not.toHaveBeenCalled()
  })
})

describe('server rendering and types', () => {
  test('renders on the server without touching the window', () => {
    const html = renderToString(<Layer name="A" onDismiss={() => {}} />)
    expect(html).toContain('Inside A')
  })

  test('the public types', () => {
    expectTypeOf<DismissReason>().toEqualTypeOf<'escape' | 'outside-press'>()
    expectTypeOf<UseDismissableLayerOptions['open']>().toEqualTypeOf<boolean>()
    expectTypeOf<UseDismissableLayerOptions['onDismiss']>().toEqualTypeOf<
      (reason: DismissReason, event: Event) => void
    >()
    expectTypeOf(useDismissableLayer).returns.toEqualTypeOf<void>()
  })
})
