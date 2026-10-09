import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useContainer } from './use-container.ts'
import type { UseContainerOptions } from './use-container.ts'

const containerTags = ['div', 'main', 'section', 'article'] as const

/**
 * `as` is `div` (default), `main` (one per page), `section` with a name, or `article`. Its own
 * semantics apply: Container adds no role.
 */
export type ContainerProps = AsTag<(typeof containerTags)[number], 'div', UseContainerOptions>

/**
 * One `<div class="kv-container">` that centres and limits the width of the page's content (contract: container.a11y.md). `size` picks the measure. With `@kvirn-ui/theme`, `'page'` is `80rem` with inline padding, `'reading'` `45rem` and `'form'` `40rem`. Usable in a server component.
 *
 * @example
 * <Container as="main" id="main" size="reading">
 *   <h1>Sophämtning</h1>
 * </Container>
 */
export function Container({ as, size, ...otherProps }: ContainerProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps styling the layout.
  return renderPart({
    as: resolveAsTag({ part: 'Container', as, allowedTags: containerTags }),
    defaultElement: 'div',
    partProps: mergeProps(otherProps, useContainer({ size }).containerProps),
  })
}
Container.displayName = 'Container'
