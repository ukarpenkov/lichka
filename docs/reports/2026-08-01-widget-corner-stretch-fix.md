# Android Scheduled Widget — углы не растягиваются при resize

**Дата:** 2026-08-01
**Промпт/задача:** При растягивании виджета «Запланировано» углы скругляются неправильно (эллипс, толстые боковые бордеры); должны оставаться круглыми как на несжатом/корректном размере.

## Что сделано

- Причина: пластина рисовалась в bitmap (`createNeoBrutalPlate`) и ставилась в `ImageView` с `scaleType="fitXY"`. При несовпадении aspect ratio bitmap с размером виджета пиксели (включая corner radius и hard-shadow справа) растягивались неравномерно → эллиптические углы и утолщённый правый бордер.
- Пластина переведена на три shape `ImageView` (shadow / border / face) с фиксированным `cornerRadius` в dp. Shape перерисовывается в новых bounds, радиус остаётся круговым при любом resize.
- Цвета темы: tint белых силуэтов (`setImageTintList` на API 31+, иначе `setColorFilter`).

## Изменённые файлы

- `android/app/src/main/res/drawable/widget_plate_round.xml` — outer 16dp, white
- `android/app/src/main/res/drawable/widget_plate_round_inner.xml` — inner 14dp, white
- `android/app/src/main/res/layout/widget_scheduled.xml` — три plate ImageView вместо одного bitmap
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — tint вместо `createNeoBrutalPlate`

## Принятые решения

- Не чинить только расчёт MAX_WIDTH×MAX_HEIGHT: даже с точным размером live-resize лаунчера всё равно fitXY-стретчит stale bitmap.
- Геометрия neo-brutal без изменений: offset 4dp, border 2dp, radius 16/14dp.
- `bg_widget_scheduled.xml` оставлен как справочный layer-list; layout больше на него не ссылается.

## Тестирование

- [ ] Пересобрать Android, обновить инстанс виджета на лаунчере
- [ ] Растянуть виджет по ширине (Amber и Green on Black): углы круглые, бордер равномерный
- [ ] Растянуть по высоте / сжать: то же
- [ ] Смена темы: shadow/border/face и текст/иконки в цветах темы
