# Синхронизация темы Android-виджета «Запланировано»

**Дата:** 2026-07-30
**Промпт/задача:** После переключения темы на Amber и сворачивания приложения виджет сохранял фон/бордер прошлой темы; ОР — чёрный фон, оранжевые символы и бордер.

## Что сделано
- Исправлен race при сохранении темы: `SharedPreferences.apply()` заменён на `commit()`, чтобы `refreshAll` читал уже записанные цвета.
- Цвета темы передаются в intent `ScheduledWidgetService`, чтобы при смене темы adapter пересоздавал фабрику, а не держал stale RemoteViewsFactory.
- Усилен tint иконок виджета: `PorterDuffColorFilter(SRC_IN)` и белый `fillColor` у vector-иконок (bell / alarm / repeat).

## Изменённые файлы
- `android/app/src/main/java/com/lichka/ThemeModule.kt` — синхронный `commit()` перед `refreshAll`
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — extras темы в service intent
- `android/app/src/main/java/com/lichka/ScheduledWidgetService.kt` — ink-цвет из intent + надёжный tint иконок
- `android/app/src/main/res/drawable/ic_widget_bell.xml` — fill `#FFFFFFFF`
- `android/app/src/main/res/drawable/ic_widget_alarm.xml` — fill `#FFFFFFFF`
- `android/app/src/main/res/drawable/ic_widget_repeat.xml` — fill `#FFFFFFFF`

## Принятые решения
- Корневая причина рассинхрона хоста (фон/бордер/title) и списка — асинхронная запись prefs: host обновлялся со старыми цветами, list — уже с новыми.
- Чёрные иконки при оранжевом тексте — отдельный дефект tint на vector с `#000000`; исправлен через white fill + `SRC_IN`.
- Extras в intent нужны и для консистентности цветов списка с хостом, и чтобы URI intent менялся при смене темы (переподключение adapter).

## Известные ограничения
- Фикс только для Android home-screen widget; iOS widget отсутствует.
- Проверка требует native rebuild (изменения в Kotlin/XML).

## Тестирование
- [ ] Выбрать тему Amber → свернуть приложение → виджет: чёрный фон, оранжевый текст, оранжевые иконки, оранжевый бордер
- [ ] Переключить Light → Dark → Amber подряд и убедиться, что виджет каждый раз полностью совпадает с темой
- [ ] Пустой виджет (нет scheduled): empty-state и title тоже в цветах текущей темы
