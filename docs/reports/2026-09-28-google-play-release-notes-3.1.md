# Примечания к выпуску 3.1 для Google Play

**Дата:** 2026-09-28
**Промпт/задача:** текст «Что нового» для версии 3.1 с тегами всех языков Google Play.

## Что сделано
- Написаны примечания к выпуску 3.1 на 23 языках листинга. Тема одна: тематические значки теперь как у других приложений, перо — знак, фон берёт цвет обоев.
- Блок **Текст** ниже можно скопировать целиком в поле Release notes. Консоль раскладывает его по тегам локалей.
- Тот же блок записан в `docs/release/google-play-release-notes.md`.

## Изменённые файлы
- `docs/reports/2026-09-28-google-play-release-notes-3.1.md` — этот отчёт и текст для вставки.
- `docs/release/google-play-release-notes.md` — актуальные примечания вместо текста первого выпуска 3.0.

## Принятые решения
- Набор тегов тот же, что в листинге: en-US, ar, de-DE, es-419, es-ES, fr-FR, hi-IN, id, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, pt-BR, pt-PT, ru-RU, sv-SE, th, tr-TR, uk, vi, zh-CN, zh-TW.
- Название Lichka в тексте не используется: заметка только про иконку.
- В шапке релизного файла указаны `versionName` 3.1 и `versionCode` 11.

## Известные ограничения
- Файл сам в Play Console не загружается. Нужно скопировать блок **Текст**.
- Лимит поля — 500 символов на язык.

## Тестирование
- Длина каждого из 23 текстов проверена скриптом. Самый длинный — французский, 151 символ. Лимит 500 не превышен.

## Длина

| Язык | Символы |
|------|---------|
| en-US | 114 |
| ar | 95 |
| de-DE | 137 |
| es-419 | 133 |
| es-ES | 135 |
| fr-FR | 151 |
| hi-IN | 99 |
| id | 123 |
| it-IT | 111 |
| ja-JP | 47 |
| ko-KR | 51 |
| nl-NL | 133 |
| pl-PL | 112 |
| pt-BR | 128 |
| pt-PT | 122 |
| ru-RU | 105 |
| sv-SE | 112 |
| th | 85 |
| tr-TR | 114 |
| uk | 102 |
| vi | 112 |
| zh-CN | 32 |
| zh-TW | 34 |

## Текст

```
<en-US>
Themed icons now match other apps.

The feather is the icon, and the background takes the color of your wallpaper.
</en-US>
<ar>
أصبحت الأيقونات ذات السمة مثل بقية التطبيقات.

الريشة هي الرمز، والخلفية تأخذ لون خلفية الشاشة.
</ar>
<de-DE>
Themensymbole passen jetzt zu den anderen Apps.

Die Feder bleibt das Symbol, der Hintergrund übernimmt die Farbe Ihres Hintergrundbilds.
</de-DE>
<es-419>
Los íconos temáticos ahora se ven como los de las demás apps.

La pluma es el ícono y el fondo toma el color de tu fondo de pantalla.
</es-419>
<es-ES>
Los iconos temáticos ahora coinciden con los de las demás apps.

La pluma es el icono y el fondo toma el color de tu fondo de pantalla.
</es-ES>
<fr-FR>
Les icônes thématiques suivent désormais les autres applications.

La plume reste le symbole, et l'arrière-plan prend la couleur de votre fond d'écran.
</fr-FR>
<hi-IN>
थीम आइकन अब दूसरे ऐप्स जैसे दिखते हैं।

पंख आइकन रहता है, और पृष्ठभूमि आपके वॉलपेपर का रंग लेती है।
</hi-IN>
<id>
Ikon tema sekarang sama seperti aplikasi lain.

Bulu tetap menjadi ikon, dan latar belakang mengambil warna wallpaper Anda.
</id>
<it-IT>
Le icone a tema ora seguono le altre app.

La piuma resta il simbolo e lo sfondo prende il colore dello sfondo.
</it-IT>
<ja-JP>
テーマアイコンが他のアプリと同じになりました。

羽根がアイコンで、背景は壁紙の色になります。
</ja-JP>
<ko-KR>
테마 아이콘이 다른 앱과 같아졌습니다.

깃털이 아이콘이고, 배경은 배경화면 색을 따릅니다.
</ko-KR>
<nl-NL>
Themapictogrammen sluiten nu aan bij andere apps.

De veer blijft het pictogram en de achtergrond krijgt de kleur van je achtergrond.
</nl-NL>
<pl-PL>
Ikony z motywem wyglądają teraz jak w innych aplikacjach.

Pióro zostaje symbolem, a tło przyjmuje kolor tapety.
</pl-PL>
<pt-BR>
Os ícones temáticos agora acompanham os outros apps.

A pena continua sendo o ícone, e o fundo usa a cor do seu papel de parede.
</pt-BR>
<pt-PT>
Os ícones temáticos agora acompanham as outras aplicações.

A pena continua a ser o ícone e o fundo usa a cor do seu ecrã.
</pt-PT>
<ru-RU>
Тематические значки теперь как у других приложений.

Перо остаётся значком, а фон берёт цвет ваших обоев.
</ru-RU>
<sv-SE>
Temaanpassade ikoner följer nu andra appar.

Fjädern är ikonen och bakgrunden tar färgen från din bakgrundsbild.
</sv-SE>
<th>
ไอคอนตามธีมตอนนี้เหมือนแอปอื่นแล้ว

ขนนกยังเป็นไอคอน และพื้นหลังใช้สีวอลเปเปอร์ของคุณ
</th>
<tr-TR>
Temalı simgeler artık diğer uygulamalarla aynı.

Tüy simge olarak kalır, arka plan duvar kağıdınızın rengini alır.
</tr-TR>
<uk>
Тематичні значки тепер як в інших застосунках.

Перо лишається значком, а фон бере колір ваших шпалер.
</uk>
<vi>
Biểu tượng theo chủ đề giờ giống các ứng dụng khác.

Chiếc lông vẫn là biểu tượng, nền lấy màu hình nền của bạn.
</vi>
<zh-CN>
主题图标现在和其他应用一致。

羽毛是图标，背景使用壁纸的颜色。
</zh-CN>
<zh-TW>
主題圖示現在和其他應用程式一致。

羽毛是圖示，背景使用桌布的顏色。
</zh-TW>
```
