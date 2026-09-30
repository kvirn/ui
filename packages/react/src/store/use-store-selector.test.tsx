import { createComponentStore } from '@kvirn-ui/core'
import { Profiler } from 'react'
import { expect, test } from 'vite-plus/test'
import { page, userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'
import { useStoreSelector } from './use-store-selector.ts'

const createFixtureStore = () =>
  createComponentStore({ count: 0, label: 'Antal' }, ({ update }) => ({
    increment: () => update((state) => ({ ...state, count: state.count + 1 })),
    rename: (label: string) => update((state) => ({ ...state, label })),
  }))

test('re-renders when the selected value changes', async () => {
  const fixtureStore = createFixtureStore()

  function Counter() {
    const count = useStoreSelector(fixtureStore, (state) => state.count)
    return (
      <button type="button" onClick={fixtureStore.actions.increment}>
        Klick {count}
      </button>
    )
  }

  await render(<Counter />)
  await userEvent.click(page.getByRole('button', { name: 'Klick 0' }))
  await expect.element(page.getByRole('button', { name: 'Klick 1' })).toBeVisible()
})

test('does not re-render when an unrelated slice changes', async () => {
  const fixtureStore = createFixtureStore()
  const commits: string[] = []

  function CountOutput() {
    const count = useStoreSelector(fixtureStore, (state) => state.count)
    return <output>{count}</output>
  }

  await render(
    <Profiler id="count-output" onRender={(id) => commits.push(id)}>
      <CountOutput />
    </Profiler>,
  )
  const commitsAfterMount = commits.length
  fixtureStore.actions.rename('Summa')
  fixtureStore.actions.increment()
  await expect.element(page.getByRole('status')).toHaveTextContent('1')
  expect(commits.length).toBe(commitsAfterMount + 1)
})

test('returns a cached selection for derived objects, so it does not loop', async () => {
  const fixtureStore = createFixtureStore()

  function Summary() {
    const summary = useStoreSelector(
      fixtureStore,
      (state) => ({ text: `${state.label}: ${state.count}` }),
      (previous, next) => previous.text === next.text,
    )
    return <p>{summary.text}</p>
  }

  await render(<Summary />)
  await expect.element(page.getByText('Antal: 0')).toBeVisible()
})
