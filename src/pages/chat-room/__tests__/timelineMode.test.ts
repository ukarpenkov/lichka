import { resolveTimelineMode } from '../timelineMode';

describe('resolveTimelineMode', () => {
  it('should return future when mode is future', () => {
    expect(resolveTimelineMode('future')).toBe('future');
  });

  it('should return history by default', () => {
    expect(resolveTimelineMode(undefined)).toBe('history');
    expect(resolveTimelineMode('history')).toBe('history');
  });
});
