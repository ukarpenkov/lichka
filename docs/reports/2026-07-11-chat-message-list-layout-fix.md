# Исправление layout списка сообщений чата

**Дата:** 2026-07-11
**Промпт/задача:** Сообщения прячутся за композером при открытой клавиатуре, нужен фиксированный отступ

## Что сделано
- Убрано динамическое переключение `contentContainerStyle.paddingBottom` между 4 и 96 в зависимости от состояния клавиатуры
- `listContentPaddingBottom` теперь всегда равен `CHAT_LIST_KEYBOARD_BOTTOM_INSET` (96px) — фиксированный отступ
- Убрана ручная компенсация клавиатуры на Android (`chatAreaAnimatedStyle` с `paddingBottom` на основе `keyboardHeight`)
- Убран `translateY: -KEYBOARD_COMPOSER_GAP` из анимации композера — система сама обрабатывает подъём клавиатуры
- Удалены неиспользуемые импорты и переменные: `useKeyboardHeight`, `KEYBOARD_ANDROID_LIFT_FUDGE`, `Platform`, `useAnimatedStyle` (в ChatRoomScreen), `PAGER_TAB_BAR_HEIGHT`

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — фиксированный padding, удалена Android keyboard компенсация
- `src/widgets/message-composer/MessageComposer.tsx` — убран translateY при открытой клавиатуре

## Принятые решения
- **Фиксированный padding вместо динамического** — динамическое изменение paddingBottom вызывало пересчёт layout FlatList и pérdida позиции скролла
- **Убрана ручная Android keyboard компенсация** — flex layout + system keyboard handling уже обеспечивают правильное поведение
- **Убран translateY композера** — система уже поднимает view при открытии клавиатуры, дополнительный transform создавал наложение

## Известные ограничения
- Тестируется только визуально — E2E тесты для keyboard handling отсутствуют
- На iOS поведение клавиатуры отличается от Android, проверка на обоих платформах рекомендуется

## Тестирование
- TypeScript компиляция: все ошибки pre-existing, новые не引入лены
- Ручное тестирование: открыть чат → набирать текст → проверить что сообщения видны над композером
