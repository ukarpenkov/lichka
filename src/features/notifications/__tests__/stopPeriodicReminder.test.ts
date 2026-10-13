import { Platform } from 'react-native';
import { finishPeriodicMessage, type Message } from '../../../entities/message';
import { cancelAlarm } from '../../../shared/lib/notificationChannels';
import { syncScheduledWidgetSnapshot } from '../../scheduled-widget';
import { canStopPeriodicReminder, stopPeriodicReminder } from '../stopPeriodicReminder';

jest.mock('../../../entities/message', () => ({
  ...jest.requireActual('../../../entities/message'),
  finishPeriodicMessage: jest.fn(),
}));
jest.mock('../../../entities/chat', () => ({ getChatById: jest.fn() }));
jest.mock('../../../shared/lib/notificationChannels', () => ({ cancelAlarm: jest.fn() }));
jest.mock('../../scheduled-widget', () => ({ syncScheduledWidgetSnapshot: jest.fn() }));

const display: Message = {
  id: 'periodic:template-1', chatId: 'chat-1', type: 'periodic', body: 'Check in',
  scheduledAt: null, intervalMinutes: 5, enabled: true, payload: null,
  createdAt: '2026-01-01T00:15:00.000Z', updatedAt: '2026-01-01T00:15:00.000Z',
};
const stopped: Message = {
  ...display, id: 'template-1', type: 'reminder', enabled: false,
  intervalMinutes: null, scheduledAt: display.createdAt,
};

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
  jest.mocked(finishPeriodicMessage).mockReturnValue(stopped);
});

it('should offer stopping only for an active periodic occurrence in chat history', () => {
  expect(canStopPeriodicReminder(display)).toBe(true);
  expect(canStopPeriodicReminder(null)).toBe(false);
  expect(canStopPeriodicReminder({ ...display, enabled: false })).toBe(false);
  expect(canStopPeriodicReminder({ ...display, id: 'template-1' })).toBe(false);
  for (const type of ['simple', 'reminder', 'alarm', 'image'] as const) {
    expect(canStopPeriodicReminder({ ...display, type })).toBe(false);
  }
});

it('should cancel future alarms using the template ID and refresh the widget after saving', () => {
  expect(stopPeriodicReminder(display)).toEqual(stopped);
  expect(finishPeriodicMessage).toHaveBeenCalledWith('template-1');
  expect(cancelAlarm).toHaveBeenCalledWith('template-1');
  expect(syncScheduledWidgetSnapshot).toHaveBeenCalledTimes(1);
  expect(jest.mocked(finishPeriodicMessage).mock.invocationCallOrder[0])
    .toBeLessThan(jest.mocked(syncScheduledWidgetSnapshot).mock.invocationCallOrder[0]);
});

it('should not stop an ordinary reminder', () => {
  expect(stopPeriodicReminder(stopped)).toBeNull();
  expect(finishPeriodicMessage).not.toHaveBeenCalled();
  expect(cancelAlarm).not.toHaveBeenCalled();
});

it('should ignore a stale occurrence whose template no longer allows stopping', () => {
  jest.mocked(finishPeriodicMessage).mockReturnValue(null);
  expect(stopPeriodicReminder(display)).toBeNull();
  expect(cancelAlarm).not.toHaveBeenCalled();
  expect(syncScheduledWidgetSnapshot).not.toHaveBeenCalled();
});
