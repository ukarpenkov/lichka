import { navigateToChat, revealChatListForShare } from '../../app/mainTabsApi';
import type { NativeShareEvent, ShareDraft } from './shareDraft';
import { normalizeSharePayload } from './shareDraft';
import { getShareDraft, setShareDraft } from './sharePickStore';

export function beginSharePick(draft: ShareDraft): void {
  setShareDraft(draft);
  revealChatListForShare();
}

export function cancelSharePick(): void {
  setShareDraft(null);
}

export function completeSharePick(chatId: string): void {
  const draft = getShareDraft();
  setShareDraft(null);
  if (!draft) {
    navigateToChat(chatId);
    return;
  }
  navigateToChat(chatId, undefined, {
    shareText: draft.text,
    shareImageUri: draft.imageUri,
    shareImageWidth: draft.imageWidth,
    shareImageHeight: draft.imageHeight,
  });
}

export function handleShareReceived(event: NativeShareEvent): void {
  const draft = normalizeSharePayload(event);
  if (!draft) return;
  beginSharePick(draft);
}
