# Баг: AudioRecorderPlayer передавался как класс вместо экземпляра

## Описание
В хуках `useVoicePlayer` и `useVoiceRecorder` использовалось `useRef(AudioRecorderPlayer).current`, что передавало сам класс AudioRecorderPlayer, а не его экземпляр. Это приводило к некорректной работе аудио-плеера и записывающего устройства.

## Причина
Неправильное использование `useRef` с классом вместо создания экземпляра.

## Решение
Замена на `useRef(new AudioRecorderPlayer()).current` для создания экземпляра класса.

## Затронутые файлы
- `src/features/voice-play/useVoicePlayer.ts`
- `src/features/voice-record/useVoiceRecorder.ts`

## Статус
Исправлено в staged changes