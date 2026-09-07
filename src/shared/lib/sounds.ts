import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const SEND_SOUND_PATH = 'send_message.mp3';
const DELETE_SOUND_PATH = 'delete_message.mp3';
const REMINDER_SOUND_PATH = 'reminder_trigger.mp3';

let sendSound: Sound | null = null;
let deleteSound: Sound | null = null;
let reminderSound: Sound | null = null;

function loadSound(filename: string): Sound {
  const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.warn(`Failed to load sound ${filename}:`, error);
    }
  });
  return sound;
}

function getSendSound(): Sound {
  if (!sendSound) {
    sendSound = loadSound(SEND_SOUND_PATH);
  }
  return sendSound;
}

function getDeleteSound(): Sound {
  if (!deleteSound) {
    deleteSound = loadSound(DELETE_SOUND_PATH);
  }
  return deleteSound;
}

function getReminderSound(): Sound {
  if (!reminderSound) {
    reminderSound = loadSound(REMINDER_SOUND_PATH);
  }
  return reminderSound;
}

function play(sound: Sound): void {
  sound.stop(() => {
    sound.play();
  });
}

/** Звук при отправке сообщения / уведомления */
export function playSendSound(): void {
  play(getSendSound());
}

/** Звук при удалении сообщения */
export function playDeleteSound(): void {
  play(getDeleteSound());
}

/** Звук при срабатывании напоминания */
export function playReminderSound(): void {
  play(getReminderSound());
}
