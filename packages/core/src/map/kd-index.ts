/** Float32 halves the memory of a large index, at the cost of rounding the coordinates. */
export type KdCoords = Float32Array | Float64Array

export interface KdIndexData {
  /** Point indices in tree order. */
  ids: Uint32Array
  /** Interleaved x, y in tree order. */
  coords: KdCoords
  nodeSize: number
}

export interface KdIndex {
  /** Calls `visit` with the index of every point inside the box, edges included. */
  range: (
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    visit: (index: number) => void,
  ) => void
  /** Calls `visit` with the index of every point within `radius` of the centre, edge included. */
  within: (x: number, y: number, radius: number, visit: (index: number) => void) => void
}

export interface KdIndexBuilder {
  /** Works until `deadlineMs` (a `performance.now()` time; `Infinity` runs to the end). Returns true when done. */
  step: (deadlineMs: number) => boolean
  result: () => KdIndexData
}

const DEFAULT_NODE_SIZE = 64

function swapItem(ids: Uint32Array, coords: KdCoords, first: number, second: number) {
  const id = ids[first]!
  ids[first] = ids[second]!
  ids[second] = id
  const x = coords[2 * first]!
  const y = coords[2 * first + 1]!
  coords[2 * first] = coords[2 * second]!
  coords[2 * first + 1] = coords[2 * second + 1]!
  coords[2 * second] = x
  coords[2 * second + 1] = y
}

// Floyd-Rivest selection: puts the k-th smallest on `axis` at k, smaller before and larger after.
function select(
  ids: Uint32Array,
  coords: KdCoords,
  k: number,
  startLeft: number,
  startRight: number,
  axis: number,
) {
  let left = startLeft
  let right = startRight
  while (right > left) {
    if (right - left > 600) {
      const size = right - left + 1
      const position = k - left + 1
      const logSize = Math.log(size)
      const sample = 0.5 * Math.exp((2 * logSize) / 3)
      const deviation =
        0.5 *
        Math.sqrt((logSize * sample * (size - sample)) / size) *
        (position - size / 2 < 0 ? -1 : 1)
      select(
        ids,
        coords,
        k,
        Math.max(left, Math.floor(k - (position * sample) / size + deviation)),
        Math.min(right, Math.floor(k + ((size - position) * sample) / size + deviation)),
        axis,
      )
    }
    const pivot = coords[2 * k + axis]!
    let low = left
    let high = right
    swapItem(ids, coords, left, k)
    if (coords[2 * right + axis]! > pivot) swapItem(ids, coords, left, right)
    while (low < high) {
      swapItem(ids, coords, low, high)
      low += 1
      high -= 1
      while (coords[2 * low + axis]! < pivot) low += 1
      while (coords[2 * high + axis]! > pivot) high -= 1
    }
    if (coords[2 * left + axis] === pivot) {
      swapItem(ids, coords, left, high)
    } else {
      high += 1
      swapItem(ids, coords, high, right)
    }
    if (high <= k) left = high + 1
    if (k <= high) right = high - 1
  }
}

/** A resumable build. `coords` (interleaved x, y) is reordered in place and becomes the result's `coords`. */
export function createKdIndexBuilder(
  coords: KdCoords,
  nodeSize = DEFAULT_NODE_SIZE,
): KdIndexBuilder {
  const count = coords.length / 2
  const ids = new Uint32Array(count)
  for (let index = 0; index < count; index += 1) ids[index] = index
  const pending: number[] = count > nodeSize ? [0, count - 1, 0] : []

  return {
    step(deadlineMs) {
      while (pending.length > 0) {
        const axis = pending.pop()!
        const right = pending.pop()!
        const left = pending.pop()!
        if (right - left <= nodeSize) continue
        const middle = (left + right) >> 1
        select(ids, coords, middle, left, right, axis)
        pending.push(left, middle - 1, 1 - axis, middle + 1, right, 1 - axis)
        if (pending.length > 0 && performance.now() > deadlineMs) return false
      }
      return true
    },
    result() {
      if (pending.length > 0) throw new Error('The index is not built yet')
      return { ids, coords, nodeSize }
    },
  }
}

export function buildKdIndex(coords: KdCoords, nodeSize = DEFAULT_NODE_SIZE): KdIndexData {
  const builder = createKdIndexBuilder(coords, nodeSize)
  builder.step(Infinity)
  return builder.result()
}

export function createKdIndex({ ids, coords, nodeSize }: KdIndexData): KdIndex {
  const last = ids.length - 1
  // Shared by every query, so a `visit` must not query the same index again.
  const stack = new Int32Array(3 * 64)
  let top = 0
  const push = (left: number, right: number, axis: number) => {
    stack[top++] = left
    stack[top++] = right
    stack[top++] = axis
  }

  return {
    range(minX, minY, maxX, maxY, visit) {
      if (last < 0) return
      top = 0
      push(0, last, 0)
      while (top > 0) {
        const axis = stack[--top]!
        const right = stack[--top]!
        const left = stack[--top]!
        if (right - left <= nodeSize) {
          for (let index = left; index <= right; index += 1) {
            const x = coords[2 * index]!
            const y = coords[2 * index + 1]!
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) visit(ids[index]!)
          }
          continue
        }
        const middle = (left + right) >> 1
        const x = coords[2 * middle]!
        const y = coords[2 * middle + 1]!
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) visit(ids[middle]!)
        if (axis === 0 ? minX <= x : minY <= y) {
          stack[top++] = left
          stack[top++] = middle - 1
          stack[top++] = 1 - axis
        }
        if (axis === 0 ? maxX >= x : maxY >= y) push(middle + 1, right, 1 - axis)
      }
    },
    within(centerX, centerY, radius, visit) {
      if (last < 0) return
      const squared = radius * radius
      top = 0
      push(0, last, 0)
      while (top > 0) {
        const axis = stack[--top]!
        const right = stack[--top]!
        const left = stack[--top]!
        if (right - left <= nodeSize) {
          for (let index = left; index <= right; index += 1) {
            const dx = coords[2 * index]! - centerX
            const dy = coords[2 * index + 1]! - centerY
            if (dx * dx + dy * dy <= squared) visit(ids[index]!)
          }
          continue
        }
        const middle = (left + right) >> 1
        const x = coords[2 * middle]!
        const y = coords[2 * middle + 1]!
        const dx = x - centerX
        const dy = y - centerY
        if (dx * dx + dy * dy <= squared) visit(ids[middle]!)
        if (axis === 0 ? centerX - radius <= x : centerY - radius <= y) {
          stack[top++] = left
          stack[top++] = middle - 1
          stack[top++] = 1 - axis
        }
        if (axis === 0 ? centerX + radius >= x : centerY + radius >= y)
          push(middle + 1, right, 1 - axis)
      }
    },
  }
}
