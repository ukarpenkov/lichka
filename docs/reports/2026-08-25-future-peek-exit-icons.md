# Иконки выхода из Future Peek

**Дата:** 2026-08-25
**Промпт/задача:** При жесте возврата из экрана Future в чат якорь показывал стрелку вниз и часы со стрелкой вправо. Нужно: сверху стрелка вверх, снизу часы со стрелкой влево. Описать фичу в `docs/features` и поправить код.

## Что сделано

- Написан proposal `docs/features/future-peek-exit-icons-proposal.md` (статус **implemented**).
- `FuturePeekOverlay` больше не переиспользует входной визуал на выходе: enter и exit разведены по `PeekDirection`.
- **Enter** (история → Future): без изменений — часы + стрелка вправо, гайд вниз.
- **Exit** (Future → история): сверху стрелка вверх (`ChevronRight` на `-90deg`), снизу часы + `ChevronLeft`. Порядок в кластере обратный.
- Порог жеста, haptic и rubber-band не менялись.

## Изменённые файлы

- `docs/features/future-peek-exit-icons-proposal.md` — описание фичи
- `src/features/chat-future-peek/FuturePeekOverlay.tsx` — раздельный enter/exit якорь (`PeekGuide`, `TimeIcons`)
- `src/features/chat-future-peek/__tests__/FuturePeekOverlay.test.tsx` — RTL-тесты направлений и порядка иконок

## Принятые решения

- Жест выхода — вертикальный pull down у верха Future, не горизонтальный свайп табов (на `ChatRoom` pager выключен).
- Стрелка вверх — поворот существующего `ChevronRight` на `-90deg`, без новой pixel-иконки (как стрелка вниз на входе).
- Слот гайда exit (160px) и якорь под шапкой (`anchorExit`) сохранены; меняется только содержимое и порядок.

## Известные ограничения

- На пустом Future линия гайда по-прежнему может пересечь empty state («Nothing scheduled yet») — высота слота та же, что до правки.
- Визуал на устройстве в этой сессии не проверялся (только unit-тесты).

## Тестирование

- `npm test -- --testPathPattern='FuturePeekOverlay|chat-future-peek' --no-coverage` — PASS (21 тест)
- Покрытые сценарии:
  - enter: часы + стрелка вправо + гайд вниз, без left/up
  - exit: гайд вверх + часы + стрелка влево, без right/down
  - на exit стрелка вверх в дереве выше кластера часов
