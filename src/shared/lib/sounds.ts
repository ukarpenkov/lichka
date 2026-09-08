import { NativeModules, Platform } from 'react-native';
import Sound from 'react-native-sound';

type UiSound = 'send' | 'delete' | 'reminder';

const FILES: Record<UiSound, string> = {
  send: 'send_message.mp3',
  delete: 'delete_message.mp3',
  reminder: 'reminder_trigger.mp3',
};

const players: Partial<Record<UiSound, Sound>> = {};
const pending = new Set<UiSound>();

function getSoundFx(): { play?: (name: string) => void } | null {
  if (Platform.OS !== 'android') return null;
  return NativeModules.SoundFxModule ?? null;
}

function playLegacy(name: UiSound): void {
  try {
    Sound.setCategory('Playback', true);
  } catch {
    return;
  }

  let player = players[name];
  if (!player) {
    const filename = FILES[name];
    const basePath = Platform.OS === 'android' ? undefined : Sound.MAIN_BUNDLE;
    player = new Sound(filename, basePath, (error) => {
      if (error) {
        console.warn(`Failed to load sound ${filename}:`, error);
        pending.delete(name);
        return;
      }
      if (pending.delete(name)) {
        player?.setCurrentTime(0);
        player?.play();
      }
    });
    players[name] = player;
  }

  if (!player.isLoaded()) {
    pending.add(name);
    return;
  }

  if (player.isPlaying()) {
    player.stop(() => {
      player?.setCurrentTime(0);
      player?.play();
    });
    return;
  }

  player.setCurrentTime(0);
  player.play();
}

function playUiSound(name: UiSound): void {
  const fx = getSoundFx();
  if (typeof fx?.play === 'function') {
    fx.play(name);
    return;
  }
  playLegacy(name);
}

/** Звук при отправке сообщения */
export function playSendSound(): void {
  playUiSound('send');
}

/** Звук при удалении сообщения */
export function playDeleteSound(): void {
  playUiSound('delete');
}

/** Звук при срабатывании напоминания */
export function playReminderSound(): void {
  playUiSound('reminder');
}
