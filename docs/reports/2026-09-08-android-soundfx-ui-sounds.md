# Звуки UI: отправка и удаление сообщений на Android

**Дата:** 2026-09-08
**Промпт/задача:** Добавить/починить звуки при действиях с сообщениями и написать отчёт в `docs/reports/`

## Что сделано

- На Android добавлен нативный модуль `SoundFxModule` (`MediaPlayer` + `USAGE_ASSISTANCE_SONIFICATION`): предзагрузка и воспроизведение коротких UI-звуков без задержки первого кадра, характерной для `react-native-sound`.
- Модуль зарегистрирован в `MainApplication` через `SoundFxPackage`.
- JS-обёртка `src/shared/lib/sounds.ts` на Android вызывает `NativeModules.SoundFxModule.play(name)`; если модуля нет (тесты, iOS) — остаётся прежний путь через `react-native-sound`.
- При отправке сообщения (текст, картинка, напоминание/будильник/периодика) и при завершении голосовой записи `MessageComposer` вызывает `playSendSound()`, если в настройках включено `soundEnabled`.
- Звук удаления (`playDeleteSound`) по-прежнему вызывается из чата и экрана запланированных при подтверждении удаления.
- Для тестов композера у `IconButton` добавлен проп `testID` (`composer-send`).
- `versionCode` в `android/app/build.gradle` увеличен до `6` (версия `2.2`).

Ресурсы: `android/app/src/main/res/raw/send_message.mp3`, `delete_message.mp3` (и `reminder_trigger.mp3` для legacy-пути).

## Изменённые файлы

- `android/app/src/main/java/com/lichka/SoundFxModule.kt` — нативное воспроизведение `send` / `delete`
- `android/app/src/main/java/com/lichka/SoundFxPackage.kt` — React Native package
- `android/app/src/main/java/com/lichka/MainApplication.kt` — регистрация `SoundFxPackage`
- `android/app/build.gradle` — `versionCode` 6
- `src/shared/lib/sounds.ts` — приоритет native SoundFx на Android
- `src/shared/lib/__tests__/sounds.test.ts` — unit-тесты маршрутизации на модуль
- `src/widgets/message-composer/MessageComposer.tsx` — звук при отправке и голосовом сообщении
- `src/widgets/message-composer/__tests__/MessageComposer.test.tsx` — сценарий send + sound
- `src/shared/ui/IconButton.tsx` — `testID` для кнопки отправки

## Принятые решения

- Нативный `MediaPlayer` только для Android: там `react-native-sound` часто молчал или опаздывал на первом воспроизведении.
- iOS без изменений архитектуры: `Sound.MAIN_BUNDLE`.
- Настройки (`soundEnabled`) по-прежнему проверяются в widgets/pages, не внутри `sounds.ts` (FSD: `shared` не зависит от `entities/settings`).
- `SoundFxModule` предзагружает только `send` и `delete` — это слышимые действия в UI.

## Известные ограничения

- Нужна **нативная пересборка** Android (Kotlin-модуль не подхватывается JS hot reload).
- `playReminderSound()` на Android при наличии `SoundFxModule` вызывает `play("reminder")`, но плеер для `reminder` не создаётся — звук молчит. Fallback на `react-native-sound` в этом случае не срабатывает.
- Звук напоминания не привязан к срабатыванию системного notification.
- Громкость системных уведомлений / режим «без звука» может глушить sonification.

## Тестирование

- `sounds`: на Android `playSendSound` / `playDeleteSound` / `playReminderSound` вызывают `SoundFxModule.play` с именами `send` / `delete` / `reminder`.
- `MessageComposer`: при `soundEnabled: true` обычное сообщение вызывает `playSendSound` один раз; уведомление не планируется.

Проверка на устройстве: включить звуки в настройках, пересобрать debug APK, отправить сообщение — должен играть `send_message.mp3`.
