import type { ChatRoomMode } from '../../app/types';

export type TimelineMode = 'history' | 'future';

export function resolveTimelineMode(mode?: ChatRoomMode): TimelineMode {
  return mode === 'future' ? 'future' : 'history';
}
