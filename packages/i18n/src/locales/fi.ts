import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

// fi: copyButton.* is a draft (Plan 0060): a native speaker should review it.
// stepper.* are drafts for native review (Plan 0083).
// breadcrumb.* and pagination.* are drafts for a native speaker to review (Plan 0062).
// Draft: errorSummary and summaryList (Plan 0063) need a native speaker's review.
export const fi = {
  link: { newTabNotice: '(avautuu uuteen välilehteen)' },
  field: { optional: '(vapaaehtoinen)', errorPrefix: 'Virhe:' },
  dateInput: {
    day: 'Päivä',
    month: 'Kuukausi',
    year: 'Vuosi',
    autoAdvanceHint: 'Kohdistus siirtyy seuraavaan kenttään, kun kenttä on täynnä.',
  },
  alert: {
    infoPrefix: 'Tiedoksi:',
    successPrefix: 'Valmis:',
    warningPrefix: 'Varoitus:',
    dangerPrefix: 'Virhe:',
    close: 'Sulje ilmoitus',
  },
  dialog: { close: 'Sulje dialogi' },
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 tulos', other: `${format.number(count)} tulosta` }),
    noResults: 'Ei tuloksia',
    loading: 'Ladataan tuloksia',
    removeValue: ({ label }) => `Poista ${label}`,
    clear: 'Tyhjennä',
    showOptions: 'Näytä vaihtoehdot',
  },
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Tähän voi kirjoittaa vain numeroita.',
        letters: 'Tähän voi kirjoittaa vain kirjaimia.',
        lettersAndDigits: 'Tähän voi kirjoittaa vain kirjaimia ja numeroita.',
        other: 'Tätä merkkiä ei voi kirjoittaa tähän.',
      })[allowed],
    maximumLength: ({ length }) => `Olet kirjoittanut kaikki ${length} merkkiä.`,
    maximumDecimals: 'Desimaaleja ei voi kirjoittaa enempää.',
  },
  characterCount: {
    limit: ({ limit }, format) => `Voit kirjoittaa enintään ${format.number(limit)} merkkiä.`,
    remaining: ({ count }, format) =>
      format.plural(count, {
        one: 'Sinulla on 1 merkki jäljellä.',
        other: `Sinulla on ${format.number(count)} merkkiä jäljellä.`,
      }),
    over: ({ count }, format) =>
      format.plural(count, {
        one: 'Sinulla on 1 merkki liikaa.',
        other: `Sinulla on ${format.number(count)} merkkiä liikaa.`,
      }),
  },
  fileUpload: {
    chooseFiles: 'Valitse tiedostot',
    chooseFile: 'Valitse tiedosto',
    replaceFile: 'Vaihda tiedosto',
    dropHint: ({ multiple }) =>
      multiple ? 'tai pudota tiedostot tähän' : 'tai pudota tiedosto tähän',
    dropHintActive: ({ multiple }) =>
      multiple ? 'Pudota tiedostot lisätäksesi ne' : 'Pudota tiedosto lisätäksesi sen',
    limitsMaxFiles: ({ count }, format) =>
      format.plural(count, {
        one: 'Voit lisätä yhden tiedoston.',
        other: `Voit lisätä enintään ${format.number(count)} tiedostoa.`,
      }),
    limitsTypes: ({ allowed, multiple }, format) => {
      const types = format.list(allowed, { type: 'disjunction' })
      return multiple
        ? `Tiedostojen on oltava muodossa ${types}.`
        : `Tiedoston on oltava muodossa ${types}.`
    },
    limitsMaxSize: ({ limit, multiple }, format) =>
      multiple
        ? `Jokaisen tiedoston enimmäiskoko on ${formatFileSize(format, limit)}.`
        : `Tiedoston enimmäiskoko on ${formatFileSize(format, limit)}.`,
    summary: ({ count }, format) =>
      format.plural(count, {
        one: '1 tiedosto lisätty',
        other: `${format.number(count)} tiedostoa lisätty`,
      }),
    summaryOfMax: ({ count, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `${format.number(count)}/1 tiedosto lisätty`,
        other: `${format.number(count)}/${format.number(maxFiles)} tiedostoa lisätty`,
      }),
    summaryFull: ({ maxFiles }, format) =>
      format.plural(maxFiles, {
        one: '1/1 tiedosto lisätty. Poista tiedosto, jos haluat lisätä toisen.',
        other: `${format.number(maxFiles)}/${format.number(maxFiles)} tiedostoa lisätty. Poista tiedosto, jos haluat lisätä toisen.`,
      }),
    rejectedHeading: ({ count }, format) =>
      format.plural(count, {
        one: 'Yhtä tiedostoa ei voitu lisätä:',
        other: `${format.number(count)} tiedostoa ei voitu lisätä:`,
      }),
    statusReady: 'Lisätty. Lähetetään lomakkeen mukana',
    statusQueued: 'Odottaa latausta',
    statusUploading: 'Ladataan',
    statusUploadingPercent: ({ percent }, format) =>
      `Ladataan, ${format.number(percent / 100, { style: 'percent' })}`,
    statusComplete: 'Ladattu',
    statusFailed: 'Lataus epäonnistui',
    statusCancelled: 'Lataus peruutettu',
    typeUnknown: 'Tuntematon tyyppi',
    remove: 'Poista',
    cancel: 'Peruuta',
    retry: 'Yritä uudelleen',
    duplicateName: ({ name, number }) => `${name} (${number})`,
    errorType: ({ name, allowed }, format) =>
      `Tiedosto ${name} on tiedostomuodossa, jota emme voi käyttää. Valitse tiedosto, jonka muoto on ${format.list(allowed, { type: 'disjunction' })}.`,
    errorTooLarge: ({ name, size, limit }, format) =>
      `Tiedoston ${name} koko on ${formatFileSize(format, size)}. Valitse tiedosto, jonka koko on enintään ${formatFileSize(format, limit)}. Voit pienentää kuvaa tai skannausta tallentamalla tai skannaamalla sen uudelleen pienemmällä tarkkuudella.`,
    errorTooSmall: ({ name, size, limit }, format) =>
      `Tiedoston ${name} koko on ${formatFileSize(format, size)}. Valitse tiedosto, jonka koko on vähintään ${formatFileSize(format, limit)}.`,
    errorEmpty: ({ name }) =>
      `Tiedosto ${name} on tyhjä. Tarkista, että valitsit oikean tiedoston.`,
    errorTooMany: ({ name, maxFiles }, format) =>
      format.plural(maxFiles, {
        one: `Tiedostoa ${name} ei lisätty. Voit lisätä vain yhden tiedoston.`,
        other: `Tiedostoa ${name} ei lisätty. Voit lisätä enintään ${format.number(maxFiles)} tiedostoa. Poista tiedosto, jos haluat lisätä toisen.`,
      }),
    errorDuplicate: ({ name }) => `Tiedosto ${name} on jo luettelossa.`,
    errorFolder: ({ name }) =>
      `Kohde ${name} on kansio. Avaa kansio ja valitse sen sisältämät tiedostot.`,
    uploadFailedMessage: ({ name }) =>
      `Tiedoston ${name} lataaminen ei onnistunut. Jos se epäonnistuu jatkuvasti, ota meihin yhteyttä.`,
    rejectedFilePosition: ({ position, total, message }) =>
      `Tiedosto ${position}/${total}, ${message}`,
    removeFile: ({ name }) => `Poista tiedosto ${name}`,
    cancelFile: ({ name }) => `Peruuta tiedoston ${name} lataus`,
    retryFile: ({ name }) => `Yritä uudelleen tiedostolla ${name}`,
    uploadingFile: ({ name }) => `Ladataan tiedostoa ${name}`,
    fileAdded: ({ name }) => `Tiedosto ${name} lisätty.`,
    filesAdded: ({ count }, format) =>
      format.plural(count, {
        one: '1 tiedosto lisätty.',
        other: `${format.number(count)} tiedostoa lisätty.`,
      }),
    filesRejected: ({ count }, format) =>
      format.plural(count, {
        one: 'Yhtä tiedostoa ei voitu lisätä.',
        other: `${format.number(count)} tiedostoa ei voitu lisätä.`,
      }),
    uploadsStarted: ({ count }, format) =>
      format.plural(count, {
        one: 'Ladataan yhtä tiedostoa.',
        other: `Ladataan ${format.number(count)} tiedostoa.`,
      }),
    uploadComplete: ({ name }) => `Tiedosto ${name} ladattu.`,
    uploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: '1 tiedosto ladattu.',
        other: `${format.number(count)} tiedostoa ladattu.`,
      }),
    allUploadsComplete: ({ count }, format) =>
      format.plural(count, {
        one: 'Tiedosto on ladattu.',
        other: `Kaikki ${format.number(count)} tiedostoa on ladattu.`,
      }),
    uploadFailed: ({ name }) => `Tiedoston ${name} lataus epäonnistui.`,
    uploadsFailed: ({ count }, format) =>
      format.plural(count, {
        one: 'Yhden tiedoston lataus epäonnistui.',
        other: `${format.number(count)} tiedoston lataus epäonnistui.`,
      }),
    fileRemoved: ({ name }) => `Tiedosto ${name} poistettu.`,
    announcementForField: ({ label, message }) => `${label}: ${message}`,
  },
  table: {
    sortedAscending: ({ column }) => `Lajiteltu sarakkeen ${column} mukaan, nouseva.`,
    sortedDescending: ({ column }) => `Lajiteltu sarakkeen ${column} mukaan, laskeva.`,
    sortCleared: ({ column }) => `Lajittelu sarakkeen ${column} mukaan on poistettu.`,
    selectRow: 'Valitse',
    selectRowNumber: ({ index }, format) => `Valitse rivi ${format.number(index)}`,
    selectAllRows: 'Valitse kaikki rivit',
    selectedCount: ({ count }, format) =>
      format.plural(count, {
        one: '1 rivi valittu.',
        other: `${format.number(count)} riviä valittu.`,
      }),
    rowCount: ({ count }, format) =>
      format.plural(count, { one: '1 rivi.', other: `${format.number(count)} riviä.` }),
    loading: 'Ladataan rivejä.',
    empty: 'Ei näytettäviä rivejä.',
    rowDetails: 'Lisätiedot',
    rowDetailsNumber: ({ index }, format) => `Lisätiedot rivi ${format.number(index)}`,
  },
  richText: {
    toolbar: 'Muotoilu',
    groupHistory: 'Kumoa ja tee uudelleen',
    groupTextStyle: 'Tekstin tyyli',
    groupLists: 'Luettelot',
    groupInsert: 'Lisää',
    groupTable: 'Taulukko',
    undo: 'Kumoa',
    redo: 'Tee uudelleen',
    blockType: 'Tekstityyppi',
    blockParagraph: 'Tavallinen teksti',
    blockHeading2: 'Otsikko 2',
    blockHeading3: 'Otsikko 3',
    blockHeading4: 'Otsikko 4',
    blockQuote: 'Lainaus',
    blockCode: 'Koodilohko',
    blockMixed: 'Useita tyyppejä',
    bold: 'Lihavointi',
    italic: 'Kursiivi',
    underline: 'Alleviivaus',
    strike: 'Yliviivaus',
    code: 'Koodi',
    bulletList: 'Luettelomerkit',
    orderedList: 'Numeroitu luettelo',
    indent: 'Suurenna sisennystä',
    outdent: 'Pienennä sisennystä',
    link: 'Linkki',
    image: 'Kuva',
    table: 'Taulukko',
    clearFormatting: 'Poista muotoilu',
    addRowAbove: 'Lisää rivi yläpuolelle',
    addRowBelow: 'Lisää rivi alapuolelle',
    addColumnLeft: 'Lisää sarake vasemmalle',
    addColumnRight: 'Lisää sarake oikealle',
    deleteRow: 'Poista rivi',
    deleteColumn: 'Poista sarake',
    deleteTable: 'Poista taulukko',
    headerRow: 'Otsikkorivi',
    linkAddTitle: 'Lisää linkki',
    linkEditTitle: 'Muokkaa linkkiä',
    linkUrl: 'Verkko-osoite',
    linkUrlHint: 'Esimerkiksi https://www.esimerkki.fi',
    linkText: 'Linkin teksti',
    linkTextHint: 'Kerro, minne linkki vie, esimerkiksi Hae pysäköintilupaa.',
    linkAdd: 'Lisää linkki',
    save: 'Tallenna',
    linkRemove: 'Poista linkki',
    cancel: 'Peruuta',
    linkUrlMissing: 'Kirjoita verkko-osoite.',
    linkUrlInvalid: 'Kirjoita verkko-osoite muodossa https://www.esimerkki.fi',
    linkTextMissing: 'Kirjoita linkin teksti.',
    imageAddTitle: 'Lisää kuva',
    imageEditTitle: 'Muokkaa kuvaa',
    imageUrl: 'Kuvan verkko-osoite',
    imageUrlHint: 'Esimerkiksi https://www.esimerkki.fi/kartta.png',
    imageAlt: 'Mitä kuvassa näkyy?',
    imageAltHint: 'Teksti luetaan ääneen niille, jotka eivät näe kuvaa.',
    imageDecorative: 'Kuva on vain koriste',
    imageDecorativeHint: 'Siinä ei ole mitään kuvattavaa.',
    imageAdd: 'Lisää kuva',
    imageRemove: 'Poista kuva',
    imageUrlMissing: 'Kirjoita kuvan verkko-osoite.',
    imageUrlInvalid: 'Kirjoita verkko-osoite muodossa https://www.esimerkki.fi/kartta.png',
    imageUrlNotAllowed:
      'Kuvia tästä osoitteesta ei voi käyttää täällä. Kirjoita toinen verkko-osoite.',
    imageAltMissing: 'Kuvaile, mitä kuvassa näkyy, tai valitse, että se on vain koriste.',
    linkAdded: 'Linkki lisätty.',
    linkUpdated: 'Linkki muutettu.',
    linkRemoved: 'Linkki poistettu.',
    imageAdded: 'Kuva lisätty.',
    imageUpdated: 'Kuva muutettu.',
    imageRemoved: 'Kuva poistettu.',
    tableInserted: ({ columns, rows }, format) =>
      `Taulukko lisätty: ${format.plural(columns, { one: '1 sarake', other: `${format.number(columns)} saraketta` })} ja ${format.plural(rows, { one: '1 rivi', other: `${format.number(rows)} riviä` })}.`,
    rowAdded: 'Rivi lisätty.',
    columnAdded: 'Sarake lisätty.',
    rowDeleted: 'Rivi poistettu.',
    columnDeleted: 'Sarake poistettu.',
    tableDeleted: ({ shortcut }) => `Taulukko poistettu. Kumoa painamalla ${shortcut}.`,
    listLevel: ({ level }) => `Taso ${level}`,
    formattingCleared: 'Muotoilu poistettu.',
    undone: 'Kumottu.',
    redone: 'Tehty uudelleen.',
    formatOn: ({ name }) => `${name} käytössä`,
    formatOff: ({ name }) => `${name} pois`,
    imagePasteNotSupported: 'Kuvia ei voi liittää. Käytä Kuva-painiketta.',
    imageSourceNotAllowed: 'Liitettyä kuvaa ei lisätty, koska se on osoitteesta, jota ei sallita.',
  },
  tableOfContents: { label: 'Tällä sivulla' },
  skipLink: { label: 'Siirry pääsisältöön' },
  breadcrumb: { label: 'Olet tässä' },
  pagination: {
    label: 'Sivut',
    previous: 'Edellinen sivu',
    next: 'Seuraava sivu',
    status: ({ page, total }, format) => `Sivu ${format.number(page)}/${format.number(total)}`,
    page: ({ page }, format) => `Sivu ${format.number(page)}`,
  },
  routeFocus: { navigated: ({ title }) => `Siirryit sivulle ${title}` },
  copyButton: {
    label: 'Kopioi',
    copied: 'Kopioitu',
    failed: 'Kopiointi epäonnistui. Valitse teksti ja kopioi se itse.',
  },
  readAloud: {
    label: 'Kuuntele teksti',
    play: 'Kuuntele',
    playSelection: 'Kuuntele valittu teksti',
    pause: 'Tauko',
    previous: 'Edellinen lause',
    next: 'Seuraava lause',
    stop: 'Pysäytä',
    rate: 'Nopeus',
    voice: 'Ääni',
    rateOption: ({ rate }, format) => `${format.number(rate)}×`,
    position: ({ current, total }, format) =>
      `Lause ${format.number(current)}/${format.number(total)}`,
    positionPaused: ({ current, total }, format) =>
      `Tauolla lauseessa ${format.number(current)}/${format.number(total)}`,
    noVoice: ({ language }) =>
      `Tällä laitteella ei ole ääntä kielelle ${language}. Voit lisätä sellaisen laitteen puheasetuksissa.`,
    speechError: 'Tekstiä ei voitu lukea ääneen. Yritä uudelleen.',
    unsupported: 'Tämä selain ei voi lukea tekstiä ääneen.',
  },
  errorSummary: { title: 'Lomakkeessa on virheitä', titlePrefix: 'Virhe:' },
  summaryList: { change: 'Muuta' },
  toast: { regionLabel: 'Ilmoitukset' },
  stepper: {
    status: ({ current, total }, format) =>
      `Vaihe ${format.number(current)}/${format.number(total)}`,
    statusWithName: ({ current, total, name }, format) =>
      `Vaihe ${format.number(current)}/${format.number(total)}: ${name}`,
  },
  progress: {
    loading: 'Ladataan.',
    slow: 'Tämä kestää tavallista kauemmin. Pidä tämä sivu auki.',
    valueText: ({ label, percent }, format) =>
      `${label}, ${format.number(percent / 100, { style: 'percent' })}`,
  },
  tag: { remove: ({ label }) => `Poista ${label}`, removed: ({ label }) => `${label} poistettu.` },
  filters: {
    heading: 'Suodata',
    disclosure: ({ count }, format) =>
      format.plural(count, {
        zero: 'Suodattimet',
        one: 'Suodattimet, 1 käytössä',
        other: `Suodattimet, ${format.number(count)} käytössä`,
      }),
    applied: 'Käytössä olevat suodattimet',
    none: 'Ei käytössä olevia suodattimia',
    appliedValue: ({ group, value }) => `${group}: ${value}`,
    clearAll: 'Poista kaikki suodattimet',
    apply: 'Näytä tulokset',
    sortLabel: 'Lajittelu',
    sortRelevance: 'Olennaisimmat',
    sortNewest: 'Uusimmat ensin',
    sortOldest: 'Vanhimmat ensin',
    sortNameAscending: 'Nimi, A–Ö',
    resultCount: ({ count }, format) =>
      format.plural(count, {
        zero: 'Ei tuloksia',
        one: '1 tulos',
        other: `${format.number(count)} tulosta`,
      }),
    removedResultCount: ({ label, count }, format) =>
      `${label} poistettu. ${format.plural(count, { zero: 'Ei tuloksia', one: '1 tulos', other: `${format.number(count)} tulosta` })}.`,
    clearedResultCount: ({ count }, format) =>
      `Kaikki suodattimet on poistettu. ${format.plural(count, { zero: 'Ei tuloksia', one: '1 tulos', other: `${format.number(count)} tulosta` })}.`,
    noResults: 'Mikään tulos ei vastaa suodattimia.',
    noResultsHint: 'Kokeile poistaa suodatin tai poista kaikki suodattimet.',
    loading: 'Päivitetään tuloksia',
    loadFailed: 'Tuloksia ei voitu päivittää.',
    retry: 'Yritä uudelleen',
  },
  calendar: {
    previousMonth: 'Edellinen kuukausi',
    nextMonth: 'Seuraava kuukausi',
    previousYear: 'Edellinen vuosi',
    nextYear: 'Seuraava vuosi',
    dayName: ({ date, isToday, rangePosition, rangeNote, description }) =>
      [date, isToday ? 'tänään' : undefined, rangePosition, rangeNote, description]
        .filter((part) => part !== undefined)
        .join(', '),
    weekHeader: 'Vko',
    weekHeaderLong: 'Viikko',
    weekName: ({ week }, format) => `Viikko ${format.number(week)}`,
    rangeHint: ({ min, max }) =>
      min !== undefined && max !== undefined
        ? `Päivämäärät ${min}–${max}`
        : min !== undefined
          ? `Päivämäärät alkaen ${min}`
          : `Päivämäärät ${max} asti`,
    selected: ({ date }) => `${date} valittu`,
    rangeStart: 'alkupäivä',
    rangeEnd: 'loppupäivä',
    rangeStartAndEnd: 'alku- ja loppupäivä',
    rangeLength: ({ days }, format) =>
      format.plural(days, { one: '1 päivä', other: `${format.number(days)} päivää` }),
    rangeTooShort: ({ minimum }, format) =>
      `alle ${format.plural(minimum, { one: '1 päivä', other: `${format.number(minimum)} päivää` })}`,
    rangeTooLong: ({ maximum }, format) =>
      `yli ${format.plural(maximum, { one: '1 päivä', other: `${format.number(maximum)} päivää` })}`,
    rangeBlocked: 'välissä on päivä, joka ei ole valittavissa',
    rangeBeforeStart: 'ennen alkupäivää',
    rangeSpanHint: ({ minimum, maximum }, format) =>
      minimum !== undefined && maximum !== undefined
        ? `${format.number(minimum)}–${format.plural(maximum, { one: '1 päivä', other: `${format.number(maximum)} päivää` })}`
        : minimum !== undefined
          ? `vähintään ${format.plural(minimum, { one: '1 päivä', other: `${format.number(minimum)} päivää` })}`
          : `enintään ${format.plural(maximum ?? 0, { one: '1 päivä', other: `${format.number(maximum ?? 0)} päivää` })}`,
    rangeChooseStart: 'Valitse alkupäivä.',
    rangeChooseEnd: ({ start }) => `Alkupäivä ${start}. Valitse loppupäivä.`,
    rangeSelected: ({ start, end, length }) => `Valittu ${start} – ${end}, ${length}`,
    rangeEndSelected: ({ date }) => `Loppupäivä ${date} valittu.`,
    rangeEndCleared: 'Loppupäivä tyhjennetty.',
    visibleMonths: ({ first, last }) => `${first} ja ${last}`,
  },
  datePicker: {
    trigger: 'Valitse päivämäärä',
    title: 'Valitse päivämäärä',
  },
  dateRangePicker: {
    trigger: 'Valitse päivät',
    title: 'Valitse päivämäärät',
  },
} satisfies KvirnMessages
