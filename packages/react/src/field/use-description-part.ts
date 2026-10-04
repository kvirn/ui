import { useContext, useId, useLayoutEffect, useRef } from 'react'
import type { Ref, RefCallback } from 'react'
import { useMergedRef } from '../merge-props/use-merged-ref.ts'
import { FieldTextHostContext } from './field-context.ts'
import type { FieldState } from './field-state.ts'
import type { FieldDescriptionPartProps } from './use-field.ts'

export interface DescriptionPart<Instance extends Element> {
  /** Put this on the element, in place of your own ref: it also sets yours. */
  ref: RefCallback<Instance>
  /**
   * The host's class, id and state attributes for this description, in a Field or Fieldset. Empty
   * outside one: there is nothing to describe, so no id.
   */
  partProps: Partial<FieldDescriptionPartProps>
  /** The host's state, or `null` outside a Field or Fieldset. */
  state: FieldState | null
}

/**
 * Internal. Makes an element one of the descriptions of the nearest Field or Fieldset: it
 * registers the element while mounted, and gets the id the host lists in `aria-describedby`, in
 * DOM order. Outside a host it does nothing and warns of nothing: the part decides whether that is
 * worth a warning (`Field.Hint` warns, `Prose` doesn't). Used by `Prose`, `Field.Hint`,
 * `FileUpload.Limits` and `CharacterCount`, which passes `isRegistering` false outside a Field so it
 * never becomes a Fieldset's description.
 */
export function useDescriptionPart<Instance extends Element>(
  consumerRef: Ref<Instance> | undefined,
  /**
   * `false`: ignore the host, as outside one. For a part that describes one control, such as a
   * character count: a Fieldset's description is the group's, never a control's.
   */
  isRegistering = true,
): DescriptionPart<Instance> {
  const contextHost = useContext(FieldTextHostContext)
  const host = isRegistering ? contextHost : null
  const name = useId()
  const elementRef = useRef<Instance | null>(null)
  const ref = useMergedRef(consumerRef, elementRef)

  const registerDescription = host?.registerDescription
  useLayoutEffect(() => registerDescription?.(name, elementRef), [registerDescription, name])

  return {
    ref,
    partProps: host === null ? {} : host.getDescriptionProps(name),
    state: host?.state ?? null,
  }
}
