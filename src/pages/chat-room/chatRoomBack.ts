import type { TimelineMode } from './timelineMode';

export type ChatRoomBackAction = 'exit-future' | 'pop';

export function resolveChatRoomBackAction(
  timelineMode: TimelineMode,
): ChatRoomBackAction {
  return timelineMode === 'future' ? 'exit-future' : 'pop';
}
