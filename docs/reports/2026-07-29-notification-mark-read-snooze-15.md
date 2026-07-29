# Кнопка «Прочитано» и snooze 15 мин на уведомлениях

**Дата:** 2026-07-29
**Промпт/задача:** На уведомлении добавить кнопку «Прочитано», отложить сделать не на 5, а на 15 минут

## Что сделано
- На Android-уведомлениях (reminder и alarm) добавлен action **«Прочитано»** — снимает notification; для one-shot/alarm отменяет pending в `AlarmScheduler`, для periodic следующий fire не трогает
- Интервал snooze изменён с **5 → 15 минут** (общая константа `SNOOZE_MINUTES`)
- Подписи «Отложить · 15 мин» обновлены на native alarm UI и RN `AlarmScreen`
- Построение snooze/mark-read actions вынесено в общие хелперы в `NotificationHelper`

## Изменённые файлы
- `android/app/src/main/java/com/lichka/NotificationHelper.kt` — `ACTION_MARK_READ`, snooze 15 мин, actions на reminder/alarm
- `android/app/src/main/java/com/lichka/AlarmReceiver.kt` — обработка `markReadAction` (`handleMarkRead`)
- `android/app/src/main/res/layout/activity_alarm.xml` — текст кнопки «Отложить · 15 мин»
- `src/pages/alarm/AlarmScreen.tsx` — текст кнопки «Отложить · 15 мин»

## Принятые решения
- Snooze единый для reminder и alarm через `NotificationHelper.snoozeMinutes()` — 15 мин везде
- «Прочитано» на periodic только закрывает текущее уведомление; серия продолжается (следующий fire уже запланирован при показе)
- Бейдж непрочитанных в JS/SQLite из native action не обновляется — сброс по-прежнему при открытии чата

## Известные ограничения
- Нужна пересборка Android-приложения, чтобы увидеть native changes
- «Прочитано» на alarm-notification не закрывает уже открытый `AlarmActivity` (edge case, если full-screen уже показан)
- Нет синхронизации `markChatAsRead` из BroadcastReceiver → бейдж в списке чатов может остаться до входа в чат

## Тестирование
- Ручное (после rebuild): reminder → в шторке две кнопки «Прочитано» и «Snooze (15 мин)»
- «Прочитано» → notification исчезает, повторного one-shot нет
- «Snooze» → повтор через ~15 мин
- Alarm: подпись «Отложить · 15 мин» на full-screen; snooze перезапускает через 15 мин
