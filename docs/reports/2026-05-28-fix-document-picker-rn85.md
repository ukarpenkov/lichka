# Исправление react-native-document-picker для RN 0.85

**Дата:** 2026-05-28
**Промпт/задача:** Ошибка сборки Android — `GuardedResultAsyncTask` не найден в RN 0.85

## Что сделано
- Диагностирована несовместимость `react-native-document-picker@9.3.1` с React Native 0.85 (New Architecture)
- Установлен `patch-package` как dev-зависимость
- Создан патч, заменяющий `GuardedResultAsyncTask` на стандартный `android.os.AsyncTask`
- Добавлен `postinstall` скрипт для автоматического применения патча
- Сборка Android успешна, приложение установлено на эмулятор

## Изменённые файлы
- `package.json` — добавлен `postinstall: "patch-package"`, добавлен `patch-package` в devDependencies
- `patches/react-native-document-picker+9.3.1.patch` — патч для замены GuardedResultAsyncTask на AsyncTask
- `node_modules/react-native-document-picker/...` — применён патч (временное изменение)

## Принятые решения
- Использован `patch-package` вместо ожидания обновления библиотеки (9.3.1 — последняя версия, фикса нет)
- `GuardedResultAsyncTask` заменён на `AsyncTask<Void, Void, ReadableArray>` с сохранением логики

## Известные ограничения
- Патч необходимо проверять при обновлении `react-native-document-picker`
- Если библиотека выпустит исправление, патч можно удалить

## Тестирование
- Android сборка прошла успешно (`BUILD SUCCESSFUL`)
- Приложение установлено на эмулятор API 35
