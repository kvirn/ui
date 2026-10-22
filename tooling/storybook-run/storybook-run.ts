import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { classify, type Report } from './classify.ts'

// One long Chromium session fails to load story files at random on Linux (plan 0148). So a project
// runs in shards of one worker, one after another, and a file that failed to load is re-run once in
// small batches. A test or axe failure stops the run and is never retried.
const shardCount = Number(process.env['KVIRN_STORYBOOK_SHARDS'] ?? 8)
const rerunBatchSize = Number(process.env['KVIRN_STORYBOOK_RERUN_BATCH'] ?? 1)
const environment = { ...process.env, VITEST_MAX_WORKERS: '1' }

function listFiles(project: string): string[] {
  const result = spawnSync('vp', ['test', 'list', '--project', project, '--filesOnly', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    throw new Error(`Could not list the test files of ${project}`)
  }
  const entries: { file: string }[] = JSON.parse(result.stdout.slice(result.stdout.indexOf('[')))
  return [...new Set(entries.map((entry) => entry.file))]
}

function runShard(project: string, shard: number, directory: string) {
  console.log(`\n${project} ${shard}/${shardCount}`)
  const reportPath = join(directory, `report-${shard}.json`)
  const run = spawnSync(
    'vp',
    [
      'test',
      'run',
      '--project',
      project,
      `--shard=${shard}/${shardCount}`,
      '--reporter=default',
      '--reporter=json',
      `--outputFile.json=${reportPath}`,
    ],
    { stdio: 'inherit', env: environment },
  )
  const report: Report = existsSync(reportPath)
    ? JSON.parse(readFileSync(reportPath, 'utf8'))
    : { testResults: [] }
  return { status: run.status ?? 1, report }
}

function runProject(project: string): number {
  const directory = mkdtempSync(join(tmpdir(), 'kvirn-storybook-run-'))
  try {
    const expectedFiles = listFiles(project)
    const reported: Report = { testResults: [] }
    let shardFailed = false

    for (let shard = 1; shard <= shardCount; shard++) {
      const { status, report } = runShard(project, shard, directory)
      reported.testResults.push(...report.testResults)
      const { failed } = classify(report, [])
      if (failed.length > 0) {
        console.error(
          `Story files with failing tests in ${project}, not re-run:\n${failed.join('\n')}`,
        )
        return 1
      }
      if (status !== 0) shardFailed = true
    }

    const { unloaded } = classify(reported, expectedFiles)
    if (unloaded.length === 0) return shardFailed ? 1 : 0

    console.error(
      `Re-running ${unloaded.length} story files that failed to load in ${project}:\n${unloaded.join('\n')}`,
    )
    for (let start = 0; start < unloaded.length; start += rerunBatchSize) {
      const batch = unloaded.slice(start, start + rerunBatchSize)
      const status =
        spawnSync('vp', ['test', 'run', '--project', project, ...batch], {
          stdio: 'inherit',
          env: environment,
        }).status ?? 1
      if (status !== 0) return status
    }
    return 0
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

for (const project of process.argv.slice(2)) {
  const status = runProject(project)
  if (status !== 0) process.exit(status)
}
