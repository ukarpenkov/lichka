import RNFS from 'react-native-fs';
import { createMessage, deleteMessage, type Message } from '../../../entities/message';
import { scheduleNotification } from '../schedulingService';
import { canSnoozeReminder, snoozeReminder } from '../snoozeReminder';

jest.mock('../../../entities/message', () => ({
  createMessage: jest.fn(),
  deleteMessage: jest.fn(),
}));
jest.mock('../schedulingService', () => ({ scheduleNotification: jest.fn() }));
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/docs',
  copyFile: jest.fn(),
  unlink: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../shared/lib', () => ({
  generateId: () => 'new-id',
  resolveMediaPath: (uri: string) => `/docs/${uri}`,
}));

const original: Message = {
  id: 'original', chatId: 'chat-1', type: 'reminder', body: 'Buy milk',
  scheduledAt: '2026-10-18T08:00:00.000Z', intervalMinutes: null,
  enabled: false, payload: null, checklist: null,
  createdAt: '2026-10-18T08:00:00.000Z', updatedAt: '2026-10-18T08:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-19T10:00:00.000Z'));
  jest.mocked(RNFS.copyFile).mockResolvedValue(undefined);
  jest.mocked(scheduleNotification).mockImplementation(() => {});
  jest.mocked(createMessage).mockImplementation((chatId, type, body, scheduledAt, intervalMinutes, payload, id, checklist) => ({
    ...original, chatId, type, body, scheduledAt: scheduledAt!, intervalMinutes: intervalMinutes!,
    payload: payload!, id: id!, checklist: checklist ?? null, enabled: true,
    createdAt: scheduledAt!, updatedAt: scheduledAt!,
  }));
});
afterEach(() => jest.useRealTimers());

it.each([
  ['hour', '2026-10-19T11:00:00.000Z'],
  ['day', '2026-10-20T10:00:00.000Z'],
] as const)('should create an independent reminder a %s from the tap and preserve history', async (delay, expected) => {
  const before = JSON.stringify(original);
  const copy = await snoozeReminder(original, delay);
  expect(copy).toEqual({ ...original, id: 'new-id', enabled: true,
    scheduledAt: expected, createdAt: expected, updatedAt: expected });
  expect(scheduleNotification).toHaveBeenCalledWith(copy);
  expect(JSON.stringify(original)).toBe(before);
  expect(deleteMessage).not.toHaveBeenCalled();
});

it.each(['simple', 'alarm', 'periodic', 'image'] as const)('should not snooze a %s message', async type => {
  expect(await snoozeReminder({ ...original, type }, 'hour')).toBeNull();
  expect(createMessage).not.toHaveBeenCalled();
  expect(scheduleNotification).not.toHaveBeenCalled();
});

it.each([null, 'invalid', '2026-10-19T10:00:01.000Z'])('should not snooze a reminder with unavailable or future time %s', async scheduledAt => {
  expect(await snoozeReminder({ ...original, scheduledAt }, 'hour')).toBeNull();
  expect(createMessage).not.toHaveBeenCalled();
});

it('should allow a reminder at its delivery time before its enabled flag is cleared', () => {
  expect(canSnoozeReminder({ ...original, scheduledAt: new Date().toISOString(), enabled: true })).toBe(true);
  expect(canSnoozeReminder(null)).toBe(false);
});

it('should preserve checklist contents and completion states', async () => {
  const checklist = [{ id: 'item', text: 'Buy milk', checked: true }];
  const copy = await snoozeReminder({ ...original, checklist }, 'hour');
  expect(copy?.checklist).toEqual(checklist);
});

it.each([
  ['media/images/source.jpg', '/docs/media/images/source.jpg', 'media/images/new-id.jpg', '/docs/media/images/new-id.jpg'],
  ['file:///docs/media/voice/source.m4a', '/docs/media/voice/source.m4a', '/docs/media/voice/new-id.m4a', '/docs/media/voice/new-id.m4a'],
  ['/docs/media/images/source', '/docs/media/images/source', '/docs/media/images/new-id', '/docs/media/images/new-id'],
])('should give the copy its own attachment for %s', async (uri, source, copyUri, dest) => {
  const message = { ...original, payload: JSON.stringify({ uri, width: 100, height: 200 }) };
  const copy = await snoozeReminder(message, 'day');
  expect(RNFS.copyFile).toHaveBeenCalledWith(source, dest);
  expect(JSON.parse(copy!.payload!)).toEqual({ uri: copyUri, width: 100, height: 200 });
  expect(JSON.parse(message.payload).uri).toBe(uri);
});

it('should preserve payload metadata without a file', async () => {
  const copy = await snoozeReminder({ ...original, payload: '{"note":"metadata"}' }, 'hour');
  expect(copy?.payload).toBe('{"note":"metadata"}');
  expect(RNFS.copyFile).not.toHaveBeenCalled();
});

it('should leave history untouched when copying an attachment fails', async () => {
  jest.mocked(RNFS.copyFile).mockRejectedValueOnce(new Error('Disk full'));
  await expect(snoozeReminder({ ...original, payload: '{"uri":"media/images/source.jpg"}' }, 'hour')).rejects.toThrow('Disk full');
  expect(createMessage).not.toHaveBeenCalled();
  expect(deleteMessage).not.toHaveBeenCalled();
  expect(scheduleNotification).not.toHaveBeenCalled();
  expect(RNFS.unlink).toHaveBeenCalledWith('/docs/media/images/new-id.jpg');
});

it('should remove only the new copy if scheduling fails', async () => {
  jest.mocked(scheduleNotification).mockImplementationOnce(() => { throw new Error('Unavailable'); });
  await expect(snoozeReminder(original, 'hour')).rejects.toThrow('Unavailable');
  expect(deleteMessage).toHaveBeenCalledTimes(1);
  expect(deleteMessage).toHaveBeenCalledWith('new-id');
});

it('should surface a storage error without scheduling a reminder', async () => {
  jest.mocked(createMessage).mockImplementationOnce(() => { throw new Error('Storage'); });
  await expect(snoozeReminder(original, 'day')).rejects.toThrow('Storage');
  expect(scheduleNotification).not.toHaveBeenCalled();
});

it('should preserve the original error if attachment cleanup also fails', async () => {
  jest.mocked(RNFS.copyFile).mockRejectedValueOnce(new Error('Copy failed'));
  jest.mocked(RNFS.unlink).mockRejectedValueOnce(new Error('Cleanup failed'));
  await expect(snoozeReminder({ ...original, payload: '{"uri":"media/images/source.jpg"}' }, 'hour'))
    .rejects.toThrow('Copy failed');
  expect(createMessage).not.toHaveBeenCalled();
});
