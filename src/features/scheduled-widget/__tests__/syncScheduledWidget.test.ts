jest.mock('../../../shared/lib/scheduledWidget', () => ({
  updateScheduledWidgetSnapshot: jest.fn(),
}));

jest.mock('../../../entities/message', () => ({
  getScheduledMessages: jest.fn(),
}));

jest.mock('../../../entities/chat', () => ({
  getChatById: jest.fn(),
}));

import { getScheduledMessages } from '../../../entities/message';
import { getChatById } from '../../../entities/chat';
import { updateScheduledWidgetSnapshot } from '../../../shared/lib/scheduledWidget';
import {
  buildScheduledWidgetSnapshot,
  syncScheduledWidgetSnapshot,
  SCHEDULED_WIDGET_SNAPSHOT_LIMIT,
} from '../syncScheduledWidget';

const mockGetScheduled = getScheduledMessages as jest.MockedFunction<typeof getScheduledMessages>;
const mockGetChat = getChatById as jest.MockedFunction<typeof getChatById>;
const mockUpdate = updateScheduledWidgetSnapshot as jest.MockedFunction<
  typeof updateScheduledWidgetSnapshot
>;

describe('buildScheduledWidgetSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty list when there are no scheduled messages', () => {
    mockGetScheduled.mockReturnValue([]);

    expect(buildScheduledWidgetSnapshot()).toEqual([]);
  });

  it('should map messages with chat titles and scheduledAt millis', () => {
    mockGetScheduled.mockReturnValue([
      {
        id: 'm1',
        chatId: 'c1',
        type: 'reminder',
        body: 'Buy milk',
        scheduledAt: '2026-08-01T10:00:00.000Z',
        intervalMinutes: null,
        enabled: true,
        payload: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    mockGetChat.mockReturnValue({
      id: 'c1',
      title: 'Personal',
      avatarPath: null,
      isSystem: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(buildScheduledWidgetSnapshot()).toEqual([
      {
        messageId: 'm1',
        chatId: 'c1',
        type: 'reminder',
        body: 'Buy milk',
        chatTitle: 'Personal',
        scheduledAt: new Date('2026-08-01T10:00:00.000Z').getTime(),
      },
    ]);
  });

  it('should use em dash when chat is missing', () => {
    mockGetScheduled.mockReturnValue([
      {
        id: 'm2',
        chatId: 'missing',
        type: 'alarm',
        body: 'Wake',
        scheduledAt: null,
        intervalMinutes: null,
        enabled: true,
        payload: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    mockGetChat.mockReturnValue(null);

    expect(buildScheduledWidgetSnapshot()[0]).toMatchObject({
      chatTitle: '—',
      scheduledAt: 0,
    });
  });

  it('should respect snapshot limit', () => {
    mockGetScheduled.mockReturnValue(
      Array.from({ length: 40 }, (_, i) => ({
        id: `m${i}`,
        chatId: 'c1',
        type: 'reminder' as const,
        body: `Item ${i}`,
        scheduledAt: '2026-08-01T10:00:00.000Z',
        intervalMinutes: null,
        enabled: true,
        payload: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })),
    );
    mockGetChat.mockReturnValue(null);

    expect(buildScheduledWidgetSnapshot().length).toBe(SCHEDULED_WIDGET_SNAPSHOT_LIMIT);
    expect(buildScheduledWidgetSnapshot(3).length).toBe(3);
  });
});

describe('syncScheduledWidgetSnapshot', () => {
  it('should push built snapshot to native bridge', () => {
    mockGetScheduled.mockReturnValue([]);
    syncScheduledWidgetSnapshot();
    expect(mockUpdate).toHaveBeenCalledWith([]);
  });
});
