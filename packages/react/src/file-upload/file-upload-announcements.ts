import type { Announcer } from '@kvirn-ui/core'

// The announcement buffer behind FileUpload (design spec §7.3). Pure: no React,
// no DOM, no i18n. It is given finished sentences and structured upload results, and decides
// when to call the shared Announcer and with what.
//
// Why a buffer: the Announcer replaces a pending message when a second one arrives within 100 ms,
// and a keyed throttle drops a message instead of delaying it. So FileUpload never uses a `key`,
// and every FileUpload under one Announcer shares ONE buffer, which makes sure two components
// never replace each other's messages.

/**
 * After a call, a flush within this many milliseconds is joined with the previous text. It is the
 * Announcer's own delay between clearing and setting a message (100 ms): later than that the
 * previous text has been set and read, and repeating it would say it twice.
 */
export const announcementMergeMilliseconds = 100
/** A background result is announced after this long without another one. */
export const announcementQuietMilliseconds = 1000
/** A background result never waits longer than this, counted from the first one held. */
export const announcementMaximumHoldMilliseconds = 3000

/** Timers and a clock, injectable so a test needs no real time. Late-bound, so fake timers work. */
export interface AnnouncementClock {
  setTimeout: (handler: () => void, milliseconds: number) => unknown
  clearTimeout: (handle: unknown) => void
  now: () => number
}

const realClock: AnnouncementClock = {
  setTimeout: (handler, milliseconds) => globalThis.setTimeout(handler, milliseconds),
  clearTimeout: (handle) => {
    globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>)
  },
  now: () => Date.now(),
}

export type UploadOutcome = 'complete' | 'failed'

/** The background results held for one FileUpload, in the order they came in. */
export interface HeldUploadResults {
  /** Names of the files whose upload completed. */
  readonly completed: readonly string[]
  /** Names of the files whose upload failed. */
  readonly failed: readonly string[]
}

/** What one FileUpload gives the buffer. Read at flush time, so it can use the latest state. */
export interface AnnouncementParticipant {
  /** The Field label's text without the optional marker, or `undefined` when there's none. */
  getLabel: () => string | undefined
  /** `fileUpload.announcementForField`. */
  wrapWithLabel: (label: string, message: string) => string
  /**
   * The sentences for the held upload results, counted from what is left at flush time. Return an
   * empty string when there's nothing to say.
   */
  summarizeResults: (results: HeldUploadResults) => string
}

/** One FileUpload's connection to the shared buffer. */
export interface AnnouncementHandle {
  /**
   * A user event (add, remove, `uploadAll()`): a finished sentence group. Flushes the whole buffer
   * at once, with any held background results from every FileUpload.
   */
  say: (message: string) => void
  /** A background upload result. Held until 1 s without another, or 3 s after the first. */
  reportUploadResult: (itemId: string, name: string, outcome: UploadOutcome) => void
  /** Drops what is held for an item that was removed, retried or cancelled. */
  forget: (itemId: string) => void
  /** The FileUpload unmounted: its held results are discarded, not flushed. */
  dispose: () => void
}

export interface AnnouncementBuffer {
  join: (participant: AnnouncementParticipant) => AnnouncementHandle
}

interface HeldResult {
  readonly itemId: string
  readonly name: string
  readonly outcome: UploadOutcome
}

interface Participation {
  readonly participant: AnnouncementParticipant
  /** User sentences waiting for the flush, which follows at once. */
  sentences: string[]
  held: HeldResult[]
  /** When this record first had something to say in the pending set. Groups follow this order. */
  order: number | undefined
}

/**
 * Creates a buffer that calls `announce` with one text per flush. See the module comment.
 * `announce` is called without a key, never twice with the same text inside the merge window.
 */
export function createAnnouncementBuffer(
  announce: (text: string) => void,
  clock: AnnouncementClock = realClock,
): AnnouncementBuffer {
  const records = new Set<Participation>()
  let nextOrder = 0
  let quietTimer: unknown
  let holdTimer: unknown
  let last: { text: string; at: number } | undefined

  const clearTimers = () => {
    if (quietTimer !== undefined) {
      clock.clearTimeout(quietTimer)
      quietTimer = undefined
    }
    if (holdTimer !== undefined) {
      clock.clearTimeout(holdTimer)
      holdTimer = undefined
    }
  }

  const hasHeld = () => [...records].some((record) => record.held.length > 0)

  /** Stops the timers when no background result is waiting any more. */
  const settleTimers = () => {
    if (!hasHeld()) {
      clearTimers()
    }
  }

  const buildGroup = (record: Participation, isLabelled: boolean): string => {
    const parts = [...record.sentences]
    if (record.held.length > 0) {
      const results: HeldUploadResults = {
        completed: record.held
          .filter((held) => held.outcome === 'complete')
          .map((held) => held.name),
        failed: record.held.filter((held) => held.outcome === 'failed').map((held) => held.name),
      }
      parts.push(record.participant.summarizeResults(results))
    }
    const message = parts
      .map((part) => part.trim())
      .filter((part) => part !== '')
      .join(' ')
    if (message === '') {
      return ''
    }
    const label = isLabelled ? record.participant.getLabel()?.trim() : undefined
    return label === undefined || label === ''
      ? message
      : record.participant.wrapWithLabel(label, message)
  }

  const flush = () => {
    clearTimers()
    const isLabelled = records.size > 1
    const pending = [...records]
      .filter((record) => record.order !== undefined)
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    const groups = pending
      .map((record) => buildGroup(record, isLabelled))
      .filter((group) => group !== '')
    for (const record of pending) {
      record.sentences = []
      record.held = []
      record.order = undefined
    }
    if (groups.length === 0) {
      return
    }
    nextOrder = 0
    let text = groups.join(' ')
    const now = clock.now()
    if (last !== undefined && now - last.at < announcementMergeMilliseconds) {
      // The Announcer replaces a message queued this soon after another, so carry both.
      text = `${last.text} ${text}`
    }
    last = { text, at: now }
    announce(text)
  }

  const scheduleBackgroundFlush = () => {
    if (quietTimer !== undefined) {
      clock.clearTimeout(quietTimer)
    }
    quietTimer = clock.setTimeout(flush, announcementQuietMilliseconds)
    holdTimer ??= clock.setTimeout(flush, announcementMaximumHoldMilliseconds)
  }

  const touch = (record: Participation) => {
    if (record.order === undefined) {
      record.order = nextOrder
      nextOrder += 1
    }
  }

  const join = (participant: AnnouncementParticipant): AnnouncementHandle => {
    const record: Participation = { participant, sentences: [], held: [], order: undefined }
    records.add(record)
    return {
      say: (message) => {
        if (message.trim() === '') {
          return
        }
        record.sentences.push(message)
        touch(record)
        flush()
      },
      reportUploadResult: (itemId, name, outcome) => {
        if (!records.has(record)) {
          return
        }
        record.held = [
          ...record.held.filter((held) => held.itemId !== itemId),
          { itemId, name, outcome },
        ]
        touch(record)
        scheduleBackgroundFlush()
      },
      forget: (itemId) => {
        if (!record.held.some((held) => held.itemId === itemId)) {
          return
        }
        record.held = record.held.filter((held) => held.itemId !== itemId)
        if (record.held.length === 0 && record.sentences.length === 0) {
          record.order = undefined
        }
        settleTimers()
      },
      dispose: () => {
        records.delete(record)
        record.held = []
        record.sentences = []
        record.order = undefined
        settleTimers()
      },
    }
  }

  return { join }
}

const buffers = new WeakMap<Announcer, AnnouncementBuffer>()

/**
 * The one buffer for an Announcer, created on first use and kept as long as the Announcer lives.
 * Every FileUpload under that Announcer shares it.
 */
export function getAnnouncementBuffer(announcer: Announcer): AnnouncementBuffer {
  let buffer = buffers.get(announcer)
  if (buffer === undefined) {
    buffer = createAnnouncementBuffer((text) => {
      announcer.actions.announce(text)
    })
    buffers.set(announcer, buffer)
  }
  return buffer
}
