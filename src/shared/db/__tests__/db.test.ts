jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(),
}));

import { open } from '@op-engineering/op-sqlite';
import { runMigrations } from '../db';

const mockExecuteSync = jest.fn();

(open as jest.Mock).mockReturnValue({
  executeSync: mockExecuteSync,
});

describe('db migrations', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
  });

  describe('migration 6 — image type support', () => {
    it('should apply migration 6 when previous migrations (1-5) are already applied', () => {
      mockExecuteSync.mockReturnValueOnce({ rows: [] });
      mockExecuteSync.mockReturnValueOnce({
        rows: [{ version: 1 }, { version: 3 }, { version: 4 }, { version: 5 }],
      });
      mockExecuteSync.mockReturnValue({ rows: [] });

      runMigrations();

      const allSql = mockExecuteSync.mock.calls.map((c: unknown[]) => c[0] as string).join(' ');

      expect(allSql).toContain('CREATE TABLE messages_new');
      expect(allSql).toContain("type IN ('simple', 'reminder', 'alarm', 'periodic', 'image')");
      expect(allSql).toContain('INSERT INTO messages_new SELECT * FROM messages');
      expect(allSql).toContain('DROP TABLE messages');
      expect(allSql).toContain('ALTER TABLE messages_new RENAME TO messages');
    });

    it('should not re-apply migration 6 if already applied', () => {
      mockExecuteSync.mockReturnValueOnce({ rows: [] });
      mockExecuteSync.mockReturnValueOnce({
        rows: [{ version: 1 }, { version: 3 }, { version: 4 }, { version: 5 }, { version: 6 }],
      });
      mockExecuteSync.mockReturnValue({ rows: [] });

      runMigrations();

      const allSql = mockExecuteSync.mock.calls.map((c: unknown[]) => c[0] as string).join(' ');
      expect(allSql).not.toContain('messages_new');
    });

    it('should rollback on error during migration 6', () => {
      mockExecuteSync.mockReturnValueOnce({ rows: [] });
      mockExecuteSync.mockReturnValueOnce({
        rows: [{ version: 1 }, { version: 3 }, { version: 4 }, { version: 5 }],
      });

      mockExecuteSync.mockImplementation((sql: string) => {
        if (sql.includes('INSERT INTO messages_new')) {
          throw new Error('Simulated migration failure');
        }
        return { rows: [] };
      });

      expect(() => runMigrations()).toThrow('Simulated migration failure');

      const allSql = mockExecuteSync.mock.calls.map((c: unknown[]) => c[0] as string).join(' ');
      expect(allSql).toContain('ROLLBACK');
    });

    it('should start transaction before executing migration 6 statements', () => {
      mockExecuteSync.mockReturnValueOnce({ rows: [] });
      mockExecuteSync.mockReturnValueOnce({
        rows: [{ version: 1 }, { version: 3 }, { version: 4 }, { version: 5 }],
      });
      mockExecuteSync.mockReturnValue({ rows: [] });

      runMigrations();

      const allSql = mockExecuteSync.mock.calls.map((c: unknown[]) => c[0] as string).join(' ');
      expect(allSql).toContain('BEGIN TRANSACTION');
      expect(allSql).toContain('COMMIT');
    });
  });

  describe('migration 8 — body_lc and indexes', () => {
    it('should apply migration 8 for body_lc and indexes when 1-7 applied', () => {
      mockExecuteSync.mockReturnValueOnce({ rows: [] });
      mockExecuteSync.mockReturnValueOnce({
        rows: [
          { version: 1 },
          { version: 3 },
          { version: 4 },
          { version: 5 },
          { version: 6 },
          { version: 7 },
        ],
      });
      mockExecuteSync.mockReturnValue({ rows: [{ id: 'm1', body: 'Привет' }] });

      runMigrations();

      const allSql = mockExecuteSync.mock.calls.map((c: unknown[]) => c[0] as string).join(' ');
      expect(allSql).toContain('ALTER TABLE messages ADD COLUMN body_lc');
      expect(allSql).toContain('idx_messages_chat_id');
      expect(allSql).toContain('chat_read_markers_new');
      expect(allSql).toContain('UPDATE messages SET body_lc');
    });
  });
});
