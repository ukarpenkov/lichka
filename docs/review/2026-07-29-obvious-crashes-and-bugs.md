# Ревизия: очевидные краши и несоответствия

**Дата:** 2026-07-29  
**Область:** JS/TS слой (`src/`), точечная проверка критичных путей  
**Метод:** статический обзор кода, без прогона на устройстве

> В отчёт попали только **очевидные** проблемы: воспроизводимые краши, явные расхождения кода с поведением UI или с остальной кодовой базой. UX-мелочи, keyboard-gap и прочие известные баги из `docs/bugs/` не дублировались, если уже задокументированы и не проверялись повторно.

---

## P0 — возможный краш

### 1. Восстановление из Google Drive без обработки ошибок

**Файл:** `src/pages/settings/SettingsScreen.tsx`  
**Строки:** ~230, ~257

При восстановлении из Google Drive `importFromJSON(json, mode)` вызывается прямо в `onPress` диалога, **без `try/catch`**. Локальный импорт файла (`handleImport`) ошибки ловит, Google Drive — нет.

`importFromJSON` бросает исключение при:
- невалидном JSON (`JSON.parse` в начале функции);
- неверной схеме / структуре бэкапа (`throw new Error(t.invalidFormat)`).

**Сценарий:** битый файл на Drive, ручная правка бэкапа, несовместимая версия схемы → необработанное исключение в обработчике кнопки → `ErrorBoundary` («Something went wrong»).

**Ожидание:** так же, как в `handleImport` — показать `t.importFailed` / `t.invalidFormat`, не ронять экран.

---

## P1 — явные несоответствия (данные / поведение)

### 2. Удаление медиа по относительному пути

**Файлы:**
- `src/entities/message/model/messageRepository.ts` — `deleteMessage()`
- `src/entities/chat/model/chatRepository.ts` — `deleteChat()`

При удалении сообщения:
```ts
RNFS.unlink(parsed.uri)  // uri = "media/voice/…" или "media/images/…"
```

При удалении чата:
```ts
RNFS.unlink(chat.avatarPath)  // "media/avatars/…"
```

Во всём остальном приложении пути разрешаются через `resolveMediaPath()` (`DocumentDirectoryPath + relative`). `RNFS.unlink` ожидает **абсолютный** путь → удаление молча не срабатывает (ошибка глотается `.catch(() => {})`).

**Следствие:** файлы остаются на диске после удаления сообщений/чатов; со временем — рост `media/`, расхождение с БД. Не краш, но явный баг очистки.

---

### 3. Кнопка «Отложить · 15 мин» ничего не откладывает

**Файл:** `src/pages/alarm/AlarmScreen.tsx`

UI обещает snooze на 15 минут, но `handleSnooze` только вызывает `navigation.goBack()`. Нет вызова нативного планировщика, нет нового `scheduledAt`, нет повторного `scheduleAlarm`.

**Следствие:** пользователь думает, что будильник отложен; фактически алерт просто закрывается, повторного срабатывания не будет.

---

### 4. Импорт настроек не применяется к UI до перезапуска

**Файл:** `src/features/import/importFromJSON.ts` → `updateSettings(data.settings)`

Настройки пишутся в SQLite, но:
- `ThemeProvider` читает тему **один раз** в `useEffect([])`;
- `LocaleProvider` инициализируется через `resolveLocale()` при первом монтировании;
- после импорта в Settings вызывается только `setSettings(getSettings())` — локальный state экрана настроек.

**Следствие:** после merge/replace импорт может записать новую тему/язык в БД, но интерфейс останется на старых значениях до kill + restart. Несоответствие данных и отображения.

---

### 5. Google Drive backup без медиа (расхождение с ZIP)

**Файлы:** `src/features/google-drive/googleDrive.ts`, `src/pages/settings/SettingsScreen.tsx`

- ZIP-бэкап (`exportToZIP`) включает `backup.json` + файлы из `media/`.
- Google Drive (`uploadBackup`) выгружает только JSON через `exportToJSON()`.

В UI есть подсказка `backupSavedNoMedia`, но при восстановлении с Drive голос/картинки/аватары **не вернутся**, хотя чаты и сообщения с `payload.uri` восстановятся. Сообщения с медиа будут показывать fallback-текст / битые превью.

Это не краш, но очевидное несоответствие двух каналов бэкапа.

---

## P2 — потенциальные проблемы (низкая вероятность краша, но стоит знать)

### 6. `LocaleProvider` без безопасного fallback

**Файл:** `src/shared/config/LocaleProvider.tsx`

```ts
t: dictionaries[locale]
```

В `locale.ts` есть `getDictionary()` с fallback на `en`, но провайдер его не использует. Сейчас `setLocale` принимает только `Locale`, а `resolveLocale()` валидирует значение при старте — **краш маловероятен в штатном сценарии**. Риск появится, если в БД окажется невалидная локаль и кто-то вызовет `setLocale` без проверки (или расширят импорт без валидации).

---

### 7. `importFromJSON`: `JSON.parse` без локального try/catch

**Файл:** `src/features/import/importFromJSON.ts`

Parse-errors пробрасываются наверх как необработанный `SyntaxError`. Это нормально, **если** все вызывающие ловят ошибку. Сейчас не ловят: Google Drive restore (см. п.1). Локальный импорт и ZIP — ловят.

---

## Что проверено и выглядит ок

| Область | Комментарий |
|--------|-------------|
| `JSON.parse` в UI сообщений | `ImageMessage`, `MessageLine`, `VoiceMessage` — везде `try/catch` |
| `scrollToIndex` | `ChatRoomScreen`, `ScheduledScreen`, `FutureTimeline` — есть `onScrollToIndexFailed` |
| Несуществующий `chatId` | `ChatRoomScreen` показывает `t.chatNotFound`, не падает |
| `useBottomTabBarHeight` | удалён; используется `PAGER_TAB_BAR_HEIGHT` |
| `AudioRecorderPlayer` | в текущей версии пакета default export — **singleton**, `useRef(AudioRecorderPlayer).current` корректен |
| Инициализация БД | `AppInitProvider` ловит ошибки миграций; при `error` — throw в `ErrorBoundary` (ожидаемо) |
| `getTheme()` / невалидный preset | fallback на `DEFAULT_LIGHT` |

---

## Рекомендуемый порядок исправления

1. **P0:** обернуть Google Drive merge/replace в `try/catch` (как `handleImport`).
2. **P1:** `resolveMediaPath()` в `deleteMessage` / `deleteChat` перед `unlink`.
3. **P1:** реализовать snooze или убрать текст «15 мин» с кнопки.
4. **P1:** после импорта настроек — перечитать тему/локаль в провайдерах (или единый `settingsChanged` event).
5. **P1 (product):** явно разделить Drive-бэкап «только данные» vs ZIP «данные + медиа», либо добавить медиа в Drive.

---

## Тестирование (не выполнялось)

Рекомендуется ручная проверка:
- [ ] Drive restore с битым JSON → диалог ошибки, без red screen
- [ ] Удалить голосовое/фото → файл исчезает из `DocumentDirectoryPath/media/…`
- [ ] Snooze на AlarmScreen → повтор через ~15 мин (после фикса)
- [ ] Import replace с другой темой в JSON → тема меняется без перезапуска (после фикса)
