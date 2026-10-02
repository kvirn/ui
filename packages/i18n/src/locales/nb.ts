import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

export const nb = {
  link: { newTabNotice: '(åpnes i en ny fane)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(valgfritt)', errorPrefix: 'Feil:' },
  // Draft from the design spec (docs/design/notification.md §4.1), for a translator to confirm.
  notification: {
    infoPrefix: 'Informasjon:',
    successPrefix: 'Fullført:',
    warningPrefix: 'Advarsel:',
    dangerPrefix: 'Feil:',
  },
  // Draft for a translator to confirm.
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 treff', other: `${format.number(count)} treff` }),
    noResults: 'Ingen treff',
    loading: 'Laster treff',
    removeValue: ({ label }) => `Fjern ${label}`,
    clear: 'Tøm',
    showOptions: 'Vis alternativer',
  },
  // Draft for a translator to confirm.
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Her kan du bare skrive sifre.',
        letters: 'Her kan du bare skrive bokstaver.',
        lettersAndDigits: 'Her kan du bare skrive bokstaver og sifre.',
        other: 'Du kan ikke skrive det tegnet her.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrevet alle ${length} tegnene.`,
  },
  // Draft for a translator to confirm.
  fileUpload: {
    chooseFiles: 'Velg filer',
    chooseFile: 'Velg fil',
    replaceFile: 'Bytt fil',
    dropHint: ({ multiple }) => (multiple ? 'eller slipp filer her' : 'eller slipp en fil her'),
    dropHintActive: ({ multiple }) =>
      multiple ? 'Slipp filene for å legge dem til' : 'Slipp filen for å legge den til',
    limitsMaxFiles: ({ count }, format) =>
      format.plural(count, {
        one: 'Du kan legge til 1 fil.',
        other: `Du kan legge til opptil ${format.number(count)} filer.`,
      }),
    limitsTypes: ({ allowed, multiple }, format) => {
      const types = format.list(allowed, { type: 'disjunction' })
      return multiple ? `Filene må være i formatet ${types}.` : `Filen må være i formatet ${types}.`
    },
    limitsMaxSize: ({ limit, multiple }, format) =>
      multiple
        ? `Hver fil kan være på opptil ${formatFileSize(format, limit)}.`
        : `Filen kan være på opptil ${formatFileSize(format, limit)}.`,
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
        one: '1 av 1 fil lagt til. Fjern filen hvis du vil legge til en annen.',
        other: `${format.number(maxFiles)} av ${format.number(maxFiles)} filer lagt til. Fjern en fil hvis du vil legge til en annen.`,
      }),
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunne ikke legges til:',
        other: `${format.number(count)} filer kunne ikke legges til:`,
      }),
    statusReady: 'Lagt til. Sendes med skjemaet',
    statusQueued: 'Venter på å bli lastet opp',
    statusUploading: 'Laster opp',
    statusUploadingPercent: ({ percent }, format) =>
      `Laster opp, ${format.number(percent / 100, { style: 'percent' })}`,
    statusComplete: 'Lastet opp',
    statusFailed: 'Opplastingen mislyktes',
    statusCancelled: 'Opplastingen ble avbrutt',
    typeUnknown: 'Ukjent filtype',
    remove: 'Fjern',
    cancel: 'Avbryt',
    retry: 'Prøv igjen',
    duplicateName: ({ name, number }) => `${name} (${number})`,
    errorType: ({ name, allowed }, format) =>
      `${name} har et filformat som ikke kan brukes. Velg en fil i formatet ${format.list(allowed, { type: 'disjunction' })}.`,
    errorTooLarge: ({ name, size, limit }, format) =>
      `${name} er ${formatFileSize(format, size)}. Velg en fil som er maks ${formatFileSize(format, limit)}. Du kan gjøre et bilde eller en skanning mindre ved å lagre eller skanne det på nytt med lavere oppløsning.`,
    errorTooSmall: ({ name, size, limit }, format) =>
      `${name} er ${formatFileSize(format, size)}. Velg en fil som er minst ${formatFileSize(format, limit)}.`,
    errorEmpty: ({ name }) => `${name} er tom. Kontroller at du har valgt riktig fil.`,
    errorTooMany: ({ name, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${name} ble ikke lagt til. Du kan bare legge til 1 fil.`,
        other: `${name} ble ikke lagt til. Du kan legge til opptil ${format.number(maxFiles)} filer. Fjern en fil hvis du vil legge til en annen.`,
      }),
    errorDuplicate: ({ name }) => `${name} er allerede i listen.`,
    errorFolder: ({ name }) => `${name} er en mappe. Åpne mappen og velg filene i den.`,
    uploadFailedMessage: ({ name }) =>
      `Vi kunne ikke laste opp ${name}. Hvis det fortsetter å feile, kontakt oss.`,
    rejectedFilePosition: ({ position, total, message }) =>
      `Fil ${position} av ${total}, ${message}`,
    removeFile: ({ name }) => `Fjern ${name}`,
    cancelFile: ({ name }) => `Avbryt opplastingen av ${name}`,
    retryFile: ({ name }) => `Prøv igjen med ${name}`,
    uploadingFile: ({ name }) => `Laster opp ${name}`,
    fileAdded: ({ name }) => `${name} er lagt til.`,
    filesAdded: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil er lagt til.',
        other: `${format.number(count)} filer er lagt til.`,
      }),
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunne ikke legges til.',
        other: `${format.number(count)} filer kunne ikke legges til.`,
      }),
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Laster opp 1 fil.',
        other: `Laster opp ${format.number(count)} filer.`,
      }),
    uploadComplete: ({ name }) => `${name} er lastet opp.`,
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil er lastet opp.',
        other: `${format.number(count)} filer er lastet opp.`,
      }),
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'Filen er lastet opp.',
        other: `Alle ${format.number(count)} filene er lastet opp.`,
      }),
    uploadFailed: ({ name }) => `${name} kunne ikke lastes opp.`,
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunne ikke lastes opp.',
        other: `${format.number(count)} filer kunne ikke lastes opp.`,
      }),
    fileRemoved: ({ name }) => `${name} er fjernet.`,
    announcementForField: ({ label, message }) => `${label}: ${message}`,
  },
} satisfies KvirnMessages
