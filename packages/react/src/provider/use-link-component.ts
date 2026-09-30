import { useContext } from 'react'
import { KvirnConfigContext } from './provider-context.ts'
import type { LinkComponentOrAnchor } from './provider-context.ts'
import type { RegisteredLinkComponent } from './register.ts'

/** Internal. The provider's router link component, or a native `<a>` (ADR-0005). */
export function useLinkComponent(): LinkComponentOrAnchor<RegisteredLinkComponent> {
  return useContext(KvirnConfigContext).linkComponent
}
