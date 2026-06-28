---
feature: notification-permission-request
status: delivered
specs:
plans:
  - docs/compose/plans/2026-06-28-notification-permission.md
branch: main
commits:
---

# Request Notification Permission on App Start — Final Report

## What Was Built

The app now requests notification permission from the user on Android 13+ (API 33) during initialization. The permission dialog appears while the loading screen is shown, so users see the prompt immediately when they first open the app.

## Architecture

`AppInitProvider.tsx` calls `requestNotificationPermission()` alongside other init tasks (DB migrations, notification channel registration). The function checks platform and version, then uses `PermissionsAndroid.request()` for Android 13+. The call is fire-and-forget (`.catch(() => {})`) to avoid blocking initialization.

### Design Decisions

- Permission request runs during init rather than at first notification send — ensures the system knows the user's preference early
- Error is silently caught — if permission fails, the app continues normally (notifications just won't show until granted)

## Usage

No user action needed. The permission dialog appears automatically on first launch for Android 13+ devices. Users can also grant/revoke via system settings.

## Verification

- TypeScript compiles cleanly (`npx tsc --noEmit`)
- Function is called on app init in `src/app/AppInitProvider.tsx`
