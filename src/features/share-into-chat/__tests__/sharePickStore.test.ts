import {
  getShareDraft,
  setShareDraft,
  subscribeShareDraft,
  __resetSharePickStoreForTests,
} from '../sharePickStore';

describe('sharePickStore', () => {
  beforeEach(() => {
    __resetSharePickStoreForTests();
  });

  it('should start empty and notify subscribers on set', () => {
    const seen: unknown[] = [];
    const unsub = subscribeShareDraft((draft) => {
      seen.push(draft);
    });

    expect(getShareDraft()).toBeNull();

    setShareDraft({ text: 'https://a.test' });
    expect(getShareDraft()).toEqual({ text: 'https://a.test' });
    expect(seen).toEqual([{ text: 'https://a.test' }]);

    setShareDraft(null);
    expect(getShareDraft()).toBeNull();
    expect(seen[1]).toBeNull();

    unsub();
    setShareDraft({ text: 'ignored' });
    expect(seen).toHaveLength(2);
  });
});
