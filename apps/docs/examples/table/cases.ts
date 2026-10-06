export interface CaseRecord {
  id: string
  name: string
  caseNumber: string
  amount: number
  handler: string
  decision: string
}

export const cases: CaseRecord[] = [
  {
    id: 'c1',
    name: 'Anna Svensson',
    caseNumber: 'BN 2026-0142',
    amount: 4200,
    handler: 'Karin Lund',
    decision: 'Approved',
  },
  {
    id: 'c2',
    name: 'Åsa Öberg',
    caseNumber: 'BN 2026-0157',
    amount: 1850,
    handler: 'Johan Ek',
    decision: 'More information needed',
  },
  {
    id: 'c3',
    name: 'Erik Lindqvist',
    caseNumber: 'BN 2026-0163',
    amount: 12500,
    handler: 'Karin Lund',
    decision: 'In progress',
  },
  {
    id: 'c4',
    name: 'Zacharias Nilsson',
    caseNumber: 'BN 2026-0171',
    amount: 960,
    handler: 'Maria Berg',
    decision: 'Approved',
  },
  {
    id: 'c5',
    name: 'Ärlig Holm',
    caseNumber: 'BN 2026-0188',
    amount: 7300,
    handler: 'Johan Ek',
    decision: 'In progress',
  },
]

export function manyCases(count: number): CaseRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `n${index}`,
    name: `${cases[index % cases.length]?.name ?? ''} ${index + 1}`,
    caseNumber: `BN 2026-${String(1000 + index).padStart(4, '0')}`,
    amount: 500 + ((index * 937) % 20000),
    handler: cases[index % cases.length]?.handler ?? '',
    decision: cases[index % cases.length]?.decision ?? '',
  }))
}
