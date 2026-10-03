import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

export const sv = {
  link: { newTabNotice: '(öppnas i en ny flik)' },
  field: { optional: '(valfritt)', errorPrefix: 'Fel:' },
  notification: {
    infoPrefix: 'Information:',
    successPrefix: 'Klart:',
    warningPrefix: 'Varning:',
    dangerPrefix: 'Fel:',
  },
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 resultat', other: `${format.number(count)} resultat` }),
    noResults: 'Inga resultat',
    loading: 'Laddar resultat',
    removeValue: ({ label }) => `Ta bort ${label}`,
    clear: 'Rensa',
    showOptions: 'Visa alternativ',
  },
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Här kan du bara skriva siffror.',
        letters: 'Här kan du bara skriva bokstäver.',
        lettersAndDigits: 'Här kan du bara skriva bokstäver och siffror.',
        other: 'Det tecknet kan inte skrivas här.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrivit alla ${length} tecken.`,
  },
  fileUpload: {
    chooseFiles: 'Välj filer',
    chooseFile: 'Välj fil',
    replaceFile: 'Byt fil',
    dropHint: ({ multiple }) => (multiple ? 'eller släpp filer här' : 'eller släpp en fil här'),
    dropHintActive: ({ multiple }) =>
      multiple ? 'Släpp filerna för att lägga till dem' : 'Släpp filen för att lägga till den',
    limitsMaxFiles: ({ count }, format) =>
      format.plural(count, {
        one: 'Du kan lägga till 1 fil.',
        other: `Du kan lägga till högst ${format.number(count)} filer.`,
      }),
    limitsTypes: ({ allowed, multiple }, format) => {
      const types = format.list(allowed, { type: 'disjunction' })
      return multiple
        ? `Filerna ska vara i formatet ${types}.`
        : `Filen ska vara i formatet ${types}.`
    },
    limitsMaxSize: ({ limit, multiple }, format) =>
      multiple
        ? `Varje fil får vara högst ${formatFileSize(format, limit)}.`
        : `Filen får vara högst ${formatFileSize(format, limit)}.`,
    summary: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil tillagd',
        other: `${format.number(count)} filer tillagda`,
      }),
    summaryOfMax: ({ count, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${format.number(count)} av 1 fil tillagd`,
        other: `${format.number(count)} av ${format.number(maxFiles)} filer tillagda`,
      }),
    summaryFull: ({ maxFiles }, format) =>
      format.plural(maxFiles, {
        one: '1 av 1 fil tillagd. Ta bort filen om du vill lägga till en annan.',
        other: `${format.number(maxFiles)} av ${format.number(maxFiles)} filer tillagda. Ta bort en fil om du vill lägga till en annan.`,
      }),
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunde inte läggas till:',
        other: `${format.number(count)} filer kunde inte läggas till:`,
      }),
    statusReady: 'Tillagd. Skickas med formuläret',
    statusQueued: 'Väntar på att laddas upp',
    statusUploading: 'Laddar upp',
    statusUploadingPercent: ({ percent }, format) =>
      `Laddar upp, ${format.number(percent / 100, { style: 'percent' })}`,
    statusComplete: 'Uppladdad',
    statusFailed: 'Uppladdningen misslyckades',
    statusCancelled: 'Uppladdningen avbröts',
    typeUnknown: 'Okänd filtyp',
    remove: 'Ta bort',
    cancel: 'Avbryt',
    retry: 'Försök igen',
    duplicateName: ({ name, number }) => `${name} (${number})`,
    errorType: ({ name, allowed }, format) =>
      `${name} har ett filformat som inte går att använda. Välj en fil i formatet ${format.list(allowed, { type: 'disjunction' })}.`,
    errorTooLarge: ({ name, size, limit }, format) =>
      `${name} är ${formatFileSize(format, size)}. Välj en fil som är högst ${formatFileSize(format, limit)}. Du kan göra en bild eller en skanning mindre genom att spara eller skanna den igen med lägre upplösning.`,
    errorTooSmall: ({ name, size, limit }, format) =>
      `${name} är ${formatFileSize(format, size)}. Välj en fil som är minst ${formatFileSize(format, limit)}.`,
    errorEmpty: ({ name }) => `${name} är tom. Kontrollera att du har valt rätt fil.`,
    errorTooMany: ({ name, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${name} lades inte till. Du kan bara lägga till 1 fil.`,
        other: `${name} lades inte till. Du kan lägga till högst ${format.number(maxFiles)} filer. Ta bort en fil om du vill lägga till en annan.`,
      }),
    errorDuplicate: ({ name }) => `${name} finns redan i listan.`,
    errorFolder: ({ name }) => `${name} är en mapp. Öppna mappen och välj filerna i den.`,
    uploadFailedMessage: ({ name }) =>
      `Det gick inte att ladda upp ${name}. Om det fortsätter att misslyckas, kontakta oss.`,
    rejectedFilePosition: ({ position, total, message }) =>
      `Fil ${position} av ${total}, ${message}`,
    removeFile: ({ name }) => `Ta bort ${name}`,
    cancelFile: ({ name }) => `Avbryt uppladdningen av ${name}`,
    retryFile: ({ name }) => `Försök igen med ${name}`,
    uploadingFile: ({ name }) => `Laddar upp ${name}`,
    fileAdded: ({ name }) => `${name} har lagts till.`,
    filesAdded: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil har lagts till.',
        other: `${format.number(count)} filer har lagts till.`,
      }),
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunde inte läggas till.',
        other: `${format.number(count)} filer kunde inte läggas till.`,
      }),
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Laddar upp 1 fil.',
        other: `Laddar upp ${format.number(count)} filer.`,
      }),
    uploadComplete: ({ name }) => `${name} har laddats upp.`,
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil har laddats upp.',
        other: `${format.number(count)} filer har laddats upp.`,
      }),
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'Filen har laddats upp.',
        other: `Alla ${format.number(count)} filer har laddats upp.`,
      }),
    uploadFailed: ({ name }) => `${name} kunde inte laddas upp.`,
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: '1 fil kunde inte laddas upp.',
        other: `${format.number(count)} filer kunde inte laddas upp.`,
      }),
    fileRemoved: ({ name }) => `${name} har tagits bort.`,
    announcementForField: ({ label, message }) => `${label}: ${message}`,
  },
  table: {
    sortedAscending: ({ column }) => `Sorterad efter ${column}, stigande.`,
    sortedDescending: ({ column }) => `Sorterad efter ${column}, fallande.`,
    sortCleared: ({ column }) => `Inte längre sorterad efter ${column}.`,
    selectRow: 'Välj',
    selectRowNumber: ({ index }, format) => `Välj rad ${format.number(index)}`,
    selectAllRows: 'Välj alla rader',
    selectedCount: ({ count }, format) =>
      format.plural(count, {
        one: '1 rad markerad.',
        other: `${format.number(count)} rader markerade.`,
      }),
    rowCount: ({ count }, format) =>
      format.plural(count, { one: '1 rad.', other: `${format.number(count)} rader.` }),
    loading: 'Laddar rader.',
    empty: 'Det finns inga rader att visa.',
    rowDetails: 'Detaljer',
  },
} satisfies KvirnMessages
