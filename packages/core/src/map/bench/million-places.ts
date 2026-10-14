// Run by hand: node --expose-gc packages/core/src/map/bench/million-places.ts [count]
import { buildClusterTree, createClusterTree, createClusterTreeBuilder } from '../cluster-tree.ts'

const count = Number(process.argv[2] ?? 1_000_000)
const positions = new Float64Array(count * 2)
let state = 42
const next = () => {
  state = (state * 1664525 + 1013904223) % 4294967296
  return state / 4294967296
}
for (let index = 0; index < count; index += 1) {
  positions[2 * index] = 4 + next() * 26
  positions[2 * index + 1] = 55 + next() * 14
}

const gc = (globalThis as { gc?: () => void }).gc
gc?.()
const heapBefore = process.memoryUsage().heapUsed + process.memoryUsage().arrayBuffers

let started = performance.now()
const data = buildClusterTree(positions, { radius: 48, maxZoom: 16 })
console.log(`one-shot build ${Math.round(performance.now() - started)} ms`)
gc?.()
const memory = process.memoryUsage()
console.log(
  `heap ${Math.round((memory.heapUsed + memory.arrayBuffers - heapBefore) / 1048576)} MB (tree incl. typed arrays)`,
)

started = performance.now()
const builder = createClusterTreeBuilder(positions, { radius: 48, maxZoom: 16 })
let slices = 0
let longest = 0
let done = false
while (!done) {
  const sliceStart = performance.now()
  done = builder.step(sliceStart + 8)
  longest = Math.max(longest, performance.now() - sliceStart)
  slices += 1
}
console.log(
  `sliced build ${Math.round(performance.now() - started)} ms in ${slices} slices, longest ${longest.toFixed(1)} ms`,
)

const tree = createClusterTree(data)
const viewAt = (zoom: number) => {
  const degrees = (pixels: number) => (pixels / (512 * 2 ** zoom)) * 360
  return {
    west: 17 - degrees(500),
    east: 17 + degrees(500),
    south: 62 - degrees(250),
    north: 62 + degrees(250),
  }
}
for (const zoom of [5, 8, 11, 14]) {
  tree.getItems(viewAt(zoom), zoom)
  const runs = 50
  started = performance.now()
  let items = 0
  for (let run = 0; run < runs; run += 1) items = tree.getItems(viewAt(zoom), zoom).ids.length
  console.log(
    `zoom ${zoom}: ${((performance.now() - started) / runs).toFixed(2)} ms, ${items} items`,
  )
}
