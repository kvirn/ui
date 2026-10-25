import { describe, expect, it } from 'vite-plus/test'

const serviceUrl = process.env.KVIRN_VOICE_URL
const timeout = 15_000

// voice.kvirn.com is not deployed yet (Plan 0153 Risks). A smoke test that fails CI for a
// host that does not exist is a broken gate, so the suite stays skipped until KVIRN_VOICE_URL is set.
describe.skipIf(!serviceUrl)('voice.kvirn.com smoke', () => {
  it(
    'health answers 200 with a languages list',
    async () => {
      const response = await fetch(`${serviceUrl}/health`)
      expect(response.status).toBe(200)
      const { languages } = (await response.json()) as { languages: unknown }
      expect(Array.isArray(languages)).toBe(true)
      expect((languages as unknown[]).length).toBeGreaterThan(0)
      expect((languages as unknown[]).every((language) => typeof language === 'string')).toBe(true)
    },
    timeout,
  )

  it(
    'every voice from /v1/voices has a lang whose primary subtag /health serves',
    async () => {
      const healthResponse = await fetch(`${serviceUrl}/health`)
      expect(healthResponse.status).toBe(200)
      const { languages } = (await healthResponse.json()) as { languages: string[] }

      const voicesResponse = await fetch(`${serviceUrl}/v1/voices`)
      expect(voicesResponse.status).toBe(200)
      const voices = (await voicesResponse.json()) as { lang: string }[]
      expect(Array.isArray(voices)).toBe(true)
      expect(voices.length).toBeGreaterThan(0)

      for (const voice of voices) {
        const primarySubtag = voice.lang.split('-')[0]!
        expect(languages, `voice ${voice.lang} has no matching language in /health`).toContain(
          primarySubtag,
        )
      }
    },
    timeout,
  )
})
