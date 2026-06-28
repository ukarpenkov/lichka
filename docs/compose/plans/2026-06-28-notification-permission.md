# Request Notification Permission on App Start

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/notification-permission.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Request notification permission during app initialization on Android 13+.

**Architecture:** Add `requestNotificationPermission()` call to `AppInitProvider.tsx` initialization flow, running in parallel with other init tasks.

**Tech Stack:** React Native, PermissionsAndroid API

## Global Constraints

- Android 13+ (API 33) requires runtime permission for notifications
- iOS handles this separately via `aps-environment` entitlement
- Permission request should not block app initialization

---

### Task 1: Add notification permission request to app init

**Covers:** User requirement to request notification permission on app start

**Files:**
- Modify: `src/app/AppInitProvider.tsx`

**Interfaces:**
- Consumes: `requestNotificationPermission` from `../features/notifications`
- Produces: Permission dialog shown on Android 13+ at app startup

- [ ] **Step 1: Import requestNotificationPermission**

In `src/app/AppInitProvider.tsx`, add import:

```typescript
import { requestNotificationPermission } from '../features/notifications';
```

- [ ] **Step 2: Add permission request to init flow**

In the `useEffect` async function, after `registerNotificationChannels()`, add:

```typescript
requestNotificationPermission().catch(() => {});
```

- [ ] **Step 3: Verify the change compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/AppInitProvider.tsx
git commit -m "feat(notifications): request permission on app start"
```
