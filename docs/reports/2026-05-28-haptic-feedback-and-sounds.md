# Haptic feedback и звуковые эффекты

**Дата:** 2026-05-28
**Промпт/задача:** Реализация задачи 13.1 — добавить haptic feedback и звуки

## Что сделано

- Установлены зависимости: `react-native-haptic-feedback`, `react-native-sound`
- Создан `src/shared/lib/haptics.ts` — обёртка над `react-native-haptic-feedback` с тремя типами:
  - `hapticTap()` — лёгкое нажатие (tap на иконки)
  - `hapticLongPress()` — среднее нажатие (long press)
  - `hapticSuccess()` — уведомление об успехе (отправка сообщения)
- Создан `src/shared/lib/sounds.ts` — обёртка над `react-native-sound`:
  - `playSendSound()` — звук отправки сообщения
  - `playReminderSound()` — звук срабатывания напоминания
- Обновлён `src/shared/lib/index.ts` — экспорт новых функций
- Добавлен `onPressIn` callback-проп в `IconButton` (`src/shared/ui/IconButton.tsx`)
- Интегрирован haptic feedback в `MessageComposer`:
  - `hapticSuccess()` + `playSendSound()` при отправке сообщения
  - `hapticTap()` через `onPressIn` на кнопках Send, Bell, AlarmClock, Repeat
  - `hapticLongPress()` при long press на микрофон
- Интегрирован `hapticLongPress()` в `MessageBubble` при long press на сообщение
- Проверка `reduceMotion` через `AccessibilityInfo` — haptic отключается при включённом reduceMotion
- Проверка `hapticEnabled` / `soundEnabled` из настроек перед каждым вызовом
- Создана директория `android/app/src/main/res/raw/` для звуковых файлов

## Изменённые файлы

- `package.json` — добавлены `react-native-haptic-feedback`, `react-native-sound`
- `src/shared/lib/haptics.ts` — новый файл
- `src/shared/lib/sounds.ts` — новый файл
- `src/shared/lib/index.ts` — добавлены экспорты haptics и sounds
- `src/shared/ui/IconButton.tsx` — добавлен `onPressIn` callback-проп
- `src/widgets/message-composer/MessageComposer.tsx` — интеграция haptics и sounds
- `src/pages/chat-room/MessageBubble.tsx` — интеграция hapticLongPress
- `docs/tasks/promted-tasks.md` — отмечена задача 13.1 как выполненная

## Принятые решения

- Haptics и sounds — чистые утилиты в `shared/lib` без зависимости от `entities/settings`. Проверка настроек и reduceMotion выполняется на стороне потребителей (pages/widgets), что соблюдает FSD-зависимости (только вниз)
- `IconButton` получил `onPressIn` callback вместо прямого haptic-пропа, чтобы shared-слой не зависел от entities
- Использован `react-native-haptic-feedback` вместо `expo-haptics` (проект без Expo)
- Использован `react-native-sound` вместо `expo-av`
- reduceMotion проверяется через `AccessibilityInfo` с подпиской на изменения

## Известые ограничения

- Звуковые файлы (`send_message.mp3`, `reminder_trigger.mp3`) нужно добавить в `android/app/src/main/res/raw/`. Загрузчики звуков в `sounds.ts` выведут warning в консоль при отсутствии файлов, но не сломают приложение
- Звук напоминания (`playReminderSound`) экспортирован, но не привязан к моменту срабатывания нативного notification (нативный код не трогали). Его можно вызвать вручную при открытии приложения по notification
- Haptic feedback для нативных notification (Android) настраивается отдельно через каналы уведомлений

## Тестирование

- TypeScript compilation: ошибок в изменённых файлах нет
- Все предсуществующие ошибки (test files, ScheduledScreen, ChatForm) не затронуты
