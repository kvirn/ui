// Apart from actions.ts because a 'use server' file may export only async functions.
export const reasons = ['decide', 'build', 'licence'] as const

export type ContactReason = (typeof reasons)[number]

export interface ContactState {
  status: 'idle' | 'invalid' | 'sent' | 'failed' | 'unavailable' | 'limited'
  /** Counts every submit, so the error summary takes focus again on each failed one. */
  attempt: number
  values: { name: string; email: string; reason: string; message: string }
  errors: { name?: string; email?: string; reason?: string; message?: string }
}

export const initialContactState: ContactState = {
  status: 'idle',
  attempt: 0,
  values: { name: '', email: '', reason: '', message: '' },
  errors: {},
}
