import { NativeModules, Platform } from 'react-native';
import { playDeleteSound, playReminderSound, playSendSound } from '../sounds';

describe('sounds', () => {
  const play = jest.fn();
  const originalOS = Platform.OS;

  beforeEach(() => {
    play.mockReset();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.SoundFxModule = { play };
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.SoundFxModule;
  });

  it('should play send sound through SoundFxModule on Android', () => {
    playSendSound();
    expect(play).toHaveBeenCalledWith('send');
  });

  it('should play delete sound through SoundFxModule on Android', () => {
    playDeleteSound();
    expect(play).toHaveBeenCalledWith('delete');
  });

  it('should play reminder sound through SoundFxModule on Android', () => {
    playReminderSound();
    expect(play).toHaveBeenCalledWith('reminder');
  });
});
