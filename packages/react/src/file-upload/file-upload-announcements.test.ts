import { createAnnouncer } from '@kvirn-ui/core'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import {
  announcementMaximumHoldMilliseconds,
  announcementMergeMilliseconds,
  announcementQuietMilliseconds,
  createAnnouncementBuffer,
  getAnnouncementBuffer,
} from './file-upload-announcements.ts'
import type {
  AnnouncementHandle,
  AnnouncementParticipant,
  HeldUploadResults,
} from './file-upload-announcements.ts'

// Contract: design spec §7.3. The buffer is pure: finished sentences in,
// one Announcer call per flush out. These tests use fake timers and no React.

/** A participant that writes English sentences from the held results, like the hook does. */
function participant(label?: string): AnnouncementParticipant {
  return {
    getLabel: () => label,
    wrapWithLabel: (text, message) => `${text}: ${message}`,
    summarizeResults: ({ completed, failed }: HeldUploadResults) =>
      [
        completed.length === 1 ? `${completed[0]} uploaded.` : '',
        completed.length > 1 ? `${completed.length} files uploaded.` : '',
        failed.length === 1 ? `${failed[0]} failed.` : '',
        failed.length > 1 ? `${failed.length} files failed.` : '',
      ]
        .filter((sentence) => sentence !== '')
        .join(' '),
  }
}

let announce: ReturnType<typeof vi.fn<(text: string) => void>>

beforeEach(() => {
  vi.useFakeTimers()
  announce = vi.fn<(text: string) => void>()
})

afterEach(() => {
  vi.useRealTimers()
})

function setup(...labels: (string | undefined)[]): AnnouncementHandle[] {
  const buffer = createAnnouncementBuffer(announce)
  return labels.map((label) => buffer.join(participant(label)))
}

describe('user events', () => {
  test('a user event is announced at once, as one call', () => {
    const [handle] = setup(undefined)
    handle?.say('3 files added.')
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('3 files added.')
  })

  test('a blank sentence is never announced', () => {
    const [handle] = setup(undefined)
    handle?.say('   ')
    expect(announce).not.toHaveBeenCalled()
  })

  test('two user events less than 100 ms apart carry both texts in the second call', () => {
    const [handle] = setup(undefined)
    handle?.say('report.pdf removed.')
    vi.advanceTimersByTime(announcementMergeMilliseconds - 1)
    handle?.say('scan.jpg removed.')
    expect(announce).toHaveBeenCalledTimes(2)
    expect(announce).toHaveBeenLastCalledWith('report.pdf removed. scan.jpg removed.')
  })

  test('two user events 100 ms or more apart are announced separately', () => {
    const [handle] = setup(undefined)
    handle?.say('report.pdf removed.')
    vi.advanceTimersByTime(announcementMergeMilliseconds)
    handle?.say('scan.jpg removed.')
    expect(announce).toHaveBeenLastCalledWith('scan.jpg removed.')
  })

  test('no call carries an Announcer key', () => {
    const announcer = createAnnouncer(undefined)
    const announceSpy = vi.spyOn(announcer.actions, 'announce')
    const handle = getAnnouncementBuffer(announcer).join(participant())
    handle.say('Hello.')
    expect(announceSpy).toHaveBeenCalledTimes(1)
    expect(announceSpy.mock.calls[0]).toEqual(['Hello.'])
  })
})

describe('background results', () => {
  test('are held, never announced at once, and announced after 1 s of quiet', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'report.pdf', 'complete')
    expect(announce).not.toHaveBeenCalled()
    vi.advanceTimersByTime(announcementQuietMilliseconds - 1)
    expect(announce).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('report.pdf uploaded.')
  })

  test('another result inside the quiet window extends it and the results join into counts', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    vi.advanceTimersByTime(600)
    handle?.reportUploadResult('2', 'b.pdf', 'complete')
    vi.advanceTimersByTime(600)
    expect(announce).not.toHaveBeenCalled()
    vi.advanceTimersByTime(400)
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('2 files uploaded.')
  })

  test('never wait longer than 3 s from the first one, however busy', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    for (const id of ['2', '3', '4']) {
      vi.advanceTimersByTime(900)
      handle?.reportUploadResult(id, `b${id}.pdf`, 'complete')
    }
    // 2.7 s in: the quiet window keeps moving, but the hold ends at 3 s.
    vi.advanceTimersByTime(announcementMaximumHoldMilliseconds - 2700 - 1)
    expect(announce).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('4 files uploaded.')
  })

  test('a completed and a failed result are one group, completed first', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'failed')
    handle?.reportUploadResult('2', 'b.pdf', 'complete')
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    expect(announce).toHaveBeenCalledWith('b.pdf uploaded. a.pdf failed.')
  })

  test('held results for an item that was removed, retried or cancelled are dropped', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'failed')
    handle?.reportUploadResult('2', 'b.pdf', 'complete')
    handle?.forget('1')
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('b.pdf uploaded.')
  })

  test('when every held result is dropped, nothing is announced', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'failed')
    handle?.forget('1')
    vi.advanceTimersByTime(announcementMaximumHoldMilliseconds * 2)
    expect(announce).not.toHaveBeenCalled()
  })

  test('a user event flushes the held results with it, at once', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    handle?.say('b.pdf removed.')
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('b.pdf removed. a.pdf uploaded.')
    vi.advanceTimersByTime(announcementMaximumHoldMilliseconds)
    expect(announce).toHaveBeenCalledTimes(1)
  })

  test('a user event within the Announcer’s delay after a background flush carries both texts', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    expect(announce).toHaveBeenLastCalledWith('a.pdf uploaded.')
    vi.advanceTimersByTime(announcementMergeMilliseconds - 50)
    handle?.say('b.pdf removed.')
    expect(announce).toHaveBeenCalledTimes(2)
    expect(announce).toHaveBeenLastCalledWith('a.pdf uploaded. b.pdf removed.')
  })

  test('later than that the first text has been spoken, so it is not repeated', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    vi.advanceTimersByTime(announcementMergeMilliseconds)
    handle?.say('b.pdf removed.')
    expect(announce).toHaveBeenLastCalledWith('b.pdf removed.')
  })

  test('a result reported twice for one item keeps the latest', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'failed')
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    expect(announce).toHaveBeenCalledWith('a.pdf uploaded.')
  })
})

describe('several FileUploads under one buffer', () => {
  test('share one call: a user event carries every instance’s held results', () => {
    const [first, second] = setup(undefined, undefined)
    first?.reportUploadResult('1', 'a.pdf', 'complete')
    second?.say('c.pdf added.')
    expect(announce).toHaveBeenCalledTimes(1)
  })

  test('each group is wrapped with its Field label, in the order of its first sentence', () => {
    const [first, second] = setup('Attachments', 'Receipts')
    second?.reportUploadResult('1', 'r.pdf', 'complete')
    first?.reportUploadResult('1', 'a.pdf', 'complete')
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    expect(announce).toHaveBeenCalledTimes(1)
    expect(announce).toHaveBeenCalledWith('Receipts: r.pdf uploaded. Attachments: a.pdf uploaded.')
  })

  test('with one FileUpload there is no label', () => {
    const [handle] = setup('Attachments')
    handle?.say('a.pdf added.')
    expect(announce).toHaveBeenCalledWith('a.pdf added.')
  })

  test('a participant without a label is not wrapped even when several are mounted', () => {
    const [first] = setup(undefined, 'Receipts')
    first?.say('a.pdf added.')
    expect(announce).toHaveBeenCalledWith('a.pdf added.')
  })

  test('unmounting drops that instance’s held results and keeps the other’s', () => {
    const [first, second] = setup('Attachments', 'Receipts')
    first?.reportUploadResult('1', 'a.pdf', 'complete')
    second?.reportUploadResult('1', 'r.pdf', 'complete')
    first?.dispose()
    vi.advanceTimersByTime(announcementQuietMilliseconds)
    expect(announce).toHaveBeenCalledTimes(1)
    // One FileUpload is left, so there is no label.
    expect(announce).toHaveBeenCalledWith('r.pdf uploaded.')
  })

  test('unmounting the only instance with held results announces nothing', () => {
    const [handle] = setup(undefined)
    handle?.reportUploadResult('1', 'a.pdf', 'failed')
    handle?.dispose()
    vi.advanceTimersByTime(announcementMaximumHoldMilliseconds * 2)
    expect(announce).not.toHaveBeenCalled()
  })

  test('a disposed handle reports and says nothing more that is held', () => {
    const [handle] = setup(undefined)
    handle?.dispose()
    handle?.reportUploadResult('1', 'a.pdf', 'complete')
    vi.advanceTimersByTime(announcementMaximumHoldMilliseconds * 2)
    expect(announce).not.toHaveBeenCalled()
  })
})

describe('getAnnouncementBuffer', () => {
  test('returns the same buffer for the same Announcer, and another for another Announcer', () => {
    const first = createAnnouncer(undefined)
    const second = createAnnouncer(undefined)
    expect(getAnnouncementBuffer(first)).toBe(getAnnouncementBuffer(first))
    expect(getAnnouncementBuffer(first)).not.toBe(getAnnouncementBuffer(second))
  })

  test('two FileUploads on one Announcer make one Announcer call', () => {
    const announcer = createAnnouncer(undefined)
    const announceSpy = vi.spyOn(announcer.actions, 'announce')
    const first = getAnnouncementBuffer(announcer).join(participant('Attachments'))
    const second = getAnnouncementBuffer(announcer).join(participant('Receipts'))
    first.reportUploadResult('1', 'a.pdf', 'complete')
    second.say('r.pdf added.')
    expect(announceSpy).toHaveBeenCalledTimes(1)
  })
})
