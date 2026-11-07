import { deleteMessage } from '../../../entities/message';
import { getSettings } from '../../../entities/settings';
import { playDeleteSound } from '../../../shared/lib/sounds';
import { cancelNotification } from '../../notifications';
import { deleteMessageWithEffects } from '../deleteMessageWithEffects';

jest.mock('../../../entities/message', () => ({
  deleteMessage: jest.fn(),
}));
jest.mock('../../../entities/settings', () => ({
  getSettings: jest.fn(),
}));
jest.mock('../../../shared/lib/sounds', () => ({
  playDeleteSound: jest.fn(),
}));
jest.mock('../../notifications', () => ({
  cancelNotification: jest.fn(),
}));

describe('deleteMessageWithEffects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the message, cancel its notification, and play a sound when sound is enabled', () => {
    jest.mocked(getSettings).mockReturnValue({
      themePresetId: 'green-on-black',
      hapticEnabled: true,
      soundEnabled: true,
      locale: 'en',
    });

    deleteMessageWithEffects('msg-1');

    expect(deleteMessage).toHaveBeenCalledWith('msg-1');
    expect(cancelNotification).toHaveBeenCalledWith('msg-1');
    expect(playDeleteSound).toHaveBeenCalledTimes(1);
  });

  it('should stay silent when sound is disabled', () => {
    jest.mocked(getSettings).mockReturnValue({
      themePresetId: 'green-on-black',
      hapticEnabled: true,
      soundEnabled: false,
      locale: 'en',
    });

    deleteMessageWithEffects('msg-2');

    expect(deleteMessage).toHaveBeenCalledWith('msg-2');
    expect(cancelNotification).toHaveBeenCalledWith('msg-2');
    expect(playDeleteSound).not.toHaveBeenCalled();
  });
});
