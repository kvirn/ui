import type { ReactNode } from 'react'
import { Bar, Drawing, Rect } from './primitives.tsx'

/** The shell is the same on every page, so only what sits between the header and footer differs. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <Drawing>
      <Rect x={6} y={5} width={148} height={12} radius={2} tone="shell" />
      <Rect x={6} y={83} width={148} height={12} radius={2} tone="shell" />
      <Rect x={6} y={21} width={148} height={58} radius={3} tone="slot" />
      {children}
    </Drawing>
  )
}

export const contentTypePreviews: Record<string, ReactNode> = {
  'start-page': (
    <Shell>
      <Rect x={12} y={26} width={136} height={18} radius={3} tone="fill" />
      <Bar x={20} y={31} width={50} height={5} />
      <Bar x={20} y={39} width={80} />
      <Rect x={12} y={48} width={42} height={9} radius={2} tone="key" />
      <Rect x={59} y={48} width={42} height={9} radius={2} tone="key" />
      <Rect x={106} y={48} width={42} height={9} radius={2} tone="key" />
      <Rect x={12} y={61} width={42} height={13} radius={2} />
      <Rect x={59} y={61} width={42} height={13} radius={2} />
      <Rect x={106} y={61} width={42} height={13} radius={2} />
      <Bar x={16} y={66} width={30} />
      <Bar x={63} y={66} width={30} />
      <Bar x={110} y={66} width={30} />
    </Shell>
  ),
  subpage: (
    <Shell>
      <Bar x={12} y={27} width={60} height={5} />
      <Bar x={12} y={37} width={124} />
      <Bar x={12} y={43} width={100} />
      <Bar x={12} y={53} width={48} tone="key" />
      <Bar x={12} y={60} width={56} tone="key" />
      <Bar x={12} y={67} width={42} tone="key" />
    </Shell>
  ),
  'content-page': (
    <Shell>
      <Rect x={12} y={26} width={30} height={48} radius={3} />
      <Bar x={16} y={31} width={22} />
      <Bar x={16} y={38} width={18} tone="key" />
      <Bar x={16} y={45} width={22} />
      <Bar x={50} y={28} width={56} height={5} />
      <Bar x={50} y={38} width={96} />
      <Bar x={50} y={44} width={88} />
      <Bar x={50} y={50} width={92} />
      <Rect x={50} y={58} width={62} height={16} radius={3} tone="fill" />
      <Bar x={55} y={63} width={32} />
      <Bar x={55} y={69} width={22} />
    </Shell>
  ),
  'documentation-page': (
    <Shell>
      <Rect x={12} y={26} width={28} height={48} radius={3} />
      <Bar x={16} y={31} width={20} />
      <Bar x={16} y={38} width={16} tone="key" />
      <Bar x={16} y={45} width={20} />
      <Bar x={46} y={28} width={46} height={5} />
      <Bar x={46} y={38} width={70} />
      <Bar x={46} y={44} width={62} />
      <Rect x={46} y={52} width={70} height={22} radius={3} tone="fill" />
      <Rect x={122} y={26} width={26} height={48} radius={3} />
      <Bar x={126} y={31} width={18} />
      <Bar x={126} y={38} width={14} tone="key" />
      <Bar x={126} y={45} width={18} />
    </Shell>
  ),
}
