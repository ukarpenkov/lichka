# Исправление положения панели ввода над клавиатурой

**Дата:** 2026-07-03
**Промпт/задача:** Панель ввода в чате снова скрывается за клавиатурой; нужно поднять её над клавиатурой без большого зазора

## Что сделано
- В `AndroidManifest.xml` включён `adjustNothing`, чтобы Android не добавлял нативную компенсацию клавиатуры.
- В `ChatRoomScreen.tsx` возвращена ручная компенсация через `useAnimatedKeyboard` на контейнер `chatArea`.
- Компенсация уменьшена на высоту нижнего tab bar, чтобы панель ввода не висела выше клавиатуры.
- Компенсация применяется только на Android и поднимает вместе список сообщений и `MessageComposer`.
- Обновлено описание бага в `docs/bugs/chat-keyboard-gap-double-compensation.md`.

## Изменённые файлы
- `android/app/src/main/AndroidManifest.xml` — `adjustResize` → `adjustNothing`
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлены `Platform`, `useBottomTabBarHeight`, `useAnimatedKeyboard`, `useAnimatedStyle`; `chatArea` получает `paddingBottom` по высоте клавиатуры за вычетом tab bar
- `docs/bugs/chat-keyboard-gap-double-compensation.md` — уточнены причина и фактическое исправление

## Принятые решения
- Выбран вариант `adjustNothing` + ручной `paddingBottom`, потому что он исключает двойную компенсацию и не зависит от нестабильного `adjustResize` на Android.
- Компенсация оставлена на уровне `ChatRoomScreen`, а не только `MessageComposer`, чтобы список сообщений и панель ввода двигались как единая область.
- Так как `ChatRoomScreen` находится внутри нижнего таб-навигатора, из высоты клавиатуры вычитается `useBottomTabBarHeight()`: эта зона уже учтена layout-ом и именно она давала остаточный зазор как на первом скриншоте.
- Внутренний `paddingBottom` у `MessageComposer` при открытой клавиатуре уже обнуляется, поэтому панель должна прилегать к клавиатуре без лишнего нижнего зазора.

## Известные ограничения
- Требуется ручная проверка на Android-устройстве, так как проблема зависит от поведения системной клавиатуры.

## Тестирование
- `ReadLints` по изменённым файлам — ошибок нет.
- `npx tsc --noEmit` — падает на предсуществующей ошибке `src/shared/ui/AlertDialog.tsx`: `StyleSheet.absoluteFillObject` отсутствует в текущих типах React Native.
