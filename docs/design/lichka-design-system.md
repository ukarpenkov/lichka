# Lichka — Design System

**Статус:** implemented (root tabs) · ориентир для UI-консистентности  
**Дата:** 2026-07-20  
**Референс формы:** Airbnb (whitespace, soft radii, modest type) — только ритм, не палитра  
**Источник правды по принципам:** `docs/spec/white-requirements.md`, `docs/spec/draft-requirements.md` §7

> **Контракт реализации (после lead-design review):** gutter **20**, header **56** fixed, chat row **12v**, scheduled **14v**, settings **minHeight 56**, radii только **12 / 16 / full**, press = `surfaceSoft` (ink @ 6%). Документ ниже синхронизирован с кодом в `src/shared/config/tokens.ts`.

---

## 1. Зачем этот документ

Три корневых таба сейчас читаются как три разных приложения:

| Экран | Заголовок | Разделители | Плотность |
|-------|-----------|-------------|-----------|
| **Чаты** | средний (`body` + `fontWeight: 600`, ~16) + hairline снизу | hairline между строками | средняя |
| **Запланировано** | нет page-title | hairline между строками | средняя; при пустом экране — только muted-текст по центру |
| **Настройки** | крупный display (`28 / 700`) | hairline вокруг секций | секции с UPPERCASE-лейблами |

Плюс серые линии режут списки и конфликтуют с принципом **визуальной тишины** и правилом «border в MVP нет».

Цель системы: **один визуальный язык** на всех корневых экранах — сдержанный, тёплый, «дорогой», но без чужого брендового акцента и без ломки наших 13 тем (light + dark + 11 пресетов).

---

## 2. Принципы Lichka (нельзя нарушать)

1. **2 цвета темы** — `background` + `text`. Любой UI строится из них и их opacity-тонов. Декоративного brand-accent (как Airbnb Rausch) **нет**.
2. **Темы сохраняются** — light `#FAFAFA/#000`, dark `#000/#FFF`, плюс 11 пресетов. Дизайн должен одинаково хорошо жить на neon-green, parchment и cream.
3. **Тишина статики** — нет серых hairline-разделителей в списках, нет рамок у text-кнопок, нет «карточек ради карточек».
4. **Живость в движении** — премиальность через Reanimated / жесты / haptic, не через цвет и хром.
5. **Скорость задачи** — UI — инструмент быстрой фиксации; иерархия служит сканированию, не украшению.
6. **Иконки точечно** — табы, FAB, 4 действия отправки, системные (назад, поиск). Формы — text.
7. **Один semantic red** — только для unread-badge и destructive; не становится третьим «брендовым» цветом экрана.

Airbnb здесь — **референс ритма и мягкости** (whitespace вместо линий, скромный display, soft radii), не палитры и не типографической «мускулатуры».

---

## 3. Диагноз текущего UI

### 3.1 Несогласованные page headers

- Settings: `28px / 700` — единственный «громкий» заголовок.
- Chats: компактная строка ~16–17 / 600 + search справа.
- Scheduled: заголовка страницы нет → экран ощущается «безымянным».

### 3.2 Hairline-разделители

Используются как основной способ разделить строки:

- `ChatListItem` / `ScheduledItem` — `borderBottomWidth: hairline`, цвет `text + '15'`
- `SettingsScreen` секции — `borderTop` + `borderBottom`
- `ChatListScreen` header, tab bar — верхняя/нижняя линия

На тёмных и цветных темах линии либо слишком яркие, либо «грязные». Пространство и ритм ряда должны разделять элементы **сами**.

### 3.3 Слабая типографическая шкала

`Text` сейчас знает только `body` (16) и `caption` (12). Display, title и section-label задаются локально (`fontSize: 28` в Settings, `17` в ChatHeader) → расхождение неизбежно.

### 3.4 Что уже хорошо

- Монохромная тема-пара и 11 пресетов.
- Круглые аватары, FAB как чёрный/ink круг.
- Иконки-табы без подписей.
- Switch / locale pills на `text`, не на чужом accent.
- Анимации появления строк (`FadeInUp`).

---

## 4. Визуальная идея

> **Тёплый личный журнал на чистом холсте темы.**  
> Контент и воздух несут иерархию; цвет темы — единственный «характер» экрана.  
> Мягкие скругления, скромный display, разделение через whitespace.  
> Никаких чужих бренд-цветов поверх пресетов.

Аналог Airbnb-логики «photography + whitespace > heavy type», но у нас вместо фото — **аватар / текст сообщения / пустое поле ввода**, а «напряжение» экрана даёт **тема** (mint, amber, parchment…), не Rausch.

---

## 5. Цвета

### 5.1 Семантика (тема-зависимая)

| Токен | Формула | Роль |
|-------|---------|------|
| `canvas` | `background` | Пол экрана, header, tab bar |
| `ink` | `text` | Заголовки, основной текст, активные иконки, primary fill (FAB, switch on, locale active) |
| `body` | `text + 'E6'` (~90%) | Длинный running text (если ink слишком тяжёлый) |
| `muted` | `text + '99'` (~60%) | Подписи, meta, неактивный таб, section label |
| `muted-soft` | `text + '60'` (~38%) | Placeholder, disabled, secondary meta |
| `hairline` | **не использовать в списках** | Допустимо точечно: outline у focused input, menu sheet |
| `surface-soft` | `text` @ **6%** | Press tint на строках |
| `surface-strong` | `text` @ 12% | Chip/pill фон, icon orb idle |
| `on-ink` | `background` | Текст/иконка на залитом ink (FAB «+», active locale pill) |
| `scrim` | `#000000` @ 40–50% | Модалки, context menu |

### 5.2 Фиксированные исключения (вне темы)

| Токен | Значение | Где |
|-------|----------|-----|
| `badge` | `#E53935` | Unread count |
| `on-badge` | `#FFFFFF` | Цифра в badge |
| `destructive` | `#C13515` (light) / `#FF6B6B` (dark-ish) | Delete / replace — можно упростить до одного `#E53935` |

**Не вводим** постоянный brand primary вроде `#ff385c`. На light/dark FAB и CTA = `ink` на `on-ink`. На цветных пресетах FAB естественно «светится» цветом текста темы — это фича, не баг.

### 5.3 Пресеты (сохранить как есть)

| id | background | text |
|----|------------|------|
| `light` | `#FAFAFA` | `#000000` |
| `dark` | `#000000` | `#FFFFFF` |
| `green-on-black` | `#000000` | `#39FF14` |
| `amber` | `#000000` | `#FFB000` |
| `cyan` | `#000000` | `#00E5FF` |
| `blue` | `#0D1117` | `#58A6FF` |
| `pink` | `#1A1A2E` | `#E94560` |
| `light-gray` | `#2B2B2B` | `#F5F5F5` |
| `cream` | `#F5F0DC` | `#2C2C2C` |
| `mint` | `#1B4332` | `#95D5B2` |
| `lavender` | `#2D1B4E` | `#E0D4FF` |
| `parchment` | `#3D2B1F` | `#F0EAD6` |
| `white-on-navy` | `#1E3A5F` | `#FFFFFF` |

Итого **13** (2 дефолта + 11 пресетов). Все экраны валидируются минимум на `light`, `dark`, `mint`, `cream`.

---

## 6. Типографика

Системный стек (как сейчас): `-apple-system` / Roboto / `System`. Кастомный Airbnb Cereal **не берём** — лишняя зависимость и конфликт с цветными темами.

### 6.1 Шкала

| Токен | Size | Weight | Line | Letter | Где |
|-------|------|--------|------|--------|-----|
| `display` | 26 | 600 | 32 | −0.2 | Page title на корневых табах |
| `title` | 17 | 600 | 22 | 0 | ChatRoom header, alert title |
| `title-sm` | 16 | 500 | 21 | 0 | Имя чата в списке, settings row |
| `body` | 16 | 400 | 24 | 0 | Сообщения, формы |
| `body-sm` | 14 | 400 | 20 | 0 | Meta, secondary |
| `caption` | 13 | 600 | 16 | 0 | Section label (sentence case) |
| `micro` | 11 | 600 | 13 | 0 | Badge digit |
| `button` | 16 | 500 | 20 | 0 | Text-кнопки |

**Правило:** display скромный (26/600/32, не 28/700). Иерархию несёт воздух и контент, не жирный заголовок. Body-текст — `ink` или ≥ 80% opacity; 60% — только meta.

### 6.2 Единый page header (корневые табы)

Один паттерн для **Чаты / Запланировано / Настройки**:

```
┌─────────────────────────────────────┐
│  Display title          [icon?]     │  ← height 56, gutter 20h, без paddingVertical
│                                     │  ← без borderBottom
│  content…                           │
```

- Title: `typography.display`, цвет `ink`
- Trailing action (поиск и т.п.): `IconButton` 24 glyph в hit area 48×48, цвет `ink`
- Высота зоны **ровно 56** + safe area (Screen)
- При скролле: **без** soft-tint header и **без** появления линии

Scheduled получает такой же заголовок («Запланировано» / «Scheduled»), как Chats и Settings.

---

## 7. Spacing & shape

### 7.1 Spacing (база 4)

| Token | px | Использование |
|-------|-----|---------------|
| `xxs` | 2 | micro gaps |
| `xs` | 4 | icon↔label tight |
| `sm` | 8 | meta row, badge margin, label→first row |
| `md` | 12 | avatar↔title, icon wrap |
| `gutter` | **20** | горизонтальные поля экрана / PageHeader |
| `base` | 16 | legacy / внутренние блоки |
| `lg` | 20 | — |
| `xl` | 24 | — |
| `sectionGap` | **28** | между секциями settings (после последней row → label) |
| `xxl` | 32 | пустые состояния |

### 7.2 List rhythm (вместо hairline)

Измеренные плотности (не blanket 16v — иначе chat row ~80px и сканирование замедляется):

| Row | paddingVertical | notes |
|-----|-----------------|-------|
| Chat | **12** | avatar 48 → ~72 total |
| Scheduled | **14** | icon orb 36 → ~64 total |
| Settings | **12**, minHeight **56** | |

- `paddingHorizontal: gutter (20)`
- **`borderBottomWidth: 0`**
- Press: фон `surfaceSoft` (ink @ 6%); на Android — `android_ripple`. Не opacity fade на строках.

Между секциями Settings: `sectionGap` 28 до label, `sm` 8 от label до первой row. Первая секция после header — только `sm`.

### 7.3 Radii

| Token | px | Где |
|-------|-----|-----|
| `md` | 12 | chips, locale pill, fields |
| `lg` | 16 | dialog / sheet |
| `full` | 9999 | avatar, FAB, icon orb |

Меньше тиров = меньше произвольных решений. Нет `sm: 8` / `xl: 20`, пока компонент явно не потребует.

---

## 8. Elevation

Почти всё — flat.

| Уровень | Когда |
|---------|--------|
| Flat | 95% UI: списки, headers, settings, tab bar, menus, dialogs |
| Soft float | **только FAB** — iOS `{0, 2, 8, opacity 0.16}` / Android `elevation: 3` (платформы раздельно) |
| Scrim | модалки |

Нет лестницы elevation. Dialogs/menus — без тени; глубина = scrim + surface. Depth = тема + движение + скругление.

---

## 9. Компоненты корневых экранов

### 9.1 `PageHeader`

Общий виджет для трёх табов.

| Prop | |
|------|--|
| `title` | string |
| `right` | optional ReactNode (search и т.д.) |

Стили: `display` + `ink`, без border, `canvas` фон.

### 9.2 List rows

**Chat row:** avatar 48 · title `title-sm` · badge справа · padding 16/16 · no divider  
**Scheduled row:** type icon 20 в круге 36 · body `title-sm` · meta row (`muted` chat title + time) · no divider  
**Settings row:** icon 20 · label `body` · trailing control · padding 16/16 · no divider  

### 9.3 Settings sections

- Section label: `caption`, `muted`, sentence case или small caps — **не** агрессивный ALL CAPS с letterSpacing, если хотим мягче; допустим текущий uppercase при `caption` 12–13 / 500–600.
- Секция — просто стек rows на `canvas`, без boxed group с border.
- Между секциями — `spacing.xl`.

### 9.4 FAB

Круг 56, fill `ink`, glyph `on-ink`, позиция bottom-right над tab bar с отступом 16. Одна soft-shadow. Без цветного brand orb.

### 9.5 Tab bar

- Высота как сейчас, иконки 26.
- Active = `ink`, inactive = `muted`.
- **Убрать** `borderTop` hairline; отделение от контента — только смена зоны / опционально очень лёгкий `surface-soft` фон (не обязателен).
- Active indicator: допустим короткий underline / bar над иконкой **цветом `ink`** (уже есть в билде) — это ok, не hairline-разделитель списка.

### 9.6 Controls

| Control | Вид |
|---------|-----|
| Switch on | track `ink` @ 80–100%, thumb `on-ink` или `ink` |
| Switch off | track `text + '20'` |
| Locale pill active | fill `ink`, text `on-ink`, radius `md`/`full` |
| Locale pill idle | transparent + optional 1px `ink` (единственное место, где тонкий stroke оправдан как segmented control) |
| Text button | `button` / `ink`, no border |
| Chevron | `muted` |

### 9.7 Badge

Красный pill `badge` / `on-badge` — единственный цветной акцент в списках. Не темизировать под green/amber (иначе neon-темы сделают badge нечитаемым или «сливающимся»).

### 9.8 Empty states

Центр экрана, `body` или `body-sm` в `muted`. Без иллюстраций в MVP. Под page header — чтобы пустой Scheduled не выглядел «сломанным».

---

## 10. Спека трёх табов (целевое состояние)

### Чаты

1. `PageHeader` — «Чаты» + search  
2. Список без dividers, увеличенный vertical rhythm  
3. FAB `+`  
4. Tab bar без top hairline  

### Запланировано

1. `PageHeader` — «Запланировано» (сейчас отсутствует — добавить)  
2. Список scheduled rows без dividers  
3. Empty: muted текст под тем же header  

### Настройки

1. `PageHeader` / тот же `display` — «Настройки» (**уменьшить с 28/700 → 26/600**, выровнять с остальными)  
2. Секции без border-box  
3. Rows без внутренних линий  
4. Section labels через `muted` + воздух  

---

## 11. Что берём / не берём у Airbnb

| Airbnb | Lichka |
|--------|--------|
| Rausch `#ff385c` primary | ❌ нет; CTA = `ink` |
| Cereal VF | ❌ system font |
| Photo-first cards | ❌ flat list rows |
| Pill search bar | ❌ не нужен на корне; search = icon → overlay |
| Hairline в search segments | ❌ не копируем hairline-культуру |
| Modest display 22–28 / 500–600 | ✅ да |
| Whitespace вместо линий | ✅ да |
| Soft radii, almost no hard corners | ✅ да |
| Single shadow tier | ✅ да |
| Generous but dense marketplace | ✅ адаптируем: воздух в списках, без «журнальной» разреженности |

---

## 12. Анимации (в рамках системы)

Сохранить и унифицировать:

- Появление list rows: `FadeInUp` spring  
- Press: scale / opacity через `AnimatedPressable`  
- Tab switch: существующий pager  
- Shared avatar → chat room  

Не добавлять: parallax, decorative gradients, confetti, цветные glow.

---

## 13. Чеклист внедрения

1. ✅ Расширить `Text` variants: `display | title | title-sm | body | body-sm | caption | micro | button`.
2. ✅ Добавить `PageHeader` в `shared/ui`.
3. ✅ Убрать `borderBottom` у `ChatListItem`, `ScheduledItem`; убрать section borders в Settings; убрать hairline у ChatList header и tab bar.
4. ✅ Выровнять Settings title на `display` через `PageHeader`.
5. ✅ Добавить title на Scheduled.
6. ✅ Semantic tokens (`resolveSemanticColors` + `withAlpha`) в ThemeProvider.
7. ⬜ Прогнать light / dark / mint / cream на устройстве (скриншоты).
8. ⬜ Обновить seamless-chat / GlobalSearch / ChatRoom chrome на те же no-divider правила.
9. ⬜ Date grouping в Scheduled (UX follow-up для сканирования длинных списков).

---

## 14. Критерии готовности

- Три таба: одинаковый page title (размер, вес, отступы).  
- В списках чатов, scheduled и settings **нет** серых горизонтальных линий между пунктами.  
- На любом из 13 пресетов UI читаем, без «грязных» hairline.  
- Нет нового brand-accent; badge остаётся единственным фиксированным red.  
- Статика тихая; движение — как сейчас или лучше.
