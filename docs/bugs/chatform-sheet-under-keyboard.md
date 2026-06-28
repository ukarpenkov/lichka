# Баг: BottomSheet открывается под клавиатурой

## Описание
При открытии формы создания/редактирования чата `ChatForm`使用лялся `BottomSheetModal` (@gorhom/bottom-sheet), который открывался снизу экрана. При появлении клавиатуры лист оказывался под ней и был не виден.

## Причина
`BottomSheetModal` с `snapPoints={['100%']}` и `keyboardBehavior="interactive"`.slide-up анимация конфликтовала с клавиатурой — контент оказывался ниже клавиатуры.

## Решение
Замена `BottomSheetModal` на нативный `Modal` из react-native с `animationType="slide"` и `transparent`. Лист теперь открывается сверху экрана, контент всегда виден. Обёрнуто в `KeyboardAvoidingView` (iOS: `padding`). Добавлена кнопка закрытия (X) в шапке.

## Затронутые файлы
- `src/widgets/chat-form/ChatForm.tsx`

## Статус
Исправлено
