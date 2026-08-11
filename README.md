# Lichka

Offline Android app for personal thematic chats with yourself. Messages, reminders, alarms, and periodic notifications are stored locally in SQLite. No server.

Version: 2.0  
Platform: Android (minSdk 24, package `com.lichka`)  
License: MIT

## Features

### Chats

- Thematic journals in chat form (Telegram-with-yourself model).
- Create a chat with a title and avatar (gallery photo, emoji, or title initial).
- System chat "Saved messages" on first launch.
- Edit and delete chats (system chat cannot be deleted).
- Chat list sorted by last message.
- Global search across all messages and local search inside a chat.

### Message types

Send from the chat composer with four actions:

| Type | Behavior |
|------|----------|
| `simple` | Appears in the feed immediately |
| `reminder` | Push at the scheduled time; listed under Scheduled until then |
| `alarm` | Full-screen alarm over the lock screen |
| `periodic` | Repeat by interval (presets or custom); each fire via push |

Supports text, voice messages (AAC `.m4a`, up to 60 s), and images. Edit text and message time with an "edited" marker. Hard delete with no undo.

### Scheduled

- Tab with all active `reminder` / `alarm` / `periodic` items.
- Sorted by fire time.
- Navigate to the chat and specific message.
- Android widget with the scheduled list.

### Notifications

- Channels `reminders` and `alarms`.
- Exact alarms via `AlarmManager.setAlarmClock()`.
- Deep link from notification into the chat message.
- Default snooze: 5 minutes.

### Settings

- 13 two-color themes (background + text, no accent).
- Haptic and sound toggles.
- Localization RU / EN (system language, fallback EN).
- Backup: ZIP (data + media) and Google Drive (manual upload/download).
- Import in merge and replace modes.

### UI

- Three tabs: Chats, Scheduled, Settings.
- Terminal / CLI visual language (line-based feed, mono).
- Animations with Reanimated 4 and Gesture Handler.
- No telemetry or analytics.

## Stack

| Layer | Technology |
|-------|------------|
| UI | React Native 0.85, React 19, TypeScript |
| DB | `@op-engineering/op-sqlite` |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| Animations | Reanimated 4, Gesture Handler |
| Media | image-picker, audio-recorder-player, react-native-fs |
| Backup | ZIP (`react-native-zip-archive`), Google Drive REST v3 |
| Tests | Jest, Testing Library |
| Architecture | Feature-Sliced Design |

## Structure

```
src/
  app/        init, navigation, providers
  pages/      screens
  widgets/    composite UI blocks
  features/   user scenarios
  entities/   Chat, Message, Settings
  shared/     UI-kit, DB, utilities
```

Dependencies only downward: `app → pages → widgets → features → entities → shared`.  
Slice public API: `index.ts`.

Docs: `docs/spec/`, development rules: `docs/rules/`, `AGENTS.md`.

## Requirements

- Node.js >= 18
- Android SDK (API 24+)
- JDK for Android builds

## Install

```bash
npm install
```

`postinstall` applies patch-package. `prepare` sets `core.hooksPath` to `.githooks`.

## Run

```bash
# Metro
npm start

# Metro with cache reset
npm run start:reset

# Android (device / emulator)
npm run android

# Emulator, active arch only
npm run android:emulator
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Jest |
| `npm run lint` | ESLint |
| `npm run icons:android` | Generate adaptive icons |
| `npm run metro:clean-cache` | Clear Metro cache |

## Data

- Storage: local SQLite, migrations in `shared/db/migrations/`.
- Media: relative paths in the app sandbox (`media/avatars`, `media/voice`, `media/images`).
- Timestamps in DB: UTC; display in device local time.
- Backup: `licka-backup-*.zip` (JSON + media) or a copy in Google Drive `appDataFolder`.

## License

MIT. Copyright (c) 2026 Iurii Karpenkov.
