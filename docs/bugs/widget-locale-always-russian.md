# Виджет «Запланировано» не переводится, empty-state всегда на русском

**Дата обнаружения:** 2026-08-25
**Платформа:** Android
**Статус:** fixed
**Затрагивает:** Android home-screen widget «Запланировано», empty-state `widget_empty`, fallback пустого тела строки
**Связано:**
- [`../features/android-scheduled-widget-proposal.md`](../features/android-scheduled-widget-proposal.md) — виджет, empty state
- [`widget-theme-not-refreshing-on-switch.md`](widget-theme-not-refreshing-on-switch.md) — тема уже пушится из JS в native; локаль — нет

## Симптом

Язык интерфейса в настройках приложения (English / Deutsch / …) меняет экран **Запланировано**, но виджет на домашнем экране при пустом списке всегда показывает **«Нет запланированных»**.

## Шаги воспроизведения

1. Добавить виджет «Запланировано» на домашний экран.
2. Убедиться, что запланированных нет (empty-state виджета).
3. Открыть приложение → Настройки → язык → English (или любой не-русский).
4. Свернуть приложение (Home), чтобы виджет обновился.

**Ожидание:** empty-state на выбранном языке (`No scheduled messages`, `Keine geplanten Nachrichten`, …).

**Факт:** надпись остаётся **«Нет запланированных»**.

Тот же эффект у fallback тела строки без текста: native `widget_scheduled_untitled` = «Напоминание».

## Корневая причина

Экран в приложении берёт `t.noScheduled` из JS-локали. Виджет — native RemoteViews и читал `context.getString(R.string.widget_scheduled_empty)` из единственного `res/values/strings.xml` (русский).

Язык Lichka — in-app, не `Locale.getDefault()` Android. Папки `values-en/` / `values-de/` следовали бы системному языку телефона, а не настройке приложения. Для темы уже был мост `ThemeModule.setTheme` → SharedPreferences → `refreshAll`; для строк локали такого моста не было.

## Исправление

Как у темы: JS пушит copy в native при старте, смене языка и уходе в фон.

- `WidgetModule.setWidgetLocaleStrings(empty, untitled)` → `ScheduledWidgetStorage` (`commit()`), затем `refreshAll`.
- `ScheduledWidgetProvider` / `ScheduledWidgetRemoteViewsFactory` читают сохранённые строки, fallback — `strings.xml`.
- `LocaleProvider` вызывает push; строки из словарей: `noScheduled`, `scheduledUntitled`.
