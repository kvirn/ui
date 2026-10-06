import { virtual } from '@guidepup/virtual-screen-reader'

export interface ReadAloudOptions {
  /** Upper bound on the number of steps taken. Defaults to 100. */
  maxSteps?: number
}

export interface ReadAnnouncementsOptions {
  /** How long to wait for a live phrase, in milliseconds. Defaults to 1000. */
  timeout?: number
  /** How long to keep listening after the first announcement, in milliseconds. Defaults to 100. */
  settle?: number
}

const livePhrase = /^(polite|assertive): .+/

/**
 * An approximation of what a screen reader says when it walks `container`: name, role,
 * state, description, heading level and landmarks. It is not NVDA or JAWS output, never
 * proof of the manual AT matrix, and does not prove modality or focus containment.
 * Throws when the walk has not wrapped back to the start after `maxSteps`.
 */
export async function readAloud(
  container: HTMLElement,
  options: ReadAloudOptions = {},
): Promise<string[]> {
  const { maxSteps = 100 } = options
  try {
    await virtual.start({ container })
    const firstNode = virtual.activeNode
    if (!firstNode) return []
    const phrases = [await virtual.lastSpokenPhrase()]
    for (let step = 0; step < maxSteps; step += 1) {
      await virtual.next()
      const phrase = await virtual.lastSpokenPhrase()
      // A container's "end of …" entry shares its DOM node with the start entry, so the
      // node alone is not enough. The wrap speaks the first phrase again and is dropped.
      if (virtual.activeNode === firstNode && phrase === phrases[0]) return phrases
      phrases.push(phrase)
    }
    throw new Error(`readAloud did not reach the end of the container within ${maxSteps} steps.`)
  } finally {
    await virtual.stop()
  }
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

/**
 * The non-empty live-region phrases (`polite: …`, `assertive: …`) a screen reader would
 * announce while `act` runs, in order. It waits `settle` ms after the first one so a
 * second announcement is kept, but a later one can still be missed. An approximation, not
 * NVDA or JAWS output, never proof of the manual AT matrix, and it does not prove
 * modality or focus containment. It cannot tell a late change made by an earlier `act`
 * from one made by this `act`, so wait for earlier changes to land before the next call.
 */
export async function readAnnouncements(
  container: HTMLElement,
  act: () => void | Promise<void>,
  options: ReadAnnouncementsOptions = {},
): Promise<string[]> {
  const { timeout = 1000, settle = 100 } = options
  const announced = async (since: number) =>
    (await virtual.spokenPhraseLog()).slice(since).filter((phrase) => livePhrase.test(phrase))
  try {
    await virtual.start({ container })
    const since = (await virtual.spokenPhraseLog()).length
    await act()
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) {
      if ((await announced(since)).length > 0) {
        await wait(settle)
        return await announced(since)
      }
      await wait(25)
    }
    throw new Error(`No live-region announcement within ${timeout} ms.`)
  } finally {
    await virtual.stop()
  }
}
