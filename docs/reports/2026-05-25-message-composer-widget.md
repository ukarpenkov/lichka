# MessageComposer widget (задача 5.4)

**Дата:** 2026-05-25
**Промпт/задача:** Создать виджет `src/widgets/message-composer/` — компонент ввода сообщений с поддержкой 4 типов и голосовой записи

## Что сделано

- Установлены зависимости: `@react-native-community/datetimepicker`, `react-native-audio-recorder-player`
- Создан виджет `message-composer` из 5 файлов:
  - `MessageComposer.tsx` — основной компонент: поле ввода + 5 иконок (Send, Bell, AlarmClock, Repeat, Mic)
  - `DateTimePickerModal.tsx` — двухшаговый picker даты/времени для reminder и alarm
  - `IntervalPicker.tsx` — bottom-sheet picker интервала для periodic (пресеты + кастомный ввод)
  - `useVoiceRecorder.ts` — хук записи голоса (AAC m4a, max 60с, foreground only)
  - `index.ts` — barrel export
- Обновлён `src/shared/lib/mediaPath.ts` — добавлена константа `VOICE_DIR`
- Обновлён `src/shared/lib/index.ts` — экспорт `VOICE_DIR`
- Интегрирован `MessageComposer` в `ChatRoomScreen.tsx` (под FlatList, перед ChatForm)
- FlatList получил `style: { flex: 1 }` для корректного layout

## Изменённые файлы

- `src/shared/lib/mediaPath.ts` — добавлен `VOICE_DIR`
- `src/shared/lib/index.ts` — добавлен экспорт `VOICE_DIR`
- `src/pages/chat-room/ChatRoomScreen.tsx` — импорт и использование `MessageComposer`
- `package.json` — новые зависимости

## Созданные файлы

- `src/widgets/message-composer/MessageComposer.tsx`
- `src/widgets/message-composer/DateTimePickerModal.tsx`
- `src/widgets/message-composer/IntervalPicker.tsx`
- `src/widgets/message-composer/useVoiceRecorder.ts`
- `src/widgets/message-composer/index.ts`

## Принятые решения

1. **5 иконок вместо 4** — `Mic` добавлена отдельной иконкой (по выбору пользователя, без long press на Input)
2. **DateTimePickerModal** — кастомный модал с двухшаговым flow (дата → время), а не нативный inline picker
3. **IntervalPicker** — bottom-sheet с пресетами (15м, 30м, 1ч, 2ч, 6ч, 12ч, 24ч) + произвольный ввод
4. **Voice recorder** — singleton `AudioRecorderPlayer` (не `new`), файлы сохраняются в `media/voice/{id}.m4a`, при записи показывается индикатор с таймером и кнопки отмены/остановки
5. **AppState listener** — запись прерывается при сворачивании приложения
6. **Голосовые сообщения** — сохраняются как `type: 'simple'` с `payload: { uri }` и текстом `[Голосовое Nс]`

## Известные ограничения

- `BottomSheetModalProps<never>` — предсуществующая ошибка типов `@gorhom/bottom-sheet` (та же в ChatForm), не влияет на работу
- Визуальная дифференциация типов сообщений в `MessageBubble` не реализована (вне scope задачи)
- `useAnimatedKeyboard` не добавлен — потребуется при тестировании на устройстве для точной настройки

## Тестирование

- TypeScript компиляция: новых ошибок нет (только предсуществующие)
- Ручное тестирование: требуется запуск на устройстве/эмуляторе
