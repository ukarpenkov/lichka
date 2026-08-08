---
bug: widget-failed-to-load, chat-input-keyboard-dismisses-after-focus
status: fixed
branch: main
commits:
---

# Виджет «Не удалось загрузить» + фокус клавиатуры в чате (итерация 2)

**Дата:** 2026-08-08  
**Задача:** закрыть два P0-бага в staged-изменениях — падение Android-виджета «Запланировано» и повторное самопроизвольное закрытие клавиатуры в чате после первой итерации фикса.

## Что сделано

### 1. Android-виджет «Запланировано»

- Зафиксирована причина «Не удалось загрузить виджет»: `setImageViewUri` + `FileProvider` без успешного `grantUriPermission` для HOME-лаунчера (на `targetSdk 36` список лаунчеров пуст без `<queries>`).
- В `AndroidManifest.xml` добавлен `<queries>` для `ACTION_MAIN` + `CATEGORY_HOME` (package visibility).
- `grantUriToHomeLaunchers` переписан: default HOME через `resolveActivity`, все HOME из query, OEM/SystemUI — только дополнительно и **не** как основание для URI-пути.
- `updateWidget` обёрнут в try/catch с forced bitmap fallback; URI используется только при `homeGranted > 0`.
- Добавлена карточка бага `docs/bugs/widget-failed-to-load.md`.

### 2. Клавиатура в чате (итерация 2)

Первая итерация (2026-08-07) убрала remount композера при мерцании `atBottom`, но на устройстве баг остался.

- Выявлена корневая причина: entry-peek `GestureDetector` оборачивал всю `chatArea`, включая `MessageComposer`, и через `blocksExternalGesture` конфликтовал с фокусом `TextInput` при открытии клавиатуры.
- `MessageComposer` вынесен из зоны entry-peek pan — `GestureDetector` оборачивает только список; композер остаётся sibling внутри `peekHost` (сохраняется ограниченная flex-высота FlatList).
- Entry-peek отключён при открытой клавиатуре (`keyboardOpen` + `keyboardDidHide` listener).
- `TextInput` композера возвращён на `react-native` (вместо RNGH).
- На history `FlatList` — `keyboardShouldPersistTaps="handled"`.
- У list-обёрток — `minHeight: 0` для корректного сжатия при подъёме клавиатуры.
- Удалены `composerNativeGesture`, `wrapComposerNativeScroll` и связанные опции из `useFuturePeekEntryGesture`.
- Обновлена карточка бага `docs/bugs/chat-input-keyboard-dismisses-after-focus.md` (история исправлений, регрессия после первой итерации).

## Изменённые файлы

| Файл | Назначение |
|------|------------|
| `android/app/src/main/AndroidManifest.xml` | `<queries>` для HOME-launcher (package visibility) |
| `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` | Надёжные URI-grants, bitmap fallback, try/catch |
| `docs/bugs/widget-failed-to-load.md` | Новая карточка бага виджета |
| `docs/bugs/widget-theme-partial-redraw-intermittent.md` | Ссылка на связанный баг |
| `docs/bugs/chat-input-keyboard-dismisses-after-focus.md` | Актуальная причина и исправление (итерация 2) |
| `docs/features/chat-future-peek-proposal.md` | Уточнение поведения peek при клавиатуре |
| `src/pages/chat-room/ChatRoomScreen.tsx` | Разделение pan/list/composer, `keyboardOpen`, layout |
| `src/widgets/message-composer/MessageComposer.tsx` | `TextInput` из RN, убран `pointerEvents="box-none"` |
| `src/features/chat-future-peek/useFuturePeekGesture.ts` | Удалён `composerNativeGesture` из entry-peek |
| `src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` | Тест: композер не размонтируется при `keyboardDidShow` |
| `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` | Peek отключён при открытой клавиатуре |
| `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` | То же для integration gates |

## Принятые решения

**Виджет**

- URI-пластина предпочтительна (cache-bust, coalesce refresh), но только при подтверждённом grant хотя бы одному HOME-пакету.
- SystemUI/OEM-хосты грантятся opportunistically и не считаются успехом — иначе `setImageViewUri` срабатывает, а реальный лаунчер падает в error view.
- Bitmap fallback не recycle'ится до parceling RemoteViews.

**Чат**

- Композер **внутри** `peekHost`, но **вне** pan — компромисс между gesture-изоляцией и flex-layout списка.
- Peek из области списка при закрытой клавиатуре и `atBottom` сохранён; свайп из поля ввода в Future намеренно убран.
- `Keyboard.dismiss()` на commit peek не менялся — конфликт был в touch arena, а не в явном dismiss.

## Известные ограничения

- Проверка виджета и клавиатуры на физическом Android-устройстве в рамках этой сессии не выполнялась.
- Bitmap fallback виджета теоретически чаще при нестандартных лаунчерах без HOME в query — coalesce refresh смягчает нагрузку.
- Общая проверка TypeScript по проекту может оставаться красной из-за ранее существовавших ошибок в других модулях.

## Тестирование

- `npm test -- --runInBand src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` — 3 набора, 23 теста успешно.
- Android-виджет: автотестов нет; проверка — ручное добавление виджета на home screen после сборки APK.
