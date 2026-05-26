# Задача 9.1 — Запись голосового сообщения

**Дата:** 2026-05-26
**Промпт/задача:** Реализовать запись голосового сообщения по спеке 9.1 из promted-tasks.md

## Что сделано

- Перенесён хук `useVoiceRecorder` из `src/widgets/message-composer/` в `src/features/voice-record/`
- Создан `requestMicrophonePermission()` — явный запрос `RECORD_AUDIO` через `PermissionsAndroid`
- Перенесён хук `useVoicePlayer` из `src/widgets/voice-message/` в `src/features/voice-play/`
- Обновлён `src/features/index.ts` — добавлены реэкспорты voice-record и voice-play
- В `MessageComposer.tsx` заменён tap на long press (`delayLongPress=300`) для микрофона
- Добавлена анимация пульсации красной точки записи (`withSpring` + `withRepeat`)
- Плавное появление/скрытие UI записи через анимацию opacity
- Удалены старые файлы хуков из widgets
- Обновлён импорт `useVoicePlayer` в `VoiceMessage.tsx`
- Отмечена задача 9.1 как выполненная в `docs/tasks/promted-tasks.md`

## Изменённые файлы

- `src/features/voice-record/useVoiceRecorder.ts` — создан (перенос из widgets)
- `src/features/voice-record/requestMicrophonePermission.ts` — создан
- `src/features/voice-record/index.ts` — создан
- `src/features/voice-play/useVoicePlayer.ts` — создан (перенос из widgets)
- `src/features/voice-play/index.ts` — создан
- `src/features/index.ts` — обновлён (добавлены реэкспорты)
- `src/widgets/message-composer/MessageComposer.tsx` — обновлён (long press, анимация, импорты)
- `src/widgets/message-composer/useVoiceRecorder.ts` — удалён
- `src/widgets/voice-message/useVoicePlayer.ts` — удалён
- `src/widgets/voice-message/VoiceMessage.tsx` — обновлён импорт
- `docs/tasks/promted-tasks.md` — отмечена задача 9.1

## Принятые решения

- Запись по long press (300ms delay) вместо tap — соответствует спеке и UX мессенджеров
- При отпускании — автоматическое сохранение и отправка голосового сообщения
- Кнопка X для отмены записи (с удалением файла) доступна в режиме записи
- Анимация `withSpring` + `withRepeat` для пульсации красной точки
- `requestMicrophonePermission` вызывается при long press перед началом записи
- Формат: AAC, `.m4a`, mono, 16 kHz, max 60 сек (hard stop), auto-stop при сворачивании

## Известные ограничения

- Анимация применяется только к индикатору записи (красная точка), не ко всему recording row
- Нет swipe-to-cancel жеста (отмена только через кнопку X)

## Тестирование

- TypeScript компилируется без ошибок
- Long press на микрофон → запрос микрофона → запись
- Отпускание → остановка → отправка голосового сообщения
- Кнопка X → отмена записи, файл удаляется
- Авто-стоп на 60 секундах
- При сворачивании запись останавливается
