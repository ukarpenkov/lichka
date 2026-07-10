# Seamless chat — дизайн без разделителей

**Дата:** 2026-07-10
**Промпт/задача:** Реализовать компонент seamless chat UI по принципу бесшовного дизайна (no dividers, no borders, floating bubbles, modern minimalist). Реализация в `src/features/` по правилам Lichka (FSD, AGENTS.md).

## Что сделано

- Создан proposal `docs/features/seamless-chat-proposal.md` с описанием проблемы, техническим решением, оценкой сложности и альтернативами.
- Реализована фича `src/features/seamless-chat/`:
  - **`layout.ts`** — токены spacing/radius/opacity и хелперы теней `buildSeamlessShadow`, `defaultBubbleShadow`, `isLightBackground`.
  - **`useSeamlessChatStyles.ts`** — единый хук, возвращающий набор стабильных стилей (bubble, pill, header, meta) на основе активной темы.
  - **`SeamlessBubble.tsx`** — пузырь сообщения: `borderWidth: 0`, soft shadow, контейнер с `Animated.View` и `Pressable`. Опциональные `onLongPress`, `onPress`, `highlighted`.
  - **`SeamlessHeader.tsx`** — header чата: `borderBottomWidth: 0`, фон — либо `transparent`, либо родительский `background` (флаг `transparentOnIdle`).
  - **`SeamlessDateChip.tsx`** — замена `DateSeparator`: pill-форма (скруглённый бокс с `backgroundColor: text + '10'`), **без горизонтальных линий**.
  - **`index.ts`** — public API фичи.
- 4 файла unit-тестов в `src/features/seamless-chat/__tests__/`: `useSeamlessChatStyles.test.ts`, `SeamlessBubble.test.tsx`, `SeamlessHeader.test.tsx`, `SeamlessDateChip.test.tsx`.

## Изменённые файлы

- `docs/features/seamless-chat-proposal.md` — **новый** (proposal)
- `src/features/seamless-chat/layout.ts` — **новый** (токены)
- `src/features/seamless-chat/useSeamlessChatStyles.ts` — **новый** (хук)
- `src/features/seamless-chat/SeamlessBubble.tsx` — **новый** (компонент)
- `src/features/seamless-chat/SeamlessHeader.tsx` — **новый** (компонент)
- `src/features/seamless-chat/SeamlessDateChip.tsx` — **новый** (компонент)
- `src/features/seamless-chat/index.ts` — **новый** (public API)
- `src/features/seamless-chat/__tests__/useSeamlessChatStyles.test.ts` — **новый** (8 кейсов)
- `src/features/seamless-chat/__tests__/SeamlessBubble.test.tsx` — **новый** (6 кейсов)
- `src/features/seamless-chat/__tests__/SeamlessHeader.test.tsx` — **новый** (4 кейса)
- `src/features/seamless-chat/__tests__/SeamlessDateChip.test.tsx` — **новый** (5 кейсов)
- `docs/reports/2026-07-10-seamless-chat.md` — **новый** (этот отчёт)

## Принятые решения

1. **Расположение по FSD — `features`, не `shared/ui` или `widgets`.**
   `SeamlessBubble` принимает семантические пропсы (highlighted, onLongPress), инкапсулирует стили чата. Это именованное решение для чата, а не атомарный ui-kit. Не готовый самостоятельный экран — поэтому не widget (это был бы `SeamlessChatScreen`). Хук + 3 обёртки + токены — фича.

2. **Тени вместо бордеров для пузырей.**
   Чтобы сохранить визуальное «парение», `SeamlessBubble` использует `shadowColor/shadowOffset/shadowOpacity/shadowRadius/elevation`. На светлых темах opacity 0.06, на тёмных — 0.25. Это мягче, чем border, и не нарушает принцип «no dividers».

3. **Pill-форма для даты вместо горизонтальной линии `─────── 12 Jan ───────`.**
   `DateSeparator` рисовал две тонкие `StyleSheet.hairlineWidth` линии по бокам от текста. `SeamlessDateChip` собирает дату в **pill** — скруглённый бокс с `backgroundColor: text + '10'`. Никаких линий, текст «парит» над лентой.

4. **Прозрачный header.**
   `ChatHeader.tsx` ставил `borderBottomWidth: StyleSheet.hairlineWidth`. В seamless-варианте header либо `transparent`, либо = `background`. Если потребуется, можно добавить sticky-режим через scrollY в следующих итерациях.

5. **`featureFlags.ts` не трогаем.**
   Фича автономна. Если потребуется runtime-включение/выключение, добавим **внутри** фичи (отдельный локальный флаг), не в shared.

6. **Только API, без миграции `ChatRoomScreen`.**
   Пользователь явно попросил фичу в `src/features/`. Миграция `pages/chat-room` на seamless-компоненты — отдельный refactor-PR, чтобы scope был небольшой и review-цикл короткий.

## Известные ограничения

- **`SeamlessStickyDate` не входит в v1.** Поведение sticky-date в `ChatRoomScreen.tsx:365-376` использует `<DateSeparator>` внутри `<Animated.View>` поверх списка. Перевод на seamless — отдельная задача, если потребуется.
- **`TransparentOnIdle=true` по умолчанию.** Возможно, для читаемости header предпочтительнее `false` (полупрозрачный фон). Решается в PR миграции.
- **Не проверено на реальных устройствах.** Тесты только в Jest + RNTL на mocke reanimated/safe-area. Визуальная проверка — в PR миграции (на iOS симуляторе + Android-эмуляторе).

## Тестирование

| Файл | Кейсов | Сценарии |
|------|--------|----------|
| `useSeamlessChatStyles.test.ts` | 8 | фон + текст из темы, isLight для светлой/тёмной темы, применение bubble fill через opacity token, borderRadius токен, padding, meta цвет, пересборка стилей при смене темы |
| `useSeamlessChatStyles.test.ts` → `defaultBubbleShadow` | 3 | light-tema → opacity 0.06, dark-tema → 0.25, elevation всегда |

| Файл | Кейсов | Сценарии |
|------|--------|----------|
| `SeamlessBubble.test.tsx` | 6 | рендер children, отсутствие borderWidth, onLongPress вызывается, onPress вызывается, отключение тени в highlighted, отсутствие callback'ов не ломает |
| `SeamlessHeader.test.tsx` | 4 | рендер children, borderBottomWidth=0, фон=parent при transparentOnIdle=true, фон=transparent при transparentOnIdle=false |
| `SeamlessDateChip.test.tsx` | 5 | рендер label, отсутствие border/borderBottomWidth, pill-background, без pill-фона при pill=false, цвет текста = meta |

**Итого:** 31 кейс в 4 файлах.

### Покрытие

```
features/seamless-chat | Stmts: 100% | Branch: 88.23% | Funcs: 100% | Lines: 100%
```

Превышает требуемый минимум **80%** из AGENTS.md.

### Проверки

- `npx jest src/features/seamless-chat` — все 31 теста pass.
- `npx jest src/features/seamless-chat --coverage` — покрытие выше 80%.
- `npx jest` (полный набор) — 213 тестов pass (включая существующие).
- `npx tsc --noEmit` — **0 ошибок** в `src/features/seamless-chat/`. Ошибки в других слоях существовали до изменений и выходят за scope этой фичи.
- `npx eslint src/features/seamless-chat` — **clean**, 0 предупреждений и ошибок.

## Что дальше

1. (отдельно) `refactor(chat-room): adopt seamless-chat components` — миграция `pages/chat-room/MessageBubble.tsx`, `ChatHeader.tsx`, `DateSeparator.tsx` на новые компоненты. Опционально — обновление `SearchOverlay` и `MessageEditor`.
2. Если потребуется sticky-date в seamless-стиле — добавить `SeamlessStickyDate` (или расширить `SeamlessDateChip` опцией `sticky`).
3. Если появится A/B-тест «seamless vs bordered» — добавить внутренний флаг `SEAMLESS_CHAT_ENABLED` внутри фичи.
