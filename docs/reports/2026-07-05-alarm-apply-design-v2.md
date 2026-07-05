# Применение дизайна alarm2.0 к будильнику

**Дата:** 2026-07-05
**Промпт/задача:** Применить дизайн из `design/layout/alarm2.0.html` к будильнику

## Что сделано

- Обновлён SVG-компонент `AlarmClockIcon` (strokeWidth 1.5, скорректирована стрелка часов)
- Обновлены цвета в RN `AlarmScreen.tsx` под дизайн (dismiss #ff5c5c, snooze #555555, статичные цвета вместо динамических)
- Полностью переработан Android `activity_alarm.xml` под дизайн alarm2.0
- Созданы Android векторные drawable для иконки будильника, кнопок отключения и отложить
- Созданы drawable для пульсирующего кольца, статичного кольца и home indicator
- Обновлена анимация `pulse_ring_set.xml` (scale 1.0→1.5, alpha 1→0)
- Обновлён `AlarmActivity.kt` — новая разводка элементов, анимация двух pulse-колец с задержкой

## Изменённые файлы

### React Native
- `src/shared/ui/Icon.tsx` — strokeWidth 1.5 для AlarmClockIcon, путь стрелки `M12 9v4l2.5 1.5`
- `src/pages/alarm/AlarmScreen.tsx` — цвета по дизайну (#ff5c5c, #555555, #666666, #1e1e1e, #0f0f0f, #0AFFFFFF), убран useTheme

### Android native
- `android/.../res/layout/activity_alarm.xml` — полный редизайн: top bar, pulse-кольца, иконка, время, label, text-actions, home indicator
- `android/.../res/anim/pulse_ring_set.xml` — scale 1.0→1.5, alpha 1.0→0.0
- `android/.../res/drawable/ic_alarm_clock.xml` — новый вектор будильника
- `android/.../res/drawable/ic_dismiss.xml` — X-иконка для отключения
- `android/.../res/drawable/ic_snooze.xml` — clock-иконка для отложить
- `android/.../res/drawable/bg_alarm_pulse_ring.xml` — пульсирующее кольцо (#0AFFFFFF)
- `android/.../res/drawable/bg_alarm_icon_ring.xml` — статичное кольцо (#1e1e1e/#0f0f0f)
- `android/.../res/drawable/bg_home_indicator.xml` — индикатор дома (#333333)
- `android/.../java/com/lichka/AlarmActivity.kt` — обновлена под новую layout-структуру

## Принятые решения

- RN `AlarmScreen` и так был близок к дизайну — исправлены только цвета и SVG
- Android-версия переработана полностью: вместо Material-кнопок — text-style pill-кнопки с иконками
- Второе pulse-кольцо запускается с задержкой 800ms через `startOffset` в коде
- Цвета зафиксированы по дизайну, без привязки к теме (приложение всегда в тёмной теме)

## Тестирование

- Визуальная проверка соответствия дизайну `alarm2.0.html`
- Структура Android layout проверена на корректность ID и ссылок на drawable
