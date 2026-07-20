/**
 * Apply alpha to a solid #RRGGBB (or #RGB) color.
 * Returns rgba() — never string-concat hex suffixes.
 */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.min(1, Math.max(0, alpha));
  const normalized = hex.trim().replace(/^#/, '');

  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return hex;
  }

  let r = 0;
  let g = 0;
  let b = 0;

  if (normalized.length === 3) {
    r = parseInt(normalized[0] + normalized[0], 16);
    g = parseInt(normalized[1] + normalized[1], 16);
    b = parseInt(normalized[2] + normalized[2], 16);
  } else {
    r = parseInt(normalized.slice(0, 2), 16);
    g = parseInt(normalized.slice(2, 4), 16);
    b = parseInt(normalized.slice(4, 6), 16);
  }

  const rounded = Math.round(a * 1000) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${rounded})`;
}
