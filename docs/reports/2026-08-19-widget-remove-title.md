# Убрать заголовок «Запланировано» из виджета

**Дата:** 2026-08-19
**Промпт/задача:** Убрать надпись «Запланировано» из Android виджета, чтобы остался только список запланированных задач. Proposal: `docs/features/widget-remove-title-proposal.md`.

## Что сделано

- Удалён `TextView` `widget_title` из `res/layout/widget_scheduled.xml`.
- Удалён зазор `layout_marginTop="8dp"` у `ListView` — он отделял список от заголовка.
- Из `ScheduledWidgetProvider.kt` убраны: установка цвета заголовка, текста заголовка и `setOnClickPendingIntent(R.id.widget_title, …)`.

## Изменённые файлы

- `docs/features/widget-remove-title-proposal.md` — proposal (approved)
- `android/app/src/main/res/layout/widget_scheduled.xml` — удалён заголовок и marginTop списка
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — удалён код темизации/текста/клика заголовка

## Принятые решения

- Тап по заголовку удалён вместе с заголовком; открытие экрана «Запланировано» покрыто `widget_root` и `widget_empty`.
- `@string/widget_scheduled_title` и ссылка в `AndroidManifest.xml` сохранены — это имя виджета в пикере лаунчера, а не заголовок внутри виджета.
- Пустое состояние (`widget_empty`) оставлено без изменений.

## Известные ограничения

- Нет.

## Тестирование

- `./gradlew :app:compileDebugKotlin` — успешно, без ошибок.
- Ручная проверка на устройстве не проводилась (требуется пересборка APK и обновление виджета на лаунчере).
