# FAB нового чата: magic wand

**Дата:** 2026-07-20
**Промпт/задача:** Заменить иконку добавления нового чата с `+` на `design-magic-wand` (Streamline Pixel)

## Что сделано
- Добавлен экспорт `MagicWand` (`design-magic-wand`) в pixel icon kit
- FAB создания чата на экране списка чатов использует `MagicWand` вместо `Plus`

## Изменённые файлы
- `src/shared/ui/pixel/icons.ts` — экспорт `MagicWand`
- `src/pages/chat-list/ChatListScreen.tsx` — FAB: `Plus` → `MagicWand`

## Принятые решения
- Оставлен `Plus` в kit (custom path) на случай других экранов; на FAB больше не используется
- Id иконки без суффикса `--Streamline-Pixel` — так хранится в `@iconify-json/streamline-pixel`

## Известные ограничения
- Нет

## Тестирование
- Проверена наличие `design-magic-wand` в `@iconify-json/streamline-pixel`
- Визуально: FAB на ChatList — wand вместо плюса
