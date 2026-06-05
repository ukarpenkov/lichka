# Надёжные уведомления при выгруженном приложении

**Дата:** 2026-06-05
**Промпт/задача:** Сделать чтобы уведомления, периодические уведомления и будильники приходили даже когда приложение выгружено

## Что сделано

### 1. AlarmScheduler.kt — точное расписание для reminders и periodic
- `scheduleReminder()`: заменён `AlarmManager.set()` на `setExactAndAllowWhileIdle()` при наличии разрешения, с фоллбэком на `set()`
- `schedulePeriodicFirst()`: заменён `AlarmManager.set()` на `setAlarmClock()` — самый надёжный метод, работает даже в Doze-режиме
- Добавлен `rescheduleAll(context)` — восстанавливает все уведомления из хранилища
- Добавлен `canScheduleExact()` — проверка возможности точного расписания

### 2. AlarmStorage.kt — новое хранилище уведомлений
- Сохранение активных уведомлений в `SharedPreferences` (JSON-массив)
- Методы: `save()`, `remove()`, `loadAll()`
- Данные: messageId, chatId, body, chatTitle, intervalMinutes, triggerAtMillis

### 3. BootReceiver.kt — восстановление после перезагрузки
- Слушает `ACTION_BOOT_COMPLETED`
- Пересоздаёт каналы уведомлений
- Вызывает `AlarmScheduler.rescheduleAll()` для восстановления будильников

### 4. AlarmReceiver.kt — очистка хранилища
- Одноразовые уведомления удаляются из `AlarmStorage` после срабатывания
- Периodic обновляют запись через `schedulePeriodicFirst()` → `AlarmStorage.save()`

### 5. AndroidManifest.xml — новые разрешения
- `USE_EXACT_ALARM` — автоматически выдаётся на Android 13+ для приложений-будильников
- `RECEIVE_BOOT_COMPLETED` — запуск `BootReceiver` после перезагрузки
- Зарегистрирован `BootReceiver` с intent-filter `BOOT_COMPLETED`

### 6. NotificationModule.kt — новый метод
- `requestScheduleExactAlarm()` — открывает экран запроса `SCHEDULE_EXACT_ALARM` на Android 12

### 7. TS-сторона
- `notificationChannels.ts`: добавлен `requestScheduleExactAlarm()`
- `requestExactAlarmPermission.ts`: `ensureExactAlarmPermission()` теперь вызывает нативный метод вместо `Linking.openSettings()`

## Изменённые файлы
- `android/app/src/main/java/com/lichka/AlarmScheduler.kt` — точное расписание + rescheduleAll
- `android/app/src/main/java/com/lichka/AlarmStorage.kt` — **новый файл**
- `android/app/src/main/java/com/lichka/BootReceiver.kt` — **новый файл**
- `android/app/src/main/java/com/lichka/AlarmReceiver.kt` — очистка хранилища
- `android/app/src/main/java/com/lichka/NotificationModule.kt` — requestScheduleExactAlarm
- `android/app/src/main/AndroidManifest.xml` — разрешения + BootReceiver
- `src/shared/lib/notificationChannels.ts` — requestScheduleExactAlarm
- `src/features/notifications/requestExactAlarmPermission.ts` — нативный запрос
- `docs/features/reliable-notifications-proposal.md` — **новый файл**

## Принятые решения
- Periodic использует `setAlarmClock()` вместо `setExactAndAllowWhileIdle()` — самый надёжный метод, не зависит от 9-минутного лимита Android 12+
- `USE_EXACT_ALARM` + `SCHEDULE_EXACT_ALARM` — двойное покрытие: 13+ автоматически, 12 — ручной запрос
- SharedPreferences для хранения — достаточно для простого списка уведомлений

## Известные ограничения
- **Force-stop** на Android 12+ отменяет ВСЕ будильники — это поведение ОС, обойти невозможно
- Китайские прошивки (Xiaomi, Huawei, OPPO) требуют ручного включения автозапуска
- `setExactAndAllowWhileIdle()` — минимум 9 минут между вызовами на Android 12+ (не влияет на periodic, т.к. те используют `setAlarmClock()`)

## Тестирование
- Проверить: создать reminder → выгрузить приложение → дождаться срабатывания
- Проверить: создать periodic → выгрузить приложение → несколько срабатываний
- Проверить: создать alarm → перезагрузить устройство → дождаться срабатывания
- Проверить: на Android 12 — запрос SCHEDULE_EXACT_ALARM при первом использовании
