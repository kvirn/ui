import type {
  ReadAloudButtonProps,
  ReadAloudNoteProps,
  ReadAloudSelectProps,
  ReadAloudStatusProps,
  UseReadAloudOptions,
  UseReadAloudResult,
} from '@kvirn-ui/read-aloud'
import type { KvirnSpeechEngineOptions } from '@kvirn-ui/core'
import { propRows } from '../components/api-block.tsx'
import type { AttributeRow } from '../components/api-block.tsx'

export const useReadAloudRows = propRows<UseReadAloudOptions>({
  contentRef: {
    type: 'RefObject<Element | null>',
    description: 'The element whose text is read. It is read when Play is pressed.',
  },
  engine: {
    type: 'ReadAloudEngine',
    description:
      'The speech engine: kvirnSpeechEngine({ url }) from @kvirn-ui/core, or a fake for tests.',
  },
  name: {
    type: 'string',
    default: '–',
    description:
      'Who receives the text, named by the Note part. Pass the same value you gave kvirnSpeechEngine. Left out, the Note renders nothing.',
  },
  url: {
    type: 'string | URL',
    default: 'the provider’s readAloud.url',
    description:
      'Builds the engine for you instead of passing one. Ignored when you pass engine. Without either, and with no provider config, no player renders.',
  },
  store: {
    type: 'boolean',
    default: 'false',
    description: 'Asks the service to cache the audio. Only for public page text. Used with url.',
  },
  timeout: {
    type: 'number',
    default: '10000',
    description: 'Total budget per request, in milliseconds. Used with url.',
  },
  voices: {
    type: 'Readonly<Record<string, string>>',
    default: 'the provider’s readAloud.voices',
    description:
      'Which voice reads each language, by BCP 47 tag. Your entries resolve over the service’s own map. The language comes from the content’s lang, then the provider’s locale.',
  },
  highlight: {
    type: 'boolean',
    default: 'true',
    description:
      'Registers the sentence being read as a highlight where the browser supports the CSS Custom Highlight API. Nothing is painted until you style ::highlight(kv-read-aloud).',
  },
  scroll: {
    type: 'boolean',
    default: 'true',
    description:
      'Scrolls the sentence into view when it is out of view. Never when the user prefers reduced motion.',
  },
  messages: {
    type: "Partial<KvirnMessages['readAloud']>",
    default: '–',
    description:
      'Overrides the readAloud messages for this player, such as { play: "Listen to the notice" }.',
  },
  onStatusChange: {
    type: "(status: 'idle' | 'preparing' | 'playing' | 'paused') => void",
    default: '–',
    description: 'Called when the status changes.',
  },
})

export const readAloudRootAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-read-aloud',
    values: 'always',
    meaning: 'The part class. The default theme styles it.',
  },
  {
    name: 'data-status',
    values: 'idle, preparing, playing, paused',
    meaning: 'What the player is doing. preparing covers the first press and a mid-text gap.',
  },
  {
    name: 'data-error',
    values: 'no-voice, speech-error, service-unavailable, service-busy, text-too-long',
    meaning: 'Why reading stopped, or a part was skipped. Absent otherwise.',
  },
  {
    name: 'data-source',
    values: 'content, selection',
    meaning: 'Whether Play reads the whole content or a captured selection.',
  },
  {
    name: 'data-kv-read-aloud-skip',
    values: 'always',
    meaning: 'The player’s own words are never read. Put it on content that must not be read too.',
  },
]

export const readAloudButtonRows = propRows<Pick<ReadAloudButtonProps, 'children'>>({
  children: {
    type: 'ReactNode',
    default: 'the message',
    description: 'Your own text. It replaces the message, so its language is yours to set.',
  },
})

export const readAloudPlayAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-read-aloud-button',
    values: 'always',
    meaning: 'The part classes. Previous, Next, Stop and SelectionTrigger share the first.',
  },
  { name: 'data-playing', values: 'while reading', meaning: 'Play is showing Pause.' },
  {
    name: 'data-busy',
    values: 'past 300 ms of preparing',
    meaning:
      'The wait for the first or next chunk has become visible. Play stays pressable: it is the way to stop the wait.',
  },
]

export const readAloudSelectRows = propRows<Pick<ReadAloudSelectProps, 'label'>>({
  label: {
    type: 'ReactNode',
    default: 'the message',
    description: 'The visible label. It replaces the message readAloud.rate or readAloud.voice.',
  },
})

export const readAloudSelectAttributes: readonly AttributeRow[] = [
  { name: 'kv-read-aloud-select', values: 'always', meaning: 'The class of the <select>.' },
  { name: 'kv-read-aloud-label', values: 'always', meaning: 'The class of its <label>.' },
]

export const readAloudStatusRows = propRows<Pick<ReadAloudStatusProps, 'as' | 'ref' | 'children'>>({
  as: {
    type: "'span' | 'p' | 'div'",
    default: "'span'",
    description: 'Changes the element. Another tag warns once and renders a span.',
  },
  ref: { type: 'Ref<HTMLElement>', default: '–', description: 'Reaches the element.' },
  children: {
    type: 'ReactNode',
    default: 'the status text',
    description: 'Your own text. It replaces the position or the reason nothing is read.',
  },
})

export const readAloudStatusAttributes: readonly AttributeRow[] = [
  { name: 'kv-read-aloud-status', values: 'always', meaning: 'The part class.' },
  {
    name: 'data-error',
    values: 'no-voice, speech-error, service-unavailable, service-busy, text-too-long',
    meaning: 'Why nothing is read.',
  },
]

export const readAloudNoteRows = propRows<Pick<ReadAloudNoteProps, 'howItWorksHref' | 'children'>>({
  howItWorksHref: {
    type: 'string',
    default: '–',
    description:
      'Shown as a readAloud.howItWorks link at the end of the note, pointing at your own page. Left out, no link is shown.',
  },
  children: {
    type: 'ReactNode',
    default: 'the note text',
    description: 'Your own text. It replaces readAloud.note, so its language is yours to set.',
  },
})

export const readAloudNoteAttributes: readonly AttributeRow[] = [
  { name: 'kv-read-aloud-note', values: 'always', meaning: 'The part class.' },
]

export const readAloudSelectionTriggerAttributes: readonly AttributeRow[] = [
  {
    name: 'kv-button kv-read-aloud-selection-trigger',
    values: 'always',
    meaning: 'The part classes.',
  },
  {
    name: 'popover="manual"',
    values: 'always',
    meaning: 'Puts the button in the top layer below the end of a selection made with a pointer.',
  },
]

export const useReadAloudResultRows = propRows<UseReadAloudResult>({
  status: {
    type: "'idle' | 'preparing' | 'playing' | 'paused'",
    default: '–',
    description: 'What the player is doing.',
  },
  error: {
    type: "'no-voice' | 'speech-error' | 'service-unavailable' | 'service-busy' | 'text-too-long' | null",
    default: '–',
    description: 'Why reading stopped, or null.',
  },
  voicesStatus: {
    type: "'idle' | 'loading' | 'ready' | 'error'",
    default: '–',
    description: 'Whether the voice list has arrived from the service.',
  },
  state: {
    type: 'ReadAloudState',
    default: '–',
    description: 'The full state of the reader.',
  },
  hasVoice: {
    type: 'boolean | null',
    default: '–',
    description:
      'Whether the content language has a voice on the service. null until the voice list has loaded, so a consumer can render no player for a language with none without flashing it first.',
  },
  hasSelection: {
    type: 'boolean',
    default: '–',
    description: 'A selection inside the content is captured: Play reads it.',
  },
  hasVoiceChoice: {
    type: 'boolean',
    default: '–',
    description:
      'true with two or more voices for the language, which is when a Voice select is useful.',
  },
  rootProps: {
    type: 'ReadAloudRootPartProps',
    default: '–',
    description: 'Spread on the group’s element.',
  },
  playProps: {
    type: 'ReadAloudPlayPartProps',
    default: '–',
    description: 'Spread on the Play <button>.',
  },
  previousProps: {
    type: 'ReadAloudButtonPartProps',
    default: '–',
    description: 'Spread on the Previous <button>.',
  },
  nextProps: {
    type: 'ReadAloudButtonPartProps',
    default: '–',
    description: 'Spread on the Next <button>.',
  },
  stopProps: {
    type: 'ReadAloudButtonPartProps',
    default: '–',
    description: 'Spread on the Stop <button>.',
  },
  rateProps: {
    type: 'ReadAloudSelectPartProps',
    default: '–',
    description: 'Spread on the speed <select>.',
  },
  rateLabelProps: {
    type: 'ReadAloudLabelPartProps',
    default: '–',
    description: 'Spread on the speed <label>.',
  },
  voiceProps: {
    type: 'ReadAloudSelectPartProps',
    default: '–',
    description: 'Spread on the voice <select>.',
  },
  voiceLabelProps: {
    type: 'ReadAloudLabelPartProps',
    default: '–',
    description: 'Spread on the voice <label>.',
  },
  statusProps: {
    type: 'ReadAloudStatusPartProps',
    default: '–',
    description: 'Spread on the status element.',
  },
  noteProps: {
    type: 'ReadAloudNotePartProps',
    default: '–',
    description: 'Spread on the Note’s <p>.',
  },
  noteText: {
    type: 'string | null',
    default: '–',
    description:
      'readAloud.note with the recipient’s name, or null when Root was given no name: there is nothing sensible to show without it.',
  },
  isSelectionTriggerShown: {
    type: 'boolean',
    default: '–',
    description:
      'true after a selection made with a pointer in the content, until it is dismissed.',
  },
  selectionTriggerProps: {
    type: 'ReadAloudSelectionTriggerPartProps',
    default: '–',
    description: 'Spread on the <button> shown next to the selection.',
  },
  playLabel: {
    type: 'string',
    default: '–',
    description: 'The Play message: Listen, Listen to selected text or Pause.',
  },
  selectionLabel: {
    type: 'string',
    default: '–',
    description: 'The selection trigger’s name.',
  },
  previousLabel: {
    type: 'string',
    default: '–',
    description: 'The Previous message.',
  },
  nextLabel: { type: 'string', default: '–', description: 'The Next message.' },
  stopLabel: { type: 'string', default: '–', description: 'The Stop message.' },
  rateLabel: { type: 'string', default: '–', description: 'The speed label.' },
  voiceLabel: { type: 'string', default: '–', description: 'The voice label.' },
  howItWorksLabel: {
    type: 'string',
    default: '–',
    description: 'The Note part’s link text, for your own howItWorksHref link.',
  },
  voicesLoadingLabel: {
    type: 'string',
    default: '–',
    description: 'Shown only while the Voice select’s options have not arrived yet.',
  },
  statusText: {
    type: 'string',
    default: '–',
    description:
      'The visible status: the position, a wait, a skipped part, or the reason reading stopped. Empty when idle.',
  },
  rateOptions: {
    type: 'ReadAloudOption[]',
    default: '–',
    description: 'The speeds, with formatted labels.',
  },
  voiceOptions: {
    type: 'ReadAloudOption[]',
    default: '–',
    description: 'The voices for the content language.',
  },
})

export const kvirnSpeechEngineRows = propRows<KvirnSpeechEngineOptions>({
  url: {
    type: 'string | URL',
    description: 'The service’s base URL: an origin, or a path on your own proxy. Named by none.',
  },
  name: {
    type: 'string',
    default: 'the URL’s host',
    description:
      'Who receives the text, named in the privacy notice. Pass the same value to useReadAloud’s name.',
  },
  store: {
    type: 'boolean',
    default: 'false',
    description: 'Asks the service to cache the audio. Only for public page text.',
  },
  timeout: {
    type: 'number',
    default: '10000',
    description: 'Total budget per request, in milliseconds.',
  },
  voices: {
    type: 'Readonly<Record<string, string>>',
    default: 'the service’s own map',
    description:
      'Which voice reads each language, by BCP 47 tag, such as { sv: sv_SE-male-0-medium }. Your entries resolve over the service’s own map. A language with no voice gets no player.',
  },
})
