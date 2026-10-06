import { createContext } from 'react'
import type { UseMenuResult } from './use-menu.ts'

/** Internal. The nearest `Menu.Root`'s hook result, or `null` outside one. */
export const MenuContext = createContext<UseMenuResult | null>(null)

/** Internal. The nearest `Menu.RadioGroup`: the chosen value and how an item chooses itself. */
export interface MenuRadioGroupContextValue {
  value: string | undefined
  select: (value: string) => void
}

export const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null)

/** Internal. The nearest `Menu.Group`: its label registers here, so the group is named by it. */
export interface MenuGroupContextValue {
  labelId: string
  registerLabel: () => () => void
}

export const MenuGroupContext = createContext<MenuGroupContextValue | null>(null)
