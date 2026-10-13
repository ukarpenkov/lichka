import { generateId } from '../../../shared/lib';
import type { ChecklistItem } from './types';

/** Preserve identity and completion only for unchanged items, including duplicates. */
export function checklistFromText(
  body: string,
  previous: readonly ChecklistItem[] = [],
): ChecklistItem[] {
  const remaining = new Map<string, ChecklistItem[]>();
  for (const item of previous) {
    const matches = remaining.get(item.text) ?? [];
    matches.push(item);
    remaining.set(item.text, matches);
  }
  return body.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(text => {
    const existing = remaining.get(text)?.shift();
    return existing ?? { id: generateId(), text, checked: false };
  });
}

export function isChecklist(value: unknown): value is ChecklistItem[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const ids = new Set<string>();
  return value.every(item => {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
        typeof item.text !== 'string' || !item.text.trim() || /[\r\n]/.test(item.text) ||
        typeof item.checked !== 'boolean') return false;
    ids.add(item.id);
    return true;
  });
}

export function parseChecklist(json: unknown): ChecklistItem[] | null {
  if (typeof json !== 'string') return null;
  try {
    const value: unknown = JSON.parse(json);
    return isChecklist(value) ? value : null;
  } catch {
    return null;
  }
}
