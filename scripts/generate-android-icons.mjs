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
const veinPath =
  'M67.29,38.74C62.80,41.65,59.41,43.74,53.67,50.20C49.14,55.30,46.61,59.38,44.93,61.80';
const veinStrokeWidth = 2.67;

/**
 * Themed icons tint opaque pixels and leave transparent pixels as the
 * wallpaper color (YouTube: mint plate, black mark, mint play-triangle cutout).
 * The vein is a filled outline subtracted from the feather with evenOdd,
 * because a same-color stroke would disappear once the system tints alpha.
 */
function strokeOutlinePath(segments, radius) {
  const samples = 28;
  const center = [];
  const push = (point) => {
    const last = center[center.length - 1];
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 0.02) {
      center.push(point);
    }
  };

  for (const [p0, p1, p2, p3] of segments) {
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const mt = 1 - t;
      push({
        x:
          mt ** 3 * p0.x +
          3 * mt ** 2 * t * p1.x +
          3 * mt * t ** 2 * p2.x +
          t ** 3 * p3.x,
        y:
          mt ** 3 * p0.y +
          3 * mt ** 2 * t * p1.y +
          3 * mt * t ** 2 * p2.y +
          t ** 3 * p3.y,
      });
    }
  }

  const tangentAt = (index) => {
    const a = center[Math.max(0, index - 1)];
    const b = center[Math.min(center.length - 1, index + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  };

  const left = [];
  const right = [];
  for (let i = 0; i < center.length; i += 1) {
    const tangent = tangentAt(i);
    const normal = { x: -tangent.y, y: tangent.x };
    left.push({
      x: center[i].x + normal.x * radius,
      y: center[i].y + normal.y * radius,
    });
    right.push({
      x: center[i].x - normal.x * radius,
      y: center[i].y - normal.y * radius,
    });
  }

  const wrap = (angle) => {
    let value = angle;
    while (value <= -Math.PI) value += Math.PI * 2;
    while (value > Math.PI) value -= Math.PI * 2;
    return value;
  };

  const capPoints = (origin, from, to, via) => {
    const start = Math.atan2(from.y - origin.y, from.x - origin.x);
    const end = Math.atan2(to.y - origin.y, to.x - origin.x);
    const through = Math.atan2(via.y - origin.y, via.x - origin.x);
    let delta = wrap(end - start);
    const viaDelta = wrap(through - start);
    const contains =
      delta >= 0
        ? viaDelta >= -0.05 && viaDelta <= delta + 0.05
        : viaDelta <= 0.05 && viaDelta >= delta - 0.05;
    if (!contains) {
      delta += delta > 0 ? -Math.PI * 2 : Math.PI * 2;
    }
    const points = [];
    const steps = 10;
    for (let i = 1; i < steps; i += 1) {
      const angle = start + delta * (i / steps);
      points.push({
        x: origin.x + Math.cos(angle) * radius,
        y: origin.y + Math.sin(angle) * radius,
      });
    }
    return points;
  };

  const end = center.length - 1;
  const endTangent = tangentAt(end);
  const startTangent = tangentAt(0);
  const outline = [
    ...left,
    ...capPoints(
      center[end],
      left[end],
      right[end],
      {
        x: center[end].x + endTangent.x * radius,
        y: center[end].y + endTangent.y * radius,
      },
    ),
    ...right.slice().reverse(),
    ...capPoints(
      center[0],
      right[0],
      left[0],
      {
        x: center[0].x - startTangent.x * radius,
        y: center[0].y - startTangent.y * radius,
      },
    ),
  ];

  const [first, ...rest] = outline;
  const coords = (point) =>
    `${(Math.round(point.x * 100) / 100).toFixed(2)},${(Math.round(point.y * 100) / 100).toFixed(2)}`;
  return `M${coords(first)}${rest.map((point) => `L${coords(point)}`).join('')}Z`;
}

const veinOutlinePath = strokeOutlinePath(
  [
    [
      { x: 67.29, y: 38.74 },
      { x: 62.8, y: 41.65 },
      { x: 59.41, y: 43.74 },
      { x: 53.67, y: 50.2 },
    ],
    [
      { x: 53.67, y: 50.2 },
      { x: 49.14, y: 55.3 },
      { x: 46.61, y: 59.38 },
      { x: 44.93, y: 61.8 },
    ],
  ],
  veinStrokeWidth / 2,
);
const monochromePath = `${featherPath} ${veinOutlinePath}`;

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
        android:pathData="${monochromePath}" />
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
  <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="${monochromePath}"/>
</svg>
`,
  },
  {
    path: join(resDir, 'drawable/ic_stat_notification.xml'),
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:pivotX="54"
        android:pivotY="54"
        android:scaleX="1.2"
        android:scaleY="1.2">
        <path
            android:fillColor="#FFFFFFFF"
            android:pathData="${featherPath}" />
        <path
            android:pathData="${veinPath}"
            android:strokeWidth="2.67"
            android:strokeColor="#FFFFFFFF"
            android:strokeLineCap="round"
            android:strokeLineJoin="round"
            android:fillColor="@android:color/transparent" />
    </group>
</vector>
`,
  },
  {
    path: join(designAndroidDir, 'ic_stat_notification.svg'),
    content: `<svg width="24" height="24" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(54 54) scale(1.2) translate(-54 -54)">
    <path d="${featherPath}" fill="#FFFFFF"/>
    <path d="${veinPath}" stroke="#FFFFFF" stroke-width="2.67" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
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
  console.log('✓ notification icon (ic_stat_notification)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
