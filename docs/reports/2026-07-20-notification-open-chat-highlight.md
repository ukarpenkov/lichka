# Клик по уведомлению → чат + подсветка сообщения

**Дата:** 2026-07-20
**Промпт/задача:** Клик по уведомлению (периодическому или отложенному напоминанию) должен открывать чат на месте этого уведомления и подсвечивать его, как на вкладке «Запланировано».

## Что сделано

- Исправлен warm-start путь: `emitNotificationOpen` передавал в JS обычный `MutableMap`, а React Native (`Arguments.fromJavaArgs`) принимает только `WritableNativeMap` — событие падало с `Cannot convert argument of type LinkedHashMap`, JS не получал `onNotificationOpen`.
- Добавлен захват extras intent в `NotificationModule` (cold start до готовности `currentActivity`).
- `navigateToChat` при уже открытом `ChatRoom` обновляет params через `navigate({ merge: true })` и передаёт `focusNonce`, чтобы повторно запустить scroll + highlight.
- `ChatRoomScreen` учитывает `focusNonce` в эффектах скролла/подсветки.

## Изменённые файлы

- `android/.../NotificationModule.kt` — `Arguments.createMap()`, pending open extras
- `android/.../MainActivity.kt` — `captureNotificationOpen` в `onCreate` / `onNewIntent`
- `src/app/mainTabsApi.ts` — `openChatRoom` + `focusNonce`
- `src/app/types.ts` — `focusNonce?` в params `ChatRoom`
- `src/pages/chat-list/ChatListScreen.tsx` — регистрация nav API с `getCurrentRoute` / merge navigate
- `src/pages/chat-room/ChatRoomScreen.tsx` — зависимость эффектов от `focusNonce`

## Принятые решения

- Переиспользовать тот же путь, что у «Запланировано»: `navigateToChat(chatId, messageId)` → scroll + 1s highlight.
- Не трогать full-screen `AlarmActivity` (будильники) — запрос про reminder/periodic.
- `focusNonce = Date.now()` вместо remount экрана — достаточно сбросить `scrolledToMessageRef`.

## Известные ограничения

- Будильник (Alarm) по dismiss по-прежнему не открывает чат — отдельная задача.
- Нужен rebuild Android-приложения (нативные изменения).

## Тестирование

- Логика сверялась с `Arguments.fromJavaArgs` в RN: `MutableMap` → RuntimeException; `WritableNativeMap` — ок.
- Ручная проверка на устройстве: создать reminder/periodic → дождаться уведомления → тап (app в фоне и cold start) → чат открывается, сообщение по центру, подсветка ~1с.
