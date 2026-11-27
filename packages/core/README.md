# @kvirn/core

The framework-agnostic state machines behind `@kvirn/ui`. It has no React and touches no DOM at import time.

Most adopters never import it: use `@kvirn/ui`, which re-exports what you need (`masks`, `checks`, `MaskResult` and the file upload types).

## Public API

These are safe to use and follow semver:

- `masks` and `checks`: the input masks and the value checks. React re-exports both.
- `createAnnouncer`: the live-region announcer, for code that isn't a React component.
- The types that the React package re-exports or that its public props use (`MaskResult`, `FileUploadContext`, `FileUploadFailure`, `FileUploadRejection` and similar).

## Internal exports

Everything else serves `@kvirn/ui` and is not part of the public API and can change in any release, without a major version. That includes `createMask` (write a mask as a plain definition and pass it to `Input`, which resolves it), `createComponentStore`, the theme store helpers (`createThemeStore`, `resolveTheme`, `resolveThemeOptions`, `findInvalidThemeOptions`, `isSameThemeConfiguration`), `resolveMessageNamespace`, `getLanguage`, `matchesText`, `startsWithText` and the `default*` constants.

## API reference

Every value export of `@kvirn/core`. Only `masks`, `checks` and `createAnnouncer` are public (see above); the rest follows the internal-exports rule below. Types are exported too and are not listed here. `@kvirn/core` has a single entry point: `store`, `virtual` and `table` are source directories, each the only place its TanStack package is imported.

### Messages and locale

- `getLanguage(locale: string): string`: The lower-case language subtag of a BCP 47 tag (`sv-SE` gives `sv`). Used by `KvirnProvider`, `useMessages`.
- `resolveDirection(locale: string): Direction`: `ltr` or `rtl` for a locale; an invalid tag gives `ltr`. Used by `KvirnProvider`, `getLocaleProps`.
- `dateInputOrder(locale: string): readonly DateInputPart[]`: The order of day, month and year a locale writes, from `Intl`. Used by `useDateInput`.
- `dateSeparator(locale: string): '.' | '-' | '/'`: The separator a locale writes between date parts; `.` when unknown.
- `maskCountryFromLocale(locale: string): MaskCountry | undefined`: The country a locale implies for country masks (`sv-FI` gives `FI`). Used by `useLocale`.
- `callingCodeCountries: readonly string[]`: Every ISO 3166-1 alpha-2 code that has a calling code. Used by `PhoneInput`.
- `callingCodeFor(country: string): string | undefined`: The calling code of a country, digits only (`SE` gives `46`). Used by `PhoneInput`.
- `createMessageFormat({ locale, timeZone }): MessageFormatter`: Formats plurals, numbers, dates and lists for a locale. Used by `KvirnProvider`, `getMessages`.
- `resolveMessageNamespace({ namespace, fallback, overrides, format, reportIssue })`: Resolves one message namespace through ordered layers, so an empty override falls through and an accessible name is never empty. Used by `useMessages`, `getMessages`.

### Environment and stores

The two building blocks every machine below uses.

- `getDefaultEnv(): Env | undefined`: The page's `window` and `document`, or `undefined` while server rendering. Resolved on call, never at import. Used by `useEnv`.
- `createComponentStore<State, Actions>(initialState, defineActions): ComponentStore<State, Actions>`: The store every machine is built on (`@tanstack/store` is wrapped in `src/store/`).

### Theme

- `createThemeStore(env, options?): ThemeStore`: Creates a theme store for one document. Prefer `getThemeStore`.
- `getThemeStore(env, options?): ThemeStore`: The one theme store per document; later callers share the first caller's configuration. Used by `KvirnProvider`, `useTheme`.
- `resolveTheme(preference, system): ResolvedTheme`: Turns a stored preference and the system setting into the colour scheme, contrast and motion in force.
- `resolveThemeOptions(options: ThemeOptions): ResolvedThemeOptions`: Fills in defaults and replaces invalid values with them.
- `findInvalidThemeOptions(options): (keyof ThemeOptions)[]`: Lists the options whose values are outside their allowed set. Used by `KvirnProvider`.
- `isSameThemeConfiguration(configured, requested): boolean`: Whether a request would configure the store as it already is. Used by `KvirnProvider`.
- `createThemeScriptSource(options?): string`: The source of the blocking inline script that sets the theme attributes before first paint. Used by `KvirnThemeScript`, `ServerThemeScript`.
- `colorSchemeAttribute, contrastAttribute, motionAttribute`: The `<html>` attribute names the theme sets (`data-kv-color-scheme`, `data-kv-contrast`, `data-kv-motion`).
- `themeStorageKey`: The storage key of the stored preference (`kvirn-ui:theme`).

### Announcements and text

- `createAnnouncer(env): Announcer`: The state behind the shared polite and assertive live regions. Public. Used by `KvirnProvider`, `Dialog`.
- `defaultThrottleMilliseconds`: The default throttle window (3000) for an announcement with a `key`.
- `countCharacters(value: string): number`: The characters a user sees, counted as graphemes. Used by `CharacterCount`, `Textarea`.
- `getCharacterCount({ value, limit, countCharacters?, announceFrom?, previousLength? }): CharacterCountResult`: The length, what remains, whether the text is over the limit and whether to announce it. It never cuts the text. Used by `useCharacterCount`.
- `defaultCharacterCountAnnounceFrom`: The share of the limit (0.8) from which a count is announced.

### Overlays and placement

- `computePlacement(anchor, popup, viewport, options?): ComputedPlacement`: Where a popup goes next to its anchor: flips and shifts to stay inside the viewport, and returns `x`, `y`, `width` and `maxHeight`. Used by `usePopup`, `Popover`.
- `createDismissableLayerStack(): DismissableLayerStack`: The stack of layers that close on Escape and outside presses, so the top layer closes first. Used by `useDismissableLayer`.
- `isPointInsideRect(point, rect): boolean`: Whether a point is inside a rectangle, edges included. Used by `useDismissableLayer`.
- `createScrollLock(): ScrollLock`: Ref-counts scroll locks by id, so stacked modals lock once and restore once. Used by `useDialog`.
- `createTooltipMachine(options): TooltipMachine`: The timing of a tooltip: hover delay, close delay, Escape and focus (WCAG 1.4.13). Used by `useTooltip`.
- `createTooltipGroup(options?): TooltipGroup`: A group of tooltips that share a skip delay. Used by `useTooltip`.
- `getTooltipGroup(): TooltipGroup`: The group every tooltip shares unless it gets its own.
- `defaultTooltipDelay, defaultTooltipCloseDelay, defaultTooltipSkipDelay`: The default timings in milliseconds (500, 100, 300).
- `createToastQueue(env, options?): ToastQueue`: The toasts on show, their limit and their timers, with pause and resume. Used by `Toast`.
- `toastResumeMinimumMilliseconds`: The least time (5000) a toast stays after it resumes.
- `createProgressTimer(env, options?): ProgressTimer`: The timing behind Progress: waiting, then slow after ten seconds. Used by `useProgress`.

### Lists and selection

- `filterItems<TItem>(items, query, options?): TItem[]`: The items whose label contains the query, in their order; a blank query returns all.
- `matchesText(label, query, locale?): boolean`: Whether the label contains the query, ignoring surrounding white space.
- `startsWithText(label, query, locale?): boolean`: Whether the label starts with the query, as typed.
- `createListbox<TItem>(options?, env?): Listbox<TItem>`: The entries, active entry, selection and typeahead of a listbox, without DOM or keys.
- `defaultPageSize, defaultTypeaheadResetMilliseconds`: Page Up and Down step (10) and typeahead reset (500 ms) of a listbox.
- `createCombobox<TItem>(options?, env?): Combobox<TItem>`: The state and keys behind Listbox, Combobox and Autocomplete, with `aria-activedescendant` focus. Used by `useListbox`, `useCombobox`.
- `announcementDebounceMilliseconds`: How long (500) to wait after the last change before announcing the result count. Used by `useCombobox`.
- `createListVirtualizer(options): ListVirtualizer`: Which items of a long list to render, keeping the active, selected and focused ones rendered (wraps `@tanstack/virtual-core` in `src/virtual/`). Used by the virtualized Listbox, Combobox and Autocomplete (`virtualize`), and `useTable`.
- `defaultListOverscan`: Items rendered beyond the visible ones (5).
- `createTypeahead({ env, locale, resetMilliseconds? }): Typeahead`: Typeahead for a list that is not a listbox: holds the word and ends it after a pause. Used by `useMenu`.
- `getTypeaheadMatch({ word, labels, currentIndex, locale }): number | undefined`: The index the typeahead word points at, or `undefined`.
- `getRovingTarget({ key, currentIndex, count, orientation, direction, loop, ... }): number`: The index focus moves to for a key in a roving-tabindex widget. Pure index maths. Used by `useTabs`, `useMenu`, `useToolbar`.
- `getTableOfContentsTree(items): TableOfContentsNode[]`: Nests flat headings into a tree by level. Used by `useTableOfContents`.
- `getActiveHeading({ headings, offset, isAtEnd?, viewportHeight }): number | undefined`: The heading a reader is in. Used by `useTableOfContents`.

### Tables

Tables wrap `@tanstack/table-core` in `src/table/`. Only what is listed here is tested and supported.

- `createTable(options: KvirnTableOptions): KvirnTable`: Creates a TanStack Table instance with store reactivity, as a `ReadableStore`. The only place a table is built. Used by `useTable`.
- `createLocaleSortFn(locale, collatorOptions?): SortFn`: A sort function that orders text as the locale does (å, ä, ö after z in Swedish).
- `renderTemplate(template, context): Result | string | null`: Renders a column's `header`, `cell` or `footer`: a string as is, a function with the context. Used by `Table`.
- `createColumnHelper, tableFeatures`: Helpers to write columns and register features.
- `rowSortingFeature, rowSelectionFeature, rowExpandingFeature, rowPaginationFeature, columnFilteringFeature, globalFilteringFeature, columnVisibilityFeature, columnSizingFeature`: The TanStack features a table registers.
- `createSortedRowModel, createFilteredRowModel, createExpandedRowModel, createPaginatedRowModel`: The row models that go with the features.
- `sortFn_alphanumeric, sortFn_alphanumericCaseSensitive, sortFn_basic, sortFn_datetime, sortFn_text, sortFn_textCaseSensitive`: The built-in sort functions; register the ones you use under `sortFns`.
- `filterFn_arrHas, filterFn_arrIncludes, filterFn_arrIncludesAll, filterFn_arrIncludesSome, filterFn_between, filterFn_betweenInclusive, filterFn_empty, filterFn_endsWith, filterFn_equals, filterFn_equalsString, filterFn_equalsStringSensitive, filterFn_greaterThan, filterFn_greaterThanOrEqualTo, filterFn_inDateRange, filterFn_inNumberRange, filterFn_includesString, filterFn_includesStringSensitive, filterFn_lessThan, filterFn_lessThanOrEqualTo, filterFn_notEmpty, filterFn_startsWith, filterFn_weakEquals`: The built-in filter functions; register the ones you use under `filterFns`.

### Dates and calendar

Dates are ISO strings (`YYYY-MM-DD`, years 1 to 9999); weekdays are ISO numbers (Monday 1, Sunday 7). Nothing uses `Date` arithmetic on the result, so no time zone shifts a day.

- `parseIsoDate(value: string): DateParts | undefined`: The parts of a valid ISO date, otherwise `undefined`. Used by `useCalendar`, `useDatePicker`.
- `toIsoDate(parts: DateParts): IsoDate`: The ISO string of year, month and day parts. Used by `useDatePicker`.
- `isValidIsoDate(value: string): boolean`: Whether a string is a real ISO date. Used by `useCalendar`, `useDatePicker`.
- `isValidDateParts(parts: DateParts): boolean`: Whether year, month and day make a real date. Used by `useDatePicker`.
- `isLeapYear(year: number): boolean`: Whether a year is a leap year.
- `daysInMonth(year: number, month: number): number`: The days in a month.
- `minimumIsoDate, maximumIsoDate`: The range of dates supported (`0001-01-01` to `9999-12-31`).
- `addDays(date, days): IsoDate`: Days later or earlier.
- `addMonths(date, months): IsoDate`: Months later or earlier; the day is cut to the month's length.
- `addYears(date, years): IsoDate`: Years later or earlier; 29 Feb becomes 28 Feb.
- `clampIsoDate(date, minimum?, maximum?): IsoDate`: Keeps a date inside the limits.
- `compareIsoDates(first, second): -1 | 0 | 1`: Orders two dates.
- `getDaysBetween(first, second): number`: Whole days from the first to the second; negative when earlier.
- `getIsoWeekday(date): IsoWeekday`: The weekday of a date, 1 to 7.
- `getIsoWeek(date): IsoWeek`: The ISO 8601 week and week-year of a date. Used by `useCalendar`.
- `getYearMonth(date): YearMonth`: The month a date is in.
- `startOfWeek(date, weekStart): IsoDate`: The first day of the week that holds the date.
- `endOfWeek(date, weekStart): IsoDate`: The last day of the week that holds the date.
- `getWeekdayOrder(weekStart): IsoWeekday[]`: The weekdays in column order. Used by `useCalendar`.
- `getMonthWeeks(yearMonth, weekStart): (IsoDate | undefined)[][]`: The rows of a month; a day of another month is `undefined`. Used by `useCalendar`.
- `getLocaleWeekStart(locale): WeekStart | undefined`: The first weekday `Intl` knows for a locale that names a region.
- `isWeekStart(value: unknown): value is WeekStart`: Whether a value is a weekday number from 1 to 7. Used by `KvirnProvider`.
- `resolveWeekStart({ instance, provider, locale }): WeekStart`: The week start: instance, then provider, then locale region, then Monday. Used by `useDateSettings`.
- `getTodayIsoDate(timeZone, now): IsoDate`: Today in an IANA time zone. Used by `useCalendar`.
- `getCalendarKeyTarget({ key, shiftKey, date, weekStart, direction, minimum, maximum }): IsoDate | undefined`: The day a key moves focus to, or `undefined` when the key is not a calendar move.
- `createCalendar(options: CalendarOptions): CalendarStore`: The state behind Calendar: visible month, focused day and selection, single or range. Used by `useCalendar`.
- `getDayAvailability(date, { minimum, maximum, isDateUnavailable }): CalendarDayAvailability`: Whether a day can be chosen, given the limits and `isDateUnavailable`. Used by `useCalendar`.
- `chooseRangeDate(range, date, selects, rules): RangeChoice`: What a press on a day does to a range. Used by `useCalendar`.
- `getVisibleRange(range): DateRange`: The range as shown: invalid dates are none, an end before the start is ignored. Used by `useCalendar`.
- `getRangeStep(range): RangeStep`: Whether the range needs a start, an end, or is complete. Used by `useCalendar`.
- `getRangePosition(date, range, preview?): RangePosition | undefined`: How a day is drawn in a range. Used by `useCalendar`.
- `getRangeEndAvailability(date, start, rules): RangeEndAvailability`: Whether a day can be the end for a start. Used by `useCalendar`.
- `getRangeSpanStatus(start, end, rules): RangeSpanStatus`: Whether a start and end make a range the rules allow.
- `findBlockingDay(start, last, isDateUnavailable): IsoDate | undefined`: The first unavailable day after the start, up to the last.
- `countDays(start, end): number`: The days from start to end, counting both. Used by `useCalendar`, `useDateRangePicker`.

### Files

- `createFileUpload<Result>(options, env): FileUpload<Result>`: The file list and upload queue: checks each file against the limits with typed reasons (no text) and runs uploads with a concurrency limit. Used by `useFileUpload`.
- `defaultFileUploadConcurrency`: Uploads that run at once by default (3).

### Masks and checks

Both are public and re-exported by `@kvirn/ui`.

- `masks`: Preset masks (digits, letters, letters and digits, number, personal identity number, postal code, organisation number, date, IBAN, email, telephone, pattern, regexp, one-time code). Each is a `Mask` of pure functions. Public. Used by `Input`, `useMask`.
- `checks`: Value checks (personal identity number, organisation number, IBAN, date) that return `{ isValid, reason }`. A mask never blocks on them. Public. Used by `useMask`, `useFileUpload`.
- `createMask(definition: MaskDefinition): Mask`: Builds a mask from a definition.
- `maskNames`: The names a `mask` prop accepts, one per preset.
- `resolveMask(input: MaskInput, context: ResolveMaskContext): ResolvedMask`: Turns a `mask` prop (name, preset object or mask) into a `Mask`; country masks read the country from the instance, the provider, then the locale. Used by `useMask`.
- `unknownMaskName(input: unknown): string | undefined`: The name asked for when it is not in `maskNames`, so the caller can warn. Used by `useMask`.

### Read aloud

- `createReadAloud({ engine, getLanguage, maxChunkLength, ... }): ReadAloud`: The state behind ReadAloud: one utterance per sentence, the next prefetched, real pause and resume. Used by `useReadAloud`.
- `readAloudRates`: The speeds offered (0.75, 1, 1.25, 1.5, 2). Used by `useReadAloud`.
- `collectText(root: Element): CollectedText`: The text a reader hears for an element, skipping what is hidden, with a way back to the DOM. Used by `useReadAloud`.
- `splitSentences(text, { language, maxLength?, languageRuns? }): SentenceChunk[]`: Cuts text into the pieces spoken one at a time.
- `kvirnSpeechEngine({ url, store?, timeout?, voices?, ... }): ReadAloudEngine`: A `ReadAloudEngine` over a Kvirn voice service you name; one sentence per request. Used by `KvirnProvider`, `useReadAloud`.

### Map

Pure geometry, clustering and state with no engine import. Longitude and latitude are degrees; distances are metres.

- `MIN_ZOOM, MAX_ZOOM`: The zoom limits (0 and 22). Used by `Map` (its camera).
- `clamp(value, minimum, maximum): number`: Keeps a number inside limits.
- `clampLatitude(latitude): number`: Keeps a latitude on the map.
- `clampZoom(zoom): number`: Keeps a zoom inside the limits.
- `normalizeLongitude(longitude): number`: Wraps a longitude into -180 to 180.
- `normalizeLngLat(position: LngLat): LngLat`: Wraps the longitude and clamps the latitude.
- `distanceBetween(from: LngLat, to: LngLat): number`: Great-circle distance in metres.
- `boundsContains(bounds, position): boolean`: Whether a position is inside the bounds.
- `boundsFromPlaces(places): MapBounds | null`: The box that holds the places, or `null` for none.
- `boundsOfView(view, size): MapBounds`: The box a view shows at a viewport size. Used by the map providers.
- `panBy(view, fraction, size): MapView`: Moves the camera by a fraction of the viewport. Used by `Map` (its camera).
- `zoomBy(view, delta): MapView`: Changes the zoom, clamped. Used by `Map` (its camera).
- `viewWithPositionAt(position, zoom, size, anchor): MapView`: The view that draws a position at an anchor point of the viewport.
- `clusterPlaces<Data>(places, { zoom, radius, keep, layers? }): MapMarkerItem<Data>[]`: Groups nearby places per layer; clusters change on whole zoom steps only.
- `buildClusterTree(positions: Float64Array, options): ClusterTreeData`: Builds the cluster tree data in one go. Used by `Map` (its places and clusters).
- `createClusterTreeBuilder(positions, options): ClusterTreeBuilder`: A resumable build of the cluster tree. Used by `Map` (its places and clusters).
- `createClusterTree(data: ClusterTreeData): ClusterTree`: Wraps built tree data in a queryable tree. Used by `Map` (its places and clusters).
- `clusterTreeTransferables(data): ArrayBuffer[]`: The buffers to transfer when posting a tree to or from a worker.
- `buildKdIndex(coords, nodeSize?): KdIndexData`: Builds a k-d index of points in one go.
- `createKdIndexBuilder(coords, nodeSize?): KdIndexBuilder`: A resumable k-d index build.
- `createKdIndex(data: KdIndexData): KdIndex`: Queries a built k-d index.
- `placesToSource<Data>(places, layers?): MapPlaceSource<Data>`: Packs places into typed arrays for clustering. Used by `Map` (its places and clusters).
- `NO_LAYER`: The layer index (0xffff) of a place that is on no layer. Used by `Map` (its places and clusters).
- `createMapStore(options): MapStore`: The map's view, size and layer state. Used by `useMap`.
- `selectPlacesInView(state, places): Place[]`: The places on a visible layer and inside the bounds.
- `selectVisiblePlaces(state, places): Place[]`: The places on a visible layer.

### Keyboard

- `createShiftSequence({ count?, windowMs? }): ShiftSequence`: Counts presses of one key in a short window (QuickExit's Shift x3). The caller passes timestamps. Used by `useQuickExit`.
- `matchShortcut(event, shortcut, { apple }?): boolean`: Whether a keydown is the chord: exact modifiers, never in an editable target or with AltGr. Used by `useSkipPanel`.
- `shortcutKeys(shortcut, { apple }): readonly ShortcutKey[]`: The key caps in reading order, for display. Used by `useSkipPanel`.
- `toAriaKeyShortcuts(shortcut, { apple }?): string`: The `aria-keyshortcuts` value for a chord. Used by `useSkipPanel`.
