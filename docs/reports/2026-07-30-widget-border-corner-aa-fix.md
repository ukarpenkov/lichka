# Android Scheduled Widget — чёрные дуги на углах border/shadow

**Дата:** 2026-07-30
**Промпт/задача:** На углах orange border/hard-shadow виджета «Запланировано» видны чёрные изогнутые линии (лунки); рамка должна быть сплошь оранжевой.

## Что сделано

- Выявлена причина: пластина рисовалась как чёрный `drawRoundRect` (fill) на всю face + оранжевый `Paint.Style.STROKE` поверх. Anti-aliasing чёрной заливки на скруглениях «вылезал» за обводку в полосу hard-shadow → чёрные crescent-дуги в оранжевых углах.
- Перерисовка пластины без `STROKE`: hard-shadow (ink) → сплошная outer-пластина (ink) → inner canvas inset на толщину бордера с радиусом `radius − stroke`.
- Тот же приём в XML fallback `bg_widget_scheduled.xml` (layer-list из трёх shape, без `<stroke>`).

## Изменённые файлы

- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — `createNeoBrutalPlate`: FILL-only схема (shadow → ink plate → inset canvas)
- `android/app/src/main/res/drawable/bg_widget_scheduled.xml` — layer-list: shadow + ink outer + canvas inset (radius 14dp = 16 − 2)

## Принятые решения

- Бордер = заливка ink под inset canvas, а не `STROKE` по краю canvas — убирает AA-шов между fill и stroke.
- Внутренний радиус уменьшен на толщину бордера (`16dp − 2dp`), чтобы углы оставались концентрическими.
- Геометрия neo-brutal (offset 4dp, border 2dp, radius 16dp) не менялась — только способ сборки цветов.

## Известные ограничения

- Нужна пересборка Android и обновление инстанса виджета на лаунчере, чтобы подтянуть новый bitmap / drawable.
- Часть OEM-лаунчеров может дополнительно клипать виджет своим радиусом поверх пластины (как и раньше).

## Тестирование

- Статический разбор скриншота + кода отрисовки пластины.
- На устройстве (ручная проверка после rebuild):
  - [ ] Углы оранжевой рамки/тени без чёрных дуг (тёмная тема)
  - [ ] То же в светлой теме (ink тёмный на светлом canvas)
  - [ ] Hard-shadow offset и толщина бордера визуально как раньше
