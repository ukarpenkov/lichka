# Надёжные уведомления при выгруженном приложении

**Статус:** approved

## Описание проблемы

Текущая система уведомлений ненадёжна:
- `reminder` и `periodic` используют `AlarmManager.set()` — неточный на Android 12+, откладывается в Doze
- Нет восстановления будильников после перезагрузки устройства
- `SCHEDULE_EXACT_ALARM` deprecated в Android 13+

## Предлагаемое решение

1. **`AlarmScheduler.kt`** — `setExactAndAllowWhileIdle()` для reminders, `setAlarmClock()` для periodic
2. **`AlarmStorage.kt`** — сохранение активных уведомлений в `SharedPreferences`
3. **`BootReceiver.kt`** — восстановление после перезагрузки
4. **`AndroidManifest.xml`** — `RECEIVE_BOOT_COMPLETED` + `USE_EXACT_ALARM`
5. **`NotificationModule.kt`** — expose новых методов
6. **TS-сторона** — обновить permissions

## Влияние на архитектуру

- `shared/lib/notificationChannels.ts` — обновление bridge-функций
- `features/notifications/` — обновление permissions
- Нативный слой — новые файлы в `android/app/src/main/java/com/lichka/`

## Ограничения

- Force-stop на Android 12+ отменяет все будильники (поведение ОС)
- Китайские прошивки требуют ручного включения автозапуска
- `setExactAndAllowWhileIdle()` — минимум 9 минут между вызовами на Android 12+
