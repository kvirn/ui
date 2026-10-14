import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { initialContactState } from './contact-state.ts'

// Contract: docs/design/plans/0112-docs-contact-form.md §Design. fetch is mocked: no network.
let forwardedFor = 'unknown'
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': forwardedFor }),
}))

const { sendMessage } = await import('./actions.ts')

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  reason: 'build',
  message: 'The key does not do what the contract says.',
}

const formDataOf = (fields: Record<string, string>) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>
let counter = 0

beforeEach(() => {
  counter += 1
  forwardedFor = `203.0.113.${counter}`
  process.env['RESEND_API_KEY'] = 'test-key'
  process.env['CONTACT_TO'] = 'inbox@example.com'
  process.env['CONTACT_FROM'] = 'form@example.com'
  fetchMock = vi.fn<typeof fetch>(async () => new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env['RESEND_API_KEY']
  delete process.env['CONTACT_TO']
  delete process.env['CONTACT_FROM']
})

describe('sendMessage', () => {
  test('a valid message is posted to Resend with the visitor as reply-to and returns sent', async () => {
    const state = await sendMessage(initialContactState, formDataOf(valid))
    expect(state.status).toBe('sent')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    const body = JSON.parse(init.body as string)
    expect(body.reply_to).toBe('ada@example.com')
    expect(body.to).toEqual(['inbox@example.com'])
    expect(body.text).toContain(valid.message)
  })

  test('missing fields return an error for each and send nothing', async () => {
    const state = await sendMessage(initialContactState, formDataOf({}))
    expect(state.status).toBe('invalid')
    expect(Object.keys(state.errors).sort()).toEqual(['email', 'message', 'name', 'reason'])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('answers are returned with the errors so they are kept', async () => {
    const state = await sendMessage(
      initialContactState,
      formDataOf({ ...valid, email: 'not-an-address' }),
    )
    expect(state.errors.email).toBeDefined()
    expect(state.values.name).toBe(valid.name)
    expect(state.values.message).toBe(valid.message)
  })

  test('the attempt count grows on every submit', async () => {
    const first = await sendMessage(initialContactState, formDataOf({}))
    const second = await sendMessage(first, formDataOf({}))
    expect(second.attempt).toBe(2)
  })

  test('a filled honeypot looks like success and sends nothing', async () => {
    const state = await sendMessage(initialContactState, formDataOf({ ...valid, website: 'x' }))
    expect(state.status).toBe('sent')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('a name over 100 characters and a message over 2000 are rejected', async () => {
    const state = await sendMessage(
      initialContactState,
      formDataOf({ ...valid, name: 'a'.repeat(101), message: 'b'.repeat(2001) }),
    )
    expect(state.status).toBe('invalid')
    expect(state.errors.name).toBeDefined()
    expect(state.errors.message).toBeDefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('a message of exactly 2000 characters is accepted', async () => {
    const state = await sendMessage(
      initialContactState,
      formDataOf({ ...valid, message: 'b'.repeat(2000) }),
    )
    expect(state.status).toBe('sent')
  })

  test('missing environment returns unavailable and does not throw or call out', async () => {
    delete process.env['RESEND_API_KEY']
    const state = await sendMessage(initialContactState, formDataOf(valid))
    expect(state.status).toBe('unavailable')
    expect(state.values.message).toBe(valid.message)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('an API error returns failed and keeps the answers', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }))
    const state = await sendMessage(initialContactState, formDataOf(valid))
    expect(state.status).toBe('failed')
    expect(state.values.email).toBe(valid.email)
  })

  test('a network error returns failed', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    const state = await sendMessage(initialContactState, formDataOf(valid))
    expect(state.status).toBe('failed')
  })

  test('the sixth message from one address in an hour is limited', async () => {
    for (let count = 0; count < 5; count += 1) {
      const state = await sendMessage(initialContactState, formDataOf(valid))
      expect(state.status).toBe('sent')
    }
    const state = await sendMessage(initialContactState, formDataOf(valid))
    expect(state.status).toBe('limited')
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })
})
