import type { ReadAloudEngine, ReadAloudError, ReadAloudVoice } from '@kvirn-ui/core'
import { pause, play, settings, stop } from '@kvirn-ui/icons'
import {
  Breadcrumb,
  Container,
  DefinitionList,
  Icon,
  KvirnProvider,
  Popover,
  Tooltip,
} from '@kvirn-ui/react'
import {
  ApplicationLogo,
  LanguageLinks,
  MainMenu,
  PageFrame,
  PageHeader,
  SiteHeader,
  SiteSearch,
} from '@kvirn-ui/patterns'
import { kvirnbyMark } from '@kvirn-ui/patterns/fixtures'
import { ReadAloud, useReadAloud } from '@kvirn-ui/read-aloud'
import { en } from '@kvirn-ui/i18n/en'
import { fi } from '@kvirn-ui/i18n/fi'
import { sv } from '@kvirn-ui/i18n/sv'
import type { Decorator } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { useMemo, useRef } from 'react'
import { PlaceholderFooter } from '../../patterns/patterns-story-support.tsx'

// Story fixture for Components/ReadAloud. The stories never speak: a fake engine stands in for
// the Kvirn voice service, so the audio, the voices and the timing are the same in every browser
// and in CI, and nothing ever reaches the network (D6).

const catalogs = { sv, fi, en }

export const withReadAloudMessages: Decorator = (Story, { globals }) => {
  const locale = String(globals['locale'] ?? 'sv')
  const catalog = locale === 'fi' ? fi : locale === 'en' ? en : sv
  return (
    <KvirnProvider locale={locale in catalogs ? locale : 'sv'} messages={catalog}>
      <Story />
    </KvirnProvider>
  )
}

/** The four voices the live service offers (plan 0153 §Background), so voice matching is exercised honestly, `en` included, matching `en-GB` first. */
export const serviceVoices: ReadAloudVoice[] = [
  {
    id: 'sv_SE-male-0-medium',
    name: 'Svenska',
    lang: 'sv',
    quality: 'medium',
    gender: 'male',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
  {
    id: 'nb_NO-male-0-medium',
    name: 'Norsk',
    lang: 'nb',
    quality: 'medium',
    gender: 'male',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
  {
    id: 'en_GB-female-0-high',
    name: 'English (UK)',
    lang: 'en-GB',
    quality: 'high',
    gender: 'female',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
  {
    id: 'en_US-female-0-high',
    name: 'English (US)',
    lang: 'en-US',
    quality: 'high',
    gender: 'female',
    licence: 'CC0',
    attribution: 'Kvirn voice service',
  },
]

/**
 * The service's own default voice per language (plan 0153 D14), static and synchronous like the
 * real `kvirnSpeechEngine`: matched by exact tag, then by primary subtag. `fi` and `nn` have none.
 */
const defaultVoiceIdByTag: Record<string, string> = {
  sv: 'sv_SE-male-0-medium',
  nb: 'nb_NO-male-0-medium',
  en: 'en_GB-female-0-high',
  'en-gb': 'en_GB-female-0-high',
  'en-us': 'en_US-female-0-high',
}

function defaultVoiceIdFor(language: string): string | undefined {
  const tag = language.toLowerCase().replaceAll('_', '-')
  return defaultVoiceIdByTag[tag] ?? defaultVoiceIdByTag[tag.split('-')[0] ?? tag]
}

export interface FakeEngineOptions {
  /** The voices `getVoices` resolves with. Default the four real service voices. For the Voice-picker example; it no longer decides `hasVoice` (D14). */
  voices?: ReadAloudVoice[]
  /** Milliseconds `load` takes to resolve. Default short. Raise it past 300ms to show `preparing`. */
  loadDelay?: number
  /** Milliseconds `speak` takes before `onEnd` fires. Default short. Raise it to hold a story on `playing`. */
  speakDuration?: number
  /**
   * Every `load` rejects with this error, unless `failChunkIndex` names one sentence only. Models
   * a request the service refused (`service-busy`, `service-unavailable`, `text-too-long`).
   */
  failWith?: ReadAloudError
  /**
   * Only the sentence at this position (0-based, in reading order, counted once per sentence even
   * though prefetch may call `load` for it twice) fails, with `failWith` (default `'text-too-long'`).
   * The rest read normally, so the skip, `partSkipped` and reading on can be shown together (D10).
   */
  failChunkIndex?: number
  /** `speak` calls `onError('speech-error')` instead of `onEnd`: a playback failure after a successful load. */
  failPlayback?: boolean
}

/** Resolves after `ms`, or rejects with an `AbortError` the moment `signal` fires. Never a real timer leak: the listener is always removed. */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'))
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export function createFakeEngine({
  voices = serviceVoices,
  loadDelay = 20,
  speakDuration = 40,
  failChunkIndex,
  // `failChunkIndex` alone means "skip this one sentence", so it needs a cause: text-too-long.
  failWith = failChunkIndex === undefined ? undefined : 'text-too-long',
  failPlayback = false,
}: FakeEngineOptions = {}): ReadAloudEngine {
  // Assigns each sentence's text a stable position the first time it is seen, so `failChunkIndex`
  // means "this sentence", not "this `load` call": prefetch and a retry can both call `load` for
  // the same sentence.
  const chunkIndexByText = new Map<string, number>()
  let nextChunkIndex = 0
  const chunkIndexOf = (text: string): number => {
    let index = chunkIndexByText.get(text)
    if (index === undefined) {
      index = nextChunkIndex
      nextChunkIndex += 1
      chunkIndexByText.set(text, index)
    }
    return index
  }

  let lastHandlers: { onEnd: () => void; onError: (error: ReadAloudError) => void } | undefined
  let speakTimer: ReturnType<typeof setTimeout> | undefined
  const finishSpeaking = () => {
    if (failPlayback) {
      lastHandlers?.onError('speech-error')
    } else {
      lastHandlers?.onEnd()
    }
  }

  return {
    unlock: () => {},
    getDefaultVoiceId: defaultVoiceIdFor,
    getVoices: async () => voices,
    async load(utterance, signal) {
      const index = chunkIndexOf(utterance.text)
      await delay(loadDelay, signal)
      if (failWith !== undefined && (failChunkIndex === undefined || failChunkIndex === index)) {
        throw { error: failWith }
      }
      return { utterance, release: () => {} }
    },
    speak(_handle, handlers) {
      lastHandlers = handlers
      clearTimeout(speakTimer)
      speakTimer = setTimeout(finishSpeaking, speakDuration)
    },
    pause: () => clearTimeout(speakTimer),
    resume: () => {
      clearTimeout(speakTimer)
      speakTimer = setTimeout(finishSpeaking, speakDuration)
    },
    cancel: () => {
      clearTimeout(speakTimer)
      lastHandlers = undefined
    },
    setRate: () => {},
    destroy: () => clearTimeout(speakTimer),
  }
}

export function useFakeEngine(options: FakeEngineOptions = {}): ReadAloudEngine {
  const { loadDelay, speakDuration, failWith, failChunkIndex, failPlayback } = options
  const voiceCount = options.voices?.length
  return useMemo(
    () => createFakeEngine(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the options are plain values, so their parts are the keys
    [loadDelay, speakDuration, failWith, failChunkIndex, failPlayback, voiceCount],
  )
}

export function Article({ ref }: { ref: React.Ref<HTMLElement> }) {
  return (
    <article ref={ref} lang="en" data-testid="article">
      <h2>Applying for a building permit</h2>
      <p>
        You apply for a building permit in the municipality where the building will stand. Start
        with the property designation and a short description of the work. Attach a site plan.
      </p>
      <p>
        The case officer reviews the application within ten weeks. If something is missing you are
        told what, and the time stops until you reply.
      </p>
      <p lang="sv">
        {/* kv-lang-ok: a passage in another language, marked with lang (3.1.2) */}
        Du kan följa ärendet under Mina sidor. Där ser du också vilka handlingar som saknas.
      </p>
      <p>
        A decision comes by post and in your digital mailbox. You can appeal within three weeks.
      </p>
    </article>
  )
}

/** A Finnish page: the service has no voice for `fi` (plan 0153 §Background), so `hasVoice` is `false`. */
export function FinnishArticle({ ref }: { ref: React.Ref<HTMLElement> }) {
  return (
    <article ref={ref} lang="fi" data-testid="article">
      {/* kv-lang-ok: proves the no-voice case (D9) for a language the service doesn't support */}
      <h2>Rakennusluvan hakeminen</h2>
      <p>Haet rakennuslupaa siitä kunnasta, johon rakennus tulee.</p>
      <p>Liitä hakemukseen asemapiirros ja lyhyt kuvaus työstä.</p>
    </article>
  )
}

/**
 * Filler below the article, long enough that the page scrolls at both chrome viewports: outside
 * `contentRef`, so it is never read and never counted in a sentence assertion (0154 T8).
 */
function PageFiller() {
  return (
    <>
      <h2>More about building permits</h2>
      <p>
        Most applications are handled by the same team that reviews site plans, so the officer who
        answers your call usually already has your file open.
      </p>
      <p>
        A neighbour can object during the review. If one does, you are told and get a chance to
        reply before the decision is made.
      </p>
      <p>
        The municipality keeps every decision on file for ten years, in case a later sale or
        renovation needs to refer back to it.
      </p>
      <p>
        If the work has already started without a permit, say so in the application: an after-the-
        fact review follows the same ten-week clock.
      </p>
    </>
  )
}

/**
 * The real site page every story runs in (0154 D27, D28): `PageFrame.Root` brings the skip link
 * the Bar's tab order is specified against, `SiteHeader` and `PageHeader` are the shipped
 * patterns, not transcribed prototype markup. `bar` sits first, before the header (D10); `inline`
 * sits under the dateline, where the inline button row lives (D44). A story-only composition: it has no
 * test of its own, the same as `site-alert.stories.tsx`'s frame.
 */
export function KvirnbyPage({
  bar,
  inline,
  children,
}: {
  bar?: ReactNode
  inline?: ReactNode
  children: ReactNode
}) {
  return (
    <PageFrame.Root>
      {bar}
      <SiteHeader.Root>
        <SiteHeader.Masthead>
          <ApplicationLogo.Root href="#start">
            <ApplicationLogo.Logo src={kvirnbyMark} />
            <ApplicationLogo.Name>Kvirnby municipality</ApplicationLogo.Name>
          </ApplicationLogo.Root>
          <LanguageLinks.Root label="Language">
            <LanguageLinks.Link href="#sv" lang="sv" hrefLang="sv">
              Svenska
            </LanguageLinks.Link>
            <LanguageLinks.Link href="#en" lang="en" hrefLang="en" current>
              English
            </LanguageLinks.Link>
          </LanguageLinks.Root>
          <SiteSearch action="#search" label="Search the site">
            Search
          </SiteSearch>
        </SiteHeader.Masthead>
        <SiteHeader.Menu>
          <SiteHeader.MenuButton>Menu</SiteHeader.MenuButton>
          <SiteHeader.MenuPanel>
            <MainMenu.Root label="Main menu">
              <MainMenu.Link href="#building">Building and housing</MainMenu.Link>
              <MainMenu.Link href="#care">Care and support</MainMenu.Link>
            </MainMenu.Root>
          </SiteHeader.MenuPanel>
        </SiteHeader.Menu>
      </SiteHeader.Root>
      <PageFrame.Main bleed>
        <PageHeader.Root>
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="#building">Building and housing</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Current>Permits</Breadcrumb.Current>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <PageHeader.Title>Building permit for a deck</PageHeader.Title>
          <PageHeader.Facts>
            <DefinitionList.Row>
              <DefinitionList.Term>Updated</DefinitionList.Term>
              <DefinitionList.Description>3 October 2026</DefinitionList.Description>
            </DefinitionList.Row>
          </PageHeader.Facts>
        </PageHeader.Root>
        <Container>
          {inline}
          {children}
          <PageFiller />
        </Container>
      </PageFrame.Main>
      <PlaceholderFooter>Kvirnby municipality</PlaceholderFooter>
    </PageFrame.Root>
  )
}

/**
 * The recommended composition (0154 D44, corrected): a bare row, never a panel. Idle — including
 * the idle a later Stop returns to — is one `Listen to this text` button and the Settings gear;
 * while active (preparing, playing or paused) the row adds Stop and a Settings menu next to Play
 * (now reading Pause), and nothing else — no card, no meter, no transport cluster, no position
 * line. Previous and Next were offered and declined. Gated on `status`, not `hasEverPlayed`: the
 * maintainer's own words were "just toggle Listen with Stop and a settings button … nothing
 * else", and `hasEverPlayed`'s sticky "stays open" (D13) is exactly what D44 supersedes. Built
 * from `useReadAloud` directly rather than `<ReadAloud.Root>`'s children, the one call this
 * composition makes: rendering `<ReadAloud.Root>` as well would run a second machine against the
 * same engine (D22's finding, the reason `ReadAloud.WhenStarted` exists for the sticky case this
 * composition does not use).
 */
export function ArticleWithPlayer({
  engine,
  name = 'Kvirn',
}: {
  engine: ReadAloudEngine
  name?: string | undefined
}) {
  const articleRef = useRef<HTMLElement>(null)
  const reader = useReadAloud({ contentRef: articleRef, engine, name })
  if (reader.hasVoice === false) {
    return null
  }
  const isActive = reader.status !== 'idle'
  const isPlayingOrPreparing = reader.status === 'playing' || reader.status === 'preparing'
  return (
    <KvirnbyPage
      inline={
        <div {...reader.rootProps}>
          <button {...reader.playProps}>
            <Icon
              name={isPlayingOrPreparing ? 'pause' : 'play'}
              icon={isPlayingOrPreparing ? pause : play}
              size="20"
            />
            {reader.playLabel}
          </button>
          {isActive ? (
            <button {...reader.stopProps}>
              <Icon name="stop" icon={stop} size="20" />
              {reader.stopLabel}
            </button>
          ) : null}
          <Popover.Root>
            <Tooltip.Root>
              <Tooltip.Trigger
                as={Popover.Trigger}
                className="kv-button kv-button--icon-only kv-read-aloud-settings"
                aria-label={reader.settingsLabel}
              >
                <Icon name="settings" icon={settings} size="20" />
              </Tooltip.Trigger>
              <Tooltip.Popup>
                <Tooltip.Name>{reader.settingsLabel}</Tooltip.Name>
              </Tooltip.Popup>
            </Tooltip.Root>
            <Popover.Popup
              aria-label={reader.settingsLabel}
              className="kv-read-aloud-settings-popup"
            >
              <label {...reader.rateLabelProps}>{reader.rateLabel}</label>
              <select {...reader.rateProps}>
                {reader.rateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {reader.hasVoiceChoice ? (
                <>
                  <label {...reader.voiceLabelProps}>{reader.voiceLabel}</label>
                  <select {...reader.voiceProps}>
                    {reader.voiceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
              {reader.noteText === null ? null : <p {...reader.noteProps}>{reader.noteText}</p>}
            </Popover.Popup>
          </Popover.Root>
          {reader.isSelectionTriggerShown ? (
            <button {...reader.selectionTriggerProps}>{reader.selectionLabel}</button>
          ) : null}
          <span {...reader.statusProps}>{reader.statusText}</span>
        </div>
      }
    >
      <Article ref={articleRef} />
    </KvirnbyPage>
  )
}

/**
 * No voice serves the page's language (D9, D14): the player renders nothing, not a dead Listen
 * button, from the very first render.
 */
export function ArticleWithPlayerInFinnish({ engine }: { engine: ReadAloudEngine }) {
  const articleRef = useRef<HTMLElement>(null)
  const reader = useReadAloud({ contentRef: articleRef, engine })
  if (reader.hasVoice === false) {
    return null
  }
  const isPlayingOrPreparing = reader.status === 'playing' || reader.status === 'preparing'
  return (
    <KvirnbyPage
      inline={
        <div {...reader.rootProps}>
          <button {...reader.playProps}>
            <Icon
              name={isPlayingOrPreparing ? 'pause' : 'play'}
              icon={isPlayingOrPreparing ? pause : play}
              size="20"
            />
            {reader.playLabel}
          </button>
          <span {...reader.statusProps}>{reader.statusText}</span>
        </div>
      }
    >
      <FinnishArticle ref={articleRef} />
    </KvirnbyPage>
  )
}

/**
 * `ReadAloud.Bar` (0154, "concept J"): the site-wide player. Reads `contentRef` here, same as the
 * other fixtures, for a deterministic story — a real page passes none and the Bar reads `scope`
 * or `<main>` instead (D11, D15). `labelMode` applies the choice class that reveals or hides the
 * icon-only words (D9, D17); the default, hybrid, needs no class at all.
 */
export function ArticleWithBar({
  engine,
  name = 'Kvirn',
  labelMode,
}: {
  engine: ReadAloudEngine
  name?: string | undefined
  labelMode?: 'icons' | 'words' | undefined
}) {
  const articleRef = useRef<HTMLElement>(null)
  const className =
    labelMode === 'icons'
      ? 'kv-read-aloud--icons'
      : labelMode === 'words'
        ? 'kv-read-aloud--words'
        : undefined
  return (
    <KvirnbyPage
      bar={
        <ReadAloud.Root contentRef={articleRef} engine={engine} name={name} className={className}>
          <ReadAloud.Bar />
        </ReadAloud.Root>
      }
    >
      <Article ref={articleRef} />
    </KvirnbyPage>
  )
}
