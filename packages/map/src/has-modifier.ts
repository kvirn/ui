import type { KeyboardEvent } from 'react'

export const hasModifier = (event: KeyboardEvent) => event.ctrlKey || event.metaKey || event.altKey
