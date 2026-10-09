import { createElement } from 'react'
import type { ElementType, ReactElement } from 'react'

export interface RenderPartOptions<PartProps extends object> {
  /** The consumer's `as`, already checked by `resolveAsTag` for a tag part. */
  as: ElementType | undefined
  /** The element rendered without `as`: a tag name or a component. */
  defaultElement: ElementType
  partProps: PartProps
}

/** Internal. Renders exactly one element for a part: `as`, or its default element. */
export function renderPart<PartProps extends object>({
  as,
  defaultElement,
  partProps,
}: RenderPartOptions<PartProps>): ReactElement {
  return createElement(as ?? defaultElement, partProps)
}
