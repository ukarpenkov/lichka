# Lichka — DESIGN.md

**Статус:** implemented · visual north star  
**Дата:** 2026-07-20  
**Связанные документы:**
- Задача редизайна: [`docs/design/terminal-cli-redesign-task.md`](docs/design/terminal-cli-redesign-task.md)
- Design system (terminal): [`docs/design/lichka-design-system.md`](docs/design/lichka-design-system.md)
- Контракт продукта: [`docs/spec/white-requirements.md`](docs/spec/white-requirements.md)

> Этот файл — **целевой визуальный язык** Lichka: terminal / CLI, а не «ещё один мессенджер с пузырями».  
> Принцип **2 цвета** (`background` + `text` + opacity-тоны) **сохраняется**. Меняется форма, типографика и ритм ленты.

---

## 1. Визуальная идея (одна фраза)

> **Личный терминал мыслей.**  
> Экран читается как сессия CLI или лог bitchat: плоский холст темы, строка за строкой, без пузырей.  
> Характер экрана даёт **пара цветов темы** (в т.ч. green-on-black) и **типографика** — не декоративный хром.

Референсы формы (не копия бренда):
- **bitchat** — line-based chat, mono, 2-color terminal feel  
- **Claude Code / CLI tools** — информационная плотность, prompt-строка, спокойная иерархия  
- **Nothing OS** — опциональный later-референс для pixel display (v1 не используем)

Референс-скрины: [`docs/design/refs/`](docs/design/refs/)

| Файл | Что смотреть |
|------|----------------|
| `bitchat-dark-features.png` | Dark terminal: ink on black, list без карточек |
| `bitchat-light-chat.png` | Light chat: `[time] <@user> text`, composer как prompt |
| `bitchat-dark-about.png` | Секции ALL CAPS + mono body |
| `nothing-dot-matrix-alphabet.png` | Пиксельный / dot-matrix алфавит для display |

---

## 2. Роли и ответственность за язык

### Lead Designer

Владеет **характером продукта**:
- формулирует north star («личный терминал», не soft journal);
- утверждает типографику (единый mono; pixel — later);
- решает, что **не** входит в язык (bubbles, soft cards, Airbnb-ритм как цель);
- следит, чтобы 13 тем оставались читаемыми на одном UI-контракте.

### UX / UI Architect

Владеет **системой и сценариями**:
- переводит характер в токены, компоненты, FSD-слои;
- проектирует ленту сообщений как **stream строк**, не bubble-layout;
- сохраняет продуктовые инварианты: 3 таба, 4 действия отправки, 2 цвета, offline-first, скорость capture;
- планирует миграцию от текущего UI без ломки данных и навигации.

---

## 3. Неизменные продуктовые инварианты

Из `white-requirements` — **не трогаем** смыслом редизайна:

1. **2 цвета темы** — `background` + `text`; UI из них и opacity. Нет brand-accent.
2. **13 тем** — light / dark + 11 пресетов (включая `green-on-black` как «родной» terminal look).
3. **3 таба** — Чаты / Запланировано / Настройки.
4. **4 иконки отправки** в composer (simple / reminder / alarm / periodic).
5. **Тишина статики** — нет серых hairline «ради разделения»; воздух и ритм строк.
6. **Один semantic red** — unread badge + destructive.
7. **Скорость задачи** — UI = инструмент быстрой фиксации.

Редизайн меняет **как выглядит** журнал, не **что он умеет**.

---

## 4. Что берём / не берём у референсов

| Источник | Берём | Не берём |
|----------|--------|----------|
| bitchat | Line-by-line сообщения; mono; prompt-composer; 2-color; плоские списки | Чужой бренд, mesh/P2P метафоры, чужие handle `@user` как обязательный паттерн |
| Claude CLI | Плотность, спокойная mono-иерархия, ощущение «сессии» | Сырой ASCII-art ради стиля, шумные баннеры |
| Nothing | Референс на будущее (pixel display) | Не в v1 — нет Cyrillic-ready выбора |
| Текущий Lichka DS | Semantic tokens, 2-color, page rhythm, no list hairlines | Soft «Airbnb» display, bubble-сообщения как целевая форма |

---

## 5. Цвета

Семантика **та же**, что в текущей системе — меняется только «характер» поверхностей (более flat / terminal).

| Токен | Формула | Роль в terminal-языке |
|-------|---------|------------------------|
| `canvas` | `background` | Пол экрана, header, tab bar, composer |
| `ink` | `text` | Заголовки, активные иконки, primary fill |
| `body` | `text` @ ~90% | Текст сообщений |
| `muted` | `text` @ ~60% | Timestamp, meta, неактивный таб |
| `muted-soft` | `text` @ ~38% | Placeholder, disabled |
| `surface-soft` | `text` @ 6% | Press / highlight строки |
| `surface-strong` | `text` @ 12% | Chip, idle icon orb |
| `on-ink` | `background` | Glyph на FAB / active pill |
| `scrim` | `#000` @ 40–50% | Модалки |

**Правило терминала:** на пресете `green-on-black` UI должен выглядеть «как задумано» без спец-кейсов. Остальные 12 тем — тот же контракт, другой «phosphor».

Фиксированные исключения без изменений: `badge` / `destructive` red.

---

## 6. Типографика

**Решение (2026-07-20, обновлено):**  
- **Display (page titles):** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) — pixel, **кириллица OK**.  
- **UI / body / chat:** JetBrains Mono.  
- ~~VT323~~ отклонён: нет кириллицы.

### 6.1 Шкала

| Токен | Size | Face | Где |
|-------|------|------|-----|
| `display` | 18 | Press Start 2P | Page titles, chat header, ThemePicker |
| `title` | 17 | JetBrains SemiBold | Secondary titles (если не display) |
| `title-sm` | 15–16 | JetBrains Medium | Имя чата в списке, settings row |
| `body` | 15–16 | JetBrains Regular | Текст сообщений, формы |
| `body-sm` | 13–14 | JetBrains Regular | Meta secondary |
| `mono-meta` | 12–13 | JetBrains Regular | Timestamp в ленте `[HH:MM:SS]` |
| `caption` | 12–13 | JetBrains SemiBold | Section label (ALL CAPS) |
| `micro` | 11 | JetBrains SemiBold | Badge digit |
| `button` | 15–16 | JetBrains Medium | Text-кнопки |

### 6.2 Иерархия на экране

```
display (Press Start 2P) →  «Чаты» / имя чата / «Тема оформления»
body (JetBrains)         →  текст сообщения
mono-meta                →  [10:39:21]  и прочая meta
```

**Не используем:** Inter / Roboto / SF Pro как целевой UI (только emergency fallback).

---

## 7. Сообщения: stream строк, не bubbles

### 7.1 Целевая форма

Каждое сообщение — **новая строка (или блок строк) в логе**, без скруглённого пузыря как контейнера смысла.

**Базовый паттерн:**

```
[10:39:21]  текст сообщения…
[10:40:02]  ещё одна мысль
[10:41:15]  🔔  созвон в 18:00
[10:42:00]  ⏰  подъём
[10:43:00]  ↻  полить цветы
```

(в UI — не emoji, а те же Lucide/custom icons, что уже в приложении)

**Маркер типа — существующие иконки** (решение 2026-07-20):

| Тип | Иконка (как сейчас) | В строке лога |
|-----|---------------------|---------------|
| `simple` | — | без иконки |
| `reminder` | `Bell` | иконка слева от текста (цвет `ink` / `muted`) |
| `alarm` | `AlarmClockIcon` | то же |
| `periodic` | `Repeat` | то же |
| edited | — | muted-суффикс `(изм.)` или `*` после текста |

ASCII-префиксы (`!` `▲` `~`) **не используем** — путают и дублируют уже знакомые glyphs из composer / Scheduled.

Раскладка строки:

```
[HH:MM:SS]  [icon?]  text…
            └ mono-meta / muted
```

TalkBack: иконка + accessibility label типа («напоминание», «будильник», …), не полагаться только на визуал.

### 7.2 Правила раскладки

- **Нет** `MessageBubble` как визуальной метафоры (заливка + radius как «облако»).
- Допустима лёгкая `surface-soft` подложка **только** для highlight / selection / scroll-to-message — не как постоянный bubble.
- Timestamp — `muted`, mono tabular, слева или в одной строке с текстом.
- Многострочный текст — продолжение с indent под колонку текста (как wrap в терминале), не новый «пузырь».
- Voice / image — inline блоки в той же колонке лога (waveform / thumbnail), без Telegram-style media bubble chrome.
- Date separators — текстовая строка (`── 20 июл 2026 ──` или `## 20 Jul`) в `muted`, **без** hairline-крыльев.

### 7.3 Composer = prompt

```
┌─────────────────────────────────────────────┐
│  лента лога…                                │
│─────────────────────────────────────────────│
│  >  _                    [mic] [4 actions]  │
└─────────────────────────────────────────────┘
```

- Разделитель composer ↔ лента: одна тонкая линия `ink` @ низкой opacity **или** только смена зоны (предпочтительно без линии, если ритм читается).
- Поле ввода — mono, placeholder muted.
- **Prompt-prefix `>` обязателен** (цвет `ink` или `muted`) — слева от TextInput, не редактируемый.
- 4 действия отправки остаются **иконками** (инвариант продукта).

### 7.4 Компонент ленты

`MessageBubble` **заменяется** на `MessageLine` — прямая замена в ChatRoom, без feature flag и без dual-режима «bubble | line». Один визуальный язык: строка лога.

---

## 8. Экраны (целевой характер)

### 8.1 Корневые табы

| Экран | Header | Контент |
|-------|--------|---------|
| Чаты | mono `display` + search | Список: avatar + mono title + muted preview; **без** dividers |
| Запланировано | mono `display` | Строки лога/списка: тип-glyph + text + time; без cards |
| Настройки | mono `display` | Section labels caps muted; rows без border-box |

FAB «+» — круг `ink` / `on-ink` (сохраняем), без цветного brand orb.

### 8.2 Chat room

- Header: mono title + back; без тяжёлого chrome.
- Лента: stream строк (§7).
- Composer: prompt (§7.3).

### 8.3 Списки

Whitespace и вертикальный ритм вместо hairline. Press = `surface-soft`. Плотность ближе к CLI (информативно), без «журнальной» разреженности Airbnb-эпохи DS.

---

## 9. Shape, elevation, motion

| Тема | Решение |
|------|---------|
| Radii | Минимальные: chips/fields ~8–12; **сообщения — 0 или почти 0**; avatar/FAB `full` |
| Elevation | Flat 95%; soft shadow только FAB |
| Borders | По умолчанию нет; точечно outline focused input |
| Motion | Сохранить Reanimated: появление строк, press, tab pager; **без** glow/scanline/Matrix-эффектов |

Terminal-характер = типографика + раскладка строк, не «CRT-фильтр».

---

## 10. Иконки

- Табы, FAB, 4 send-actions, system (back, search, mic) — как сейчас по смыслу.
- Outline / monochrome = `ink` / `muted`.
- Не вводим цветные illustrative icons.
- В about/settings lists допустимы простые line icons слева от mono title (bitchat-like), все цветом `ink`.

---

## 11. Связь с текущим `lichka-design-system.md`

| | Soft DS (сейчас) | Terminal DESIGN (цель) |
|--|------------------|-------------------------|
| Метафора | Тёплый личный журнал | Личный терминал / CLI-лог |
| Display | System 26/600 | Monospace bold (pixel — later) |
| Body | System sans | Monospace RU+EN |
| Сообщения | Bubbles | Line stream |
| Ритм | Airbnb whitespace | CLI density + воздух без линий |
| 2 цвета / 13 тем | ✅ | ✅ сохраняем |

После approve редизайна этот `DESIGN.md` становится north star; `lichka-design-system.md` обновляется или помечается superseded для UI-контракта.

---

## 12. Критерии готовности языка

- [x] Заголовки корневых табов — mono `display` (size/weight), не system sans.
- [x] Body / сообщения / meta — тот же monospace с корректной кириллицей.
- [x] В ChatRoom нет bubble-метафоры; лента читается как лог строк.
- [x] Composer ощущается как prompt-строка, 4 send-actions на месте.
- [ ] Все 13 тем читаемы; `green-on-black` выглядит «родным» (device QA).
- [x] Нет нового brand-accent; badge red единственный фиксированный цветной акцент.
- [x] Lead Designer + UX/UI Architect подписали прототип ключевых экранов (Чаты, ChatRoom, Settings) — через `DESIGN.md` + внедрение.

---

## 13. Открытые решения (до внедрения)

1. ~~Pixel font~~ → **Press Start 2P** для `display` (кириллица OK). VT323 отклонён (Latin-only).
2. ~~Конкретный mono font~~ → **JetBrains Mono** (OFL, Cyrillic OK) для UI/body.
3. ~~Префиксы типов~~ → **существующие иконки** (`Bell` / `AlarmClock` / `Repeat`); simple без иконки.
4. ~~Prompt `>`~~ → **да**, слева от поля ввода.
5. ~~Миграция bubble~~ → **`MessageLine` напрямую**, без bubble и без feature flag.
6. ~~Формат timestamp~~ → **`[HH:MM:SS]`**.

Решения фиксируются в [`docs/design/terminal-cli-redesign-task.md`](docs/design/terminal-cli-redesign-task.md).
