# Исправление бага: undefined cannot be used as a constructor

**Дата:** 2026-06-28
**Промпт/задача:** Исправить ошибку "undefined/object cannot be used as a constructor" при открытии чата

## Что сделано

- Вернул default import `AudioRecorderPlayer` в `useVoiceRecorder.ts` и `useVoicePlayer.ts`
- Убрал `new AudioRecorderPlayer()` — библиотека экспортирует singleton instance, а не класс

## Изменённые файлы

- `src/features/voice-record/useVoiceRecorder.ts` — default import + `useRef(AudioRecorderPlayer)` без `new`
- `src/features/voice-play/useVoicePlayer.ts` — default import + `useRef(AudioRecorderPlayer)` без `new`

## Принятые решения

- В react-native-audio-recorder-player v4.x default export — это **готовый экземпляр** (singleton), а не класс
- `new AudioRecorderPlayer()` вызывался на уже созданном инстансе, что вызывало ошибку конструктора
- Named export `AudioRecorderPlayer` не существует в этой версии библиотеки

## Известные ограничения

- Версия пакета: ^4.5.0 (nitro-modules based)

## Тестирование

- Исправлен render error в MessageComposer → useVoiceRecorder
