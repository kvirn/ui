import { formatFileSize } from '../format-file-size.ts'
import type { KvirnMessages } from '../types.ts'

export const fi = {
  link: { newTabNotice: '(avautuu uuteen välilehteen)' },
  // Draft from the design spec (docs/design/form-fields.md §4.1), for a translator to confirm.
  field: { optional: '(vapaaehtoinen)', errorPrefix: 'Virhe:' },
  // Draft from the design spec (docs/design/notification.md §4.1), for a translator to confirm.
  notification: {
    infoPrefix: 'Tiedoksi:',
    successPrefix: 'Valmis:',
    warningPrefix: 'Varoitus:',
    dangerPrefix: 'Virhe:',
  },
  // Draft for a translator to confirm.
  combobox: {
    resultCount: ({ count }, format) =>
      format.plural(count, { one: '1 tulos', other: `${format.number(count)} tulosta` }),
    noResults: 'Ei tuloksia',
    loading: 'Ladataan tuloksia',
    removeValue: ({ label }) => `Poista ${label}`,
    clear: 'Tyhjennä',
    showOptions: 'Näytä vaihtoehdot',
  },
  // Draft for a translator to confirm.
  mask: {
    characterNotAllowed: ({ allowed }) =>
      ({
        digits: 'Tähän voi kirjoittaa vain numeroita.',
        letters: 'Tähän voi kirjoittaa vain kirjaimia.',
        lettersAndDigits: 'Tähän voi kirjoittaa vain kirjaimia ja numeroita.',
        other: 'Tätä merkkiä ei voi kirjoittaa tähän.',
      })[allowed],
    maximumLength: ({ length }) => `Olet kirjoittanut kaikki ${length} merkkiä.`,
  },
  // Draft for a translator to confirm.
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
} satisfies KvirnMessages
