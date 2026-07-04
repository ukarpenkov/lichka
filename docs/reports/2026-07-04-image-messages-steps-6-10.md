# Шаги 6-10: Виджет, интеграция, композер, экспорт, тесты

**Дата:** 2026-07-04
**Промпт/задача:** Реализация шагов 6-10 из `docs/tasks/image-messages-proposal-prompts.md` — UI и интеграция изображений в чат

## Что сделано

### Шаг 6. Виджет ImageMessage
- Создан `src/widgets/image-message/ImageMessage.tsx` — виджет отображения изображения в баббле
- Парсит `message.payload` (JSON с `uri`, `width`, `height`)
- Вычисляет абсолютный путь через `resolveMediaPath`
- Адаптивная высота: пропорционально ширине (80% экрана), максимум 300px
- Опциональная подпись снизу (из `message.body`)
- Fallback при невалидном payload — отображает `message.body` как текст
- Экспортирован в `src/widgets/index.ts`
- 6 unit-тестов

### Шаг 7. Интеграция в MessageBubble
- Добавлена функция `isImageMessage()` — проверяет `type === 'image'` или payload с `images`
- Добавлен `useMemo` для `isImage`
- В разметке: после VoiceMessage проверяется ImageMessage
- Иконки scheduled-типов скрыты для image-сообщений
- Обновлён `TYPE_ICON` Record (добавлена запись `image`)
- 5 unit-тестов

### Шаг 8. MessageComposer
- Добавлена кнопка Paperclip (между TextInput и Mic)
- Состояние `imagePreview` с превью выбранного изображения
- Превью: картинка + кнопка X для удаления
- Scheduled-кнопки скрыты при активном превью
- Отправка: `sendImageMessage()` — генерирует ID, вызывает `saveImage`, создаёт image-сообщение
- AlertDialog при ошибке выбора изображения
- 4 unit-теста

### Шаг 9. Экспорт/импорт
- Проверено: `exportToJSON` не фильтрует по типу, image-сообщения попадают в экспорт
- Проверено: `importFromJSON` корректно восстанавливает type='image' и payload
- 2 unit-теста

### Шаг 10. Интеграционные тесты
- 6 сценариев: отправка без подписи, с подписью, удаление, экспорт-импорт, исключение из scheduled, enabled=false
- 6 интеграционных тестов

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — новый компонент
- `src/widgets/image-message/index.ts` — public API
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — 6 тестов
- `src/widgets/index.ts` — экспорт ImageMessage
- `src/pages/chat-room/MessageBubble.tsx` — интеграция ImageMessage
- `src/pages/chat-room/__tests__/MessageBubble.test.tsx` — 5 тестов
- `src/widgets/message-composer/MessageComposer.tsx` — кнопка Paperclip, превью, отправка
- `src/widgets/message-composer/__tests__/MessageComposer.test.tsx` — 4 теста
- `src/entities/message/model/messageRepository.ts` — опциональный `id` в `createMessage`
- `src/features/export/__tests__/exportToJSON.test.ts` — 2 теста
- `src/__tests__/image-messages.integration.test.ts` — 6 тестов
- `jest.setup.js` — моки для AsyncStorage, Gesture.Manual, ZoomIn/ZoomOut

## Принятые решения
- `createMessage` дополнен опциональным `id` параметром для предварительной генерации ID перед `saveImage`
- Для тестов MessageComposer замоканы DateTimePicker, PeriodPicker, AlertDialog (слишком много зависимостей для unit-теста)
- AlarmClockIcon и MicIcon — кастомные SVG компоненты, не имеют testID как lucide-иконки

## Тестирование
- Все тесты: **158 passed**, 16 suites
- `npm test` — green
