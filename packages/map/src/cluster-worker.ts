import { buildClusterTree, clusterTreeTransferables } from '@kvirn-ui/core'
import type { ClusterTreeOptions } from '@kvirn-ui/core'

interface BuildRequest {
  id: number
  positions: Float64Array
  options: ClusterTreeOptions
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<BuildRequest>) => void) | null
  postMessage: (message: unknown, transfer: Transferable[]) => void
}

scope.onmessage = ({ data: { id, positions, options } }) => {
  const tree = buildClusterTree(positions, options)
  scope.postMessage({ id, tree }, clusterTreeTransferables(tree))
}
