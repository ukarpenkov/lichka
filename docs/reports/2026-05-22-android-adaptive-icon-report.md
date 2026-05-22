# Android adaptive icon с monochrome-поддержкой

**Дата:** 2026-05-22  
**Промпт/задача:** Сделать иконку приложения из `design/icons/icon.svg` с поддержкой themed icons (monochrome), адаптацией под все Android-устройства (Pixel, Xiaomi и др.), без выхода за границы и с центрированием.

## Что сделано

- Исправлены **adaptive layers** (Android 8.0+):
  - `ic_launcher_background` — белый слой на весь 108×108 viewport, без внутренних скруглений, чтобы маску задавал лаунчер устройства
  - `ic_launcher_foreground` — логотип (#2B2E33 + белая обводка)
  - `ic_launcher_monochrome` — слой для Material You (Android 13+)
- Логотип **центрирован** относительно 108×108 dp с pivot в (54, 54), масштаб 72/1024 — контент укладывается в safe zone 66 dp (границы ~33–81 dp), не обрезается на круглых (Pixel) и squircle (Xiaomi) масках.
- **Monochrome:** маской стали белые области исходной иконки (фон + белая линия); тёмный силуэт сделан вырезом через `evenOdd`, поэтому themed icons tint'ят именно белые части системным цветом (жёлтым и т.д.).
- Добавлены `mipmap-anydpi-v26/ic_launcher.xml` и `ic_launcher_round.xml` с `<monochrome>`.
- Перегенерированы legacy PNG для API < 26 (все плотности mdpi–xxxhdpi, square + round).
- Скрипт `scripts/generate-android-icons.mjs` теперь пересоздаёт не только legacy PNG, но и adaptive XML/SVG-ресурсы, чтобы правки были воспроизводимыми.

## Изменённые файлы

- `design/icons/android/ic_launcher_background.svg` — исходник фона
- `design/icons/android/ic_launcher_foreground.svg` — исходник foreground
- `design/icons/android/ic_launcher_monochrome.svg` — исходник monochrome
- `android/app/src/main/res/drawable/ic_launcher_background.xml`
- `android/app/src/main/res/drawable/ic_launcher_foreground.xml`
- `android/app/src/main/res/drawable/ic_launcher_monochrome.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`
- `android/app/src/main/res/mipmap-*/ic_launcher.png` — все плотности
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png` — все плотности
- `scripts/generate-android-icons.mjs` — генератор PNG
- `package.json` — devDependency `sharp`, скрипт `icons:android`

## Принятые решения

- **Векторные слои** вместо bitmap для adaptive icon — чёткость на любой плотности, стабильность при parallax-анимациях лаунчеров.
- **Background без скруглений** — Android/Pixel/MIUI сами применяют круг, squircle или другую маску; внутренний rounded rect мог давать визуально “белую плашку” и нестабильные края.
- **Foreground внутри safe zone** — фигура остаётся по центру и не выходит за область, которую лаунчеры могут анимировать или маскировать.
- **Monochrome через evenOdd** — тематический tint применяется к белому фону и белой линии, а тёмный лист остаётся вырезом/контрастной областью.
- Legacy PNG рендерятся из исходного `design/icons/icon.svg` для единообразия.

## Известные ограничения

- Themed icons работают только на **Android 13+** с включённой опцией «Themed icons» в лаунчере.
- На MIUI/HyperOS поведение themed icons зависит от версии оболочки.
- Белая обводка в monochrome сливается с tinted-фоном (оба получают один системный цвет) — это ожидаемое поведение Material You.

## Тестирование

- `node scripts/generate-android-icons.mjs` — PNG сгенерированы для 5 плотностей
- `./gradlew :app:processDebugResources` — успешно, Android resources валидны
- `./gradlew :app:assembleDebug` — ресурсы прошли, но полная сборка остановилась позже на `react-native-reanimated` CMake/Ninja: `failed recompaction: Permission denied` в `node_modules/react-native-reanimated/android/.cxx/...`
