import { describe, expect, it } from 'vite-plus/test'
import { classify, type Report } from './classify.ts'

const passing = { name: '/s/passing.stories.tsx', status: 'passed', assertionResults: [{}] }
const loadFailure = {
  name: '/s/load.stories.tsx',
  status: 'failed',
  message:
    'Failed to import test file /s/load.stories.tsx: Failed to fetch dynamically imported module',
  assertionResults: [],
}
const axeFailure = {
  name: '/s/axe.stories.tsx',
  status: 'failed',
  message: '',
  assertionResults: [{ status: 'failed', failureMessages: ['1 axe violation'] }],
}

describe('classify', () => {
  it('a load failure is unloaded', () => {
    const report: Report = { testResults: [passing, loadFailure] }
    expect(classify(report, [passing.name, loadFailure.name])).toEqual({
      failed: [],
      unloaded: [loadFailure.name],
    })
  })

  it('a file missing from the report is unloaded', () => {
    const report: Report = { testResults: [passing] }
    expect(classify(report, [passing.name, '/s/missing.stories.tsx'])).toEqual({
      failed: [],
      unloaded: ['/s/missing.stories.tsx'],
    })
  })

  it('an assertion or axe failure is failed and never unloaded', () => {
    const report: Report = { testResults: [passing, axeFailure] }
    expect(classify(report, [passing.name, axeFailure.name])).toEqual({
      failed: [axeFailure.name],
      unloaded: [],
    })
  })

  it('a file with a load failure message and assertion results is failed', () => {
    const mixed = { ...loadFailure, assertionResults: [{ status: 'failed' }] }
    expect(classify({ testResults: [mixed] }, [mixed.name])).toEqual({
      failed: [mixed.name],
      unloaded: [],
    })
  })

  it('a failure with another message and no assertion results is failed', () => {
    const other = { name: '/s/other.stories.tsx', status: 'failed', message: 'SyntaxError' }
    expect(classify({ testResults: [other] }, [other.name])).toEqual({
      failed: [other.name],
      unloaded: [],
    })
  })

  it('a clean report gives both empty', () => {
    expect(classify({ testResults: [passing] }, [passing.name])).toEqual({
      failed: [],
      unloaded: [],
    })
  })
})
