# Баг: React Native DevTools не работает

## Описание
После обновления React Native до 0.85.3 DevTools перестал работать — при открытии дебаггера (клавиша `j`) показывается пустой экран. Компоненты, хуки, network и прочие вкладки DevTools недоступны.

## Окружение
- React Native: 0.85.3
- React: 19.2.3
- Hermes: включён
- New Architecture: включена
- ОС: Windows 11

## Причина
Известная проблема в React Native 0.85.x. DevTools не подключается к приложению, экран остаётся пустым. Вероятно связана с изменениями в протоколе дебаггинга или в интеграции с Hermes в новой версии.

## Связанные issue
- [react/react-native#56714](https://github.com/react/react-native/issues/56714) — `[0.85.3] React Native DevTools not working`

## Влияние на проект
- Невозможно инспектировать компоненты и дерево React через DevTools
- Невозможно использовать вкладку Network для отладки запросов
- Ограниченная возможность дебагинга хуков и состояния

## Workaround / Решение
Установка Watchman + полная очистка кеша:

```bash
# 1. Установить Watchman
winget install Facebook.Watchman

# 2. Очистить node_modules и lock-файлы
rm -rf node_modules package-lock.json yarn.lock

# 3. Очистить Android build кэш
rm -rf android/.gradle android/app/build android/build

# 4. Переустановить зависимости
npm install --legacy-peer-deps

# 5. Запустить Metro с очисткой кеша
npx react-native start --reset-cache

# 6. В другом терминале запустить приложение
npx react-native run-android

# 7. Нажать j в терминале Metro для открытия DevTools
```

**Альтернатива (без Watchman):** отредактировать `node_modules/@react-native/dev-middleware/dist/createDevMiddleware.js` — убрать проверку `experiments.enableOpenDebuggerRedirect`, затем открыть `http://localhost:8081/open-debugger` в браузере.

## Статус
Решено — установка Watchman решает проблему. См. [react/react-native#56714](https://github.com/react/react-native/issues/56714)
