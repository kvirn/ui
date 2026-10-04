/** The locales KvirnUI ships. All are first-class; `en` is the fallback. */
export const localeCodes = ['sv', 'fi', 'nb', 'nn', 'se', 'en'] as const
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
  date: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
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
    /**
     * The visible keyboard instruction under the box (WCAG 2.1.2), by what is enabled. The way out
     * comes first. Plain text: messages are never JSX, so key names are not `Kbd`.
     */
    keyboardHintListsAndTables: TextMessage
    keyboardHintLists: TextMessage
    keyboardHintTables: TextMessage
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
}

/** Any subset of namespaces and keys, for provider and `defineMessages` overrides. */
export type PartialMessages = {
  [Namespace in keyof KvirnMessages]?: Partial<KvirnMessages[Namespace]>
}
