import { applyPlayStoreDemoSeed } from '../model/seedPlayStoreDemo';
import { DEMO_CHATS, PLAY_STORE_DEMO_SEED_KEY } from '../model/demoData';

const mockExecuteSync = jest.fn();

jest.mock('../../../shared/db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

type FakeState = {
  seeded: boolean;
  chatCount: number;
  chats: unknown[][];
  messages: unknown[][];
  settings: Array<[string, string]>;
};

function installFakeDb(state: FakeState): void {
  mockExecuteSync.mockImplementation((sql: string, params: unknown[] = []) => {
    if (sql.includes('FROM settings WHERE key')) {
      if (params[0] === PLAY_STORE_DEMO_SEED_KEY && state.seeded) {
        return { rows: [{ value: '1' }] };
      }
      return { rows: [] };
    }
    if (sql.startsWith('DELETE FROM')) {
      if (sql.includes('chats')) state.chatCount = 0;
      return { rows: [] };
    }
    if (sql.startsWith('INSERT INTO chats')) {
      state.chats.push(params);
      state.chatCount += 1;
      return { rows: [] };
    }
    if (sql.startsWith('INSERT INTO messages')) {
      state.messages.push(params);
      return { rows: [] };
    }
    if (sql.includes('INSERT INTO settings')) {
      state.settings.push([String(params[0]), String(params[1])]);
      if (params[0] === PLAY_STORE_DEMO_SEED_KEY) state.seeded = true;
      return { rows: [] };
    }
    return { rows: [] };
  });
}

describe('applyPlayStoreDemoSeed', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
  });

  it('should skip seeding when the demo flag is already set', () => {
    const state: FakeState = {
      seeded: true,
      chatCount: 0,
      chats: [],
      messages: [],
      settings: [],
    };
    installFakeDb(state);

    applyPlayStoreDemoSeed();

    expect(state.chats).toHaveLength(0);
    expect(state.messages).toHaveLength(0);
  });

  it('should replace existing chats when the demo flag is not set', () => {
    const state: FakeState = {
      seeded: false,
      chatCount: 2,
      chats: [],
      messages: [],
      settings: [],
    };
    installFakeDb(state);

    applyPlayStoreDemoSeed();

    expect(state.chats).toHaveLength(DEMO_CHATS.length);
    expect(mockExecuteSync).toHaveBeenCalledWith('DELETE FROM chats');
  });

  it('should insert five themed chats with past, future, and periodic messages', () => {
    const state: FakeState = {
      seeded: false,
      chatCount: 0,
      chats: [],
      messages: [],
      settings: [],
    };
    installFakeDb(state);

    applyPlayStoreDemoSeed();

    expect(state.chats).toHaveLength(DEMO_CHATS.length);
    expect(state.chats.map((row) => row[1])).toEqual(DEMO_CHATS.map((c) => c.title));

    const expectedMessages = DEMO_CHATS.reduce(
      (n, chat) => n + chat.past.length + chat.future.length + chat.periodics.length,
      0,
    );
    expect(state.messages).toHaveLength(expectedMessages);

    const types = state.messages.map((row) => row[2]);
    expect(types).toContain('simple');
    expect(types).toContain('reminder');
    expect(types).toContain('alarm');
    expect(types).toContain('periodic');

    const futureEnabled = state.messages.filter(
      (row) => row[2] !== 'periodic' && row[7] === 1,
    );
    const periodics = state.messages.filter((row) => row[2] === 'periodic');
    expect(futureEnabled.length + periodics.length).toBeGreaterThanOrEqual(10);
    expect(futureEnabled.length + periodics.length).toBeLessThanOrEqual(15);

    expect(state.settings).toEqual(
      expect.arrayContaining([
        [PLAY_STORE_DEMO_SEED_KEY, '1'],
        ['locale', 'en'],
      ]),
    );
  });
});
