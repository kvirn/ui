export type ReportFile = {
  name: string
  status: string
  message?: string
  assertionResults?: unknown[]
}

export type Report = { testResults: ReportFile[] }

export type Classification = {
  /** A real test, axe or assertion failure. Never retried. */
  failed: string[]
  /** Failed only to load, or missing from the report. */
  unloaded: string[]
}

const loadFailureMarkers = [
  'Failed to import test file',
  'Failed to fetch dynamically imported module',
]

function isLoadFailure(file: ReportFile): boolean {
  return (
    (file.assertionResults ?? []).length === 0 &&
    loadFailureMarkers.some((marker) => file.message?.includes(marker))
  )
}

export function classify(report: Report, expectedFiles: string[]): Classification {
  const failed: string[] = []
  const unloaded: string[] = []
  const reported = new Set<string>()

  for (const file of report.testResults) {
    reported.add(file.name)
    if (file.status !== 'failed') continue
    if (isLoadFailure(file)) unloaded.push(file.name)
    else failed.push(file.name)
  }

  for (const file of expectedFiles) {
    if (!reported.has(file)) unloaded.push(file)
  }

  return { failed, unloaded }
}
