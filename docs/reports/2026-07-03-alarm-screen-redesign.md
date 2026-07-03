# Редизайн экрана будильника

**Дата:** 2026-07-03
**Промпт/задача:** Переделать дизайн экрана будильника по прототипу `design/layout/alarm.html` с учётом цветовых схем приложения.

## Что сделано

- **Мост JS → Native для темы.** Создан `ThemeModule` — нативный модуль, хранящий текущие `background` и `text` в `SharedPreferences`. `ThemeProvider.tsx` синхронизирует тему при каждой смене.
- **Тематизация AlarmActivity.** `AlarmActivity` теперь читает тему из `SharedPreferences` (через `ThemeModule.getBackground/getText`), применяет фон (градиент от светлее к темнее), цвета текста и стили кнопок.
- **Отображение времени срабатывания.** Добавлен `EXTRA_TRIGGER_TIME` в цепочку `AlarmScheduler → AlarmReceiver → NotificationHelper → AlarmActivity`. На экране будильника показывается время (HH:mm).
- **Полный редизайн `activity_alarm.xml`.** Структура повторяет HTML-прототип:
  - Центрированный контент (FrameLayout + LinearLayout)
  - Иконка будильника 96dp с анимированным кольцом (140dp)
  - Время срабатывания (22sp, 55% прозрачности от цвета текста)
  - Текст сообщения (44sp, bold)
  - Кнопка «Отключить» — красный градиент (`#FF5A5A → #E03E3E`)
  - Кнопка «Отложить · 5 мин» — полупрозрачная (8% от цвета текста)
- **Анимации.** Добавлены XML-анимации:
  - `shake_alarm.xml` — покачивание иконки (±6°, 900ms, бесконечно)
  - `pulse_ring_set.xml` — пульсация кольца (scale 0.9→1.4 + fade 0.6→0, 2400ms)
- **Drawable-ресурсы.** `bg_alarm_ring.xml` (овал с обводкой), `bg_btn_dismiss.xml` (градиент), `bg_btn_snooze.xml` (полупрозрачный)

## Изменённые файлы

- `android/.../ThemeModule.kt` — новый нативный модуль (SharedPreferences для темы)
- `android/.../ThemePackage.kt` — новый ReactPackage
- `android/.../MainApplication.kt` — регистрация ThemePackage (+1 строка)
- `android/.../AlarmScheduler.kt` — добавлен `EXTRA_TRIGGER_TIME` в `buildPendingIntent`
- `android/.../AlarmReceiver.kt` — извлечение и проброс `triggerTime`
- `android/.../NotificationHelper.kt` — `triggerTime` в intent AlarmActivity и snooze
- `android/.../AlarmActivity.kt` — полная переработка: тема, анимации, triggerTime
- `android/.../res/layout/activity_alarm.xml` — новый дизайн (LinearLayout)
- `android/.../res/drawable/bg_alarm_ring.xml` — новый
- `android/.../res/drawable/bg_btn_dismiss.xml` — новый
- `android/.../res/drawable/bg_btn_snooze.xml` — новый
- `android/.../res/anim/shake_alarm.xml` — новый
- `android/.../res/anim/pulse_alarm.xml` — новый
- `android/.../res/anim/pulse_ring_set.xml` — новый
- `src/shared/config/ThemeProvider.tsx` — синхронизация темы в SharedPreferences

## Принятые решения

- **SharedPreferences вместо проброса через extras.** Тема хранится отдельно в нативных настройках, а не передаётся через всю цепочку scheduling. Это позволяет менять тему в любой момент, и AlarmActivity всегда получает актуальные цвета.
- **LinearLayout вместо ConstraintLayout.** Избегаем лишней зависимости `androidx.constraintlayout`, которая не подключена в проекте. Вертикальный LinearLayout + FrameLayout полностью покрывают макет прототипа.
- **Не используется ripple-эффект.** Кнопки заменяют стандартный Material фон на кастомные drawable. Элевация задана вручную для кнопки «Отключить» (8dp).
- **Цвета кнопок частично фиксированы.** Кнопка «Отключить» всегда красная (как в прототипе), кнопка «Отложить» использует 8% цвет текста темы.

## Известные ограничения

- При светлой теме фон экрана будильника может выглядеть менее выразительно (градиент строится от цвета фона темы, без тёмных радиальных свечений прототипа).
- Анимации реализованы через XML (AnimationUtils), а не через property animators — на старых устройствах могут работать с ограничениями.

## Тестирование

- Ручное тестирование: запланировать будильник, дождаться срабатывания, проверить отображение времени, цвета кнопок, анимации, работу «Отключить» и «Отложить».
- Смена темы в приложении → новый будильник должен отобразиться с актуальной темой.
