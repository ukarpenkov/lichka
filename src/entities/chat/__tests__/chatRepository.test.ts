import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
} from '../model/chatRepository';

const mockExecuteSync = jest.fn();

jest.mock('../../../shared/db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

describe('chatRepository', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
  });

  describe('createChat', () => {
    it('should create a chat with generated UUID and timestamps', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const chat = createChat('Test Chat');

      expect(chat.id).toBeDefined();
      expect(chat.title).toBe('Test Chat');
      expect(chat.avatarPath).toBeNull();
      expect(chat.createdAt).toBeDefined();
      expect(chat.updatedAt).toBeDefined();
    });

    it('should insert into database with correct params', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const chat = createChat('My Chat', '/path/to/avatar.jpg');

      expect(mockExecuteSync).toHaveBeenCalledWith(
        'INSERT INTO chats (id, title, avatar_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [chat.id, 'My Chat', '/path/to/avatar.jpg', chat.createdAt, chat.updatedAt],
      );
    });

    it('should set avatarPath to null when not provided', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const chat = createChat('No Avatar');

      expect(chat.avatarPath).toBeNull();
    });

    it('should set avatarPath to null when explicitly null', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const chat = createChat('Null Avatar', null);

      expect(chat.avatarPath).toBeNull();
    });
  });

  describe('getChats', () => {
    it('should return mapped chats ordered by updated_at DESC', () => {
      mockExecuteSync.mockReturnValue({
        rows: [
          {
            id: '1',
            title: 'Chat 1',
            avatar_path: '/a.jpg',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-02T00:00:00.000Z',
          },
          {
            id: '2',
            title: 'Chat 2',
            avatar_path: null,
            created_at: '2026-01-03T00:00:00.000Z',
            updated_at: '2026-01-03T00:00:00.000Z',
          },
        ],
      });

      const chats = getChats();

      expect(chats).toHaveLength(2);
      expect(chats[0]).toEqual({
        id: '1',
        title: 'Chat 1',
        avatarPath: '/a.jpg',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
      expect(chats[1].avatarPath).toBeNull();
    });

    it('should return empty array when no chats', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(getChats()).toEqual([]);
    });
  });

  describe('getChatById', () => {
    it('should return chat when found', () => {
      mockExecuteSync.mockReturnValue({
        rows: [
          {
            id: 'abc',
            title: 'Found',
            avatar_path: null,
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      });

      const chat = getChatById('abc');

      expect(chat).toEqual({
        id: 'abc',
        title: 'Found',
        avatarPath: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('should return null when not found', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(getChatById('missing')).toBeNull();
    });
  });

  describe('updateChat', () => {
    it('should update title and return updated chat', () => {
      mockExecuteSync
        .mockReturnValueOnce({
          rows: [
            {
              id: '1',
              title: 'Old',
              avatar_path: null,
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        })
        .mockReturnValueOnce({ rows: [] });

      const chat = updateChat('1', { title: 'New' });

      expect(chat).not.toBeNull();
      expect(chat!.title).toBe('New');
      expect(chat!.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
    });

    it('should update avatarPath', () => {
      mockExecuteSync
        .mockReturnValueOnce({
          rows: [
            {
              id: '1',
              title: 'Chat',
              avatar_path: null,
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        })
        .mockReturnValueOnce({ rows: [] });

      const chat = updateChat('1', { avatarPath: '/new.jpg' });

      expect(chat!.avatarPath).toBe('/new.jpg');
    });

    it('should set avatarPath to null when explicitly passed', () => {
      mockExecuteSync
        .mockReturnValueOnce({
          rows: [
            {
              id: '1',
              title: 'Chat',
              avatar_path: '/old.jpg',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        })
        .mockReturnValueOnce({ rows: [] });

      const chat = updateChat('1', { avatarPath: null });

      expect(chat!.avatarPath).toBeNull();
    });

    it('should return null when chat does not exist', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(updateChat('missing', { title: 'New' })).toBeNull();
    });
  });

  describe('deleteChat', () => {
    it('should delete existing chat and return true', () => {
      mockExecuteSync
        .mockReturnValueOnce({
          rows: [
            {
              id: '1',
              title: 'To Delete',
              avatar_path: null,
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        })
        .mockReturnValueOnce({ rows: [] });

      expect(deleteChat('1')).toBe(true);
      expect(mockExecuteSync).toHaveBeenCalledWith(
        'DELETE FROM chats WHERE id = ?',
        ['1'],
      );
    });

    it('should return false when chat does not exist', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(deleteChat('missing')).toBe(false);
    });
  });
});
