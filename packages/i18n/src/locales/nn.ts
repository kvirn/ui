import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

export const nn = {
  link: { newTabNotice: '(blir opna i ei ny fane)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(valfritt)', errorPrefix: 'Feil:' },
  // Draft from the design spec (docs/design/notification.md §4.1), for a translator to confirm.
  notification: {
    infoPrefix: 'Informasjon:',
    successPrefix: 'Fullført:',
    warningPrefix: 'Åtvaring:',
    dangerPrefix: 'Feil:',
  },
  // Draft for a translator to confirm.
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 treff', other: `${format.number(count)} treff` }),
    noResults: 'Ingen treff',
    loading: 'Lastar treff',
    removeValue: ({ label }) => `Fjern ${label}`,
    clear: 'Tøm',
    showOptions: 'Vis alternativ',
  },
  // Draft for a translator to confirm.
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Her kan du berre skrive siffer.',
        letters: 'Her kan du berre skrive bokstavar.',
        lettersAndDigits: 'Her kan du berre skrive bokstavar og siffer.',
        other: 'Du kan ikkje skrive det teiknet her.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrive alle ${length} teikna.`,
  },
  // Draft for a translator to confirm.
  fileUpload: {
    chooseFiles: 'Vel filer',
    chooseFile: 'Vel fil',
    replaceFile: 'Byt fil',
    dropHint: ({ multiple }) => (multiple ? 'eller slepp filer her' : 'eller slepp ei fil her'),
    dropHintActive: ({ multiple }) =>
      multiple ? 'Slepp filene for å leggje dei til' : 'Slepp fila for å leggje ho til',
    limitsMaxFiles: ({ count }, format) =>
      format.plural(count, {
        one: 'Du kan leggje til 1 fil.',
        other: `Du kan leggje til opptil ${format.number(count)} filer.`,
      }),
    limitsTypes: ({ allowed, multiple }, format) => {
      const types = format.list(allowed, { type: 'disjunction' })
      return multiple ? `Filene må vere i formatet ${types}.` : `Fila må vere i formatet ${types}.`
    },
    limitsMaxSize: ({ limit, multiple }, format) =>
      multiple
        ? `Kvar fil kan vere på opptil ${formatFileSize(format, limit)}.`
        : `Fila kan vere på opptil ${formatFileSize(format, limit)}.`,
    summary: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil lagt til',
        other: `${format.number(count)} filer lagt til`,
      }),
    summaryOfMax: ({ count, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${format.number(count)} av 1 fil lagt til`,
        other: `${format.number(count)} av ${format.number(maxFiles)} filer lagt til`,
      }),
    summaryFull: ({ maxFiles }, format) =>
      format.plural(maxFiles, {
        one: '1 av 1 fil lagt til. Fjern fila viss du vil leggje til ei anna.',
        other: `${format.number(maxFiles)} av ${format.number(maxFiles)} filer lagt til. Fjern ei fil viss du vil leggje til ei anna.`,
      }),
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunne ikkje leggjast til:',
        other: `${format.number(count)} filer kunne ikkje leggjast til:`,
      }),
    statusReady: 'Lagt til. Blir send med skjemaet',
    statusQueued: 'Ventar på å bli lasta opp',
    statusUploading: 'Lastar opp',
    statusUploadingPercent: ({ percent }, format) =>
      `Lastar opp, ${format.number(percent / 100, { style: 'percent' })}`,
    statusComplete: 'Lasta opp',
    statusFailed: 'Opplastinga mislukkast',
    statusCancelled: 'Opplastinga blei avbroten',
    typeUnknown: 'Ukjend filtype',
    remove: 'Fjern',
    cancel: 'Avbryt',
    retry: 'Prøv igjen',
    duplicateName: ({ name, number }) => `${name} (${number})`,
    errorType: ({ name, allowed }, format) =>
      `${name} har eit filformat som ikkje kan brukast. Vel ei fil i formatet ${format.list(allowed, { type: 'disjunction' })}.`,
    errorTooLarge: ({ name, size, limit }, format) =>
      `${name} er ${formatFileSize(format, size)}. Vel ei fil som er maks ${formatFileSize(format, limit)}. Du kan gjere eit bilete eller ei skanning mindre ved å lagre eller skanne det på nytt med lågare oppløysing.`,
    errorTooSmall: ({ name, size, limit }, format) =>
      `${name} er ${formatFileSize(format, size)}. Vel ei fil som er minst ${formatFileSize(format, limit)}.`,
    errorEmpty: ({ name }) => `${name} er tom. Kontroller at du har valt rett fil.`,
    errorTooMany: ({ name, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${name} blei ikkje lagt til. Du kan berre leggje til 1 fil.`,
        other: `${name} blei ikkje lagt til. Du kan leggje til opptil ${format.number(maxFiles)} filer. Fjern ei fil viss du vil leggje til ei anna.`,
      }),
    errorDuplicate: ({ name }) => `${name} er allereie i lista.`,
    errorFolder: ({ name }) => `${name} er ei mappe. Opne mappa og vel filene i ho.`,
    uploadFailedMessage: ({ name }) =>
      `Vi kunne ikkje laste opp ${name}. Viss det held fram å feile, kontakt oss.`,
    rejectedFilePosition: ({ position, total, message }) =>
      `Fil ${position} av ${total}, ${message}`,
    removeFile: ({ name }) => `Fjern ${name}`,
    cancelFile: ({ name }) => `Avbryt opplastinga av ${name}`,
    retryFile: ({ name }) => `Prøv igjen med ${name}`,
    uploadingFile: ({ name }) => `Lastar opp ${name}`,
    fileAdded: ({ name }) => `${name} er lagt til.`,
    filesAdded: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil er lagt til.',
        other: `${format.number(count)} filer er lagt til.`,
      }),
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunne ikkje leggjast til.',
        other: `${format.number(count)} filer kunne ikkje leggjast til.`,
      }),
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Lastar opp 1 fil.',
        other: `Lastar opp ${format.number(count)} filer.`,
      }),
    uploadComplete: ({ name }) => `${name} er lasta opp.`,
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil er lasta opp.',
        other: `${format.number(count)} filer er lasta opp.`,
      }),
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'Fila er lasta opp.',
        other: `Alle ${format.number(count)} filene er lasta opp.`,
      }),
    uploadFailed: ({ name }) => `${name} kunne ikkje lastast opp.`,
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunne ikkje lastast opp.',
        other: `${format.number(count)} filer kunne ikkje lastast opp.`,
      }),
    fileRemoved: ({ name }) => `${name} er fjerna.`,
    announcementForField: ({ label, message }) => `${label}: ${message}`,
  },
} satisfies KvirnMessages
