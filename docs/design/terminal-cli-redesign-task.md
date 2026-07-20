# Задача: Terminal / CLI редизайн Lichka

**Статус:** implemented  
**Дата:** 2026-07-20  
**North star:** [`DESIGN.md`](../../DESIGN.md)  
**Текущая система:** [`lichka-design-system.md`](./lichka-design-system.md) (terminal contract)  
**Референсы:** [`refs/`](./refs/)

---

## 1. Название

**Terminal-core UI redesign** — перевод визуального языка Lichka с soft-journal / bubble-chat на **CLI / bitchat-like stream**: единый monospace (включая заголовки), сообщения строками, сохранение 2-цветной концепции. Pixel display — later.

---

## 2. Описание проблемы

Текущий UI (и `lichka-design-system.md`) опирается на:

- system sans + скромный «Airbnb» display;
- **пузыри сообщений** (`MessageBubble`) как основная метафора ленты;
- мягкие радиусы и journal-ритм.

Это расходится с желаемым характером продукта:

1. Хочется ощущение **терминала / CLI-сессии** (bitchat, Claude Code), а не ещё одного Telegram-клона.
2. Типографика — **monospace** на всём UI (заголовки + body), RU + EN; pixel — отложен.
3. Сообщения — **новые строки лога**, не блоки-пузыри.
4. Концепция **2 цвета** и 13 тем должны остаться — редизайн формы, не палитры.

Без отдельной задачи редизайн расползётся по экранам и сломает консистентность.

---

## 3. Цель задачи

Утвердить и внедрить единый terminal-язык на всех ключевых поверхностях:

| Поверхность | Целевое состояние |
|-------------|-------------------|
| Page headers (3 таба) | Mono `display` (bold) |
| ChatRoom лента | Message lines (stream), без bubble-метафоры |
| Composer | Prompt-like mono input + 4 send icons |
| Списки (чаты, scheduled, settings) | Flat mono rows, без hairline/cards |
| Темы | Те же 13 пар; `green-on-black` = «родной» look |

---

## 4. Роли

### 4.1 Lead Designer — владелец характера

**Ответственность:**
- утвердить визуальный north star в `DESIGN.md`;
- выбрать / согласовать **один mono font** (display + body) с проверкой кириллицы; pixel — вне scope v1;
- утвердить синтаксис строки сообщения (`[time]`, префиксы типов, edited marker);
- решить: prompt `>` в composer — **да** (закрыто);
- подписать визуальный QA на light / dark / green-on-black / mint / cream;
- отклонять регрессии в «мягкий bubble» или чужой brand-accent.

**Deliverables:**
- [ ] Финальный выбор шрифтов + лицензии в этом документе (§7).
- [ ] Спека Message Line (ASCII + правила wrap) в `DESIGN.md` §7.
- [ ] Moodboard/refs уже в `docs/design/refs/` — актуализировать при смене направления.
- [ ] Sign-off прототипа 3 экранов: Чаты, ChatRoom, Настройки.

### 4.2 UX / UI Architect — владелец системы и сценариев

**Ответственность:**
- разложить редизайн по FSD-слоям и компонентам;
- сохранить продуктовые инварианты (3 таба, 4 send actions, 2 цвета, скорость capture, a11y);
- заменить `MessageBubble` → `MessageLine` напрямую (без flag), сохранив voice/image/scheduled UX;
- обновить токены типографики в `shared` / Theme;
- согласовать spacing/radii под CLI density;
- критерии приёмки и порядок внедрения (без big-bang ломки, если возможно).

**Deliverables:**
- [ ] Карта компонентов до/после (§6).
- [ ] План внедрения по фазам (§8).
- [ ] Обновление `lichka-design-system.md` или пометка superseded после approve.
- [ ] Список рисков и a11y-проверки (§9).

---

## 5. Предлагаемое решение (техническое)

### 5.1 Визуальный контракт

См. `DESIGN.md`. Кратко:

- **2 цвета** без изменений семантики.
- **Display + UI/body** = один monospace с Cyrillic; иерархия size/weight.
- **Messages** = line stream; bubbles уходят как метафора.
- **Composer** = mono prompt-строка.

### 5.2 Слои FSD

| Слой | Изменения |
|------|-----------|
| `shared/config` / theme tokens | Один mono family на всю typography scale |
| `shared/ui` | `Text` variants, возможно `PageHeader` fontFamily; новый `MessageLine` primitive или замена bubble |
| `widgets/message-composer` | Mono input + prefix `>`, без смены 4 actions API |
| `pages/chat-room` | Рендер ленты строками; date separator textual; убрать bubble chrome |
| `pages/*` (tabs) | Display headers на mono bold |
| `features/*` | Точечно: search highlight, edit sheet — под mono / flat |

**Не создаём** отдельный «theme product fork». Один ThemeProvider, новые font tokens.

### 5.3 Сообщения

Заменить визуальную модель:

```
было:  <Bubble surface + radius> text </Bubble>
стало: <Line>[HH:MM:SS]</Line> <Line>text…</Line>   // одна логическая запись
```

- Long press / edit / delete / scroll-to / highlight — сохраняются.
- Voice/image — блоки в колонке лога.
- Scheduled markers — glyph/prefix, не цветной bubble.

### 5.4 Шрифты (загрузка)

- Подключить через существующий способ bundling RN fonts (asset link / `react-native.config`).
- Preload на старте, чтобы не мигал system sans.
- Fallback stack: `mono → system`.

---

## 6. Карта компонентов (Architect)

| Сейчас | Цель | Примечание |
|--------|------|------------|
| `MessageBubble` | `MessageLine` (прямая замена, без flag) | Главный визуальный сдвиг |
| `MessageComposer` | mono + prefix `>` | API 4 actions без изменений |
| `PageHeader` / titles | `fontFamily: mono` + display size/weight | 3 таба |
| `ChatHeader` | mono title | |
| `DateSeparator` | textual mono row | без hairline wings |
| `ChatListItem` / `ScheduledItem` | mono rows | denser CLI rhythm |
| `Text` variants | map to mono scale | shared |

---

## 7. Открытые дизайн-решения (Lead Designer)

| # | Вопрос | Варианты | Решение | Статус |
|---|--------|----------|---------|--------|
| D1 | Pixel font | Nothing / VT323 / Press Start 2P | **Press Start 2P** для `display` (Cyrillic OK) | closed |
| D2 | Mono font | JetBrains Mono / IBM Plex Mono / other | **JetBrains Mono** (OFL, Cyrillic) | closed |
| D3 | Формат timestamp | `[HH:MM:SS]` / `HH:MM` / relative | **`[HH:MM:SS]`** | closed |
| D4 | Маркеры типов | ASCII glyphs vs existing icons | **Bell / AlarmClock / Repeat** (как Scheduled) | closed |
| D5 | Prompt `>` в composer | yes / no | **yes** | closed |
| D6 | Миграция bubble | feature flag / gradual / replace | **`MessageLine` replace, no flag** | closed |

---

## 8. План внедрения (фазы)

### Фаза 0 — Approve языка
- Review `DESIGN.md` + этот файл с Lead Designer и UX/UI Architect.
- Закрыть D1–D6 минимум до interim-решений.
- **Статус фазы:** draft → pending review.

### Фаза 1 — Foundation (shared)
- Подключить шрифты.
- Расширить typography tokens.
- `Text` / `PageHeader` на новые family.
- Прогон тем light/dark/green-on-black.

### Фаза 2 — Chat stream
- `MessageLine` вместо `MessageBubble` в ChatRoom (без dual-mode).
- Date separator textual.
- Composer: mono + `>`.
- Highlight / scroll-to без bubble.

### Фаза 3 — Root surfaces
- Chat list, Scheduled, Settings под единый mono.
- FAB/tab bar без регрессий 2-color.

### Фаза 4 — Polish & docs
- Обновить `lichka-design-system.md` под terminal-контракт.
- Скриншоты 5 тем.
- A11y TalkBack на типах сообщений.
- Отчёт + коммиты по Conventional Commits.

---

## 9. Влияние на архитектуру

- Зависимости FSD **вниз** без циклов — соблюдаем.
- Новых верхнеуровневых слайсов не требуется; возможна фича-обёртка только если нужен flag миграции (`features/terminal-chat` — опционально, не обязательно).
- Данные / SQLite / навигация **не меняются**.
- Спека продукта («Telegram с собой» по модели данных) сохраняется; меняется **presentation**.

---

## 10. Альтернативы

| Альтернатива | Плюс | Минус | Вердикт |
|--------------|------|-------|---------|
| A. Оставить bubbles + только mono/pixel headers | Меньше работы | Характер «терминала» слабый | ❌ недостаточно |
| B. Полный terminal stream (этот план) | Цельный язык, совпадает с рефами | Больше UI-миграции | ✅ выбран |
| C. Отдельный «Terminal theme» toggle / feature flag | Безопасно для скептиков | Два UI-языка, поддержка×2 | ❌ |
| D. Только green-on-black CRT skin | Быстрый вау-эффект | Ломает 13 тем / 2-color систему | ❌ |

---

## 11. Оценка сложности

| Область | Оценка | Риск |
|---------|--------|------|
| Шрифты + tokens | S | Один mono: Cyrillic, лицензия, bundle size |
| MessageLine миграция | M–L | voice/image/edit/highlight edge cases |
| Composer / lists / settings | M | регрессии плотности и hit targets |
| Docs + QA тем | S | — |

**Суммарно:** ~1–2 итерации дизайна + 1–2 инженерных цикла на полный проход.  
**Главный риск:** mono без полной кириллицы / плохой hinting на RU → читаемость заголовков и ленты.

---

## 12. Критерии приёмки

### Lead Designer
- [ ] Характер «личный терминал» читается на ChatRoom без пояснений.
- [ ] Единый mono (headers + body) согласован; RU/EN ок.
- [ ] Нет bubble-метафоры в ленте.
- [ ] 2 цвета и пресеты не деградировали.

### UX / UI Architect
- [ ] 3 таба / 4 send actions / navigation flows без регрессий.
- [ ] Voice, image, scheduled, edit, search→scroll работают в line-layout.
- [ ] Touch targets composer сохранены.
- [ ] TalkBack объявляет тип сообщения.
- [ ] Токены и FSD boundaries чистые; DS-документ обновлён.

### Общее
- [ ] Скриншоты: light, dark, green-on-black, mint, cream.
- [ ] Отчёт в `docs/reports/`.

---

## 13. Workflow

1. **draft** (сейчас) → обсуждение Lead Designer + UX/UI Architect.
2. **approved** — закрыты D1–D6, фазы 1–4 согласованы.
3. Реализация по фазам + атомарные коммиты.
4. **implemented** — критерии §12, DS обновлён, `DESIGN.md` = source of truth.

---

## 14. Статус

**implemented** — фазы 1–4 в коде; device QA скриншотов 5 тем — follow-up.
