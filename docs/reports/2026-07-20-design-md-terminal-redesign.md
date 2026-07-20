# DESIGN.md + задача terminal-редизайна

**Дата:** 2026-07-20  
**Промпт/задача:** Создать DESIGN.md в духе bitchat/CLI (Claude), pixel-заголовки (Nothing), monospace RU/EN, сообщения строками не пузырями, сохранить 2 цвета; задача в `docs/design` с ролями Lead Designer и UX/UI Architect.

## Что сделано
- Создан корневой [`DESIGN.md`](../../DESIGN.md) — north star визуального языка «личный терминал».
- Создана задача редизайна [`docs/design/terminal-cli-redesign-task.md`](../design/terminal-cli-redesign-task.md) с ролями, фазами, критериями приёмки.
- В [`docs/design/refs/`](../design/refs/) скопированы референс-скрины bitchat (dark/light) и Nothing dot-matrix alphabet.

## Изменённые файлы
- `DESIGN.md` — новый документ визуального языка (draft).
- `docs/design/terminal-cli-redesign-task.md` — задача редизайна (draft).
- `docs/design/refs/bitchat-dark-features.png` — референс.
- `docs/design/refs/bitchat-light-chat.png` — референс line-chat.
- `docs/design/refs/bitchat-dark-about.png` — референс about/list.
- `docs/design/refs/nothing-dot-matrix-alphabet.png` — референс pixel display.
- `docs/reports/2026-07-20-design-md-terminal-redesign.md` — этот отчёт.

## Принятые решения
- Имя файла: `DESIGN.md` (не `DESING.MD`).
- 2-цветная система и 13 тем сохраняются; меняются типографика и форма ленты.
- Сообщения → stream строк (bitchat/CLI), не Telegram bubbles.
- **Типографика v1: единый monospace** (заголовки + body); pixel/Nothing — отложено (D1 closed).
- Маркеры типов: иконки Bell / AlarmClock / Repeat.
- Composer: prompt `>` обязателен.
- Лента: `MessageLine` напрямую, без bubble / feature flag.
- Текущий `lichka-design-system.md` пока не superseded — миграция после approve задачи.

## Известные ограничения
- Конкретный mono font ещё не выбран — open D2 (JetBrains / Plex / …).
- Код UI не менялся — только документация и рефы.
- Формат timestamp (D3) ещё open.

## Тестирование
- Не применимо (docs-only). Следующий шаг — review `DESIGN.md` + закрытие open decisions в задаче.
