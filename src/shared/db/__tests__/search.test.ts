import { searchMessages } from '../search';

const mockExecuteSync = jest.fn();

jest.mock('../db', () => ({
  getDatabase: () => ({
    executeSync: (...args: unknown[]) => mockExecuteSync(...args),
  }),
}));

describe('searchMessages (LIKE fallback)', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
    // FTS path throws → LIKE fallback
    mockExecuteSync.mockImplementation((sql: string) => {
      if (typeof sql === 'string' && sql.includes('messages_fts')) {
        throw new Error('no fts');
      }
      return {
        rows: [
          {
            id: 'm1',
            chat_id: 'c1',
            chat_title: 'Saved',
            type: 'simple',
            body: 'Привет мир',
            created_at: '2026-07-01T12:00:00.000Z',
            updated_at: '2026-07-01T12:00:00.000Z',
          },
        ],
      };
    });
  });

  it('searches body_lc with escaped LIKE and visibility filter', () => {
    const results = searchMessages('привет');

    expect(results).toHaveLength(1);
    expect(results[0].highlighted).toContain('<mark>');

    const likeCall = mockExecuteSync.mock.calls.find(
      (c: unknown[]) =>
        typeof c[0] === 'string' &&
        (c[0] as string).includes('body_lc') &&
        (c[0] as string).includes("type != 'periodic'"),
    );
    expect(likeCall).toBeDefined();
    expect(likeCall![1][0]).toBe('%привет%');
  });

  it('escapes % and _ in the user query', () => {
    searchMessages('100%');

    const likeCall = mockExecuteSync.mock.calls.find(
      (c: unknown[]) =>
        typeof c[0] === 'string' && (c[0] as string).includes('ESCAPE'),
    );
    expect(likeCall![1][0]).toBe('%100\\%%');
  });

  it('returns empty for blank query without hitting DB', () => {
    mockExecuteSync.mockClear();
    expect(searchMessages('   ')).toEqual([]);
  });
});
