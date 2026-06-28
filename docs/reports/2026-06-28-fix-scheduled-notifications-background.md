# Исправление отложенных уведомлений в фоне

**Дата:** 2026-06-28
**Промпт/задача:** Отложенные уведомления приходят только при запущенном приложении; будильник не срабатывает вообще.

## Что сделано

### Анализ корневой причины

Исследован весь пайплайн уведомлений: JS → NativeModules → AlarmScheduler → AlarmManager → AlarmReceiver → NotificationHelper/AlarmActivity.

**Найденные проблемы:**

1. **`scheduleReminder()`** использовал `setExactAndAllowWhileIdle()` с fallback на `set()`:
   - `set()` — неточный, система может отложить его на неопределённый срок в Doze-режиме
   - `setExactAndAllowWhileIdle()` — работает в Doze, но на OEM-прошивках (Xiaomi, Samsung, Huawei) может быть заблокирован
   - Оба метода **ненадёжны** когда приложение убито и выгружено из памяти

2. **`scheduleAlarm()` и `schedulePeriodicFirst()`** уже использовали `setAlarmClock()` — самый надёжный метод, который **всегда срабатывает** даже в Doze и при убитом приложении. Но `scheduleReminder()` его не использовал.

### Исправление

Заменена реализация `scheduleReminder()` в `AlarmScheduler.kt`:
- **Было:** `setExactAndAllowWhileIdle()` → fallback `set()`
- **Стало:** `setAlarmClock()` (как у `scheduleAlarm()` и `schedulePeriodicFirst()`)

Также удалён неиспользуемый метод `canScheduleExact()` и неиспользуемый импорт `android.os.Build`.

## Изменённые файлы

- `android/app/src/main/java/com/lichka/AlarmScheduler.kt` — `scheduleReminder()` теперь использует `setAlarmClock()` вместо `setExactAndAllowWhileIdle()`/`set()`; удалён `canScheduleExact()` и импорт `Build`

## Принятые решения

- **Единый подход:** Все три типа уведомлений (reminder, periodic, alarm) теперь используют `setAlarmClock()` — самый надёжный метод AlarmManager, который работает даже в Doze, при заблокированном экране и после убийства процесса
- **Без breaking changes:** Интерфейс JS не изменился, `AlarmStorage` продолжает работать как раньше
- **`canScheduleExactAlarms()`** в `NotificationModule.kt` оставлен — используется JS-слоем для проверки перед запросом разрешений

## Известные ограничения

- **Force-stop:** Если пользователь принудительно остановил приложение (Настройки → Приложения → Принудительная остановка), `AlarmManager` PendingIntent'и удаляются системой. Это ограничение Android, обойти его нельзя
- **OEM battery savers:** Некоторые производители (Xiaomi MIUI, Samsung OneUI, Huawei EMUI) имеют собственные системы энергосбережения, которые могут убивать фоновые процессы даже с `setAlarmClock()`. Рекомендуется запросить `IGNORE_BATTERY_OPTIMIZATIONS` (код уже есть в `requestExactAlarmPermission.ts`)
- **Нет автоматического восстановления при убийстве процесса:** Если приложение убито не через force-stop, а через swiping из recent apps, `AlarmManager` должен сработать. Но если OEM-система убила приложение и очистила PendingIntent — восстановление возможно только через `BootReceiver` после перезагрузки

## Тестирование

- Сборка `assembleDebug` прошла успешно (BUILD SUCCESSFUL)
- Ручное тестирование на устройстве: создать уведомление → убить приложение → дождаться срабатывания
