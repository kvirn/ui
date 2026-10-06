import type { ComponentProps } from 'react'
import { readContract } from '../lib/contract.ts'
import { ContractSectionsView, contractSectionList } from './contract-sections-view.tsx'

/** The Accessibility, Keyboard and Announcements sections of a component's contract. Server only. */
export function ContractSections({
  name,
  ...options
}: { name: string } & Omit<ComponentProps<typeof ContractSectionsView>, 'contract'>) {
  return <ContractSectionsView contract={readContract(name)} {...options} />
}

/** The `h2`s `ContractSections` renders, for the page's contents list. */
export function contractSectionIds(
  name: string,
  extraAnnouncementRows?: Parameters<typeof contractSectionList>[1],
) {
  return contractSectionList(readContract(name), extraAnnouncementRows)
}
