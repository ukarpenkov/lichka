# Поделиться в Lichka (ссылки и картинки)

**Статус:** implemented

## Описание проблемы

Пользователь видит ссылку или картинку в другом приложении (браузер, мессенджер, галерея) и хочет сохранить её в Lichka. Сейчас для этого нужно копировать текст или сохранять файл, открывать Lichka вручную, выбирать чат и вставлять. Приложение не появляется в системном меню «Поделиться» Android.

Нужный сценарий:

1. В другом приложении нажать «Поделиться» → выбрать Lichka.
2. Открывается **список чатов**.
3. После выбора чата открывается этот чат:
   - **ссылка / текст** — уже стоит в поле ввода, можно дописать и отправить;
   - **картинка** — закреплена к **неотправленному** сообщению (превью в композере), текст пишется вручную, отправка только по кнопке Send.

Картинка и ссылка **не уходят в чат сразу**.

## Предлагаемое решение

Android `ACTION_SEND` (intent-filter на `MainActivity`) + native `IncomingShareModule` по тому же паттерну, что уведомления и виджет. Отдельное имя обязательно: `ShareModule` уже занят встроенным исходящим Share в React Native.

| Шаг | Что происходит |
|-----|----------------|
| Share sheet | Lichka в списке для `text/plain`, `text/html`, `image/*` |
| Native | Читает `EXTRA_TEXT` и/или `EXTRA_STREAM`; картинку сразу копирует в cache (`share-inbox/`) с сжатием JPEG ≤1920px / quality 70 — URI от чужого приложения живёт недолго |
| JS | Таб «Чаты» + `popToTop` на список; режим выбора чата |
| Выбор чата | `ChatRoom` с черновиком: текст в input и/или превью картинки |
| Send | Обычный `createMessage` (`simple` или `image`) |

Cold start: `getInitialShare()`. Warm start (`singleTask` + `onNewIntent`): событие `onShareReceived`. После обработки extras снимаются, чтобы повторный запуск из recents не открыл тот же share снова.

## Влияние на архитектуру

| Слой | Изменения |
|------|-----------|
| Native `android/.../com/lichka/` | `IncomingShareModule`, `SharePackage`; intent-filters; capture в `MainActivity` |
| `shared/lib` | JS-бридж `shareIntent.ts` |
| `features/share-into-chat` | нормализация payload, store режима выбора, `useShareNavigation` |
| `app/mainTabsApi` | `revealChatListForShare()`; params черновика в `navigateToChat` |
| `pages/chat-list` | заголовок «Выберите чат», Cancel, tap → открыть с черновиком |
| `pages/chat-room` + `widgets/message-composer` | применить `shareText` / `shareImageUri` один раз |

## Альтернативы

| Вариант | Почему не выбран |
|---------|------------------|
| `react-native-receive-sharing-intent` / Share Menu | Лишняя зависимость; в проекте уже свой Kotlin-мост |
| Сразу слать сообщение без композера | Противоречит ТЗ: пользователь должен дописать текст |
| iOS Share Extension в этой же итерации | Отдельный extension target, App Groups, не тот share-bar. Только Android |
| `ACTION_SEND_MULTIPLE` | Несколько картинок сразу — вне текущего UX «одна картинка на сообщение» |

## Оценка сложности

Средняя: native intent + копирование URI + deep link на список чатов + черновик композера. Риски: OEM/приложения отдают URI без `image/*`; большие фото — OOM (снимается `inSampleSize` + JPEG).

## Ограничения

- Только Android. iOS Share Extension — отдельная задача.
- Несколько вложений (`SEND_MULTIPLE`) не регистрируем.
- Не-картиночные файлы (PDF, zip) в share sheet для Lichka не предлагаются.
- Новое сообщение **не** отправляется само; пользователь жмёт Send.
- Если чатов нет — сначала создать чат (FAB), затем выбрать его.

## Статус

implemented
