# Fix: конфликт Modal + BottomSheet в ChatForm

**Дата:** 2026-05-25
**Промпт/задача:** Исправить ошибку "The screen 'ChatList' was removed natively but..." при запуске и белый экран при нажатии "+" (создание чата)

## Что сделано

- Заменена связка `<Modal>` + `<BottomSheet>` из `@gorhom/bottom-sheet` на `<BottomSheetModal>` в `ChatForm`
- Управление видимостью через `ref.present()` / `ref.dismiss()` вместо prop `visible`
- Добавлен `BottomSheetBackdrop` для затемнения фона при открытии формы
- Сохранён публичный API компонента (`visible`, `onClose`, `onSaved`, `editChat`) для обратной совместимости с `ChatListScreen`

## Изменённые файлы

- `src/widgets/chat-form/ChatForm.tsx` — замена `<Modal>` + `<BottomSheet>` на `<BottomSheetModal>`

## Принятые решения

- **Использован `BottomSheetModal` вместо `<Modal>` + `<BottomSheet>`**: библиотека `@gorhom/bottom-sheet` предоставляет собственный модальный компонент, который работает через `BottomSheetModalProvider` (уже есть в `App.tsx`). Это устраняет нативный конфликт жестов между React Native Modal и pan gestures из `react-native-gesture-handler`
- **Управление через ref**: `BottomSheetModal` управляется императивно (`present()`/`dismiss()`), а не через prop `visible`. useEffect синхронизирует состояние `visible` с вызовами методов
- **`wasVisible` ref**: предотвращает повторные вызовы `present()`/`dismiss()` при ре-рендерах

## Известные ограничения

- `ChatContextMenu` также использует `<Modal>`, но без `BottomSheet`, поэтому не вызывает конфликтов
- `tsc --noEmit` показывает ошибки из-за отсутствия `@react-native/typescript-config/tsconfig.json` — это предсуществующая проблема конфигурации, не связанная с изменениями

## Тестирование

- Запустить приложение, убедиться что нет ошибки "removed natively"
- Нажать "+" → открывается BottomSheet с формой создания чата
- Создать чат → чат появляется в списке
- Закрыть свайпом вниз → форма закрывается корректно
- Редактировать чат через контекстное меню → форма открывается с данными
