# Проверка иконки для Android уведомлений

**Дата:** 2026-05-22
**Промпт/задача:** Проверить, будет ли текущая иконка приложения нормально отображаться в уведомлениях Android.

## Что сделано
- Проверены Android resources на наличие отдельных notification/small icon ресурсов.
- Проверены упоминания notification/smallIcon/ic_stat в коде проекта.
- Дано пояснение, что adaptive launcher icon и notification small icon — разные ресурсы Android.

## Изменённые файлы
- `docs/reports/2026-05-22-android-notification-icon-check-report.md` — отчёт по проверке.

## Принятые решения
- Не менять launcher icon для уведомлений: для Android уведомлений нужен отдельный монохромный `smallIcon` на прозрачном фоне.

## Известные ограничения
- В проекте не найден код уведомлений, поэтому фактическое отображение notification icon не проверялось на устройстве.

## Тестирование
- Поиск ресурсов `*notification*` и `*ic_stat*` в `android/app/src/main/res` — ничего не найдено.
- Поиск по коду `notification`, `smallIcon`, `ic_stat`, `setSmallIcon` — совпадений не найдено.
