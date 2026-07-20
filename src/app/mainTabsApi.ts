/** Императивный API главных табов.
 *
 * Нужен для навигации между корневыми табами и вложенными стеками
 * в обход стандартного bottom-tab-навигатора, который заменён на
 * кастомный SwipeablePager.
 */

export type MainTabsApi = {
  /** Переключиться на таб по индексу (0..count-1) с анимацией. */
  switchToTab: (index: number) => void;
};

let api: MainTabsApi | null = null;

let pendingChat: { chatId: string; messageId?: string } | null = null;

/** Навигация вложенного стека чатов, устанавливается из ChatListScreen. */
type ChatRoomParams = { chatId: string; messageId?: string; focusNonce?: number };

type ChatStackNav = {
  navigate: (name: 'ChatRoom', params: ChatRoomParams) => void;
  getCurrentRoute?: () => { name: string; params?: { chatId?: string; messageId?: string } } | undefined;
  setParams?: (params: ChatRoomParams) => void;
};

let chatStackNav: ChatStackNav | null = null;

function flushPending() {
  if (api && pendingChat && chatStackNav) {
    const p = pendingChat;
    pendingChat = null;
    api.switchToTab(0);
    openChatRoom(p.chatId, p.messageId);
  }
}

function openChatRoom(chatId: string, messageId?: string) {
  if (!chatStackNav) return;

  // focusNonce форсирует повторный scroll/highlight при повторном тапе
  // по уведомлению, когда ChatRoom уже открыт с тем же messageId.
  const params: ChatRoomParams = { chatId, messageId, focusNonce: Date.now() };

  const current = chatStackNav.getCurrentRoute?.();
  if (
    current?.name === 'ChatRoom' &&
    current.params?.chatId === chatId &&
    chatStackNav.setParams
  ) {
    chatStackNav.setParams(params);
    return;
  }

  chatStackNav.navigate('ChatRoom', params);
}

export function setMainTabsApi(next: MainTabsApi | null) {
  api = next;
  flushPending();
}

export function getMainTabsApi(): MainTabsApi | null {
  return api;
}

export function setChatStackNavigation(nav: ChatStackNav | null) {
  chatStackNav = nav;
  flushPending();
}

export function navigateToChat(chatId: string, messageId?: string) {
  if (api && chatStackNav) {
    api.switchToTab(0);
    openChatRoom(chatId, messageId);
  } else {
    pendingChat = { chatId, messageId };
  }
}

/** Оставлено для совместимости: вызывается из AppNavigator
 *  при готовности NavigationContainer. */
export function setNavigationReady() {
  flushPending();
}
