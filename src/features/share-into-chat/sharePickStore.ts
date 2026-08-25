import { useEffect, useState } from 'react';

import type { ShareDraft } from './shareDraft';

type Listener = (draft: ShareDraft | null) => void;

let draft: ShareDraft | null = null;
const listeners = new Set<Listener>();

export function getShareDraft(): ShareDraft | null {
  return draft;
}

export function setShareDraft(next: ShareDraft | null): void {
  draft = next;
  listeners.forEach((listener) => listener(draft));
}

export function subscribeShareDraft(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSharePick(): ShareDraft | null {
  const [current, setCurrent] = useState<ShareDraft | null>(getShareDraft);
  useEffect(() => subscribeShareDraft(setCurrent), []);
  return current;
}

export function __resetSharePickStoreForTests(): void {
  draft = null;
  listeners.clear();
}
