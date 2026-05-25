# Страница «Запланировано» (Scheduled)

**Дата:** 2026-05-25
**Промпт/задача:** Реализовать экран «Запланировано» — список всех запланированных сообщений с переходом в чат

## Что сделано

- Обновлён `getScheduledMessages()` в `messageRepository`: добавлен явный фильтр `type IN ('reminder', 'alarm', 'periodic')` и `ORDER BY scheduled_at ASC`
- Расширен `ChatStackParamList` — добавлен опциональный `messageId` в параметры `ChatRoom`
- Создан компонент `ScheduledItem` — строка списка с иконкой типа (Bell/AlarmClock/Repeat), текстом сообщения, названием чата и форматированным временем
- Переписан `ScheduledScreen` — загрузка через `useFocusEffect`, `FlatList`, пустое состояние «Нет запланированных», кросс-таб навигация в ChatRoom

## Изменённые файлы

- `src/entities/message/model/messageRepository.ts` — обновлён `getScheduledMessages()`
- `src/app/types.ts` — добавлен `messageId?` в `ChatRoom` params
- `src/pages/scheduled/ScheduledScreen.tsx` — полная реализация экрана
- `src/pages/scheduled/ScheduledItem.tsx` — новый компонент строки списка

## Принятые решения

- Форматирование даты: «сегодня» → только время, «завтра» → «Завтра HH:MM», иначе → «д MMM HH:MM»
- Для `periodic` тип показывает «каждые N мин» вместо даты
- Кросс-таб навигация через `navigation.navigate('ChatsTab', { screen: 'ChatRoom', params: ... })`
- `ScheduledItem` — внутренний компонент страницы, не экспортируется через public API

## Известные ограничения

- `messageId` передаётся в `ChatRoom`, но скролл к конкретному сообщению пока не реализован в `ChatRoomScreen`
- Навигация использует `as never` для обхода типизации вложенных навигаторов

## Тестирование

- Ручное: пустое состояние, список с разными типами сообщений, тап → переход в чат
