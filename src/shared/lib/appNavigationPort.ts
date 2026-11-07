export type AppNavigationOptions = {
  mode?: 'history' | 'future';
  shareText?: string;
  shareImageUri?: string;
  shareImageWidth?: number;
  shareImageHeight?: number;
  composerFocus?: boolean;
};

export type AppNavigationPort = {
  setNavigationReady: () => void;
  navigateToChat: (
    chatId: string,
    messageId?: string,
    options?: AppNavigationOptions,
  ) => void;
  revealChatListForShare: () => void;
  openScheduledTab: (messageId?: string) => void;
};

let port: AppNavigationPort | null = null;

export function registerAppNavigation(next: AppNavigationPort | null): void {
  port = next;
}

function requirePort(): AppNavigationPort {
  if (!port) {
    throw new Error('App navigation is not registered');
  }
  return port;
}

export function setNavigationReady(): void {
  requirePort().setNavigationReady();
}

export function navigateToChat(
  chatId: string,
  messageId?: string,
  options?: AppNavigationOptions,
): void {
  requirePort().navigateToChat(chatId, messageId, options);
}

export function revealChatListForShare(): void {
  requirePort().revealChatListForShare();
}

export function openScheduledTab(messageId?: string): void {
  requirePort().openScheduledTab(messageId);
}
