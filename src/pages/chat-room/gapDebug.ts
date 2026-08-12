export const GAP_DEBUG = __DEV__;

export function logGap(label: string, data: Record<string, unknown>): void {
  if (!GAP_DEBUG) return;
  console.log(`[GAP] ${label}: ${JSON.stringify(data)}`);
}
