# Исправление бесконечной анимации сообщений при клавиатуре

**Дата:** 2026-08-12
**Промпт/задача:** Завести баг и исправить бесконечное быстрое колебание анимации сообщений чата при открытии/закрытии клавиатуры

## Что сделано

- Заведён баг `docs/bugs/chat-message-animation-keyboard-loop.md` с разбором причины и скриншотом
- Устранён remount `FlatList` при `keyboardOpen`: одно дерево списка, `GestureDetector` всегда смонтирован
- При открытой клавиатуре peek-Pan заменяется на инертный `Gesture.Manual()`, чтобы не перехватывать вертикальный скролл на Android
- Добавлен гейт анимаций: `FadeInUp` только для впервые увиденных ключей; `Layout` выключен пока клавиатура открыта
- `scrollToEnd` при `keyboardDidShow` переведён на `animated: false`
- Снова используется `shouldEnableHistoryListScroll` для `scrollEnabled` / `contentContainerStyle` / `pointerEvents`

## Изменённые файлы

- `docs/bugs/chat-message-animation-keyboard-loop.md` — баг + статус fixed
- `docs/bugs/assets/chat-message-animation-keyboard-loop.png` — скриншот симптома
- `src/pages/chat-room/ChatRoomScreen.tsx` — единый FlatList, гейт анимаций, Manual-жест, scroll без animated
- `src/pages/chat-room/MessageLine.tsx` — пропы `animateEnter` / `animateLayout`
- `src/pages/chat-room/DateSeparator.tsx` — проп `animateEnter`
- `src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` — тест: список не remount-ится при show/hide клавиатуры
- `src/pages/chat-room/__tests__/MessageLine.test.tsx` — рендер с выключенными анимациями

## Принятые решения

- Не убирать `GestureDetector` из дерева при клавиатуре (это вызывало remount и массовый `FadeInUp`); вместо этого — инертный жест
- Native-wrap по-прежнему зависит только от `historyCanScroll`, чтобы open/close клавиатуры не attach/detach-ил `Gesture.Native` вокруг списка
- Enter-анимация переживает remount через `Set` ключей в `ChatRoomScreen` (сброс при смене `chatId`)

## Известные ограничения

- Нужна ручная проверка на Android: Saved → несколько раз открыть/закрыть клавиатуру → нет дрожания; скролл к старым сообщениям при открытой клавиатуре сохраняется
- Если `Gesture.Manual()` на каком-то устройстве всё же помешает скроллу, вернуться к снятию детектора, оставив только гейт анимаций

## Тестирование

- Unit: `ChatRoomScreen.keyboardFocus` (в т.ч. list mount stable across keyboard)
- Unit: `MessageLine` (render with `animateEnter`/`animateLayout` false)
- Unit: `scrollEdge` (без регрессий `shouldEnableHistoryListScroll`)
