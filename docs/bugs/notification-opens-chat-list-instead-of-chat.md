# Notification opens Chat list instead of specific chat

**Date:** 2026-07-03
**Status:** fixed

## Root Cause

1. **Race condition: `navigation.navigate()` called before `NavigationContainer` is ready.** The `useNotificationNavigation` hook used `useNavigation()` and called `navigation.navigate()` in an effect immediately after mount, but the React Navigation container might not have processed its initial state yet, causing the navigation to silently fail.

2. **No `messageId` in reminder notification intents.** The native `NotificationHelper.buildReminderNotification()` did not include `messageId` in the `contentIntent` extras, making it impossible to scroll to the specific message that triggered the notification.

3. **`emitNotificationOpen` didn't include `messageId`.** Warm-start notification events only carried `chatId`, missing the `messageId` information.

## Fix

### JS/TS layer
- `src/features/notifications/useNotificationNavigation.ts` — Complete rewrite:
  - Added `setNavigationReady()` to signal when navigation is ready (called via `NavigationContainer.onReady`)
  - Added pending payload buffer: if navigation is not ready, stores payload and drains it when `setNavigationReady()` is called
  - Reads both `chatId` and `messageId` on cold start via `Promise.all`
  - Warm-start listener includes `messageId` from event
  - Module-level state for shared navigation readiness across renders

- `src/app/AppNavigator.tsx` — Added `onReady={() => setNavigationReady()}` to `NavigationContainer`

- `src/shared/lib/notificationChannels.ts` — Added `getInitialMessageId()` bridge

### Native layer
- `NotificationHelper.kt` — Added `EXTRA_MESSAGE_ID` to reminder notification content intents
- `NotificationModule.kt` — Added `getInitialMessageId()` method; updated `emitNotificationOpen()` to accept optional `messageId`; `consumeInitialChatId()` now also removes `EXTRA_MESSAGE_ID`
- `MainActivity.kt` — Passes `messageId` to `emitNotificationOpen()` in `onNewIntent()`
