/** Says whether a pointer target counts as inside the layer. The target is an `EventTarget` in the browser. */
export type LayerTargetCheck = (target: unknown) => boolean

export interface DismissableLayerOptions {
  /**
   * Targets that count as inside the layer although they are not in its element: a Combobox's
   * input and its button, which are the anchor, not part of the popup. A press on them never
   * dismisses the layer.
   */
  ignore?: readonly LayerTargetCheck[] | undefined
  /** Whether Escape dismisses this layer. Default `true`. */
  dismissOnEscape?: boolean | undefined
  /** Whether a press outside dismisses this layer. Default `true`. */
  dismissOnOutsidePress?: boolean | undefined
}

export interface DismissableLayerStack {
  /**
   * Puts a layer on top of the stack and returns a function that removes it again. Pushing an id
   * that is already in the stack replaces its options and keeps its place, so a re-render never
   * reorders layers.
   */
  push: (id: string, options?: DismissableLayerOptions) => () => void
  /** Takes a layer out of the stack. Returns `false` when it was not there. */
  remove: (id: string) => boolean
  has: (id: string) => boolean
  /** Whether this layer is the topmost one, the only one that reacts to Escape and outside presses. */
  isTop: (id: string) => boolean
  getTopId: () => string | undefined
  /** The ids from the bottom layer to the top one. */
  getIds: () => readonly string[]
  /**
   * What Escape should dismiss: the id of the top layer, or `undefined` when there is none or it
   * opted out. Escape never reaches a layer below the top one, so it closes the innermost layer
   * only. This only answers, the caller closes the layer and removes it.
   */
  handleEscape: () => string | undefined
  /**
   * What a press at `target` should dismiss: the id of the top layer, or `undefined`. A press
   * inside the layer (`contains(id, target)`) or on one of its `ignore` targets dismisses
   * nothing. A press inside a layer further down is still outside the top one, and dismisses it.
   */
  handleOutsidePress: (
    target: unknown,
    contains: (id: string, target: unknown) => boolean,
  ) => string | undefined
}

interface Layer {
  id: string
  options: DismissableLayerOptions
}

/**
 * Pure state for the layers that dismiss on Escape and outside presses: popovers,
 * menus, listboxes. It holds no DOM and no listeners. The React `useDismissableLayer` feeds it
 * events and measures `contains`, so a nested layer closes before the one under it.
 */
export function createDismissableLayerStack(): DismissableLayerStack {
  let layers: Layer[] = []

  const getTop = (): Layer | undefined => layers.at(-1)

  const remove = (id: string): boolean => {
    const next = layers.filter((layer) => layer.id !== id)
    const removed = next.length !== layers.length
    layers = next
    return removed
  }

  const push = (id: string, options: DismissableLayerOptions = {}) => {
    const index = layers.findIndex((layer) => layer.id === id)
    if (index === -1) {
      layers = [...layers, { id, options }]
    } else {
      layers = layers.map((layer, position) => (position === index ? { id, options } : layer))
    }
    return () => {
      remove(id)
    }
  }

  return {
    push,
    remove,
    has: (id) => layers.some((layer) => layer.id === id),
    isTop: (id) => getTop()?.id === id,
    getTopId: () => getTop()?.id,
    getIds: () => layers.map((layer) => layer.id),
    handleEscape: () => {
      const top = getTop()
      return top !== undefined && top.options.dismissOnEscape !== false ? top.id : undefined
    },
    handleOutsidePress: (target, contains) => {
      const top = getTop()
      if (top === undefined || top.options.dismissOnOutsidePress === false) {
        return undefined
      }
      if (contains(top.id, target)) {
        return undefined
      }
      if (top.options.ignore?.some((isIgnored) => isIgnored(target)) === true) {
        return undefined
      }
      return top.id
    },
  }
}
