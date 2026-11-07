import { useEffect, useState } from 'react';
import { searchMessages, type SearchResult } from '../db/search';

type MessageSearchOptions = {
  chatId?: string;
  resetWhen?: boolean;
};

export function useMessageSearch(
  query: string,
  options?: MessageSearchOptions,
): SearchResult[] {
  const chatId = options?.chatId;
  const resetWhen = options?.resetWhen ?? false;
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (resetWhen) {
      setResults([]);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setResults(searchMessages(trimmed, chatId));
  }, [query, chatId, resetWhen]);

  return results;
}
