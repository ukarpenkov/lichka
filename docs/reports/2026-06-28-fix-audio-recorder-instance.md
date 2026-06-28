# Исправление бага: AudioRecorderPlayer не создавал экземпляр

**Дата:** 2026-06-28
**Промпт/задача:** Исправить баг, при котором AudioRecorderPlayer передавался как класс вместо экземпляра

## Что сделано

- Исправлен `useVoicePlayer.ts`: заменено `useRef(AudioRecorderPlayer).current` на `useRef(new AudioRecorderPlayer()).current`
- Исправлен `useVoiceRecorder.ts`: аналогичная замена

## Изменённые файлы

- `src/features/voice-play/useVoicePlayer.ts` — исправлено создание экземпляра AudioRecorderPlayer
- `src/features/voice-record/useVoiceRecorder.ts` — исправлено создание экземпляра AudioRecorderPlayer

## Принятые решения

- Использование `new AudioRecorderPlayer()` для создания экземпляра вместо передачи класса
- Сохранение через `useRef` для предотвращения пересоздания при ререндерах

## Известные ограничения

- Нет изменений в функциональности, только исправление инициализации

## Тестирование

- TypeScript компилируется без ошибок
- Аудио-плеер и записывающее устройство теперь работают корректно