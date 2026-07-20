# Фикс: последнее сообщение перекрывается MessageComposer

**Дата:** 2026-07-20
**Промпт/задача:** Последнее сообщение наполовину скрывается за блоком ввода; при ручном скролле вверх — пустой промежуток ≈ высота bubble. Нужен фиксированный отступ. Не опираться на советы тестировщика; учесть историю фиксов (многие ломали подъём композера с клавиатурой).

## Что сделано

Пересмотрена модель layout чата вместо очередного костыля к padding списка.

### Корневая причина
1. `MessageComposer` поднимался над клавиатурой через `translateY: -16` — transform не меняет layout → композер наезжает на FlatList.
2. Список компенсировал это `paddingBottom: 96` при открытой клавиатуре → «дыра» при скролле и прыжки 4↔96.
3. Реальный подъём над клавиатурой уже был в `chatArea.paddingBottom` (`adjustNothing` + `useKeyboardHeight`) — его нельзя убирать (история 2026-07-11).

### Решение
- **Зазор composer↔клавиатура** — в формуле `chatArea.paddingBottom` (+ `KEYBOARD_COMPOSER_GAP`), без transform.
- **Зазор сообщение↔composer** — фиксированный `MESSAGE_LIST_BOTTOM_GAP = 8` в `contentContainerStyle`, всегда.
- Удалён `CHAT_LIST_KEYBOARD_BOTTOM_INSET`, `keyboardOpen`-toggle padding, `maintainVisibleContentPosition`.
- Скролл к низу: при новых сообщениях и при `keyboardDidShow` (после сжатия chatArea).

## Изменённые файлы
- `src/shared/lib/keyboard.ts` — `MESSAGE_LIST_BOTTOM_GAP`, убран `CHAT_LIST_KEYBOARD_BOTTOM_INSET`, обновлены комментарии
- `src/shared/lib/index.ts` — экспорт константы
- `src/pages/chat-room/ChatRoomScreen.tsx` — формула lift + фиксированный list padding, упрощён скролл
- `src/widgets/message-composer/MessageComposer.tsx` — убран `translateY`
- `docs/bugs/chat-last-message-hidden-behind-composer.md` — обновлён баг-репорт

## Принятые решения
- **Не трогать Android keyboard lift на chatArea** — единственный рабочий способ поднять композер при `adjustNothing`.
- **Не компенсировать оверлей списком** — убрать оверлей (`translateY`), а не маскировать padding'ом 96px.
- **Композер остаётся flex-sibling под FlatList** — отступ до последнего сообщения = layout, не оверлей.

## Известные ограничения
- `MESSAGE_LIST_BOTTOM_GAP` и `KEYBOARD_COMPOSER_GAP` эмпирические; при смене высоты композера (превью картинки) отступ сообщение↔composer по-прежнему фиксирован (композер растёт вниз/вверх в своём слоте — список сжимается через flex).
- Ручная проверка на устройстве обязательна (клавиатура + Gboard).

## Тестирование
- [ ] Открыть чат → отправить 5+ сообщений до заполнения экрана → последнее полностью видно над composer
- [ ] Отступ сообщение↔composer одинаковый при закрытой и открытой клавиатуре
- [ ] При открытой клавиатуре composer сидит над Gboard с зазором ~16px, не «зависает» посреди экрана
- [ ] Ручной скролл вверх — нет пустой дыры в контенте
- [ ] Многострочный ввод в composer — отступ не скачет
