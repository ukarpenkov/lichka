# Фича: просмотр картинок в сообщениях (full-screen image viewer)

**Дата:** 2026-07-05
**Промпт/задача:** Реализовать полноэкранный просмотрщик картинок с жестами (pinch-to-zoom, pan, double-tap, swipe-to-dismiss) в слое features.

## Что сделано

- Создан feature-слайс `src/features/image-viewer/`:
  - `useImageViewer.ts` — хук управления состоянием (open/close/visible/data)
  - `ImageViewer.tsx` — полноэкранный Modal-компонент с жестами и анимациями
  - `index.ts` — public API слайса
- Обновлён `src/features/index.ts` — реэкспорт нового фича-слайса
- Интегрирован просмотрщик в цепочку: `ChatRoomScreen → MessageBubble → ImageMessage`
  - `ImageMessage` теперь принимает `onPress` и вызывает его при тапе на картинку в сообщении

## Жесты (реализованы)

| Жест | Поведение |
|------|-----------|
| **Pinch** | Зум от 1x до 5x, с плавным возвратом при уменьшении ниже 1x |
| **Pan (когда зум >1x)** | Перемещение картинки по осям X/Y |
| **Pan (когда зум =1x)** | Свайп вниз → dismiss; возврат spring-ом если не дотянули |
| **Double-tap** | Переключение 1x ↔ 2x с анимацией |
| **Тап по фону** | Закрытие с fade-out |
| **Тап по крестику** | Закрытие с fade-out |

## Архитектура жестов

- Вложенные `GestureDetector`:
  - **Внешний** (overlay): Exclusive(Tap → close, Pan → dismiss)
  - **Внутренний** (image): Exclusive(DoubleTap → zoom toggle, Simultaneous(Pinch → zoom, Pan → move/dismiss))
- Вложенность RNGH v2 гарантирует, что касания по картинке обрабатываются внутренним детектором, касания по фону — внешним

## Анимации и доступность

- `react-native-reanimated` для всех анимаций (zoom, translate, opacity)
- `AccessibilityInfo.isReduceMotionEnabled()` — при включённом «уменьшении движения»:
  - Анимации отключаются (duration: 0 на всех timing)
  - Закрытие происходит мгновенно без fade-out
- `withTiming` для zoom, `withSpring` для возврата контейнера при dismiss

## Тема

- Фон overlay = `theme.background`
- Крестик (X из lucide-react-native) = `theme.text`
- StatusBar: светлый/тёмный контент вычисляется по яркости фона (luminance)
- Работает со всеми 13 темами

## Изменённые файлы

- `src/features/image-viewer/ImageViewer.tsx` — новый, компонент просмотрщика (308 строк)
- `src/features/image-viewer/useImageViewer.ts` — новый, хук состояния (23 строки)
- `src/features/image-viewer/index.ts` — новый, public API
- `src/features/index.ts` — +3 строки реэкспорта
- `src/widgets/image-message/ImageMessage.tsx` — добавлен `onPress` проп + Pressable-обёртка
- `src/pages/chat-room/MessageBubble.tsx` — добавлен `onImagePress` проп, проброс в ImageMessage
- `src/pages/chat-room/ChatRoomScreen.tsx` — хук `useImageViewer`, рендер `<ImageViewer>`, проброс `onImagePress`

## Принятые решения

- **Не создан отдельный widget.** Просмотрщик размещён в features, так как является самодостаточной фичей с собственной бизнес-логикой жестов.
- **Modal вместо навигации.** Использован RN `<Modal>` с `animationType="none"` — анимации полностью контролируются Reanimated, что позволяет учесть reduceMotion.
- **Один хук на ChatRoomScreen.** `useImageViewer` вызывается на уровне экрана, open/close пробрасываются через пропсы вниз по дереву. Не использован контекст — избыточно для одного экрана.
- **Вложенные GestureDetector.** Внешний детектор на overlay ловит тап по фону и свайп-вниз, внутренний на картинке — жесты зума и перемещения. Это корректное решение для RNGH v2.
- **Стандартный Image.** Не добавлен fast-image — проект его не использует.

## Известные ограничения

- Свайп-вниз для dismiss работает ТОЛЬКО когда зум = 1x. При увеличении свайп двигает картинку.
- Отсутствует индикатор загрузки (loading) — картинки локальные, загружаются мгновенно.
- Нет кнопок «поделиться» / «сохранить» — не указаны в спецификации.

## Тестирование

- TypeScript: `npx tsc --noEmit` — 0 ошибок в новых/изменённых файлах
- ESLint: `npx eslint src/features/image-viewer/` — 0 errors, 0 warnings
- Предварительно проверена цепочка типов: `open(ImageViewerData)` → `onImagePress(ImageViewerData)` → `onPress(ImageViewerData)` — сигнатуры совпадают
