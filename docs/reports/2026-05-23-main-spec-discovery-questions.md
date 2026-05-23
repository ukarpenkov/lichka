# Вопросы для основного ТЗ (discovery)

**Дата:** 2026-05-23
**Промпт/задача:** Сформировать вопросы от лица UX/UI, SQLite, Android, пользователя и аналитика на базе чернового ТЗ; зафиксировать первые ответы пользователя по MVP (чаты).

## Что сделано
- Прочитан `docs/spec/draft-requirements.md`
- Сформулировано 83 вопроса по 5 ролям + 5 ключевых решений (A–E)
- Учтены принципы пользователя: гибкость, минимум шагов, минимализм (3 цвета, text-кнопки)
- Выявлены противоречия черновика: general notes vs MVP scope, auto-sync Drive, анимации vs минимализм
- **Зафиксированы ответы пользователя:**
  - **A:** MVP = только чат (минимально — лента сообщений); заметки → v2+, прикреплены к чату
  - **E:** канал по типу отправки — напоминание и периодичность → push; будильник → full-screen alarm (~10 мин или стандартная длительность)
  - Список чатов: круглый аватар + название, вертикальный список
  - Отправка из чата: заметка / push с временем / будильник / периодичность (15 мин, каждый день и т.д.)
  - **B:** при запуске — **список журналов (Home)**
  - **#2:** нижняя навигация — **3 таба:** Чаты | Запланировано | Настройки; «Запланировано» = напоминания и будильники по времени, тап → чат
  - **#3:** без FAB для быстрой записи; в чате — поле + **4 иконки** (сообщение, напоминание, будильник, периодичность)
  - **#13:** picker даты/времени — 2 круга (дни/месяцы), центр часы+минуты, год справа сверху
  - **#28:** периодичность — пресеты 5/10/15 мин, час, день + кастом внизу экрана
  - **#4:** FAB справа снизу на «Чаты» → форма: название + аватар (галерея **или emoji Android**) + редактор под круг для картинки
  - **#6:** идентификация чата — только круглый аватар (фото / emoji); **без цвета журнала и без маркера**; fallback — первая буква названия (монохром)
  - **#7, #8:** text-кнопки без border для форм; **иконки** — нижняя навигация + **4 действия отправки в чате** (сообщение, напоминание, будильник, периодичность); border — точечно в будущем
  - **#9, #10, #24, #83 (уточнение):** MVP — только чат; v2+ — заметки **прикреплены к чату** (`chat_id`), не global notes / параллельный мир
  - **#11, #36:** глобальный поиск на табе «Чаты» (по всем сообщениям); внутри чата — поиск только по этому чату; FTS5
  - **#37:** статистика активности — **не нужна**; out of scope (без таблицы, экрана, precompute/on-the-fly)
  - **#38:** настройки — **в SQLite** (`settings` key-value); MMKV/AsyncStorage не в MVP; исключение — snapshot темы в MMKV, если cold start мигает/тормозит
  - **#39:** Kotlin-native **да** — MVP: AlarmActivity + notification channels; FGS для голоса и biometrics — не в v1
  - **#40:** minSdk **API 24 (Android 7.0)**; Google Play — targetSdk 35+ (в проекте 36); minSdk выше не поднимаем без причины
  - **#42:** exact alarms — **`SCHEDULE_EXACT_ALARM`** (не `USE_EXACT_ALARM`); только тип **`alarm`** через `setAlarmClock()`; reminder/periodic — inexact/WorkManager; текст для Google Play Console + in-app rationale перед первым будильником; fallback при отказе
  - **#43:** battery optimization — onboarding **только для `alarm`**, после первого будильника (вместе с #42); технический стек как у Clock (`setAlarmClock`, AlarmActivity, wake lock, full-screen intent); `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` с rationale; не для reminder/periodic
  - **#15:** анимации — везде уместные, максимально плавные, не броские; приоритет perf (без лагов), приятные micro-interactions
  - **#16:** haptic + sound — по умолчанию включены; отключение в настройках
  - **#17:** 120 FPS — желательный ориентир; hard requirement ≥60 FPS; Reanimated 4 + Gesture Handler; стек анимаций по сценариям (#15); SET experimental — fallback
  - **#18:** преднастроенные темы; light — `#FAFAFA` + `#000`; dark — `#000000` + `#FFF`; не system theme
  - **#19 (уточнение):** приоритет — настройки (11 пресетов + кастом фон/текст); Material You dynamic color — опция в настройках, если SDK подбирает пару фон + текст; accent из Material You не используем
  - **#20:** touch targets — приоритет скорости записи/отправки в composer; toolbar/text-кнопки компактнее; не жёсткие 48dp везде
  - **#22:** редактирование текста — только последняя версия + `updated_at`; история правок не хранится
  - **#23:** удаление — hard delete; без `deleted_at`
  - **#25:** миграции — numbered SQL (`001`, `002`…), `schema_migrations`, runner при старте; forward-only; op-sqlite
  - **#26:** гибрид JSON + колонки — `scheduled_at`/`interval_minutes`/`enabled` в колонках; `payload` для полей по `type`; `metadata` post-MVP; отдельные таблицы только для 1:N (attachments, blocks)
  - **#30, #69:** Google Calendar — out of MVP v1; post-MVP через Intent/query string (открыть Calendar с предзаполненным событием); без OAuth, API, `sync_queue`
  - **#31, #32:** относительные пути `media/` от sandbox; `resolveMediaPath()` в `shared/`; галерея → копия в sandbox; startup orphan cleanup; delete files при hard delete
  - **#33, #49:** один compressed файл на изображение; без original/thumbnail на диске; avatars ~512 px; message images post-MVP ~1200–1600 px
  - **#9d–#9e / модель MVP:** в БД **Чат → Сообщение**; типы `simple`, `reminder`, `alarm`, `periodic`; напоминание в ленте — когда наступит время
  - **C / #5:** только ч/б без акцента; дефолт light/dark; в настройках — **11 пресетов** (фон→текст)
  - **D:** шифрование **не в MVP v1** — отложено на следующий этап

## Изменённые файлы
- `docs/spec/white-requirements.md` — … **#37–#40** (статистика, настройки SQLite, Kotlin modules, minSdk)
- `docs/reports/2026-05-23-main-spec-discovery-questions.md` — обновлён отчёт

## Принятые решения
- Основное ТЗ (`docs/spec/requirements.md`) создаётся **после** ответов пользователя на вопросы
- Приоритет при конфликте в черновике: скорость и тишина UI > декоративность
- MVP v1 = **только чат** (Чат → Сообщение); заметки — v2+, **прикреплены к чату**, не global notes; 4 типа сообщений (`simple`, `reminder`, `alarm`, `periodic`)
- При запуске всегда таб «Чаты» — список журналов, не последний открытый
- Нижняя навигация MVP: **Чаты**, **Запланировано**, **Настройки** — без отдельного таба Reminders; тип напоминания выбирается в чате
- Тема: дефолт light `#FAFAFA`/`#000`, dark `#000`/`#FFF`; 11 пресетов; не system theme; Material You — опционально, если SDK даёт пару фон + текст (#19)
- Шифрование (export, БД at rest) — out of MVP v1, roadmap v2+
- Ввод только внутри чата: **4 иконки отправки** (сообщение, напоминание, будильник, периодичность); FAB только для создания нового чата на табе «Чаты»
- Создание чата: FAB → форма (название + аватар: галерея или emoji Android) + редактор под круг только для картинки
- Идентификация чата: аватар (фото / emoji / буква-fallback), без отдельного цвета журнала
- UI controls: text-кнопки без border (формы); иконки — нижние табы + 4 действия отправки в чате; border в MVP нет
- Picker даты/времени: концентрические круги (дни, месяцы) + часы/минуты по центру + год справа сверху
- Периодичность: пресеты 5/10/15 мин, час, день; кастомный интервал внизу экрана
- Напоминания: тип кнопки определяет канал — push для напоминания/периодичности, full-screen alarm для будильника
- Поиск: глобальный на табе «Чаты» (все сообщения); локальный — внутри открытого чата
- Статистика активности (#37): **не в продукте** — без экрана, без отдельной таблицы в БД
- Настройки (#38): **SQLite `settings`** — единый источник правды; MMKV только как опциональный cache темы при проблемах cold start; AsyncStorage не используем
- Kotlin (#39): нативный код **допустим**; MVP — full-screen alarm + notification channels; foreground service (голос) и biometrics — позже
- Android minSdk (#40): **API 24 (Android 7.0)**; Play требует targetSdk 35+ — в `android/build.gradle` уже `targetSdkVersion = 36`
- Exact alarms (#42): **`SCHEDULE_EXACT_ALARM`** для типа `alarm` (`setAlarmClock` → full-screen); не `USE_EXACT_ALARM` (не dedicated clock app); reminder/periodic без exact; Google Play declaration + `canScheduleExactAlarms()` / `ACTION_REQUEST_SCHEDULE_EXACT_ALARM`; fallback при отказе
- Battery optimization (#43): onboarding **только для `alarm`**, после первого будильника (flow #42); `setAlarmClock` + AlarmActivity + wake lock + full-screen intent; опционально `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`; повтор в настройках «Надёжность будильника»; не для reminder/periodic
- Анимации: везде уместные, плавные, не броские; perf > декоративность; micro-interactions (сообщения, переходы, голос, sticky dates, shared transitions) — да, если без лагов
- Haptic + sound: по умолчанию включены; отключение в настройках
- FPS / Reanimated: ≥60 FPS hard; 120 FPS target на 120 Hz; Reanimated 4 + Gesture Handler; entering/layout/keyboard/gestures — must; shared transitions — nice-to-have с fallback
- Touch targets (#20): скорость в composer (ввод, 4 иконки, голос) > жёсткий 48dp; toolbar/text-кнопки — компактнее
- Редактирование (#22): только последняя версия текста + `updated_at`; без истории правок
- Удаление (#23): hard delete — физическое удаление из БД; `deleted_at` не используем
- Контент-модель (#9, #24, #83): MVP — просто чат; v2+ — notes с `chat_id`, без отдельного «мира» заметок
- Миграции БД (#25): numbered SQL + `schema_migrations`, применение при старте; без ORM autogenerate; op-sqlite
- Расширяемость БД (#26): гибрид — колонки для ядра и полей запросов/планировщика; JSON `payload` для вариативности по `type`; JSON `metadata` post-MVP; отдельные таблицы — только 1:N (attachments, v2+ blocks)
- Google Calendar (#30, #69): out of MVP v1; post-MVP — Intent/query string в приложение Calendar; без OAuth, Calendar API, `sync_queue`; локальные push/alarm остаются основным каналом
- Медиа (#31, #32): относительные пути от sandbox (`media/avatars|voice|images/`); resolver в `shared/`; orphan cleanup при старте; удаление файлов при hard delete
- Изображения (#33, #49): один compressed файл; resize при импорте; без original/thumb; тот же файл в ленте и full-screen

## Открытые вопросы (следующий шаг)
- **Запланировано:** что показывать в элементе списка (текст сообщения, название чата, время, тип)?
- **Запланировано:** периодические напоминания — одна строка на серию или каждое следующее срабатывание?
- **41:** будильник — full-screen alarm зафиксирован; уточнить snooze-интервалы (5/10/15/30 мин)?
- **44:** каналы уведомлений (alarms, reminders, …)
- Переключение light/dark — system theme, toggle в настройках, или оба?

## Известные ограничения
- Проект на ранней стадии (FSD-scaffold без схемы БД)
- Часть вопросов требует product-решения, не технического

## Тестирование
- Не применимо (анализ и планирование)
