# Fix: меню сообщения не открывается + Copy

**Дата:** 2026-08-05  
**Промпт/задача:** Баг: в чате иногда не открывается меню сообщения (Edit/Delete) после переходов Scheduled / future; добавить пункт Copy выше Edit.

## Что сделано

- Заведён баг `docs/bugs/message-context-menu-not-opening.md`.
- Исправлено нестабильное открытие контекстного меню сообщения после переключений history ↔ future и ухода на вкладку Scheduled.
- В меню добавлен пункт **Copy** / **Копировать** — выше Edit, в том же стиле, что остальные пункты.
- Копирование текста сообщения в системный буфер через `setClipboardString()`.
- Добавлены unit-тесты на arm-delay, backdrop и порядок пунктов меню.

## Изменённые файлы

- `docs/bugs/message-context-menu-not-opening.md` — описание бага, причины и решения.
- `src/pages/chat-room/MessageContextMenu.tsx` — защита от ghost-close; пункт Copy; поглощающий `Pressable` вокруг карточки; `presentationKey` для remount Modal.
- `src/pages/chat-room/ChatRoomScreen.tsx` — `openMessageMenu` / `closeMessageMenu`; сброс меню на blur и при enter/exit future; `handleCopyMessage`; передача `onCopy` и `presentationKey`.
- `src/shared/lib/clipboard.ts` — обёртка над RN Clipboard.
- `src/shared/lib/index.ts` — экспорт `setClipboardString`.
- `src/shared/config/locale.ts` — ключ `copy` (ru/en).
- `src/shared/ui/pixel/PixelIcon.tsx` — кастомная pixel-иконка `copy`.
- `src/shared/ui/pixel/icons.ts` — экспорт `Copy`.
- `src/pages/chat-room/__tests__/MessageContextMenu.test.tsx` — тесты меню.
- `src/shared/lib/__tests__/clipboard.test.ts` — тест копирования.
- `src/shared/config/__tests__/locale.test.ts` — ключ `copy` в required keys.

## Принятые решения

- **Корневая причина №1 — ghost-close.** Пункты меню были `disabled={!armed}` (~350 ms). Disabled `Pressable` не перехватывает touch; отпускание пальца после long-press попадало в backdrop `onPress={onClose}` и сразу закрывало меню. В Future строка чаще под центром (где рисуется меню), поэтому баг выглядел как «меню не открывается».
- **Корневая причина №2 — залипший Modal.** `menuMessage` не сбрасывался на `navigation blur`. React-state мог оставаться `visible=true` при сломанной нативной презентации — следующий long-press не переоткрывал меню.
- **Фикс arm-delay:** backdrop и действия игнорируют press до arm; пункты не `disabled`, а вызывают `runWhenArmed()`; карточка обёрнута в `Pressable` с `onPress={() => {}}`.
- **Фикс Modal:** сброс `menuMessage` на blur и при смене timeline mode; при открытии инкремент `menuPresentationKey` для remount Modal.
- **Copy:** копируется `message.body` (пустая строка для voice/image без текста); отдельного toast не добавляли — стандартное поведение буфера ОС.
- **Clipboard:** deep-import из `react-native/Libraries/Components/Clipboard/Clipboard` — без deprecation-warning геттера `react-native`; отдельная зависимость `@react-native-clipboard/clipboard` не ставили.

## Известные ограничения

- Copy копирует только текст `body`; для голосовых/изображений без подписи — пустая строка.
- Ручная проверка на устройстве после многократных переходов Scheduled ↔ чат ↔ future остаётся рекомендуемой.
- `ChatContextMenu` (список чатов) не менялся — там та же arm-логика не применялась, ghost-close риск ниже (меню не по центру long-press).

## Тестирование

Автотесты:

```bash
npm test -- --testPathPattern='MessageContextMenu|clipboard|locale' --no-coverage
```

Покрыто:

- порядок пунктов: Copy → Edit → Delete;
- игнор press на пунктах до arm (350 ms);
- backdrop не закрывает меню до arm;
- `setClipboardString` вызывает `Clipboard.setString`;
- ключ `copy` в словарях ru/en.

Рекомендуемый ручной сценарий:

1. Чат → long-press → меню с Copy / Edit / Delete стабильно видно.
2. Copy → вставить текст в другое поле — совпадает с телом сообщения.
3. Несколько раз: чат → Scheduled → чат → future → history → long-press — меню каждый раз открывается.
4. Future → long-press → Edit / Delete работают как раньше (с задержкой перед AlertDialog / MessageEditor).
