import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

// nb: copyButton.* is a draft (Plan 0060): a native speaker should review it.
// breadcrumb.* and pagination.* are drafts for a native speaker to review (Plan 0062).
// Draft: errorSummary and summaryList (Plan 0063) need a native speaker's review.
export const nb = {
  link: { newTabNotice: '(åpnes i en ny fane)' },
  field: { optional: '(valgfritt)', errorPrefix: 'Feil:' },
  dateInput: {
    day: 'Dag',
    month: 'Måned',
    year: 'År',
    autoAdvanceHint: 'Fokus flyttes til neste felt når et felt er fullt.',
  },
  alert: {
    infoPrefix: 'Informasjon:',
    successPrefix: 'Fullført:',
    warningPrefix: 'Advarsel:',
    dangerPrefix: 'Feil:',
    close: 'Lukk meldingen',
  },
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 treff', other: `${format.number(count)} treff` }),
    noResults: 'Ingen treff',
    loading: 'Laster treff',
    removeValue: ({ label }) => `Fjern ${label}`,
    clear: 'Tøm',
    showOptions: 'Vis alternativer',
  },
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Her kan du bare skrive sifre.',
        letters: 'Her kan du bare skrive bokstaver.',
        lettersAndDigits: 'Her kan du bare skrive bokstaver og sifre.',
        other: 'Du kan ikke skrive det tegnet her.',
      })[allowed],
    maximumLength: ({ length }) => `Du har skrevet alle ${length} tegnene.`,
    maximumDecimals: 'Du kan ikke skrive flere desimaler.',
  },
  characterCount: {
    limit: ({ limit }, format) => `Du kan skrive maks ${format.number(limit)} tegn.`,
    remaining: ({ count }, format) =>
      format.plural(count, {
        one: 'Du har 1 tegn igjen.',
        other: `Du har ${format.number(count)} tegn igjen.`,
      }),
    over: ({ count }, format) =>
      format.plural(count, {
        one: 'Du har 1 tegn for mye.',
        other: `Du har ${format.number(count)} tegn for mye.`,
      }),
  },
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
      `Vi kunne ikke laste opp ${name}. Hvis det fortsetter å feile, ta kontakt med oss.`,
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
  table: {
    sortedAscending: ({ column }) => `Sortert etter ${column}, stigende.`,
    sortedDescending: ({ column }) => `Sortert etter ${column}, synkende.`,
    sortCleared: ({ column }) => `Ikke lenger sortert etter ${column}.`,
    selectRow: 'Velg',
    selectRowNumber: ({ index }, format) => `Velg rad ${format.number(index)}`,
    selectAllRows: 'Velg alle rader',
    selectedCount: ({ count }, format) =>
      format.plural(count, {
        one: '1 rad valgt.',
        other: `${format.number(count)} rader valgt.`,
      }),
    rowCount: ({ count }, format) =>
      format.plural(count, { one: '1 rad.', other: `${format.number(count)} rader.` }),
    loading: 'Laster rader.',
    empty: 'Det er ingen rader å vise.',
    rowDetails: 'Detaljer',
    rowDetailsNumber: ({ index }, format) => `Detaljer rad ${format.number(index)}`,
  },
  richText: {
    toolbar: 'Formatering',
    groupHistory: 'Angre og gjør om',
    groupTextStyle: 'Tekststil',
    groupLists: 'Lister',
    groupInsert: 'Sett inn',
    groupTable: 'Tabell',
    undo: 'Angre',
    redo: 'Gjør om',
    blockType: 'Teksttype',
    blockParagraph: 'Vanlig tekst',
    blockHeading2: 'Overskrift 2',
    blockHeading3: 'Overskrift 3',
    blockHeading4: 'Overskrift 4',
    blockQuote: 'Sitat',
    blockCode: 'Kodeblokk',
    blockMixed: 'Flere typer',
    bold: 'Fet',
    italic: 'Kursiv',
    underline: 'Understreking',
    strike: 'Gjennomstreking',
    code: 'Kode',
    bulletList: 'Punktliste',
    orderedList: 'Nummerert liste',
    indent: 'Øk innrykk',
    outdent: 'Reduser innrykk',
    link: 'Lenke',
    image: 'Bilde',
    table: 'Tabell',
    clearFormatting: 'Fjern formatering',
    addRowAbove: 'Legg til rad over',
    addRowBelow: 'Legg til rad under',
    addColumnLeft: 'Legg til kolonne til venstre',
    addColumnRight: 'Legg til kolonne til høyre',
    deleteRow: 'Slett raden',
    deleteColumn: 'Slett kolonnen',
    deleteTable: 'Slett tabellen',
    headerRow: 'Overskriftsrad',
    linkAddTitle: 'Legg til lenke',
    linkEditTitle: 'Endre lenke',
    linkUrl: 'Nettadresse',
    linkUrlHint: 'For eksempel https://www.eksempel.no',
    linkText: 'Lenketekst',
    linkTextHint: 'Skriv hvor lenken fører, for eksempel Søk om parkeringstillatelse.',
    linkAdd: 'Legg til lenke',
    save: 'Lagre',
    linkRemove: 'Fjern lenke',
    cancel: 'Avbryt',
    linkUrlMissing: 'Skriv en nettadresse.',
    linkUrlInvalid: 'Skriv nettadressen slik: https://www.eksempel.no',
    linkTextMissing: 'Skriv en lenketekst.',
    imageAddTitle: 'Legg til bilde',
    imageEditTitle: 'Endre bilde',
    imageUrl: 'Bildets nettadresse',
    imageUrlHint: 'For eksempel https://www.eksempel.no/kart.png',
    imageAlt: 'Hva viser bildet?',
    imageAltHint: 'Teksten leses opp for den som ikke ser bildet.',
    imageDecorative: 'Bildet er bare dekorasjon',
    imageDecorativeHint: 'Det viser ingenting som må beskrives.',
    imageAdd: 'Legg til bilde',
    imageRemove: 'Fjern bilde',
    imageUrlMissing: 'Skriv bildets nettadresse.',
    imageUrlInvalid: 'Skriv nettadressen slik: https://www.eksempel.no/kart.png',
    imageUrlNotAllowed: 'Bilder fra den adressen kan ikke brukes her. Skriv en annen nettadresse.',
    imageAltMissing: 'Beskriv hva bildet viser, eller huk av for at det bare er dekorasjon.',
    linkAdded: 'Lenken er lagt til.',
    linkUpdated: 'Lenken er endret.',
    linkRemoved: 'Lenken er fjernet.',
    imageAdded: 'Bildet er lagt til.',
    imageUpdated: 'Bildet er endret.',
    imageRemoved: 'Bildet er fjernet.',
    tableInserted: ({ columns, rows }, format) =>
      `Tabell med ${format.plural(columns, { one: '1 kolonne', other: `${format.number(columns)} kolonner` })} og ${format.plural(rows, { one: '1 rad', other: `${format.number(rows)} rader` })} lagt til.`,
    rowAdded: 'Raden er lagt til.',
    columnAdded: 'Kolonnen er lagt til.',
    rowDeleted: 'Raden er slettet.',
    columnDeleted: 'Kolonnen er slettet.',
    tableDeleted: ({ shortcut }) => `Tabellen er slettet. Angre med ${shortcut}.`,
    listLevel: ({ level }) => `Nivå ${level}`,
    formattingCleared: 'Formateringen er fjernet.',
    undone: 'Angret.',
    redone: 'Gjort om.',
    formatOn: ({ name }) => `${name} på`,
    formatOff: ({ name }) => `${name} av`,
    imagePasteNotSupported: 'Bilder kan ikke limes inn. Bruk knappen Bilde.',
    imageSourceNotAllowed:
      'Det innlimte bildet ble ikke lagt til, fordi det kommer fra en adresse som ikke er tillatt.',
  },
  tableOfContents: { label: 'På denne siden' },
  skipLink: { label: 'Gå til hovedinnhold' },
  breadcrumb: { label: 'Du er her' },
  pagination: {
    label: 'Sider',
    previous: 'Forrige side',
    next: 'Neste side',
    status: ({ page, total }, format) => `Side ${format.number(page)} av ${format.number(total)}`,
    page: ({ page }, format) => `Side ${format.number(page)}`,
  },
  routeFocus: { navigated: ({ title }) => `Du har kommet til ${title}` },
  copyButton: {
    label: 'Kopier',
    copied: 'Kopiert',
    failed: 'Kunne ikke kopiere. Marker teksten og kopier den selv.',
  },
  errorSummary: { title: 'Det er et problem', titlePrefix: 'Feil:' },
  summaryList: { change: 'Endre' },
} satisfies KvirnMessages
