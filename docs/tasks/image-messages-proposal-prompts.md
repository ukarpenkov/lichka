# Разбиение задачи «Отправка изображений в чат» на промты

**Источник требований:** `docs/features/image-messages-proposal.md`
**Дата:** 2026-07-04

---

## Общие правила (включаются в каждый промт)

```
## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз (app → pages → widgets → features → entities → shared)
- Public API слоя — только через index.ts
- Один модуль — одна задача
- Не импортируй из верхних слоёв
- Следуй code-style проекта (именование, форматирование, импорты)
- Пиши unit-тесты для каждого нового/изменённого модуля
- После реализации прогони тесты: `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-<N>.md`
- Конвенциональные коммиты: `feat(image): ...`, `test(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Статусы шагов

| Шаг | Статус |
|-----|--------|
| 1. Миграция БД — CHECK constraint с 'image' | |
| 2. MessageType + messageRepository | |
| 3. IMAGES_DIR и saveImage в mediaPath.ts | |
| 4. Утилита сжатия изображений imageCompress.ts | |
| 5. Локализация — ключи для изображений | |
| 6. Виджет ImageMessage | |
| 7. Интеграция ImageMessage в MessageBubble | |
| 8. MessageComposer — кнопка скрепки, превью, отправка | |
| 9. Экспорт/импорт с изображениями | |
| 10. Интеграционные тесты полного цикла | |

---

## Шаг 1. Миграция БД — CHECK constraint с 'image'

**Статус:** 

### Задача
Добавить `'image'` в CHECK constraint таблицы `messages`. Поскольку SQLite не поддерживает ALTER CONSTRAINT, нужно создать новую таблицу с обновлённым constraint, перенести данные, удалить старую, переименовать новую.

### Что сделать
1. В `src/shared/db/db.ts` добавить миграцию 6:
   - Создать `messages_new` с CHECK: `type IN ('simple', 'reminder', 'alarm', 'periodic', 'image')`
   - `INSERT INTO messages_new SELECT * FROM messages`
   - `DROP TABLE messages`
   - `ALTER TABLE messages_new RENAME TO messages`
2. Обернуть в транзакцию (уже делает `runMigrations()`)
3. Написать тест в `src/shared/db/__tests__/db.test.ts`:
   - Мокнуть существующие миграции 1-5 как применённые
   - Применить миграцию 6
   - Проверить что INSERT с `type='image'` работает
   - Проверить что INSERT с `type='invalid'` падает

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-1.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 2. MessageType + messageRepository

**Статус:** 

### Задача
Добавить `'image'` в юнион-тип `MessageType` и обновить репозиторные запросы, чтобы image-сообщения корректно выбирались, а файлы изображений — удалялись при удалении сообщения.

### Что сделать
1. В `src/entities/message/model/types.ts`:
   - Добавить `'image'` в `MessageType`: `'simple' | 'reminder' | 'alarm' | 'periodic' | 'image'`
2. В `src/entities/message/model/messageRepository.ts`:
   - `getVisibleMessagesByChatId` — добавить `'image'` в `type IN ('simple', 'periodic', 'image')` (строка 155)
   - `deleteMessage` — уже удаляет файлы по `payload.uri` (строка 118-127), проверь что путь включает `media/images/` и работает для абсолютных/относительных путей
   - `createMessage` — `enabled = type === 'simple' ? 0 : 1` → изменить на `type === 'simple' || type === 'image' ? 0 : 1` (image не запланировано)
3. Дополнить существующие тесты в `src/entities/message/__tests__/messageRepository.test.ts`:
   - Тест: `createMessage` с `type='image'` создаёт сообщение с `enabled=false`
   - Тест: `getVisibleMessagesByChatId` возвращает image-сообщения
   - Тест: `getScheduledMessages` НЕ возвращает image-сообщения

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-2.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 3. IMAGES_DIR и saveImage в mediaPath.ts

**Статус:** 

### Задача
Добавить константу `IMAGES_DIR` и функцию `saveImage()` для сохранения сжатого изображения в медиа-директорию, по аналогии с `saveAvatar()`.

### Что сделать
1. В `src/shared/lib/mediaPath.ts`:
   - Добавить `export const IMAGES_DIR = `${MEDIA_DIR}/images`;`
   - Добавить `saveImage(sourceUri: string, messageId: string): Promise<string>`:
     - Вызвать `ensureDir(IMAGES_DIR)`
     - Целевой путь: `${IMAGES_DIR}/${messageId}.jpg`
     - Удалить существующий файл если есть
     - Скопировать sourceUri → dest через `RNFS.copyFile`
     - Вернуть относительный путь: `media/images/${messageId}.jpg`
2. В `src/shared/lib/index.ts`:
   - Добавить `IMAGES_DIR` и `saveImage` в экспорт из `./mediaPath`
3. Написать тесты в `src/shared/lib/__tests__/mediaPath.test.ts`:
   - `saveImage` создаёт директорию и копирует файл
   - `saveImage` возвращает относительный путь
   - `saveImage` перезаписывает существующий файл

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-3.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 4. Утилита сжатия изображений imageCompress.ts

**Статус:** 

### Задача
Создать модуль сжатия изображений перед сохранением. Использовать встроенные возможности `react-native-image-picker` (maxWidth, maxHeight, quality) — без новой зависимости.

### Что сделать
1. Создать `src/shared/lib/imageCompress.ts`:
   - Функция `pickAndCompressImage(): Promise<CompressedImage | null>`
   - Вызывает `launchImageLibrary({ mediaType: 'photo', maxWidth: 1920, maxHeight: 1920, quality: 0.75 })`
   - Возвращает `{ uri, width, height, fileSize } | null` (null при отмене/ошибке)
   - Обёрнута в Promise (использовать паттерн `new Promise` вокруг callback-based API)
   - Тип `CompressedImage = { uri: string; width: number; height: number; fileSize: number }`
2. Экспортировать `pickAndCompressImage` из `src/shared/lib/index.ts`
3. Написать тесты в `src/shared/lib/__tests__/imageCompress.test.ts`:
   - Мок `launchImageLibrary`, проверить что параметры сжатия передаются
   - Проверить что возвращается `null` при отмене (`didCancel: true`)
   - Проверить что возвращается `null` при ошибке (`errorCode`)

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-4.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 5. Локализация — ключи для изображений

**Статус:** 

### Задача
Добавить строки локализации для функциональности изображений: подпись к сообщению, текст кнопки, плейсхолдер, ошибки.

### Что сделать
1. В `src/shared/config/locale.ts`:
   - Добавить в интерфейс `LocaleDictionary`:
     - `attachImage: string` — тултип кнопки скрепки
     - `imagePreview: string` — заголовок превью
     - `removeImage: string` — кнопка удаления превью
     - `imagePickError: string` — ошибка выбора изображения
     - `imageMessage: (width: number, height: number) => string` — тело сообщения (нейтральный формат `[image:WxH]`)
   - Добавить значения в `ru`:
     - `attachImage: 'Прикрепить изображение'`
     - `imagePreview: 'Предпросмотр'`
     - `removeImage: 'Убрать'`
     - `imagePickError: 'Не удалось выбрать изображение'`
     - `imageMessage: (w, h) => `[image:${w}x${h}]``
   - Добавить значения в `en`:
     - `attachImage: 'Attach image'`
     - `imagePreview: 'Preview'`
     - `removeImage: 'Remove'`
     - `imagePickError: 'Failed to pick image'`
     - `imageMessage: (w, h) => `[image:${w}x${h}]``
2. Обновить тесты в `src/shared/config/__tests__/locale.test.ts`:
   - Проверить наличие всех новых ключей в `ru` и `en`

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-5.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 6. Виджет ImageMessage

**Статус:** 

### Задача
Создать виджет `ImageMessage` для отображения изображения в баббле сообщения, по образу `VoiceMessage`. Картинка сверху, опциональная подпись снизу.

### Что сделать
1. Создать `src/widgets/image-message/ImageMessage.tsx`:
   - Парсит `message.payload` → извлекает `uri`, `width`, `height` из JSON
   - Вычисляет абсолютный путь через `resolveMediaPath(uri)`
   - Отрисовывает `<Image source={{ uri: 'file://' + absolutePath }} />`
   - Стили: `borderRadius: 12`, `resizeMode: 'cover'`, `maxHeight: 300`
   - Адаптивная высота: пропорционально ширине баббла (80% экрана), но ≤300px
   - Если `body` не пустой — показывает текст подписи под картинкой (Text variant="body")
   - Fallback: если uri невалидный — показать `[image]` текстом
   - Тип пропсов: `{ message: Message }`
2. Создать `src/widgets/image-message/index.ts`:
   - `export { ImageMessage } from './ImageMessage';`
3. Зарегистрировать в `src/widgets/index.ts`:
   - `export { ImageMessage } from './image-message';`
4. Написать тест в `src/widgets/image-message/__tests__/ImageMessage.test.tsx`:
   - Рендерится с валидным payload (изображение + подпись)
   - Рендерится без подписи (body пустой)
   - Fallback при отсутствующем uri

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-6.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 7. Интеграция ImageMessage в MessageBubble

**Статус:** 

### Задача
Добавить детектирование image-сообщений в `MessageBubble` и рендерить `ImageMessage` для них, аналогично тому как сейчас работает `VoiceMessage`.

### Что сделать
1. В `src/pages/chat-room/MessageBubble.tsx`:
   - Добавить функцию `isImageMessage(message: Message): boolean`:
     - Проверить `message.payload` на JSON с полем `uri`, содержащим `'images'`
     - ИЛИ проверить `message.type === 'image'`
   - Добавить импорт `ImageMessage` из `../../widgets/image-message`
   - В разметке (строка 83) добавить условие для image:
     ```
     {isVoice ? <VoiceMessage .../> : isImage ? <ImageMessage .../> : <Text .../>}
     ```
   - `useMemo` для `isImage` как у `isVoice`
2. Написать тест в `src/pages/chat-room/__tests__/MessageBubble.test.tsx`:
   - Рендерит ImageMessage для type='image'
   - Рендерит ImageMessage для type='simple' с image payload (обратная совместимость)
   - Не ломает рендеринг VoiceMessage и текстовых сообщений

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-7.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 8. MessageComposer — кнопка скрепки, превью, отправка

**Статус:** 

### Задача
Добавить в `MessageComposer` кнопку прикрепления изображения (Paperclip), состояние превью выбранного изображения с возможностью удаления, логику отправки image-сообщения.

### Что сделать
1. В `src/widgets/message-composer/MessageComposer.tsx`:
   - Добавить импорт `Paperclip` из `lucide-react-native`
   - Добавить импорт `pickAndCompressImage` из `../../shared/lib/imageCompress`
   - Добавить импорт `saveImage` из `../../shared/lib`
   - Добавить состояние `imagePreview: { uri: string; width: number; height: number } | null`
   - **Кнопка Paperclip:** разместить в `actions` ряду между TextInput и Mic:
     ```
     [📎 MicIcon]  [Repeat] [AlarmClockIcon] [Bell] [Send]
     ```
     - По нажатию вызывает `pickAndCompressImage()`, результат → `setImagePreview`
     - При ошибке показать AlertDialog с `t.imagePickError`
   - **Состояние превью:** когда `imagePreview !== null`:
     - Заменить TextInput на:
       - Превью изображения (`<Image source={{ uri: imagePreview.uri }} />`)
       - Кнопка удаления (X, сбрасывает `imagePreview` в null)
       - TextInput для подписи (опциональной)
     - Скрыть кнопки scheduled-типов (Repeat, AlarmClockIcon, Bell) — только Send и Paperclip
     - Send отправляет `type: 'image'`
   - **Логика отправки image:**
     - Если `imagePreview` и `!body.trim()` → `createMessage(chatId, 'image', t.imageMessage(w, h), null, null, payload)` где `payload = JSON.stringify({ uri: savedPath, width, height })`
     - Если `imagePreview` и `body.trim()` → `createMessage(chatId, 'image', body, null, null, payload)` (текст = подпись)
     - После отправки сбросить `imagePreview` и `body`
   - **saveImage** вызывать перед createMessage: сначала сжать и сохранить, потом создать запись
2. Написать тест в `src/widgets/message-composer/__tests__/MessageComposer.test.tsx`:
   - Кнопка Paperclip отображается
   - После выбора изображения показывается превью
   - Кнопка удаления сбрасывает превью
   - Scheduled-кнопки скрыты при активном превью
   - Отправка создаёт image-сообщение с payload

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-8.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 9. Экспорт/импорт с изображениями

**Статус:** 

### Задача
Убедиться, что image-сообщения корректно включаются в экспорт/импорт. Поле `payload` (с JSON `{ uri, width, height }`) уже сериализуется — нужно проверить что всё работает и при необходимости добавить обработку.

### Что сделать
1. Проверить `src/features/export/exportToJSON.ts`:
   - Сообщения с `type='image'` уже попадают в экспорт (нет фильтрации по типу)
   - `payload` сериализуется как строка — изображения включаются как ссылки на файлы
   - **Важно:** изображения-файлы НЕ включаются в JSON (только ссылки). При импорте на другое устройство файлы не восстановятся. Это известное ограничение v1 (см. вопрос 6 в proposal).
2. Проверить сервис импорта (найти файл импорта):
   - `createMessage` должен принимать `type: 'image'` без ошибок
   - payload должен корректно восстанавливаться
3. Написать тест в `src/features/export/__tests__/exportToJSON.test.ts`:
   - Image-сообщения попадают в экспорт
   - Payload сохраняется как строка
   - После импорта image-сообщение восстанавливается с корректным payload

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-9.md`
- Конвенциональные коммиты: `feat(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Шаг 10. Интеграционные тесты полного цикла

**Статус:** 

### Задача
Написать интеграционные тесты, покрывающие полный цикл работы с изображениями: от выбора до отображения и удаления.

### Что сделать
1. Создать `src/__tests__/image-messages.integration.test.ts`:
   - **Сценарий 1: Отправка изображения без подписи**
     - Мок `launchImageLibrary` → возвращает изображение
     - Имитация: pick → compress → save → createMessage('image', '', ...)
     - Проверить что сообщение создано с `type='image'`, `payload` содержит uri
     - Проверить что `getVisibleMessagesByChatId` возвращает это сообщение
   - **Сценарий 2: Отправка изображения с подписью**
     - То же, но `body = 'Мой скриншот'`
     - Проверить что body сохранён как подпись
   - **Сценарий 3: Удаление image-сообщения**
     - Создать image-сообщение
     - Вызвать `deleteMessage(id)`
     - Проверить что `RNFS.unlink` вызван с путём к файлу
   - **Сценарий 4: Экспорт → импорт image-сообщения**
     - Создать image-сообщение
     - Экспортировать → проверить наличие в JSON
     - Импортировать → проверить восстановление payload
   - **Сценарий 5: Миграция БД с существующими данными**
     - Создать БД с миграциями 1-5
     - Добавить сообщения всех старых типов
     - Применить миграцию 6
     - Проверить что старые данные сохранены, новые image-сообщения работают
   - **Сценарий 6: image-сообщение не попадает в scheduled**
     - Создать image-сообщение
     - `getScheduledMessages()` не возвращает его
2. Проверить что `cleanupOrphanMedia` обрабатывает `media/images/` (уже работает — итерирует все поддиректории `MEDIA_DIR`)
3. Прогнать все тесты: `npm test`

### Общие правила
```
- Читай ВСЕ изменяемые файлы перед правкой
- FSD архитектура: зависимости только вниз
- Public API слоя — только через index.ts
- Следуй code-style проекта
- Пиши unit-тесты, прогони `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-image-messages-step-10.md`
- Конвенциональные коммиты: `test(image): ...`
- НЕ добавляй комментарии в код, если не попросили явно
```

---

## Примечания

### Порядок выполнения
1. Шаги **1-5** — инфраструктурные, можно делать параллельно (не зависят друг от друга):
   - Шаг 1 (миграция БД) — независим
   - Шаг 2 (типы + репозиторий) — зависит от шага 1 (CHECK constraint)
   - Шаг 3 (mediaPath) — независим
   - Шаг 4 (сжатие) — независим
   - Шаг 5 (локализация) — независим

2. Шаги **6-9** — UI и интеграция:
   - Шаг 6 (ImageMessage widget) — зависит от шагов 2, 3, 5
   - Шаг 7 (MessageBubble) — зависит от шагов 2, 6
   - Шаг 8 (MessageComposer) — зависит от шагов 2, 3, 4, 5
   - Шаг 9 (экспорт) — зависит от шага 2

3. Шаг **10** — финальные тесты, зависит от всех предыдущих

### Файлы, которые НЕ требуют изменений (согласно proposal)
- `src/features/export/exportToJSON.ts` — уже сериализует payload
- `src/pages/chat-room/MessageContextMenu.tsx` — работает с любым типом
- `src/shared/lib/cleanupMedia.ts` — итерирует все поддиректории MEDIA_DIR
- `src/entities/message/model/messageRepository.ts:deleteMessage` — уже удаляет файлы по payload.uri
- FTS/поиск — body индексируется, image-сообщения с подписью найдутся
- Scheduled-сообщения — image не генерирует scheduled
- Google Drive — бэкап пока только JSON, изображения как файлы — отложено до v2
