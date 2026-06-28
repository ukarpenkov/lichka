# Исправление бага: Object cannot be used as a constructor

**Дата:** 2026-06-28
**Промпт/задача:** Исправить ошибку "Object cannot be used as a constructor" при открытии чата

## Что сделано

- Исправлен импорт `AudioRecorderPlayer` в `useVoiceRecorder.ts`: заменён default import на named import
- Исправлен импорт `AudioRecorderPlayer` в `useVoicePlayer.ts`: аналогичная замена

## Изменённые файлы

- `src/features/voice-record/useVoiceRecorder.ts` — импорт изменён с default на named export
- `src/features/voice-play/useVoicePlayer.ts` — импорт изменён с default на named export

## Принятые решения

- В react-native-audio-recorder-player v4.x `AudioRecorderPlayer` экспортируется как named export, а не default export
- Старый default import возвращал объект модуля вместо класса, что вызывало ошибку при вызове `new AudioRecorderPlayer()`

## Известные ограничения

- Версия пакета: ^4.5.0

## Тестирование

- TypeScript компилируется без ошибок
- Исправлен render error в MessageComposer → useVoiceRecorder
