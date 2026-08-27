# Android shortcut: написать в Saved

**Статус:** implemented

## Название фичи

`android-launcher-shortcut-write-saved` — пункт в контекстном меню иконки приложения (long-press): сразу открыть системный чат **Saved** и поставить курсор в поле ввода.

## Описание проблемы

Чтобы что-то быстро записать, сейчас нужно: открыть Lichka → таб Чаты → Saved → тап по полю. Это лишние шаги для самого частого сценария — заметка в чат по умолчанию (`id='saved-messages'`).

На Android у иконки уже есть системное long-press меню (шорткаты лаунчера). Туда можно добавить один пункт: **Написать в Saved**.

Нужный сценарий:

1. Зажать иконку Lichka на домашнем экране / в ящике.
2. В контекстном меню выбрать «Написать в Saved».
3. Открывается чат Saved, клавиатура и курсор в композере — можно сразу печатать и отправить.

Сообщение **не** уходит само: как обычно, только кнопка Send.

## Предлагаемое решение

Статический Android App Shortcut (API 25+) + native-мост по тому же паттерну, что уведомления, виджет и share.

| Шаг | Что происходит |
|-----|----------------|
| Long-press иконки | Лаунчер показывает shortcut из `res/xml/shortcuts.xml` |
| Тап по пункту | Explicit intent на `MainActivity` с extra `shortcutId=write_saved` |
| Native | `ShortcutModule` захватывает extra (cold start) или эмитит `onShortcutOpen` (warm start, `singleTask` + `onNewIntent`) |
| JS | Таб Чаты → `ChatRoom` с `chatId=saved-messages` + `composerFocusNonce` |
| Композер | Фокус на поле ввода, клавиатура открывается |

После обработки extra снимаются, чтобы повторный запуск из recents не открыл Saved снова.

Если Saved уже открыт в режиме Future / поиска — выходим в историю, чтобы композер был на экране.

## Влияние на архитектуру

| Слой | Изменения |
|------|-----------|
| Native `android/.../com/lichka/` | `shortcuts.xml`, иконка, строки, `ShortcutModule` / `ShortcutPackage`; capture в `MainActivity` |
| `shared/lib` | JS-бридж `launcherShortcut.ts` |
| `features/launcher-shortcut` | `handleLauncherShortcut`, `useLauncherShortcut` |
| `app/mainTabsApi` | опция `composerFocus` у `navigateToChat` |
| `pages/chat-room` + `widgets/message-composer` | nonce фокуса → `TextInput.focus()`; выход из Future |

## Альтернативы

| Вариант | Почему не выбран |
|---------|------------------|
| Динамический `ShortcutManager` из JS | Статический shortcut виден сразу после установки, без ожидания JS; in-app locale и так не совпадает с системной |
| Deep link `lichka://saved` через `Linking` | В проекте extras + native module уже стандарт для виджета/share |
| iOS Home Screen Quick Actions в этой же итерации | Отдельный `UIApplicationShortcutItem`; пользователь просил Android-меню |
| Несколько shortcut'ов (новый чат, Запланировано) | Вне ТЗ; один пункт на главный сценарий |

## Оценка сложности

Низкая–средняя: XML shortcut + копирование паттерна WidgetModule + фокус композера. Риски: OEM-лаунчеры по-разному рисуют меню; API 24 (minSdk) shortcut не показывает — это ограничение ОС.

## Ограничения

- Только Android 7.1+ (API 25). На API 24 пункта нет.
- Подпись в меню — системная локаль устройства (`strings.xml`), не язык внутри приложения. Имя чата **Saved** совпадает с системным title.
- iOS Quick Actions — отдельная задача.
- Текст **не** отправляется сам.

## Статус

implemented
