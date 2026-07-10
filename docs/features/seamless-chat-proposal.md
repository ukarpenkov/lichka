# Seamless chat UI

**Статус:** draft

## Описание проблемы

Текущий чат-экран содержит визуальные границы, которые утяжеляют интерфейс и нарушают принцип **единого визуального потока**:

| Где | Что есть | Файл |
|-----|---------|------|
| Header чата | `borderBottomWidth: StyleSheet.hairlineWidth` + цвет `text + '20'` | `src/pages/chat-room/ChatHeader.tsx:40` |
| DateSeparator | Две горизонтальные линии `text + '20'` по бокам от даты | `src/pages/chat-room/DateSeparator.tsx:19,23` |
| StickyDate (поверх списка) | Тот же разделитель с фоном родителя, повторяет ту же границу | `src/pages/chat-room/ChatRoomScreen.tsx:370` |

В сумме три класса элементов, рисующих **жёсткие разделители**. На тёмных темах (`green-on-black`, `amber`, `mint`, `parchment`) это особенно заметно — линии «режут» экран и снижают ощущение пространства.

Запрос пользователя (исходный промпт) — *modern chat interface design, seamless layout, no dividers or separator lines*, что соответствует minimalist / contemporary-стилю и совпадает со ставкой Lichka на «чат с самим собой».

## Предлагаемое решение

Добавить фичу `seamless-chat` в `src/features/seamless-chat/`, которая предоставляет компоненты-обёртки и общий хук стилей **без border / divider-линий**:

- **`SeamlessBubble`** — пузырь сообщения: `borderRadius` сохраняется (для органичности), но нет `borderWidth`. Поверхность «парит» за счёт **soft shadow** (`shadowColor: '#000'`, `shadowOpacity` зависит от темы, `shadowRadius: 8`, `shadowOffset: {0, 2}`, `elevation: 2`).
- **`SeamlessHeader`** — header чата: фон = родительский `background`, без `borderBottom`. Лёгкая тень **не** используется (чтобы не выглядел как «модалка»), но при скролле списка вниз header можно опционально подсветить soft-tint `text + '05'` (флаг `transparentOnIdle`).
- **`SeamlessDateChip`** — замена `DateSeparator`: дата без двух боковых линий, рендерится как **pill** (скруглённый бокс с фоном `text + '10'`), компактно, «парит» над лентой.
- **`useSeamlessChatStyles()`** — единый хук, возвращающий набор стабильных стилей на базе текущей темы (`background`, `text`, `accent`). Кэшируется через `useMemo`.
- **`seamlessChatTokens`** — константы spacing / radius / shadow opacity, вынесенные в `layout.ts`. Это позволяет переопределить токены (например, более сильная тень) через props в одном месте.

### Поведение

- Компоненты принимают `children` либо `value`-пропсы (как исходные) — это **обёртки**, не ломают существующий API.
- Не импортируются в существующий `ChatRoomScreen` (это не миграция) — фича доступна по `import { SeamlessBubble } from '../../features/seamless-chat'`, и может быть переключена позже через PR с миграцией.
- `featureFlags.ts` **не трогаем** — фича автономна. Если потребуется runtime-переключение (A/B), добавим **внутри** фичи свой `SEAMLESS_CHAT_ENABLED` флаг без зависимости на shared.

### Почему `features`, а не `widgets` или `shared/ui`

По FSD-правилам AGENTS.md:

- `shared/ui` — базовый UI-kit без бизнес-логики (Button, Input).
- `widgets` — самостоятельные UI-блоки из фич.
- `features` — пользовательские действия / бизнес-логика с возможностью инкапсулировать стили и токены.

`seamless-chat` — это **стилевое решение** + набор обёрток с именованной семантикой («бесшовный UI»). Самостоятельный UI-блок, который можно интегрировать в любой чат-list (alarm, scheduled, chat-room). Три обёртки-компонента + хук = фича, а не атомарный ui-kit.

## Техническое решение

### Структура

```
src/features/seamless-chat/
├── index.ts                     # public API
├── SeamlessBubble.tsx           # пузырь без border, с soft shadow
├── SeamlessHeader.tsx           # header без borderBottom
├── SeamlessDateChip.tsx         # замена DateSeparator: pill, без линий
├── useSeamlessChatStyles.ts     # единый хук стилей
├── layout.ts                    # spacing / radius / shadow токены
└── __tests__/
    ├── useSeamlessChatStyles.test.ts
    ├── SeamlessBubble.test.tsx
    ├── SeamlessHeader.test.tsx
    └── SeamlessDateChip.test.tsx
```

### Public API (`index.ts`)

```typescript
export { SeamlessBubble, type SeamlessBubbleProps } from './SeamlessBubble';
export { SeamlessHeader, type SeamlessHeaderProps } from './SeamlessHeader';
export { SeamlessDateChip, type SeamlessDateChipProps } from './SeamlessDateChip';
export { useSeamlessChatStyles } from './useSeamlessChatStyles';
export {
  SEAMLESS_RADIUS,
  SEAMLESS_SPACING,
  SEAMLESS_SHADOW,
  buildSeamlessShadow,
} from './layout';
```

### Токены (`layout.ts`)

```typescript
export const SEAMLESS_RADIUS = {
  bubble: 18,
  pill: 12,
  header: 0, // header без скругления — часть экрана
} as const;

export const SEAMLESS_SPACING = {
  bubblePaddingH: 14,
  bubblePaddingV: 10,
  bubbleGap: 6,        // расстояние между соседними пузырями
  headerPaddingH: 16,
  headerPaddingV: 10,
  pillPaddingH: 10,
  pillPaddingV: 4,
} as const;

export function buildSeamlessShadow(opacity: number) {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 2,
  };
}

export const SEAMLESS_SHADOW = {
  // по умолчанию opacity ниже — на светлой теме 0.06, на тёмной 0.25
  bubble: (isLight: boolean) => buildSeamlessShadow(isLight ? 0.06 : 0.25),
};
```

### `useSeamlessChatStyles`

```typescript
export function useSeamlessChatStyles() {
  const { background, text } = useTheme();
  const isLight = background !== '#000000' && !background.startsWith('#0') && !background.startsWith('#1') && !background.startsWith('#2') && !background.startsWith('#3');

  return useMemo(() => ({
    background,
    text,
    bubble: {
      backgroundColor: text + '12',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isLight ? 0.06 : 0.25,
      shadowRadius: 8,
      elevation: 2,
    },
    pill: {
      backgroundColor: text + '10',
    },
    meta: { color: text + '60' },
  }), [background, text, isLight]);
}
```

### `SeamlessBubble`

Props:

```typescript
type SeamlessBubbleProps = {
  children: React.ReactNode;
  highlighted?: boolean;
  onLongPress?: () => void;
  testID?: string;
};
```

Рендер:

- `<Pressable>` с логикой pressed-opacity (как в MessageBubble).
- Внутри — контейнер со стилями: `borderRadius: SEAMLESS_RADIUS.bubble`, padding-spacing, `bubble` стиль из хука, но **без** borderWidth.
- На highlighted — `backgroundColor: text + '25'`, без тени (визуальный «фокус»).

### `SeamlessHeader`

Props:

```typescript
type SeamlessHeaderProps = {
  children: React.ReactNode;
  transparentOnIdle?: boolean; // по умолчанию false — фон = background, а не transparent
  testID?: string;
};
```

- Контейнер `<View>` без borderBottom.
- Фон = `background` (если `transparentOnIdle` не true) — header «невидим» на экране, но сохраняет safe-area.

### `SeamlessDateChip`

Props:

```typescript
type SeamlessDateChipProps = {
  label: string;
  pill?: boolean; // по умолчанию true
  testID?: string;
};
```

- `<View>` с pill-стилем: `paddingH/V`, `borderRadius: SEAMLESS_RADIUS.pill`, `backgroundColor: text + '10'`, без `border`.
- Анимация `FadeIn` на входе (как у `DateSeparator`).

## Влияние на архитектуру (FSD)

| Слой | Файл | Изменение |
|------|------|-----------|
| `features/seamless-chat` | (новый) | 6 файлов: 3 компонента, 1 хук, 1 токены-модуль, 1 index.ts |
| `features/seamless-chat/__tests__` | (новый) | 4 файла unit-тестов |

**Не затронуты:**

- `pages/chat-room/*` — фича не интегрируется автоматически. Миграция (опциональная) делается в отдельном PR через `task` или `refactor` коммит.
- `shared/*` — фича автономна, токены внутри.
- `entities/*` — фича не трогает модели.

## Альтернативы

### 1. Положить в `shared/ui`

**Отклонено по FSD.** `shared/ui` предназначен для переиспользуемых атомарных компонентов (`Button`, `Input`). `SeamlessBubble` принимает semantic props (`highlighted`, `onLongPress`) и инкапсулирует стили чата, что больше похоже на фичу.

### 2. Положить в `widgets`

**Отклонено (пограничный случай).** Виджет — самостоятельный UI-блок из фич. Если бы это был готовый `SeamlessChatScreen` (header + bubbles + chips), это был бы виджет. Мы же поставляем 3 маленьких обёртки + хук + токены, что соответствует **фиче**.

### 3. Сделать preset темы в `shared/config/theme.ts`

**Отклонено.** Преset темы задаёт только background и text, но не описывает токены (радиусы, тени). А самое главное — темы меняют **цвета**, а seamless — это **отсутствие границ и стиль теней**, что ортогональная ось. Делать seamless-темой значит ввести 11 новых пресетов только ради эффекта, что у пользователя не запрашивалось.

### 4. Включить интеграцию в `ChatRoomScreen` сразу

**Отложено до следующего PR.** Пользователь явно попросил фичу в `src/features/`. Если делать миграцию сразу, увеличится scope и review-цикл. Сначала — фича, потом — переключение header/bubble/chip в `ChatRoomScreen` отдельным коммитом `refactor(chat-room): adopt seamless-chat components`.

### 5. Использовать `react-native-shadow-2` для GPU-теней

**Отложено.** Стандартные `shadow*` + `elevation` работают на iOS/Android и достаточны для soft-эффекта. Зависимость добавлять нерационально для v1.

## Оценка сложности

| Компонент | Часы |
|-----------|------|
| `layout.ts` (токены) | 0.5 |
| `useSeamlessChatStyles` | 0.5 |
| `SeamlessBubble` | 1 |
| `SeamlessHeader` | 0.5 |
| `SeamlessDateChip` | 0.5 |
| Unit-тесты (≥80%) | 2.5 |
| Отчёт + коммит | 0.5 |
| **Итого** | **~6 часов** |

**Риски:**

- **Низкий:** Тень на Android требует `elevation` — уже знаем, добавляем в хук.
- **Низкий:** Тёмные темы с `text + '12'` фоном пузыря могут слиться с фоном — принимаем, так как это поведение исходного `MessageBubble`. Seamless-изменение касается только границ, не контраста.
- **Средний:** StickyDate-поведение **не включено в v1**. Если потребуется, добавим отдельный компонент `SeamlessStickyDate`.

## Тестирование

Unit-тесты (Jest + react-test-renderer):

| Файл | Сценарии |
|------|----------|
| `useSeamlessChatStyles.test.ts` | возвращает ожидаемые поля, кэшируется между рендерами (useMemo), реагирует на смену темы |
| `SeamlessBubble.test.tsx` | рендерит children, применяет тень, не рендерит borderWidth (через style-prop testID), вызывает onLongPress, меняет background в highlighted |
| `SeamlessHeader.test.tsx` | рендерит children, фон = parent background, нет borderBottom, transparentOnIdle применяется при прокинутом флаге |
| `SeamlessDateChip.test.tsx` | рендерит label в pill, без border, padding применён |

**Покрытие:** минимум 80% (требование AGENTS.md). Измеряется через `jest --coverage`.

**Моки:** `useTheme`, `useLocale`, `react-native-reanimated` — уже настроены в `jest.setup.js`. Никаких внешних сервисов фича не использует.

## Workflow

1. ✅ Draft proposal → `docs/features/seamless-chat-proposal.md`
2. Реализация в `src/features/seamless-chat/` по этому плану
3. Unit-тесты (≥80%)
4. Отчёт в `docs/reports/2026-07-10-seamless-chat.md`
5. Коммит `feat(seamless-chat): add seamless UI components for chat surface`
6. (отдельно, не в этом PR) → `refactor(chat-room): adopt seamless-chat components`
