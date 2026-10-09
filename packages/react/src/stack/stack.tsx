import type { ReactElement } from 'react'
import { mergeProps } from '../merge-props/merge-props.ts'
import { listRole, resolveAsTag } from '../render/as-prop.ts'
import type { AsTag } from '../render/as-prop.ts'
import { renderPart } from '../render/render-part.ts'
import { useStack } from './use-stack.ts'
import type { UseStackOptions } from './use-stack.ts'

const stackTags = ['div', 'ul', 'ol', 'li', 'section', 'form'] as const

/**
 * `as` is `div` (default), `ul` or `ol` with `<li>` children, `li`, `section` with a name, or
 * `form`. Its own semantics apply, and Stack adds `role="list"` to a `ul` or `ol`.
 */
export type StackProps = AsTag<(typeof stackTags)[number], 'div', UseStackOptions>

/**
 * One `<div class="kv-stack">`: its children one below the other, with a `space` step between them. DOM order is the visual order (contract: stack.a11y.md). Usable in a server component.
 *
 * @example
 * <Stack gap="8">
 *   <Heading as="h2">Kontakta oss</Heading>
 *   <p>Vi svarar vardagar 9–16.</p>
 * </Stack>
 */
export function Stack({ as, gap, ...otherProps }: StackProps): ReactElement {
  // The class joins a prop's own class names (mergeProps), so a prop can't remove it and the
  // theme keeps styling the layout.
  const tag = resolveAsTag({ part: 'Stack', as, allowedTags: stackTags })
  const stackProps = useStack({ gap }).stackProps
  return renderPart({
    as: tag,
    defaultElement: 'div',
    // A prop's own `role` wins. WebKit and VoiceOver drop the list role under `list-style: none`.
    partProps: { ...listRole(tag), ...mergeProps(otherProps, stackProps) },
  })
}
Stack.displayName = 'Stack'
