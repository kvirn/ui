import { describe, expect, test } from 'vite-plus/test'
import { createScrollLock } from './scroll-lock.ts'

describe('createScrollLock', () => {
  test('the first acquire reports true', () => {
    const lock = createScrollLock()
    expect(lock.acquire('a')).toBe(true)
  })

  test('a second id acquires without reporting a first lock', () => {
    const lock = createScrollLock()
    lock.acquire('a')
    expect(lock.acquire('b')).toBe(false)
  })

  test('the same id twice counts once', () => {
    const lock = createScrollLock()
    lock.acquire('a')
    expect(lock.acquire('a')).toBe(false)
    expect(lock.release('a')).toBe(true)
  })

  test('release reports true only when the last lock is released', () => {
    const lock = createScrollLock()
    lock.acquire('a')
    lock.acquire('b')
    expect(lock.release('a')).toBe(false)
    expect(lock.release('b')).toBe(true)
  })

  test('releasing an unknown id reports false', () => {
    const lock = createScrollLock()
    expect(lock.release('missing')).toBe(false)
    lock.acquire('a')
    expect(lock.release('missing')).toBe(false)
  })

  test('acquires again after everything was released', () => {
    const lock = createScrollLock()
    lock.acquire('a')
    lock.release('a')
    expect(lock.acquire('a')).toBe(true)
  })
})
