import type { ComponentPropsWithRef, ElementType, JSX, Ref } from 'react'
import { warnOnce } from '../dev/dev-warning.ts'

type TagName = keyof JSX.IntrinsicElements

/**
 * Internal. The props of a tag part: `as` is one of `Tags` (a string, so it crosses from a Server
 * Component), and the element's own attributes follow it, so `as="form"` allows `action`.
 * `DefaultTag` is the part's default element, which `as` may leave out. `OwnProps` are the part's
 * own props and win over an attribute of the same name. `ref` is a `Ref<HTMLElement>`, so one
 * ref type fits every allowed tag.
 *
 * @example
 * type AlertTitleProps = AsTag<'h2' | 'h3' | 'p', 'h2', { messages?: Messages }>
 */
export type AsTag<
  Tags extends TagName,
  DefaultTag extends Tags,
  OwnProps extends object = Record<never, never>,
> = {
  [Tag in Tags]: OwnProps &
    Omit<ComponentPropsWithRef<Tag>, keyof OwnProps | 'as' | 'ref'> & {
      ref?: Ref<HTMLElement> | undefined
    } & (Tag extends DefaultTag ? { as?: Tag | undefined } : { as: Tag })
}[Tags]

/**
 * Internal. The props of a component part: `as` is any component or tag, and its props are plain
 * JSX props on the part, forwarded to it (`<Tooltip.Trigger as={Button} aria-label="Close">`).
 * `OwnProps` are the part's own props and win over a prop of the same name.
 *
 * @example
 * function LinkRoot<Component extends ElementType = 'a'>(props: AsComponent<Component, LinkOwnProps>)
 */
export type AsComponent<
  Component extends ElementType,
  OwnProps extends object = Record<never, never>,
> = OwnProps &
  Omit<ComponentPropsWithRef<Component>, keyof OwnProps | 'as'> & { as?: Component | undefined }

export interface ResolveAsTagOptions<Tag extends string> {
  /** The part as the consumer writes it, such as `Alert.Title`. */
  part: string
  /** What the consumer passed. A JS caller can pass any string. */
  as: string | undefined
  allowedTags: readonly Tag[]
}

/**
 * Internal. The tag a tag part renders: `as` when it is in the part's allowed list, otherwise
 * `undefined`, so `renderPart` falls back to the default element. A tag outside the list warns
 * once in development (`as-not-allowed:<part>:<tag>`); the types already reject it.
 */
export function resolveAsTag<Tag extends string>({
  part,
  as,
  allowedTags,
}: ResolveAsTagOptions<Tag>): Tag | undefined {
  if (as === undefined) {
    return undefined
  }
  const allowed = allowedTags.find((tag) => tag === as)
  if (allowed === undefined) {
    warnOnce(
      `as-not-allowed:${part}:${as}`,
      `<${part} as="${as}"> is not an allowed element for ${part} (${allowedTags.join(', ')}), so it renders its default element. Another element can change the page's outline or semantics (WCAG 1.3.1, 4.1.2): use the part's hook with your own element.`,
    )
  }
  return allowed
}

/** Internal. `role="list"` for a `ul` or `ol`: WebKit and VoiceOver drop the list role under `list-style: none`. */
export function listRole(tag: string | undefined): { role?: 'list' } {
  return tag === 'ul' || tag === 'ol' ? { role: 'list' } : {}
}
