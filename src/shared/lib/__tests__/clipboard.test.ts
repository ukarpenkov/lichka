jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => ({
  __esModule: true,
  default: {
    setString: jest.fn(),
    getString: jest.fn(async () => ''),
  },
}));

import ClipboardModule from 'react-native/Libraries/Components/Clipboard/Clipboard';
import { setClipboardString } from '../clipboard';

const Clipboard = (ClipboardModule as { default?: { setString: jest.Mock } }).default
  ?? (ClipboardModule as unknown as { setString: jest.Mock });

describe('setClipboardString', () => {
  beforeEach(() => {
    Clipboard.setString.mockClear();
  });

  it('should write text to the system clipboard', () => {
    setClipboardString('hello note');
    expect(Clipboard.setString).toHaveBeenCalledWith('hello note');
  });
});
