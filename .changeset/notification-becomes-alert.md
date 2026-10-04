---
'@kvirn-ui/react': minor
'@kvirn-ui/theme': minor
'@kvirn-ui/i18n': minor
---

**Breaking (minor while 0.x):** `Notification` becomes `Alert` (Plan 0042). Alert is the word most libraries and adopters use (Designsystemet and Aksel both say Alert). Nothing else changes: an Alert is still a plain status message with no `role`, `aria-live` or `aria-atomic`, and `announce` still goes through the Announcer. Despite the name it is not assertive, and `role="alert"` stays an Announcer detail. There is no alias for the old names.

Rename map:

- Components: `Notification.Root`, `.Info`, `.Success`, `.Warning`, `.Danger`, `.Title`, `.Body` and `.Actions` become `Alert.Root`, `.Info`, `.Success`, `.Warning`, `.Danger`, `.Title`, `.Body` and `.Actions`. The named exports follow: `NotificationRoot` to `AlertRoot`, and the same for `Info`, `Success`, `Warning`, `Danger`, `Title`, `Body` and `Actions`.
- Hook and types: `useNotification` to `useAlert`, `UseNotificationOptions` to `UseAlertOptions`, `UseNotificationResult` to `UseAlertResult`, `NotificationVariant` to `AlertVariant`, `NotificationState` to `AlertState`, and every other `Notification…Props` and `Notification…PartProps` type to `Alert…Props` and `Alert…PartProps`.
- Messages (`@kvirn-ui/i18n`): the namespace `notification` becomes `alert`, in all six locales and in `KvirnMessages`. Its keys (`infoPrefix`, `successPrefix`, `warningPrefix` and `dangerPrefix`) are unchanged. `<KvirnProvider messages={{ notification: … }}>` becomes `messages={{ alert: … }}`.
- Classes (theme): `kv-notification` to `kv-alert`, `kv-notification--info|success|warning|danger` to `kv-alert--info|success|warning|danger`, and the part classes `kv-notification-icon`, `-title`, `-status`, `-body` and `-actions` to `kv-alert-icon`, `-title`, `-status`, `-body` and `-actions`.
- Tokens (theme): `--kv-notification-background` and `--kv-notification-accent` to `--kv-alert-background` and `--kv-alert-accent`, and `--kv-notification-padding-block`, `-padding-inline`, `-gap`, `-title-size` and `-title-line-height` to the same names with `--kv-alert-`. If you set them in your own CSS or restyle the status classes, rename them.
- Development warnings (English, for the developer): every key starting `notification-` now starts `alert-` (`notification-without-title`, `notification-assertive-info-success`, `notification-live-region`, `notification-announce-and-focus`, `notification-<part>-outside-root`, `notification-status-class-on-root:<class>` and `notification-conflicting-status:<variant>:<class>`).
- Docs: `docs/design/notification.md` is now `docs/design/alert.md`, and §3.1 of the spec records the reversal of the original name decision.

To migrate, search your code and CSS for `Notification`, `useNotification`, `kv-notification`, `--kv-notification-` and `notification:` in message overrides, and replace them with the names above.
