# Скругление и виньетка у картинок в чате

**Дата:** 2026-07-20
**Промпт/задача:** Скруглить углы у картинок в сообщениях чата и добавить небольшую виньетку по краям; в полном просмотре показывать оригинал без эффектов.

## Что сделано
- В превью `ImageMessage` добавлен кадр с `borderRadius: radii.md` (12) и `overflow: 'hidden'`
- Поверх превью — SVG radial-gradient виньетка (лёгкое затемнение к краям, ~28% opacity)
- Полный просмотр (`ImageViewer`) не менялся — по-прежнему показывает исходный файл без скругления и виньетки
- Убран лишний `imageWrap` в `MessageLine`, который форсировал `borderRadius: 0`

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — frame + vignette overlay
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — тест на radius и Svg
- `src/pages/chat-room/MessageLine.tsx` — удалён конфликтующий `imageWrap`

## Принятые решения
- Эффекты только в ленте чата; fullscreen остаётся «честным» оригиналом
- Виньетка через `react-native-svg` `RadialGradient` (без новых зависимостей)
- Радиус из дизайн-токенов `radii.md`, а не хардкод вне tokens

## Известные ограничения
- Виньетка рисуется оверлеем, а не baked в файл — при экспорте/шаринге файла эффекта нет (это ожидаемо)

## Тестирование
- `npm test -- --testPathPattern='image-message|MessageLine' --no-coverage` — 23 passed
