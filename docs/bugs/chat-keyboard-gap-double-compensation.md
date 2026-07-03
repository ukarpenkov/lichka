# [UI] Панель ввода прячется за клавиатурой в чате

## Описание
При открытии клавиатуры на экране чата `MessageComposer` оказывается **под** клавиатурой — пользователь не видит поле ввода.

## Локализация
- `src/pages/chat-room/ChatRoomScreen.tsx` — основной layout экрана чата
- `android/app/src/main/AndroidManifest.xml:26` — `windowSoftInputMode`

## Причина
`adjustResize` оказался нестабильным в связке `react-native-screens` + экран чата: на реальном устройстве окно не сжимается предсказуемо, и `MessageComposer` снова остаётся под клавиатурой.

Предыдущая ручная компенсация через `useAnimatedKeyboard` + `paddingBottom` в `ChatRoomScreen.tsx` поднимала панель ввода, но при одновременном системном `adjustResize` давала двойную компенсацию и видимый зазор между композером и клавиатурой.

Попытки полагаться только на нативный resize или `KeyboardAvoidingView` недостаточно надёжны на Android для этого экрана.

## Исправление
1. **`AndroidManifest.xml`** — `windowSoftInputMode` переключён на `adjustNothing`, чтобы Android не добавлял собственную компенсацию.
2. **`ChatRoomScreen.tsx`** — `chatArea` снова стал `Animated.View` и получает `paddingBottom` по `useAnimatedKeyboard().height.value` только на Android. Из высоты клавиатуры вычитается высота нижнего tab bar, потому что экран чата вложен в табы и эта область уже зарезервирована layout-ом.
3. **`MessageComposer.tsx`** — сохранён существующий косметический сброс внутреннего `paddingBottom` до `0` при открытой клавиатуре, чтобы панель прилегала к клавиатуре без пустого зазора.

### Изменённые файлы
- `android/app/src/main/AndroidManifest.xml` — `adjustResize` → `adjustNothing`
- `src/pages/chat-room/ChatRoomScreen.tsx` — ручная компенсация высоты клавиатуры через `useAnimatedKeyboard` с вычитанием `useBottomTabBarHeight`

## Статус
fixed (2026-07-03)
