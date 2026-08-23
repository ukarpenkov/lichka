import { resolveStickyDate, sameStickyDay } from '../stickyDate';
import type { StickyDateViewToken } from '../stickyDate';

const dateItem = (date: string): StickyDateViewToken['item'] => ({
  kind: 'date',
  date,
});

const messageItem = (createdAt: string): StickyDateViewToken['item'] => ({
  kind: 'message',
  message: { createdAt },
});

const token = (
  index: number,
  item: StickyDateViewToken['item'],
  isViewable = true,
): StickyDateViewToken => ({ index, item, isViewable });

describe('resolveStickyDate', () => {
  it('should hide sticky when the visual-top row is that day’s separator', () => {
    expect(
      resolveStickyDate([
        token(0, messageItem('2026-08-22T13:04:27.000Z')),
        token(1, dateItem('2026-08-22T10:00:00.000Z')),
      ]),
    ).toBeNull();
  });

  it('should hide sticky while that day’s separator is still on screen', () => {
    expect(
      resolveStickyDate([
        token(0, messageItem('2026-08-22T14:00:00.000Z')),
        token(1, messageItem('2026-08-22T13:04:27.000Z')),
        token(2, dateItem('2026-08-22T10:00:00.000Z')),
      ]),
    ).toBeNull();
  });

  it('should show sticky after that day’s separator has left the viewport', () => {
    expect(
      resolveStickyDate([
        token(0, messageItem('2026-08-22T14:00:00.000Z')),
        token(1, messageItem('2026-08-22T13:04:27.000Z')),
      ]),
    ).toBe('2026-08-22T13:04:27.000Z');
  });

  it('should show the older day when a newer day’s separator is still below', () => {
    expect(
      resolveStickyDate([
        token(0, messageItem('2026-08-23T09:00:00.000Z')),
        token(1, dateItem('2026-08-23T00:00:00.000Z')),
        token(2, messageItem('2026-08-22T22:00:00.000Z')),
      ]),
    ).toBe('2026-08-22T22:00:00.000Z');
  });

  it('should ignore rows that are not viewable', () => {
    expect(
      resolveStickyDate([
        token(0, messageItem('2026-08-22T14:00:00.000Z')),
        token(1, dateItem('2026-08-22T10:00:00.000Z'), false),
      ]),
    ).toBe('2026-08-22T14:00:00.000Z');
  });

  it('should return null when nothing is viewable', () => {
    expect(resolveStickyDate([])).toBeNull();
    expect(
      resolveStickyDate([token(0, messageItem('2026-08-22T14:00:00.000Z'), false)]),
    ).toBeNull();
  });
});

describe('sameStickyDay', () => {
  it('should treat timestamps from the same calendar day as equal', () => {
    expect(
      sameStickyDay('2026-08-22T10:00:00.000Z', '2026-08-22T13:04:27.000Z'),
    ).toBe(true);
    expect(
      sameStickyDay('2026-08-22T10:00:00.000Z', '2026-08-23T10:00:00.000Z'),
    ).toBe(false);
    expect(sameStickyDay(null, null)).toBe(true);
    expect(sameStickyDay('2026-08-22T10:00:00.000Z', null)).toBe(false);
  });
});
