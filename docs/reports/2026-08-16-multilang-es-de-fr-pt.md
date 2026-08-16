# Мультиязычность: локали es, de, fr, pt

**Дата:** 2026-08-16
**Промпт/задача:** добавление четырёх новых локалей интерфейса (испанский, немецкий, французский, португальский) к существующим ru/en

## Что сделано
- Локализация переведена с монолитного `locale.ts` (ru/en) на каталог `src/shared/config/locale/` с бандлами по языкам: `ru.ts`, `en.ts`, `es.ts`, `de.ts`, `fr.ts`, `pt.ts`
- Введён тип `LocaleBundle` (`types.ts`): словарь `LocaleDictionary` + `monthsFull`/`monthsShort` + `DateLocaleConfig` (порядок день/месяц, разделители, числовой формат, `localeTag`)
- Единый реестр `locale/index.ts`: `Locale` выводится из ключей реестра `bundles`, `dictionaries`, `SUPPORTED_LOCALES`, `getLocaleBundle`; `getSystemLocale` определяет язык устройства по списку поддерживаемых
- `dateUtils.ts` очищен от хардкода `locale === 'ru'` — форматы дат берутся из `DateLocaleConfig` бандла
- `SettingsScreen` строит пилюли выбора языка из `SUPPORTED_LOCALES` (+ `flexWrap`), типизация `handleLocaleChange` — `Locale` вместо `string`
- Публичный API `shared/config/index.ts` дополнен `getLocaleBundle` и типом `LocaleBundle`; прямые экспорты `ru`/`en` удалены

## Изменённые файлы
- `src/shared/config/locale.ts` — удалён (разбит на каталог `locale/`)
- `src/shared/config/locale/types.ts` — новый: `LocaleDictionary`, `DateLocaleConfig`, `LocaleBundle`
- `src/shared/config/locale/{ru,en,es,de,fr,pt}.ts` — новые бандлы (по 171 строке, ~175 ключей в каждом)
- `src/shared/config/locale/index.ts` — новый: реестр бандлов, `SUPPORTED_LOCALES`, `getDictionary`, `getLocaleBundle`, `getSystemLocale`
- `src/shared/config/dateUtils.ts` — data-driven форматирование дат вместо per-locale ветвлений
- `src/shared/config/index.ts` — обновлён публичный экспорт локалей
- `src/pages/settings/SettingsScreen.tsx` — список языков из `SUPPORTED_LOCALES`, `flexWrap`, типизация `Locale`
- `src/shared/config/__tests__/locale.test.ts` — паритет ключей и шаблонов по всем 6 локалям, тест бандлов (12 месяцев, `localeTag`)
- `src/shared/config/__tests__/dateUtils.test.ts` — форматы дат и подписи для es/de/fr/pt
- `docs/features/multilang-es-de-fr-pt-proposal.md` — proposal фичи, статус `implemented`

## Принятые решения
- Бандлы вместо i18next: шаблонные функции покрывают потребности, без новой зависимости; добавление языка = 1 файл + 1 строка в реестре
- `Record<Locale, LocaleBundle>`/вывод `Locale` из реестра даёт ошибку компиляции при неполном словаре
- `DateLocaleConfig` data-driven — поведение ru/en не изменилось, форматы новых языков задаются конфигом, а не кодом
- Числовые даты: `es/fr/pt` — день/месяц через `/`, `de` — `15.01.2024`

## Известные ограничения
- Переводы es/de/fr/pt выполнены машинно — требуется ревью носителями
- RTL-языки (ar/he) этой итерацией не поддерживаются
- `npx tsc --noEmit` падает на несвязанных pre-existing ошибках в `ImageMessage.test.tsx` (тип `MessageType`), к данной фиче отношения не имеет

## Тестирование
- `npx jest src/shared/config/__tests__/locale.test.ts src/shared/config/__tests__/dateUtils.test.ts` — 2 suites, 47 тестов, все зелёные
- Покрыто: паритет ключей 6 словарей, шаблонные функции, 12 месяцев и `localeTag` в бандлах, `formatDateLabel`/`formatScheduledAt`/`formatRelativeDate`/`formatScheduledWhen` для es/de/fr/pt
