'use server'
import { headers } from 'next/headers'
import { messages } from '../../../messages/en.ts'
import { homeMessages } from '../../../messages/home.ts'
import { initialContactState, reasons } from './contact-state.ts'
import type { ContactReason, ContactState } from './contact-state.ts'

const text = messages.docs.contactPage.form
const maxName = 100
const maxMessage = 2000
const maxPerHour = 5
const hour = 60 * 60 * 1000

// Best effort only: serverless instances do not share memory, so this slows one visitor on one
// instance and nothing more. It is never persisted.
const sentAt = new Map<string, number[]>()

function isLimited(address: string, now: number) {
  const recent = (sentAt.get(address) ?? []).filter((time) => now - time < hour)
  if (recent.length >= maxPerHour) {
    sentAt.set(address, recent)
    return true
  }
  sentAt.set(address, [...recent, now])
  return false
}

const field = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function sendMessage(
  previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const attempt = previous.attempt + 1
  const values = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    reason: field(formData, 'reason'),
    message: field(formData, 'message'),
  }

  // A person never reaches this field. A hit looks like success and sends nothing.
  if (field(formData, 'website') !== '') {
    return { status: 'sent', attempt, values: initialContactState.values, errors: {} }
  }

  const errors: ContactState['errors'] = {}
  if (values.name === '') {
    errors.name = text.nameError
  } else if (values.name.length > maxName) {
    errors.name = text.nameTooLong({ max: maxName })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = text.emailError
  }
  if (!reasons.includes(values.reason as ContactReason)) {
    errors.reason = text.reasonError
  }
  if (values.message === '') {
    errors.message = text.messageError
  } else if (values.message.length > maxMessage) {
    errors.message = text.messageTooLong({ max: maxMessage })
  }
  if (Object.keys(errors).length > 0) {
    return { status: 'invalid', attempt, values, errors }
  }

  const apiKey = process.env['RESEND_API_KEY']
  const to = process.env['CONTACT_TO']
  const from = process.env['CONTACT_FROM']
  if (!apiKey || !to || !from) {
    return { status: 'unavailable', attempt, values, errors: {} }
  }

  const requestHeaders = await headers()
  const address = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isLimited(address, Date.now())) {
    return { status: 'limited', attempt, values, errors: {} }
  }

  const reason = homeMessages.contact[values.reason as ContactReason]
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: values.email,
        subject: `${reason.subject} (contact form)`,
        text: `From: ${values.name} <${values.email}>\nAbout: ${reason.heading}\n\n${values.message}`,
      }),
    })
    if (!response.ok) {
      return { status: 'failed', attempt, values, errors: {} }
    }
  } catch {
    return { status: 'failed', attempt, values, errors: {} }
  }
  return { status: 'sent', attempt, values: initialContactState.values, errors: {} }
}
