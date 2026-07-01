# Исправление: будильник не срабатывает при выгруженном приложении

**Дата:** 2026-07-01
**Промпт/задача:** Баг: Не срабатывает отложенное уведомление-будильник и не отображается кастомный полноэкранный оверлей при выгруженном приложении

## Что сделано
- Диагностирована и исправлена причина, по которой alarm-уведомления не срабатывали при убитом приложении на Android 10+
- Добавлен флаг `isAlarm` в `AlarmStorage` для корректного восстановления будильников после перезагрузки
- Обновлён `rescheduleAll()` для правильного восстановления alarm-типов

## Изменённые файлы

### Нативный Android (Kotlin)

- `android/app/src/main/java/com/lichka/AlarmScheduler.kt`
  - `scheduleAlarm()`: PendingIntent изменён с `getBroadcast()` на `getActivity()`, направляющий напрямую в `AlarmActivity`. Теперь AlarmManager сам запускает Activity, минуя BroadcastReceiver. Это использует системное исключение из background-start restrictions.
  - `cancelAlarm()`: Синхронизирован с новым типом PendingIntent (`getActivity()` вместо `getBroadcast()`).
  - `rescheduleAll()`: Добавлена проверка `isAlarm` для восстановления будильников через `scheduleAlarm()`, а не через `scheduleReminder()`.

- `android/app/src/main/java/com/lichka/AlarmStorage.kt`
  - Добавлено поле `isAlarm: Boolean = false` в `SavedAlarm`.
  - Параметр `isAlarm` добавлен в метод `save()`.
  - Сериализация/десериализация `isAlarm` в `toJsonArray()` / `fromJsonArray()`.
  - Используется `optBoolean("isAlarm", false)` для обратной совместимости со старыми сохранёнными данными.

- `android/app/src/main/java/com/lichka/AlarmActivity.kt`
  - Добавлен `cancelAlarmNotification()` — отменяет notification при dismiss/snooze (для согласованности с fallback-путем).
  - Добавлен `AlarmStorage.remove()` в обработчики dismiss и snooze (раньше очистка была только в AlarmReceiver, который теперь не вызывается для новых alarm-типов).

- `android/app/src/main/java/com/lichka/NotificationHelper.kt`
  - Добавлен `buildAlarmNotification()` — строит notification с `setFullScreenIntent()`, `setOngoing(true)`, `setCategory(CATEGORY_ALARM)` и кнопкой Snooze.
  - Используется в `AlarmReceiver` как fallback для старых будильников, запланированных до обновления приложения.

- `android/app/src/main/java/com/lichka/AlarmReceiver.kt`
  - `handleAlarm()` для `isAlarm`: заменён `context.startActivity()` на `NotificationManager.notify()` с `buildAlarmNotification()`. Notification + setFullScreenIntent работает даже при убитом приложении, так как постинг notification идёт через system_server.

## Принятые решения

### Корень бага
На Android 10+ (API 29+) Google ввёл restriction на запуск Activity из фона. Исключение для `AlarmManager.setAlarmClock()` позволяет получать PendingIntent, но НЕ позволяет BroadcastReceiver'у вызывать `context.startActivity()`. Система молча блокирует такой вызов при убитом приложении.

### Стратегия исправления
Использован двухуровневый подход:

1. **Основной путь (новые alarm'ы):** `PendingIntent.getActivity()` → напрямую в `AlarmActivity`. AlarmManager сам запускает Activity, что является штатным исключением из background-start restriction.

2. **Fallback-путь (старые alarm'ы до обновления):** Если BroadcasReceiver всё же получит alarm (от старого PendingIntent'а), вместо `startActivity()` используется `NotificationManager.notify()` с `setFullScreenIntent()`. Это стандартный Android-паттерн для alarm-нотификаций.

### Align-статус хранилища
Добавление `isAlarm` в `AlarmStorage` решает проблему `rescheduleAll()`, которая раньше все сохранённые записи восстанавливала как reminders. Теперь при ребуте будильники корректно восстанавливаются как полноэкранные alarm'ы.

## Известные ограничения
- Старые alarm'ы, запланированные до обновления, будут работать через fallback (notification + fullScreenIntent), что может показать кратковременное notification-уведомление перед появлением AlarmActivity.
- На устройствах Xiaomi/Huawei может потребоваться дополнительное разрешение "Auto-start" в настройках системы.

## Тестирование
- Создать alarm-сообщение через `MessageComposer` (иконка будильника → установить время через 2-3 минуты)
- Полностью выгрузить приложение (swipe away из recents)
- Заблокировать экран
- Проверить: через заданное время появляется AlarmActivity с звуком/вибрацией
- Проверить: после dismiss сообщение не появляется в чате (задача не выполняется)
- Проверить: после snooze через 5 минут alarm срабатывает снова
