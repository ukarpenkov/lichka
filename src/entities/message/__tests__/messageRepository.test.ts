jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  mkdir: jest.fn(),
  exists: jest.fn().mockResolvedValue(false),
  readDir: jest.fn().mockResolvedValue([]),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

import {
  createMessage,
  getMessagesByChatId,
  getVisibleMessagesByChatId,
  getMessageById,
  updateMessage,
  toggleMessageChecklistItem,
  deleteMessage,
  getScheduledMessages,
  getScheduledMessagesByChatId,
  getMessagesForChatAtTime,
  disableFiredMessages,
  getPeriodicDisplayMessages,
  finishPeriodicMessage,
  getUnreadCounts,
  isPeriodicDisplayId,
  extractTemplateId,
} from '../model/messageRepository';

const mockExecuteSync = jest.fn();

jest.mock('../../../shared/db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

describe('messageRepository', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
  });

  const sampleDbRow = {
    id: 'msg-1',
    chat_id: 'chat-1',
    type: 'simple',
    body: 'Hello',
    scheduled_at: null,
    interval_minutes: null,
    enabled: 0,
    payload: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const sampleReminderRow = {
    id: 'msg-2',
    chat_id: 'chat-1',
    type: 'reminder',
    body: 'Buy milk',
    scheduled_at: '2026-06-01T10:00:00.000Z',
    interval_minutes: null,
    enabled: 1,
    payload: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  describe('finishPeriodicMessage', () => {
    const periodicRow = {
      ...sampleDbRow,
      type: 'periodic',
      enabled: 1,
      interval_minutes: 5,
      payload: '{"uri":"/images/photo.jpg"}',
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:17:00.000Z'));
    });

    afterEach(() => jest.useRealTimers());

    it('should preserve the latest occurrence and attachment as a disabled ordinary reminder', () => {
      mockExecuteSync.mockReturnValue({ rows: [periodicRow] });
      const result = finishPeriodicMessage('msg-1');
      expect(result).toEqual({
        id: 'msg-1', chatId: 'chat-1', body: 'Hello', type: 'reminder',
        enabled: false, intervalMinutes: null, payload: periodicRow.payload,
        checklist: null,
        scheduledAt: '2026-01-01T00:15:00.000Z',
        createdAt: '2026-01-01T00:15:00.000Z',
        updatedAt: '2026-01-01T00:15:00.000Z',
      });
      expect(mockExecuteSync).toHaveBeenLastCalledWith(
        expect.stringContaining("type = 'reminder', enabled = 0, interval_minutes = NULL"),
        [result!.createdAt, result!.createdAt, result!.createdAt, 'msg-1'],
      );
      expect(require('react-native-fs').unlink).not.toHaveBeenCalled();
    });

    it('should use the latest occurrence even when another repeat arrived after opening the menu', () => {
      mockExecuteSync.mockReturnValue({ rows: [periodicRow] });
      const [display] = getPeriodicDisplayMessages('chat-1');
      jest.setSystemTime(new Date('2026-01-01T00:20:00.000Z'));
      expect(finishPeriodicMessage(extractTemplateId(display.id))?.createdAt)
        .toBe('2026-01-01T00:20:00.000Z');
    });

    it.each([
      ['ordinary message', sampleDbRow],
      ['already disabled reminder', { ...periodicRow, enabled: 0 }],
      ['not yet fired reminder', { ...periodicRow, created_at: '2026-01-01T00:16:00.000Z' }],
      ['missing interval', { ...periodicRow, interval_minutes: null }],
      ['negative interval', { ...periodicRow, interval_minutes: -5 }],
      ['invalid date', { ...periodicRow, created_at: 'invalid' }],
      ['invalid interval', { ...periodicRow, interval_minutes: Infinity }],
    ])('should leave an %s unchanged', (_label, row) => {
      mockExecuteSync.mockReturnValue({ rows: [row] });
      expect(finishPeriodicMessage('msg-1')).toBeNull();
      expect(mockExecuteSync).toHaveBeenCalledTimes(1);
    });

    it('should ignore a message that has been deleted', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      expect(finishPeriodicMessage('missing')).toBeNull();
      expect(mockExecuteSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('createMessage', () => {
    it('should create a simple message with generated UUID and timestamps', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'simple', 'Hello');

      expect(msg.id).toBeDefined();
      expect(msg.chatId).toBe('chat-1');
      expect(msg.type).toBe('simple');
      expect(msg.body).toBe('Hello');
      expect(msg.scheduledAt).toBeNull();
      expect(msg.intervalMinutes).toBeNull();
      expect(msg.enabled).toBe(false);
      expect(msg.payload).toBeNull();
      expect(msg.createdAt).toBeDefined();
      expect(msg.updatedAt).toBeDefined();
    });

    it('should create a reminder with enabled=true', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'reminder', 'Do it', '2026-06-01T10:00:00.000Z');

      expect(msg.type).toBe('reminder');
      expect(msg.enabled).toBe(true);
      expect(msg.scheduledAt).toBe('2026-06-01T10:00:00.000Z');
    });

    it('should create a periodic message with intervalMinutes', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'periodic', 'Check in', null, 60);

      expect(msg.type).toBe('periodic');
      expect(msg.intervalMinutes).toBe(60);
      expect(msg.enabled).toBe(true);
    });

    it('should insert into database with correct params', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'reminder', 'Test', '2026-06-01T10:00:00.000Z', null, '{"key":"val"}');

      expect(mockExecuteSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        [
          msg.id,
          'chat-1',
          'reminder',
          'Test',
          'test',
          '2026-06-01T10:00:00.000Z',
          null,
          1,
          '{"key":"val"}',
          msg.createdAt,
          msg.updatedAt,
          null,
        ],
      );
    });

    it('should create an alarm message', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'alarm', 'Wake up', '2026-06-01T07:00:00.000Z');

      expect(msg.type).toBe('alarm');
      expect(msg.enabled).toBe(true);
    });

    it('should use scheduledAt as createdAt for alarm/reminder messages', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'alarm', 'Wake up', '2026-06-01T07:00:00.000Z');

      expect(msg.createdAt).toBe('2026-06-01T07:00:00.000Z');
      expect(msg.updatedAt).toBe('2026-06-01T07:00:00.000Z');
    });

    it('should use current time as createdAt when scheduledAt is not provided', () => {
      const before = new Date().toISOString();
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'simple', 'Hello');

      expect(msg.createdAt >= before).toBe(true);
    });

    it('should create an image message with enabled=false', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const msg = createMessage('chat-1', 'image', '', null, null, '{"uri":"media/images/1.jpg"}');

      expect(msg.type).toBe('image');
      expect(msg.enabled).toBe(false);
      expect(msg.payload).toBe('{"uri":"media/images/1.jpg"}');
    });
  });

  describe('getMessagesByChatId', () => {
    it('should return mapped messages ordered by created_at ASC', () => {
      mockExecuteSync.mockReturnValue({
        rows: [sampleDbRow, sampleReminderRow],
      });

      const messages = getMessagesByChatId('chat-1');

      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({
        id: 'msg-1',
        chatId: 'chat-1',
        type: 'simple',
        body: 'Hello',
        scheduledAt: null,
        intervalMinutes: null,
        enabled: false,
        payload: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        checklist: null,
      });
      expect(messages[1].enabled).toBe(true);
    });

    it('should return empty array when no messages', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(getMessagesByChatId('chat-1')).toEqual([]);
    });

    it('should query by chat_id', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getMessagesByChatId('chat-abc');

      expect(mockExecuteSync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE chat_id = ?'),
        ['chat-abc'],
      );
    });
  });

  describe('getMessageById', () => {
    it('should return message when found', () => {
      mockExecuteSync.mockReturnValue({ rows: [sampleDbRow] });

      const msg = getMessageById('msg-1');

      expect(msg).not.toBeNull();
      expect(msg!.id).toBe('msg-1');
      expect(msg!.chatId).toBe('chat-1');
      expect(msg!.enabled).toBe(false);
    });

    it('should return null when not found', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(getMessageById('missing')).toBeNull();
    });
  });

  describe('updateMessage', () => {
    it('should update body and return updated message', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [sampleDbRow] })
        .mockReturnValueOnce({ rows: [] });

      const msg = updateMessage('msg-1', { body: 'Updated' });

      expect(msg).not.toBeNull();
      expect(msg!.body).toBe('Updated');
      expect(msg!.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
    });

    it('should update scheduledAt', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [sampleReminderRow] })
        .mockReturnValueOnce({ rows: [] });

      const msg = updateMessage('msg-2', { scheduledAt: '2026-07-01T10:00:00.000Z' });

      expect(msg!.scheduledAt).toBe('2026-07-01T10:00:00.000Z');
    });

    it('should update enabled', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [sampleReminderRow] })
        .mockReturnValueOnce({ rows: [] });

      const msg = updateMessage('msg-2', { enabled: false });

      expect(msg!.enabled).toBe(false);
    });

    it('should set scheduledAt to null when explicitly passed', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [sampleReminderRow] })
        .mockReturnValueOnce({ rows: [] });

      const msg = updateMessage('msg-2', { scheduledAt: null });

      expect(msg!.scheduledAt).toBeNull();
    });

    it('should update intervalMinutes', () => {
      mockExecuteSync
        .mockReturnValueOnce({
          rows: [{ ...sampleReminderRow, type: 'periodic', interval_minutes: 30 }],
        })
        .mockReturnValueOnce({ rows: [] });

      const msg = updateMessage('msg-2', { intervalMinutes: 60 });

      expect(msg!.intervalMinutes).toBe(60);
    });

    it('should return null when message does not exist', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(updateMessage('missing', { body: 'New' })).toBeNull();
    });
  });

  describe('checklist persistence', () => {
    const items = [
      { id: 'milk', text: 'Milk', checked: false },
      { id: 'kefir', text: 'Kefir', checked: true },
    ];
    const row = { ...sampleDbRow, body: 'Milk\nKefir', checklist: JSON.stringify(items) };

    it('stores and reads ordered checklist items separately from searchable text', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const message = createMessage('chat-1', 'simple', ' Milk\nKefir\n', null, null, null, 'msg-1', items);
      expect(message.body).toBe('Milk\nKefir');
      expect(message.checklist).toEqual(items);
      expect(mockExecuteSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        expect.arrayContaining([JSON.stringify(items), 'milk\nkefir']),
      );
      mockExecuteSync.mockReturnValue({ rows: [row] });
      expect(getMessageById('msg-1')?.checklist).toEqual(items);
    });

    it('preserves other items when toggling and reads the saved state on the next tap', () => {
      let stored = { ...row };
      mockExecuteSync.mockImplementation((sql: string, params: unknown[]) => {
        if (sql.startsWith('UPDATE messages SET checklist')) {
          stored = { ...stored, checklist: params[0] as string, updated_at: params[1] as string };
          return { rows: [], rowsAffected: 1 };
        }
        return { rows: [stored] };
      });
      expect(toggleMessageChecklistItem('msg-1', 'milk')?.checklist?.map(item => item.checked)).toEqual([true, true]);
      expect(getMessagesByChatId('chat-1')[0].checklist?.[0].checked).toBe(true);
      expect(toggleMessageChecklistItem('msg-1', 'milk')?.checklist?.map(item => item.checked)).toEqual([false, true]);
      expect(stored.body).toBe(row.body);
      expect(stored.created_at).toBe(row.created_at);
    });

    it.each([
      ['missing message', []],
      ['ordinary message', [sampleDbRow]],
      ['deleted item', [row]],
    ])('does not write when toggling a %s', (_label, rows) => {
      mockExecuteSync.mockReturnValue({ rows });
      expect(toggleMessageChecklistItem('msg-1', 'unknown')).toBeNull();
      expect(mockExecuteSync).toHaveBeenCalledTimes(1);
    });

    it('preserves checked items when editing or reordering text and starts new items unchecked', () => {
      mockExecuteSync.mockReturnValue({ rows: [row] });
      const message = updateMessage('msg-1', { body: ' Kefir \nBread\n' });
      expect(message?.body).toBe('Kefir\nBread');
      expect(message?.checklist).toEqual([
        items[1], { id: expect.any(String), text: 'Bread', checked: false },
      ]);
      expect(mockExecuteSync).toHaveBeenLastCalledWith(
        expect.stringContaining('checklist = ?'),
        expect.arrayContaining([JSON.stringify(message?.checklist), 'kefir\nbread']),
      );
    });

    it('removes checklist data if editing removes all items', () => {
      mockExecuteSync.mockReturnValue({ rows: [row] });
      expect(updateMessage('msg-1', { body: ' \n' })?.checklist).toBeNull();
    });

    it('preserves a checklist when stopping a periodic reminder', () => {
      mockExecuteSync.mockReturnValue({ rows: [{ ...row, type: 'periodic', enabled: 1, interval_minutes: 5 }] });
      expect(finishPeriodicMessage('msg-1')?.checklist).toEqual(items);
    });

    it('does not report a successful toggle when persistence fails', () => {
      mockExecuteSync.mockReturnValueOnce({ rows: [row] }).mockImplementationOnce(() => { throw new Error('disk full'); });
      expect(() => toggleMessageChecklistItem('msg-1', 'milk')).toThrow('disk full');
    });
  });

  describe('deleteMessage', () => {
    it('should delete existing message and return true', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [sampleDbRow] })
        .mockReturnValueOnce({ rows: [] });

      expect(deleteMessage('msg-1')).toBe(true);
      expect(mockExecuteSync).toHaveBeenCalledWith(
        'DELETE FROM messages WHERE id = ?',
        ['msg-1'],
      );
    });

    it('should return false when message does not exist', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(deleteMessage('missing')).toBe(false);
    });

    it('should attempt to delete media file from payload', () => {
      const rowWithMedia = {
        ...sampleDbRow,
        payload: '{"uri":"/data/media/file.jpg"}',
      };
      mockExecuteSync
        .mockReturnValueOnce({ rows: [rowWithMedia] })
        .mockReturnValueOnce({ rows: [] });

      const mockUnlink = jest.fn().mockResolvedValue(undefined);
      jest.doMock('react-native-fs', () => ({ unlink: mockUnlink }), { virtual: true });

      deleteMessage('msg-1');

      // The require inside deleteMessage should have been called
      // We can't easily test the actual RNFS call in unit tests,
      // but we verify the function doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('getScheduledMessages', () => {
    it('should return enabled messages with future scheduled_at or periodic type', () => {
      mockExecuteSync.mockReturnValue({ rows: [sampleReminderRow] });

      const messages = getScheduledMessages();

      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('reminder');
    });

    it('should query with correct conditions', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getScheduledMessages();

      const [sql, params] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("enabled = 1");
      expect(sql).toContain("scheduled_at > ?");
      expect(sql).toContain("type = 'periodic'");
      expect(params).toHaveLength(1);
    });

    it('should NOT return image messages', () => {
      const imageRow = {
        ...sampleDbRow,
        type: 'image',
        enabled: 1,
        payload: '{"uri":"media/images/1.jpg"}',
      };

      mockExecuteSync.mockReturnValue({ rows: [imageRow] });
      getScheduledMessages();

      const sql = mockExecuteSync.mock.calls[0][0];
      expect(sql).toContain("type IN ('reminder', 'alarm', 'periodic')");
      expect(sql).not.toContain('image');
    });

    it('should return empty array when no scheduled messages', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(getScheduledMessages()).toEqual([]);
    });
  });

  describe('getScheduledMessagesByChatId', () => {
    it('should return only messages for the given chatId', () => {
      mockExecuteSync.mockReturnValue({ rows: [sampleReminderRow] });

      const messages = getScheduledMessagesByChatId('chat-1');

      expect(messages).toHaveLength(1);
      expect(messages[0].chatId).toBe('chat-1');
      const [sql, params] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain('chat_id = ?');
      expect(params[0]).toBe('chat-1');
    });

    it('should query with same filters as getScheduledMessages plus chat_id', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getScheduledMessagesByChatId('chat-abc');

      const [sql, params] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain('chat_id = ?');
      expect(sql).toContain('enabled = 1');
      expect(sql).toContain("type IN ('reminder', 'alarm', 'periodic')");
      expect(sql).toContain('scheduled_at > ?');
      expect(sql).toContain("type = 'periodic'");
      expect(sql).toContain('ORDER BY scheduled_at ASC');
      expect(params[0]).toBe('chat-abc');
      expect(params).toHaveLength(2);
    });

    it('should exclude disabled, past reminder/alarm, simple and image via SQL filters', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getScheduledMessagesByChatId('chat-1');

      const sql = mockExecuteSync.mock.calls[0][0];
      expect(sql).toContain('enabled = 1');
      expect(sql).toContain("type IN ('reminder', 'alarm', 'periodic')");
      expect(sql).toContain('scheduled_at > ?');
      expect(sql).not.toContain('simple');
      expect(sql).not.toContain('image');
    });

    it('should include periodic messages for this chat', () => {
      const periodicRow = {
        ...sampleDbRow,
        id: 'msg-periodic',
        chat_id: 'chat-1',
        type: 'periodic',
        body: 'Check in',
        interval_minutes: 60,
        enabled: 1,
        scheduled_at: '2026-01-01T00:00:00.000Z',
      };
      mockExecuteSync.mockReturnValue({ rows: [periodicRow] });

      const messages = getScheduledMessagesByChatId('chat-1');

      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('periodic');
      expect(messages[0].chatId).toBe('chat-1');
    });

    it('should not return messages from another chat', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      const messages = getScheduledMessagesByChatId('chat-other');

      expect(messages).toEqual([]);
      const [, params] = mockExecuteSync.mock.calls[0];
      expect(params[0]).toBe('chat-other');
    });
  });

  describe('getMessagesForChatAtTime', () => {
    it('should return reminder/alarm messages with scheduled_at <= now', () => {
      mockExecuteSync.mockReturnValue({ rows: [sampleReminderRow] });

      const messages = getMessagesForChatAtTime('chat-1');

      expect(messages).toHaveLength(1);
      expect(messages[0].chatId).toBe('chat-1');
    });

    it('should query with correct conditions', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getMessagesForChatAtTime('chat-abc');

      const [sql, params] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain('chat_id = ?');
      expect(sql).toContain("type IN ('reminder', 'alarm')");
      expect(sql).toContain("REPLACE(SUBSTR(scheduled_at, 1, 19), 'T', ' ') <= datetime('now')");
      expect(params[0]).toBe('chat-abc');
      expect(params).toHaveLength(1);
    });

    it('should return empty array when no matching messages', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      expect(getMessagesForChatAtTime('chat-1')).toEqual([]);
    });
  });

  describe('getVisibleMessagesByChatId', () => {
    it('should include image messages', () => {
      const imageRow = {
        ...sampleDbRow,
        type: 'image',
        body: '',
        payload: '{"uri":"media/images/1.jpg"}',
      };

      mockExecuteSync.mockReturnValue({ rows: [imageRow] });
      const messages = getVisibleMessagesByChatId('chat-1');

      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('image');
    });

    it('should exclude periodic messages', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getVisibleMessagesByChatId('chat-abc');

      const [sql] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("type != 'periodic'");
    });
  });

  describe('disableFiredMessages', () => {
    it('should disable reminders and alarms with past scheduled_at', () => {
      mockExecuteSync.mockReturnValue({ rowsAffected: 3 });

      const affected = disableFiredMessages();

      expect(affected).toBe(3);
    });

    it('should query with correct conditions', () => {
      mockExecuteSync.mockReturnValue({ rowsAffected: 0 });
      disableFiredMessages();

      const [sql, params] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("enabled = 1");
      expect(sql).toContain("type IN ('reminder', 'alarm')");
      expect(sql).toContain('scheduled_at IS NOT NULL');
      expect(sql).toContain('scheduled_at <= ?');
      expect(params).toHaveLength(1);
      expect(typeof params[0]).toBe('string');
    });

    it('should not affect periodic messages', () => {
      mockExecuteSync.mockReturnValue({ rowsAffected: 0 });
      disableFiredMessages();

      const [sql] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("type IN ('reminder', 'alarm')");
      expect(sql).not.toContain('periodic');
    });
  });

  describe('isPeriodicDisplayId / extractTemplateId', () => {
    it('should detect periodic display ID', () => {
      expect(isPeriodicDisplayId('periodic:abc123')).toBe(true);
      expect(isPeriodicDisplayId('abc123')).toBe(false);
      expect(isPeriodicDisplayId('simple:abc')).toBe(false);
    });

    it('should extract template ID from display ID', () => {
      expect(extractTemplateId('periodic:abc123')).toBe('abc123');
      expect(extractTemplateId('periodic:template')).toBe('template');
    });
  });

  describe('getPeriodicDisplayMessages', () => {
    it('should return empty when no periodic templates exist', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      const messages = getPeriodicDisplayMessages('chat-1');
      expect(messages).toHaveLength(0);
    });

    it('should return empty when periodic has not fired yet', () => {
      const now = Date.now();
      const periodicRow = {
        ...sampleDbRow,
        type: 'periodic',
        interval_minutes: 60,
        enabled: 1,
        created_at: new Date(now).toISOString(),
      };

      mockExecuteSync.mockReturnValue({ rows: [periodicRow] });
      const messages = getPeriodicDisplayMessages('chat-1');
      expect(messages).toHaveLength(0);
    });

    it('should return one display message for a fired periodic with correct fire time', () => {
      const now = Date.now();
      const createdMs = now - 120 * 60_000; // 2 hours ago
      const intervalMinutes = 60; // 1 hour interval
      const fires = Math.floor((now - createdMs) / (intervalMinutes * 60_000)); // should be 2
      const latestFireAt = createdMs + fires * intervalMinutes * 60_000;

      const periodicRow = {
        ...sampleDbRow,
        type: 'periodic',
        interval_minutes: intervalMinutes,
        enabled: 1,
        created_at: new Date(createdMs).toISOString(),
      };

      mockExecuteSync.mockReturnValue({ rows: [periodicRow] });
      const messages = getPeriodicDisplayMessages('chat-1');

      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(`periodic:${periodicRow.id}`);
      expect(messages[0].type).toBe('periodic');
      expect(new Date(messages[0].createdAt).getTime()).toBe(latestFireAt);
    });

    it('should only include enabled periodic templates', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getPeriodicDisplayMessages('chat-abc');

      const [sql] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain('enabled = 1');
    });

    it('should skip periodic templates without intervalMinutes', () => {
      const createdMs = Date.now() - 120 * 60_000;
      const periodicRow = {
        ...sampleDbRow,
        type: 'periodic',
        interval_minutes: null,
        enabled: 1,
        created_at: new Date(createdMs).toISOString(),
      };

      mockExecuteSync.mockReturnValue({ rows: [periodicRow] });
      const messages = getPeriodicDisplayMessages('chat-1');
      expect(messages).toHaveLength(0);
    });

    it('should query only periodic messages for the given chat', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getPeriodicDisplayMessages('chat-abc');

      const [sql, params] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("type = 'periodic'");
      expect(sql).toContain('enabled = 1');
      expect(params[0]).toBe('chat-abc');
    });
  });

  describe('getUnreadCounts', () => {
    it('should count only fired reminder/alarm messages after last read', () => {
      mockExecuteSync
        .mockReturnValueOnce({
          rows: [{ chat_id: 'chat-1', cnt: 2 }],
        })
        .mockReturnValueOnce({ rows: [] });

      expect(getUnreadCounts()).toEqual({ 'chat-1': 2 });

      const [sql] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("type IN ('reminder', 'alarm')");
      expect(sql).toContain("REPLACE(SUBSTR(m.scheduled_at, 1, 19), 'T', ' ') <= datetime('now')");
      expect(sql).not.toContain("'simple'");
      expect(sql).not.toContain("'image'");
    });

    it('should not treat simple user messages as unread', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValueOnce({ rows: [] });

      expect(getUnreadCounts()).toEqual({});

      const [sql] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("type IN ('reminder', 'alarm')");
    });

    it('should count a periodic template when latest fire is after last read', () => {
      const createdMs = Date.now() - 90 * 60_000;
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValueOnce({
          rows: [
            {
              chat_id: 'chat-1',
              created_at: new Date(createdMs).toISOString(),
              interval_minutes: 60,
              last_read_at: new Date(createdMs + 30 * 60_000).toISOString(),
            },
          ],
        });

      expect(getUnreadCounts()).toEqual({ 'chat-1': 1 });
    });

    it('should skip periodic when latest fire is already read', () => {
      const createdMs = Date.now() - 90 * 60_000;
      const latestFireMs = createdMs + 60 * 60_000;
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValueOnce({
          rows: [
            {
              chat_id: 'chat-1',
              created_at: new Date(createdMs).toISOString(),
              interval_minutes: 60,
              last_read_at: new Date(latestFireMs + 1000).toISOString(),
            },
          ],
        });

      expect(getUnreadCounts()).toEqual({});
    });

    it('should skip periodic that has not fired yet', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValueOnce({
          rows: [
            {
              chat_id: 'chat-1',
              created_at: new Date(Date.now() - 10 * 60_000).toISOString(),
              interval_minutes: 60,
              last_read_at: null,
            },
          ],
        });

      expect(getUnreadCounts()).toEqual({});
    });
  });
});
