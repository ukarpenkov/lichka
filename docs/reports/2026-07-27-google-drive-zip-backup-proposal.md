# Proposal: Google Drive ZIP backup

**Дата:** 2026-07-27  
**Промпт/задача:** Распиши в docs/features шаги, чтобы в приложении заработал бэкап по кнопке в Google Drive в ZIP

## Что сделано
- Создан proposal `docs/features/google-drive-zip-backup-proposal.md` (статус draft)
- Описаны два блока: A) GCP OAuth/Drive API credentials, B) переход upload/download с JSON на ZIP с медиа
- Добавлен чеклист шагов «чтобы кнопка заработала» и влияние на FSD

## Изменённые файлы
- `docs/features/google-drive-zip-backup-proposal.md` — новый proposal
- `docs/reports/2026-07-27-google-drive-zip-backup-proposal.md` — этот отчёт

## Принятые решения
- Цель: один файл `licka-backup.zip` в `appDataFolder` (overwrite), переиспользование `exportToZIP` / `importFromZIP`
- Legacy `licka-backup.json` при restore — fallback
- GCP setup обязателен параллельно с кодом (без webClientId кнопка не живёт)

## Известные ограничения
- Proposal в статусе draft — реализация после approve
- Resumable upload для больших архивов — рекомендуется, в MVP возможен упрощённый multipart

## Тестирование
- Не проводилось (только документация)
