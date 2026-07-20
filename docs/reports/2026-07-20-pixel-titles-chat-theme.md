# Пиксельные заголовки: чат и тема

**Дата:** 2026-07-20  
**Промпт/задача:** Сделать пиксельными (как у табов) заголовки «Тема оформления» и название чата на экране чата.

## Что сделано
- `ChatHeader` — название чата переведено на `typography.display` (Press Start 2P).
- `ThemePicker` — native stack `headerTitleStyle` на Press Start 2P / размер `display`.
- Обновлены комментарии токенов и дизайн-доки: pixel display — для screen titles, не только корневых табов.

## Изменённые файлы
- `src/pages/chat-room/ChatHeader.tsx` — `variant="display"`
- `src/app/AppNavigator.tsx` — `headerTitleStyle` для ThemePicker
- `src/shared/config/tokens.ts` — уточнены комментарии scope display
- `DESIGN.md` — иерархия typography
- `docs/design/lichka-design-system.md` — контракт PageHeader / ChatHeader

## Принятые решения
- Один токен `display` (18/28) для всех screen titles — единый характер с табами.
- Длинные названия чата по-прежнему `numberOfLines={1}` (ellipsis).
- «Тема оформления» шире «Запланировано»; при overflow native header обрежет — при необходимости можно ввести `display-sm`.

## Известные ограничения
- Press Start 2P очень широкий: длинные chat titles и RU «Тема оформления» могут чаще уходить в ellipsis, чем mono.

## Тестирование
- Не запускалось на устройстве в этой сессии; визуально проверить ChatRoom + ThemePicker на RU/EN.
