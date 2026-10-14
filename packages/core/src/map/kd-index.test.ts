import { describe, expect, test } from 'vite-plus/test'
import { buildKdIndex, createKdIndex, createKdIndexBuilder } from './kd-index.ts'

function randomCoords(count: number, seed: number) {
  let state = seed
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
  return Float64Array.from({ length: count * 2 }, next)
}

const sorted = (values: number[]) => [...values].sort((first, second) => first - second)

describe('kd index', () => {
  const count = 5000
  const original = randomCoords(count, 7)
  const index = createKdIndex(buildKdIndex(original.slice()))

  test('range finds exactly the points inside the box', () => {
    const found: number[] = []
    index.range(0.2, 0.3, 0.45, 0.6, (item) => found.push(item))
    const expected: number[] = []
    for (let item = 0; item < count; item += 1) {
      const x = original[2 * item]!
      const y = original[2 * item + 1]!
      if (x >= 0.2 && x <= 0.45 && y >= 0.3 && y <= 0.6) expected.push(item)
    }
    expect(sorted(found)).toEqual(expected)
  })

  test('within finds exactly the points inside the radius', () => {
    const found: number[] = []
    index.within(0.5, 0.5, 0.1, (item) => found.push(item))
    const expected: number[] = []
    for (let item = 0; item < count; item += 1) {
      const dx = original[2 * item]! - 0.5
      const dy = original[2 * item + 1]! - 0.5
      if (dx * dx + dy * dy <= 0.01) expected.push(item)
    }
    expect(sorted(found)).toEqual(expected)
  })

  test('an empty index finds nothing', () => {
    const found: number[] = []
    createKdIndex(buildKdIndex(new Float64Array(0))).range(0, 0, 1, 1, (item) => found.push(item))
    expect(found).toEqual([])
  })

  test('a build in steps equals a build in one go', () => {
    const builder = createKdIndexBuilder(original.slice())
    let steps = 1
    while (!builder.step(performance.now() - 1)) steps += 1
    expect(steps).toBeGreaterThan(1)
    expect(builder.result()).toEqual(buildKdIndex(original.slice()))
  })
})
