# Neo-brutal AlertDialog

**Статус:** implemented

## Название фичи

`neobrutal-alert-dialog` — редизайн всплывающих окон предупреждения / подтверждения (`AlertDialog`) в neo-brutal стиле: двухцветная палитра темы + hard offset «3D»-тень, кнопки как у прототипа Uiverse (`.button-confirm`).

## Описание проблемы

Все confirm/warning в приложении идут через единый [`AlertDialog`](../../src/shared/ui/AlertDialog.tsx): удалить чат/сообщение/scheduled, отмена, согласие, ошибки импорта, permissions и т.д.

Текущий визуал — soft iOS-like card:

| Параметр | Сейчас | Конфликт с языком Lichka |
|----------|--------|---------------------------|
| Радиус | `14` | Pixel / terminal UI — малые радиусы |
| Тень | blur `#000`, opacity `0.3`, radius `16`, `elevation: 8` | Soft Material, не hard «3D» |
| Кнопки | hairline-ряд снизу (iOS Alert) | Не отделяемые neo-brutal chips |
| Цвета | фон темы + ink/muted/destructive текст | Нет жёсткой 2px-обводки и offset-тени цветом темы |

Lichka строится на **двухцветных** пресетах (`background` ↔ `text`) и pixel/terminal эстетике. Soft-card выбивается из этого языка.

Запрос: окна предупреждения в стиле прототипа (см. appendix) — важны **не размеры и не signup-копирайт**, а **два цвета темы** и **эффект 3D hard shadow**. Анимацию появления окна **сохранить**.

## Product / stability locks

Visual-only MVP. Не менять runtime-контракт и timing, от которых зависят nested dialogs и Modal-in-Modal.

| Тема | Решение (зафиксировано) | Почему |
|------|-------------------------|--------|
| API / поведение | Без изменений: `visible/title/message/buttons/onClose`, `onPress` → затем `onClose`, backdrop dismiss, Android back | Settings nested dialogs (`setTimeout(300)`), ChatForm Modal-in-Modal, MessageComposer |
| Enter-анимация | Без изменений: `Modal animationType="fade"`, `FadeIn(200)`, `ZoomIn.springify…` | Nested timing и UX «как сейчас» |
| Radius | `radii.sm` (**8**), не новый 5–6 | Не плодить one-off радиусы против DS |
| ≥3 кнопки | **Вертикальный столбец** (не wrap/горизонталь) | Import/restore в Settings: 3 chips + hard shadow в 280px ломают hit-area |
| HardShadowBox | **Не** выносить в MVP — только локально в `AlertDialog` | Меньше surface area |
| Backdrop | `colors.scrim` вместо `rgba(0,0,0,0.5)` | Уже есть в теме |
| Токены | `hardShadowOffset: 4`, `hardBorderWidth: 2` в [`tokens.ts`](../../src/shared/config/tokens.ts) | Один источник magic numbers |
| Scope | Только `AlertDialog`; menus / ChatForm / pickers — out of scope | Не расползаться |

## Анализ прототипа (senior FE / Android / design)

Источник: [Uiverse.io — andrew-demchenk0](https://uiverse.io) (signup form). Берём **визуальный ДНК**, не layout формы.

### Что переносим

| Принцип | В прототипе | Для Lichka |
|---------|-------------|------------|
| Двухцветность | `--main-color` / `--bg-color` | `text` ↔ `background` текущей темы (`useTheme()`) |
| 3D hard shadow | `box-shadow: 4px 4px var(--main-color)` | offset-тень цветом `ink`/`text`, **без** soft blur |
| Обводка | `border: 2px solid var(--main-color)` | `hardBorderWidth` solid цвета `text` |
| Радиус | `5px` | `radii.sm` (8), не `14` |
| Кнопка | `.button-confirm` | отдельные кнопки того же языка |
| Press | `:active` → `translate(3px, 3px)` + shadow → `0` | `Pressable` + смещение / скрытие offset |

### Что не переносим

- Поля Email / Password
- OAuth-кружки (Apple / Google / Facebook)
- Фиксированные web-размеры (`250×40`, `width: 120`)
- Фон формы `lightgrey` и хардкод `#323232` / `#2d8cf0`
- Копирайт «Welcome / sign up» и иконки соцсетей

### Android / React Native

RN `shadow*` / `elevation` дают **мягкую** тень, не hard offset как CSS `box-shadow: 4px 4px color`.

**Техника:** слой-«подложка» (второй `View`) того же размера, сдвинутый на `(offset, offset)`, залитый цветом `text`; поверх — карточка с `borderWidth: hardBorderWidth`, `borderColor: text`, `backgroundColor: background`. На press кнопки: `translateX/Y` ≈ 3 и скрытие/схлопывание подложки (аналог `:active`). Min padding кнопок (~12–14) сохранять для hit-area на Android.

Цвета **только** из темы; `colors.destructive` — для destructive-действий (текст и бордер), не для тени карточки.

### Design lead

- Карточка и кнопки читаются как один язык: border + hard shadow + duotone.
- Иерархия: title (ink, жирный) → message (muted) → ряд/стек отдельных кнопок.
- Destructive не ломает duotone: красный акцент на тексте/бордере кнопки, тень кнопки остаётся цветом `text`.
- Анимация входа (`FadeIn` backdrop + `ZoomIn.springify()`) — «появление окна»; neo-brutal — «как окно нарисовано».

## Предлагаемое решение

### Scope

**In scope**

- Визуал [`AlertDialog`](../../src/shared/ui/AlertDialog.tsx): карточка + action-кнопки
- Все сценарии через этот компонент (delete / cancel / agree / errors / restore / permissions)
- Сохранение публичного API:

```ts
visible, title?, message?, buttons?: AlertButton[], onClose
AlertButton.style?: 'default' | 'cancel' | 'destructive'
```

**Out of scope (MVP)**

- Context menus (`ChatContextMenu`, `MessageContextMenu`) — отдельная задача при необходимости
- Bottom sheet `ChatForm`, pickers, `ImageViewer`, full-screen alarm
- Смена enter-анимации Modal / Reanimated
- Вынос `HardShadowBox` в shared helper

### Визуальный spec

**Карточка**

| Токен | Значение |
|-------|----------|
| Fill | `background` |
| Border | `hardBorderWidth` solid `text` |
| Hard shadow | offset `hardShadowOffset` (4), цвет `text` (слой-подложка) |
| Radius | `radii.sm` (8) |
| Padding | ~20 (как сейчас) |
| Width | ориентир ~280 (как сейчас) |

**Типографика**

- Title: ink, center (parity с текущими текстами)
- Message: muted / body-sm, center

**Кнопки (как `.button-confirm`)**

- Отдельные neo-brutal chips: fill `background`, border `hardBorderWidth` solid, hard shadow цветом `text`
- Не hairline-ряд iOS: gap между кнопками, без `borderTop` divider
- Layout: при 1–2 кнопках — горизонтальный ряд; при ≥3 — **вертикальный столбец**
- Press: смещение ~3px + shadow → 0; min padding ~12–14
- Варианты стиля:
  - `default` — текст `ink`, border `text`
  - `cancel` — текст `muted`, border `text`
  - `destructive` — текст и border `colors.destructive`, shadow по-прежнему `text`

**Анимация**

- Backdrop: `FadeIn.duration(200)` — без изменений
- Card: `ZoomIn.duration(200).springify().damping(18).stiffness(220)` — без изменений
- Soft `shadow*` / `elevation` с карточки убрать (заменены hard offset)

### Техническая реализация

1. Перерисовать стили в `AlertDialog.tsx` (карточка + кнопки); hard-shadow стек локально.
2. Вынести `hardShadowOffset: 4`, `hardBorderWidth: 2` в [`tokens.ts`](../../src/shared/config/tokens.ts).
3. Call-sites **не менять** (state → `<AlertDialog … />` остаётся).
4. Backdrop: `colors.scrim`.

## Влияние на архитектуру (FSD)

| Слой | Изменение |
|------|-----------|
| `shared/ui` | Редизайн `AlertDialog.tsx`; экспорт API без изменений |
| `shared/config` | Токены `hardShadowOffset` / `hardBorderWidth` |
| `pages` / `widgets` / `features` | Без смены контракта; визуал подтянется автоматически |

Зависимости только вниз: изменений в entities / features API нет.

## Альтернативы

| Вариант | Решение |
|---------|---------|
| Оставить soft iOS card | Отклонено — не совпадает с duotone / pixel |
| Применить neo-brutal ко всем Modal сразу (menus, ChatForm, pickers) | Отложено — отдельный scope; MVP = только warning/confirm |
| Системный `Alert.alert` | Отклонено — уже заменён кастомным; нет контроля стиля |
| Только border без offset-тени | Отклонено — теряется ключевой «3D» из прототипа |
| Горизонтальный ряд / wrap при ≥3 кнопках | Отклонено — hit-area и overflow в Settings |

## Оценка сложности

| | |
|--|--|
| Время | ~0.5–1 день (UI + смоки на 2–3 темах light/dark) |
| Риски | Контраст на крайних пресетах (cream / parchment / green-on-black); hit-area кнопок при translate press на Android; ≥3 кнопки в Settings — вертикальный layout |
| Тесты | Существующие моки `AlertDialog` не ломаются; assert токенов; ручной checklist delete/cancel/destructive |

## Критерии приёмки

- [x] Карточка: 2px border цветом темы + hard offset shadow цветом темы (не soft blur)
- [x] Кнопки визуально как `.button-confirm` (border + hard shadow + press translate)
- [x] `default` / `cancel` / `destructive` различимы; destructive использует `colors.destructive`
- [x] Enter-анимация окна без изменений (`FadeIn` + `ZoomIn.springify`)
- [x] API `AlertDialog` / `AlertButton` без breaking changes
- [x] При ≥3 кнопках — вертикальный столбец
- [ ] На ≥3 theme presets (светлый, тёмный, цветной) текст и кнопки читаемы
- [ ] Сценарии: удалить чат, удалить сообщение, cancel, confirm restore/import, error dialog

## Workflow

1. Proposal → обсуждение → `approved`
2. Реализация в `shared/ui/AlertDialog` (+ токены)
3. Ручной проход критериев + тесты
4. Коммит / отчёт — только по явному запросу

---

## Appendix: прототип (референс ДНК)

HTML (структура формы — **не** копировать в UI диалога):

```html
<!-- From Uiverse.io by andrew-demchenk0 -->
<form class="form">
  <div class="title">Welcome,<br><span>sign up to continue</span></div>
  <input type="email" placeholder="Email" name="email" class="input">
  <input type="password" placeholder="Password" name="password" class="input">
  <div class="login-with">…</div>
  <button class="button-confirm">Let`s go →</button>
</form>
```

CSS (ключевые правила для переноса):

```css
/* From Uiverse.io by andrew-demchenk0 */
.form {
  --font-color: #323232;
  --font-color-sub: #666;
  --bg-color: #fff;
  --main-color: #323232;
  padding: 20px;
  background: lightgrey;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  box-shadow: 4px 4px var(--main-color);
}

.button-confirm {
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-weight: 600;
  color: var(--font-color);
  cursor: pointer;
}

.button-confirm:active {
  box-shadow: 0px 0px var(--main-color);
  transform: translate(3px, 3px);
}
```

Маппинг в тему Lichka: `--main-color` → `text`, `--bg-color` → `background`, `--font-color` → `ink`/`text`, `--font-color-sub` → `muted`.
