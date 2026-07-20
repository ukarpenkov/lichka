# Редизайн экрана будильника (terminal)

**Дата:** 2026-07-20  
**Промпт/задача:** Перерисовать экран будильника в стиле DESIGN.md: пиксельная иконка как в приложении, крупные шрифты — pixel (Press Start 2P), обычные — монохром (JetBrains Mono).

## Что сделано

- Перерисован RN-экран `AlarmScreen` под terminal / CLI язык: семантические цвета темы (`ink` / `muted` / `surfaceStrong`), без hardcoded dark palette.
- Крупные часы `HH:MM` — **Press Start 2P** (`fonts.display`).
- Meta, подпись, кнопки — **JetBrains Mono** через `Text` variants (`caption`, `mono-meta`, `body`, `button`).
- Иконка будильника — пиксельная `AlarmClockIcon` (Streamline Pixel stopwatch), как в composer / ленте.
- Убраны fake home indicator и hairline-divider между действиями.
- Синхронизирован native Android fullscreen (`AlarmActivity` + layout): те же шрифты из assets, пиксельные vector icons, tint по теме.

## Изменённые файлы

- `src/pages/alarm/AlarmScreen.tsx` — terminal-редизайн RN
- `android/app/src/main/java/com/lichka/AlarmActivity.kt` — шрифты, theme tokens, tint иконок
- `android/app/src/main/res/layout/activity_alarm.xml` — раскладка без home indicator / divider
- `android/app/src/main/res/drawable/ic_alarm_clock.xml` — пиксельный stopwatch (viewport 32)
- `android/app/src/main/res/drawable/ic_dismiss.xml` — пиксельный close
- `android/app/src/main/res/drawable/ic_snooze.xml` — пиксельный clock
- `android/app/src/main/res/drawable/bg_alarm_icon_ring.xml` — soft fill под иконку
- `android/app/src/main/res/drawable/bg_alarm_pulse_ring.xml` — pulse stroke

## Принятые решения

- Большой display только у часов; заголовок «БУДИЛЬНИК» — mono `caption` (ALL CAPS), не pixel — иначе слишком широко.
- Destructive red для «Отключить» сохранён (единственный semantic red).
- Pulse / shake анимации оставлены — живое движение без glow/CRT.
- Native и RN визуально выровнены (2-color theme, pixel time, mono UI).

## Известные ограничения

- Размер pixel-часов 40sp — компромисс ширины Press Start 2P на узких экранах; при очень длинных локалях времени не проверялось (формат `HH:mm`).
- Device QA по 13 темам не прогонялся в этой сессии.

## Тестирование

- Lint на `AlarmScreen.tsx` — без ошибок.
- Ручной device QA (fullscreen alarm + in-app Alarm route) — рекомендуется: light / dark / green-on-black.
