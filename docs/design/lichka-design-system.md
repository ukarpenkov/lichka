# Lichka — Design System

**Статус:** implemented (terminal / CLI) · source of truth для UI  
**Дата:** 2026-07-20  
**North star:** [`DESIGN.md`](../../DESIGN.md)  
**Задача:** [`terminal-cli-redesign-task.md`](./terminal-cli-redesign-task.md)

> Soft-journal / Airbnb-ритм **superseded**. Текущий контракт — **личный терминал**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) для page titles (с кириллицей) + JetBrains Mono для UI/ленты, stream строк вместо bubbles, 2 цвета темы без изменений.

> **Контракт реализации:** gutter **20**, header **56**, CLI-density rows, radii **none / sm(8) / md(12) / lg(16) / full**, press = `surfaceSoft` (ink @ 6%). Токены в `src/shared/config/tokens.ts`.

---

## 1. Визуальная идея

> **Личный терминал мыслей.**  
> Экран читается как CLI-сессия / лог: плоский холст темы, строка за строкой, без пузырей.  
> Характер дают **пара цветов темы**, **Press Start 2P** на заголовках табов и **JetBrains Mono** в UI.

---

## 2. Принципы (нельзя нарушать)

1. **2 цвета темы** — `background` + `text` + opacity. Нет brand-accent.
2. **13 тем** — light / dark + 11 пресетов; `green-on-black` = «родной» terminal look.
3. **Тишина статики** — нет hairline в списках; воздух и ритм строк.
4. **Живость в движении** — Reanimated / gestures / haptic.
5. **Скорость задачи** — UI = инструмент быстрой фиксации.
6. **Один semantic red** — unread badge + destructive.
7. **3 таба / 4 send-actions** — продуктовые инварианты.

---

## 3. Типографика

**Display:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (OFL) — pixel, screen titles (табы, чат, ThemePicker); **кириллица есть**.  
**UI / body:** JetBrains Mono (OFL) — Regular / Medium / SemiBold / Bold.  
Файлы: `assets/fonts/` + `android/app/src/main/assets/fonts/`.

> Press Start 2P очень широкий: `display` = **18 / 28**, чтобы «Запланировано» помещалось в header 56.

| Токен | Size | Face | Где |
|-------|------|------|-----|
| `display` | 18 | Press Start 2P | Page titles, ChatHeader, ThemePicker |
| `title` | 17 | JetBrains SemiBold | Secondary titles |
| `title-sm` | 15 | JetBrains Medium | Chat list / settings row |
| `body` | 16 | JetBrains Regular | Сообщения, формы |
| `body-sm` | 13 | JetBrains Regular | Meta secondary |
| `mono-meta` | 12 | JetBrains Regular | Timestamp `[HH:MM:SS]`, date sep |
| `caption` | 12 | JetBrains SemiBold + tracking | Section labels (ALL CAPS) |
| `micro` | 11 | JetBrains SemiBold | Badge digit |
| `button` | 15 | JetBrains Medium | Text-кнопки |

Иерархия: **две гарнитуры** (pixel display + mono UI), дальше size/weight.

---

## 4. Цвета

Семантика без изменений (`resolveSemanticColors`):

| Токен | Формула |
|-------|---------|
| `canvas` | background |
| `ink` | text |
| `body` | text @ 90% |
| `muted` | text @ 60% |
| `muted-soft` | text @ 38% |
| `surface-soft` | text @ 6% |
| `surface-strong` | text @ 12% |
| `on-ink` | background |
| badge / destructive | fixed red |

---

## 5. Сообщения = stream строк

Компонент: `MessageLine` (заменил `MessageBubble`).

```
[10:39:21]  текст…
[10:40:02]  🔔  напоминание
```

- Timestamp: `[HH:MM:SS]`, `mono-meta` / muted.
- Типы: иконки Bell / AlarmClock / Repeat (как composer / Scheduled); simple без иконки.
- Edited: muted-суффикс `(изм.)` / `(edited)`.
- Highlight / press: `surface-soft`, не постоянный bubble fill.
- Date separator: `── 20 июл 2026 ──` textual mono.

### Composer = prompt

```
>  _                         [mic] [4 actions]
```

Prefix `>` обязателен. Mono input. 4 send icons без смены API.

---

## 6. Spacing & shape

| Token | px |
|-------|-----|
| gutter | 20 |
| list chat/scheduled padV | 10 |
| settings minHeight | 52 |
| radii.none | 0 (messages) |
| radii.sm | 8 (fields) |
| radii.md / lg / full | 12 / 16 / 9999 |

---

## 7. Компоненты

| Компонент | Контракт |
|-----------|----------|
| `PageHeader` | pixel `display`, height 56 |
| `ChatHeader` | pixel `display` |
| `MessageLine` | log row |
| `MessageComposer` | `>` + mono |
| `Text` | все variants → JetBrains Mono |
| FAB / tabs | ink / muted; без brand orb |

---

## 8. Критерии готовности

- [x] Headers / body / meta — JetBrains Mono
- [x] ChatRoom без bubble-метафоры
- [x] Composer prompt `>`
- [x] 2 цвета / 13 тем без нового accent
- [ ] Device QA скриншоты light / dark / green-on-black / mint / cream
