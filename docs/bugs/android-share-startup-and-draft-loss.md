# Android Share: приложение не открывается и теряется черновик

**Дата обнаружения:** 2026-08-25  
**Платформа:** Android  
**Статус:** fixed  
**Затрагивает:** запуск debug-сборки, `ACTION_SEND`, выбор чата, `MessageComposer`

## Симптомы

1. После добавления Share приложение показывало debug warning/error и не доходило до рабочего сценария.
2. Ссылка открывала список чатов, но после выбора чата поле сообщения оставалось пустым.
3. Картинка копировалась в cache, но warm-start не переводил приложение на список чатов.
4. `assembleDebug` не запускался без release keystore.

## Причины

### Конфликт native-модулей

Новый Kotlin-мост назывался `ShareModule`. Такое имя уже занято встроенным модулем React Native для исходящего Share. В JS `NativeModules.ShareModule` возвращал встроенный модуль без методов `getInitialShare`, `addListener`, `removeListeners`.

### Преждевременная очистка route params

`ChatRoomScreen` очищал `shareText` / `shareImageUri` сразу после получения route params. Пока чат загружался, `MessageComposer` ещё не был смонтирован, поэтому черновик исчезал до применения.

### Ненадёжная доставка warm-start

`MainActivity.onNewIntent()` искал модуль через текущий React Context. В момент доставки intent context или модуль мог быть недоступен, а повторного чтения initial payload на уже смонтированном JS не происходило.

### Release signing блокировал debug

Проверка release keystore выполнялась при конфигурации любого Gradle variant, включая `assembleDebug`.

## Исправление

- Native-мост переименован в `IncomingShareModule`, чтобы не конфликтовать с React Native.
- JS-бридж безопасно работает, если модуль ещё не подключён, и не ломает обычный запуск.
- Warm-start отправляется через активный экземпляр `IncomingShareModule`; cold-start остаётся через `getInitialShare()`.
- Route params очищаются только после callback `onInitialDraftApplied` из `MessageComposer`.
- Проверка release signing выполняется только для запрошенных release-задач.
- Захват некорректных share extras не может уронить обычный запуск.

## Проверка

- Debug APK собран и установлен по USB на Xiaomi 2506BPN68G (Android 17).
- Обычный запуск: процесс остаётся активным, crash buffer пуст.
- Cold-start `text/plain`: список чатов → Saved → ссылка в поле ввода, без автоотправки.
- Warm-start `image/png`: изображение скопировано в `cache/share-inbox`, список чатов → Saved → превью в неотправленном сообщении.
- Intent filters `text/plain`, `text/html`, `image/*` зарегистрированы.
- `npm test`: 488 тестов пройдено.
- ESLint для изменённых TS/TSX-файлов: ошибок нет.
