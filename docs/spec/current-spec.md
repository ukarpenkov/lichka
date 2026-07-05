# Lichka — Текущая спецификация проекта

**Последнее обновление:** 2026-07-05
**Версия приложения:** 0.1
**Android package:** `com.lichka`

---

## 1. Обзор

**Lichka** — Android-приложение для отправки сообщений самому себе с поддержкой напоминаний, будильников и периодических сообщений. Работает автономно (offline-first), хранит данные в локальной SQLite-базе. Основной use-case: записка/напоминалка с возможностью запланировать доставку.

---

## 2. Стек технологий

| Категория | Технология | Версия |
|---|---|---|
| **Framework** | React Native | 0.85.3 |
| **Language** | TypeScript (strict mode) | 5.8+ |
| **React** | 19.2.3 | |
| **Database** | @op-engineering/op-sqlite | 16.1.0 |
| **Navigation** | @react-navigation/native-stack + bottom-tabs | 7.x |
| **Animations** | react-native-reanimated | 4.3.1 |
| **Gestures** | react-native-gesture-handler | 2.31.2 |
| **Icons** | lucide-react-native | 1.16.0 |
| **Audio** | react-native-audio-recorder-player | 4.5.0 |
| **Image Picker** | react-native-image-picker | 8.2.1 |
| **File System** | react-native-fs | 2.20.0 |
| **Storage (key-value)** | @react-native-async-storage/async-storage | 3.1.0 |
| **Haptics** | react-native-haptic-feedback | 3.0.0 |
| **Google Sign-In** | @react-native-google-signin/google-signin | 16.1.2 |
| **Bottom Sheet** | @gorhom/bottom-sheet | 5.2.14 |
| **SVG** | react-native-svg | 15.15.5 |
| **Safe Area** | react-native-safe-area-context | 5.8.0 |
| **Screens** | react-native-screens | 4.25.2 |
| **Testing** | Jest 29 + @testing-library/react-native | |
| **Linting** | ESLint 9 + @react-native/eslint-config | |
| **Patches** | patch-package (postinstall) | |

### Native модули

- `ThemeModule` — кастомный Android-модуль для установки цветов темы на нативный уровень (StatusBar, system bars).

---

## 3. Архитектура (FSD — Feature-Sliced Design)

```
src/
├── app/              # Инициализация, навигация, провайдеры
├── pages/            # Экраны/стеки навигации
├── widgets/          # Составные UI-блоки
├── features/         # Пользовательские действия, бизнес-логика
├── entities/         # Бизнес-сущности (Chat, Message, Settings)
└── shared/           # UI-kit, утилиты, конфиг, БД
```

### Правила зависимостей

Зависимости только **вниз**: `app → pages → widgets → features → entities → shared`.

Public API — экспорт только через `index.ts` слайса.

---

## 4. Слои подробно

### 4.1. `app/` — Инициализация и навигация

| Файл | Назначение |
|---|---|
| `AppInitProvider.tsx` | State machine для инициализации: `loading → ready/error`. Запускает `runMigrations()`, `seedDefaultChat()`, `registerNotificationChannels()`, `requestNotificationPermission()`, `cleanupOrphanMedia()` |
| `AppNavigator.tsx` | Корневой навигатор. Bottom tabs (Chats / Scheduled / Settings) + модальный AlarmScreen |
| `ErrorBoundary.tsx` | Глобальный error boundary с minimal UI |
| `types.ts` | Navigation param list types |

### Структура навигации

```
RootStack (NativeStack)
├── Main (BottomTab)
│   ├── ChatsTab (NativeStack)
│   │   ├── ChatList
│   │   └── ChatRoom { chatId, messageId? }
│   ├── ScheduledTab
│   │   └── ScheduledScreen
│   └── SettingsTab (NativeStack)
│       ├── Settings
│       └── ThemePicker
└── Alarm (fullScreenModal, fade)
    └── AlarmScreen { body?, chatTitle? }
```

### Иконки таб-бара

| Таб | Иконка (lucide) |
|---|---|
| ChatsTab | `MessageCircle` |
| ScheduledTab | `CalendarDays` |
| SettingsTab | `Settings` |

### 4.2. `pages/` — Экраны

#### `chat-list/`

| Компонент | Описание |
|---|---|
| `ChatListScreen` | Список чатов. FlatList + FAB (создание). Header: title "Чаты" + кнопка поиска. Long press → контекстное меню (редактировать/удалить). |
| `ChatListItem` | Row с аватаром (SharedElementAvatar) и названием. Анимация FadeInUp + Layout springify. |
| `ChatContextMenu` | Bottom sheet контекстное меню чата |
| `GlobalSearch` | Overlay-поиск по всем сообщениям. Результаты с подсветкой `<mark>`. Переход в ChatRoom с scrollToMessage. |

#### `chat-room/`

| Компонент | Описание |
|---|---|
| `ChatRoomScreen` | Основной экран чата. Animated FlatList с date separators. Sticky date header. Refresh каждые 30 сек. Scroll-to-message при навигации. |
| `ChatHeader` | Заголовок: кнопка «назад», аватар + название (нажатие → редактирование чата), кнопка поиска. |
| `MessageBubble` | Пузырь сообщения. Типы: text, voice, image. Иконка типа (Bell/AlarmClock/Repeat). Индикатор «изменено». Long press → меню. Анимация FadeInUp/FadeOutDown. |
| `MessageContextMenu` | Bottom sheet: редактировать / удалить |
| `MessageEditor` | Bottom sheet редактирования сообщения (текст, дата, интервал) |
| `DateSeparator` | Разделитель даты в ленте |
| `SearchOverlay` | Поиск внутри конкретного чата |

#### `settings/`

| Компонент | Описание |
|---|---|
| `SettingsScreen` | ScrollView с секциями: Тема, Звук/тактильность, Язык (RU/EN pill toggle), Бэкап (Google Drive + файл), О приложении. |
| `ThemePickerScreen` | FlatList с превью всех тем. Карточка с фоном/текстом темы + чекбокс. |
| `SettingsRow` | Переиспользуемая row: иконка + label + children (switch/chevron/text). |

#### `scheduled/`

| Компонент | Описание |
|---|---|
| `ScheduledScreen` | FlatList запланированных сообщений. Refresh каждые 15 сек. Нажатие → переход в ChatRoom. |
| `ScheduledItem` | Карточка: название чата, текст сообщения, время/интервал. |

#### `alarm/`

| Компонент | Описание |
|---|---|
| `AlarmScreen` | Full-screen модальный экран будильника. Пульсирующие кольца (Reanimated), тряска иконки, текущее время, label. Кнопки: «Отключить» (красная) / «Отложить 5 мин». |

### 4.3. `widgets/` — Составные компоненты

#### `chat-form/`

| Компонент | Описание |
|---|---|
| `ChatForm` | Модальная форма создания/редактирования чата. Поля: аватар (фото/emoji), название. Sheet-style модалка. |
| `EmojiGrid` | Сетка эмодзи для выбора в качестве аватара |

#### `message-composer/`

| Компонент | Описание |
|---|---|
| `MessageComposer` | Нижняя панель ввода сообщения. Multiline TextInput + action buttons. |
| `DateTimePickerModal` | Обёртка над DateTimePicker |

**Кнопки действия (справа налево):**
| Кнопка | Иконка | Действие |
|---|---|---|
| Mic (long press) | `MicIcon` | Запись голосового сообщения |
| Repeat | `Repeat` | Периодическое сообщение (открывает PeriodPicker) |
| Alarm | `AlarmClockIcon` | Будильник (открывает DateTimePicker) |
| Bell | `Bell` | Напоминание (открывает DateTimePicker) |
| Send | `Send` | Отправить сообщение |
| Paperclip | `Paperclip` | Прикрепить изображение |

**Режим записи:** индикатор с красным dot + swipe-to-cancel (Pan gesture) + кнопка стоп.

**Image preview:** миниатюра над вводом с кнопкой удаления (X).

#### `voice-message/`

| Компонент | Описание |
|---|---|
| `VoiceMessage` | Плеер голосового: Play/Pause + WaveformBar + длительность. |
| `WaveformBar` | Визуализация формы волны (детерминированная на основе seed из message.id). |

#### `image-message/`

| Компонент | Описание |
|---|---|
| `ImageMessage` | Отображение изображения в пузыре. Пропорции расчитываются по width/height из payload. Клик → ImageViewer. |

#### `datetime-picker/`

Кастомный круговой пикер даты/времени:

| Компонент | Описание |
|---|---|
| `DateTimePicker` | Модалка с двумя кольцами (месяц + день) + TimeScroller. Гестуры: Pan на кольцах, tap на year → YearGridModal. Кнопки: Отмена / Сегодня / Готово. |
| `Bezel` | SVG-кольцо с label'ами (месяцы или дни) |
| `BezelLabel` | Одна метка на кольце |
| `TimeScroller` | Горизонтальный скроллер часов/минут |
| `YearPicker` | Выбор года (кнопки +/-, long press → сетка) |
| `YearGridModal` | Сетка годов (2020-2035) |
| `geometry` | Расчёт геометрии колец (inner/outer radii, centers) |
| `circularMath` | Утилиты: `daysInMonth()`, angle/idx конвертация |

**Accent color DateTimePicker:** `#4A9EFF`

#### `period-picker/`

| Компонент | Описание |
|---|---|
| `PeriodPicker` | Модалка выбора интервала: пресеты (5/10/15/60/1440 мин) + кастомный ввод. Accent: `#4A9EFF`. |

### 4.4. `features/` — Бизнес-логика

#### `notifications/`

| Модуль | Описание |
|---|---|
| `schedulingService.ts` | `scheduleNotification(msg)` — диспетчер: alarm → `scheduleAlarm()`, reminder → `scheduleReminder()`, periodic → `schedulePeriodic()`. Только Android. |
| `requestNotificationPermission.ts` | Запрос разрешения на уведомления |
| `requestExactAlarmPermission.ts` | `ensureExactAlarmPermission()` — проверка/запрос `SCHEDULE_EXACT_ALARM` (Android 12+) |
| `useNotificationNavigation.ts` | Хук: при получении notification → навигация в ChatRoom/AlarmScreen |

**Каналы уведомлений:**
- `CHANNEL_REMINDERS` — для напоминаний
- `CHANNEL_ALARMS` — для будильников (с звуком, вибрацией, показом на lock screen)

#### `voice-record/`

| Модуль | Описание |
|---|---|
| `useVoiceRecorder` | Хук записи. Max duration: 60 сек. Формат: m4a (AAC, 16kHz, mono). Авто-остановка при уходе в background. |
| `requestMicrophonePermission` | Запрос микрофона |

#### `voice-play/`

| Модуль | Описание |
|---|---|
| `useVoicePlayer` | Хук воспроизведения. Module-level реестр: при старте одного плеера — останавливаются все остальные. Play/pause/stop. Авто-остановка при окончании. |

#### `edit-message/`

| Модуль | Описание |
|---|---|
| `useEditMessage` | Хук: `saveEdit(msg, fields)` — отменяет старое уведомление, обновляет сообщение, перепланирует новое уведомление если нужно. |
| `EditFields` | `{ body?, scheduledAt?, intervalMinutes? }` |

#### `export/`

| Модуль | Описание |
|---|---|
| `exportToJSON` | Экспорт всех чатов + сообщений + настроек в JSON-файл. Schema version: 1. Файл: `licka-backup-<timestamp>.json` в DocumentDirectoryPath. |

#### `import/`

| Модуль | Описание |
|---|---|
| `importFromJSON` | Импорт JSON. Два режима: `merge` (обновление по updatedAt) и `replace` (полная замена). Возвращает статистику: chatsAdded/Updated, messagesAdded/Updated, settingsImported. |

#### `google-drive/`

| Модуль | Описание |
|---|---|
| `googleDrive.ts` | `uploadBackup(token)` — multipart upload в appDataFolder. `downloadBackup(token)` — скачивание. Автопоиск существующего файла `licka-backup.json`. |
| `googleSignIn.ts` | Google Sign-In обёртка |

#### `image-viewer/`

| Модуль | Описание |
|---|---|
| `ImageViewer` | Full-screen просмотр изображений. Pinch-to-zoom (max 5x), double-tap zoom toggle, swipe-down-to-dismiss с opacity fade. Reduce motion support. |
| `useImageViewer` | Хук управления состоянием viewer |

### 4.5. `entities/` — Бизнес-сущности

#### `chat/`

**TypeScript interface:**
```typescript
interface Chat {
  id: string;          // UUID
  title: string;
  avatarPath: string | null;  // relative path или emoji
  isSystem: boolean;   // системный чат нельзя удалить
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
}
```

**Repository functions:**
- `createChat(title, avatarPath?, options?)` → Chat
- `getChats()` → Chat[] (sorted by updated_at DESC)
- `getChatById(id)` → Chat | null
- `updateChat(id, { title?, avatarPath? })` → Chat | null
- `deleteChat(id)` → boolean (не удаляет системные)
- `seedDefaultChat()` — создаёт "Saved messages" с emoji 🔖 если БД пуста

**Default chat:** `id='saved-messages'`, `isSystem=true`, `emoji='🔖'`

#### `message/`

**TypeScript types:**
```typescript
type MessageType = 'simple' | 'reminder' | 'alarm' | 'periodic' | 'image';

interface Message {
  id: string;
  chatId: string;
  type: MessageType;
  body: string;
  scheduledAt: string | null;     // ISO datetime для reminder/alarm
  intervalMinutes: number | null;  // для periodic
  enabled: boolean;
  payload: string | null;         // JSON: voice URI, image data
  createdAt: string;
  updatedAt: string;
}
```

**Payload форматы:**
```typescript
// Voice message
{ uri: "media/voice/<uuid>.m4a" }

// Image message
{ uri: "media/images/<uuid>.jpg", width: 1920, height: 1080 }
```

**Body форматы:**
- Текст — произвольная строка
- Голосовое — `[voice:<seconds>]`
- Изображение — `[image:<width>x<height>]` или пользовательский текст

**Repository functions:**
- `createMessage(chatId, type, body, scheduledAt?, intervalMinutes?, payload?, id?)` → Message
- `getMessagesByChatId(chatId)` → Message[]
- `getMessageById(id)` → Message | null
- `updateMessage(id, fields)` → Message | null
- `deleteMessage(id)` → boolean (+ удаление payload-файла)
- `getVisibleMessagesByChatId(chatId)` → Message[] (без periodic, с фильтром по scheduledAt)
- `getPeriodicDisplayMessages(chatId)` → Message[] (вычисляемые на основе intervalMinutes)
- `getScheduledMessages()` → Message[] (все enabled + scheduled)
- `disableFiredMessages()` → number (отключает сработавшие reminder/alarm)
- `getMessagesForChatAtTime(chatId)` → Message[] (reminder/alarm до now)

**Periodic messages:** отображаются как "виртуальные" копии с префиксом `periodic:` в ID. Время отображения вычисляется: `createdAt + N * intervalMinutes`.

**Search:**
- `searchMessages(query, chatId?)` → SearchResult[]
- FTS5 если доступен, иначе LIKE fallback
- `SearchResult` включает `highlighted` поле с `<mark>` тегами

#### `settings/`

**TypeScript interface:**
```typescript
interface AppSettings {
  themePresetId: string;   // default: 'light'
  hapticEnabled: boolean;   // default: true
  soundEnabled: boolean;    // default: true
  locale: string;           // 'ru' | 'en', default: 'en'
}
```

**Repository functions:**
- `getSettings()` → AppSettings
- `updateSettings(partial)` → AppSettings

---

## 5. База данных

**Движок:** SQLite через `@op-engineering/op-sqlite`
**Имя файла:** `lichka.db`

### Таблицы

#### `chats`
| Колонка | Тип | Описание |
|---|---|---|
| id | TEXT PK | UUID |
| title | TEXT NOT NULL | Название |
| avatar_path | TEXT | Путь или emoji |
| is_system | INTEGER DEFAULT 0 | Системный чат |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

#### `messages`
| Колонка | Тип | Описание |
|---|---|---|
| id | TEXT PK | UUID |
| chat_id | TEXT FK → chats | Чат |
| type | TEXT CHECK | simple/reminder/alarm/periodic/image |
| body | TEXT DEFAULT '' | Текст |
| scheduled_at | TEXT | Время срабатывания |
| interval_minutes | INTEGER | Интервал для periodic |
| enabled | INTEGER | 0/1 |
| payload | TEXT | JSON payload |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

#### `settings`
| Колонка | Тип | Описание |
|---|---|---|
| key | TEXT PK | Ключ настройки |
| value | TEXT | Значение |

#### `schema_migrations`
| Колонка | Тип | Описание |
|---|---|---|
| version | INTEGER PK | Номер версии |

### Миграции

| Версия | Описание |
|---|---|
| 1 | Создание chats, messages, schema_migrations |
| 3 | Создание settings |
| 4 | Миграция body голосовых из `[Голосовое Xс]` в `[voice:X]` |
| 5 | Добавление is_system в chats |
| 6 | Пересоздание messages с CHECK для image типа |

> **Примечание:** FTS5 миграция (v2) закомментирована из-за отсутствия FTS5 в текущем билде op-sqlite.

---

## 6. Дизайн-система

### 6.1. Темы

**Всего 13 тем:**

| ID | Название | Background | Text |
|---|---|---|---|
| `light` | Light | `#FAFAFA` | `#000000` |
| `dark` | Dark | `#000000` | `#FFFFFF` |
| `green-on-black` | Green on Black | `#000000` | `#39FF14` |
| `amber` | Amber | `#000000` | `#FFB000` |
| `cyan` | Cyan | `#000000` | `#00E5FF` |
| `blue` | Blue | `#0D1117` | `#58A6FF` |
| `pink` | Pink | `#1A1A2E` | `#E94560` |
| `light-gray` | Light Gray | `#2B2B2B` | `#F5F5F5` |
| `cream` | Cream | `#F5F0DC` | `#2C2C2C` |
| `mint` | Mint | `#1B4332` | `#95D5B2` |
| `lavender` | Lavender | `#2D1B4E` | `#E0D4FF` |
| `parchment` | Parchment | `#3D2B1F` | `#F0EAD6` |
| `white-on-navy` | White on Navy | `#1E3A5F` | `#FFFFFF` |

**Доступ к теме:** `useTheme()` → `{ preset, background, text, setTheme }`

**Применение:** Все компоненты используют `background` для фона и `text` для всех цветов foreground. Прозрачность задаётся через hex-суффиксы: `text + '20'` (12%), `text + '60'` (38%), `text + '80'` (50%), `text + '99'` (60%), `text + 'FF'` (100%).

**Определение тёмной темы:** функция `isBackgroundDark()` использует формулу яркости: `R*0.299 + G*0.587 + B*0.114 < 128`.

### 6.2. Типографика

```typescript
// Text компонент
type variant = 'body' | 'caption';

// body: fontSize 16, lineHeight 24
// caption: fontSize 12, lineHeight 16
```

**Шрифт:** системный (`fontFamily: 'System'`). В navigation theme:
- regular: fontWeight 400
- medium: fontWeight 500
- bold: fontWeight 700
- heavy: fontWeight 900

### 6.3. Цветовые паттерны

| Элемент | Цвет |
|---|---|
| Фон экрана | `background` (из темы) |
| Текст основной | `text` (из темы) |
| Текст приглушённый | `text + '80'` или `text + '60'` |
| Границы/разделители | `text + '20'` |
| Пузырь сообщения | `text + '12'` |
| Пузырь (highlighted) | `text + '25'` |
| Кнопки actions | `text + '99'` |
| Accent (DateTimePicker) | `#4A9EFF` |
| Destructive (AlarmScreen) | `#FF6B6B` |

### 6.4. UI-компоненты (shared/ui)

| Компонент | Пропсы | Описание |
|---|---|---|
| `Text` | `variant: 'body'\|'caption'` | Базовый текст с темой |
| `Button` | `title, disabled, style` | Pressable кнопка |
| `IconButton` | `icon?, source?, children?, size?, color?, onPress?, disabled?, onPressIn?` | Иконка-кнопка с haptic |
| `Screen` | `children, style` | SafeAreaView обёртка с фоном темы |
| `Input` | `placeholder, multiline, style` | TextInput с темой |
| `Avatar` | `title, avatarPath, size?` | Аватар (emoji/фото/placeholder) |
| `SharedElementAvatar` | `sharedId, title, avatarPath, size?` | Аватар с shared element transition |
| `AnimatedPressable` | `onPress, scaleTo, pressStyle` | Pressable с анимацией |
| `AlertDialog` | `visible, title?, message?, buttons?, onClose` | Модалка подтверждения |
| `HighlightedBody` | `text (с <mark>), style` | Текст с подсветкой результатов поиска |
| `AlarmClockIcon` | `size, color` | SVG иконка будильника |
| `MicIcon` | `size, color` | SVG иконка микрофона |

### 6.5. Анимации

**Библиотека:** react-native-reanimated 4.x

**Паттерны:**
- `FadeInUp.springify().damping(18-20).stiffness(200-220)` — появление элементов
- `Layout.springify().damping(20-22).stiffness(180-200)` — перемещение элементов
- `FadeOutDown.duration(200)` — исчезновение
- `withSpring` / `withTiming` — переходы значений
- `withRepeat` — циклические анимации (пульс будильника)
- `Gesture.Pan()` — swipe-to-cancel запись
- `Gesture.Pinch()` — zoom в ImageViewer
- `Gesture.Tap().numberOfTaps(2)` — double-tap zoom

**Reduce Motion:** все анимации проверяют `AccessibilityInfo.isReduceMotionEnabled()` и отключаются при включённой настройке.

---

## 7. Навигация

### Типы параметров

```typescript
type RootStackParamList = {
  Main: undefined;
  Alarm: { body?: string; chatTitle?: string };
};

type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatId: string; messageId?: string };
};

type SettingsStackParamList = {
  Settings: undefined;
  ThemePicker: undefined;
};
```

### Навигация между экранами

- **ChatList → ChatRoom:** `navigation.navigate('ChatRoom', { chatId })`
- **ChatRoom → ChatRoom (из scheduled):** `navigation.navigate('ChatsTab', { screen: 'ChatRoom', params: { chatId, messageId } })`
- **Scheduled → ChatRoom:** через вложенный navigate в ChatsTab
- **Settings → ThemePicker:** `navigation.navigate('ThemePicker')`
- **Notification → ChatRoom/AlarmScreen:** через `useNotificationNavigation()` хук

---

## 8. Медиа

### Структура директорий

```
DocumentDirectoryPath/
├── media/
│   ├── avatars/     # <chatId>.jpg
│   ├── voice/       # <messageId>.m4a
│   └── images/      # <messageId>.jpg
└── lichka-backup-*.json
```

### Функции

| Функция | Описание |
|---|---|
| `resolveMediaPath(relative)` | Конвертация относительного пути в абсолютный |
| `saveAvatar(sourceUri, chatId)` → relative path | Сохранение аватара |
| `saveImage(sourceUri, messageId)` → relative path | Сохранение изображения |
| `ensureDir(dir)` | Создание директории если не существует |
| `cleanupOrphanMedia()` | Удаление файлов без записей в БД |
| `pickAndCompressImage()` | Выбор + сжатие (max 1920px, quality 0.75) |

---

## 9. Локализация

**Языки:** `ru`, `en`
**Определение языка:** DB setting → system locale → fallback `en`
**Хранение:** Словари в `locale.ts` (`ru`, `en`), тип `LocaleDictionary`

**Доступ:**
```typescript
const { t, locale, setLocale } = useLocale();
// t.cancel, t.save, t.done, t.chats, ...
// t.deleteChatConfirm(title) — функции-плейсхолдеры
```

**Поддерживаемые функции-плейсхолдеры:**
- `deleteChatConfirm(title)`, `exportDone(path)`, `voiceMessage(sec)`, `recording(duration)`, `imageMessage(w, h)`, `everyNMin(n)`, `chatsAdded(n)`, `chatsUpdated(n)`, `messagesAdded(n)`, `messagesUpdated(n)`

---

## 10. Haptic Feedback

| Функция | Тип | Когда |
|---|---|---|
| `hapticTap()` | impactLight | Tap на иконки, кнопки |
| `hapticLongPress()` | impactMedium | Long press |
| `hapticSuccess()` | notificationSuccess | Отправка сообщения, отключение будильника |

Учитывается настройка `hapticEnabled` и `reduceMotion`.

---

## 11. Звуки

| Функция | Описание |
|---|---|
| `playSendSound()` | Звук отправки сообщения (при `soundEnabled`) |
| `playReminderSound()` | Звук напоминания/будильника |

Ассеты: `src/shared/assets/sounds/`

---

## 12. Уведомления

**Только Android.** Используются нативные Android NotificationManager через shared/lib.

**Каналы:**
- `CHANNEL_REMINDERS` — напоминания
- `CHANNEL_ALRMS` — будильники (full screen intent, sound, vibration)

**Планирование:**
- `scheduleReminder(id, chatId, body, chatTitle, triggerAt)` — одноразовое
- `scheduleAlarm(id, chatId, body, chatTitle, triggerAt)` — одноразовое, full-screen
- `schedulePeriodic(id, chatId, body, chatTitle, intervalMs, triggerAt)` — повторяющееся
- `cancelAlarm(id)` — отмена

**Требования:**
- `SCHEDULE_EXACT_ALARM` (Android 12+)
- Battery optimization exemption (для reliable delivery)
- Auto-start permission (Xiaomi, Huawei)

---

## 13. Google Drive Backup

- **API:** Google Drive REST v3
- **File name:** `licka-backup.json` в `appDataFolder`
- **Flow:** Sign-In → token → upload/download
- **Upload:** multipart/related (metadata + JSON body)
- **Update vs Create:** поиск существующего файла по имени, PATCH вместо POST

---

## 14. Экспорт/Импорт

**Формат:**
```json
{
  "schema_version": 1,
  "exported_at": "2026-07-05T...",
  "chats": [
    {
      "id": "...",
      "title": "...",
      "avatarPath": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "messages": [...]
    }
  ],
  "settings": {
    "themePresetId": "light",
    "hapticEnabled": true,
    "soundEnabled": true,
    "locale": "en"
  }
}
```

**Режимы:**
- `merge` — добавление/обновление по `updatedAt`
- `replace` — полная замена (DELETE + INSERT)

---

## 15. Тестирование

**Инструменты:** Jest 29 + @testing-library/react-native

**Расположение тестов:**
```
src/__tests__/
src/entities/chat/__tests__/
src/entities/message/__tests__/
src/entities/settings/__tests__/
src/pages/chat-room/__tests__/
src/widgets/message-composer/__tests__/
src/widgets/image-message/__tests__/
src/features/export/__tests__/
src/shared/config/__tests__/
src/shared/db/__tests__/
src/shared/lib/__tests__/
```

**Конфиг:** `jest.config.js`, `jest.setup.js`

---

## 16. Feature Flags

```typescript
const FEATURE_FLAGS = {
  sharedElementAvatar: false,  // Shared element transition для аватаров
} as const;
```

---

## 17. Ключевые паттерны

### IDs
Все ID — UUID v4 через `generateId()`: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### Timeouts/Refresh
- ChatRoom: `REFRESH_INTERVAL = 30_000` (30 сек)
- ScheduledScreen: `REFRESH_INTERVAL = 15_000` (15 сек)

### Keyboard
- `useKeyboardHeight()` — хук для компенсации высоты клавиатуры (Android-specific)
- Keyboard.dismiss() при blur навигации

### Accessibility
- Reduce Motion support во всех анимациях
- `hitSlop={8}` на IconButton

### Image Handling
- Pick: `react-native-image-picker` (max 1920px, quality 0.75)
- Save: копирование в `media/images/`
- Display: пропорции из width/height payload
- Viewer: pinch zoom, double tap, swipe dismiss

---

## 18. Скрипты

| Скрипт | Команда |
|---|---|
| Android dev | `npm run android` |
| Android emulator | `npm run android:emulator` |
| Start Metro | `npm start` |
| Start (reset cache) | `npm run start:reset` |
| Clean Metro cache | `npm run metro:clean-cache` |
| Generate Android icons | `npm run icons:android` |
| Lint | `npm run lint` |
| Test | `npm test` |

---

## 19. Пути к файлам (быстрый справочник)

### Pages
- `src/pages/chat-list/ChatListScreen.tsx` — список чатов
- `src/pages/chat-list/ChatListItem.tsx` — row чата
- `src/pages/chat-list/ChatContextMenu.tsx` — меню чата
- `src/pages/chat-list/GlobalSearch.tsx` — глобальный поиск
- `src/pages/chat-room/ChatRoomScreen.tsx` — экран чата
- `src/pages/chat-room/ChatHeader.tsx` — заголовок чата
- `src/pages/chat-room/MessageBubble.tsx` — пузырь сообщения
- `src/pages/chat-room/MessageContextMenu.tsx` — меню сообщения
- `src/pages/chat-room/MessageEditor.tsx` — редактор сообщения
- `src/pages/chat-room/DateSeparator.tsx` — разделитель дат
- `src/pages/chat-room/SearchOverlay.tsx` — поиск в чате
- `src/pages/settings/SettingsScreen.tsx` — настройки
- `src/pages/settings/ThemePickerScreen.tsx` — выбор темы
- `src/pages/settings/SettingsRow.tsx` — row настроек
- `src/pages/scheduled/ScheduledScreen.tsx` — запланированные
- `src/pages/scheduled/ScheduledItem.tsx` — item запланированного
- `src/pages/alarm/AlarmScreen.tsx` — экран будильника

### Widgets
- `src/widgets/chat-form/ChatForm.tsx` — форма чата
- `src/widgets/chat-form/EmojiGrid.tsx` — сетка эмодзи
- `src/widgets/message-composer/MessageComposer.tsx` — ввод сообщения
- `src/widgets/message-composer/DateTimePickerModal.tsx` — обёртка пикера
- `src/widgets/voice-message/VoiceMessage.tsx` — голосовой плеер
- `src/widgets/voice-message/WaveformBar.tsx` — waveform
- `src/widgets/image-message/ImageMessage.tsx` — отображение изображения
- `src/widgets/datetime-picker/DateTimePicker.tsx` — круговой пикер даты
- `src/widgets/datetime-picker/Bezel.tsx` — SVG кольцо
- `src/widgets/datetime-picker/TimeScroller.tsx` — скроллер времени
- `src/widgets/datetime-picker/YearPicker.tsx` — выбор года
- `src/widgets/datetime-picker/YearGridModal.tsx` — сетка годов
- `src/widgets/datetime-picker/geometry.ts` — геометрия колец
- `src/widgets/datetime-picker/circularMath.ts` — математика колец
- `src/widgets/period-picker/PeriodPicker.tsx` — выбор периода

### Features
- `src/features/notifications/schedulingService.ts` — планирование
- `src/features/notifications/useNotificationNavigation.ts` — навигация по уведомлениям
- `src/features/notifications/requestExactAlarmPermission.ts` — разрешение точных будильников
- `src/features/notifications/requestNotificationPermission.ts` — разрешение уведомлений
- `src/features/voice-record/useVoiceRecorder.ts` — запись голоса
- `src/features/voice-record/requestMicrophonePermission.ts` — разрешение микрофона
- `src/features/voice-play/useVoicePlayer.ts` — воспроизведение голоса
- `src/features/edit-message/useEditMessage.ts` — редактирование сообщения
- `src/features/export/exportToJSON.ts` — экспорт в JSON
- `src/features/import/importFromJSON.ts` — импорт из JSON
- `src/features/google-drive/googleDrive.ts` — Google Drive API
- `src/features/google-drive/googleSignIn.ts` — Google Sign-In
- `src/features/image-viewer/ImageViewer.tsx` — просмотр изображений
- `src/features/image-viewer/useImageViewer.ts` — хук viewer

### Entities
- `src/entities/chat/model/types.ts` — Chat interface
- `src/entities/chat/model/chatRepository.ts` — CRUD чатов
- `src/entities/message/model/types.ts` — Message types
- `src/entities/message/model/messageRepository.ts` — CRUD сообщений
- `src/entities/settings/model/types.ts` — AppSettings interface
- `src/entities/settings/model/settingsRepository.ts` — CRUD настроек

### Shared
- `src/shared/ui/index.ts` — экспорт всех UI-компонентов
- `src/shared/ui/Text.tsx` — Text
- `src/shared/ui/Button.tsx` — Button
- `src/shared/ui/IconButton.tsx` — IconButton
- `src/shared/ui/Screen.tsx` — Screen (SafeAreaView)
- `src/shared/ui/Input.tsx` — Input
- `src/shared/ui/Avatar.tsx` — Avatar
- `src/shared/ui/SharedElementAvatar.tsx` — SharedElementAvatar
- `src/shared/ui/AnimatedPressable.tsx` — AnimatedPressable
- `src/shared/ui/AlertDialog.tsx` — AlertDialog
- `src/shared/ui/HighlightedBody.tsx` — HighlightedBody
- `src/shared/ui/Icon.tsx` — AlarmClockIcon, MicIcon
- `src/shared/config/theme.ts` — ThemePreset, THEME_PRESETS
- `src/shared/config/ThemeProvider.tsx` — ThemeProvider, useTheme
- `src/shared/config/locale.ts` — словари ru/en
- `src/shared/config/LocaleProvider.tsx` — LocaleProvider, useLocale
- `src/shared/config/dateUtils.ts` — форматирование дат
- `src/shared/config/featureFlags.ts` — FEATURE_FLAGS
- `src/shared/db/db.ts` — getDatabase, runMigrations
- `src/shared/db/search.ts` — searchMessages (FTS5/LIKE)
- `src/shared/lib/generateId.ts` — UUID v4
- `src/shared/lib/haptics.ts` — haptic feedback
- `src/shared/lib/mediaPath.ts` — пути к медиа
- `src/shared/lib/cleanupMedia.ts` — очистка медиа
- `src/shared/lib/notificationChannels.ts` — Android notification channels
- `src/shared/lib/sounds.ts` — звуки
- `src/shared/lib/keyboard.ts` — useKeyboardHeight
- `src/shared/lib/imageCompress.ts` — pickAndCompressImage
- `src/shared/lib/animations.ts` — анимации

### App
- `src/app/AppInitProvider.tsx` — инициализация
- `src/app/AppNavigator.tsx` — навигация
- `src/app/ErrorBoundary.tsx` — error boundary
- `src/app/types.ts` — navigation types
- `App.tsx` — корневой компонент
