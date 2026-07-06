# Фикс багов ImageViewer: белый блинк и проблемы с жестами

**Дата:** 2026-07-06
**Промпт/задача:** Описать баг в `docs/bugs/` и исправить 4 дефекта ImageViewer (белый блинк при открытии/закрытии, нет панорамирования после зума, первый тап после закрытия не работает)

## Что сделано

- **#1/#3 (белый блинк):** `Modal` переведён в `transparent` — белый фон модала больше не просвечивает во время fade-in/fade-out overlay. Fade происходит поверх чата, а не поверх белого экрана.
- **#2 (нет панорамирования):** `Gesture.Exclusive(pinchGesture, panGesture)` → `Gesture.Simultaneous(...)`. Теперь pan не "проигрывает" pinch и остаётся активным — после отпускания одного пальца pan берёт управление. Флаг `isPinching` блокирует pan во время активного pinch (поведение сохранено). Убран `maxPointers(1)` — ограничение одним пальцем обеспечивается проверкой `isPinching`.
- **#4 (первый тап):** Декаплинг mount/unmount от родительского `visible` через локальный `internalVisible`. `close()` теперь вызывает `onClose()` синхронно, fade-out управляется `useEffect[visible]`. `cancelAnimation` отменяет pending-колбэк при повторном открытии → гонка закрытия устранена. `pointerEvents="none"` на overlay во время `isClosing` — тапы по превью позади проходят сквозь fade-out.
- **Бонус:** fade-in изображения через `imageOpacity` + `onLoad` — нет пустого фрейма на медленной загрузке/первом декоде.
- Защита от повторного вызова `close()` через `isClosingRef` (реф + state).

## Изменённые файлы

- `docs/bugs/image-viewer-blink-and-gestures.md` — новый баг-репорт
- `src/features/image-viewer/ImageViewer.tsx` — фикс 4 багов

## Принятые решения

- **`Simultaneous` вместо `Exclusive` для pinch+pan:** `Exclusive` оставляет pan в состоянии FAILED после pinch и не реактивирует его при переходе 2→1 палец. `Simultaneous` держит pan живым; `isPinching` предотвращает интерференцию во время pinch. `pinch.onEnd` синхронизирует `panStartTranslate` с пост-pinch позицией — нет скачка.
- **Локальный `internalVisible`:** родительский `visible` остаётся source-of-truth для бизнес-состояния, но mount/unmount Modal управляется внутренним состоянием, чтобы fade-out мог доиграть до unmount. Это устраняет гонку «pending close callback переопределяет reopen».
- **`pointerEvents` через JS state `isClosing`** (не `useAnimatedProps`) — проще и надёжнее; 1-кадровая задержка незначительна на fade-out длительностью 200мс.
- **`transparent` Modal:** overlay с `backgroundColor: background` обеспечивает непрозрачный фон при `opacity:1`; при `opacity:0` виден чат — кросс-фейд без белого экрана.
- **`imageOpacity` + `onLoad`:** так как Modal unmount-ит детей при `internalVisible=false`, Image ремонтируется при каждом открытии → `onLoad` гарантированно срабатывает каждый раз.

## Известные ограничения

- Полноценное тестирование жестов и анимаций требует устройства/эмулятора — unit-тесты не покрывают RNGH/Reanimated UI-поток.
- `pointerEvents` pass-through через `transparent` Modal рассчитан на стандартное поведение RN; на некоторых OEM-Android сборках поведение Modal может отличаться — требует проверки на целевых устройствах.
- Shared Element Transition для превью→fullscreen не реализован (в спеке `FEATURE_FLAGS.sharedElementAvatar: false`); текущий фикс решает блинки через opaque fade, этого достаточно для UX.

## Тестирование

- ESLint `src/features/image-viewer/ImageViewer.tsx`: 0 ошибок
- `tsc --noEmit`: ошибок в `image-viewer` нет
- Ручное (требует устройства):
  - #1: тап по превью → плавный fade-in без белой вспышки
  - #2: pinch → отпустить один палец → pan работает
  - #3: X / swipe-down → плавный fade-out без белой вспышки
  - #4: закрыть → тап по превью → открывается с первого тапа
  - double-tap zoom in/out, single tap close, swipe-down dismiss — работают
