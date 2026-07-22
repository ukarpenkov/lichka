# Доработка превью картинок в чате (overflow + виньетка)

**Дата:** 2026-07-22
**Промпт/задача:** Картинка в чате выезжает за экран, наезжает на иконку типа сообщения; усилить виньетку в ленте (продолжение `2026-07-20-chat-image-rounded-vignette`).

## Что сделано
- Убраны bubble-era отрицательные отступы (`marginHorizontal: -12`, `marginVertical: -8`) у `ImageMessage` — они тянули превью поверх иконки типа и за край ряда
- Ширина превью считается по колонке контента `MessageLine` (gutter + time col + gap), с уточнением через `onLayout`, а не `screenWidth * 0.8`
- Иконка типа для image-сообщений стоит слева от превью (как у текста), а не над ним
- Виньетка в чате усилена: радиус градиента уже, затемнение к краям до ~72% opacity (fullscreen без изменений)
- Насыщенность виньетки дополнительно поднята (края темнее: mid ~38%, edge ~72%)

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — fit-to-column, без negative margins, сильнее vignette
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — тесты на ширину колонки и отсутствие negative margins
- `src/pages/chat-room/MessageLine.tsx` — layout иконки + `mediaBody` с `flex: 1` / `minWidth: 0`

## Принятые решения
- Эффекты по-прежнему только в ленте; `ImageViewer` не трогали
- Fallback-ширина до `onLayout` зеркалит геометрию `MessageLine` (88 + gutters + gap), чтобы тесты и первый кадр не брали 80% экрана

## Известные ограничения
- Если геометрию time-колонки в `MessageLine` поменяют, fallback в `ImageMessage` нужно синхронизировать (runtime всё равно поправит `onLayout`)

## Тестирование
- `npm test -- --testPathPattern='image-message|MessageLine' --no-coverage` — 25 passed
