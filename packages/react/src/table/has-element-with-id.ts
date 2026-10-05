/** An object that looks ids up: a document, or a shadow root. */
interface IdLookup {
  getElementById(id: string): Element | null
}

const isIdLookup = (node: Node): node is Node & IdLookup =>
  'getElementById' in node && typeof node.getElementById === 'function'

/**
 * Internal. Whether an element with `id` is in the same tree as `element`: its document, or its
 * shadow root, where the document can't see it. An element that isn't attached has no tree to
 * look in, so nothing is found.
 */
export function hasElementWithId(element: Element, id: string): boolean {
  const root = element.getRootNode()
  return isIdLookup(root) && root.getElementById(id) !== null
}
