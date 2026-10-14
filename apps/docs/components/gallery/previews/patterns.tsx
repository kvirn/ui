import type { ReactNode } from 'react'
import { Bar, Circle, Drawing, Line, Path, Pill, Rect } from './primitives.tsx'

export const patternPreviews: Record<string, ReactNode> = {
  'application-logo': (
    <Drawing>
      <Circle cx={52} cy={50} radius={14} tone="key" />
      <Bar x={74} y={43} width={40} height={5} tone="key" />
      <Bar x={74} y={54} width={28} />
    </Drawing>
  ),
  'site-header': (
    <Drawing>
      <Rect x={10} y={14} width={140} height={30} radius={4} tone="shell" />
      <Circle cx={24} cy={29} radius={6} tone="key" />
      <Bar x={36} y={27.5} width={22} tone="key" />
      <Bar x={84} y={27.5} width={14} />
      <Bar x={104} y={27.5} width={14} />
      <Rect x={124} y={23} width={20} height={12} radius={3} />
      <Rect x={10} y={50} width={140} height={36} radius={4} tone="slot" />
    </Drawing>
  ),
  'main-menu': (
    <Drawing>
      <Pill x={12} y={14} width={34} height={14} />
      <Pill x={52} y={14} width={34} height={14} tone="key" />
      <Pill x={92} y={14} width={34} height={14} />
      <Rect x={44} y={34} width={72} height={52} radius={4} tone="fill" />
      <Bar x={52} y={44} width={40} />
      <Bar x={52} y={56} width={52} />
      <Bar x={52} y={68} width={34} />
    </Drawing>
  ),
  'site-search': (
    <Drawing>
      <Rect x={14} y={38} width={104} height={24} radius={5} />
      <Bar x={24} y={48.5} width={36} />
      <Rect x={122} y={38} width={24} height={24} radius={5} tone="key" />
      <Circle cx={133} cy={49} radius={4} tone="fill" />
      <Line x1={136} y1={52} x2={139} y2={55} tone="fill" />
    </Drawing>
  ),
  'language-links': (
    <Drawing>
      <Bar x={40} y={48.5} width={14} tone="key" />
      <Line x1={64} y1={44} x2={64} y2={56} tone="slot" />
      <Bar x={74} y={48.5} width={14} />
      <Line x1={98} y1={44} x2={98} y2={56} tone="slot" />
      <Bar x={108} y={48.5} width={14} />
    </Drawing>
  ),
  'site-alert': (
    <Drawing>
      <Rect x={10} y={30} width={140} height={40} radius={4} tone="fill" />
      <Rect x={10} y={30} width={5} height={40} radius={2} tone="key" />
      <Bar x={26} y={40} width={50} height={5} tone="key" />
      <Bar x={26} y={52} width={96} />
      <Bar x={26} y={60} width={64} />
    </Drawing>
  ),
  'cookie-consent': (
    <Drawing>
      <Rect x={10} y={38} width={140} height={52} radius={4} tone="fill" />
      <Bar x={20} y={46} width={46} height={5} tone="key" />
      <Bar x={20} y={57} width={110} />
      <Rect x={20} y={70} width={30} height={12} radius={3} tone="key" />
      <Rect x={56} y={70} width={30} height={12} radius={3} />
    </Drawing>
  ),
  'page-frame': (
    <Drawing>
      <Rect x={12} y={6} width={30} height={8} radius={2} tone="key" />
      <Rect x={12} y={18} width={136} height={14} radius={2} tone="shell" />
      <Rect x={12} y={36} width={136} height={44} radius={3} tone="slot" />
      <Rect x={12} y={84} width={136} height={10} radius={2} tone="shell" />
    </Drawing>
  ),
  'site-footer': (
    <Drawing>
      <Rect x={10} y={10} width={140} height={34} radius={4} tone="slot" />
      <Rect x={10} y={50} width={140} height={40} radius={4} tone="shell" />
      <Bar x={20} y={58} width={30} height={5} />
      <Bar x={20} y={69} width={40} />
      <Bar x={20} y={77} width={34} />
      <Bar x={92} y={58} width={30} height={5} />
      <Bar x={92} y={69} width={40} />
      <Bar x={92} y={77} width={34} />
    </Drawing>
  ),
  'page-header': (
    <Drawing>
      <Bar x={12} y={10} width={20} />
      <Path d="M36 7 l3 4 l-3 4" tone="slot" />
      <Bar x={44} y={10} width={26} />
      <Bar x={12} y={28} width={70} height={7} tone="key" />
      <Bar x={12} y={44} width={120} />
      <Bar x={12} y={52} width={96} />
      <Line x1={12} y1={68} x2={148} y2={68} tone="slot" />
      <Bar x={12} y={78} width={40} />
    </Drawing>
  ),
  'page-tools': (
    <Drawing>
      <Rect x={12} y={38} width={34} height={22} radius={5} />
      <Rect x={52} y={38} width={34} height={22} radius={5} />
      <Bar x={102} y={48.5} width={46} />
    </Drawing>
  ),
  hero: (
    <Drawing>
      <Rect x={10} y={14} width={140} height={72} radius={5} tone="fill" />
      <Bar x={22} y={28} width={70} height={7} tone="key" />
      <Bar x={22} y={44} width={100} />
      <Bar x={22} y={52} width={80} />
      <Rect x={22} y={64} width={36} height={12} radius={3} tone="key" />
    </Drawing>
  ),
  'nav-tiles': (
    <Drawing>
      <Rect x={10} y={22} width={42} height={56} radius={4} />
      <Rect x={59} y={22} width={42} height={56} radius={4} />
      <Rect x={108} y={22} width={42} height={56} radius={4} />
      <Bar x={16} y={32} width={26} height={5} tone="key" />
      <Bar x={65} y={32} width={26} height={5} tone="key" />
      <Bar x={114} y={32} width={26} height={5} tone="key" />
      <Bar x={16} y={46} width={30} />
      <Bar x={65} y={46} width={30} />
      <Bar x={114} y={46} width={30} />
    </Drawing>
  ),
  'section-nav': (
    <Drawing>
      <Rect x={12} y={14} width={136} height={18} radius={4} />
      <Bar x={22} y={21.5} width={46} tone="key" />
      <Path d="M130 20 l4 5 l4 -5" />
      <Bar x={22} y={42} width={60} />
      <Bar x={22} y={54} width={50} />
      <Bar x={22} y={66} width={66} />
    </Drawing>
  ),
  'service-link': (
    <Drawing>
      <Rect x={14} y={30} width={132} height={40} radius={5} tone="fill" />
      <Bar x={26} y={42} width={60} height={5} tone="key" />
      <Bar x={26} y={55} width={90} />
      <Path d="M126 44 l6 6 l-6 6" tone="key" />
    </Drawing>
  ),
}
