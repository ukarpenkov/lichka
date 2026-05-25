# Экран чата (ChatRoom) — лента сообщений

**Дата:** 2026-05-25
**Промпт/задача:** Реализовать экран чата `src/pages/chat-room/` по задаче 5.3 из promted-tasks.md

## Что сделано

- Переписан заглушечный `ChatRoomScreen` в полноценный экран с лентой сообщений
- Создан кастомный `ChatHeader` с аватаром чата, названием (tap → редактирование через ChatForm), кнопками «Назад» и «Поиск»
- Реализован компонент `MessageBubble` с bubble-стилизацией, отображением времени (`HH:mm`), маркером «изменено» (если `updatedAt > createdAt`) и анимацией появления `FadeInUp` через Reanimated
- Создан `DateSeparator` с форматированием дат: «Сегодня», «Вчера», «25 мая» / «25 мая 2024»
- Sticky dates: разделитель «прилипает» к верху зоны ленты при скролле через абсолютное позиционирование + `onLayout` для измерения высоты header-зоны + `onViewableItemsChanged` для определения текущей даты
- Реализован `MessageContextMenu` (long press → «Редактировать» / «Удалить») с подтверждением удаления через `Alert.alert` (hard delete)
- Создан `SearchOverlay` с полем ввода, счётчиком результатов и фильтрацией сообщений по `body.includes(query)`
- В `messageRepository` добавлена `getVisibleMessagesByChatId` — фильтрует сообщения: `simple` и `periodic` всегда видимы, `reminder`/`alarm` — только если `scheduled_at <= now`
- Скрыт дефолтный заголовок навигатора для `ChatRoom` (`headerShown: false`)

## Изменённые файлы

- `src/entities/message/model/messageRepository.ts` — добавлена `getVisibleMessagesByChatId(chatId)`
- `src/entities/message/index.ts` — экспорт новой функции
- `src/app/AppNavigator.tsx` — `headerShown: false` для ChatRoom screen
- `src/pages/chat-room/ChatRoomScreen.tsx` — полная перезапись (загрузка данных, inverted FlatList, sticky dates, поиск, контекстное меню, ChatForm)
- `src/pages/chat-room/ChatHeader.tsx` — новый файл
- `src/pages/chat-room/MessageBubble.tsx` — новый файл (Reanimated FadeInUp)
- `src/pages/chat-room/DateSeparator.tsx` — новый файл
- `src/pages/chat-room/MessageContextMenu.tsx` — новый файл
- `src/pages/chat-room/SearchOverlay.tsx` — новый файл
- `src/pages/chat-room/index.ts` — без изменений (экспорт уже был)

## Принятые решения

- **Inverted FlatList** — стандартный паттерн для чатов: данные ordered by `created_at ASC`, `inverted={true}` рендерит новые сообщения внизу
- **Sticky dates через onViewableItemsChanged** —监听页面ные элементы, при появлении date-разделителя обновляем sticky state; абсолютное позиционирование с динамическим `top` через `onLayout` на header-зоне
- **Поиск без FTS5** — миграция 2 (FTS5) отключена, поэтому поиск через `body.toLowerCase().includes(query)` вместо полнотекстового
- **Редактирование сообщения** — заглушка (`// TODO`), форма редактирования будет в отдельной задаче
- **Ввод сообщений (MessageInputBar)** — не включён по решению пользователя (только лента)
- **Фон bubble** — `text + '12'` (одинаковый для всех, нет разделения «мои/чужие»)

## Известные ограничения

- Sticky dates зависят от `onViewableItemsChanged`, который может неточно определять видимые элементы при быстром скролле
- Поиск — линейный перебор, при большом количестве сообщений может быть медленным (решение: включить FTS5 миграцию)
- Редактирование сообщения пока не реализовано (TODO)
- Поле ввода сообщений отсутствует (будет отдельная задача)

## Тестирование

- Проверить навигацию: ChatList → tap на чат → ChatRoomScreen открывается с заголовком
- Tap на название чата → ChatForm открывается в режиме редактирования
- Long press на сообщение → контекстное меню
- Удалить сообщение → подтверждение → сообщение исчезает из ленты
- Разделители дат отображаются между сообщениями разных дней
- Sticky date «прилипает» при скролле мимо разделителя
- Иконка поиска → SearchOverlay, ввод текста → фильтрация ленты
- Закрытие поиска → полная лента восстанавливается
