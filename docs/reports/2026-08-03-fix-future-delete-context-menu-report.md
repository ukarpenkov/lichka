# Fix: удаление сообщений из Future через контекстное меню

**Дата:** 2026-08-03  
**Промпт/задача:** Периодическое уведомление в Future не удаляется: long-press → «Удалить» / «Редактировать», но окно подтверждения не появляется.

## Что сделано

- Найдена и исправлена реальная причина: пункты контекстного меню сообщений использовали `AnimatedPressable` из `react-native-gesture-handler` внутри RN `<Modal>`. Modal монтируется вне корневого `GestureHandlerRootView` приложения, поэтому `onPress` у RNGH-кнопок не срабатывал.
- `MessageContextMenu` переведён на обычный RN `Pressable` — по тому же принципу, что уже работает в `ChatContextMenu` (меню внутри backdrop-`Pressable`).
- Добавлена защита от ghost-click: пункты Edit/Delete активируются через ~350 ms после открытия меню. Иначе long-press в Future (строка часто под центром экрана) при отпускании пальца сразу нажимал «Удалить» → казалось, что меню нет, а сразу Confirm (Удалить / Отмена).
- В `ChatRoomScreen` добавлена задержка 300 ms перед открытием `AlertDialog` / `MessageEditor` после закрытия меню (паттерн из Settings) — страховка handoff между двумя Modal.

## Изменённые файлы

- `src/pages/chat-room/MessageContextMenu.tsx` — RN `Pressable` вместо RNGH `AnimatedPressable`; разметка как у `ChatContextMenu`; arm-delay 350 ms против ghost-click после long-press.
- `src/pages/chat-room/ChatRoomScreen.tsx` — в `handleDeleteMessage` и `handleEditMessage`: закрытие меню + `setTimeout(300)` перед `setDialog` / `setEditMessage`.

## Принятые решения

- **Корневая причина №1 — RNGH в Modal**, а не логика удаления periodic. Для reminder/alarm в Future тот же код; one-shot чаще удаляют из Scheduled (confirm сразу, без меню).
- **Корневая причина №2 — ghost-click**: после фикса №1 long-press открывал меню, отпускание пальца сразу жмало «Удалить» → Confirm. В Future строки чаще у центра, где меню; в истории чата — чаще у низа, поэтому Edit/Delete там «работали нормально».
- **RN `Pressable` + структура ChatContextMenu** вместо локального `GestureHandlerRootView` — минимальный diff.
- Задержку 300 ms в `ChatRoomScreen` оставили как страховку Menu → AlertDialog / MessageEditor.

## Известные ограничения

- Автотестов на `MessageContextMenu` нет; регрессию проверяли вручную.
- Аналогичный риск Menu → AlertDialog в `ChatListScreen` + `ChatContextMenu` не трогали — там уже RN `Pressable`.

## Тестирование

Рекомендуемый ручной сценарий:

1. Чат → Future → long-press на periodic → появляется меню Edit/Delete (не сразу Confirm) → «Удалить» → confirm → запись исчезает, нотификация снимается.
2. То же для reminder и alarm в Future.
3. Future → long-press → «Редактировать» → открывается `MessageEditor`.
4. History → long-press → Edit/Delete работают как раньше.
5. Scheduled (вкладка) → long-press → confirm по-прежнему без меню.
