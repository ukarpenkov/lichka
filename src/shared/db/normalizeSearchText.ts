/** Unicode-aware lowercasing for search (Cyrillic + Latin). */
export function normalizeSearchText(text: string): string {
  return text.toLocaleLowerCase();
}

/** Escape LIKE metacharacters so user input is matched literally. */
export function escapeLikePattern(text: string): string {
  return text.replace(/([\\%_])/g, '\\$1');
}
