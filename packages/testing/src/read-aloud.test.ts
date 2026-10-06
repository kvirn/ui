import { virtual } from '@guidepup/virtual-screen-reader'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { readAloud, readAnnouncements } from './read-aloud.ts'

const mount = (html: string) => {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('readAloud', () => {
  it('speaks the role and state of a button', async () => {
    const phrases = await readAloud(
      mount('<button type="button" aria-expanded="false">Menu</button>'),
    )
    expect(phrases).toContain('button, Menu, not expanded')
  })

  it('speaks the name, role and description of a field', async () => {
    const phrases = await readAloud(
      mount(`
        <label for="name">Name</label>
        <input id="name" aria-describedby="hint" />
        <p id="hint">Your full name</p>`),
    )
    expect(phrases).toContain('textbox, Name, Your full name')
  })

  it('speaks the heading level', async () => {
    const phrases = await readAloud(mount('<h1>Title</h1>'))
    expect(phrases.some((phrase) => phrase.includes('heading') && phrase.includes('Title'))).toBe(
      true,
    )
    expect(phrases.some((phrase) => phrase.includes('level 1'))).toBe(true)
  })

  it('speaks a labelled landmark', async () => {
    const phrases = await readAloud(mount('<nav aria-label="Main"><a href="/a">Home</a></nav>'))
    expect(phrases.some((phrase) => phrase.includes('navigation') && phrase.includes('Main'))).toBe(
      true,
    )
  })

  it('keeps the document order', async () => {
    const phrases = await readAloud(
      mount('<button type="button">First</button><button type="button">Second</button>'),
    )
    const first = phrases.findIndex((phrase) => phrase.includes('First'))
    const second = phrases.findIndex((phrase) => phrase.includes('Second'))
    expect(first).toBeGreaterThanOrEqual(0)
    expect(second).toBeGreaterThan(first)
  })

  it('keeps genuine duplicates from identical adjacent nodes', async () => {
    const phrases = await readAloud(
      mount('<button type="button">Remove</button><button type="button">Remove</button>'),
    )
    expect(phrases).toEqual(['button, Remove', 'button, Remove'])
  })

  it('does not end with the first phrase again', async () => {
    const phrases = await readAloud(
      mount('<button type="button">One</button><button type="button">Two</button>'),
    )
    expect(phrases).toEqual(['button, One', 'button, Two'])
  })

  it('reads the end of a container and what follows it', async () => {
    const phrases = await readAloud(
      mount(
        '<nav aria-label="Main"><a href="/a">Home</a></nav><button type="button">After</button>',
      ),
    )
    expect(phrases).toEqual([
      'navigation, Main',
      'link, Home',
      'end of navigation, Main',
      'button, After',
    ])
  })

  it('reads a single node once', async () => {
    const phrases = await readAloud(mount('<button type="button">Only</button>'))
    expect(phrases).toEqual(['button, Only'])
  })

  it('throws when maxSteps runs out before the end', async () => {
    const buttons = Array.from(
      { length: 20 },
      (_, index) => `<button type="button">B${index}</button>`,
    ).join('')
    await expect(readAloud(mount(buttons), { maxSteps: 3 })).rejects.toThrow(
      'did not reach the end of the container within 3 steps',
    )
  })

  it('stops the screen reader when it finishes', async () => {
    await readAloud(mount('<button type="button">One</button>'))
    await expect(virtual.spokenPhraseLog()).rejects.toThrow('not started')
  })
})

describe('readAnnouncements', () => {
  it('returns a polite announcement', async () => {
    const container = mount('<button type="button">Go</button><div role="status"></div>')
    const announcements = await readAnnouncements(container, () => {
      container.querySelector('[role=status]')!.textContent = 'Saved'
    })
    expect(announcements).toEqual(['polite: Saved'])
  })

  it('returns only the non-empty phrase of a clear-then-set region', async () => {
    const container = mount('<div role="status"></div>')
    const region = container.querySelector('[role=status]')!
    const announcements = await readAnnouncements(container, () => {
      region.textContent = ''
      region.textContent = 'Utkastet sparades'
    })
    expect(announcements).toEqual(['polite: Utkastet sparades'])
  })

  it('returns two announcements from one act in order', async () => {
    const container = mount('<div role="status"></div><div role="alert"></div>')
    const announcements = await readAnnouncements(container, () => {
      container.querySelector('[role=status]')!.textContent = 'Saved'
      container.querySelector('[role=alert]')!.textContent = 'Failed'
    })
    expect(announcements).toEqual(['polite: Saved', 'assertive: Failed'])
  })

  it('returns the same text announced twice by clearing in between', async () => {
    const container = mount('<div role="status"></div>')
    const region = container.querySelector('[role=status]')!
    const announcements = await readAnnouncements(container, async () => {
      region.textContent = 'Saved'
      await new Promise((resolve) => setTimeout(resolve, 20))
      region.textContent = ''
      await new Promise((resolve) => setTimeout(resolve, 20))
      region.textContent = 'Saved'
    })
    expect(announcements).toEqual(['polite: Saved', 'polite: Saved'])
  })

  it('does not leak a late announcement into the next call', async () => {
    const container = mount('<div role="status"></div>')
    const region = container.querySelector('[role=status]')!
    await expect(
      readAnnouncements(
        container,
        () => {
          setTimeout(() => {
            region.textContent = 'Late'
          }, 150)
        },
        { timeout: 20 },
      ),
    ).rejects.toThrow('No live-region announcement')
    await new Promise((resolve) => setTimeout(resolve, 200))
    await expect(readAnnouncements(container, () => {}, { timeout: 300 })).rejects.toThrow(
      'No live-region announcement',
    )
  })

  it('returns an assertive announcement', async () => {
    const container = mount('<div role="alert"></div>')
    const announcements = await readAnnouncements(container, () => {
      container.querySelector('[role=alert]')!.textContent = 'Failed'
    })
    expect(announcements).toEqual(['assertive: Failed'])
  })

  it('returns only live phrases, not the navigation', async () => {
    const container = mount('<button type="button">Go</button><div role="status"></div>')
    const announcements = await readAnnouncements(container, async () => {
      await virtual.next()
      container.querySelector('[role=status]')!.textContent = 'Saved'
    })
    expect(announcements.every((phrase) => /^(polite|assertive): /.test(phrase))).toBe(true)
  })

  it('rejects when nothing is announced within the timeout', async () => {
    const container = mount('<button type="button">Go</button>')
    await expect(readAnnouncements(container, () => {}, { timeout: 100 })).rejects.toThrow(
      'No live-region announcement within 100 ms.',
    )
  })

  it('stops the screen reader when act throws', async () => {
    const container = mount('<button type="button">Go</button>')
    await expect(
      readAnnouncements(container, () => {
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')
    await expect(virtual.spokenPhraseLog()).rejects.toThrow('not started')
  })

  it('stops the screen reader after a timeout', async () => {
    const container = mount('<button type="button">Go</button>')
    await readAnnouncements(container, () => {}, { timeout: 50 }).catch(() => {})
    await expect(virtual.spokenPhraseLog()).rejects.toThrow('not started')
  })
})
