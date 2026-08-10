# [UI] При открытой клавиатуре нельзя проскроллить к сообщениям прошлых дней

**Дата:** 2026-08-10  
**Модуль:** `src/pages/chat-room/ChatRoomScreen.tsx`, `src/shared/lib/keyboard.ts`  
**Платформа:** Android  
**Приоритет:** P1  
**Воспроизводимость:** высокая  
**Статус:** open (итерация 3 — ждёт проверки на устройстве)

## Описание

При свёрнутой клавиатуре история доступна. При развёрнутой — нельзя проскроллить к сообщениям прошлых дней (обрезаны сверху).

## Скриншоты

| Состояние | Файл |
|-----------|------|
| Клавиатура свёрнута | [`assets/chat-scroll-keyboard-collapsed.png`](./assets/chat-scroll-keyboard-collapsed.png) |
| Клавиатура развёрнута | [`assets/chat-scroll-keyboard-expanded.png`](./assets/chat-scroll-keyboard-expanded.png) |

## Корневая причина (уточнённая после провальных попыток)

На Android с `adjustNothing` + `overflow: hidden` на `chatArea`:

1. **`paddingBottom` (в т.ч. Reanimated / React state) не всегда сжимает Yoga-layout FlatList** — список остаётся «высокой» высоты и **клипится** родителем. `contentHeight ≈ layoutHeight` → `maxOffset = 0`, скроллить некуда, сверху видны обрезанные старые сообщения.
2. **Entry-peek `GestureDetector`** остаётся в дереве даже с `.enabled(false)` и может перехватывать вертикальные жесты в touch arena.

Поэтому одного `scrollEnabled || keyboardOpen` недостаточно.

## Попытки

1. Только `scrollEnabled || keyboardOpen` — не помогло (`flexGrow` + clip).
2. JS `paddingBottom` на `chatArea` + снятие `flexGrow` — на устройстве без изменений (padding не дал реального shrink).
3. **Текущая:** sibling-`View` высотой клавиатуры под `peekHost` (flex ужимает список); при открытой клавиатуре **нет** `GestureDetector`/rubber-band; `scrollEnabled`; `entryPeek.reset()`.

## Проверка

`./gradlew assembleRelease` → Saved → клавиатура → скролл вверх до первого дня.
