import type { ClusterTreeData, ClusterTreeOptions } from '@kvirn-ui/core'
import type { MapIndexer } from './use-map-places.ts'

export type { MapIndexer }

/**
 * Builds the cluster index of a large `source` in a Web Worker, so the page stays free. Pass the
 * function itself as `indexIn={createMapWorker}`: the map creates the worker when it builds and
 * stops it afterwards. The positions are copied to the worker and the finished index is
 * transferred back.
 */
export function createMapWorker(): MapIndexer {
  const worker = new Worker(new URL('./cluster-worker.ts', import.meta.url), { type: 'module' })
  const pending = new Map<
    number,
    { resolve: (tree: ClusterTreeData) => void; reject: (error: Error) => void }
  >()
  let nextId = 0
  worker.onmessage = ({ data }: MessageEvent<{ id: number; tree: ClusterTreeData }>) => {
    pending.get(data.id)?.resolve(data.tree)
    pending.delete(data.id)
  }
  worker.onerror = () => {
    for (const request of pending.values()) request.reject(new Error('The map worker failed'))
    pending.clear()
  }
  return {
    build: (positions: Float64Array, options: ClusterTreeOptions) =>
      new Promise((resolve, reject) => {
        const id = nextId++
        pending.set(id, { resolve, reject })
        worker.postMessage({ id, positions, options })
      }),
    terminate: () => {
      worker.terminate()
      for (const request of pending.values()) request.reject(new Error('The map worker stopped'))
      pending.clear()
    },
  }
}
