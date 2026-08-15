# Privacy Policy / Политика конфиденциальности

**App / Приложение:** Lichka
**Last updated / Дата последнего обновления:** 2026-08-15

---

## English

This privacy policy describes how the mobile application **Lichka** ("the App") handles information when you use it on your Android device.

### Who we are

The App is published by the developer identified on the **Google Play** store listing (name and contact details shown there). For privacy-related questions, use the contact options provided on that listing.

### Summary

The App is **offline-first**. It is a personal messenger/notes tool that lets you keep private chats, notes, voice messages and scheduled reminders. **The App does not require you to create an account.** As implemented in the current version, **the App does not send your chats, messages, voice recordings or preferences to our servers** — we do not operate a backend service for the App.

### Data stored on your device

The App stores data **locally on your device**, including:

- **Chats and messages** you create (text, media files such as images and voice recordings, and their timestamps).
- **Categories** and other organizational data you create.
- **Scheduled reminders** you set for messages.
- **App preferences** in the same local storage, such as **interface language**, **light/dark theme**, and feature flags.

Storage technology: a **SQLite** database file on your device and device key-value storage (**AsyncStorage**), managed by the App. Voice recordings are stored as audio files in the App's private storage. Images you attach are stored in the App's private storage.

### Optional Google Drive backup

The App offers an **optional** backup feature. If you choose to use it, you sign in with your own **Google account**, and the App creates a **backup file in your own Google Drive** in the App's private data folder (App data folder). The backup is transferred between your device and **your own Google Drive account** — it is **not sent to the developer** and the developer has no access to it. You can remove the backup at any time by signing out or deleting it from your Google Drive.

### Import and export

The App can **export** your data to a **JSON or ZIP file** on your device and **import** data from a **JSON or ZIP file you select** using the system file picker. Processing happens **on your device**; exported/imported files are **not uploaded to us**.

### Permissions

The Android manifest may declare the following permissions, all used for the App's stated functionality and **not for collecting or transmitting your content to the developer**:

- **`INTERNET`** — used only for the **optional Google Drive backup** feature. In the current version, the App does not use network access to collect or transmit your chats, messages, preferences or any content to the developer. (The permission may also be present for platform or dependency compatibility reasons.)
- **`RECORD_AUDIO`** — used only when you actively record a voice message.
- **`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `USE_FULL_SCREEN_INTENT`, `WAKE_LOCK`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`** — used only for **local scheduled reminders** you set inside the App; all notification processing happens on your device.

The App does **not** request location, contacts, SMS, or camera permissions for its core functionality.

### Analytics and advertising

The current version of the App **does not integrate third-party analytics or advertising SDKs**. If this changes in a future release, this policy will be updated before or with that release, and the **Google Play Data safety** section will be updated accordingly.

### Children

The App is a general-purpose personal notes tool. It is **not directed specifically at children under 13**. If you are a parent or guardian and believe your child has provided personal information to us through the App in a way that concerns you, contact us via the Play listing contact details.

### Data retention and deletion

Data remains on your device until you **delete individual chats/messages**, **clear the App's data**, **uninstall** the App, or use device tools that remove app storage. Uninstalling the App typically deletes the App's local database and media files. If you enabled the optional Google Drive backup, the backup file remains **in your own Google Drive account** until you delete it — **we do not hold a copy**, because we do not receive that data.

### International transfers

Because **we do not receive** your chats, messages, recordings or preferences through the App in the current version, **we do not transfer** that data internationally. If you enable the optional Google Drive backup, your backup file is stored by **Google** in your own account according to Google's policies and your account settings.

### Changes

We may update this policy from time to time. The **"Last updated"** date at the top will change when we do. Continued use of the App after changes means you accept the updated policy where required by applicable law.

---

## Русский

Настоящая политика конфиденциальности описывает, как мобильное приложение **Lichka** («Приложение») обрабатывает информацию при использовании на вашем устройстве Android.

### Кто мы

Приложение распространяется разработчиком, указанным в **карточке приложения в Google Play** (имя и контакты там же). По вопросам, связанным с конфиденциальностью, используйте контакты, указанные в листинге магазина.

### Кратко

Приложение рассчитано на **работу в первую очередь офлайн**. Это персональный мессенджер/заметки: личные чаты, заметки, голосовые сообщения и отложенные напоминания. **Регистрация аккаунта не требуется.** В текущей версии **Приложение не передаёт ваши чаты, сообщения, голосовые записи и настройки на наши серверы** — отдельный серверный бэкенд для Приложения не используется.

### Что хранится на устройстве

Данные хранятся **локально на вашем устройстве**, в том числе:

- **Чаты и сообщения**, которые вы создаёте (текст, медиафайлы — изображения и голосовые записи, а также их временные метки).
- **Категории** и другие организационные данные, которые вы создаёте.
- **Отложенные напоминания**, которые вы устанавливаете для сообщений.
- **Настройки приложения** в том же локальном хранилище: **язык интерфейса**, **светлая/тёмная тема**, флаги функций.

Технология хранения: файл базы данных **SQLite** на устройстве и локальное хранилище «ключ-значение» (**AsyncStorage**), управляемые Приложением. Голосовые записи хранятся как аудиофайлы в приватном хранилище Приложения. Прикрепляемые изображения хранятся в приватном хранилище Приложения.

### Опциональный бэкап в Google Drive

В Приложении есть **необязательная** функция резервного копирования. Если вы решите её использовать, вы входите в свой собственный **аккаунт Google**, и Приложение создаёт **файл резервной копии в вашем собственном Google Drive** в приватной папке данных Приложения (папка данных приложения). Резервная копия передаётся между вашим устройством и **вашим собственным аккаунтом Google Drive** — она **не отправляется разработчику**, и разработчик не имеет к ней доступа. Вы можете удалить резервную копию в любой момент, выйдя из аккаунта или удалив файл из Google Drive.

### Импорт и экспорт

Приложение может **экспортировать** ваши данные в файл **JSON или ZIP** на устройстве и **импортировать** данные из **JSON- или ZIP-файла, выбранного вами** через системный выбор файла. Обработка выполняется **на вашем устройстве**; экспортированные/импортированные файлы **не загружаются к нам**.

### Разрешения

В манифесте Android могут быть объявлены следующие разрешения — все они используются для заявленной функциональности Приложения и **не используются для сбора или передачи вашего контента разработчику**:

- **`INTERNET`** — используется только для **опционального бэкапа в Google Drive**. В текущей версии Приложение не использует сетевой доступ для сбора или передачи ваших чатов, сообщений, настроек и любого контента разработчику. (Разрешение может также присутствовать по причинам совместимости платформы или зависимостей.)
- **`RECORD_AUDIO`** — используется только тогда, когда вы сами записываете голосовое сообщение.
- **`POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `USE_FULL_SCREEN_INTENT`, `WAKE_LOCK`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`** — используются только для **локальных отложенных напоминаний**, которые вы создаёте внутри Приложения; вся обработка уведомлений происходит на вашем устройстве.

Для основной функциональности **не** запрашиваются геолокация, контакты, SMS или камера.

### Аналитика и реклама

В текущей версии **не подключаются сторонние SDK аналитики или рекламы**. Если это изменится, политика будет обновлена до или вместе с выпуском, а раздел **«Безопасность данных»** в Google Play — приведён в соответствие.

### Дети

Приложение — универсальный инструмент для личных заметок, **не предназначенный специально для детей младше 13 лет**. Если вы родитель или опекун и считаете, что ребёнок передал персональные данные способом, который вас беспокоит, свяжитесь с нами через контакты в Google Play.

### Хранение и удаление

Данные остаются на устройстве, пока вы **не удалите отдельные чаты/сообщения**, **не очистите данные** Приложения, **не удалите** его или не удалите хранилище средствами системы. При удалении Приложения локальная база и медиафайлы, как правило, удаляются. Если вы включили опциональный бэкап в Google Drive, файл резервной копии остаётся **в вашем собственном аккаунте Google Drive**, пока вы его не удалите — **копии у нас нет**, так как мы эти данные не получаем.

### Трансграничная передача

Поскольку в текущей версии мы **не получаем** ваши чаты, сообщения, записи и настройки через Приложение, **мы их не передаём** за рубеж. Если вы включите опциональный бэкап в Google Drive, файл резервной копии хранится компанией **Google** в вашем собственном аккаунте согласно политикам Google и настройкам вашего аккаунта.

### Изменения

Политика может обновляться. Дата **«Последнее обновление»** в начале документа будет меняться. Продолжение использования Приложения после изменений означает согласие с обновлённой политикой там, где это требуется применимым правом.

---

### Hosting for Google Play / Публикация для Google Play

Опубликуйте этот документ по постоянному адресу **HTTPS**, доступному без входа в аккаунт (например, страница на сайте, GitHub Pages). Укажите URL в разделе **Privacy policy** консоли Google Play.
