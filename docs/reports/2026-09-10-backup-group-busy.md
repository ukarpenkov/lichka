# Блокировка группы Backup на время долгой операции

**Дата:** 2026-09-10
**Промпт/задача:** завести фичу в `docs/features`, реализовать её и написать отчёт: при Backup/Restore GD, Export/Import to file и других долгих async-операциях дизейблить все кнопки группы Backup и показывать на нажатой строке лоадер цвета темы (как текст).

## Что сделано
- Добавлен proposal `docs/features/backup-group-busy-proposal.md` (статус implemented).
- Новый слайс `features/backup-group-busy`: хук `useBackupGroupBusy` — один эксклюзивный слот на группу (`driveBackup` / `driveRestore` / `exportFile` / `importFile`).
- `SettingsRow`: пропы `disabled` и `loading`; крутилка `ActivityIndicator` цвета `colors.ink`; заблокированные соседние строки — muted, без haptic.
- Четыре действия Backup в Settings обёрнуты в `run(...)`. Диалоги merge/replace для restore и import стали promise-based, слот держится до конца сценария (включая пикер и подтверждения). Отмена снимает busy; отмена restore после скачивания удаляет temp-файл.

## Изменённые файлы
- `docs/features/backup-group-busy-proposal.md` — описание фичи.
- `src/features/backup-group-busy/useBackupGroupBusy.ts` — хук эксклюзивного слота.
- `src/features/backup-group-busy/index.ts` — public API слайса.
- `src/features/backup-group-busy/__tests__/useBackupGroupBusy.test.ts` — тесты хука.
- `src/features/index.ts` — реэкспорт хука и типов.
- `src/pages/settings/SettingsRow.tsx` — `disabled` / `loading`, лоадер ink.
- `src/pages/settings/SettingsScreen.tsx` — слот на группе Backup, promise-диалоги.
- `src/pages/settings/__tests__/SettingsRow.test.tsx` — disabled, loading, цвет ink, children.

## Принятые решения
- Дизейбл всей группы, а не только нажатой строки — иначе можно запустить вторую операцию по тем же данным.
- Лоадер цвета `colors.ink` (тот же ink, что у текста строки), не accent.
- Busy держится на всём сценарии, включая диалоги выбора режима: иначе между download и import снова доступны соседние кнопки.
- Диалог успеха/ошибки показывается после снятия busy.
- Тема, язык и звук не блокируются — они не конфликтуют с бэкапом.

## Известные ограничения
- На устройстве не прогонялось: нет эмулятора в этой сессии. Нужна ручная проверка четырёх действий, отмены Google Sign-In / DocumentPicker и вложенного Replace.
- Пока в группе только эти четыре действия; новое долгое действие Backup нужно обернуть в тот же `run(...)`.
- Полноэкранный оверлей не делали — только группа Backup.

## Тестирование
- `npm test`: 77 suite, 583 теста — зелёные.
- Покрытие `useBackupGroupBusy.ts`: 100% statements/branches/functions/lines.
- Покрытие `SettingsRow.tsx`: 100% statements/lines/functions, branches 83% (не покрыт iOS pressed-highlight — прежнее поведение).
- eslint по изменённым файлам — без ошибок.
- Сценарии хука: слот на время task, снятие после resolve/reject, второй `run` пока занято — no-op, повтор после завершения, без `setState` после unmount.
- Сценарии строки: press+haptic, disabled без вызова, loading с лоадером ink и без press, loading+disabled сохраняет ink, children когда не loading.
