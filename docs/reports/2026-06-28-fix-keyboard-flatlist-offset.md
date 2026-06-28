# Fix: клавиатура смещает только MessageComposer, а не весь чат

**Дата:** 2026-06-28
**Промпт/задача:** При открытии клавиатуры панель ввода сообщений поднималась наверх, но сообщения в FlatList оставались на месте. Клавиатура должна смещать всё вместе.

## Что сделано
- Добавил `useAnimatedKeyboard` в `ChatRoomScreen` для отслеживания высоты клавиатуры
- Создал `keyboardPaddingStyle` — анимированный стиль, который добавляет `paddingBottom` к `contentContainerStyle` FlatList
- Применил platform-specific логику: iOS — прямое значение, Android — с `interpolate` для clamp
- Подключил `keyboardPaddingStyle` к `AnimatedFlatList`

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлены импорты `useAnimatedKeyboard`, `interpolate`, `Extrapolation`, `Platform`; добавлен keyboard tracking и animated style для FlatList

## Принятые решения
- Клавиатура обрабатывается на уровне `ChatRoomScreen`, а не в `MessageComposer` — это позволяет смещать весь контент чата (сообщения + инпут)
- `MessageComposer` по-прежнему использует свой `useAnimatedKeyboard` для подъёма自身的 — это корректно, так как он находится вне FlatList
- Используется `contentContainerStyle` вместо `style` — это правильный подход для FlatList, так как padding применяется к контейнеру контента, а не к самому списку

## Известные ограничения
- На Android используется `interpolate` с clamp до 300px — может потребоваться настройка для нестандартных клавиатур

## Тестирование
- TypeScript: `npx tsc --noEmit` — ошибок нет
- Ручное тестирование на устройстве: при открытии клавиатуры сообщения должны подниматься вместе с панелью ввода
