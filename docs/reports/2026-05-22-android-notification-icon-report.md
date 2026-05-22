# Android notification icon (ic_stat_notification)

**Дата:** 2026-05-22
**Промпт/задача:** Сделать отдельную иконку для Android-уведомлений на базе `design/icons/icon.svg`.

## Что сделано

- Добавлен `ic_stat_notification` — белый силуэт пера на прозрачном фоне для status bar / notification shade.
- Viewport 24×24 dp, масштаб символа ×1.2 относительно launcher foreground — лучше читается в маленьком размере.
- Исходник: `design/icons/android/ic_stat_notification.svg`.
- Генерация включена в `scripts/generate-android-icons.mjs` (`npm run icons:android`).

## Изменённые файлы

- `scripts/generate-android-icons.mjs` — генерация notification drawable и SVG-исходника
- `android/app/src/main/res/drawable/ic_stat_notification.xml` — vector drawable для уведомлений
- `design/icons/android/ic_stat_notification.svg` — исходник

## Принятые решения

- **Отдельный ресурс**, не launcher icon: Android использует только альфа-канал small icon и сам tint'ит его системным цветом.
- **Белое заполнение + белая линия** вместо тёмного пера — соответствует Material Guidelines для notification icons.
- **Лёгкое увеличение (scale 1.2)** — символ не теряется в 24 dp, остаётся в safe zone.

## Использование

При подключении уведомлений (Notifee, FCM, react-native-push-notification и т.д.) указывать:

```kotlin
.setSmallIcon(R.drawable.ic_stat_notification)
```

```javascript
// Notifee example
android: {
  smallIcon: 'ic_stat_notification',
}
```

## Известные ограничения

- Код уведомлений в проекте пока не подключён — иконка готова как ресурс, но не используется автоматически.
- На Android 13+ цвет small icon задаёт система/канал уведомлений.

## Тестирование

- `npm run icons:android` — успешно
- `./gradlew :app:processDebugResources` — ресурс валиден
