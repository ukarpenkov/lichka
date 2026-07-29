# Chat Future Peek — навигация Future↔Scheduled и polish

**Дата:** 2026-07-29
**Промпт/задача:** Staged-изменения Future Peek: обратная навигация Future→Scheduled, polish peek-оверлея, повторный тап таба Чаты → список чатов

## Что сделано

- **Future → Scheduled:** тап по строке в Future timeline переключает на таб Scheduled и скроллит/подсвечивает соответствующую запись (`navigateToScheduled` + focus listener)
- **Scheduled deep focus:** `ScheduledScreen` подписывается на focus-payload, скроллит к `messageId` и подсвечивает строку ~1 с
- **Peek overlay:** вынесен из rubber-band clip (`listPane`); анимация только у cluster (иконки + guide); enter-guide с фиксированным span `PEEK_ENTER_GUIDE_SPAN`
- **Таб Чаты:** повторный тап по уже активному табу делает `popToTop` → список чатов (в т.ч. из Future mode); раньше был no-op

## Изменённые файлы

- `src/app/mainTabsApi.ts` — `navigateToScheduled`, `popChatStackToTop`, `SCHEDULED_TAB_INDEX`, focus listener/consume
- `src/app/AppNavigator.tsx` — retap активного таба Чаты → `popChatStackToTop`
- `src/app/__tests__/mainTabsApi.test.ts` — тесты Scheduled focus и popToTop
- `src/pages/chat-list/ChatListScreen.tsx` — регистрация `popToTop` в chat stack nav
- `src/pages/scheduled/scheduledNavigation.ts` — `getFutureToScheduledNavigation`
- `src/pages/scheduled/ScheduledScreen.tsx` — scroll + highlight по focus payload
- `src/pages/scheduled/index.ts` — public API helpers
- `src/pages/scheduled/__tests__/scheduledNavigation.test.ts`
- `src/pages/chat-room/ChatRoomScreen.tsx` — `onPressMessage` → Scheduled; overlay вне rubber-band
- `src/pages/chat-room/FutureTimeline.tsx` — `onPressMessage`
- `src/pages/chat-room/__tests__/FutureTimeline.test.tsx`
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` — сценарий 5b
- `src/features/chat-future-peek/FuturePeekOverlay.tsx` — layout/anchor refactor
- `src/features/chat-future-peek/useFuturePeekGesture.ts` — cluster-only motion
- `src/features/chat-future-peek/index.ts` — экспорт `PEEK_ENTER_GUIDE_SPAN`

## Принятые решения

- Обратная навигация симметрична Scheduled→Future: только `messageId` + `focusNonce`, без открытия ChatRoom заново
- Overlay живёт sibling’ом к gesture/listPane, чтобы не клипаться rubber-band transform’ом
- Retap работает только для таба Чаты (не Settings); только по тапу, не по свайпу пейджера

## Известные ограничения

- Повторный тап по Settings при открытом ThemePicker не сбрасывает стек настроек
- Highlight на Scheduled — локальный UI-таймер, не общий компонент с Future highlight

## Тестирование

- `mainTabsApi` — navigateToScheduled, popChatStackToTop — PASS
- `scheduledNavigation` — Future→Scheduled payload — PASS
- `futurePeekAcceptance` — сценарий 5b — в составе acceptance suite
- `FutureTimeline` — onPressMessage — PASS
