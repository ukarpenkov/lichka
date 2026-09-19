# Не открывать системный экран батареи при повторной постановке будильника

**Дата:** 2026-09-19
**Промпт/задача:** при постановке будильника приложение уводит на системный экран «Сведения о батарее» (на Xiaomi), чтобы выбрать «Нет ограничений». Для первого раза это нормально, но если ограничений уже нет — открытие лишнее. Убрать повторное открытие, и сделать это для всех Android-устройств, а не только Xiaomi.

## Что сделано
- Заведён баг-репорт `docs/bugs/battery-optimization-screen-opens-on-every-alarm.md` (задним числом, статус fixed).
- В `NotificationModule` добавлен `@ReactMethod isIgnoringBatteryOptimizations(promise)` — спрашивает у `PowerManager`, находится ли пакет в doze-whitelist. На API < 23 возвращает `true`.
- В shared-слой добавлена JS-обёртка `isIgnoringBatteryOptimizations()` и реэкспорт из `shared/lib`.
- `requestBatteryOptimizationExemption()` стал `async`: сначала сверяется с реальным состоянием системы и молча выходит, если ограничений нет. Системный экран открывается только когда приложение действительно под ограничениями.
- Оба вызова в `MessageComposer` (обычная постановка будильника и путь через alarm-guide при первом будильнике) переведены на `await`.
- Новый тест-файл на слайс `features/notifications` — раньше тестов у модуля не было.

## Изменённые файлы
- `docs/bugs/battery-optimization-screen-opens-on-every-alarm.md` — описание бага, корневая причина, решение.
- `android/app/src/main/java/com/lichka/NotificationModule.kt` — метод `isIgnoringBatteryOptimizations()`, импорт `android.os.PowerManager`.
- `src/shared/lib/notificationChannels.ts` — обёртка `isIgnoringBatteryOptimizations()`.
- `src/shared/lib/index.ts` — реэкспорт обёртки в public API слоя.
- `src/features/notifications/requestExactAlarmPermission.ts` — проверка состояния перед открытием системного экрана, функция стала асинхронной.
- `src/features/notifications/__tests__/requestExactAlarmPermission.test.ts` — новые тесты (6 сценариев).
- `src/widgets/message-composer/MessageComposer.tsx` — `await requestBatteryOptimizationExemption()` в двух местах.
- `src/widgets/message-composer/__tests__/MessageComposer.test.tsx` — мок возвращает Promise.

## Принятые решения
- Проверка через `PowerManager.isIgnoringBatteryOptimizations()`, а не через флаг в AsyncStorage: только системный API отражает фактическое состояние (пользователь мог отключить исключение в настройках вручную, а на Xiaomi «Нет ограничений» из App info → Battery мапится именно на doze-whitelist).
- Никаких вендорных веток (MIUI/EMUI/ColorOS): API стандартный с Android 6, поведение одинаково на всех устройствах.
- Флаг сессии `batteryOptimizationRequested` оставлен **после** проверки состояния: если пользователь отказался, в рамках одного запуска приложения его больше не трогаем, но при следующем запуске предложим снова — от исключения зависит гарантированное срабатывание будильника.
- Новое разрешение в манифест не требуется: `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` уже объявлено, а для чтения состояния разрешение не нужно.
- Порядок «сначала запрос разрешения, потом отправка сообщения» сохранён — изменился только `await`.

## Известные ограничения
- На устройстве не проверялось: в этой сессии нет эмулятора/девайса. Нужна ручная проверка на Xiaomi: выдать «Нет ограничений» → перезапустить приложение → поставить будильник (экран настроек не должен открываться); затем вернуть ограничения и убедиться, что экран снова открывается.
- Изменения нативные — нужна пересборка APK/AAB, перезагрузки JS-бандла недостаточно.
- Вендорные механизмы поверх стандартного doze (MIUI Autostart, «Блокировка в памяти») этим API не покрываются — про них по-прежнему рассказывает текстовый alarm-guide при первом будильнике.
- Если пользователь отказался, при следующем запуске приложения первый будильник снова откроет системный экран (осознанное решение, см. выше).

## Тестирование
- `npx jest`: 78 suite, 589 тестов — зелёные.
- Покрытие `requestExactAlarmPermission.ts`: 100% lines/functions, 93.75% statements, 90% branches (не покрыта ветка раннего `return true` в `ensureExactAlarmPermission` для не-Android).
- `npx eslint` по изменённым файлам — без ошибок.
- `./gradlew :app:compileDebugKotlin` — успешно, нативный модуль компилируется.
- `npx tsc --noEmit` — по изменённым файлам чисто; остались три прежние ошибки в `useLauncherShortcut.test.ts`, `useWidgetNavigation.test.ts`, `useShareNavigation.test.ts` (тип мока `addListener`), к задаче не относятся.
- Покрытые сценарии: исключение уже выдано → системный экран не открывается; ограничения активны → экран открывается один раз; повторный вызов в той же сессии → второго открытия нет; iOS → нативный модуль не дёргается; exact alarms разрешены → `true` без открытия настроек; exact alarms запрещены → `false` и открытие настроек.
