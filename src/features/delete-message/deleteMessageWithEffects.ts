import { deleteMessage } from '../../entities/message';
import { getSettings } from '../../entities/settings';
import { playDeleteSound } from '../../shared/lib/sounds';
import { cancelNotification } from '../notifications';

/** Delete a message, cancel its notification, and play the delete sound when enabled. */
export function deleteMessageWithEffects(id: string): void {
  deleteMessage(id);
  cancelNotification(id);
  if (getSettings().soundEnabled) {
    playDeleteSound();
  }
}
