# Fix notification navigation to specific chat

**Дата:** 2026-07-03
**Промпт/задача:** Bug report: notification opens chat list instead of specific chat when tapping push notification

## Что сделано
- Исправлена гонка состояний в `useNotificationNavigation` — навигация буферизуется до готовности `NavigationContainer`
- Добавлен `onReady` колбэк в `NavigationContainer` для сигнализации о готовности навигации
- Добавлен `messageId` в payload уведомлений для прокрутки к конкретному сообщению
- Добавлен нативный метод `getInitialMessageId()` и обновлён `emitNotificationOpen` для передачи `messageId`
- Обновлён `NotificationHelper.buildReminderNotification()` — теперь включает `EXTRA_MESSAGE_ID` в intent

## Изменённые файлы
- `src/features/notifications/useNotificationNavigation.ts` — полная переработка с буферизацией и `setNavigationReady`
- `src/app/AppNavigator.tsx` — добавлен `onReady` колбэк
- `src/features/notifications/index.ts` — экспорт `setNavigationReady`
- `src/features/index.ts` — реэкспорт `setNavigationReady`
- `src/shared/lib/notificationChannels.ts` — добавлен `getInitialMessageId` bridge
- `src/shared/lib/index.ts` — реэкспорт `getInitialMessageId`
- `android/.../NotificationHelper.kt` — `EXTRA_MESSAGE_ID` в reminder intent
- `android/.../NotificationModule.kt` — `getInitialMessageId()`, обновлён `emitNotificationOpen()`, `consumeInitialChatId`
- `android/.../MainActivity.kt` — передача `messageId` в `emitNotificationOpen()`

## Принятые решения
- Использован `NavigationContainer.onReady` вместо `createNavigationContainerRef` из-за конфликтов типов в React Navigation v7 (NavigationContainerRefWithCurrent несовместим с React.RefObject)
- Модульные переменные для навигации вместо пропсов — упрощает код и избегает проблем с типами
- `Promise.all` для параллельного чтения `chatId` и `messageId` вместо последовательных вызовов
- `messageId` опционален в `emitNotificationOpen` — обратная совместимость

## Тестирование
- TypeScript: `npx tsc --noEmit` — чисто (pre-existing errors only)
- ESLint: 0 errors, 3 pre-existing warnings

## Известные ограничения
- Будильники (AlarmType) открывают `AlarmActivity` без кнопки перехода в чат — это отдельная проблема
- Нет unit-тестов на хук `useNotificationNavigation` (не было и до фикса)
