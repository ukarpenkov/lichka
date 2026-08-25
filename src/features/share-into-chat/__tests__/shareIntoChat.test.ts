jest.mock('../../../app/mainTabsApi', () => ({
  navigateToChat: jest.fn(),
  revealChatListForShare: jest.fn(),
}));

import { navigateToChat, revealChatListForShare } from '../../../app/mainTabsApi';
import {
  beginSharePick,
  cancelSharePick,
  completeSharePick,
  handleShareReceived,
} from '../shareIntoChat';
import { getShareDraft, __resetSharePickStoreForTests } from '../sharePickStore';

const navigate = navigateToChat as jest.MockedFunction<typeof navigateToChat>;
const reveal = revealChatListForShare as jest.MockedFunction<typeof revealChatListForShare>;

describe('shareIntoChat', () => {
  beforeEach(() => {
    __resetSharePickStoreForTests();
    jest.clearAllMocks();
  });

  it('should store the draft and open the chat list for picking', () => {
    beginSharePick({ text: 'https://lichka.app' });

    expect(getShareDraft()).toEqual({ text: 'https://lichka.app' });
    expect(reveal).toHaveBeenCalledTimes(1);
  });

  it('should clear the draft on cancel without navigating', () => {
    beginSharePick({ text: 'https://lichka.app' });
    cancelSharePick();

    expect(getShareDraft()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should open the chosen chat with text already in the composer params', () => {
    beginSharePick({ text: 'https://lichka.app' });
    completeSharePick('chat-9');

    expect(getShareDraft()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('chat-9', undefined, {
      shareText: 'https://lichka.app',
      shareImageUri: undefined,
      shareImageWidth: undefined,
      shareImageHeight: undefined,
    });
  });

  it('should attach a shared image as an unsent draft, not send it', () => {
    beginSharePick({
      imageUri: 'file:///cache/p.jpg',
      imageWidth: 640,
      imageHeight: 480,
    });
    completeSharePick('chat-2');

    expect(navigate).toHaveBeenCalledWith('chat-2', undefined, {
      shareText: undefined,
      shareImageUri: 'file:///cache/p.jpg',
      shareImageWidth: 640,
      shareImageHeight: 480,
    });
  });

  it('should ignore empty native share payloads', () => {
    handleShareReceived({ text: '  ' });

    expect(reveal).not.toHaveBeenCalled();
    expect(getShareDraft()).toBeNull();
  });

  it('should begin pick mode from a native share event', () => {
    handleShareReceived({ text: 'https://ok.test' });

    expect(getShareDraft()?.text).toBe('https://ok.test');
    expect(reveal).toHaveBeenCalledTimes(1);
  });
});
