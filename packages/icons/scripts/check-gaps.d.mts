export type GapFinding = {
  icon: string
  first: string
  second: string
  distance: number
  clear: number
}

export function findGaps(file: string, source: string): GapFinding[]
export function findAllGaps(svgDirectory: string): GapFinding[]
