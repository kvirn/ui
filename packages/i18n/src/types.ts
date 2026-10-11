/** The locales KvirnUI ships. All are first-class; `en` is the fallback. */
export const localeCodes = ['sv', 'fi', 'nb', 'nn', 'en'] as const
export type LocaleCode = (typeof localeCodes)[number]

/** Plural forms keyed by `Intl.PluralRules` category. `other` is always required. */
export interface PluralForms {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

/**
 * The locale-aware helper that parameterised messages receive. Built on `Intl`
 * for the active locale; `date` uses the provider's `timeZone`.
 */
export interface MessageFormat {
  /** Picks a form by the locale's plural rules. `zero` is used for exactly 0 when given. */
  plural: (count: number, forms: PluralForms) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  /**
   * A `Date` or milliseconds is an instant, shown in the provider's `timeZone`. A string is a
   * calendar date written `YYYY-MM-DD`, shown in UTC so it never moves a day. Any other string
   * throws a `RangeError`.
   */
  date: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  list: (items: readonly string[], options?: Intl.ListFormatOptions) => string
}

/**
 * A key without parameters. Catalogs use strings; a function lets an app route the string
 * through its own i18n system, for example `() => t('kvirn.link.newTabNotice')`.
 */
export type TextMessage = string | (() => string)

/** A key with parameters: it receives its values and the locale's format helper. */
export type MessageFunction<Values extends object> = (
  values: Values,
  format: MessageFormat,
) => string

/**
 * Every visible or announced string, namespaced per component. The depth is
 * fixed at `namespace.key`. Components add their namespace here as they are built.
 */
export interface KvirnMessages {
  link: {
    /** Tells users a link opens in a new tab (WCAG 3.2.5, G201). Owned by Link (Plan 0003). */
    newTabNotice: TextMessage
  }
  field: {
    /**
     * Appended to the label or legend of an optional field, for example `(valfritt)`. Part of
     * the accessible name (WCAG 3.3.2). Owned by Field (Plan 0013).
     */
    optional: TextMessage
    /**
     * The first words of every error message, for example `Fel:`. Includes its colon.
     * Screen-reader users hear the message as an error without colour or the icon (WCAG 3.3.1).
     */
    errorPrefix: TextMessage
  }
  dateInput: {
    /** The label of the day box of a `DateInput`, for example `Dag`. Owned by DateInput (Plan 0013). */
    day: TextMessage
    /** The label of the month box, for example `Månad`. */
    month: TextMessage
    /** The label of the year box, for example `År`. */
    year: TextMessage
    /**
     * The visible hint under the boxes that says focus moves to the next box when one is full,
     * for example `Fokus flyttas till nästa ruta när en ruta är full.` It is in the group's
     * `aria-describedby`, so users are advised before they type (WCAG 3.2.2). Rendered only while
     * `autoAdvance` is on (Plan 0040).
     */
    autoAdvanceHint: TextMessage
  }
  alert: {
    /**
     * The status word that starts the Title of `Alert.Info`, for example `Information:`.
     * Includes its colon. Visually hidden by the theme, read by screen readers (WCAG 1.4.1).
     * Owned by Alert (Plan 0020).
     */
    infoPrefix: TextMessage
    /** The status word of `Alert.Success`, for example `Klart:`. */
    successPrefix: TextMessage
    /** The status word of `Alert.Warning`, for example `Varning:`. */
    warningPrefix: TextMessage
    /** The status word of `Alert.Danger`, for example `Fel:`. */
    dangerPrefix: TextMessage
    /**
     * The accessible name of `Alert.Close`, the optional dismiss button (an icon with no visible
     * text), for example `Stäng meddelandet`. Owned by Alert (Plan 0045).
     */
    close: TextMessage
  }
  dialog: {
    /**
     * The accessible name of `Dialog.Close`, the optional dismiss button (an icon with no visible
     * text), for example `Stäng dialogrutan`. Owned by Dialog (Plan 0067).
     */
    close: TextMessage
  }
  combobox: {
    /**
     * Announced (politely, debounced) when the filtered list changes, for example `5 resultat`.
     * Plural: `1 resultat` and `{count} resultat`. Owned by Combobox and Autocomplete (Plan
     * 0022).
     */
    resultCount: MessageFunction<{ count: number }>
    /** Announced when the filter leaves no options, for example `Inga resultat`. */
    noResults: TextMessage
    /** Announced while the options are loading, for example `Laddar resultat`. */
    loading: TextMessage
    /**
     * The accessible name of the button that removes one chosen value, for example
     * `Ta bort Stockholm`. `label` is the value's visible text.
     */
    removeValue: MessageFunction<{ label: string }>
    /** The accessible name of the optional button that clears the value, for example `Rensa`. */
    clear: TextMessage
    /** The accessible name of the optional button that opens the list, for example `Visa alternativ`. */
    showOptions: TextMessage
  }
  mask: {
    /**
     * Announced (politely, throttled) when a masked field drops a character the user typed or
     * pasted, for example `Här kan du bara skriva siffror.` `allowed` says what the field
     * takes, so the message can name it. Owned by the masks (Plan 0014).
     */
    characterNotAllowed: MessageFunction<{
      allowed: 'digits' | 'letters' | 'lettersAndDigits' | 'other'
    }>
    /**
     * Announced when the mask is full and refused another character, for example
     * `Du har skrivit alla 12 tecken.` `length` counts the characters without separators.
     */
    maximumLength: MessageFunction<{ length: number }>
    /**
     * Announced when a number mask refused a digit because the number already has all the
     * decimals it takes, for example `Du kan inte skriva fler decimaler.` It has no count: the
     * hint says how many.
     */
    maximumDecimals: TextMessage
  }
  /**
   * The text of a character count, `Textarea`'s `characterCount` (Plan 0034, design spec
   * `docs/design/rich-text-editor.md` §4.1). It is shown under the box, and said in the Announcer
   * (politely, debounced) from 80% of the limit and when the limit is crossed. Every sentence
   * ends with its full stop. Counts are formatted with `format.number`.
   */
  characterCount: {
    /** Shown while the box is empty, for example `Du kan skriva högst 500 tecken.` */
    limit: MessageFunction<{ limit: number }>
    /** Shown while typing, for example `Du har 120 tecken kvar.` Plural. */
    remaining: MessageFunction<{ count: number }>
    /** Shown over the limit, for example `Du har 12 tecken för mycket.` Plural. */
    over: MessageFunction<{ count: number }>
  }
  /**
   * Every visible, named and announced string of FileUpload (Plan 0021, design spec
   * `docs/design/file-upload.md` §4.1). `name` is a file name, inserted as plain text. `size` and
   * `limit` are byte counts: a message formats them with `formatFileSize`, so a file and its limit
   * read in the same unit. `allowed` is the accepted types as short labels (`PDF`, `JPG`): a
   * message joins them with `format.list`. Every sentence ends with its full stop, so the
   * announcer can join sentences with a space.
   */
  fileUpload: {
    /** The Trigger's text with `multiple`, for example `Välj filer`. */
    chooseFiles: TextMessage
    /** The Trigger's text in single-file mode with nothing chosen, for example `Välj fil`. */
    chooseFile: TextMessage
    /** The Trigger's text in single-file mode with a file chosen, for example `Byt fil`. */
    replaceFile: TextMessage
    /** The hint next to the Trigger on devices with a mouse, for example `eller släpp filer här`. */
    dropHint: MessageFunction<{ multiple: boolean }>
    /** The hint while a file is dragged over the zone, for example `Släpp filerna för att lägga till dem`. */
    dropHintActive: MessageFunction<{ multiple: boolean }>
    /** Limits: how many files, for example `Du kan lägga till högst 5 filer.` Plural. */
    limitsMaxFiles: MessageFunction<{ count: number }>
    /** Limits: which types, for example `Filerna ska vara i formatet PDF, JPG eller PNG.` */
    limitsTypes: MessageFunction<{ allowed: readonly string[]; multiple: boolean }>
    /** Limits: how large, for example `Varje fil får vara högst 10 MB.` `limit` in bytes. */
    limitsMaxSize: MessageFunction<{ limit: number; multiple: boolean }>
    /** The Summary without `maxFiles`, for example `3 filer tillagda`. Plural. */
    summary: MessageFunction<{ count: number }>
    /** The Summary with `maxFiles`, for example `2 av 5 filer tillagda`. */
    summaryOfMax: MessageFunction<{ count: number; maxFiles: number }>
    /** The Summary at the limit, with what to do next. Also ends the announcement of the add that filled the list. */
    summaryFull: MessageFunction<{ maxFiles: number }>
    /** The first line of Rejections, for example `1 fil kunde inte läggas till:`. Plural. */
    rejectedHeading: MessageFunction<{ count: number }>
    /** An item with the form as its destination, for example `Tillagd. Skickas med formuläret`. */
    statusReady: TextMessage
    /** An item waiting for an upload slot. */
    statusQueued: TextMessage
    /** An upload with no known size. */
    statusUploading: TextMessage
    /** An upload with a known size. `percent` is whole percent, `0` to `100`. */
    statusUploadingPercent: MessageFunction<{ percent: number }>
    statusComplete: TextMessage
    statusFailed: TextMessage
    statusCancelled: TextMessage
    /** The Type part when the file has no extension. */
    typeUnknown: TextMessage
    /** The visible text of the Remove button. Its name adds the file (`removeFile`). */
    remove: TextMessage
    /** The visible text of the Cancel button. */
    cancel: TextMessage
    /** The visible text of the Retry button. */
    retry: TextMessage
    /** A file name when two items share it, for example `image.jpg (2)`. `number` is 2 or more. */
    duplicateName: MessageFunction<{ name: string; number: number }>
    /** Rejected: not an accepted type. Says what to choose instead. */
    errorType: MessageFunction<{ name: string; allowed: readonly string[] }>
    /** Rejected: too large. Says how to get under the limit. `size` and `limit` in bytes. */
    errorTooLarge: MessageFunction<{ name: string; size: number; limit: number }>
    /** Rejected: too small. `size` and `limit` in bytes. */
    errorTooSmall: MessageFunction<{ name: string; size: number; limit: number }>
    /** Rejected: the file has no content. */
    errorEmpty: MessageFunction<{ name: string }>
    /** Rejected: the list is full. Plural in `maxFiles`. */
    errorTooMany: MessageFunction<{ name: string; maxFiles: number }>
    /** Rejected: the same file is already in the list. */
    errorDuplicate: MessageFunction<{ name: string }>
    /** Rejected: a folder was dropped. */
    errorFolder: MessageFunction<{ name: string }>
    /** A failed upload that supplies no text of its own. Neutral: it never says why. */
    uploadFailedMessage: MessageFunction<{ name: string }>
    /**
     * Starts a rejection line for a file that shares its name with another file in the same
     * selection, for example `Fil 2 av 3, {message}`. `position` counts from 1.
     */
    rejectedFilePosition: MessageFunction<{ position: number; total: number; message: string }>
    /** The Remove button's accessible name. Starts with the visible text (WCAG 2.5.3). */
    removeFile: MessageFunction<{ name: string }>
    /** The Cancel button's accessible name. */
    cancelFile: MessageFunction<{ name: string }>
    /** The Retry button's accessible name. */
    retryFile: MessageFunction<{ name: string }>
    /** The progress bar's accessible name. */
    uploadingFile: MessageFunction<{ name: string }>
    /** Announced: one file was added. */
    fileAdded: MessageFunction<{ name: string }>
    /** Announced: several files were added. Plural. */
    filesAdded: MessageFunction<{ count: number }>
    /** Announced: files were refused. Plural. */
    filesRejected: MessageFunction<{ count: number }>
    /** Announced: uploads started. Plural. Not announced in auto mode: the add message is enough. */
    uploadsStarted: MessageFunction<{ count: number }>
    /** Announced: one upload finished. */
    uploadComplete: MessageFunction<{ name: string }>
    /** Announced: several uploads finished. */
    uploadsComplete: MessageFunction<{ count: number }>
    /** Announced: a batch emptied the queue with no failure. `one` form for a single file. */
    allUploadsComplete: MessageFunction<{ count: number }>
    /** Announced: one upload failed. */
    uploadFailed: MessageFunction<{ name: string }>
    /** Announced: several uploads failed. */
    uploadsFailed: MessageFunction<{ count: number }>
    /** Announced: a file was removed. */
    fileRemoved: MessageFunction<{ name: string }>
    /**
     * Wraps one FileUpload's announcement with its Field label when several FileUploads are
     * mounted, for example `Bilagor: 2 filer har laddats upp.` `label` has no optional marker.
     */
    announcementForField: MessageFunction<{ label: string; message: string }>
  }
  /**
   * Every visible, named and announced string of Table (Plan 0026). `column`
   * is the column's label as text. Announced sentences end with their full stop, so the Announcer
   * can join sentences with a space. Names and labels have none.
   */
  table: {
    /** Announced when a column becomes sorted ascending, for example `Sorterad efter Namn, stigande.` */
    sortedAscending: MessageFunction<{ column: string }>
    /** Announced when a column becomes sorted descending. */
    sortedDescending: MessageFunction<{ column: string }>
    /** Announced when a column's sort is removed, for example `Inte längre sorterad efter Namn.` */
    sortCleared: MessageFunction<{ column: string }>
    /**
     * The visually hidden start of a row checkbox's name, followed by the row's header cell:
     * `Välj` then `Anna Svensson`.
     */
    selectRow: TextMessage
    /** A row checkbox's name when the table has no row header column. `index` counts from 1. */
    selectRowNumber: MessageFunction<{ index: number }>
    /** The select-all checkbox's name. */
    selectAllRows: TextMessage
    /** Announced when the select-all checkbox changes the selection, for example `12 rader markerade.` Plural. */
    selectedCount: MessageFunction<{ count: number }>
    /** Announced after a filter changes the rows, for example `3 rader.` Plural. */
    rowCount: MessageFunction<{ count: number }>
    /** Announced while rows load. */
    loading: TextMessage
    /** The text of the empty row, for example `Det finns inga rader att visa.` Replace it with something useful. */
    empty: TextMessage
    /** The expand button's name. `aria-expanded` carries whether the details are shown. */
    rowDetails: TextMessage
    /**
     * An expand button's name when the table has no row header column: `rowDetails` and the row's
     * number, for example `Detaljer rad 3`. It must start with `rowDetails`, the visible text (2.5.3).
     * `index` counts from 1.
     */
    rowDetailsNumber: MessageFunction<{ index: number }>
  }
  /**
   * Every visible, named and announced string of the rich text editor (`@kvirn-ui/rich-text`,
   * Plan 0036, design spec `docs/design/rich-text-editor.md` §4.3). Control names are the same in
   * both label modes: an icon-only button's `aria-label` and its tooltip, or its visible text.
   * Announced sentences end with their full stop. Key names in shortcuts are not translated.
   */
  richText: {
    /** The visually hidden first part of the toolbar's name: `Formatering`, then the field's label. */
    toolbar: TextMessage
    /** Group names: history, text style, lists, insert and the contextual table group. */
    groupHistory: TextMessage
    groupTextStyle: TextMessage
    groupLists: TextMessage
    groupInsert: TextMessage
    groupTable: TextMessage
    undo: TextMessage
    redo: TextMessage
    /** The block type picker's name. Its visible text is the current value. */
    blockType: TextMessage
    blockParagraph: TextMessage
    blockHeading2: TextMessage
    blockHeading3: TextMessage
    /** Only when the configured heading levels include 4. */
    blockHeading4: TextMessage
    blockQuote: TextMessage
    blockCode: TextMessage
    /** The picker's value when the selection spans different block types. */
    blockMixed: TextMessage
    bold: TextMessage
    /** Writes `<em>`: the word users know from Word and Google Docs. */
    italic: TextMessage
    underline: TextMessage
    strike: TextMessage
    code: TextMessage
    bulletList: TextMessage
    orderedList: TextMessage
    indent: TextMessage
    outdent: TextMessage
    link: TextMessage
    image: TextMessage
    table: TextMessage
    clearFormatting: TextMessage
    addRowAbove: TextMessage
    addRowBelow: TextMessage
    /** Left and right follow what the user sees: they swap in right-to-left text. */
    addColumnLeft: TextMessage
    addColumnRight: TextMessage
    deleteRow: TextMessage
    deleteColumn: TextMessage
    deleteTable: TextMessage
    headerRow: TextMessage
    linkAddTitle: TextMessage
    linkEditTitle: TextMessage
    linkUrl: TextMessage
    linkUrlHint: TextMessage
    linkText: TextMessage
    linkTextHint: TextMessage
    linkAdd: TextMessage
    save: TextMessage
    linkRemove: TextMessage
    cancel: TextMessage
    linkUrlMissing: TextMessage
    linkUrlInvalid: TextMessage
    linkTextMissing: TextMessage
    imageAddTitle: TextMessage
    imageEditTitle: TextMessage
    imageUrl: TextMessage
    imageUrlHint: TextMessage
    imageAlt: TextMessage
    imageAltHint: TextMessage
    imageDecorative: TextMessage
    imageDecorativeHint: TextMessage
    imageAdd: TextMessage
    imageRemove: TextMessage
    imageUrlMissing: TextMessage
    imageUrlInvalid: TextMessage
    /** The address is outside the allowed image sources (`imageSources`). */
    imageUrlNotAllowed: TextMessage
    imageAltMissing: TextMessage
    linkAdded: TextMessage
    linkUpdated: TextMessage
    linkRemoved: TextMessage
    imageAdded: TextMessage
    imageUpdated: TextMessage
    imageRemoved: TextMessage
    /** Announced when focus moves into the new table's first cell. Plural in both counts. */
    tableInserted: MessageFunction<{ columns: number; rows: number }>
    rowAdded: TextMessage
    columnAdded: TextMessage
    rowDeleted: TextMessage
    columnDeleted: TextMessage
    /** Announced with focus back in the text. `shortcut` is the platform's undo key, for example `Ctrl+Z`. */
    tableDeleted: MessageFunction<{ shortcut: string }>
    /** Announced after an indent or outdent, for example `Nivå 2`. Nothing visible says how deep. */
    listLevel: MessageFunction<{ level: number }>
    formattingCleared: TextMessage
    /** Announced from the toolbar button only: the shortcut is the browser's own undo. */
    undone: TextMessage
    redone: TextMessage
    /** Announced after a formatting shortcut in the text. `name` is the control's name, for example `Fetstil`. */
    formatOn: MessageFunction<{ name: string }>
    formatOff: MessageFunction<{ name: string }>
    /** Announced when a pasted or dropped image file is ignored. */
    imagePasteNotSupported: TextMessage
    /** Announced when a pasted image's address is outside the allowed image sources. */
    imageSourceNotAllowed: TextMessage
  }
  tableOfContents: {
    /**
     * The name of the `<nav>` landmark when the page has no visible title to point
     * `aria-labelledby` at, for example `På den här sidan`. The same words as the visible title
     * (WCAG 2.5.3). Owned by TableOfContents (Plan 0049).
     */
    label: TextMessage
  }
  skipLink: {
    /**
     * The visible text of the skip link, for example `Hoppa till huvudinnehållet`. It names the
     * link, so it says where the link goes (2.4.1). Owned by SkipLink (Plan 0054).
     */
    label: TextMessage
  }
  breadcrumb: {
    /**
     * The accessible name of the breadcrumb landmark, for example `Du är här`. It says what the
     * trail is for, so a screen reader user finds it in the landmarks list (2.4.1, 2.4.8). Owned by
     * Breadcrumb (Plan 0062).
     */
    label: TextMessage
  }
  pagination: {
    /** The accessible name of the pagination landmark, for example `Sidor`. Owned by Pagination (Plan 0062). */
    label: TextMessage
    /** The visible text of the Previous link, for example `Föregående sida`. */
    previous: TextMessage
    /** The visible text of the Next link, for example `Nästa sida`. */
    next: TextMessage
    /** The status shown on a narrow screen instead of the page links: `Sida 2 av 9`. */
    status: MessageFunction<{ page: number; total: number }>
    /** The name of a page link: `Sida 2`. The visible number stays in the name (2.5.3). */
    page: MessageFunction<{ page: number }>
    /** The name of the current page's link: `Sida 2, aktuell sida`. */
  }
  routeFocus: {
    /** Announced after a navigation when `useRouteFocus` has `announce` on. `title` is the new page's title. */
    navigated: MessageFunction<{ title: string }>
  }
  errorSummary: {
    /** The summary's heading, for example `Det finns ett problem`. It names the focused group. Owned by ErrorSummary (Plan 0063). */
    title: TextMessage
    /** Put before the page title while the summary is shown, for example `Fel:`, so the tab or window title says it too (2.4.2). */
    titlePrefix: TextMessage
  }
  definitionList: {
    /** The visible text of a row's action link, for example `Ändra`. The row's term is added to the link's name. Owned by DefinitionList (Plan 0063). */
    change: TextMessage
  }
  displaySettings: {
    /** The visible text and the accessible name of the trigger. */
    button: TextMessage
    /** The legend of the colour scheme group. */
    colorSchemeLegend: TextMessage
    /** The option for the light colour scheme. */
    colorSchemeLight: TextMessage
    /** The option for the dark colour scheme. */
    colorSchemeDark: TextMessage
    /** The option that follows the device. */
    colorSchemeSystem: TextMessage
    /** The legend of the contrast group. */
    contrastLegend: TextMessage
    /** The option for standard contrast. */
    contrastStandard: TextMessage
    /** The option for high contrast. */
    contrastMore: TextMessage
    /** The option that follows the device. */
    contrastSystem: TextMessage
    /** The legend of the motion group. */
    motionLegend: TextMessage
    /** The option for full motion. */
    motionFull: TextMessage
    /** The option for less motion. */
    motionReduce: TextMessage
    /** The option that follows the device. */
    motionSystem: TextMessage
    /** Shown when the device forces its own colours (a Windows contrast theme): they replace these settings. */
    forcedColors: TextMessage
    /** The shortest name of the option that follows the device, for the compact layout's segments. */
    systemShort: TextMessage
  }
  copyButton: {
    /** The visible text and the accessible name of the button. It never changes to the result (Plan 0060). */
    label: TextMessage
    /** Announced (polite) after the text was written to the clipboard. */
    copied: TextMessage
    /** Announced (assertive) when the browser refused. The component also selects the text. */
    failed: TextMessage
  }
  readAloud: {
    /** The accessible name of the player group. Owned by ReadAloud (Plan 0088). */
    label: TextMessage
    /** The visible text and name of the button that reads the content. */
    play: TextMessage
    /** The same button's name while a selection is captured. */
    playSelection: TextMessage
    /** The same button's name while reading. */
    pause: TextMessage
    previous: TextMessage
    next: TextMessage
    stop: TextMessage
    /** The label of the speed select. */
    rate: TextMessage
    /** The label of the voice select. */
    voice: TextMessage
    /** One option of the speed select, for example `1,5×`. */
    rateOption: MessageFunction<{ rate: number }>
    /** Visible status text, for example `Mening 3 av 12`. */
    position: MessageFunction<{ current: number; total: number }>
    /** Visible status text while paused: where Listen continues. */
    positionPaused: MessageFunction<{ current: number; total: number }>
    /** Shown and announced (polite) when no voice matches the content language: names it and the next step. */
    noVoice: MessageFunction<{ language: string }>
    /** Announced (polite) when the speech engine failed. */
    speechError: TextMessage
    /** Shown (not announced) when the browser has no speech synthesis: no control exists to attempt. */
    unsupported: TextMessage
  }
  toast: {
    /** The accessible name of the toast region, a landmark that exists while a toast is shown. Owned by Toast (Plan 0071). */
    regionLabel: TextMessage
  }
  tag: {
    /** The accessible name of a removable tag's button, for example `Ta bort Stockholm`. `label` is the tag's visible text, so the name contains it (2.5.3). Owned by Tag (Plan 0075). */
    remove: MessageFunction<{ label: string }>
    /** Announced (polite) by a TagGroup after a tag is removed, for example `Stockholm borttagen.`. Off when the caller announces a combined message. */
    removed: MessageFunction<{ label: string }>
  }
  filters: {
    /** The heading of a filter form, for example `Filter`. Owned by the "Filter a list" pattern (Plan 0075). */
    heading: TextMessage
    /** The Disclosure trigger of the filter form. Plural: `Filter`, `Filter, 1 valt` and `Filter, {count} valda`. */
    disclosure: MessageFunction<{ count: number }>
    /** The label of the applied-filters row. It is also the focus fallback when the last tag is removed. */
    applied: TextMessage
    /** The row's text while no filter is applied. */
    none: TextMessage
    /** The text of a filter's tag, for example `År: 2025`, so the value is not ambiguous out of context. */
    appliedValue: MessageFunction<{ group: string; value: string }>
    /** The button that removes every applied filter. */
    clearAll: TextMessage
    /** The submit button used without JavaScript. */
    apply: TextMessage
    /** The label of the sort select. */
    sortLabel: TextMessage
    sortRelevance: TextMessage
    sortNewest: TextMessage
    sortOldest: TextMessage
    sortNameAscending: TextMessage
    /** The result count, visible and announced. Plural: `Inga resultat`, `1 resultat` and `{count} resultat`. */
    resultCount: MessageFunction<{ count: number }>
    /** Announced (polite) after a filter is removed and the results settle: the removal and the count in one message. */
    removedResultCount: MessageFunction<{ label: string; count: number }>
    /** Announced (polite) after Clear all and the results settle. */
    clearedResultCount: MessageFunction<{ count: number }>
    /** Shown when the filters leave no result. */
    noResults: TextMessage
    /** Shown under `noResults`, saying what to try. Never blames the user. */
    noResultsHint: TextMessage
    /** Shown (not announced) while the results update. */
    loading: TextMessage
    /** Shown in an inline alert when the results could not be updated. */
    loadFailed: TextMessage
    /** The button that tries the update again. */
    retry: TextMessage
  }
  /** Progress (Plan 0074). Sentences end with a full stop, so the announcer can join them. */
  progress: {
    /** The label when the consumer gives none: the name of the bar and the text announced once the wait is shown. A development warning asks for a specific one. */
    loading: TextMessage
    /** Added to the label, and announced once, when the wait passes the slow limit (10 s by default). */
    slow: TextMessage
    /** The bar's `aria-valuetext`, for example `Exporting cases, 45%`. `percent` is 0 to 100; a message formats it with `format.number`. */
    valueText: MessageFunction<{ label: string; percent: number }>
  }
  /** Stepper (Plan 0083): the position in a multi-page form as one line of text. */
  stepper: {
    /** `Step 2 of 5`. Each locale owns its wording and punctuation. */
    status: MessageFunction<{ current: number; total: number }>
    /** `Step 2 of 5: Your vehicle`. `name` is the section's name, in the consumer's words. */
    statusWithName: MessageFunction<{ current: number; total: number; name: string }>
  }
  /** Calendar (Plan 0082): the buttons, the names of the days and the hint. Dates arrive already written by `Intl` in the locale (`date`, `min`, `max`). */
  calendar: {
    /** The Previous month button's accessible name and tooltip. */
    previousMonth: TextMessage
    nextMonth: TextMessage
    /** Only when the consumer renders the year buttons. */
    previousYear: TextMessage
    nextYear: TextMessage
    /** A day's accessible name: `Wednesday 14 October 2026, today, start date, Recycling centre closed`. Parts that are absent drop out. `description` is the consumer's text for the day. */
    dayName: MessageFunction<{
      date: string
      isToday: boolean
      description: string | undefined
      /** Range mode, already translated: `start date`, `end date`, `start and end date`. */
      rangePosition?: string | undefined
      /** Range mode, already translated: the length of a possible end, or why a day can't be the end. */
      rangeNote?: string | undefined
    }>
    /** The visible week-number column header, short. It is hidden from assistive technology. */
    weekHeader: TextMessage
    /** The same header, spelled out and visually hidden. */
    weekHeaderLong: TextMessage
    /** A week number's accessible name, for example `Week 42`. */
    weekName: MessageFunction<{ week: number }>
    /** The line above the grid and the grid's description. Both ends, only `min` or only `max`. */
    rangeHint: MessageFunction<{ min: string | undefined; max: string | undefined }>
    /** Announced, polite, after a day was chosen. */
    selected: MessageFunction<{ date: string }>
    /** Range mode name parts of the chosen days. */
    rangeStart: TextMessage
    rangeEnd: TextMessage
    rangeStartAndEnd: TextMessage
    /** Name part of each possible end while the end is pending: `7 days`. `nights` is `days - 1`, for a booking's wording. */
    rangeLength: MessageFunction<{ days: number; nights: number }>
    /** Name part of a day that can't be the end: `fewer than 3 days`. */
    rangeTooShort: MessageFunction<{ minimum: number }>
    rangeTooLong: MessageFunction<{ maximum: number }>
    /** Name part: an unavailable day lies between the start and this day. */
    rangeBlocked: TextMessage
    /** Name part of an impossible end, with `selects="end"` only. */
    rangeBeforeStart: TextMessage
    /** The span limits in the range hint (3.3.2). At least one of the two is set. */
    rangeSpanHint: MessageFunction<{ minimum: number | undefined; maximum: number | undefined }>
    /** The step line when no start is chosen. */
    rangeChooseStart: TextMessage
    /** The step line and the announcement after the start was pressed. */
    rangeChooseEnd: MessageFunction<{ start: string }>
    /** The step line when complete and the completion announcement. `length` is `rangeLength`'s text. */
    rangeSelected: MessageFunction<{ start: string; end: string; length: string }>
    /** Announced when only the end is chosen (`selects="end"`) and when it is dropped. */
    rangeEndSelected: MessageFunction<{ date: string }>
    rangeEndCleared: TextMessage
    /** The month buttons' announcement with two months visible: `October 2026 and November 2026`. */
    visibleMonths: MessageFunction<{ first: string; last: string }>
  }
  /** DatePicker (Plan 0084). The month grid's own strings are in `calendar`. */
  datePicker: {
    /** The button's visible name, next to the typed date: `Choose date`. */
    trigger: TextMessage
    /** The dialog's title. The consumer can replace it with the question: `Choose the date of your visit`. */
    title: TextMessage
  }
  /** DateRangePicker (Plan 0089). The month grid's own strings, and "{start} to {end} selected", are in `calendar`. */
  dateRangePicker: {
    /** The button's visible name, after both typed dates: `Choose dates`. */
    trigger: TextMessage
    /** The dialog's title. The consumer can replace it with the question: `Choose the dates of your stay`. */
    title: TextMessage
  }
}

/** Any subset of namespaces and keys, for provider and `defineMessages` overrides. */
export type PartialMessages = {
  [Namespace in keyof KvirnMessages]?: Partial<KvirnMessages[Namespace]>
}
