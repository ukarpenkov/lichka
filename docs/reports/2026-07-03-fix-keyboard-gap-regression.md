# Исправление отступа между панелью ввода и клавиатурой (регрессия)

**Дата:** 2026-07-03
**Промпт/задача:** Исправить баг: поле ввода сообщения и панель инструментов отображаются с большим отступом от клавиатуры на Android.

## Что сделано
- Выявлена регрессия двойной компенсации высоты клавиатуры: `adjustResize` в `AppNavigator.tsx` + `useAnimatedKeyboard` с `paddingBottom` в `ChatRoomScreen.tsx`
- Заменён `androidWindowSoftInputMode: 'adjustResize'` → `'adjustNothing'` в `AppNavigator.tsx:50`
- Создан баг-репорт `docs/bugs/chat-keyboard-gap-regression.md`

## Изменённые файлы
- `src/app/AppNavigator.tsx:50` — `androidWindowSoftInputMode` с `'adjustResize'` на `'adjustNothing'`
- `docs/bugs/chat-keyboard-gap-regression.md` — описание бага (создан)

## Принятые решения
- Оставлена ручная компенсация через `useAnimatedKeyboard` + `paddingBottom` в `ChatRoomScreen.tsx` — она корректно работает при `adjustNothing`
- `AndroidManifest.xml` не трогали — `react-native-screens` переопределяет `windowSoftInputMode` на уровне экрана, поэтому глобальный флаг не влияет на ChatRoom

## Тестирование
- Линтер: без новых ошибок
