# Android shortcut: написать в Saved

**Дата:** 2026-08-27
**Промпт/задача:** Шорткат по долгому зажатию иконки Lichka на рабочем столе Android — пункт «Написать в Saved», сразу открывает чат по умолчанию с фокусом в поле ввода. Proposal в `docs/features`, реализация, отчёт.

## Что сделано

- Добавлен статический Android App Shortcut: long-press по иконке приложения → пункт «Написать в Saved».
- Тап открывает системный чат `saved-messages` (Saved), курсор ставится в композер, клавиатура поднимается.
- Сообщение само не отправляется — как обычно, только Send.
- Если Saved уже открыт в режиме Future или с поиском, шорткат возвращает в историю, чтобы поле ввода было на экране.
- Cold start читает extra через `getInitialShortcutId()`, warm start (`singleTask` + `onNewIntent`) — событие `onShortcutOpen`. Extra после обработки снимается, чтобы recents не открыли Saved повторно.

## Изменённые файлы

- `docs/features/android-launcher-shortcut-write-saved-proposal.md` — описание фичи.
- `android/app/src/main/res/xml/shortcuts.xml` — статический shortcut.
- `android/app/src/main/res/drawable/ic_shortcut_write.xml` — иконка пункта меню.
- `android/app/src/main/res/values/strings.xml` и `values-{en,es,de,fr,pt}/` — подписи (системная локаль устройства).
- `android/app/src/main/AndroidManifest.xml` — `android.app.shortcuts`.
- `android/app/src/main/java/com/lichka/ShortcutModule.kt` — capture extra / emit / consume.
- `android/app/src/main/java/com/lichka/ShortcutPackage.kt` — регистрация native-модуля.
- `android/app/src/main/java/com/lichka/MainActivity.kt` — capture и warm-start emit.
- `android/app/src/main/java/com/lichka/MainApplication.kt` — `ShortcutPackage`.
- `src/shared/lib/launcherShortcut.ts` — JS-бридж.
- `src/features/launcher-shortcut/` — обработка shortcut и навигация в Saved.
- `src/app/mainTabsApi.ts`, `src/app/types.ts`, `src/app/AppNavigator.tsx` — опция `composerFocus`.
- `src/pages/chat-room/ChatRoomScreen.tsx` — nonce фокуса, выход из Future.
- `src/widgets/message-composer/MessageComposer.tsx` — `autoFocus` + `TextInput.focus()`.

## Принятые решения

- Статический XML-shortcut, а не динамический `ShortcutManager`: пункт виден сразу после установки, без ожидания JS.
- Отдельный `ShortcutModule`, тот же паттерн extras, что у виджета и share.
- Имя чата в подписи — **Saved**, как системный title чата по умолчанию.
- Только Android. iOS Home Screen Quick Actions — отдельная задача.

## Известные ограничения

- Shortcut есть на Android 7.1+ (API 25). На minSdk 24 (7.0) пункта в меню нет — ограничение ОС.
- Подпись в меню следует языку системы, не языку внутри приложения.
- OEM-лаунчеры по-разному рисуют long-press меню; виджеты и shortcuts могут соседствовать.
- Ручная проверка на устройстве в этой сессии не выполнялась: нужен rebuild native-слоя.

## Тестирование

- Jest: 38 сценариев по `launcherShortcut`, `useLauncherShortcut`, `mainTabsApi`, `MessageComposer` — все проходят.
- Покрыто: cold start, warm event, игнор late `getInitial`, повторный тап по shortcut, `composerFocusNonce` при уже открытом Saved, auto-focus композера, no-op на iOS.
