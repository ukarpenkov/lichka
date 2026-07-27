# Статус Google Drive Backup: что есть и чего не хватает

**Дата:** 2026-07-27  
**Промпт/задача:** Что нужно для бэкапа с Google Drive, чего не хватает

## Что сделано
- Проанализирован код `src/features/google-drive/`, UI в Settings, спеки и прошлые отчёты
- Составлен статус: код MVP есть, блокер — OAuth credentials; медиа в Drive — follow-up T9

## Изменённые файлы
- (none — анализ без изменений кода)

## Принятые решения
- Актуальный контракт MVP: только ручной backup/restore JSON в `appDataFolder`
- Главный блокер запуска: placeholder `YOUR_WEB_CLIENT_ID` + отсутствие GCP setup

## Известные ограничения
- Drive бэкап без медиа (T9 open)
- Нет unit-тестов модуля google-drive
- Auto-sync / шифрование — не в MVP

## Тестирование
- Не проводилось (статус по коду и документации)
