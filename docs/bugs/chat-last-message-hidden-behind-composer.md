# [UI] Последнее сообщение перекрывается блоком ввода / пустой зазор при скролле

**Модуль:** `src/pages/chat-room/ChatRoomScreen.tsx`, `src/widgets/message-composer/MessageComposer.tsx`
**Платформа:** Android (основной), iOS
**Приоритет:** P1
**Воспроизводимость:** 100%

## Описание

При наборе сообщений с открытой клавиатурой последнее сообщение частично скрывается за `MessageComposer`. При ручной прокрутке вверх появляется пустой промежуток ≈ в высоту одного bubble. Отступ между последним сообщением и композером не фиксирован.

## Корневая причина (после разбора истории фиксов)

Два конфликтующих механизма:

1. **`translateY: -KEYBOARD_COMPOSER_GAP` на MessageComposer** — transform не участвует в layout, композер визуально наезжает на нижнюю часть FlatList.
2. **`contentContainerStyle.paddingBottom: 96` при открытой клавиатуре** (`CHAT_LIST_KEYBOARD_BOTTOM_INSET`) — компенсация «на глаз» под высоту композера; создаёт пустую зону в контенте списка (та самая «дыра» при скролле) и прыжки при переключении 4 ↔ 96.

Поднятие композера над клавиатурой при этом делалось правильно через `paddingBottom` на `chatArea` (`adjustNothing` + `useKeyboardHeight`). Попытки «починить» перекрытие списка через ещё больший list-padding или отключение lift ломали подъём композера с клавиатурой.

## Исправление

- Зазор над клавиатурой перенесён в формулу `chatArea.paddingBottom` (+ `KEYBOARD_COMPOSER_GAP`).
- У `MessageComposer` убран `translateY`.
- У списка фиксированный `MESSAGE_LIST_BOTTOM_GAP` (8px), независимо от клавиатуры.
- Удалены `CHAT_LIST_KEYBOARD_BOTTOM_INSET`, `maintainVisibleContentPosition`, динамический padding списка.

## Статус

fixed
