import { createContext } from 'react'
import type { UseTagGroupResult } from './use-tag-group.ts'

// Internal. How the parts of a TagGroup reach the group's focus rule, label and messages.

export const TagGroupContext = createContext<UseTagGroupResult | null>(null)
