# Исправление отображения фото чата

**Дата:** 2026-07-01
**Промпт/задача:** Фото чата не отображается если выбрать его в списке чатов и в чате тоже

## Что сделано
- Исправлен URI аватара в компоненте `Avatar` — добавлен недостающий базовый путь `DocumentDirectoryPath` через `resolveMediaPath()`
- Исправлен URI предпросмотра аватара в форме редактирования `ChatForm` — аналогично добавлен `resolveMediaPath()`

## Изменённые файлы
- `src/shared/ui/Avatar.tsx` — добавлен импорт `resolveMediaPath`, URI строится через `file://${resolveMediaPath(avatarPath)}`
- `src/widgets/chat-form/ChatForm.tsx` — добавлен импорт `resolveMediaPath`, URI предпросмотра строится через `file://${resolveMediaPath(avatarPath)}`

## Принятые решения
- Использовать существующую утилиту `resolveMediaPath`, которая подставляет `DocumentDirectoryPath`. Она уже используется для voice-сообщений, но не применялась для аватаров.
- Не менять формат хранения `avatarPath` (относительный путь в БД) — только исправить чтение.

## Причина бага
`saveAvatar()` сохраняет файл в `{DocumentDirectoryPath}/media/avatars/xxx.jpg` и возвращает относительный путь `media/avatars/xxx.jpg`. В `Avatar.tsx` URI конструировался как `file://${avatarPath}` → `file://media/avatars/xxx.jpg` без базовой директории. Реальный файл лежит по абсолютному пути `file://{DocumentDirectoryPath}/media/avatars/xxx.jpg`.

## Тестирование
- Визуальная проверка: аватар отображается в списке чатов и в шапке чата
- Эмодзи-аватары (без `/` в пути) не затронуты
