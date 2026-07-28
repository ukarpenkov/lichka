# Разбиение задачи «Заглянуть в будущее чата» на промты

**Источник требований:** `docs/features/chat-future-peek-proposal.md`  
**Дата:** 2026-07-28  
**Статус proposal:** draft → выполнять после approve или по явной команде

> **Правило выполнения:** перед стартом шага N проверить, что шаг N−1 в таблице статусов = `Done`. Если нет — сообщить и не начинать.  
> После каждого шага — отчёт `docs/reports/YYYY-MM-DD-chat-future-peek-step-<N>.md`, статус → `Done`, коммит только по явной просьбе.  
> Каждый промт ниже — отдельный запрос к LLM: одна узкая задача + тесты.

### Зафиксированные решения MVP (пока proposal draft)

| Вопрос | Решение для промтов |
|--------|---------------------|
| Composer в Future | **Скрыть** полностью |
| Кнопка в шапке | **Нет** в MVP (только жест + deep link из Scheduled) |
| Сортировка | nearest-first (`scheduled_at ASC`, periodic — как в `getScheduledMessages`) |
| Exit | жест вверх **и** back в шапке / Android system back |

---

## Общие правила (включаются в каждый промт)

```
## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз (app → pages → widgets → features → entities → shared)
- Public API слоя — только через index.ts
- Один модуль — одна задача; не импортируй из верхних слоёв
- Следуй code-style проекта (именование, форматирование, импорты)
- Пиши unit-тесты для каждого нового/изменённого модуля
- После реализации прогони тесты: `npm test`
- Создай отчёт в `docs/reports/<YYYY-MM-DD>-chat-future-peek-step-<N>.md`
- Конвенциональные коммиты: `feat(chat-future-peek): ...`, `test(chat-future-peek): ...`
- Без Co-Authored-By и AI-trailers в коммитах
- НЕ добавляй комментарии в код, если не попросили явно
- Не удаляй глобальный таб Scheduled; не смешивай историю и будущее в одной ленте
- Не меняй модель доставки / notification scheduling
```

---

## Статусы шагов

| Шаг | Статус |
|-----|--------|
| 1. Локализация — ключи Future Peek | Done |
| 2. `getScheduledMessagesByChatId` в entities/message | Done |
| 3. Навигация: `mode` в params + `navigateToChat` | Done |
| 4. Feature `chat-future-peek` — overscroll жест (entry) | |
| 5. Feature — зеркальный exit-жест вверх | |
| 6. ChatRoom: `timelineMode` + индикатор + скрытие composer | |
| 7. UI списка Future + empty state + CTA | |
| 8. Интеграция entry/exit жестов в ChatRoom | |
| 9. Deep link из Scheduled → Future + highlight | |
| 10. Back / Android back: сначала выход из Future | |
| 11. Интеграционные тесты сценариев MVP | |

---

## Шаг 1. Локализация — ключи Future Peek

**Статус:** Done

### Задача
Добавить RU/EN строки для режима «Будущее», empty state, CTA и a11y-подсказки жеста.

### Что сделать
1. В `src/shared/config/locale.ts` добавить ключи (имена согласовать со стилем существующих):
   - `futureMode` — «Будущее» / `Future`
   - `futureEmptyTitle` — «Здесь пока ничего не запланировано» / `Nothing scheduled yet`
   - `futureScheduleCta` — «Запланировать» / `Schedule`
   - `futurePeekA11y` — «Потяните вниз, чтобы открыть будущее чата» / `Pull down to peek into this chat’s future`
   - `futureExitA11y` — краткая a11y для выхода жестом вверх (RU/EN)
2. Обновить `src/shared/config/__tests__/locale.test.ts` — новые ключи в списке обязательных.
3. Экспорт через существующий public API locale / `useLocale`.

### Промт
```
Выполни шаг 1 из docs/tasks/chat-future-peek-prompts.md.

Добавь ключи локализации Future Peek в locale.ts (RU/EN) и обнови locale.test.ts.
Не трогай UI чата.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-1.md
- Коммит только если попросили: feat(chat-future-peek): add future peek locale keys
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 2. `getScheduledMessagesByChatId` в entities/message

**Статус:** Done

### Задача
Выборка enabled scheduled **только для одного чата** — данные для режима Future.

### Что сделать
1. В `src/entities/message/model/messageRepository.ts` добавить:
   `getScheduledMessagesByChatId(chatId: string): Message[]`
   - Те же фильтры, что у `getScheduledMessages()`: `enabled = 1`, types `reminder|alarm|periodic`, `(scheduled_at > now OR type = periodic)`
   - Доп. условие: `chat_id = ?`
   - `ORDER BY scheduled_at ASC` (nearest-first)
2. Экспорт из `src/entities/message/index.ts`.
3. Тесты в `messageRepository.test.ts`:
   - возвращает только сообщения данного `chatId`
   - не возвращает disabled / past reminder-alarm / simple / image
   - periodic этого чата входит в выборку
   - чужой чат не попадает

### Промт
```
Выполни шаг 2 из docs/tasks/chat-future-peek-prompts.md.

Добавь getScheduledMessagesByChatId в messageRepository + public API + unit-тесты.
Не меняй UI и навигацию.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-2.md
- Коммит только если попросили: feat(message): add getScheduledMessagesByChatId
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 3. Навигация: `mode` в params + `navigateToChat`

**Статус:** Done

### Задача
Расширить вход в `ChatRoom` опциональным режимом `future`, сохранив совместимость с текущими вызовами (history по умолчанию).

### Что сделать
1. В `src/app/types.ts`:
   - `ChatRoom: { chatId: string; messageId?: string; focusNonce?: number; mode?: 'history' | 'future' }`
2. В `src/app/mainTabsApi.ts`:
   - расширить `navigateToChat(chatId, messageId?, options?: { mode?: 'history' | 'future' })`
   - прокинуть `mode` в `navigate` / pending queue так же, как `messageId`
3. Обновить типы pending / `openChatRoom`, если есть.
4. Unit-тесты (или точечные тесты API, если уже есть паттерн) — вызов с `mode: 'future'` кладёт param; без options — `mode` отсутствует / history.
5. Не менять поведение `ScheduledScreen` в этом шаге (только API).

### Промт
```
Выполни шаг 3 из docs/tasks/chat-future-peek-prompts.md.

Расширь ChatStackParamList и navigateToChat опциональным mode: 'history' | 'future'.
Сохрани обратную совместимость существующих вызовов.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-3.md
- Коммит только если попросили: feat(app): add ChatRoom future mode param
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 4. Feature `chat-future-peek` — overscroll жест (entry)

**Статус:**

### Задача
Вынести переиспользуемый жест «длинный pull вниз у низа ленты» с порогом, haptic и overlay-иконкой часов вперёд. Без привязки к смене режима — только колбэк `onCommit`.

### Что сделать
1. Создать слайс `src/features/chat-future-peek/`:
   - хук/компонент на Reanimated + Gesture Handler (как принято в проекте)
   - предусловия: жест активен только если `enabled` и `atBottom === true`
   - фазы: rubber-band до порога → после порога haptic + иконка → commit на отпускании / auto-commit
   - haptic и иконка **только после порога**
   - `onCommit()` при успешном жесте; до порога — отмена без вызова
   - debounce / игнор повторного жеста во время анимации
2. `index.ts` — public API.
3. Unit-тесты логики порога / atBottom / commit (мок жестов/haptic по возможности).

### Промт
```
Выполни шаг 4 из docs/tasks/chat-future-peek-prompts.md.

Создай features/chat-future-peek: entry overscroll (threshold, haptic post-threshold, clock-forward overlay, onCommit).
Не интегрируй в ChatRoomScreen — только слайс + тесты.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-4.md
- Коммит только если попросили: feat(chat-future-peek): add entry overscroll gesture
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 5. Feature — зеркальный exit-жест вверх

**Статус:**

### Задача
Симметричный жест выхода из Future: overscroll вверх у верхнего края списка будущего.

### Что сделать
1. В том же слайсе `features/chat-future-peek` добавить exit API (хук/компонент или общий с entry через `direction: 'enter' | 'exit'`).
2. Предусловия: `atTop` списка Future; порог + haptic зеркально entry; `onCommit` → выход в history.
3. Экспорт через `index.ts`.
4. Unit-тесты порога / atTop / commit / отмена до порога.

### Промт
```
Выполни шаг 5 из docs/tasks/chat-future-peek-prompts.md.

Добавь зеркальный exit overscroll вверх в features/chat-future-peek + тесты.
Не интегрируй в ChatRoomScreen.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-5.md
- Коммит только если попросили: feat(chat-future-peek): add exit overscroll gesture
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 6. ChatRoom: `timelineMode` + индикатор + скрытие composer

**Статус:**

### Задача
Состояние режима комнаты и явный UI-индикатор «Будущее»; в Future composer скрыт. Список Future пока можно заглушить (пустое место / placeholder) — полноценный список в шаге 7.

### Что сделать
1. В `ChatRoomScreen` (или вынесенном локальном state-хелпере страницы):
   - `timelineMode: 'history' | 'future'`
   - инициализация из `route.params.mode === 'future'`
2. В шапке / sticky-area — индикатор режима (`t.futureMode`), чтобы нельзя было перепутать с историей.
3. При `timelineMode === 'future'` — **не рендерить** MessageComposer.
4. История (лента) остаётся рабочей в `history`; переключение жестами пока можно сделать временными test-хуками **не обязательно** — достаточно setState из params.
5. Тесты страницы/хелпера: mode из params → future; default → history; composer скрыт в future.

### Промт
```
Выполни шаг 6 из docs/tasks/chat-future-peek-prompts.md.

Добавь timelineMode в ChatRoom, индикатор «Будущее», скрытие composer в future.
Список Future и жесты — не в этом шаге (можно заглушку).

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-6.md
- Коммит только если попросили: feat(chat-room): add timelineMode and future indicator
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 7. UI списка Future + empty state + CTA

**Статус:**

### Задача
В режиме Future показать список scheduled текущего чата или честный empty state с CTA «Запланировать».

### Что сделать
1. При `timelineMode === 'future'` рендерить список через `getScheduledMessagesByChatId(chatId)` (refresh при фокусе / interval по аналогии со Scheduled, если уместно).
2. Карточки: понятное «когда» (одноразовые даты/«завтра»; periodic — «каждый …») — переиспользовать форматирование из ScheduledItem / shared, не дублировать без нужды.
3. Empty: `futureEmptyTitle` + primary CTA `futureScheduleCta` → существующий flow создания reminder/alarm/periodic **в этом чате**.
4. Сработавшее / удалённое сообщение исчезает из списка при refresh; пустой список → empty.
5. Deep-link highlight: если есть `messageId` и mode future — scroll + highlight pulse (как в истории через `highlightedMessageId`).
6. Тесты: empty vs non-empty; CTA вызывает нужный колбэк/навигацию; highlight id.

### Промт
```
Выполни шаг 7 из docs/tasks/chat-future-peek-prompts.md.

Реализуй UI списка Future в ChatRoom + empty state + CTA «Запланировать» + scroll/highlight по messageId.
Данные — getScheduledMessagesByChatId.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-7.md
- Коммит только если попросили: feat(chat-room): add future timeline list and empty state
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 8. Интеграция entry/exit жестов в ChatRoom

**Статус:**

### Задача
Связать жесты из feature-слайса с `timelineMode`; соблюдать `atBottom` / `atTop` и сохранение позиции истории при выходе.

### Что сделать
1. History: entry overscroll только когда лента у низа → `timelineMode = 'future'`.
2. Future: exit overscroll у верха → `timelineMode = 'history'`; восстановить scroll position истории (сохранить offset перед входом).
3. Клавиатура: жест entry только при закрытой клавиатуре (сначала dismiss) — как в proposal.
4. Не конфликтовать с обычным скроллом (не у края — триггер выключен).
5. A11y: подсказки `futurePeekA11y` / `futureExitA11y` где уместно.
6. Тесты интеграции хуков с флагами atBottom/atTop (моки).

### Промт
```
Выполни шаг 8 из docs/tasks/chat-future-peek-prompts.md.

Подключи entry/exit overscroll из features/chat-future-peek к ChatRoom timelineMode.
Сохраняй позицию скролла истории при возврате. Строгий atBottom/atTop.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-8.md
- Коммит только если попросили: feat(chat-room): wire future peek gestures
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 9. Deep link из Scheduled → Future + highlight

**Статус:**

### Задача
Тап по любой scheduled-записи открывает тот же чат **сразу в Future** с фокусом на записи.

### Что сделать
1. В `ScheduledScreen.handlePress`:
   - для `reminder` / `alarm` / `periodic`:  
     `navigateToChat(chatId, messageId, { mode: 'future' })`
   - убрать старое поведение «periodic → history highlight display» как единственный путь (заменить на Future + highlight шаблона)
2. В ChatRoom: при `mode: 'future'` + `messageId` — список Future + scroll/highlight; если id удалён — Future без highlight (optional soft toast — если уже есть паттерн toast, иначе без).
3. Тесты: Scheduled press передаёт mode future; ChatRoom реагирует на params.

### Промт
```
Выполни шаг 9 из docs/tasks/chat-future-peek-prompts.md.

Обнови ScheduledScreen: navigateToChat(..., { mode: 'future' }) для всех типов scheduled + highlight в ChatRoom Future.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-9.md
- Коммит только если попросили: feat(scheduled): open chat in future mode
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 10. Back / Android back: сначала выход из Future

**Статус:**

### Задача
Назад из режима Future не должен сразу pop'ать ChatRoom на ChatList.

### Что сделать
1. Кнопка назад в `ChatHeader` / обработчик назад: если `timelineMode === 'future'` → переключить на `history` (с восстановлением scroll); иначе — обычный `goBack()`.
2. Android hardware / system back — то же (React Navigation `beforeRemove` / `BackHandler` — как принято в проекте).
3. Тесты: back в future → history; back в history → pop.

### Промт
```
Выполни шаг 10 из docs/tasks/chat-future-peek-prompts.md.

Сделай header back и Android system back: сначала выход из Future в History, затем pop ChatRoom.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-10.md
- Коммит только если попросили: feat(chat-room): exit future mode on back
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Шаг 11. Интеграционные тесты сценариев MVP

**Статус:**

### Задача
Закрепить acceptance из proposal автотестами (без E2E жестов на устройстве — unit/integration с моками).

### Что сделать
Покрыть сценарии (файлы рядом с chat-room / features / `__tests__`):

1. Peek: atBottom + commit → future mode + индикатор.
2. Exit жестом → history, позиция сохранена (мок offset).
3. Back в future → history, не pop.
4. Empty future → empty + CTA.
5. Scheduled navigate → future + highlight messageId.
6. Не atBottom → commit не вызывается / mode не меняется.
7. Pull до порога → нет commit.

Прогони `npm test`. Отчёт со списком сценариев.

### Промт
```
Выполни шаг 11 из docs/tasks/chat-future-peek-prompts.md.

Добавь интеграционные/unit тесты acceptance-сценариев Future Peek из proposal.
Прогони npm test. Напиши отчёт.

## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/chat-future-peek-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Unit-тесты; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-chat-future-peek-step-11.md
- Коммит только если попросили: test(chat-future-peek): cover mvp acceptance scenarios
- НЕ добавляй комментарии в код без явной просьбы
```

---

## Порядок работ (кратко)

| # | Шаг | Зависимости |
|---|-----|-------------|
| 1 | Locale | — |
| 2 | Query by chatId | — (параллельно с 1) |
| 3 | Navigation mode | — (параллельно с 1–2) |
| 4 | Entry gesture feature | — |
| 5 | Exit gesture feature | 4 |
| 6 | timelineMode shell | 1, 3 |
| 7 | Future list UI | 2, 6 |
| 8 | Wire gestures | 4, 5, 6, 7 |
| 9 | Scheduled deep link | 3, 7 |
| 10 | Back handling | 6 |
| 11 | Acceptance tests | 8–10 |

Шаги **1–3** и **4** можно готовить параллельно разными агентами; **8+** — строго по порядку статусов `Done`.

---

## Вне MVP (не включать в эти промты)

- Кнопка «Будущее» в шапке / coach mark discoverability
- Отдельный `ChatFutureScreen` в стеке
- Смешение history+future в одной ленте
- Создание scheduled самим жестом overscroll
- Изменение глобального таба Scheduled (кроме navigate mode)
- Группировка Future по дням как в Telegram
- Analytics events (метрики из proposal — отдельной задачей после ship)
