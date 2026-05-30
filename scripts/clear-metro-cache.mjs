/**
 * Remove Metro file-map and transform caches (fixes "Unable to deserialize cloned data").
 * Run: node scripts/clear-metro-cache.mjs
 */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const CACHE_PREFIXES = ['metro-file-map', 'metro-cache', 'haste-map'];

function removeMatching(dir, prefixes) {
  let removed = 0;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return removed;
  }
  for (const name of entries) {
    if (!prefixes.some((prefix) => name.startsWith(prefix))) {
      continue;
    }
    const path = join(dir, name);
    try {
      const stat = statSync(path);
      rmSync(path, { recursive: true, force: true });
      removed += 1;
      console.log(`Removed ${stat.isDirectory() ? 'dir' : 'file'}: ${path}`);
    } catch (err) {
      console.warn(`Skip ${path}: ${err.message}`);
    }
  }
  return removed;
}

const tempDir = tmpdir();
let total = removeMatching(tempDir, CACHE_PREFIXES);
total += removeMatching(root, ['.metro-health-check']);
total += removeMatching(join(root, 'node_modules', '.cache'), CACHE_PREFIXES);

if (total === 0) {
  console.log(`No Metro cache entries found under ${tempDir} or project.`);
} else {
  console.log(`Cleared ${total} Metro cache entr${total === 1 ? 'y' : 'ies'}.`);
}
