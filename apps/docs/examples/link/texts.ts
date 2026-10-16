// kv-lang-ok-file: per-locale translations of the example text, shown when the docs language is changed.
import { defineExampleTexts } from '../../components/local-example-texts.ts'

export const useLinkTexts = defineExampleTexts({
  en: {
    sentenceBefore: 'You can ',
    sentenceLink: 'apply for a parking permit',
    sentenceAfter: ' online.',
    newTabLink: 'Read the guidance at Digg',
    navLabel: 'Parking permits',
    navOverview: 'Overview',
    navApply: 'Apply',
    navContact: 'Contact us',
    otherLanguageIntro: 'This page is also available in Finnish: ',
    otherLanguageLink: 'Suomeksi',
    service: 'Apply for a building permit',
  },
})

export interface LinkFileTexts {
  intro: string
  title: string
  format: string
  htmlLine: string
  htmlLink: string
}

/** The file example is complete in all five locales: its file size is formatted by the locale. */
export const useLinkFileTexts = defineExampleTexts<LinkFileTexts>({
  en: {
    intro: 'The budget for next year is published as a file.',
    title: 'Budget 2027',
    format: 'PDF',
    htmlLine: 'Prefer to read it on a page?',
    htmlLink: 'Budget 2027 as a web page',
  },
  sv: {
    intro: 'Budgeten för nästa år finns som fil.',
    title: 'Budget 2027',
    format: 'PDF',
    htmlLine: 'Vill du hellre läsa den på en sida?',
    htmlLink: 'Budget 2027 som webbsida',
  },
  fi: {
    intro: 'Ensi vuoden talousarvio on julkaistu tiedostona.',
    title: 'Talousarvio 2027',
    format: 'PDF',
    htmlLine: 'Haluatko mieluummin lukea sen sivulta?',
    htmlLink: 'Talousarvio 2027 verkkosivuna',
  },
  nb: {
    intro: 'Budsjettet for neste år er publisert som fil.',
    title: 'Budsjett 2027',
    format: 'PDF',
    htmlLine: 'Vil du heller lese det på en side?',
    htmlLink: 'Budsjett 2027 som nettside',
  },
  nn: {
    intro: 'Budsjettet for neste år er publisert som fil.',
    title: 'Budsjett 2027',
    format: 'PDF',
    htmlLine: 'Vil du heller lese det på ei side?',
    htmlLink: 'Budsjett 2027 som nettside',
  },
})
