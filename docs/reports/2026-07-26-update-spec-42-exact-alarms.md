# Обновление спеки #42: exact alarms

**Дата:** 2026-07-26  
**Промпт/задача:** Привести документацию в соответствие с реализацией exact alarms (`USE_EXACT_ALARM` + `SCHEDULE_EXACT_ALARM`).

## Что сделано

- Обновлён пункт **#42** в `docs/spec/white-requirements.md`: оба permission в manifest, `setAlarmClock()` для alarm/reminder/periodic, обоснование `USE_EXACT_ALARM`.
- Добавлена запись в changelog спеки (2026-07-26).
- Исправлен отчёт `2026-07-26-google-play-policy-july-2026-compliance.md` — убрана рекомендация удалять `USE_EXACT_ALARM`.
- Синхронизированы резюме #42 в `2026-05-23-main-spec-discovery-questions.md`.

## Изменённые файлы

- `docs/spec/white-requirements.md` — пункт #42, changelog
- `docs/reports/2026-07-26-google-play-policy-july-2026-compliance.md` — секция про exact alarms
- `docs/reports/2026-05-23-main-spec-discovery-questions.md` — строки #42
- `docs/reports/2026-07-26-update-spec-42-exact-alarms.md` — этот отчёт

## Принятые решения

- **Не удалять `USE_EXACT_ALARM`** — без него в тестах ломаются full-screen alarm (`AlarmReceiver` → `AlarmActivity`) и надёжность уведомлений на Android 13+.
- **`SCHEDULE_EXACT_ALARM`** — для Android 12, ручной grant через `requestScheduleExactAlarm()`.
- **`setAlarmClock()`** для всех типов расписания (alarm, reminder, periodic) — как в `AlarmScheduler.kt`, не inexact/WorkManager из первоначальной спеки.
- Для Google Play — декларации в Alarms & reminders и restricted permissions, не удаление permission.

## Известные ограничения

- Спека #42 по-прежнему описывает продуктовый intent (user-facing alarm); Google может запросить обоснование, т.к. приложение — журнал, а не dedicated Clock.

## Тестирование

- Сверка текста спеки с `AlarmScheduler.kt`, `AlarmReceiver.kt`, `NotificationModule.kt`, `AndroidManifest.xml`.
