import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

export const sv = {
  link: { newTabNotice: '(öppnas i en ny flik)' },
  field: { optional: '(valfritt)', errorPrefix: 'Fel:' },
  dateInput: {
    day: 'Dag',
    month: 'Månad',
    year: 'År',
    autoAdvanceHint: 'Fokus flyttas till nästa ruta när en ruta är full.',
  },
  alert: {
    infoPrefix: 'Information:',
    successPrefix: 'Klart:',
    warningPrefix: 'Varning:',
    dangerPrefix: 'Fel:',
    close: 'Stäng meddelandet',
  },
  dialog: { close: 'Stäng dialogrutan' },
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
    maximumDecimals: 'Du kan inte skriva fler decimaler.',
  },
  characterCount: {
    limit: ({ limit }, format) => `Du kan skriva högst ${format.number(limit)} tecken.`,
    remaining: ({ count }, format) =>
      format.plural(count, {
        one: 'Du har 1 tecken kvar.',
        other: `Du har ${format.number(count)} tecken kvar.`,
      }),
    over: ({ count }, format) =>
      format.plural(count, {
        one: 'Du har 1 tecken för mycket.',
        other: `Du har ${format.number(count)} tecken för mycket.`,
      }),
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
    rowDetailsNumber: ({ index }, format) => `Detaljer rad ${format.number(index)}`,
  },
  richText: {
    toolbar: 'Formatering',
    groupHistory: 'Ångra och gör om',
    groupTextStyle: 'Textstil',
    groupLists: 'Listor',
    groupInsert: 'Infoga',
    groupTable: 'Tabell',
    undo: 'Ångra',
    redo: 'Gör om',
    blockType: 'Texttyp',
    blockParagraph: 'Vanlig text',
    blockHeading2: 'Rubrik 2',
    blockHeading3: 'Rubrik 3',
    blockHeading4: 'Rubrik 4',
    blockQuote: 'Citat',
    blockCode: 'Kodblock',
    blockMixed: 'Flera typer',
    bold: 'Fetstil',
    italic: 'Kursiv',
    underline: 'Understrykning',
    strike: 'Genomstrykning',
    code: 'Kod',
    bulletList: 'Punktlista',
    orderedList: 'Numrerad lista',
    indent: 'Öka indrag',
    outdent: 'Minska indrag',
    link: 'Länk',
    image: 'Bild',
    table: 'Tabell',
    clearFormatting: 'Ta bort formatering',
    addRowAbove: 'Lägg till rad ovanför',
    addRowBelow: 'Lägg till rad nedanför',
    addColumnLeft: 'Lägg till kolumn till vänster',
    addColumnRight: 'Lägg till kolumn till höger',
    deleteRow: 'Ta bort raden',
    deleteColumn: 'Ta bort kolumnen',
    deleteTable: 'Ta bort tabellen',
    headerRow: 'Rubrikrad',
    linkAddTitle: 'Lägg till länk',
    linkEditTitle: 'Ändra länk',
    linkUrl: 'Webbadress',
    linkUrlHint: 'Till exempel https://www.exempel.se',
    linkText: 'Länktext',
    linkTextHint: 'Skriv vart länken leder, till exempel Ansök om parkeringstillstånd.',
    linkAdd: 'Lägg till länk',
    save: 'Spara',
    linkRemove: 'Ta bort länk',
    cancel: 'Avbryt',
    linkUrlMissing: 'Skriv en webbadress.',
    linkUrlInvalid: 'Skriv webbadressen som https://www.exempel.se',
    linkTextMissing: 'Skriv en länktext.',
    imageAddTitle: 'Lägg till bild',
    imageEditTitle: 'Ändra bild',
    imageUrl: 'Bildens webbadress',
    imageUrlHint: 'Till exempel https://www.exempel.se/karta.png',
    imageAlt: 'Vad visar bilden?',
    imageAltHint: 'Texten läses upp för den som inte ser bilden.',
    imageDecorative: 'Bilden är bara dekoration',
    imageDecorativeHint: 'Den visar inget som behöver beskrivas.',
    imageAdd: 'Lägg till bild',
    imageRemove: 'Ta bort bild',
    imageUrlMissing: 'Skriv bildens webbadress.',
    imageUrlInvalid: 'Skriv webbadressen som https://www.exempel.se/karta.png',
    imageUrlNotAllowed:
      'Bilder från den adressen får inte användas här. Skriv en annan webbadress.',
    imageAltMissing: 'Beskriv vad bilden visar, eller kryssa i att den bara är dekoration.',
    linkAdded: 'Länken är tillagd.',
    linkUpdated: 'Länken är ändrad.',
    linkRemoved: 'Länken är borttagen.',
    imageAdded: 'Bilden är tillagd.',
    imageUpdated: 'Bilden är ändrad.',
    imageRemoved: 'Bilden är borttagen.',
    tableInserted: ({ columns, rows }, format) =>
      `Tabell med ${format.plural(columns, { one: '1 kolumn', other: `${format.number(columns)} kolumner` })} och ${format.plural(rows, { one: '1 rad', other: `${format.number(rows)} rader` })} tillagd.`,
    rowAdded: 'Raden är tillagd.',
    columnAdded: 'Kolumnen är tillagd.',
    rowDeleted: 'Raden är borttagen.',
    columnDeleted: 'Kolumnen är borttagen.',
    tableDeleted: ({ shortcut }) => `Tabellen är borttagen. Ångra med ${shortcut}.`,
    listLevel: ({ level }) => `Nivå ${level}`,
    formattingCleared: 'Formateringen är borttagen.',
    undone: 'Ångrat.',
    redone: 'Gjort om.',
    formatOn: ({ name }) => `${name} på`,
    formatOff: ({ name }) => `${name} av`,
    imagePasteNotSupported: 'Bilder kan inte klistras in. Använd knappen Bild.',
    imageSourceNotAllowed:
      'Den inklistrade bilden lades inte till, eftersom den kommer från en adress som inte är tillåten.',
  },
  tableOfContents: { label: 'På den här sidan' },
  skipLink: { label: 'Hoppa till huvudinnehållet' },
  breadcrumb: { label: 'Du är här' },
  pagination: {
    label: 'Sidor',
    previous: 'Föregående sida',
    next: 'Nästa sida',
    status: ({ page, total }, format) => `Sida ${format.number(page)} av ${format.number(total)}`,
    page: ({ page }, format) => `Sida ${format.number(page)}`,
  },
  routeFocus: { navigated: ({ title }) => `Du har kommit till ${title}` },
  copyButton: {
    label: 'Kopiera',
    copied: 'Kopierat',
    failed: 'Det gick inte att kopiera. Markera texten och kopiera den själv.',
  },
  readAloud: {
    label: 'Lyssna på texten',
    play: 'Lyssna',
    playSelection: 'Lyssna på markerad text',
    pause: 'Pausa',
    previous: 'Föregående mening',
    next: 'Nästa mening',
    stop: 'Stoppa',
    rate: 'Hastighet',
    voice: 'Röst',
    rateOption: ({ rate }, format) => `${format.number(rate)}×`,
    position: ({ current, total }, format) =>
      `Mening ${format.number(current)} av ${format.number(total)}`,
    positionPaused: ({ current, total }, format) =>
      `Pausad vid mening ${format.number(current)} av ${format.number(total)}`,
    noVoice: ({ language }) =>
      `Den här enheten har ingen röst för ${language}. Du kan lägga till en i enhetens talinställningar.`,
    speechError: 'Texten kunde inte läsas upp. Försök igen.',
    unsupported: 'Den här webbläsaren kan inte läsa upp text.',
  },
  errorSummary: { title: 'Det finns ett problem', titlePrefix: 'Fel:' },
  summaryList: { change: 'Ändra' },
  toast: { regionLabel: 'Meddelanden' },
  stepper: {
    status: ({ current, total }, format) =>
      `Steg ${format.number(current)} av ${format.number(total)}`,
    statusWithName: ({ current, total, name }, format) =>
      `Steg ${format.number(current)} av ${format.number(total)}: ${name}`,
  },
  progress: {
    loading: 'Laddar.',
    slow: 'Det tar längre tid än vanligt. Låt den här sidan vara öppen.',
    valueText: ({ label, percent }, format) =>
      `${label}, ${format.number(percent / 100, { style: 'percent' })}`,
  },
  tag: { remove: ({ label }) => `Ta bort ${label}`, removed: ({ label }) => `${label} borttagen.` },
  filters: {
    heading: 'Filter',
    disclosure: ({ count }, format) =>
      format.plural(count, {
        zero: 'Filter',
        one: 'Filter, 1 valt',
        other: `Filter, ${format.number(count)} valda`,
      }),
    applied: 'Valda filter',
    none: 'Inga filter valda',
    appliedValue: ({ group, value }) => `${group}: ${value}`,
    clearAll: 'Rensa alla filter',
    apply: 'Visa resultat',
    sortLabel: 'Sortera efter',
    sortRelevance: 'Mest relevanta',
    sortNewest: 'Nyast först',
    sortOldest: 'Äldst först',
    sortNameAscending: 'Namn, A–Ö',
    resultCount: ({ count }, format) =>
      format.plural(count, {
        zero: 'Inga resultat',
        one: '1 resultat',
        other: `${format.number(count)} resultat`,
      }),
    removedResultCount: ({ label, count }, format) =>
      `${label} borttagen. ${format.plural(count, { zero: 'Inga resultat', one: '1 resultat', other: `${format.number(count)} resultat` })}.`,
    clearedResultCount: ({ count }, format) =>
      `Alla filter är rensade. ${format.plural(count, { zero: 'Inga resultat', one: '1 resultat', other: `${format.number(count)} resultat` })}.`,
    noResults: 'Inga resultat matchar filtren.',
    noResultsHint: 'Testa att ta bort ett filter eller rensa alla filter.',
    loading: 'Uppdaterar resultat',
    loadFailed: 'Resultaten kunde inte uppdateras.',
    retry: 'Försök igen',
  },
  calendar: {
    previousMonth: 'Föregående månad',
    nextMonth: 'Nästa månad',
    previousYear: 'Föregående år',
    nextYear: 'Nästa år',
    dayName: ({ date, isToday, rangePosition, rangeNote, description }) =>
      [date, isToday ? 'idag' : undefined, rangePosition, rangeNote, description]
        .filter((part) => part !== undefined)
        .join(', '),
    weekHeader: 'v.',
    weekHeaderLong: 'Vecka',
    weekName: ({ week }, format) => `Vecka ${format.number(week)}`,
    rangeHint: ({ min, max }) =>
      min !== undefined && max !== undefined
        ? `Datum från ${min} till ${max}`
        : min !== undefined
          ? `Datum från ${min}`
          : `Datum till och med ${max}`,
    selected: ({ date }) => `${date} vald`,
    rangeStart: 'startdatum',
    rangeEnd: 'slutdatum',
    rangeStartAndEnd: 'start- och slutdatum',
    rangeLength: ({ days }, format) =>
      format.plural(days, { one: '1 dag', other: `${format.number(days)} dagar` }),
    rangeTooShort: ({ minimum }, format) =>
      `färre än ${format.plural(minimum, { one: '1 dag', other: `${format.number(minimum)} dagar` })}`,
    rangeTooLong: ({ maximum }, format) =>
      `fler än ${format.plural(maximum, { one: '1 dag', other: `${format.number(maximum)} dagar` })}`,
    rangeBlocked: 'en otillgänglig dag ligger emellan',
    rangeBeforeStart: 'före startdatumet',
    rangeSpanHint: ({ minimum, maximum }, format) =>
      minimum !== undefined && maximum !== undefined
        ? `${format.number(minimum)} till ${format.plural(maximum, { one: '1 dag', other: `${format.number(maximum)} dagar` })}`
        : minimum !== undefined
          ? `minst ${format.plural(minimum, { one: '1 dag', other: `${format.number(minimum)} dagar` })}`
          : `högst ${format.plural(maximum ?? 0, { one: '1 dag', other: `${format.number(maximum ?? 0)} dagar` })}`,
    rangeChooseStart: 'Välj startdatum.',
    rangeChooseEnd: ({ start }) => `Startdatum ${start}. Välj slutdatum.`,
    rangeSelected: ({ start, end, length }) => `${start} till ${end} valda, ${length}`,
    rangeEndSelected: ({ date }) => `Slutdatum ${date} valt.`,
    rangeEndCleared: 'Slutdatum rensat.',
    visibleMonths: ({ first, last }) => `${first} och ${last}`,
  },
  datePicker: {
    trigger: 'Välj datum',
    title: 'Välj ett datum',
  },
  dateRangePicker: {
    trigger: 'Välj datumen',
    title: 'Välj perioden',
  },
} satisfies KvirnMessages
