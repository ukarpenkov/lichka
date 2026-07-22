# Фикс повторного открытия ImageViewer

**Дата:** 2026-07-22
**Промпт/задача:** После закрытия просмотра картинки повторный тап по превью в чате не открывает viewer.

## Что сделано
- Колбэк закрытия учитывает `finished` и актуальный `visible` (`finishClose` + `visibleRef`) — stale-анимация больше не гасит Modal после reopen
- `useImageViewer` отдаёт `openKey`, который инкрементируется на каждый `open()` — reopen не no-op, даже если `visible` залип в `true`
- Fade картинки при open через `withTiming`, без зависимости от повторного `onLoad` (кэш)

## Изменённые файлы
- `src/features/image-viewer/ImageViewer.tsx` — finishClose, openKey, fade без onLoad
- `src/features/image-viewer/useImageViewer.ts` — openKey
- `src/pages/chat-room/ChatRoomScreen.tsx` — проброс openKey
- `src/features/image-viewer/__tests__/useImageViewer.test.ts` — тесты open/reopen
- `docs/bugs/image-viewer-blink-and-gestures.md` — статус #4

## Принятые решения
- `openKey` вместо хака `setVisible(false)` → `setVisible(true)` в одном тике
- Баг #4 из `docs/bugs/image-viewer-blink-and-gestures.md` — регресс после неполного фикса через только `cancelAnimation`

## Известные ограничения
- —

## Тестирование
- `npm test -- --testPathPattern='useImageViewer' --no-coverage`
- Ручная проверка: открыть → закрыть → снова тап по превью
