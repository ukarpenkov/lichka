# [UI] Отступ между панелью ввода и клавиатурой (регрессия двойной компенсации)

## Описание
Поле ввода "Message..." и панель кнопок (отправка, уведомления, таймер, пересылка, микрофон) отображаются с большим отступом от клавиатуры — между панелью инструментов и клавиатурой присутствует пустое пространство (белая область). Поле ввода не прилегает к клавиатуре.

## Шаги воспроизведения
1. Открыть чат (например, "Saved messages")
2. Нажать на поле ввода, чтобы вызвать клавиатуру
3. Обратить внимание на отступ между панелью инструментов и клавиатурой

## Ожидаемый результат
Панель ввода и кнопки располагаются непосредственно над клавиатурой, без пустого пространства.

## Фактический результат
Между MessageComposer и клавиатурой значительный пустой промежуток.

## Локализация
- `src/app/AppNavigator.tsx:50` — `androidWindowSoftInputMode: 'adjustResize'`
- `src/pages/chat-room/ChatRoomScreen.tsx:94-97` — `useAnimatedKeyboard` с `paddingBottom: keyboard.height.value`

## Причина
Регрессия: двойная компенсация высоты клавиатуры.

1. `androidWindowSoftInputMode: 'adjustResize'` — react-native-screens уменьшает окно на высоту клавиатуры
2. `useAnimatedKeyboard` + `paddingBottom: keyboard.height.value` — ручная компенсация добавляет **дополнительный** отступ поверх системного

По плану исправления из `keyboard-covers-input-android.md` должно было быть `adjustNothing` + ручная компенсация, но `adjustNothing` не был применён — остался `adjustResize`.

## Исправление
Заменить `androidWindowSoftInputMode: 'adjustResize'` на `'adjustNothing'` в `AppNavigator.tsx`. Ручная компенсация через `useAnimatedKeyboard` уже присутствует в `ChatRoomScreen.tsx`.

## Статус
fixed
