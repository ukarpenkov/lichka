# Исправление: будильник — полноэкранный алерт при активном экране

**Дата:** 2026-07-05
**Промпт/задача:** Исправить баг: при свёрнутом приложении и включённом экране будильник приходит как обычное уведомление вместо полноэкранного алерта.

## Что сделано

- В `AlarmReceiver.handleAlarm()` для будильников добавлен прямой запуск `AlarmActivity` через `context.startActivity(alarmIntent)` — **до** постинга уведомления
- В `AlarmActivity.onCreate()` добавлен вызов `cancelAlarmNotification()` сразу после извлечения extras — чтобы уведомление не висело параллельно с полноэкранным алертом
- Notification + `setFullScreenIntent` **сохранён как fallback** для случаев, когда `startActivity` не сработает (например, на старых Android без `USE_EXACT_ALARM`)

## Изменённые файлы

- `android/app/src/main/java/com/lichka/AlarmReceiver.kt:36-45` — добавлен `context.startActivity(alarmIntent)` перед нотификацией
- `android/app/src/main/java/com/lichka/AlarmActivity.kt:57` — вызов `cancelAlarmNotification()` в `onCreate()`

## Принятые решения

1. **Прямой `startActivity` из BroadcastReceiver** — допустим, т.к. приложение имеет `USE_EXACT_ALARM` в манифесте, что даёт право на запуск Activity из BroadcastReceiver, сработавшего от `AlarmManager.setAlarmClock()`
2. **Уведомление оставлено как fallback**, а не удалено полностью — покрывает случай, когда `startActivity` заблокирован системой (например, Android 10 без `USE_EXACT_ALARM`)
3. **`cancelAlarmNotification()` в `onCreate()`**, а не удаление нотификации из кода — уведомление нужно для `fullScreenIntent` на заблокированном экране, но должно сбрасываться, когда Activity уже открыто

## Известные ограничения

- На Android 10 (API 29) без `USE_EXACT_ALARM` прямой `startActivity` из фона может быть заблокирован — в этом случае сработает fallback через уведомление + `fullScreenIntent`, который корректно открывает алерт только на заблокированном экране
- Если `startActivity` сработал, а `AlarmActivity` ещё не вызвало `cancelAlarmNotification()`, возможна кратковременная видимость уведомления (миллисекунды)

## Тестирование

Сценарии для проверки:
1. Экран вкл + приложение в фоне → полноэкранный алерт (ранее был только heads-up)
2. Экран выкл + заблокирован → алерт поверх lockscreen (через `fullScreenIntent`)
3. Приложение убито → алерт появляется (BroadcastReceiver перезапускает процесс)
