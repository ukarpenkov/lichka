/** Convert polar coordinates to cartesian (angle in degrees, 0 = top/north). */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/** Convert cartesian pointer position to angle in degrees (0–360, 0 = top). */
export function cartesianToAngle(
  cx: number,
  cy: number,
  x: number,
  y: number,
): number {
  const dx = x - cx;
  const dy = y - cy;
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return deg;
}

/** Snap an angle (0–360) to the nearest segment index (0-based). */
export function snapToSegment(angle: number, segments: number): number {
  const step = 360 / segments;
  const idx = Math.round(angle / step) % segments;
  return idx < 0 ? idx + segments : idx;
}

/** Get the center angle of a segment index. */
export function segmentToAngle(index: number, segments: number): number {
  return (360 / segments) * index;
}

/** Get max days in a given month (1-based). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
