# Исправление: BottomSheet — клавиатура, галерея, эмодзи

**Дата:** 2026-06-28
**Промпт/задача:** Bottom sheet не работает с клавиатурой, не открывается галерея для выбора фото, эмодзи обрезаны сверху и снизу.

## Что сделано

### 1. Клавиатура (Keyboard)
- Добавлен `keyboardBehavior="interactive"` — sheet сдвигается вверх при появлении клавиатуры
- Добавлен `android_keyboardInputMode="adjustResize"` — вместо `adjustPan` (по умолчанию), теперь sheet корректно подстраивается под клавиатуру на Android

### 2. Галерея фото (Image Picker)
- На Android `BottomSheetModal` (нативный Modal) конфликтует с `launchImageLibrary` (нативная Activity)
- Решение: перед открытием галереи dismiss sheet → ждём 300ms → открываем галерею → после выбора/отмены re-present sheet
- Добавлен `isPickingImage` ref, чтобы `onDismiss` callback не вызывал `onClose()` во время выбора фото

### 3. EmojiGrid обрезка
- `FlatList` не имел `flex: 1`, поэтому не заполнял доступное пространство в `BottomSheetView`
- Добавлен `style={styles.flatList}` с `flex: 1` на `FlatList`

## Почему были ошибки

### Клавиатура
`android_keyboardInputMode` по умолчанию = `adjustPan` — вся Activity сдвигается вверх, sheet не подстраивается. С `adjustResize` sheet корректно уменьшается под клавиатуру.

### Галерея
`BottomSheetModal` использует нативный `Modal` (React Native). На Android, когда Modal открыт, другие нативные Activity (галерея) могут не отображаться или отображаться некорректно. dismiss перед вызовом решает конфликт.

### Emoji обрезка
`FlatList` без `flex: 1` занимает ровно столько, сколько нужно контенту, но не заполняет родительский контейнер. В `BottomSheetView` с `flex: 1` это приводило к тому, что `FlatList` не получал полную высоту.

## Изменённые файлы

- `src/widgets/chat-form/ChatForm.tsx` — keyboard props, dismiss-before-picker, isPickingImage flag
- `src/widgets/chat-form/EmojiGrid.tsx` — flex:1 на FlatList

## Тестирование

- TypeScript: ошибки только в pre-existing файлах (AudioRecorderPlayer)
- Jest: 111/111 тестов пройдены
- Ручное: открыть sheet → клавиатура поднимает sheet → нажать фото → галерея открывается → выбрать фото → sheet возвращается → эмодзи отображаются без обрезки
