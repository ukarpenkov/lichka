/**
 * Generate Android launcher icon resources from design/icons/icon.svg.
 * Run: node scripts/generate-android-icons.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourceSvg = join(root, 'design/icons/icon.svg');
const resDir = join(root, 'android/app/src/main/res');
const designAndroidDir = join(root, 'design/icons/android');

const DENSITIES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const svgBuffer = readFileSync(sourceSvg);
const featherPath =
  'M71.86,31.36C60.61,35.58,48.94,46.13,41.91,57.38C36.28,66.52,33.47,74.25,32.77,78.47C36.98,77.77,44.72,74.95,53.86,69.33C65.11,62.30,74.95,51.05,79.17,39.80C80.58,36.28,79.88,33.47,77.06,31.36C74.95,29.95,73.27,30.66,71.86,31.36Z';
const monochromeFeatherCutout =
  'M71.86,31.36 C60.61,35.58 48.94,46.13 41.91,57.38 C36.28,66.52 33.47,74.25 32.77,78.47 C36.98,77.77 44.72,74.95 53.86,69.33 C65.11,62.30 74.95,51.05 79.17,39.80 C80.58,36.28 79.88,33.47 77.06,31.36 C74.95,29.95 73.27,30.66 71.86,31.36 Z';
const veinPath =
  'M67.29,38.74C62.80,41.65,59.41,43.74,53.67,50.20C49.14,55.30,46.61,59.38,44.93,61.80';

const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
    <monochrome android:drawable="@drawable/ic_launcher_monochrome" />
</adaptive-icon>
`;

const resources = [
  {
    path: join(resDir, 'drawable/ic_launcher_background.xml'),
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M0,0H108V108H0Z" />
</vector>
`,
  },
  {
    path: join(resDir, 'drawable/ic_launcher_foreground.xml'),
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#2B2E33"
        android:pathData="${featherPath}" />
    <path
        android:pathData="${veinPath}"
        android:strokeWidth="2.67"
        android:strokeColor="#FFFFFF"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:fillColor="@android:color/transparent" />
</vector>
`,
  },
  {
    path: join(resDir, 'drawable/ic_launcher_monochrome.xml'),
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFFFF"
        android:fillType="evenOdd"
        android:pathData="M0,0H108V108H0Z ${monochromeFeatherCutout}" />
    <path
        android:pathData="${veinPath}"
        android:strokeWidth="2.67"
        android:strokeColor="#FFFFFFFF"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:fillColor="@android:color/transparent" />
</vector>
`,
  },
  {
    path: join(resDir, 'mipmap-anydpi-v26/ic_launcher.xml'),
    content: adaptiveIconXml,
  },
  {
    path: join(resDir, 'mipmap-anydpi-v26/ic_launcher_round.xml'),
    content: adaptiveIconXml,
  },
  {
    path: join(designAndroidDir, 'ic_launcher_background.svg'),
    content: `<svg width="108" height="108" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="108" height="108" fill="#FFFFFF"/>
</svg>
`,
  },
  {
    path: join(designAndroidDir, 'ic_launcher_foreground.svg'),
    content: `<svg width="108" height="108" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="${featherPath}" fill="#2B2E33"/>
  <path d="${veinPath}" stroke="#FFFFFF" stroke-width="2.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  },
  {
    path: join(designAndroidDir, 'ic_launcher_monochrome.svg'),
    content: `<svg width="108" height="108" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="M0 0H108V108H0V0Z ${monochromeFeatherCutout}"/>
  <path d="${veinPath}" stroke="#FFFFFF" stroke-width="2.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  },
];

function roundMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`,
  );
}

async function renderIcon(size, round = false) {
  let pipeline = sharp(svgBuffer, { density: 384 }).resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (round) {
    pipeline = pipeline
      .ensureAlpha()
      .composite([{ input: roundMask(size), blend: 'dest-in' }]);
  }

  return pipeline.png().toBuffer();
}

async function main() {
  for (const resource of resources) {
    mkdirSync(dirname(resource.path), { recursive: true });
    writeFileSync(resource.path, resource.content);
  }

  for (const [folder, size] of Object.entries(DENSITIES)) {
    const dir = join(resDir, folder);
    mkdirSync(dir, { recursive: true });

    const square = await renderIcon(size, false);
    const round = await renderIcon(size, true);

    await sharp(square).toFile(join(dir, 'ic_launcher.png'));
    await sharp(round).toFile(join(dir, 'ic_launcher_round.png'));

    console.log(`✓ ${folder} (${size}px)`);
  }

  console.log('✓ adaptive icon XML/SVG resources');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
