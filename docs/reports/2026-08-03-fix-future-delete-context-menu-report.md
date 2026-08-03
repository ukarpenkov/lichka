# Fix: удаление сообщений из Future через контекстное меню

**Дата:** 2026-08-03  
**Промпт/задача:** Периодическое уведомление в Future не удаляется: long-press → «Удалить» / «Редактировать», но окно подтверждения не появляется.

## Что сделано

- Найдена и исправлена реальная причина: пункты контекстного меню сообщений использовали `AnimatedPressable` из `react-native-gesture-handler` внутри RN `<Modal>`. Modal монтируется вне корневого `GestureHandlerRootView` приложения, поэтому `onPress` у RNGH-кнопок не срабатывал.
- `MessageContextMenu` переведён на обычный RN `Pressable` — по тому же принципу, что уже работает в `ChatContextMenu`.
- Backdrop (закрытие по тапу вне меню) вынесен в отдельный `Pressable` с `StyleSheet.absoluteFill`, чтобы не перехватывать нажатия на пункты меню.
- В `ChatRoomScreen` добавлена задержка 300 ms перед открытием `AlertDialog` / `MessageEditor` после закрытия меню (паттерн из Settings). Это дополнительная страховка для handoff между двумя Modal; сама по себе проблему не решала — пользователь подтвердил, что без фикса меню поведение не менялось.

## Изменённые файлы

- `src/pages/chat-room/MessageContextMenu.tsx` — замена `AnimatedPressable` (RNGH) на RN `Pressable`; упрощена разметка backdrop; убраны reanimated enter/exit на обёртке меню.
- `src/pages/chat-room/ChatRoomScreen.tsx` — в `handleDeleteMessage` и `handleEditMessage`: закрытие меню + `setTimeout(300)` перед `setDialog` / `setEditMessage`.

## Принятые решения

- **Корневая причина — RNGH в Modal**, а не логика удаления periodic-сообщений и не «гонка» двух Modal как единственный фактор. Для reminder/alarm/alarm в Future тот же код; различие в UX было в том, что one-shot чаще удаляют из вкладки Scheduled (long-press сразу открывает confirm, без промежуточного меню).
- **RN `Pressable` вместо локального `GestureHandlerRootView`** внутри Modal — минимальный diff, согласован с `ChatContextMenu`. Альтернатива (обёртка Modal в GHRV, как в `DateTimePicker`) не понадобилась.
- Задержку 300 ms в `ChatRoomScreen` оставили: не мешает и снижает риск конфликта Menu → AlertDialog / MessageEditor на части устройств.

## Известные ограничения

- Автотестов на `MessageContextMenu` нет; регрессию проверяли вручную.
- Аналогичный риск Menu → AlertDialog в `ChatListScreen` + `ChatContextMenu` не трогали — там уже RN `Pressable`.

## Тестирование

Рекомендуемый ручной сценарий:

1. Чат → Future → long-press на periodic → «Удалить» → появляется confirm → подтверждение → запись исчезает из списка, нотификация снимается.
2. То же для reminder и alarm в Future.
3. Future → long-press → «Редактировать» → открывается `MessageEditor`.
4. History → long-press на synthetic `periodic:…` в ленте → delete/edit работают.
5. Scheduled (вкладка) → long-press → confirm по-прежнему без меню.
